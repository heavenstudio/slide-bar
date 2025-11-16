-- Create organization_settings table for org-wide default configurations
CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  default_slide_duration INTEGER DEFAULT 5000 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id)
);

-- Add comment for documentation
COMMENT ON TABLE organization_settings IS 'Organization-wide settings and preferences';
COMMENT ON COLUMN organization_settings.default_slide_duration IS 'Default duration in milliseconds for new images uploaded to this organization (default: 5000ms)';

-- Enable Row Level Security
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read settings for their organization
CREATE POLICY "Users can view their organization settings"
  ON organization_settings
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policy: Users can update settings for their organization
CREATE POLICY "Users can update their organization settings"
  ON organization_settings
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- RLS Policy: Users can insert settings for their organization
CREATE POLICY "Users can insert their organization settings"
  ON organization_settings
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Create index for faster lookups by organization_id
CREATE INDEX idx_organization_settings_organization_id ON organization_settings(organization_id);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_organization_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on updates
CREATE TRIGGER set_organization_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_settings_updated_at();
