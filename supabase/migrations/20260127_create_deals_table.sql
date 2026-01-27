-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hunt_id UUID NOT NULL REFERENCES hunts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  source TEXT NOT NULL, -- 'ebay' or 'google_shopping'
  url TEXT NOT NULL,
  image_url TEXT,
  found_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_source CHECK (source IN ('ebay', 'google_shopping'))
);

-- Create index for efficient queries
CREATE INDEX idx_deals_hunt_id ON deals(hunt_id);
CREATE INDEX idx_deals_found_at ON deals(found_at DESC);
