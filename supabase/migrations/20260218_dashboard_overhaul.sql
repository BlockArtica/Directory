-- Migration: Dashboard Overhaul
-- Adds ad_bookings table + RLS policies for business dashboard features

-- ============================================================
-- 1. Ad Bookings (businesses request ad spots, admin approves)
-- ============================================================
CREATE TABLE ad_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  spot INTEGER NOT NULL CHECK (spot BETWEEN 1 AND 3),
  image_url TEXT NOT NULL,
  link_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ad_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can read own ad bookings"
  ON ad_bookings FOR SELECT
  USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE POLICY "Company owners can insert own ad bookings"
  ON ad_bookings FOR INSERT
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));

CREATE INDEX idx_ad_bookings_company ON ad_bookings(company_id);
CREATE INDEX idx_ad_bookings_spot ON ad_bookings(spot, status);

-- ============================================================
-- 2. Allow company owners to UPDATE received quote requests (change status)
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Company owners can update received quotes"
    ON quote_requests FOR UPDATE
    USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. Allow company owners to SELECT their own leads
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Company owners can read own leads"
    ON leads FOR SELECT
    USING (company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4. Allow company owners to DELETE their own jobs
-- ============================================================
DO $$ BEGIN
  CREATE POLICY "Enable delete for owners"
    ON jobs FOR DELETE
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
