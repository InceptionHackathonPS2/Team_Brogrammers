-- Dummy Data for Campus Connect
-- Run this after creating the database schema
-- This creates sample users and events for testing suggestions

-- ============================================
-- DUMMY USERS
-- ============================================

-- Note: These users need to exist in auth.users first
-- For testing, you'll need to create auth users first, then update their user records

-- Example: Create a function to insert dummy users (adjust UUIDs to match your auth.users)
-- Or manually create users through the app first, then this will add their profile data

-- Dummy user data template (replace UUIDs with actual auth user IDs):
/*
INSERT INTO users (id, email, name, college, year, department, bio, skills, interests, avatar_url)
VALUES
  -- User 1: Web Developer
  ('USER_ID_1', 'alice@university.edu', 'Alice Johnson', 'MIT', 'Junior', 'Computer Science', 
   'Passionate web developer interested in React and Node.js', 
   ARRAY['React', 'Node.js', 'JavaScript', 'TypeScript', 'Web Development'],
   ARRAY['Web Dev', 'Full Stack', 'Open Source'],
   NULL),
  
  -- User 2: AI/ML Enthusiast
  ('USER_ID_2', 'bob@university.edu', 'Bob Smith', 'Stanford', 'Senior', 'AI/ML',
   'Machine learning researcher working on NLP projects',
   ARRAY['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
   ARRAY['AI/ML', 'Data Science', 'Research'],
   NULL),
  
  -- User 3: Mobile Developer
  ('USER_ID_3', 'charlie@university.edu', 'Charlie Brown', 'Berkeley', 'Sophomore', 'Software Engineering',
   'Mobile app developer specializing in React Native and Flutter',
   ARRAY['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile Development'],
   ARRAY['Mobile Dev', 'iOS', 'Android'],
   NULL),
  
  -- User 4: DevOps Engineer
  ('USER_ID_4', 'diana@university.edu', 'Diana Prince', 'CMU', 'Graduate', 'Systems Engineering',
   'DevOps engineer with expertise in cloud infrastructure',
   ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'DevOps'],
   ARRAY['Cloud Computing', 'Infrastructure', 'Automation'],
   NULL),
  
  -- User 5: Data Scientist
  ('USER_ID_5', 'eve@university.edu', 'Eve Wilson', 'Harvard', 'Junior', 'Data Science',
   'Data scientist analyzing large datasets and building predictive models',
   ARRAY['Python', 'R', 'SQL', 'Data Analysis', 'Statistics'],
   ARRAY['Data Science', 'Analytics', 'Machine Learning'],
   NULL);

-- ============================================
-- DUMMY EVENTS
-- ============================================

-- These can be created with any user ID (replace with actual user ID)
INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, image_url, created_by)
SELECT 
  'HackMIT 2025',
  'Join us for the biggest hackathon of the year! Build innovative projects, network with peers, and win amazing prizes.',
  'Hackathon',
  CURRENT_DATE + INTERVAL '30 days',
  'Cambridge, MA',
  'MIT Computer Science Club',
  'https://hackmit.org',
  ARRAY['Web Dev', 'AI/ML', 'Mobile Dev'],
  NULL,
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'HackMIT 2025');

INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, image_url, created_by)
SELECT 
  'AI/ML Workshop: Introduction to Deep Learning',
  'Learn the fundamentals of deep learning and neural networks. Hands-on session with TensorFlow.',
  'Workshop',
  CURRENT_DATE + INTERVAL '15 days',
  'Online',
  'Tech Community',
  'https://workshop.example.com',
  ARRAY['AI/ML', 'Data Science'],
  NULL,
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'AI/ML Workshop: Introduction to Deep Learning');

INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, image_url, created_by)
SELECT 
  'Web Development Bootcamp',
  'Intensive 3-day bootcamp covering React, Node.js, and modern web development practices.',
  'Workshop',
  CURRENT_DATE + INTERVAL '45 days',
  'San Francisco, CA',
  'Code Academy',
  'https://bootcamp.example.com',
  ARRAY['Web Dev', 'Full Stack'],
  NULL,
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Web Development Bootcamp');

INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, image_url, created_by)
SELECT 
  'Mobile App Competition',
  'Build the best mobile app and compete for $10,000 in prizes. Teams welcome!',
  'Competition',
  CURRENT_DATE + INTERVAL '60 days',
  'Online',
  'Mobile Dev Society',
  'https://competition.example.com',
  ARRAY['Mobile Dev', 'iOS', 'Android'],
  NULL,
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Mobile App Competition');

INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, image_url, created_by)
SELECT 
  'Cloud Infrastructure Seminar',
  'Learn about cloud computing, containerization, and modern DevOps practices.',
  'Seminar',
  CURRENT_DATE + INTERVAL '20 days',
  'Online',
  'Cloud Tech Group',
  'https://seminar.example.com',
  ARRAY['Cloud Computing', 'DevOps'],
  NULL,
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Cloud Infrastructure Seminar');

INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, image_url, created_by)
SELECT 
  'Data Science Hackathon',
  'Solve real-world data problems using machine learning and analytics. Great for beginners!',
  'Hackathon',
  CURRENT_DATE + INTERVAL '40 days',
  'New York, NY',
  'Data Science Club',
  'https://datascience.example.com',
  ARRAY['Data Science', 'AI/ML', 'Analytics'],
  NULL,
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Data Science Hackathon');
*/

-- Alternative: Use this simplified version that works with existing users
-- This will add events that match various domains

-- Make sure to replace the created_by UUID with an actual user ID from your database
-- You can get a user ID by running: SELECT id FROM users LIMIT 1;

-- ============================================
-- HELPER: Get a user ID for event creation
-- ============================================
-- Run this first to get a user ID:
-- SELECT id, name, email FROM users LIMIT 1;

-- Then use that ID in the events INSERT statements below

