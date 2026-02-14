-- Create any missing tables that may not have been created from the base migration

-- Jobs Table (For Notice/Job Board)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location JSONB,
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  query TEXT,
  user_location JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Regions Table
CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  country TEXT DEFAULT 'AU',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ads Table
CREATE TABLE IF NOT EXISTS ads (
  id SERIAL PRIMARY KEY,
  spot INTEGER CHECK (spot BETWEEN 1 AND 3),
  image_url TEXT,
  link_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for jobs (if not already set)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Enable read for all" ON jobs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Enable insert for owners" ON jobs FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "Enable update for owners" ON jobs FOR UPDATE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS for leads (if not already set)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Enable public insert for leads" ON leads FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS for ads (if not already set)
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Enable public read for ads" ON ads FOR SELECT USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed regions if empty
INSERT INTO regions (name) VALUES ('Northern Beaches, NSW'), ('Brisbane, QLD')
ON CONFLICT (name) DO NOTHING;

-- Index on companies.services if not exists
CREATE INDEX IF NOT EXISTS idx_companies_services ON companies USING GIN (services);
