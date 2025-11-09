# ProComm Feature Setup Guide

## Overview
ProComm is a communication feature that allows users to:
- Send and receive friend requests
- Chat with approved friends
- Search for other users
- Manage their friend list

## Database Setup

### Step 1: Run the SQL Migration
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `database_setup.sql`
4. Click **Run** to execute the SQL

This will create:
- `friend_requests` table - Stores friend request data
- `friendships` table - Stores accepted friendships
- `messages` table - Stores chat messages
- Indexes for performance
- Row Level Security (RLS) policies for data protection

### Step 2: Verify Tables
After running the SQL, verify that the tables were created:
- Go to **Table Editor** in Supabase
- You should see `friend_requests`, `friendships`, and `messages` tables

## Features

### 1. Friends Tab
- View all your accepted friends
- Click on a friend to start chatting
- See friend count in the tab

### 2. Requests Tab
- **Received Requests**: See pending friend requests from other users
  - Accept or reject requests
  - Badge shows number of pending requests
- **Sent Requests**: View requests you've sent that are pending

### 3. Search Users Tab
- Search for users by name
- Send friend requests to users
- See status (Friends, Request Sent, or Send Request button)

### 4. Chat Tab
- Real-time messaging with friends
- Message history
- Timestamps on messages
- Auto-scroll to latest messages

## How It Works

### Friend Request Flow
1. User searches for another user
2. Clicks "Send Request"
3. Request appears in receiver's "Requests" tab
4. Receiver can Accept or Reject
5. If accepted, friendship is created and both users can chat

### Chat System
- Chat ID is generated from sorted user IDs: `user1_id_user2_id`
- Messages are stored with sender and receiver IDs
- Real-time updates using Supabase Realtime subscriptions
- Messages are ordered by creation time

## Security
- Row Level Security (RLS) is enabled on all tables
- Users can only:
  - View their own friend requests and friendships
  - Send messages to their friends
  - View messages in their chats
- All queries are protected by RLS policies

## Navigation
ProComm is accessible from the sidebar navigation with the 💬 icon.

## Troubleshooting

### Messages not appearing?
- Check that both users are friends (friendship exists)
- Verify RLS policies are enabled
- Check browser console for errors

### Friend requests not working?
- Ensure `friend_requests` table exists
- Check RLS policies are correct
- Verify user IDs are valid

### Real-time not working?
- Check Supabase Realtime is enabled
- Verify you're subscribed to the correct channel
- Check network connection

