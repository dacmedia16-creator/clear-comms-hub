-- Step 1: Add new enum values
ALTER TYPE organization_type ADD VALUE IF NOT EXISTS 'healthcare';
ALTER TYPE organization_type ADD VALUE IF NOT EXISTS 'community';
ALTER TYPE organization_type ADD VALUE IF NOT EXISTS 'franchise';