# How to Import Dummy Data into Supabase

## Important: Users Table Constraint

The `users` table has a foreign key constraint that references `auth.users(id)`. This means you **cannot directly insert into the `users` table** - users must first exist in Supabase Auth.

## Solution Options

### Option 1: Create Users Through the App (Recommended for Testing)

1. **Sign up users through your app**:
   - Go to your deployed app or local development
   - Sign up with the emails from `dummy_data/users.csv`
   - This creates the user in both `auth.users` and `users` tables

2. **Update user profiles**:
   - After creating users through signup, you can update their profiles using SQL:
   ```sql
   -- Example: Update a user's profile
   UPDATE users 
   SET 
     name = 'Alice Johnson',
     college = 'MIT',
     year = 'Junior',
     department = 'Computer Science',
     bio = 'Passionate web developer interested in React and Node.js.',
     skills = ARRAY['React', 'Node.js', 'JavaScript', 'TypeScript', 'Web Development', 'HTML', 'CSS'],
     interests = ARRAY['Web Dev', 'Full Stack', 'Open Source', 'Startups']
   WHERE email = 'alice.johnson@university.edu';
   ```

### Option 2: Use Supabase Admin API (For Bulk Import)

Create a script to create users via the Admin API:

1. **Get your Supabase Service Role Key**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the `service_role` key (keep this secret!)

2. **Create a Node.js script** (see `scripts/create-dummy-users.js` below)

3. **Run the script**:
   ```bash
   node scripts/create-dummy-users.js
   ```

### Option 3: Import Other Tables First

You can import all other tables (projects, events, etc.) directly via CSV, but you'll need to:

1. **Update the foreign keys** in the CSV files to match actual user IDs from your database
2. **Or** create users first, then note their IDs, then update the CSV files

## Step-by-Step: Import All Data

### Step 1: Create Users

**Method A: Through App (Easiest)**
1. Sign up with each email from `users.csv` through your app
2. Note: This is manual but ensures everything works correctly

**Method B: Using Admin API Script**
1. See `scripts/create-dummy-users.js` below
2. Run the script to create all users at once

### Step 2: Update User Profiles

After users exist in `auth.users`, you can update their profiles:

```sql
-- Run this in Supabase SQL Editor
-- Update each user's profile with data from users.csv

UPDATE users SET 
  name = 'Alice Johnson',
  college = 'MIT',
  year = 'Junior',
  department = 'Computer Science',
  bio = 'Passionate web developer interested in React and Node.js. Love building full-stack applications and contributing to open source projects.',
  skills = ARRAY['React', 'Node.js', 'JavaScript', 'TypeScript', 'Web Development', 'HTML', 'CSS'],
  interests = ARRAY['Web Dev', 'Full Stack', 'Open Source', 'Startups']
WHERE email = 'alice.johnson@university.edu';

-- Repeat for each user...
```

### Step 3: Import Other Tables

Once users exist, you can import other tables:

1. **Projects**: Import `dummy_data/projects.csv`
   - Update `created_by` to match actual user IDs
   - Or use email lookup: `(SELECT id FROM users WHERE email = 'alice.johnson@university.edu')`

2. **Events**: Import `dummy_data/events.csv`
   - Same as above for `created_by`

3. **Project Members**: Import `dummy_data/project_members.csv`
   - Update `user_id` and `project_id` to match actual IDs

4. **And so on...**

## Quick SQL Script to Update User Profiles

```sql
-- Update user profiles (run after creating users through app)
-- Replace the UUIDs with actual user IDs from your database

-- Get user IDs first
SELECT id, email FROM users;

-- Then update profiles (example)
UPDATE users SET 
  name = 'Alice Johnson',
  college = 'MIT',
  year = 'Junior',
  department = 'Computer Science',
  bio = 'Passionate web developer interested in React and Node.js.',
  skills = ARRAY['React', 'Node.js', 'JavaScript', 'TypeScript', 'Web Development', 'HTML', 'CSS'],
  interests = ARRAY['Web Dev', 'Full Stack', 'Open Source', 'Startups']
WHERE email = 'alice.johnson@university.edu';

-- Repeat for all users from users.csv
```

## Alternative: Simplified Import (Without Auth Users)

If you just want to test the app structure without real users:

1. **Temporarily disable the foreign key constraint** (NOT recommended for production):
   ```sql
   -- Remove foreign key constraint temporarily
   ALTER TABLE users DROP CONSTRAINT users_id_fkey;
   
   -- Import users.csv
   -- Then re-add constraint
   ALTER TABLE users ADD CONSTRAINT users_id_fkey 
     FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
   ```

   **Warning**: This will cause issues if you try to use these users for authentication!

## Recommended Approach

For best results:
1. Create 2-3 test users through the app
2. Use those users to create projects and events
3. Test the features with real authenticated users
4. Add more users as needed through the app

This ensures everything works correctly with authentication and relationships.

