-- ============================================
-- PBI Academy — Seed Data
-- ============================================

-- Insert sample admin user (password will be hashed by application)
-- Note: In production, use bcrypt to hash 'admin123'
INSERT INTO users (id, email, password_hash, name, avatar, role, level, points, streak, loyalty_tier, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@pbiacademy.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- hashed 'admin123'
    'Admin User',
    '/admin-avatar.jpg',
    'admin',
    10,
    10000,
    30,
    'DIAMOND',
    NOW()
);

-- Create admin user record
INSERT INTO admin_users (user_id, role, permissions, is_active, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SUPER_ADMIN',
    '["dashboard", "users", "content", "analytics", "settings", "security"]',
    true,
    NOW()
);

-- Insert sample courses
INSERT INTO courses (id, title, slug, description, language, test_type, level, image, duration_hours, lessons_count, instructor_id, price, rating, is_published, category, created_at)
VALUES 
(
    '00000000-0000-0000-0000-000000000010',
    'TOEFL iBT Complete Prep',
    'toefl-ibt-complete',
    'Comprehensive preparation for the TOEFL iBT exam covering all four sections: Reading, Listening, Speaking, and Writing.',
    'english',
    'TOEFL',
    'intermediate',
    '/course-toefl.jpg',
    40,
    120,
    '00000000-0000-0000-0000-000000000001',
    45000,
    4.8,
    true,
    'Test Prep',
    NOW()
),
(
    '00000000-0000-0000-0000-000000000011',
    'IELTS Academic Masterclass',
    'ielts-academic-masterclass',
    'Master the IELTS Academic test with proven strategies and practice tests.',
    'english',
    'IELTS',
    'advanced',
    '/course-ielts.jpg',
    35,
    95,
    '00000000-0000-0000-0000-000000000001',
    50000,
    4.9,
    true,
    'Test Prep',
    NOW()
);

-- Insert sample lessons for TOEFL course
INSERT INTO lessons (id, course_id, title, content, order_num, duration_min)
VALUES 
('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000010', 'Introduction to TOEFL', 'Welcome to the TOEFL iBT course. Learn about the exam structure and scoring system.', 1, 15),
('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000010', 'Reading Section Overview', 'Understanding the TOEFL reading section format and question types.', 2, 20),
('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000010', 'Listening Strategies', 'Learn effective listening strategies for the TOEFL exam.', 3, 25);

-- Insert sample lessons for IELTS course
INSERT INTO lessons (id, course_id, title, content, order_num, duration_min)
VALUES 
('00000000-0000-0000-0000-000000000110', '00000000-0000-0000-0000-000000000011', 'IELTS Overview', 'Introduction to the IELTS Academic test format.', 1, 15),
('00000000-0000-0000-0000-000000000111', '00000000-0000-0000-0000-000000000011', 'Writing Task 1', 'Learn to describe charts, graphs, and diagrams for IELTS Writing Task 1.', 2, 30);

-- Insert sample achievements
INSERT INTO achievements (name, description, icon, points) VALUES
('First Steps', 'Complete your first lesson', '🎯', 10),
('Course Champion', 'Complete your first course', '🏆', 50),
('Streak Starter', 'Maintain a 3-day study streak', '🔥', 20),
('Streak Master', 'Maintain a 7-day study streak', '⚡', 50),
('Point Collector', 'Earn 1000 points', '💎', 100),
('Social Butterfly', 'Refer your first friend', '🦋', 25),
('Early Bird', 'Study before 8 AM', '🐦', 15);

-- Insert sample rewards
INSERT INTO rewards (name, description, points_cost, icon, is_active) VALUES
('Free Course Enrollment', 'Enroll in any course for free', 500, '🎁', true),
('Premium Study Plan', 'Get a personalized study plan', 300, '📚', true),
('1-on-1 Tutoring Session', '30-minute session with an instructor', 1000, '👨‍🏫', true),
('Certificate of Excellence', 'Digital certificate for your achievements', 200, '📜', true),
('Course Discount 20%', '20% off any course purchase', 150, '💰', true);

-- Insert site settings
INSERT INTO site_settings (key, value, type, category, description) VALUES
('site_name', 'PBI Academy', 'STRING', 'general', 'The name of the website'),
('site_description', 'Rwanda''s premier AI-powered language learning platform', 'STRING', 'general', 'Brief description of the website'),
('site_url', 'https://pbiacademy.com', 'STRING', 'general', 'Main website URL'),
('contact_email', 'contact@pbiacademy.com', 'STRING', 'contact', 'Primary contact email'),
('support_email', 'support@pbiacademy.com', 'STRING', 'contact', 'Support email address'),
('maintenance_mode', 'false', 'BOOLEAN', 'general', 'Enable maintenance mode'),
('enable_2fa', 'true', 'BOOLEAN', 'security', 'Require 2FA for admin accounts'),
('session_timeout', '30', 'NUMBER', 'security', 'Auto-logout after inactivity (minutes)'),
('max_login_attempts', '5', 'NUMBER', 'security', 'Lock account after failed attempts'),
('currency', 'RWF', 'STRING', 'payment', 'Default currency'),
('email_notifications', 'true', 'BOOLEAN', 'notifications', 'Send email notifications to users'),
('primary_color', '#6366f1', 'STRING', 'appearance', 'Primary brand color');

-- Insert sample content page
INSERT INTO content_pages (id, title, slug, content, excerpt, status, meta_title, meta_description, published_at, created_by, created_at)
VALUES (
    '00000000-0000-0000-0000-000000000200',
    'About Us',
    'about',
    '<h1>About PBI Academy</h1><p>PBI Academy is Rwanda''s premier platform for AI-powered language learning and test preparation. We help students achieve their academic and professional goals through personalized learning experiences.</p><h2>Our Mission</h2><p>To make quality education accessible to all Rwandans through technology.</p>',
    'Learn about PBI Academy''s mission and vision.',
    'PUBLISHED',
    'About PBI Academy | Rwanda''s Premier Learning Platform',
    'Learn about PBI Academy''s mission to provide AI-powered education in Rwanda.',
    NOW(),
    '00000000-0000-0000-0000-000000000001',
    NOW()
);
