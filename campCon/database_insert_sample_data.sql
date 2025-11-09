-- Sample Data Insertion Script
-- Run this AFTER you have at least one user in your database
-- This creates sample events that will show up in suggestions

-- ============================================
-- STEP 1: Get a user ID to use as event creator
-- ============================================
-- Run this first to get a user ID:
-- SELECT id, name, email FROM users LIMIT 1;
-- Copy the ID and use it below

-- ============================================
-- STEP 2: Insert Sample Events
-- ============================================
-- Replace 'YOUR_USER_ID_HERE' with an actual user ID from step 1

-- Web Development Events
INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, created_by)
SELECT 
  'React & Next.js Bootcamp',
  'Learn modern web development with React and Next.js. Build full-stack applications and deploy them to production.',
  'Workshop',
  CURRENT_DATE + INTERVAL '20 days',
  'Online',
  'Web Dev Academy',
  'https://webdev.example.com',
  ARRAY['Web Dev', 'React', 'Full Stack'],
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'React & Next.js Bootcamp');

INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, created_by)
SELECT 
  'Full Stack Hackathon 2025',
  '48-hour hackathon focusing on full-stack web development. Build amazing projects and win prizes!',
  'Hackathon',
  CURRENT_DATE + INTERVAL '35 days',
  'San Francisco, CA',
  'Tech Hub',
  'https://hackathon.example.com',
  ARRAY['Web Dev', 'Full Stack', 'JavaScript'],
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Full Stack Hackathon 2025');

-- AI/ML Events
INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, created_by)
SELECT 
  'Machine Learning Workshop',
  'Introduction to machine learning with Python. Hands-on session covering TensorFlow and PyTorch.',
  'Workshop',
  CURRENT_DATE + INTERVAL '25 days',
  'Online',
  'AI Institute',
  'https://mlworkshop.example.com',
  ARRAY['AI/ML', 'Data Science', 'Machine Learning'],
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Machine Learning Workshop');

INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, created_by)
SELECT 
  'AI Hackathon: Build with GPT',
  'Create innovative AI applications using GPT and other language models. Great for beginners!',
  'Hackathon',
  CURRENT_DATE + INTERVAL '50 days',
  'New York, NY',
  'AI Community',
  'https://aihack.example.com',
  ARRAY['AI/ML', 'Machine Learning', 'NLP'],
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'AI Hackathon: Build with GPT');

-- Mobile Development Events
INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, created_by)
SELECT 
  'React Native Workshop',
  'Build cross-platform mobile apps with React Native. Learn from experts and build your first app!',
  'Workshop',
  CURRENT_DATE + INTERVAL '30 days',
  'Online',
  'Mobile Dev School',
  'https://reactnative.example.com',
  ARRAY['Mobile Dev', 'React Native', 'iOS', 'Android'],
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'React Native Workshop');

INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, created_by)
SELECT 
  'Mobile App Competition',
  'Build the best mobile app and compete for $15,000 in prizes. Teams of up to 4 members welcome!',
  'Competition',
  CURRENT_DATE + INTERVAL '45 days',
  'Boston, MA',
  'Mobile Dev Society',
  'https://mobilecomp.example.com',
  ARRAY['Mobile Dev', 'iOS', 'Android', 'Flutter'],
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Mobile App Competition');

-- Data Science Events
INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, created_by)
SELECT 
  'Data Science Bootcamp',
  'Intensive 5-day bootcamp on data analysis, visualization, and machine learning with Python and R.',
  'Workshop',
  CURRENT_DATE + INTERVAL '40 days',
  'Online',
  'Data Science Academy',
  'https://databootcamp.example.com',
  ARRAY['Data Science', 'Analytics', 'Python', 'R'],
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'Data Science Bootcamp');

-- DevOps Events
INSERT INTO events (title, description, event_type, date, location, organizer, registration_link, domains, created_by)
SELECT 
  'DevOps & Cloud Infrastructure',
  'Learn about Docker, Kubernetes, AWS, and modern DevOps practices. Perfect for developers!',
  'Seminar',
  CURRENT_DATE + INTERVAL '18 days',
  'Online',
  'Cloud Tech Group',
  'https://devops.example.com',
  ARRAY['DevOps', 'Cloud Computing', 'AWS', 'Docker'],
  (SELECT id FROM users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM events WHERE title = 'DevOps & Cloud Infrastructure');

-- ============================================
-- STEP 3: Update User Profiles with Skills/Interests
-- ============================================
-- After creating users through the app, update their profiles with skills and interests
-- Example (replace email with actual user email):

/*
UPDATE users 
SET 
  skills = ARRAY['React', 'Node.js', 'JavaScript', 'TypeScript', 'Web Development'],
  interests = ARRAY['Web Dev', 'Full Stack', 'Open Source'],
  college = 'MIT',
  department = 'Computer Science',
  bio = 'Passionate web developer interested in React and Node.js'
WHERE email = 'user1@example.com';

UPDATE users 
SET 
  skills = ARRAY['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning'],
  interests = ARRAY['AI/ML', 'Data Science', 'Research'],
  college = 'Stanford',
  department = 'AI/ML',
  bio = 'Machine learning researcher working on NLP projects'
WHERE email = 'user2@example.com';

UPDATE users 
SET 
  skills = ARRAY['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile Development'],
  interests = ARRAY['Mobile Dev', 'iOS', 'Android'],
  college = 'Berkeley',
  department = 'Software Engineering',
  bio = 'Mobile app developer specializing in React Native and Flutter'
WHERE email = 'user3@example.com';
*/

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if events were created:
-- SELECT id, title, domains, date FROM events ORDER BY date;

-- Check user profiles:
-- SELECT id, name, email, skills, interests FROM users;

