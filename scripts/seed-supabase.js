import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wraacxqwvsfugpzxatie.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWFjeHF3dnNmdWdwenhhdGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1MTU3NSwiZXhwIjoyMTAzNzI3NTc1fQ.DlMaYOM3IWiwCUH6sK12nioTDvJKmDKJXTacLSQdlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
  console.log('🚀 Starting Supabase Data Seeding for South Zoom Tourism...');

  // 1. HERO SLIDES
  console.log('Inserting Hero Slides...');
  const heroSlides = [
    {
      heading: 'Car rentals across South India',
      description: 'Well-maintained sedans, SUVs and tempo travellers with verified drivers, transparent pricing and 24×7 support.',
      badge: 'Flat 10% off on round trips',
      image_desktop: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      primary_cta_label: 'Book a Vehicle',
      primary_cta_href: '/fleet',
      active: true,
      display_order: 1,
    },
    {
      heading: 'Tour packages made for real travellers',
      description: 'Hill stations, heritage towns, backwaters and beaches — planned end to end with stays, transfers and sightseeing.',
      badge: 'Curated itineraries',
      image_desktop: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      primary_cta_label: 'Explore Packages',
      primary_cta_href: '/tour-packages',
      active: true,
      display_order: 2,
    },
    {
      heading: 'Hotels & rooms at partner rates',
      description: 'Handpicked resorts, business hotels and homestays with instant confirmation and free cancellation options.',
      badge: 'Best rate guarantee',
      image_desktop: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      primary_cta_label: 'Find a Room',
      primary_cta_href: '/hotels',
      active: true,
      display_order: 3,
    },
    {
      heading: 'Airport transfers, always on time',
      description: 'Fixed-fare pickups and drops for every South Indian airport, with 60 minutes of complimentary waiting.',
      badge: 'Flight tracking included',
      image_desktop: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
      primary_cta_label: 'Book Transfer',
      primary_cta_href: '/fleet',
      active: true,
      display_order: 4,
    },
  ];
  await supabase.from('hero_slides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('hero_slides').insert(heroSlides);

  // 2. TESTIMONIALS
  console.log('Inserting Testimonials...');
  const testimonials = [
    {
      customer_name: 'Suresh Nagaraj',
      city: 'Bengaluru',
      trip_type: 'Outstation Round Trip',
      rating: 5,
      text: 'We booked an Innova Crysta from Bengaluru to Ooty for a family weekend. The driver Mohan arrived 15 minutes early. Vehicle was spotless — AC worked perfectly even on ghat roads. Fare matched the quote down to the last rupee.',
      active: true,
      display_order: 1,
    },
    {
      customer_name: 'Lakshmi Venkatesh',
      city: 'Bengaluru',
      trip_type: 'Local City Rental',
      rating: 5,
      text: 'I needed an 8-hour city cab for my mother’s hospital visits across Bengaluru. The Dzire was well-maintained, driver was patient with all our stops, and billing was completely transparent.',
      active: true,
      display_order: 2,
    },
    {
      customer_name: 'Karthik Ramamurthy',
      city: 'Chennai',
      trip_type: 'Airport Transfer',
      rating: 5,
      text: 'Landed at Chennai airport at 2 AM after a delayed flight. The South Zoom driver was tracking my flight and was waiting right outside arrivals. Smooth ride to Adyar in 40 minutes. Fixed fare, no surge!',
      active: true,
      display_order: 3,
    },
    {
      customer_name: 'Priya Shankar',
      city: 'Mysuru',
      trip_type: 'Tour Package',
      rating: 5,
      text: 'Booked the 3-day Wayanad package for our anniversary. Everything from homestay to jeep safari at Muthanga was arranged perfectly. Our driver doubled as a local guide and took us to hidden waterfalls!',
      active: true,
      display_order: 4,
    },
    {
      customer_name: 'Mohammed Irfan',
      city: 'Bengaluru',
      trip_type: 'Corporate Travel',
      rating: 4,
      text: 'Our startup uses South Zoom for all employee airport transfers and client pickups. Monthly billing with proper GST invoices saves our accounts team hours of work.',
      active: true,
      display_order: 5,
    },
    {
      customer_name: 'Deepa Raghavan',
      city: 'Coimbatore',
      trip_type: 'Pilgrimage Tour',
      rating: 5,
      text: 'Organised the Navagraha temple circuit for my parents — 6 senior citizens. South Zoom provided a Tempo Traveller with extra comfortable seats. The driver knew every temple’s darshan timing.',
      active: true,
      display_order: 6,
    },
  ];
  await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('testimonials').insert(testimonials);

  // 3. FAQS
  console.log('Inserting FAQs...');
  const faqs = [
    {
      question: 'How is the fare calculated for outstation trips?',
      answer: 'Outstation fares use a transparent per-km rate with a daily minimum running distance (usually 250km/day), plus driver allowance (bata), tolls and state permits. Every component is shown upfront before you confirm.',
      category: 'Pricing',
      active: true,
      display_order: 1,
    },
    {
      question: 'Can I book a vehicle without paying in advance?',
      answer: 'Yes! Most local and standard routes support pay-on-arrival or pay-to-driver. Peak-season and multi-day custom tour packages require a standard 30% advance to block the vehicle.',
      category: 'Booking',
      active: true,
      display_order: 2,
    },
    {
      question: 'Do your tour packages include hotels and meals?',
      answer: 'Yes, tour packages include verified stays, private vehicle transfers, and listed sightseeing. Selected packages also include complimentary breakfast and dinner.',
      category: 'Packages',
      active: true,
      display_order: 3,
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Vehicle bookings can be cancelled free of charge up to 2 hours before pickup. Hotel and custom holiday package cancellations depend on property cancellation terms.',
      category: 'Cancellation',
      active: true,
      display_order: 4,
    },
    {
      question: 'Do you provide GST invoices for corporate travel?',
      answer: 'Yes. All bookings can generate GST compliant invoices. Corporate accounts also get monthly consolidated billing and dedicated dispatch managers.',
      category: 'General',
      active: true,
      display_order: 5,
    },
    {
      question: 'Are your drivers verified and badge-holding?',
      answer: 'All South Zoom drivers undergo police verification, background checks, badge verification, and regular route training across South Indian ghats and highways.',
      category: 'Fleet',
      active: true,
      display_order: 6,
    },
  ];
  await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('faqs').insert(faqs);

  // 4. GALLERY
  console.log('Inserting Gallery...');
  const gallery = [
    {
      image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Meenakshi Temple gopuram in Madurai',
      category: 'Tamil Nadu',
      active: true,
      display_order: 1,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Houseboats in Alleppey backwaters, Kerala',
      category: 'Kerala',
      active: true,
      display_order: 2,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1600100397608-f010f4438b4d?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Stone chariot and ruins in Hampi, Karnataka',
      category: 'Karnataka',
      active: true,
      display_order: 3,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
      alt_text: 'French colonial quarters in Pondicherry',
      category: 'Puducherry',
      active: true,
      display_order: 4,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Goa palm fringed beaches at sunset',
      category: 'Goa',
      active: true,
      display_order: 5,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      alt_text: 'South Zoom Innova Crysta and fleet on tour',
      category: 'Vehicles',
      active: true,
      display_order: 6,
    },
  ];
  await supabase.from('gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('gallery').insert(gallery);

  // 5. DESTINATIONS
  console.log('Inserting Destinations...');
  const destinations = [
    {
      name: 'Ooty & Nilgiris',
      state: 'Tamil Nadu',
      slug: 'ooty',
      description: 'Queen of Hill Stations featuring tea gardens, botanical gardens, and the Nilgiri Mountain Railway.',
      image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Munnar',
      state: 'Kerala',
      slug: 'munnar',
      description: 'Rolling hills blanketed in emerald tea plantations, misty viewpoints and waterfalls.',
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Coorg (Kodagu)',
      state: 'Karnataka',
      slug: 'coorg',
      description: 'Scotland of India — famous for coffee plantations, Abbey Falls, and Raja’s Seat.',
      image_url: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Hampi',
      state: 'Karnataka',
      slug: 'hampi',
      description: 'UNESCO World Heritage Site with mesmerizing 14th-century Vijayanagara empire ruins.',
      image_url: 'https://images.unsplash.com/photo-1600100397608-f010f4438b4d?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Alleppey (Alappuzha)',
      state: 'Kerala',
      slug: 'alleppey',
      description: 'Venice of the East with tranquil backwaters, village canals, and luxury houseboat cruises.',
      image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Gokarna',
      state: 'Karnataka',
      slug: 'gokarna',
      description: 'Sacred temple town with breathtaking Om Beach, Kudle Beach and cliff treks.',
      image_url: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Pondicherry (Puducherry)',
      state: 'Puducherry',
      slug: 'pondicherry',
      description: 'French colonial seaside promenade, pastel villas, Auroville, and chic cafes.',
      image_url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Madurai',
      state: 'Tamil Nadu',
      slug: 'madurai',
      description: 'Cultural capital of Tamil Nadu, home to the world-renowned Meenakshi Amman Temple.',
      image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Goa',
      state: 'Goa',
      slug: 'goa',
      description: 'Golden beaches, Portuguese heritage churches, spice plantations, and nightlife.',
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Tirupati',
      state: 'Andhra Pradesh',
      slug: 'tirupati',
      description: 'Sacred abode of Lord Venkateswara at Tirumala hills, drawing millions of pilgrims.',
      image_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
  ];
  await supabase.from('destinations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { data: insertedDests } = await supabase.from('destinations').insert(destinations).select('id, slug');

  const destMap = {};
  if (insertedDests) {
    insertedDests.forEach(d => { destMap[d.slug] = d.id; });
  }

  // 6. TOUR PACKAGES
  console.log('Inserting Tour Packages...');
  const tourPackages = [
    {
      title: 'Ooty & Coonoor Escape',
      slug: 'ooty-coonoor-escape',
      destination_id: destMap['ooty'] || null,
      category: 'Hill Station',
      nights: 2,
      days: 3,
      price_from: 8999,
      main_image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
      highlights: ['Botanical Garden', 'Nilgiri Toy Train', 'Doddabetta Peak', 'Tea Factory Visit', 'Pykara Lake'],
      active: true,
      featured: true,
      display_order: 1,
    },
    {
      title: 'Munnar Tea Trails & Wildlife',
      slug: 'munnar-tea-trails',
      destination_id: destMap['munnar'] || null,
      category: 'Hill Station',
      nights: 3,
      days: 4,
      price_from: 12499,
      main_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      highlights: ['Tea Museum', 'Eravikulam National Park', 'Mattupetty Dam', 'Top Station Viewpoint'],
      active: true,
      featured: true,
      display_order: 2,
    },
    {
      title: 'Coorg Nature & Coffee Retreat',
      slug: 'coorg-nature-retreat',
      destination_id: destMap['coorg'] || null,
      category: 'Nature',
      nights: 2,
      days: 3,
      price_from: 7999,
      main_image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80',
      highlights: ['Abbey Falls', 'Coffee Estate Walk', 'Dubare Elephant Camp', 'Raja’s Seat', 'Golden Temple'],
      active: true,
      featured: true,
      display_order: 3,
    },
    {
      title: 'Alleppey Backwater Cruise Stay',
      slug: 'alleppey-backwater-cruise',
      destination_id: destMap['alleppey'] || null,
      category: 'Backwater',
      nights: 1,
      days: 2,
      price_from: 9999,
      main_image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      highlights: ['Deluxe Houseboat Stay', 'Sunset Cruise', 'Village Canal Canoe Ride', 'Kerala Traditional Meals'],
      active: true,
      featured: true,
      display_order: 4,
    },
    {
      title: 'Hampi Ruins & Heritage Exploration',
      slug: 'hampi-ruins-exploration',
      destination_id: destMap['hampi'] || null,
      category: 'Heritage',
      nights: 2,
      days: 3,
      price_from: 8499,
      main_image: 'https://images.unsplash.com/photo-1600100397608-f010f4438b4d?auto=format&fit=crop&w=800&q=80',
      highlights: ['Stone Chariot', 'Virupaksha Temple', 'Vitthala Temple', 'Sunset at Matanga Hill', 'Coracle Ride'],
      active: true,
      featured: true,
      display_order: 5,
    },
    {
      title: 'Tirupati Divine Balaji Darshan',
      slug: 'tirupati-divine-darshan',
      destination_id: destMap['tirupati'] || null,
      category: 'Pilgrimage',
      nights: 2,
      days: 3,
      price_from: 8499,
      main_image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
      highlights: ['VIP Balaji Darshan', 'Padmavathi Temple', 'Kalyana Katta', 'Private AC Transfer'],
      active: true,
      featured: true,
      display_order: 6,
    },
  ];
  await supabase.from('tour_packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tour_packages').insert(tourPackages);

  // 7. HOTELS & ROOMS
  console.log('Inserting Hotels...');
  const hotels = [
    {
      name: 'Hillview Mountain Resort',
      city: 'Ooty',
      destination_id: destMap['ooty'] || null,
      star_rating: 4,
      description: 'Peaceful valley-facing resort surrounded by pine forests and Nilgiri tea estates.',
      main_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
    },
    {
      name: "Coorg Planter's Luxury Homestay",
      city: 'Coorg',
      destination_id: destMap['coorg'] || null,
      star_rating: 4,
      description: 'Authentic Kodava plantation stay with bonfires, nature trails and home-cooked meals.',
      main_image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
    },
    {
      name: 'Backwater Wave Resort & Spa',
      city: 'Alleppey',
      destination_id: destMap['alleppey'] || null,
      star_rating: 4,
      description: 'Lakeside cottages overlooking Punnamada lake with Ayurvedic massage center.',
      main_image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
    },
    {
      name: 'Bengaluru Grand Executive Suites',
      city: 'Bengaluru',
      star_rating: 5,
      description: 'Luxury business and family hotel near Electronic City and Koramangala.',
      main_image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
    },
    {
      name: 'Mysuru Heritage Palace Inn',
      city: 'Mysuru',
      star_rating: 4,
      description: 'Heritage royal architecture stay within walking distance to Mysore Palace.',
      main_image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
    },
  ];
  await supabase.from('hotels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { data: insertedHotels } = await supabase.from('hotels').insert(hotels).select('id, name');

  if (insertedHotels) {
    console.log('Inserting Hotel Rooms...');
    const hotelRooms = [];
    insertedHotels.forEach(h => {
      hotelRooms.push(
        { hotel_id: h.id, room_type: 'Standard Deluxe Room', price_per_night: 3200, capacity_adults: 2, capacity_children: 1, amenities: ['Free Wi-Fi', 'Breakfast', 'AC', 'TV'], active: true },
        { hotel_id: h.id, room_type: 'Executive Valley Suite', price_per_night: 4800, capacity_adults: 3, capacity_children: 2, amenities: ['Balcony View', 'Jacuzzi', 'Breakfast', 'King Bed'], active: true }
      );
    });
    await supabase.from('hotel_rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('hotel_rooms').insert(hotelRooms);
  }

  // 8. FLEETS
  console.log('Inserting Fleets...');
  const fleets = [
    { id: 'fleet_hatchback', name: 'Maruti WagonR / Tiago (Hatchback)', category: 'Hatchback', seats: 4, luggage: 2, price_per_km: 12, available: true, ac: true },
    { id: 'fleet_sedan', name: 'Swift Dzire / Etios (Sedan)', category: 'Sedan', seats: 4, luggage: 3, price_per_km: 14, available: true, ac: true },
    { id: 'fleet_small_suv', name: 'Maruti Ertiga (Small SUV)', category: 'Small SUV', seats: 6, luggage: 4, price_per_km: 18, available: true, ac: true },
    { id: 'fleet_big_suv', name: 'Toyota Innova Crysta (Big SUV)', category: 'SUV', seats: 7, luggage: 5, price_per_km: 21, available: true, ac: true },
    { id: 'fleet_tempo_12', name: 'Force Tempo Traveller (12 Seater)', category: 'Tempo Traveller', seats: 12, luggage: 10, price_per_km: 24, available: true, ac: true },
    { id: 'fleet_tempo_17', name: 'Force Tempo Traveller (17 Seater)', category: 'Tempo Traveller', seats: 17, luggage: 14, price_per_km: 26, available: true, ac: true },
    { id: 'fleet_urbania', name: 'Force Urbania (14 Seater Luxury Van)', category: 'Luxury', seats: 14, luggage: 12, price_per_km: 28, available: true, ac: true },
    { id: 'fleet_bus', name: 'Luxury Tourist Coach Bus (35 Seater)', category: 'Minibus', seats: 35, luggage: 25, price_per_km: 38, available: true, ac: true },
    { id: 'fleet_bmw', name: 'BMW 5 Series / Mercedes (VIP)', category: 'Luxury', seats: 4, luggage: 3, price_per_km: 45, available: true, ac: true },
  ];
  await supabase.from('fleets').delete().neq('id', 'placeholder');
  await supabase.from('fleets').upsert(fleets);

  // 9. SERVICES
  console.log('Inserting Services...');
  const services = [
    { name: 'Local Taxi Rental', slug: 'local-taxi', short_description: 'Hourly and full-day city cabs with waiting time included.', full_description: 'Comfortable city travel in Bengaluru, Chennai, Coimbatore, and Mysuru with flexible hourly rental packages (4hr/40km, 8hr/80km).', icon: '🚕', active: true, display_order: 1 },
    { name: 'Outstation Cabs', slug: 'outstation-trips', short_description: 'One-way and round trips with transparent per-km pricing.', full_description: 'Intercity travel across South India with door-to-door pickup, verified drivers, zero return fare on one-way trips, and transparent billing.', icon: '🛣️', active: true, display_order: 2 },
    { name: 'Airport Transfers', slug: 'airport-transfers', short_description: 'Fixed fares, flight tracking and meet-and-greet pickups.', full_description: 'Punctual airport pickups and drops for Kempegowda Bengaluru Airport (BLR), Chennai (MAA), Coimbatore (CJB), and Kochi (COK).', icon: '✈️', active: true, display_order: 3 },
    { name: 'Corporate Travel', slug: 'corporate-travel', short_description: 'Employee transport and monthly billing with GST invoices.', full_description: 'End-to-end transport solutions for tech companies, corporate delegations, monthly staff transit with dedicated account managers.', icon: '💼', active: true, display_order: 4 },
    { name: 'Group & Event Travel', slug: 'group-travel', short_description: 'Tempo travellers and buses for 12 to 50 passengers.', full_description: 'Large family weddings, college reunions, school excursions, and office offsites with convoy coordination.', icon: '👥', active: true, display_order: 5 },
    { name: 'Pilgrimage Temple Circuits', slug: 'pilgrimage-tours', short_description: 'Temple circuits with darshan planning and local guides.', full_description: 'Navagraha, Murugan, Tirupati Balaji, Madurai Meenakshi, and Kukke Subramanya guided pilgrimage transport.', icon: '🛕', active: true, display_order: 6 },
  ];
  await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('services').insert(services);

  // 10. ROUTES
  console.log('Inserting Outstation Routes...');
  const routes = [
    { origin: 'Bengaluru', destination: 'Mysuru', distance_km: 145, estimated_duration: '3 hrs', active: true },
    { origin: 'Bengaluru', destination: 'Ooty', distance_km: 275, estimated_duration: '6.5 hrs', active: true },
    { origin: 'Bengaluru', destination: 'Coorg', distance_km: 250, estimated_duration: '5.5 hrs', active: true },
    { origin: 'Bengaluru', destination: 'Chikkamagaluru', distance_km: 245, estimated_duration: '5 hrs', active: true },
    { origin: 'Bengaluru', destination: 'Hampi', distance_km: 340, estimated_duration: '7 hrs', active: true },
    { origin: 'Bengaluru', destination: 'Chennai', distance_km: 345, estimated_duration: '6.5 hrs', active: true },
    { origin: 'Bengaluru', destination: 'Tirupati', distance_km: 250, estimated_duration: '5 hrs', active: true },
    { origin: 'Bengaluru', destination: 'Pondicherry', distance_km: 310, estimated_duration: '6.5 hrs', active: true },
    { origin: 'Bengaluru', destination: 'Gokarna', distance_km: 485, estimated_duration: '9 hrs', active: true },
    { origin: 'Chennai', destination: 'Pondicherry', distance_km: 155, estimated_duration: '3.5 hrs', active: true },
    { origin: 'Coimbatore', destination: 'Ooty', distance_km: 88, estimated_duration: '3 hrs', active: true },
  ];
  await supabase.from('routes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('routes').insert(routes);

  // 11. DRIVERS
  console.log('Inserting Verified Drivers...');
  const drivers = [
    { name: 'Mohan Kumar S.', phone: '+91 98450 12345', whatsapp: '919845012345', email: 'mohan@southzoom.com', license_number: 'KA0420150001234', license_expiry: '2028-06-30', experience_years: 12, status: 'Available', rating: 4.95 },
    { name: 'Senthil Nathan R.', phone: '+91 97890 54321', whatsapp: '919789054321', email: 'senthil@southzoom.com', license_number: 'TN0720180005678', license_expiry: '2027-11-15', experience_years: 9, status: 'Available', rating: 4.90 },
    { name: 'Manjunath Gowda', phone: '+91 99000 87654', whatsapp: '919900087654', email: 'manju@southzoom.com', license_number: 'KA0120120009876', license_expiry: '2029-03-20', experience_years: 15, status: 'Available', rating: 4.98 },
    { name: 'Vigneshwaran P.', phone: '+91 94440 11223', whatsapp: '919444011223', email: 'vicky@southzoom.com', license_number: 'TN0920190004321', license_expiry: '2027-08-10', experience_years: 7, status: 'Available', rating: 4.85 },
  ];
  await supabase.from('drivers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('drivers').insert(drivers);

  // 12. WEBSITE SETTINGS
  console.log('Inserting Website Settings...');
  const settings = [
    {
      key: 'contact_settings',
      value: {
        company_name: 'South Zoom Tourism',
        phone: '+91 6366357757',
        whatsapp: '916366357757',
        email: 'bookings@southzoomtourism.com',
        address: 'South Zoom Tourism, #8, Srinivasa Building, Anchepalya Main Road, TG Halli, Bengaluru – 560073, Karnataka.',
        google_maps_url: 'https://maps.google.com/?q=Anchepalya+Bengaluru',
        business_hours: 'Mon – Sun · 24×7 Service',
        support_hours: '24×7 On-Trip Support Helpline',
        facebook_url: 'https://facebook.com/southzoomtourism',
        instagram_url: 'https://instagram.com/southzoomtourism',
        youtube_url: 'https://youtube.com/southzoomtourism',
      },
    },
    {
      key: 'general_settings',
      value: {
        website_name: 'South Zoom Tourism',
        tagline: "Bengaluru's Premier South India Travel & Cab Desk",
        logo_url: '',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        business_hours: 'Mon – Sun · 24×7 Service',
        support_email: 'bookings@southzoomtourism.com',
      },
    },
    {
      key: 'payment_settings',
      value: {
        upi_id: 'southzoom@upi',
        account_holder: 'South Zoom Tourism Pvt Ltd',
        bank_name: 'HDFC Bank',
        account_number: '50200088991234',
        ifsc_code: 'HDFC0001234',
        qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=southzoom@upi&pn=SouthZoomTourism',
        payment_instructions: 'Please pay the 30% advance via UPI (GPay/PhonePe/Paytm) or Bank Transfer and share the receipt on WhatsApp (+91 6366357757) with your Booking Number.',
        advance_percentage: 30,
      },
    },
    {
      key: 'booking_settings',
      value: {
        booking_id_prefix: 'SZT',
        advance_percentage: 30,
        gst_percentage: 5,
        minimum_booking_amount: 500,
        cancellation_policy: 'Cancellations made 24 hours prior to departure are eligible for a 100% refund of the advance paid. Same-day cancellations within 4 hours of departure will incur a nominal 10% driver-dispatch fee.',
        auto_confirm: false,
        max_passengers: 50,
      },
    },
  ];
  await supabase.from('website_settings').upsert(settings);

  console.log('✅ ALL SOUTH ZOOM TOURISM CONTENT SEEDED INTO SUPABASE SUCCESSFULLY!');
}

seed().catch(err => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
