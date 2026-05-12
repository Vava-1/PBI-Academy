-- ============================================
-- PBI Academy — Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_class_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Students can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
USING (auth.uid()::text = id::text OR 
       EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);

-- Only admins can insert/delete users
CREATE POLICY "Only admins can insert users"
ON users FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

CREATE POLICY "Only admins can delete users"
ON users FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- ============================================
-- COURSES TABLE POLICIES
-- ============================================

-- Public can read published courses
CREATE POLICY "Public can read published courses"
ON courses FOR SELECT
USING (is_published = true);

-- Instructors can read their own courses (published or not)
CREATE POLICY "Instructors can read own courses"
ON courses FOR SELECT
USING (instructor_id = auth.uid()::uuid);

-- Admins can read all courses
CREATE POLICY "Admins can read all courses"
ON courses FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- Instructors can create courses
CREATE POLICY "Instructors can create courses"
ON courses FOR INSERT
WITH CHECK (instructor_id = auth.uid()::uuid OR 
            EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- Instructors can update own courses
CREATE POLICY "Instructors can update own courses"
ON courses FOR UPDATE
USING (instructor_id = auth.uid()::uuid OR 
       EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true))
WITH CHECK (instructor_id = auth.uid()::uuid OR 
            EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- Admins can delete courses
CREATE POLICY "Admins can delete courses"
ON courses FOR DELETE
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- ============================================
-- LESSONS TABLE POLICIES
-- ============================================

-- Enrolled students can read lessons of their courses
CREATE POLICY "Enrolled students can read lessons"
ON lessons FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM enrollments e 
        WHERE e.user_id = auth.uid()::uuid 
        AND e.course_id = lessons.course_id
    ) OR
    EXISTS (
        SELECT 1 FROM courses c 
        WHERE c.id = lessons.course_id 
        AND c.instructor_id = auth.uid()::uuid
    ) OR
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true)
);

-- Instructors can manage lessons for their courses
CREATE POLICY "Instructors can manage own lessons"
ON lessons FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM courses c 
        WHERE c.id = lessons.course_id 
        AND c.instructor_id = auth.uid()::uuid
    ) OR
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true)
);

-- ============================================
-- ENROLLMENTS TABLE POLICIES
-- ============================================

-- Students can read their own enrollments
CREATE POLICY "Students can read own enrollments"
ON enrollments FOR SELECT
USING (user_id = auth.uid()::uuid);

-- Students can create their own enrollments
CREATE POLICY "Students can create own enrollments"
ON enrollments FOR INSERT
WITH CHECK (user_id = auth.uid()::uuid);

-- Admins can read all enrollments
CREATE POLICY "Admins can read all enrollments"
ON enrollments FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- ============================================
-- LESSON PROGRESS TABLE POLICIES
-- ============================================

-- Students can read/update their own progress
CREATE POLICY "Students can manage own progress"
ON lesson_progress FOR ALL
USING (user_id = auth.uid()::uuid);

-- ============================================
-- PAYMENTS TABLE POLICIES
-- ============================================

-- Students can read their own payments
CREATE POLICY "Students can read own payments"
ON payments FOR SELECT
USING (user_id = auth.uid()::uuid);

-- Admins can read all payments
CREATE POLICY "Admins can read all payments"
ON payments FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- ============================================
-- CHAT SESSIONS & MESSAGES POLICIES
-- ============================================

-- Students can read their own chat sessions
CREATE POLICY "Students can read own chat sessions"
ON chat_sessions FOR SELECT
USING (user_id = auth.uid()::uuid);

-- Students can create chat sessions
CREATE POLICY "Students can create chat sessions"
ON chat_sessions FOR INSERT
WITH CHECK (user_id = auth.uid()::uuid);

-- Students can read messages from their sessions
CREATE POLICY "Students can read session messages"
ON chat_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM chat_sessions s
        WHERE s.id = chat_messages.session_id
        AND s.user_id = auth.uid()::uuid
    )
);

-- Students can send messages to their sessions
CREATE POLICY "Students can create session messages"
ON chat_messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM chat_sessions s
        WHERE s.id = chat_messages.session_id
        AND s.user_id = auth.uid()::uuid
    )
);

-- ============================================
-- LIVE CLASSES POLICIES
-- ============================================

-- Public can read scheduled/ongoing live classes
CREATE POLICY "Public can read live classes"
ON live_classes FOR SELECT
USING (status IN ('scheduled', 'live'));

-- Instructors can manage their live classes
CREATE POLICY "Instructors can manage own live classes"
ON live_classes FOR ALL
USING (instructor_id = auth.uid()::uuid OR 
       EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- Students can register for live classes
CREATE POLICY "Students can register for live classes"
ON live_class_registrations FOR INSERT
WITH CHECK (user_id = auth.uid()::uuid);

-- Students can see their registrations
CREATE POLICY "Students can read own registrations"
ON live_class_registrations FOR SELECT
USING (user_id = auth.uid()::uuid);

-- ============================================
-- CONTENT PAGES (CMS) POLICIES
-- ============================================

-- Public can read published pages
CREATE POLICY "Public can read published pages"
ON content_pages FOR SELECT
USING (status = 'PUBLISHED' AND published_at <= NOW());

-- Admins can manage all pages
CREATE POLICY "Admins can manage content pages"
ON content_pages FOR ALL
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- ============================================
-- ADMIN-ONLY TABLES POLICIES
-- ============================================

-- Admin users table - only admins can access
CREATE POLICY "Only admins can access admin_users"
ON admin_users FOR ALL
USING (EXISTS (SELECT 1 FROM admin_users au WHERE au.user_id = auth.uid()::uuid AND au.is_active = true));

-- Activity logs - only admins can read
CREATE POLICY "Only admins can read activity logs"
ON activity_logs FOR SELECT
USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()::uuid AND is_active = true));

-- Activity logs - system can insert
CREATE POLICY "System can insert activity logs"
ON activity_logs FOR INSERT
WITH CHECK (true);

-- Referrals - users can read own referrals
CREATE POLICY "Users can read own referrals"
ON referrals FOR SELECT
USING (referrer_id = auth.uid()::uuid OR referred_id = auth.uid()::uuid);

-- Subscriptions - users can read own
CREATE POLICY "Users can read own subscriptions"
ON subscriptions FOR SELECT
USING (user_id = auth.uid()::uuid);
