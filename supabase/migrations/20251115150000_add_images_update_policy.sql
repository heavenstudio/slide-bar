-- Add UPDATE policy for images table
-- Allows authenticated users to update images in their organization

-- Drop policy if it exists (idempotent migration)
DROP POLICY IF EXISTS "Authenticated users can update images" ON images;

CREATE POLICY "Authenticated users can update images"
ON images
FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  organization_id IN (
    SELECT organization_id
    FROM users
    WHERE id = auth.uid()
  )
);

COMMENT ON POLICY "Authenticated users can update images" ON images IS
'Allows authenticated users to update images that belong to their organization';
