-- Final Updated Database Schema for Tradies Directory (With Expanded Fields and Jobs Table for Notice Board)

-- Enable Extensions (btree_gist for GIST; uuid-ossp optional)
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- Optional

-- Regions Table (Expansion: Normalized)
CREATE TABLE regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  country TEXT DEFAULT 'AU',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies Table (Core + Expanded Fields for Onboarding)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  abn TEXT NOT NULL UNIQUE,
  licenses JSONB,  -- File URLs
  social_links JSONB,
  google_reviews_url TEXT,
  location JSONB NOT NULL,  -- { "address": "", "lat": 0, "long": 0, "region": "" }
  services TEXT[] NOT NULL,
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')) DEFAULT 'basic',
  subscription_id TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- New Expanded Optional Fields
  description TEXT,  -- Business bio
  website TEXT,
  phone TEXT,
  email TEXT,
  years_in_business INTEGER,
  number_of_employees INTEGER,
  certifications TEXT[],
  insurance_details TEXT,
  operating_hours TEXT,
  payment_methods TEXT[],
  areas_serviced TEXT[],
  "references" TEXT[]  -- Quoted to avoid reserved keyword error
);

-- Ads Table
CREATE TABLE ads (
  id SERIAL PRIMARY KEY,
  spot INTEGER CHECK (spot BETWEEN 1 AND 3),
  image_url TEXT,
  link_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  query TEXT,
  user_location JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs Table (For Notice/Job Board—Businesses Post Positions)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,  -- Owner (business)
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location JSONB,  -- { "address": "", "lat": 0, "long": 0, "region": "" }
  posted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (Performance/Expansion)
CREATE INDEX idx_companies_services ON companies USING GIN (services);  -- Array search
-- CREATE INDEX idx_companies_location ON companies USING GIST ((location::jsonb));  -- Comment out if error; enable btree_gist if adding back

-- RLS Policies for Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for owners" ON companies FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Enable update for owners" ON companies FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for Jobs (Owners post/update their own, public read)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read for all" ON jobs FOR SELECT USING (true);  -- Public view on front page
CREATE POLICY "Enable insert for owners" ON jobs FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Enable update for owners" ON jobs FOR UPDATE USING (user_id = auth.uid());

-- Trigger for auto-creating companies stub on user signup
CREATE OR REPLACE FUNCTION create_company_stub() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO companies (user_id, name, abn, location, services, verified)
  VALUES (NEW.id, '', '', '{"address": "", "lat": 0, "long": 0, "region": ""}', '{}', FALSE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to auth.users insert
CREATE TRIGGER trig_create_company_after_signup
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE create_company_stub();

-- Seed Regions (Optional for Expansion Test)
INSERT INTO regions (name) VALUES ('Northern Beaches, NSW'), ('Brisbane, QLD');

-- Seed Example Job (For Testing Notice Board)
INSERT INTO jobs (user_id, title, description, location) VALUES ('your_test_user_id_here', 'Plumber Needed in Brisbane', 'Full-time position for experienced plumber', '{"address": "Brisbane, QLD", "lat": -27.4698, "long": 153.0251, "region": "Brisbane, QLD"}');  -- Replace user_id with a test user from auth.users
