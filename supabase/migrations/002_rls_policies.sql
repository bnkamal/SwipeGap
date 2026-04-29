-- ============================================================
-- SwipeGap — Row Level Security Policies
-- File: /supabase/migrations/002_rls_policies.sql
-- Run this SECOND in Supabase SQL Editor (after 001)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics             ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plans     ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_offers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheatsheets        ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_log             ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges             ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_links       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications      ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM users WHERE id = auth.uid();
$$;

-- ── USERS ────────────────────────────────────────────────────
CREATE POLICY "users_select_self"    ON users FOR SELECT USING (id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "users_update_self"    ON users FOR UPDATE USING (id = auth.uid());

-- ── STUDENT PROFILES ─────────────────────────────────────────
CREATE POLICY "sp_select"  ON student_profiles FOR SELECT
  USING (user_id = auth.uid() OR get_my_role() IN ('admin','mentor'));
CREATE POLICY "sp_insert"  ON student_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sp_update"  ON student_profiles FOR UPDATE USING (user_id = auth.uid());

-- ── MENTOR PROFILES ──────────────────────────────────────────
-- Any authenticated user can view mentor profiles (for marketplace)
CREATE POLICY "mp_select"  ON mentor_profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "mp_insert"  ON mentor_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "mp_update"  ON mentor_profiles FOR UPDATE USING (user_id = auth.uid() OR get_my_role() = 'admin');

-- ── TOPICS ───────────────────────────────────────────────────
-- All authenticated users can read topics; only admins can write
CREATE POLICY "topics_select" ON topics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "topics_insert" ON topics FOR INSERT WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "topics_update" ON topics FOR UPDATE USING (get_my_role() = 'admin');
CREATE POLICY "topics_delete" ON topics FOR DELETE USING (get_my_role() = 'admin');

-- ── SWIPE EVENTS ─────────────────────────────────────────────
-- Students own their swipes; mentors can see anonymised (no student_id exposed via API)
CREATE POLICY "swipe_insert"       ON swipe_events FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "swipe_select_own"   ON swipe_events FOR SELECT USING (student_id = auth.uid() OR get_my_role() = 'admin');

-- ── LEARNING PLANS ───────────────────────────────────────────
CREATE POLICY "plan_select" ON learning_plans FOR SELECT
  USING (student_id = auth.uid() OR get_my_role() IN ('admin','mentor'));
CREATE POLICY "plan_insert" ON learning_plans FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "plan_update" ON learning_plans FOR UPDATE USING (student_id = auth.uid());

-- ── ASSESSMENTS ──────────────────────────────────────────────
CREATE POLICY "assess_select" ON assessments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "assess_write"  ON assessments FOR INSERT WITH CHECK (get_my_role() = 'admin');

-- ── ASSESSMENT RESULTS ───────────────────────────────────────
CREATE POLICY "ar_select" ON assessment_results FOR SELECT USING (student_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "ar_insert" ON assessment_results FOR INSERT WITH CHECK (student_id = auth.uid());

-- ── SESSIONS ─────────────────────────────────────────────────
CREATE POLICY "sess_select" ON sessions FOR SELECT
  USING (student_id = auth.uid() OR mentor_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "sess_insert" ON sessions FOR INSERT
  WITH CHECK (student_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "sess_update" ON sessions FOR UPDATE
  USING (student_id = auth.uid() OR mentor_id = auth.uid() OR get_my_role() = 'admin');

-- ── SESSION OFFERS ───────────────────────────────────────────
CREATE POLICY "offer_select" ON session_offers FOR SELECT
  USING (mentor_id = auth.uid() OR student_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "offer_insert" ON session_offers FOR INSERT WITH CHECK (mentor_id = auth.uid());
CREATE POLICY "offer_update" ON session_offers FOR UPDATE
  USING (mentor_id = auth.uid() OR student_id = auth.uid());

-- ── CHEATSHEETS ──────────────────────────────────────────────
-- Anyone can view approved cheatsheets; mentor owns their own; admin sees all
CREATE POLICY "cs_select" ON cheatsheets FOR SELECT
  USING (approved = TRUE OR mentor_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "cs_insert" ON cheatsheets FOR INSERT WITH CHECK (mentor_id = auth.uid());
CREATE POLICY "cs_update" ON cheatsheets FOR UPDATE
  USING (mentor_id = auth.uid() OR get_my_role() = 'admin');

-- ── PAYMENTS ─────────────────────────────────────────────────
CREATE POLICY "pay_select" ON payments FOR SELECT USING (user_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "pay_insert" ON payments FOR INSERT WITH CHECK (get_my_role() = 'admin');

-- ── SUBSCRIPTIONS ────────────────────────────────────────────
CREATE POLICY "sub_select" ON subscriptions FOR SELECT USING (user_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "sub_upsert" ON subscriptions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "sub_update" ON subscriptions FOR UPDATE USING (user_id = auth.uid() OR get_my_role() = 'admin');

-- ── XP LOG ───────────────────────────────────────────────────
CREATE POLICY "xp_select" ON xp_log FOR SELECT USING (student_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "xp_insert" ON xp_log FOR INSERT WITH CHECK (student_id = auth.uid() OR get_my_role() = 'admin');

-- ── BADGES ───────────────────────────────────────────────────
CREATE POLICY "badge_select" ON badges FOR SELECT USING (student_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "badge_insert" ON badges FOR INSERT WITH CHECK (student_id = auth.uid() OR get_my_role() = 'admin');

-- ── STREAKS ──────────────────────────────────────────────────
CREATE POLICY "streak_select" ON streaks FOR SELECT USING (student_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "streak_upsert" ON streaks FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "streak_update" ON streaks FOR UPDATE USING (student_id = auth.uid() OR get_my_role() = 'admin');

-- ── BENCHMARKS ───────────────────────────────────────────────
CREATE POLICY "bench_select" ON benchmarks FOR SELECT
  USING (student_id = auth.uid() OR get_my_role() IN ('admin','mentor'));
CREATE POLICY "bench_upsert" ON benchmarks FOR INSERT WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "bench_update" ON benchmarks FOR UPDATE USING (get_my_role() = 'admin');

-- ── PARENT LINKS ─────────────────────────────────────────────
CREATE POLICY "pl_select" ON parent_links FOR SELECT
  USING (parent_user_id = auth.uid() OR student_user_id = auth.uid() OR get_my_role() = 'admin');
CREATE POLICY "pl_insert" ON parent_links FOR INSERT WITH CHECK (parent_user_id = auth.uid());

-- ── NOTIFICATIONS ────────────────────────────────────────────
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_insert" ON notifications FOR INSERT WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (user_id = auth.uid());
