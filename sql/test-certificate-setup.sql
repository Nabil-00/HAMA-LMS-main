-- Quick Test Certificate Setup
-- Run this in Supabase SQL Editor to create test data for certificate debugging

-- STEP 1: Find your test user and course IDs
-- Run these queries separately and note the IDs:
-- SELECT id, email FROM auth.users LIMIT 1;
-- SELECT id, title FROM courses LIMIT 1;

-- STEP 2: Create a quiz (replace COURSE_ID with your course ID from step 1)
-- INSERT INTO quizzes (course_id, title, status, pass_percentage)
-- VALUES ('YOUR_COURSE_ID_HERE', 'Quick Test Quiz', 'published', 70)
-- RETURNING id;

-- STEP 3: Create a passing quiz attempt (replace USER_ID and QUIZ_ID)
-- INSERT INTO quiz_attempts (user_id, quiz_id, score, passed, attempted_at)
-- VALUES ('YOUR_USER_ID_HERE', 'YOUR_QUIZ_ID_HERE', 100, true, NOW());

-- STEP 4: Mark some lessons as complete for progress (optional but recommended)
-- INSERT INTO lesson_progress (user_id, course_id, lesson_id, completed)
-- SELECT 'YOUR_USER_ID_HERE', id, lessons[1]->>'id', true
-- FROM courses WHERE id = 'YOUR_COURSE_ID_HERE';
