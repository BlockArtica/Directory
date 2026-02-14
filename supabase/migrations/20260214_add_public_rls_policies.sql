-- Add public RLS policies for directory, ads, and leads
-- Run this if 20260115_create_tables.sql was already applied

-- Public read for verified companies (directory page)
CREATE POLICY "Enable public read for verified companies"
ON companies FOR SELECT
USING (verified = true);

-- Public read for active ads (homepage)
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable public read for ads"
ON ads FOR SELECT
USING (active = true);

-- Public insert for leads (anonymous search tracking)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable public insert for leads"
ON leads FOR INSERT
WITH CHECK (true);
