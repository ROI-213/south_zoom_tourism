-- =============================================================================
-- Migration: Complete Admin Control System Schema
-- Date: 2026-08-31
-- =============================================================================

-- =============================================================================
-- 1. USERS & AUTH
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.admin_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  role_id UUID REFERENCES public.admin_roles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- if they register
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  whatsapp TEXT,
  address TEXT,
  total_bookings INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 2. OPERATIONS (Drivers, Routes, etc.)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  license_number TEXT,
  license_expiry DATE,
  experience_years INTEGER,
  languages TEXT[],
  assigned_fleet_id TEXT REFERENCES public.fleets(id) ON DELETE SET NULL,
  cab_type TEXT,
  car_number TEXT,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Assigned', 'On Trip', 'Leave', 'Inactive')),
  rating NUMERIC(3,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.driver_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  distance_km NUMERIC(10,2),
  estimated_duration TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 3. PRODUCTS (Services, Tours, Hotels, Destinations)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  full_description TEXT,
  icon TEXT,
  main_image TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tour_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
  category TEXT,
  nights INTEGER NOT NULL,
  days INTEGER NOT NULL,
  price_from NUMERIC(10,2) NOT NULL,
  main_image TEXT,
  highlights TEXT[],
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  destination_id UUID REFERENCES public.destinations(id) ON DELETE SET NULL,
  city TEXT NOT NULL,
  star_rating INTEGER DEFAULT 3,
  description TEXT,
  main_image TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.hotel_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  price_per_night NUMERIC(10,2) NOT NULL,
  capacity_adults INTEGER DEFAULT 2,
  capacity_children INTEGER DEFAULT 1,
  amenities TEXT[],
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 4. BOOKINGS & CRM
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  booking_type TEXT NOT NULL, -- 'Taxi', 'Outstation', 'Package', 'Hotel'
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('New', 'Enquiry', 'Pending', 'Confirmed', 'Driver Assigned', 'Vehicle Assigned', 'In Progress', 'Completed', 'Cancelled', 'Refunded')),
  pickup_location TEXT,
  drop_location TEXT,
  pickup_date TIMESTAMPTZ,
  return_date TIMESTAMPTZ,
  passengers INTEGER DEFAULT 1,
  fleet_id TEXT REFERENCES public.fleets(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  package_id UUID REFERENCES public.tour_packages(id) ON DELETE SET NULL,
  hotel_id UUID REFERENCES public.hotels(id) ON DELETE SET NULL,
  base_fare NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) DEFAULT 0,
  advance_amount NUMERIC(10,2) DEFAULT 0,
  balance_amount NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  service_type TEXT,
  travel_date DATE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Follow-up', 'Quoted', 'Converted', 'Lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 5. CMS (Content Management)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  heading TEXT NOT NULL,
  description TEXT,
  badge TEXT,
  image_desktop TEXT NOT NULL,
  image_mobile TEXT,
  primary_cta_label TEXT,
  primary_cta_href TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  city TEXT,
  trip_type TEXT,
  rating INTEGER DEFAULT 5,
  text TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  alt_text TEXT,
  category TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.website_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- 6. POLICIES & RLS
-- =============================================================================
-- NOTE: In a real environment, you'll enable RLS and set policies based on 
-- auth.uid() matching the admins table.
-- For now we allow authenticated service role access.
