-- =============================================================================
-- Migration: Fleet Auto Fare Settings & Calculation Records
-- Author: South Zoom Tourism Tech Team
-- Date: 2026-08-24
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FLEETS TABLE (Core vehicle metadata)
CREATE TABLE IF NOT EXISTS public.fleets (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 4,
  luggage INTEGER NOT NULL DEFAULT 2,
  ac BOOLEAN NOT NULL DEFAULT true,
  fuel TEXT DEFAULT 'Petrol',
  image TEXT NOT NULL,
  image_alt TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  popularity INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. FLEET FARE SETTINGS TABLE (Admin configurable per-km rates & rules)
CREATE TABLE IF NOT EXISTS public.fleet_fare_settings (
  id TEXT PRIMARY KEY,
  fleet_id TEXT NOT NULL REFERENCES public.fleets(id) ON DELETE CASCADE,
  one_way_rate_per_km NUMERIC(10, 2) NOT NULL DEFAULT 12.00,
  one_way_minimum_km NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
  one_way_driver_allowance NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
  round_trip_rate_per_km NUMERIC(10, 2) NOT NULL DEFAULT 11.00,
  round_trip_minimum_km_per_day NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
  round_trip_driver_allowance_per_day NUMERIC(10, 2) NOT NULL DEFAULT 300.00,
  gst_percentage NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  toll_mode TEXT NOT NULL DEFAULT 'extra' CHECK (toll_mode IN ('calculated', 'actuals', 'included', 'extra')),
  state_tax_mode TEXT NOT NULL DEFAULT 'extra' CHECK (state_tax_mode IN ('calculated', 'actuals', 'included', 'extra')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_fleet_fare_settings_fleet_id UNIQUE(fleet_id)
);

-- 3. FARE CALCULATIONS TABLE (History of estimated quotations)
CREATE TABLE IF NOT EXISTS public.fare_calculations (
  id TEXT PRIMARY KEY DEFAULT ('calc_' || substr(md5(random()::text), 1, 16)),
  fleet_id TEXT REFERENCES public.fleets(id) ON DELETE SET NULL,
  vehicle_name TEXT NOT NULL,
  trip_type TEXT NOT NULL CHECK (trip_type IN ('one-way', 'round-trip')),
  pickup_location TEXT NOT NULL,
  destination TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  return_date DATE,
  day_count INTEGER NOT NULL DEFAULT 1,
  route_distance_km NUMERIC(10, 2) NOT NULL,
  billable_distance_km NUMERIC(10, 2) NOT NULL,
  rate_per_km NUMERIC(10, 2) NOT NULL,
  base_fare NUMERIC(10, 2) NOT NULL,
  driver_allowance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  toll_amount NUMERIC(10, 2),
  toll_display TEXT NOT NULL DEFAULT 'Actuals / Extra',
  state_tax_amount NUMERIC(10, 2),
  state_tax_display TEXT NOT NULL DEFAULT 'Included / As applicable',
  subtotal NUMERIC(10, 2) NOT NULL,
  gst_percentage NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
  gst_amount NUMERIC(10, 2) NOT NULL,
  total_estimated_fare NUMERIC(10, 2) NOT NULL,
  route_duration TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  source TEXT DEFAULT 'web-calculator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fleet_fare_settings_fleet_id ON public.fleet_fare_settings(fleet_id);
CREATE INDEX IF NOT EXISTS idx_fare_calculations_created_at ON public.fare_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fare_calculations_customer_phone ON public.fare_calculations(customer_phone);

-- Row Level Security (RLS)
ALTER TABLE public.fleets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fleet_fare_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fare_calculations ENABLE ROW LEVEL SECURITY;

-- Public can read published fleets and active fare settings
CREATE POLICY "Public can view published fleets" 
  ON public.fleets FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Public can view active fare settings" 
  ON public.fleet_fare_settings FOR SELECT 
  USING (is_active = true);

-- Public can insert fare calculation logs
CREATE POLICY "Anyone can create fare calculation records" 
  ON public.fare_calculations FOR INSERT 
  WITH CHECK (true);

-- Authenticated admins have full CRUD access
CREATE POLICY "Admins have full access to fleets" 
  ON public.fleets FOR ALL 
  USING (auth.role() = 'service_role' OR auth.role() = 'admin');

CREATE POLICY "Admins have full access to fare settings" 
  ON public.fleet_fare_settings FOR ALL 
  USING (auth.role() = 'service_role' OR auth.role() = 'admin');

CREATE POLICY "Admins can view all fare calculations" 
  ON public.fare_calculations FOR SELECT 
  USING (auth.role() = 'service_role' OR auth.role() = 'admin');

-- SEED INITIAL FLEETS & FARE SETTINGS
INSERT INTO public.fleets (id, slug, name, brand, model, category_slug, seats, luggage, ac, fuel, image, display_order)
VALUES
  ('fv-hatchback', 'hatchback-wagonr', 'Hatchback (WagonR or similar)', 'Maruti Suzuki', 'WagonR', 'hatchback', 4, 2, true, 'Petrol', '/assets/fleet-wagonr-ka.jpg', 1),
  ('fv-dzire', 'maruti-dzire', 'Sedan (Swift Dzire or similar)', 'Maruti Suzuki', 'Swift Dzire ZXi', 'sedan', 4, 3, true, 'Petrol', '/assets/fleet-dzire-new.png', 2),
  ('fv-ertiga', 'maruti-ertiga', 'Small SUV (Ertiga or similar)', 'Maruti Suzuki', 'Ertiga', 'suv', 6, 4, true, 'Diesel', '/assets/fleet-ertiga-new.png', 3),
  ('fv-crysta', 'innova-crysta', 'Big SUV (Innova Crysta or similar)', 'Toyota', 'Innova Crysta', 'suv', 7, 5, true, 'Diesel', '/assets/fleet-innova-new.png', 4),
  ('fv-tempo12', 'tempo-traveller-12', 'Tempo Traveller (12-17 Seater)', 'Force Motors', 'Traveller 3350', 'tempo-traveller', 12, 10, true, 'Diesel', '/assets/fleet-tempo-new.png', 5),
  ('fv-urbania', 'force-urbania', 'Force Urbania (10-17 Seater Luxury Van)', 'Force Motors', 'Urbania Luxury', 'tempo-traveller', 14, 12, true, 'Diesel', '/assets/fleet-urbania-ka.jpg', 6),
  ('fv-bus27', 'mini-bus-27', 'Tourist Bus (27-45 Seater)', 'Tata / Volvo', 'Starbus 27 / Volvo', 'bus', 35, 25, true, 'Diesel', '/assets/fleet-bus-ka.jpg', 7),
  ('fv-premium', 'premium-bmw', 'Premium (BMW or similar)', 'BMW', '5 Series', 'premium', 4, 3, true, 'Petrol', '/assets/fleet-bmw-new.png', 8)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  brand = EXCLUDED.brand,
  model = EXCLUDED.model,
  updated_at = NOW();

INSERT INTO public.fleet_fare_settings (
  id, fleet_id, one_way_rate_per_km, one_way_minimum_km, one_way_driver_allowance,
  round_trip_rate_per_km, round_trip_minimum_km_per_day, round_trip_driver_allowance_per_day,
  gst_percentage, toll_mode, state_tax_mode, is_active, display_order
)
VALUES
  ('ffc-hatchback', 'fv-hatchback', 12.00, 150.00, 300.00, 11.00, 300.00, 300.00, 5.00, 'extra', 'extra', true, 1),
  ('ffc-sedan',     'fv-dzire',     14.00, 150.00, 300.00, 13.00, 300.00, 300.00, 5.00, 'extra', 'extra', true, 2),
  ('ffc-small-suv', 'fv-ertiga',    18.00, 150.00, 350.00, 16.00, 300.00, 350.00, 5.00, 'extra', 'extra', true, 3),
  ('ffc-big-suv',   'fv-crysta',    21.00, 150.00, 400.00, 19.00, 300.00, 400.00, 5.00, 'extra', 'extra', true, 4),
  ('ffc-tempo',     'fv-tempo12',   24.00, 250.00, 500.00, 22.00, 300.00, 500.00, 5.00, 'extra', 'extra', true, 5),
  ('ffc-urbania',   'fv-urbania',   28.00, 250.00, 600.00, 25.00, 300.00, 600.00, 5.00, 'extra', 'extra', true, 6),
  ('ffc-bus',       'fv-bus27',     38.00, 300.00, 1000.00, 35.00, 350.00, 1000.00, 5.00, 'extra', 'extra', true, 7),
  ('ffc-premium',   'fv-premium',   45.00, 150.00, 500.00, 42.00, 300.00, 500.00, 5.00, 'extra', 'extra', true, 8)
ON CONFLICT (fleet_id) DO UPDATE SET
  one_way_rate_per_km = EXCLUDED.one_way_rate_per_km,
  round_trip_rate_per_km = EXCLUDED.round_trip_rate_per_km,
  updated_at = NOW();
