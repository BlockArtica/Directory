-- Add public RLS policies for directory, ads, and leads
-- Run this if 20260115_create_tables.sql was already applied

-- Public read for verified companies (directory page)
DO $$ BEGIN
  CREATE POLICY "Enable public read for verified companies"
  ON companies FOR SELECT
  USING (verified = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Public read for active ads (homepage)
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Enable public read for ads"
  ON ads FOR SELECT
  USING (active = true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Public insert for leads (anonymous search tracking)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Enable public insert for leads"
  ON leads FOR INSERT
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
