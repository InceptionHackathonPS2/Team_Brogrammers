import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface EventCardProps {
  event: any
  onUpdate?: () => void
}

export default function EventCard({ event }: EventCardProps) {
  const { user } = useAuth()
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [upvotes, setUpvotes] = useState(0)
  const [downvotes, setDownvotes] = useState(0)
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchVotes()
    if (showComments) {
      fetchComments()
    }
  }, [event.id, showComments, user])

  const fetchVotes = async () => {
    try {
      const { data: votes, error } = await supabase
        .from('event_votes')
        .select('*')
        .eq('event_id', event.id)

      if (error) {
        console.error('Error fetching votes:', error)
        return
      }

      if (votes) {
        const upvoteCount = votes.filter((v) => v.vote_type === 'upvote').length
        const downvoteCount = votes.filter((v) => v.vote_type === 'downvote').length
        setUpvotes(upvoteCount)
        setDownvotes(downvoteCount)

        if (user) {
          const myVote = votes.find((v) => v.user_id === user.id)
          setUserVote(myVote?.vote_type || null)
        } else {
          setUserVote(null)
        }
      }
    } catch (err) {
      console.error('Error in fetchVotes:', err)
    }
  }

  const fetchComments = async () => {
    try {
      // First fetch top-level comments
      const { data: topLevelComments, error: commentsError } = await supabase
        .from('event_comments')
        .select('*')
        .eq('event_id', event.id)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (commentsError) {
        console.error('Error fetching comments:', commentsError)
        setComments([])
        return
      }

      if (!topLevelComments || topLevelComments.length === 0) {
        setComments([])
        return
      }

      // Fetch user info for each comment
      const commentsWithUsers = await Promise.all(
        topLevelComments.map(async (comment) => {
          const { data: userData } = await supabase
            .from('users')
            .select('id, name, avatar_url')
            .eq('id', comment.user_id)
            .single()

          // Fetch replies for this comment
          const { data: replies } = await supabase
            .from('event_comments')
            .select('*')
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true })

          // Fetch user info for each reply
          const repliesWithUsers = await Promise.all(
            (replies || []).map(async (reply) => {
              const { data: replyUserData } = await supabase
                .from('users')
                .select('id, name, avatar_url')
                .eq('id', reply.user_id)
                .single()

              return {
                ...reply,
                user: replyUserData || { id: reply.user_id, name: 'Unknown', avatar_url: null },
              }
            })
          )

          return {
            ...comment,
            user: userData || { id: comment.user_id, name: 'Unknown', avatar_url: null },
            replies: repliesWithUsers,
          }
        })
      )

      setComments(commentsWithUsers)
    } catch (err) {
      console.error('Error in fetchComments:', err)
      setComments([])
    }
  }

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user) {
      alert('Please sign in to vote')
      return
    }

    try {
      // Check if user already voted
      const { data: existingVotes, error: checkError } = await supabase
        .from('event_votes')
        .select('*')
        .eq('event_id', event.id)
        .eq('user_id', user.id)

      if (checkError) {
        console.error('Error checking vote:', checkError)
        alert('Error: ' + checkError.message)
        return
      }

      const existingVote = existingVotes && existingVotes.length > 0 ? existingVotes[0] : null

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking same button
          const { error: deleteError } = await supabase
            .from('event_votes')
            .delete()
            .eq('id', existingVote.id)

          if (deleteError) {
            console.error('Error removing vote:', deleteError)
            alert('Error removing vote: ' + deleteError.message)
            return
          }
          setUserVote(null)
        } else {
          // Change vote
          const { error: updateError } = await supabase
            .from('event_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)

          if (updateError) {
            console.error('Error updating vote:', updateError)
            alert('Error updating vote: ' + updateError.message)
            return
          }
          setUserVote(voteType)
        }
      } else {
        // Create new vote
        const { error: insertError } = await supabase.from('event_votes').insert({
          event_id: event.id,
          user_id: user.id,
          vote_type: voteType,
        })

        if (insertError) {
          console.error('Error creating vote:', insertError)
          alert('Error voting: ' + insertError.message)
          return
        }
        setUserVote(voteType)
      }

      // Refresh votes
      await fetchVotes()
    } catch (error: any) {
      console.error('Error voting:', error)
      alert('Error voting: ' + (error.message || 'Unknown error'))
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return

    setLoading(true)
    try {
      const { error } = await supabase.from('event_comments').insert({
        event_id: event.id,
        user_id: user.id,
        content: newComment.trim(),
        parent_id: null,
      })

      if (error) {
        console.error('Error adding comment:', error)
        alert('Error adding comment: ' + error.message)
        return
      }

      setNewComment('')
      await fetchComments()
    } catch (error: any) {
      console.error('Error adding comment:', error)
      alert('Error adding comment: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (parentId: string) => {
    if (!replyText.trim() || !user) return

    setLoading(true)
    try {
      const { error } = await supabase.from('event_comments').insert({
        event_id: event.id,
        user_id: user.id,
        content: replyText.trim(),
        parent_id: parentId,
      })

      if (error) {
        console.error('Error replying:', error)
        alert('Error replying: ' + error.message)
        return
      }

      setReplyText('')
      setReplyingTo(null)
      await fetchComments()
    } catch (error: any) {
      console.error('Error replying:', error)
      alert('Error replying: ' + (error.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const netScore = upvotes - downvotes

  return (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      {/* Event Image */}
      {event.image_url && (
        <div className="w-full h-48 bg-silver-light rounded-lg overflow-hidden mb-4">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        {/* Voting Section - Compact */}
        <div className="flex flex-col items-center pt-1">
          <button
            onClick={() => handleVote('upvote')}
            className={`p-1.5 rounded transition-colors ${
              userVote === 'upvote'
                ? 'bg-green-500 text-white'
                : 'text-silver-dark hover:bg-green-50 hover:text-green-600'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <span className={`text-sm font-bold py-1 ${netScore > 0 ? 'text-green-600' : netScore < 0 ? 'text-red-600' : 'text-silver-dark'}`}>
            {netScore}
          </span>
          <button
            onClick={() => handleVote('downvote')}
            className={`p-1.5 rounded transition-colors ${
              userVote === 'downvote'
                ? 'bg-red-500 text-white'
                : 'text-silver-dark hover:bg-red-50 hover:text-red-600'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-black">{event.title}</h3>
            <span className="px-2 py-1 bg-navy text-white text-xs rounded flex-shrink-0">
              {event.event_type}
            </span>
          </div>
          <p className="text-silver-dark text-sm mb-3 line-clamp-3">{event.description}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-silver-dark mb-4">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{new Date(event.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📍</span>
          <span>{event.location}</span>
        </div>
        {event.domains && event.domains.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {event.domains.slice(0, 3).map((domain: string, idx: number) => (
              <span
                key={idx}
                className="px-2 py-1 bg-silver-light text-black text-xs rounded"
              >
                {domain}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm border-t border-silver pt-3 mt-3">
        <div className="flex items-center gap-4 text-silver-dark">
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-silver-dark hover:text-black transition-colors"
          >
            <span>💬</span>
            <span>{comments.length}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-silver pt-4 mt-4">
          {/* Comment Input */}
          <div className="mb-4 p-3 bg-silver-light rounded-lg">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              rows={2}
              className="w-full px-3 py-2 bg-white border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-sm resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddComment}
                disabled={loading || !newComment.trim()}
                className="px-4 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-silver-light rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-navy to-navy-light rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">
                        {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-black text-sm">
                          {comment.user?.name || 'Unknown'}
                        </span>
                        <span className="text-xs text-silver-dark">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-black mb-2 whitespace-pre-wrap break-words">
                        {comment.content}
                      </p>
                      <button
                        onClick={() =>
                          setReplyingTo(replyingTo === comment.id ? null : comment.id)
                        }
                        className="text-xs text-silver-dark hover:text-black transition-colors font-medium"
                      >
                        {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                      </button>

                      {/* Reply Input */}
                      {replyingTo === comment.id && (
                        <div className="mt-3 pt-3 border-t border-silver">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            rows={2}
                            className="w-full px-3 py-2 bg-white border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-sm resize-none mb-2"
                          />
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleReply(comment.id)}
                              disabled={loading || !replyText.trim()}
                              className="px-3 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-xs font-medium"
                            >
                              {loading ? 'Posting...' : 'Reply'}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 space-y-2 pl-4 border-l-2 border-silver">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="flex items-start gap-2">
                              <div className="w-6 h-6 bg-silver rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-black text-xs font-bold">
                                  {reply.user?.name?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-black text-xs">
                                    {reply.user?.name || 'Unknown'}
                                  </span>
                                  <span className="text-xs text-silver-dark">
                                    {new Date(reply.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-black whitespace-pre-wrap break-words">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-silver-dark">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

