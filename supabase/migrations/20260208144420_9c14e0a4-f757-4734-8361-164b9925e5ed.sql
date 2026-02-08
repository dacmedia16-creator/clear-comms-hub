-- Step 2: Update existing data to use new consolidated types
UPDATE condominiums SET organization_type = 'healthcare' WHERE organization_type = 'clinic';
UPDATE condominiums SET organization_type = 'community' WHERE organization_type IN ('association', 'club', 'gym');
UPDATE condominiums SET organization_type = 'company' WHERE organization_type IN ('school', 'other');