-- Jaganpur Village App — Database Schema
-- Run this in your Supabase SQL editor

-- Profiles (village residents)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
  wa_opt_in BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OTP codes for WhatsApp authentication
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_codes(phone, used, expires_at);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('general', 'farming', 'health', 'school', 'government', 'emergency')),
  image_url TEXT,
  is_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_emergency ON announcements(is_emergency) WHERE is_emergency = TRUE;

-- Contacts directory
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  hours TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gallery photos
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  caption TEXT,
  album_tag TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed some initial contacts
INSERT INTO contacts (name, category, phone, address, hours, sort_order) VALUES
  ('सामुदायिक स्वास्थ्य केंद्र', 'health', '01234-567890', 'जगनपुर, शामली', 'सोमवार-शनिवार 8am-2pm', 1),
  ('राजकीय इण्टर कॉलेज', 'school', '01234-567891', 'जगनपुर, शामली', 'सोमवार-शनिवार 7am-2pm', 2),
  ('ग्राम प्रधान कार्यालय', 'government', '9876543210', 'ग्राम पंचायत भवन, जगनपुर', 'सोमवार-शुक्रवार 10am-5pm', 3),
  ('बिजली विभाग शिकायत', 'utility', '1912', NULL, '24 घंटे', 4),
  ('पुलिस हेल्पलाइन', 'emergency', '100', NULL, '24 घंटे', 5)
ON CONFLICT DO NOTHING;

-- Supabase Storage bucket for gallery (run separately or via Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
