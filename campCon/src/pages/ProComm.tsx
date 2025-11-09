import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function ProComm() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search' | 'chat'>('friends')
  const [friends, setFriends] = useState<any[]>([])
  const [friendRequests, setFriendRequests] = useState<any[]>([])
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedFriend, setSelectedFriend] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchFriends()
      fetchFriendRequests()
      fetchSentRequests()
    }
  }, [user])

  useEffect(() => {
    if (selectedFriend && user) {
      fetchMessages(selectedFriend.id)
      
      // Set up real-time subscription for messages
      const chatId = getChatId(user.id, selectedFriend.id)
      const channel = supabase
        .channel(`chat:${chatId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`,
          },
          (payload) => {
            // Fetch sender info for new message
            supabase
              .from('users')
              .select('id, name, avatar_url')
              .eq('id', payload.new.sender_id)
              .single()
              .then(({ data: senderData }) => {
                const newMessage = {
                  ...payload.new,
                  sender: senderData || { id: payload.new.sender_id, name: 'Unknown', avatar_url: null },
                }
                setMessages((prev) => [...prev, newMessage])
                // Auto-scroll to bottom when new message arrives
                setTimeout(() => {
                  const messagesContainer = document.getElementById('messages-container')
                  if (messagesContainer) {
                    messagesContainer.scrollTop = messagesContainer.scrollHeight
                  }
                }, 100)
              })
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [selectedFriend, user])

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    const messagesContainer = document.getElementById('messages-container')
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
  }, [messages])

  const getChatId = (userId1: string, userId2: string) => {
    return [userId1, userId2].sort().join('_')
  }

  const fetchFriends = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          user1:users!friendships_user1_id_fkey(id, name, email, college, avatar_url),
          user2:users!friendships_user2_id_fkey(id, name, email, college, avatar_url)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (error) {
        console.error('Error fetching friends:', error)
        return
      }

      if (data) {
        const friendsList = data.map((friendship: any) => {
          const friend = friendship.user1_id === user.id ? friendship.user2 : friendship.user1
          return { ...friend, friendship_id: friendship.id }
        })
        setFriends(friendsList)
      }
    } catch (err) {
      console.error('Error in fetchFriends:', err)
    }
  }

  const fetchFriendRequests = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          sender:users!friend_requests_sender_id_fkey(id, name, email, college, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      if (error) {
        console.error('Error fetching friend requests:', error)
        return
      }

      if (data) {
        setFriendRequests(data)
      }
    } catch (err) {
      console.error('Error in fetchFriendRequests:', err)
    }
  }

  const fetchSentRequests = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          receiver:users!friend_requests_receiver_id_fkey(id, name, email, college, avatar_url)
        `)
        .eq('sender_id', user.id)
        .eq('status', 'pending')

      if (error) {
        console.error('Error fetching sent requests:', error)
        return
      }

      if (data) {
        setSentRequests(data)
      }
    } catch (err) {
      console.error('Error in fetchSentRequests:', err)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim() || !user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, college, avatar_url')
        .ilike('name', `%${searchQuery}%`)
        .neq('id', user.id)
        .limit(10)

      if (error) {
        console.error('Error searching users:', error)
        setSearchResults([])
      } else if (data) {
        setSearchResults(data)
      }
    } catch (err) {
      console.error('Error in searchUsers:', err)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const sendFriendRequest = async (receiverId: string) => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending',
        })
        .select(`
          *,
          receiver:users!friend_requests_receiver_id_fkey(id, name, email, college, avatar_url)
        `)
        .single()

      if (error) {
        console.error('Error sending friend request:', error)
        alert('Error sending friend request: ' + error.message)
        return
      }

      if (data) {
        setSentRequests([...sentRequests, data])
        setSearchResults((prev) => prev.filter((u) => u.id !== receiverId))
      }
    } catch (err) {
      console.error('Error in sendFriendRequest:', err)
      alert('Error sending friend request')
    }
  }

  const acceptFriendRequest = async (requestId: string, senderId: string) => {
    if (!user) return

    try {
      // Update request status to accepted
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      if (updateError) {
        console.error('Error updating friend request:', updateError)
        return
      }

      // Create friendship (ensure user1_id < user2_id for consistency)
      const user1Id = user.id < senderId ? user.id : senderId
      const user2Id = user.id < senderId ? senderId : user.id

      const { error: friendshipError } = await supabase
        .from('friendships')
        .insert({
          user1_id: user1Id,
          user2_id: user2Id,
          status: 'accepted',
        })

      if (friendshipError) {
        console.error('Error creating friendship:', friendshipError)
        return
      }

      // Refresh friends list and requests
      fetchFriends()
      fetchFriendRequests()
    } catch (err) {
      console.error('Error in acceptFriendRequest:', err)
    }
  }

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)

      if (error) {
        console.error('Error rejecting friend request:', error)
        return
      }

      fetchFriendRequests()
    } catch (err) {
      console.error('Error in rejectFriendRequest:', err)
    }
  }


  const fetchMessages = async (friendId: string) => {
    if (!user) return

    try {
      const chatId = getChatId(user.id, friendId)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, name, avatar_url)
        `)
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching messages:', error)
        return
      }

      if (data) {
        setMessages(data)
      }
    } catch (err) {
      console.error('Error in fetchMessages:', err)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend || !user) return

    try {
      const chatId = getChatId(user.id, selectedFriend.id)
      const { data, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.id,
          receiver_id: selectedFriend.id,
          content: newMessage.trim(),
        })
        .select(`
          *,
          sender:users!messages_sender_id_fkey(id, name, avatar_url)
        `)
        .single()

      if (error) {
        console.error('Error sending message:', error)
        alert('Error sending message: ' + error.message)
        return
      }

      if (data) {
        setMessages((prev) => [...prev, data])
        setNewMessage('')

        // Auto-scroll to bottom
        setTimeout(() => {
          const messagesContainer = document.getElementById('messages-container')
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight
          }
        }, 100)
      }
    } catch (err) {
      console.error('Error in sendMessage:', err)
      alert('Error sending message')
    }
  }

  return (
    <div className="flex-1 p-8 bg-silver-light min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">ProComm</h1>
          <p className="text-silver-dark">Connect and communicate with your peers</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b border-silver">
            <button
              onClick={() => setActiveTab('friends')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'friends'
                  ? 'text-navy border-b-2 border-navy'
                  : 'text-silver-dark hover:text-black'
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-6 py-4 font-medium transition-colors relative ${
                activeTab === 'requests'
                  ? 'text-navy border-b-2 border-navy'
                  : 'text-silver-dark hover:text-black'
              }`}
            >
              Requests
              {friendRequests.length > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {friendRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'search'
                  ? 'text-navy border-b-2 border-navy'
                  : 'text-silver-dark hover:text-black'
              }`}
            >
              Search Users
            </button>
            {selectedFriend && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'text-navy border-b-2 border-navy'
                    : 'text-silver-dark hover:text-black'
                }`}
              >
                Chat with {selectedFriend.name}
              </button>
            )}
          </div>
        </div>

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-black mb-4">Your Friends</h2>
            {friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="border border-silver rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      setSelectedFriend(friend)
                      setActiveTab('chat')
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {friend.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-black">{friend.name}</h3>
                        <p className="text-sm text-silver-dark">{friend.college}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">👥</span>
                <p className="text-silver-dark">No friends yet. Search for users to connect!</p>
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Received Requests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-black mb-4">Friend Requests</h2>
              {friendRequests.length > 0 ? (
                <div className="space-y-4">
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-silver rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {request.sender?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black">{request.sender?.name}</h3>
                          <p className="text-sm text-silver-dark">{request.sender?.college}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptFriendRequest(request.id, request.sender_id)}
                          className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectFriendRequest(request.id)}
                          className="px-4 py-2 border border-silver rounded-lg hover:bg-silver-light transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-silver-dark">No pending friend requests</p>
              )}
            </div>

            {/* Sent Requests */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-black mb-4">Sent Requests</h2>
              {sentRequests.length > 0 ? (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border border-silver rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {request.receiver?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black">{request.receiver?.name}</h3>
                          <p className="text-sm text-silver-dark">{request.receiver?.college}</p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-silver-light text-black rounded-lg">
                        Pending
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-silver-dark">No sent requests</p>
              )}
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-black mb-4">Search Users</h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchUsers()
                  }
                }}
                placeholder="Search by name..."
                className="flex-1 px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
              />
              <button
                onClick={searchUsers}
                disabled={loading}
                className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((user) => {
                  const isRequestSent = sentRequests.some((r) => r.receiver_id === user.id)
                  const isFriend = friends.some((f) => f.id === user.id)
                  return (
                    <div
                      key={user.id}
                      className="border border-silver rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-black">{user.name}</h3>
                          <p className="text-sm text-silver-dark">{user.college}</p>
                        </div>
                      </div>
                      {isFriend ? (
                        <span className="px-4 py-2 bg-silver-light text-black rounded-lg">
                          Friends
                        </span>
                      ) : isRequestSent ? (
                        <span className="px-4 py-2 bg-silver-light text-black rounded-lg">
                          Request Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => sendFriendRequest(user.id)}
                          className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors"
                        >
                          Send Request
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && selectedFriend && (
          <div className="bg-white rounded-lg shadow-md flex flex-col" style={{ height: '600px' }}>
            {/* Chat Header */}
            <div className="border-b border-silver p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {selectedFriend.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-black">{selectedFriend.name}</h3>
                <p className="text-xs text-silver-dark">{selectedFriend.college}</p>
              </div>
            </div>

            {/* Messages */}
            <div id="messages-container" className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-navy text-white'
                          : 'bg-silver-light text-black'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-silver-light' : 'text-silver-dark'
                        }`}
                      >
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-silver-dark">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="border-t border-silver p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      sendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-silver rounded-lg focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-2 bg-navy text-white rounded-lg hover:bg-navy-light transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && !selectedFriend && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <span className="text-6xl mb-4 block">💬</span>
            <p className="text-silver-dark">Select a friend to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}

