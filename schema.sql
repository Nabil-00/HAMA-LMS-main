-- Supabase Schema for HAMA LMS (Sahelian Noir Edition)

-- 1. PROFILES TABLE
-- Extends the auth.users table with additional LMS metadata
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'Student' CHECK (role IN ('Admin', 'Teacher', 'Student')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Suspended')),
  avatar_url TEXT,
  department TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- --- AUTO-PROFILE TRIGGER ---
-- Automatically creates a profile entry when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, joined_at)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    'Student',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. COURSES TABLE
DROP TABLE IF EXISTS public.courses;

CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'Draft',
  current_version TEXT DEFAULT '0.0.1',
  tags JSONB DEFAULT '[]'::jsonb,
  author_id UUID REFERENCES public.profiles(id),
  default_locale TEXT DEFAULT 'en-US',
  supported_locales JSONB DEFAULT '["en-US"]'::jsonb,
  localizations JSONB DEFAULT '{}'::jsonb,
  modules JSONB DEFAULT '[]'::jsonb,
  versions JSONB DEFAULT '[]'::jsonb,
  price NUMERIC DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  last_modified TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses policies
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON public.courses;
DROP POLICY IF EXISTS "Maestros can manage courses" ON public.courses;

CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING (status = 'Published' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Teacher')));
CREATE POLICY "Maestros can manage courses" ON public.courses FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Teacher')));

-- 3. ENROLLMENTS TABLE
CREATE TABLE public.enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  enrolled_by UUID REFERENCES public.profiles(id),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Dropped')),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- --- SECURITY POLICIES ---

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses: Everyone can view published, but only Admins/Teachers can manage
CREATE POLICY "Published courses are viewable by everyone" ON public.courses FOR SELECT USING (status = 'Published' OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Teacher')));
CREATE POLICY "Maestros can manage courses" ON public.courses FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Teacher')));

-- Enrollments: Users can see their own, Admins see all
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Admins can manage enrollments" ON public.enrollments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Service role inserts enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- --- CRON JOB (pg_cron) ---
-- To enable this, go to Database -> Extensions in Supabase and enable "pg_cron".
-- Example: Daily update of last_modified for published courses to keep resonances fresh (Mock logic).

-- SELECT cron.schedule(
--   'hama-daily-resonance',
--   '0 0 * * *',
--   $$ UPDATE public.courses SET last_modified = NOW() WHERE status = 'Published' $$
-- );

-- 4. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'Info' CHECK (type IN ('Info', 'Success', 'Warning', 'Alert', 'Message')),
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- 5. PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  reference TEXT UNIQUE NOT NULL,
  gateway TEXT DEFAULT 'paystack',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments: Users can view own payments, system handles inserts
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role inserts payments" ON public.payments FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY "Service role updates payments" ON public.payments FOR UPDATE USING (auth.role() = 'service_role');

-- --- PERFORMANCE INDEXES ---
CREATE INDEX IF NOT EXISTS idx_courses_author_id ON public.courses(author_id);
CREATE INDEX IF NOT EXISTS idx_courses_status ON public.courses(status);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON public.payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);

-- 6. QUIZZES TABLE
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    pass_percentage INTEGER DEFAULT 70,
    total_questions INTEGER DEFAULT 20,
    status TEXT DEFAULT 'draft',
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone read published quizzes" ON public.quizzes FOR SELECT USING (status = 'published');
CREATE POLICY "Admins manage quizzes" ON public.quizzes FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Teachers manage own quizzes" ON public.quizzes FOR ALL USING (created_by = auth.uid());

-- 7. QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL,
    explanation TEXT,
    status TEXT DEFAULT 'draft',
    generated_by_ai BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read approved questions" ON public.questions FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins manage questions" ON public.questions FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Creators manage questions" ON public.questions FOR ALL USING (EXISTS (SELECT 1 FROM public.quizzes WHERE id = quiz_id AND created_by = auth.uid()));

-- 8. QUIZ ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    passed BOOLEAN NOT NULL,
    answers JSONB DEFAULT '{}'::jsonb,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own attempts" ON public.quiz_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins read attempts" ON public.quiz_attempts FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Users create attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid());

-- 9. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT,
    unique_code TEXT UNIQUE NOT NULL,
    quiz_attempt_id UUID REFERENCES public.quiz_attempts(id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own certs" ON public.certificates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins read certs" ON public.certificates FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'Admin'));
CREATE POLICY "Anyone verify certs" ON public.certificates FOR SELECT USING (true);

-- Quiz & Certificate Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_course ON public.quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON public.questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_certs_unique ON public.certificates(unique_code);

-- 6. STORAGE BUCKET FOR COURSE ASSETS
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assets', 'course-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for course assets
DROP POLICY IF EXISTS "Public Access for course-assets" ON storage.objects;
CREATE POLICY "Public Access for course-assets"
ON storage.objects FOR ALL
USING (bucket_id = 'course-assets')
WITH CHECK (bucket_id = 'course-assets');
