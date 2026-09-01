import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wraacxqwvsfugpzxatie.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWFjeHF3dnNmdWdwenhhdGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1MTU3NSwiZXhwIjoyMTAzNzI3NTc1fQ.DlMaYOM3IWiwCUH6sK12nioTDvJKmDKJXTacLSQdlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedOriginalHeroSlides() {
  console.log('Seeding the 7 ORIGINAL website hero slides into Supabase...');

  const originalHeroSlides = [
    {
      heading: 'Car rentals across South India',
      description: 'Well-maintained sedans, SUVs and tempo travellers with verified drivers, transparent pricing and 24×7 support.',
      badge: 'Flat 10% off on round trips',
      image_desktop: '/src/assets/hero-fleet.jpg',
      image_mobile: '/src/assets/hero-fleet.jpg',
      primary_cta_label: 'Book a Vehicle',
      primary_cta_href: '/fleet',
      active: true,
      display_order: 1,
    },
    {
      heading: 'Tour packages made for real travellers',
      description: 'Hill stations, heritage towns, backwaters and beaches — planned end to end with stays, transfers and sightseeing.',
      badge: 'Curated itineraries',
      image_desktop: '/src/assets/hero-tours.jpg',
      image_mobile: '/src/assets/hero-tours.jpg',
      primary_cta_label: 'Explore Packages',
      primary_cta_href: '/tour-packages',
      active: true,
      display_order: 2,
    },
    {
      heading: 'Hotels & rooms at partner rates',
      description: 'Handpicked resorts, business hotels and homestays with instant confirmation and free cancellation options.',
      badge: 'Best rate guarantee',
      image_desktop: '/src/assets/hero-hotels.jpg',
      image_mobile: '/src/assets/hero-hotels.jpg',
      primary_cta_label: 'Find a Room',
      primary_cta_href: '/hotels',
      active: true,
      display_order: 3,
    },
    {
      heading: 'Airport transfers, always on time',
      description: 'Fixed-fare pickups and drops for every South Indian airport, with 60 minutes of complimentary waiting.',
      badge: 'Flight tracking included',
      image_desktop: '/src/assets/hero-fleet.jpg',
      image_mobile: '/src/assets/hero-fleet.jpg',
      primary_cta_label: 'Book Transfer',
      primary_cta_href: '/fleet',
      active: true,
      display_order: 4,
    },
    {
      heading: 'Corporate travel on monthly billing',
      description: 'Dedicated account manager, employee transport, and consolidated invoicing for teams of any size.',
      badge: 'GST invoices',
      image_desktop: '/src/assets/hero-tours.jpg',
      image_mobile: '/src/assets/hero-tours.jpg',
      primary_cta_label: 'Request Proposal',
      primary_cta_href: '/contact-us',
      active: true,
      display_order: 5,
    },
    {
      heading: 'Pilgrimage tours with local guidance',
      description: 'Navagraha, Murugan and Kerala temple circuits with darshan planning, prasadam stops and comfortable stays.',
      badge: 'Temple circuits',
      image_desktop: '/src/assets/hero-tours.jpg',
      image_mobile: '/src/assets/hero-tours.jpg',
      primary_cta_label: 'View Pilgrimage Tours',
      primary_cta_href: '/tour-packages',
      active: true,
      display_order: 6,
    },
    {
      heading: 'Group tours & event travel',
      description: 'Buses, tempo travellers and multi-vehicle convoys for schools, weddings and company offsites.',
      badge: 'Up to 50 seats',
      image_desktop: '/src/assets/hero-hotels.jpg',
      image_mobile: '/src/assets/hero-hotels.jpg',
      primary_cta_label: 'Plan Group Travel',
      primary_cta_href: '/contact-us',
      active: true,
      display_order: 7,
    },
  ];

  await supabase.from('hero_slides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { data, error } = await supabase.from('hero_slides').insert(originalHeroSlides).select('*');

  if (error) {
    console.error('Error inserting hero slides:', error);
  } else {
    console.log(`✅ Successfully seeded ${data.length} original hero slides into Supabase!`);
  }
}

seedOriginalHeroSlides().catch(console.error);
