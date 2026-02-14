-- Migration: User Profiles + Seeker Tables
-- Adds user_type differentiation (business vs seeker) and seeker-specific tables

-- ============================================================
-- 1. User Profiles (links auth.users to a user_type)
-- ============================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL CHECK (user_type IN ('business', 'seeker')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================================
-- 2. Favourites (seeker saves a company)
-- ============================================================
CREATE TABLE favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favourites"
  ON favourites FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own favourites"
  ON favourites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own favourites"
  ON favourites FOR DELETE
  USING (user_id = auth.uid());

-- Allow company owners to see favourite count (read favourites where company belongs to them)
CREATE POLICY "Company owners can read received favourites"
  ON favourites FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- ============================================================
-- 3. Saved Searches
-- ============================================================
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved searches"
  ON saved_searches FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 4. Recent Views (last 20 per user, managed app-side)
-- ============================================================
CREATE TABLE recent_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recent_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recent views"
  ON recent_views FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recent views"
  ON recent_views FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own recent views"
  ON recent_views FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 5. Quote Requests
-- ============================================================
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'responded', 'closed')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quote requests"
  ON quote_requests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own quote requests"
  ON quote_requests FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Company owners can read quote requests sent to their companies
CREATE POLICY "Company owners can read received quotes"
  ON quote_requests FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

-- ============================================================
-- 6. Reviews
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read for reviews
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert own reviews"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- 7. Drop the auto company stub trigger
--    (Seekers should NOT get a company row on signup)
-- ============================================================
DROP TRIGGER IF EXISTS trig_create_company_after_signup ON auth.users;
DROP FUNCTION IF EXISTS create_company_stub();

-- ============================================================
-- 8. Indexes for performance
-- ============================================================
CREATE INDEX idx_favourites_user ON favourites(user_id);
CREATE INDEX idx_favourites_company ON favourites(company_id);
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_recent_views_user ON recent_views(user_id);
CREATE INDEX idx_recent_views_viewed_at ON recent_views(user_id, viewed_at DESC);
CREATE INDEX idx_quote_requests_user ON quote_requests(user_id);
CREATE INDEX idx_quote_requests_company ON quote_requests(company_id);
CREATE INDEX idx_reviews_company ON reviews(company_id);
CREATE INDEX idx_user_profiles_type ON user_profiles(user_type);
