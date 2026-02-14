-- Add missing expanded fields to companies table
-- Run this BEFORE seed.sql if your table was created from an earlier migration

ALTER TABLE companies ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS years_in_business INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS number_of_employees INTEGER;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS insurance_details TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS operating_hours TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS payment_methods TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS areas_serviced TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS "references" TEXT[];
ALTER TABLE companies ADD COLUMN IF NOT EXISTS licenses JSONB;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS social_links JSONB;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS google_reviews_url TEXT;
