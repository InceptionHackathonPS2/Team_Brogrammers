-- SQL Script to Update User Profiles
-- Run this AFTER creating users through the app or Admin API
-- This updates the profiles with data from users.csv

-- First, get the actual user IDs from your database
-- SELECT id, email FROM users;

-- Then update each user's profile
-- Replace the WHERE clause with actual user IDs or emails

-- Alice Johnson
UPDATE users SET 
  name = 'Alice Johnson',
  college = 'MIT',
  year = 'Junior',
  department = 'Computer Science',
  bio = 'Passionate web developer interested in React and Node.js. Love building full-stack applications and contributing to open source projects.',
  skills = ARRAY['React', 'Node.js', 'JavaScript', 'TypeScript', 'Web Development', 'HTML', 'CSS'],
  interests = ARRAY['Web Dev', 'Full Stack', 'Open Source', 'Startups']
WHERE email = 'alice.johnson@university.edu';

-- Bob Smith
UPDATE users SET 
  name = 'Bob Smith',
  college = 'Stanford',
  year = 'Senior',
  department = 'AI/ML',
  bio = 'Machine learning researcher working on NLP projects. Interested in deep learning and AI ethics.',
  skills = ARRAY['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'Data Science'],
  interests = ARRAY['AI/ML', 'Data Science', 'Research', 'Neural Networks']
WHERE email = 'bob.smith@university.edu';

-- Charlie Brown
UPDATE users SET 
  name = 'Charlie Brown',
  college = 'UC Berkeley',
  year = 'Sophomore',
  department = 'Software Engineering',
  bio = 'Mobile app developer specializing in React Native and Flutter. Building apps for iOS and Android platforms.',
  skills = ARRAY['React Native', 'Flutter', 'Swift', 'Kotlin', 'Mobile Development', 'iOS', 'Android'],
  interests = ARRAY['Mobile Dev', 'iOS', 'Android', 'App Development']
WHERE email = 'charlie.brown@university.edu';

-- Diana Prince
UPDATE users SET 
  name = 'Diana Prince',
  college = 'Carnegie Mellon',
  year = 'Graduate',
  department = 'Systems Engineering',
  bio = 'DevOps engineer with expertise in cloud infrastructure. Love automating deployments and managing scalable systems.',
  skills = ARRAY['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'DevOps', 'Linux', 'Cloud Computing'],
  interests = ARRAY['Cloud Computing', 'Infrastructure', 'Automation', 'DevOps']
WHERE email = 'diana.prince@university.edu';

-- Eve Wilson
UPDATE users SET 
  name = 'Eve Wilson',
  college = 'Harvard',
  year = 'Junior',
  department = 'Data Science',
  bio = 'Data scientist analyzing large datasets and building predictive models. Passionate about making data-driven decisions.',
  skills = ARRAY['Python', 'R', 'SQL', 'Data Analysis', 'Statistics', 'Machine Learning', 'Pandas'],
  interests = ARRAY['Data Science', 'Analytics', 'Machine Learning', 'Visualization']
WHERE email = 'eve.wilson@university.edu';

-- Continue for all other users from users.csv...
-- You can copy the pattern above and update with data from the CSV file

