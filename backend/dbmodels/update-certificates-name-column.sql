-- Update certificates table to change patient_name to name
-- This allows the certificate to be for anyone (doctors, staff, patients, etc.)

-- Add new 'name' column
ALTER TABLE certificates ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '';

-- Copy data from patient_name to name
UPDATE certificates SET name = patient_name WHERE patient_name IS NOT NULL;

-- Drop the old patient_name column
ALTER TABLE certificates DROP COLUMN patient_name;

-- Add index for the new name column
CREATE INDEX idx_name ON certificates (name);

-- Remove old patient_name index if it exists
DROP INDEX IF EXISTS idx_patient_name ON certificates;
