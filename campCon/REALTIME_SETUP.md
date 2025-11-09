# Real-time Setup Guide for ProComm

## What Changed

The ProComm feature now uses **real Supabase data** instead of dummy data. All data is fetched from and saved to your Supabase database.

## Setup Steps

### 1. Run Database Schema
Make sure you've run the `database_schema.sql` file in your Supabase SQL Editor to create all necessary tables.

### 2. Enable Realtime for Messages (Important!)

To enable real-time chat, you need to enable Realtime on the `messages` table:

1. Go to your **Supabase Dashboard**
2. Navigate to **Database** → **Replication**
3. Find the `messages` table
4. Toggle **Replication** to **ON** (or click the toggle switch)

Alternatively, run this SQL:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

### 3. Verify Tables Exist

Make sure these tables exist in your database:
- ✅ `users`
- ✅ `friendships`
- ✅ `friend_requests`
- ✅ `messages`

## How It Works Now

### Friends
- Fetches real friends from `friendships` table
- Shows only accepted friendships
- Updates when you accept friend requests

### Friend Requests
- **Received Requests**: Fetches from `friend_requests` where you are the receiver
- **Sent Requests**: Fetches from `friend_requests` where you are the sender
- Updates in real-time when requests are sent/accepted/rejected

### Search Users
- Searches real users from `users` table
- Filters by name (case-insensitive)
- Excludes yourself from results

### Chat Messages
- Fetches real messages from `messages` table
- **Real-time updates**: New messages appear automatically when sent
- Messages are stored with `chat_id` format: `user1_id_user2_id` (sorted)

## Real-time Features

### Automatic Message Updates
When someone sends you a message:
1. Supabase Realtime detects the new message
2. The message appears in your chat automatically
3. No page refresh needed!

### How Real-time Works
- Uses Supabase Realtime subscriptions
- Listens for `INSERT` events on the `messages` table
- Filters by `chat_id` to only show messages for the current chat
- Automatically fetches sender information for new messages

## Testing

1. **Create Test Users**:
   - Sign up with 2 different accounts (or use 2 browsers)
   - Make sure both users exist in the `users` table

2. **Send Friend Request**:
   - User A searches for User B
   - User A sends friend request
   - User B sees the request in "Requests" tab

3. **Accept Friend Request**:
   - User B accepts the request
   - Both users now see each other in "Friends" tab

4. **Start Chatting**:
   - User A clicks on User B in Friends list
   - User A sends a message
   - User B sees the message appear in real-time (if Realtime is enabled)

## Troubleshooting

### Messages not appearing in real-time?
- ✅ Check that Realtime is enabled for `messages` table
- ✅ Check browser console for errors
- ✅ Verify you're subscribed to the correct channel

### Friend requests not working?
- ✅ Check that `friend_requests` table exists
- ✅ Verify user IDs are correct
- ✅ Check browser console for errors

### Search not finding users?
- ✅ Make sure `users` table has data
- ✅ Check that user names match your search query
- ✅ Verify the query is case-insensitive (it should be)

### Can't send messages?
- ✅ Make sure both users are friends (friendship exists)
- ✅ Check that `messages` table exists
- ✅ Verify `chat_id` is being generated correctly

## Database Requirements

Make sure your database has:
- All tables from `database_schema.sql`
- Proper foreign key relationships
- Indexes for performance

## Next Steps

1. ✅ Run `database_schema.sql` if you haven't already
2. ✅ Enable Realtime for `messages` table
3. ✅ Test with multiple user accounts
4. ✅ Enjoy real-time chatting!

