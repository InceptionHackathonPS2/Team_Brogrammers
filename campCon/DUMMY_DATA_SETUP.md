# Dummy Data Setup Guide

## Overview
This guide helps you add dummy data for users and events to test the suggestion features.

## Option 1: Create Users Through the App (Recommended)

1. **Create Multiple User Accounts**
   - Sign up with different email addresses
   - Complete profile setup for each user
   - Add skills and interests to each profile

2. **Add Skills and Interests**
   - Go to Profile page
   - Add skills like: "React", "Python", "Machine Learning", "Web Development", etc.
   - Add interests like: "AI/ML", "Web Dev", "Mobile Dev", "Data Science", etc.

3. **Create Events**
   - Go to Events page
   - Create events with different domains
   - Add domains like: "Web Dev", "AI/ML", "Mobile Dev", "Data Science", etc.

## Option 2: SQL Script (Advanced)

If you want to add data directly via SQL:

### Step 1: Create Auth Users First
You need to create users in Supabase Auth first, then update their profiles.

### Step 2: Update User Profiles
```sql
-- Get your user IDs first
SELECT id, email, name FROM users;

-- Then update profiles with skills and interests
UPDATE users 
SET 
  skills = ARRAY['React', 'Node.js', 'JavaScript', 'Web Development'],
  interests = ARRAY['Web Dev', 'Full Stack'],
  college = 'MIT',
  department = 'Computer Science',
  bio = 'Passionate web developer'
WHERE email = 'your-email@example.com';
```

### Step 3: Create Events
```sql
-- Get a user ID to use as creator
SELECT id FROM users LIMIT 1;

-- Create events (replace USER_ID with actual user ID)
INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, created_by)
VALUES
  ('HackMIT 2025', 
   'Join us for the biggest hackathon of the year!',
   'Hackathon',
   CURRENT_DATE + INTERVAL '30 days',
   'Cambridge, MA',
   'MIT Computer Science Club',
   'https://hackmit.org',
   ARRAY['Web Dev', 'AI/ML', 'Mobile Dev'],
   'USER_ID_HERE'),
  
  ('AI/ML Workshop',
   'Learn the fundamentals of deep learning',
   'Workshop',
   CURRENT_DATE + INTERVAL '15 days',
   'Online',
   'Tech Community',
   'https://workshop.example.com',
   ARRAY['AI/ML', 'Data Science'],
   'USER_ID_HERE');
```

## Matching Algorithm

### Suggested Users
- Matches users based on:
  - **Skills**: Common skills between users (weight: 2x)
  - **Interests**: Common interests between users (weight: 1x)
- Shows top 3-6 users with highest match scores

### Suggested Events
- Matches events based on:
  - **Domains**: Events with domains matching user skills/interests
- Shows top 3-6 events with highest match scores
- Prioritizes upcoming events

## Testing Suggestions

1. **Update Your Profile**
   - Add skills: "React", "Python", "Machine Learning"
   - Add interests: "Web Dev", "AI/ML"

2. **Create Other Users**
   - User with skills: "React", "JavaScript" (should match)
   - User with skills: "Python", "TensorFlow" (should match)
   - User with skills: "Java", "C++" (may not match)

3. **Create Events**
   - Event with domains: "Web Dev", "React" (should match)
   - Event with domains: "AI/ML", "Machine Learning" (should match)
   - Event with domains: "Design", "UI/UX" (may not match)

4. **Check Discover Page**
   - Go to Discover page
   - See suggested users and events
   - Verify matches make sense

## Tips

- The more skills/interests you have, the better the matches
- Events need to have domains that match your skills/interests
- Match scores are calculated dynamically
- Suggestions update when you update your profile

