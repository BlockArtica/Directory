-- Add missing INSERT policy for companies (business users create own row)
DO $$ BEGIN
  CREATE POLICY "Enable insert for owners"
    ON companies FOR INSERT
    WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow nullable ABN so stubs can be created without it
ALTER TABLE companies ALTER COLUMN abn DROP NOT NULL;

-- One company per user — enables upsert fallback in profile page
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_user_id_unique ON companies(user_id);
