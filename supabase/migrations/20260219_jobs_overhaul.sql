-- Jobs overhaul: add job_type and company_id columns

-- Add job_type column (nullable for backward compat)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type TEXT;

-- Add company_id FK column
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Backfill company_id from user_id
UPDATE jobs
SET company_id = (
  SELECT id FROM companies WHERE companies.user_id = jobs.user_id LIMIT 1
)
WHERE company_id IS NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
