-- ====================================================================
-- RUANG BERSAMA — SUPABASE FULL DATABASE MIGRATION SCRIPT v5 (100% IDEMPOTENT)
-- Jalankan seluruh script ini di Supabase Dashboard -> SQL Editor -> New query
-- ====================================================================

-- 1. Hapus foreign key lama yang mengunci auth.users
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS public.profiles DROP CONSTRAINT IF EXISTS profiles_couple_id_fkey;

-- 2. Couples Table
CREATE TABLE IF NOT EXISTS public.couples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invite_code TEXT UNIQUE DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
    couple_name TEXT DEFAULT 'Ruang Khanif & Arum',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default couple workspace
INSERT INTO public.couples (id, invite_code, couple_name)
VALUES ('c1010000-0000-0000-0000-000000000101', 'BERSAMA', 'Ruang Khanif & Arum')
ON CONFLICT (id) DO NOTHING;

-- 3. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID DEFAULT 'c1010000-0000-0000-0000-000000000101',
    email TEXT,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'partner',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed fallback profiles
INSERT INTO public.profiles (id, couple_id, email, name)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'c1010000-0000-0000-0000-000000000101', 'khanif@gmail.com', 'Khanif'),
    ('22222222-2222-2222-2222-222222222222', 'c1010000-0000-0000-0000-000000000101', 'arum@gmail.com', 'Arum')
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email, name = EXCLUDED.name;

-- 4. Habits Table (Habit Rutin)
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    couple_id UUID NOT NULL DEFAULT 'c1010000-0000-0000-0000-000000000101',
    title TEXT NOT NULL,
    frequency TEXT DEFAULT 'daily',
    category TEXT DEFAULT 'Kesehatan',
    icon TEXT DEFAULT '🌿',
    color TEXT DEFAULT 'emerald',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Habit Logs Table (Centang Habit Harian)
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL,
    user_id UUID NOT NULL,
    completed_at DATE NOT NULL DEFAULT current_date,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_habit_daily_completion UNIQUE (habit_id, user_id, completed_at)
);

-- 6. Daily Tasks Table (List Kegiatan / To-Do Harian)
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL DEFAULT 'c1010000-0000-0000-0000-000000000101',
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL DEFAULT current_date,
    time TEXT DEFAULT '',
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Agenda Events Table (Kalender & Agenda dengan Jam)
CREATE TABLE IF NOT EXISTS public.agenda_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL DEFAULT 'c1010000-0000-0000-0000-000000000101',
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT DEFAULT '',
    category TEXT NOT NULL CHECK (category IN ('personal', 'together')),
    created_by UUID NOT NULL,
    color_tag TEXT DEFAULT 'emerald',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agenda_events ADD COLUMN IF NOT EXISTS time TEXT DEFAULT '';

-- 8. Weekly Evaluations Table (Refleksi Mingguan)
CREATE TABLE IF NOT EXISTS public.weekly_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    couple_id UUID NOT NULL DEFAULT 'c1010000-0000-0000-0000-000000000101',
    week_start DATE NOT NULL,
    reflection_user_1 TEXT DEFAULT '',
    reflection_user_2 TEXT DEFAULT '',
    goals_next_week TEXT DEFAULT '',
    score_user_1 INTEGER DEFAULT 0,
    score_user_2 INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_couple_weekly_eval UNIQUE (couple_id, week_start)
);

-- 9. Daily Journals Table (Catatan Harian)
CREATE TABLE IF NOT EXISTS public.daily_journals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    couple_id UUID NOT NULL DEFAULT 'c1010000-0000-0000-0000-000000000101',
    date DATE NOT NULL DEFAULT current_date,
    content TEXT NOT NULL DEFAULT '',
    mood TEXT DEFAULT 'good',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_daily_journal UNIQUE (user_id, date)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) & OPEN POLICIES
-- ============================================================

ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_journals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_all_habits" ON public.habits;
DROP POLICY IF EXISTS "allow_all_habit_logs" ON public.habit_logs;
DROP POLICY IF EXISTS "allow_all_daily_tasks" ON public.daily_tasks;
DROP POLICY IF EXISTS "allow_all_agenda_events" ON public.agenda_events;
DROP POLICY IF EXISTS "allow_all_weekly_evaluations" ON public.weekly_evaluations;
DROP POLICY IF EXISTS "allow_all_couples" ON public.couples;
DROP POLICY IF EXISTS "allow_all_daily_journals" ON public.daily_journals;

CREATE POLICY "allow_all_profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_habits" ON public.habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_habit_logs" ON public.habit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_daily_tasks" ON public.daily_tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_agenda_events" ON public.agenda_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_weekly_evaluations" ON public.weekly_evaluations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_couples" ON public.couples FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_daily_journals" ON public.daily_journals FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- REALTIME PUBLICATION (SAFE CHECK PER TABLE)
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'habits') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'habit_logs') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_logs;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'daily_tasks') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_tasks;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'agenda_events') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.agenda_events;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'weekly_evaluations') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_evaluations;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'daily_journals') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.daily_journals;
    END IF;
END $$;
