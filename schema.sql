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
  auditLog JSONB DEFAULT '[]'::jsonb,
  last_modified TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

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

