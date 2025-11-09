# Database Setup Guide

## Overview
This document contains the complete database schema for the Campus Connect application. The schema is simple and straightforward without RLS (Row Level Security) or complex triggers.

## Setup Instructions

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Schema
1. Copy the entire contents of `database_schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Tables
After running the SQL, verify that all tables were created:
- Go to **Table Editor** in Supabase
- You should see the following tables:
  - `users`
  - `projects`
  - `project_members`
  - `project_private_data`
  - `project_comments`
  - `project_join_requests`
  - `events`
  - `event_attendees`
  - `event_comments`
  - `feed_items`
  - `friend_requests`
  - `friendships`
  - `messages`

## Table Descriptions

### Users
- Stores user profile information
- Linked to Supabase Auth users via `id`
- Fields: name, email, college, year, department, bio, skills, interests

### Projects
- Stores project information
- Fields: title, description, tags, required_skills, looking_for
- Linked to creator via `created_by`

### Project Members
- Many-to-many relationship between users and projects
- Fields: project_id, user_id, role

### Project Private Data
- Stores private project information (repo links, etc.)
- Only accessible to project members

### Project Comments
- Comments on projects
- Fields: project_id, user_id, content

### Project Join Requests
- Requests to join projects
- Fields: project_id, user_id, message, status

### Events
- Campus events (hackathons, workshops, etc.)
- Fields: title, description, event_type, date, location, organizer

### Event Attendees
- Many-to-many relationship between users and events
- Fields: event_id, user_id

### Event Comments
- Comments on events
- Fields: event_id, user_id, content

### Feed Items
- Activity feed for users
- Fields: user_id, type, title, content, link

### Friend Requests
- Friend request system for ProComm
- Fields: sender_id, receiver_id, status

### Friendships
- Accepted friendships for ProComm
- Fields: user1_id, user2_id, status

### Messages
- Chat messages for ProComm
- Fields: chat_id, sender_id, receiver_id, content

## Notes

- All tables use UUID primary keys
- Foreign keys reference `users(id)` which links to `auth.users(id)`
- Timestamps are automatically set with `DEFAULT NOW()`
- Arrays are used for tags, skills, interests, and domains
- Indexes are created for common query patterns
- No RLS policies are included (you can add them later if needed)

## Data Types Used

- **UUID**: For IDs (primary keys and foreign keys)
- **TEXT**: For strings (names, descriptions, etc.)
- **TEXT[]**: For arrays (tags, skills, etc.)
- **DATE**: For event dates
- **TIMESTAMP WITH TIME ZONE**: For timestamps
- **JSONB**: For flexible data storage (project_private_data)

## Next Steps

After creating the tables:
1. Test the application
2. Add sample data if needed
3. Optionally add RLS policies for security
4. Set up any additional constraints or validations as needed

