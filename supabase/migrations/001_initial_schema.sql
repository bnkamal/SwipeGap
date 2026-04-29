-- ============================================================
-- SwipeGap — Initial Database Schema
-- File: /supabase/migrations/001_initial_schema.sql
-- Run this FIRST in Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL CHECK (role IN ('admin','student','mentor','parent')) DEFAULT 'student',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  avatar_url  TEXT
);

-- ── STUDENT PROFILES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  grade        TEXT NOT NULL,
  country      TEXT NOT NULL CHECK (country IN ('AU','IN')),
  exam_targets TEXT[] NOT NULL DEFAULT '{}',
  subjects     TEXT[] NOT NULL DEFAULT '{}',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── MENTOR PROFILES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mentor_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  subjects       TEXT[] NOT NULL DEFAULT '{}',
  qualifications TEXT NOT NULL DEFAULT '',
  hourly_rate    NUMERIC(10,2) NOT NULL DEFAULT 0,
  bio            TEXT NOT NULL DEFAULT '',
  verified       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TOPICS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS topics (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject    TEXT NOT NULL,
  grade      TEXT NOT NULL,
  curriculum TEXT NOT NULL,
  exam_tag   TEXT NOT NULL,
  title      TEXT NOT NULL,
  hint       TEXT NOT NULL DEFAULT '',
  subtopics  TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SWIPE EVENTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS swipe_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id   UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  direction  TEXT NOT NULL CHECK (direction IN ('left','right')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_swipe_student ON swipe_events(student_id);
CREATE INDEX IF NOT EXISTS idx_swipe_topic   ON swipe_events(topic_id);

-- ── LEARNING PLANS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_plans (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id   UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status     TEXT NOT NULL CHECK (status IN ('pending','in_progress','resolved')) DEFAULT 'pending',
  priority   INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, topic_id)
);
CREATE INDEX IF NOT EXISTS idx_plan_student ON learning_plans(student_id);

-- ── ASSESSMENTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id   UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  questions  JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ASSESSMENT RESULTS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS assessment_results (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  score         INTEGER NOT NULL,
  answers       JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SESSIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id       UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  status         TEXT NOT NULL CHECK (status IN ('scheduled','active','completed','cancelled')) DEFAULT 'scheduled',
  scheduled_at   TIMESTAMPTZ NOT NULL,
  price          NUMERIC(10,2) NOT NULL,
  daily_room_url TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_session_student ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_session_mentor  ON sessions(mentor_id);

-- ── SESSION OFFERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS session_offers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id   UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  message    TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL CHECK (status IN ('pending','accepted','declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── CHEATSHEETS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cheatsheets (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title     TEXT NOT NULL,
  subject   TEXT NOT NULL,
  exam_tag  TEXT NOT NULL,
  file_url  TEXT NOT NULL,
  price     NUMERIC(10,2) NOT NULL DEFAULT 0,
  approved  BOOLEAN NOT NULL DEFAULT FALSE,
  downloads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cheatsheet_exam ON cheatsheets(exam_tag);

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT NOT NULL,
  amount            NUMERIC(10,2) NOT NULL,
  currency          TEXT NOT NULL CHECK (currency IN ('AUD','INR')),
  type              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── SUBSCRIPTIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plan          TEXT NOT NULL CHECK (plan IN ('free','basic','pro','premium')) DEFAULT 'free',
  stripe_sub_id TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  expires_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── XP LOG ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS xp_log (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action     TEXT NOT NULL,
  points     INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_xp_student ON xp_log(student_id);

-- ── BADGES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  earned_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, badge_type)
);

-- ── STREAKS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS streaks (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  current_streak  INTEGER NOT NULL DEFAULT 0,
  longest_streak  INTEGER NOT NULL DEFAULT 0,
  last_swipe_date DATE
);

-- ── BENCHMARKS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS benchmarks (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject           TEXT NOT NULL,
  grade             TEXT NOT NULL,
  percentile_au     NUMERIC(5,2),
  percentile_in     NUMERIC(5,2),
  percentile_global NUMERIC(5,2),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, subject, grade)
);

-- ── PARENT LINKS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS parent_links (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_user_id, student_user_id)
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, read);

-- ── TRIGGER: auto-create user row on auth signup ─────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO users (id, email, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'student'))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
