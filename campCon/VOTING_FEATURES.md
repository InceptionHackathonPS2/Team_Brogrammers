# Voting and Comment Threading Features

## ⚠️ Database Changes Warning

This update modifies the database schema by:
- Adding `parent_id` column to `project_comments` and `event_comments` tables
- Creating new `project_votes` and `event_votes` tables

## What's New

### 1. Upvote/Downvote System
- **Projects**: Users can upvote or downvote projects
- **Events**: Users can upvote or downvote events
- **Vote Display**: Shows net score (upvotes - downvotes)
- **User Vote State**: Highlights your current vote (navy blue)
- **Toggle Voting**: Click same button to remove vote, click opposite to change vote

### 2. Threaded Comments
- **Nested Replies**: Comments can have replies (threaded structure)
- **Reply to Comments**: Click "Reply" on any comment to reply
- **Visual Hierarchy**: Replies are indented and styled differently
- **Unlimited Nesting**: Can reply to replies (though UI shows 2 levels)

## Database Setup

### Option 1: Fresh Install
If you haven't run `database_schema.sql` yet, just run it - it includes everything.

### Option 2: Existing Database
If you already have tables, run `database_migration_voting.sql` to add:
- `parent_id` columns to comment tables
- New voting tables
- Required indexes

## New Tables

### `project_votes`
- Stores upvotes/downvotes for projects
- One vote per user per project
- Fields: `project_id`, `user_id`, `vote_type` ('upvote' or 'downvote')

### `event_votes`
- Stores upvotes/downvotes for events
- One vote per user per event
- Fields: `event_id`, `user_id`, `vote_type` ('upvote' or 'downvote')

## Updated Tables

### `project_comments`
- Added `parent_id` field for threading
- `parent_id` is NULL for top-level comments
- `parent_id` references another comment for replies

### `event_comments`
- Added `parent_id` field for threading
- Same structure as project comments

## UI Features

### Voting UI
- Upvote button (▲) - Navy when active
- Net score display (upvotes - downvotes)
- Downvote button (▼) - Navy when active
- Positioned on the right side of cards

### Comments UI
- "Show/Hide Comments" button with count
- Comment input textarea
- "Post Comment" button
- Threaded display with:
  - Top-level comments with user avatars
  - Reply button on each comment
  - Nested replies indented
  - User names and timestamps

## How It Works

### Voting
1. User clicks upvote/downvote
2. System checks if user already voted
3. If same vote: removes vote
4. If different vote: changes vote
5. If no vote: creates new vote
6. Updates vote counts and highlights user's vote

### Comments
1. User types comment and clicks "Post Comment"
2. Comment saved with `parent_id = null` (top-level)
3. User clicks "Reply" on a comment
4. Reply saved with `parent_id = comment.id`
5. Comments fetched with nested replies using Supabase joins
6. Displayed in threaded format

## Component Structure

- `ProjectCard.tsx` - Interactive project card with voting and comments
- `EventCard.tsx` - Interactive event card with voting and comments
- Both components are self-contained and handle their own state

## Testing

1. **Test Voting**:
   - Click upvote on a project/event
   - See score increase and button highlight
   - Click upvote again to remove vote
   - Click downvote to change vote

2. **Test Comments**:
   - Click "Show Comments" on a project/event
   - Post a comment
   - Reply to a comment
   - See nested structure

3. **Test Threading**:
   - Reply to a comment
   - Reply to a reply
   - Verify indentation and hierarchy

## Notes

- Votes are unique per user per project/event
- Comments support unlimited nesting (database level)
- UI currently shows 2 levels (top-level + replies)
- All data is stored in Supabase
- No real-time updates for votes/comments (can be added later)

