-- HAMA LMS Quiz & Certificate System Migration
-- Run this in Supabase SQL Editor

-- 1. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    pass_percentage INTEGER DEFAULT 70,
    total_questions INTEGER DEFAULT 20,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('a', 'b', 'c', 'd')),
    explanation TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected')),
    generated_by_ai BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB DEFAULT '{}',
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    certificate_url TEXT,
    unique_code TEXT UNIQUE NOT NULL,
    quiz_attempt_id UUID REFERENCES quiz_attempts(id)
);

-- 5. RLS POLICIES

-- Enable RLS
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Quizzes: Read published, full access for creator/admin
CREATE POLICY "Anyone can read published quizzes" ON quizzes
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can manage all quizzes" ON quizzes
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
    );

CREATE POLICY "Teachers can manage own quizzes" ON quizzes
    FOR ALL USING (
        created_by = auth.uid()
    );

-- Questions: Read approved questions only (not answers)
CREATE POLICY "Anyone can read approved questions" ON questions
    FOR SELECT USING (
        status = 'approved' AND 
        quiz_id IN (SELECT id FROM quizzes WHERE status = 'published')
    );

CREATE POLICY "Admins can manage all questions" ON questions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
    );

CREATE POLICY "Quiz creators can manage questions" ON questions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM quizzes WHERE id = quiz_id AND created_by = auth.uid())
    );

-- Quiz Attempts: User can read own, admins can read all
CREATE POLICY "Users can read own attempts" ON quiz_attempts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can read all attempts" ON quiz_attempts
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
    );

CREATE POLICY "Users can create attempts" ON quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Certificates: User can read own, public can verify via unique_code
CREATE POLICY "Users can read own certificates" ON certificates
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can read all certificates" ON certificates
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
    );

CREATE POLICY "Anyone can verify certificates" ON certificates
    FOR SELECT USING (true);

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_certificates_unique_code ON certificates(unique_code);
CREATE INDEX idx_certificates_user_course ON certificates(user_id, course_id);

-- 7. STORAGE BUCKET FOR CERTIFICATES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_file_types)
VALUES ('certificates', 'certificates', true, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for certificates
CREATE POLICY "Anyone can view certificates" ON storage.objects
    FOR SELECT USING (bucket_id = 'certificates');

CREATE POLICY "Users can upload certificates" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
