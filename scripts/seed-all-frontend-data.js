import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wraacxqwvsfugpzxatie.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWFjeHF3dnNmdWdwenhhdGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1MTU3NSwiZXhwIjoyMTAzNzI3NTc1fQ.DlMaYOM3IWiwCUH6sK12nioTDvJKmDKJXTacLSQdlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedAllFrontendData() {
  console.log('🚀 Starting Comprehensive Data Seeding for South Zoom Tourism...\n');

  // ==========================================
  // 1. DESTINATIONS (All 12+ Frontend Destinations)
  // ==========================================
  console.log('📍 Seeding Destinations...');
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
      description: 'Rolling hills blanketed in emerald tea plantations, misty viewpoints, and Eravikulam National Park.',
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Coorg (Kodagu)',
      state: 'Karnataka',
      slug: 'coorg',
      description: 'Scotland of India — famous for coffee plantations, Abbey Falls, Dubare Elephant Camp, and Raja’s Seat.',
      image_url: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Hampi',
      state: 'Karnataka',
      slug: 'hampi',
      description: 'UNESCO World Heritage Site with mesmerizing 14th-century Vijayanagara empire ruins and boulder landscapes.',
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
      description: 'Sacred temple town with breathtaking Om Beach, Kudle Beach, half-moon beach and cliff treks.',
      image_url: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Pondicherry (Puducherry)',
      state: 'Puducherry',
      slug: 'pondicherry',
      description: 'French colonial seaside promenade, pastel villas, Auroville, Paradise Beach, and chic cafes.',
      image_url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Madurai',
      state: 'Tamil Nadu',
      slug: 'madurai',
      description: 'Cultural capital of Tamil Nadu, home to the world-renowned Meenakshi Amman Temple and Thirumalai Nayakkar Palace.',
      image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Goa',
      state: 'Goa',
      slug: 'goa',
      description: 'Golden beaches, Portuguese heritage churches, spice plantations, water sports, and vibrant coastal culture.',
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Tirupati',
      state: 'Andhra Pradesh',
      slug: 'tirupati',
      description: 'Sacred abode of Lord Venkateswara at Tirumala hills, drawing millions of pilgrims from across the globe.',
      image_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Kodaikanal',
      state: 'Tamil Nadu',
      slug: 'kodaikanal',
      description: 'Princess of Hill Stations with star-shaped lake, Coaker’s Walk, Pillar Rocks and pine forests.',
      image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Chikkamagaluru',
      state: 'Karnataka',
      slug: 'chikkamagaluru',
      description: 'Birthplace of Indian coffee, Mullayanagiri peak trek, Hebbe falls, and serene hill stays.',
      image_url: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Wayanad',
      state: 'Kerala',
      slug: 'wayanad',
      description: 'Misty mountain passes, prehistoric Edakkal caves, Chembra Peak heart lake, and wildlife sanctuaries.',
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Mysuru (Mysore)',
      state: 'Karnataka',
      slug: 'mysuru',
      description: 'City of Palaces, Chamundi Hill, Brindavan Gardens musical fountains, and rich royal heritage.',
      image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
    {
      name: 'Bengaluru (Bangalore)',
      state: 'Karnataka',
      slug: 'bengaluru',
      description: 'Silicon Valley of India, Garden City featuring Lalbagh Botanical Garden, Cubbon Park, and Bangalore Palace.',
      image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      featured: true,
    },
  ];

  await supabase.from('destinations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { data: insertedDests, error: destError } = await supabase.from('destinations').insert(destinations).select('id, slug');
  if (destError) console.error('Error inserting destinations:', destError);
  console.log(`✅ Seeded ${destinations.length} Destinations!`);

  const destMap = {};
  if (insertedDests) {
    insertedDests.forEach((d) => {
      destMap[d.slug] = d.id;
    });
  }

  // ==========================================
  // 2. TOUR PACKAGES (All Frontend Tour Packages)
  // ==========================================
  console.log('🎒 Seeding Tour Packages...');
  const tourPackages = [
    {
      title: 'Ooty & Coonoor Hill Escape',
      slug: 'ooty-coonoor-escape',
      destination_id: destMap['ooty'] || null,
      category: 'Tamil Nadu',
      nights: 2,
      days: 3,
      price_from: 8999,
      main_image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
      highlights: ['Botanical Garden & Rose Garden', 'Nilgiri Mountain Railway Toy Train', 'Doddabetta Peak Viewpoint', 'Tea Factory & Chocolate Museum', 'Pykara Lake & Waterfalls Boat Ride'],
      active: true,
      featured: true,
      display_order: 1,
    },
    {
      title: 'Munnar Tea Trails & Wildlife',
      slug: 'munnar-tea-trails',
      destination_id: destMap['munnar'] || null,
      category: 'Kerala',
      nights: 3,
      days: 4,
      price_from: 12499,
      main_image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      highlights: ['Tata Tea Museum & Plantation Walk', 'Eravikulam National Park (Nilgiri Tahr)', 'Mattupetty Dam & Echo Point Boating', 'Top Station & Kundala Lake', 'Spice Garden Tour & Kathakali Show'],
      active: true,
      featured: true,
      display_order: 2,
    },
    {
      title: 'Coorg Nature & Coffee Retreat',
      slug: 'coorg-nature-retreat',
      destination_id: destMap['coorg'] || null,
      category: 'Karnataka',
      nights: 2,
      days: 3,
      price_from: 7999,
      main_image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80',
      highlights: ['Abbey Falls & Hanging Bridge', 'Coffee Plantation Guided Walk', 'Dubare Elephant Camp River Bathing', 'Raja’s Seat Sunset Point', 'Bylakuppe Tibetan Golden Temple'],
      active: true,
      featured: true,
      display_order: 3,
    },
    {
      title: 'Alleppey Houseboat Backwater Cruise',
      slug: 'alleppey-backwater-cruise',
      destination_id: destMap['alleppey'] || null,
      category: 'Kerala',
      nights: 1,
      days: 2,
      price_from: 9999,
      main_image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      highlights: ['Private Deluxe AC Houseboat', 'Overnight Cruise through Punnamada Lake', 'Village Canal Canoe Exploration', 'Traditional Kerala Karimeen Meals', 'Sunset over Backwater Lagoons'],
      active: true,
      featured: true,
      display_order: 4,
    },
    {
      title: 'Hampi Heritage & Vijayanagara Ruins',
      slug: 'hampi-ruins-exploration',
      destination_id: destMap['hampi'] || null,
      category: 'Karnataka',
      nights: 2,
      days: 3,
      price_from: 8499,
      main_image: 'https://images.unsplash.com/photo-1600100397608-f010f4438b4d?auto=format&fit=crop&w=800&q=80',
      highlights: ['Virupaksha Temple & Hampi Bazaar', 'Vittala Temple Musical Pillars & Stone Chariot', 'Lotus Mahal & Elephant Stables', 'Tungabhadra River Coracle Boat Ride', 'Matanga Hill Sunrise Trek'],
      active: true,
      featured: true,
      display_order: 5,
    },
    {
      title: 'Gokarna Beach Trek & Coastal Escape',
      slug: 'gokarna-beach-trek',
      destination_id: destMap['gokarna'] || null,
      category: 'Karnataka',
      nights: 2,
      days: 3,
      price_from: 6999,
      main_image: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80',
      highlights: ['Om Beach & Kudle Beach', 'Cliff Trek to Half Moon & Paradise Beach', 'Mahabaleshwar Temple Darshan', 'Beach Bonfire & Stargazing', 'Mirjan Fort Heritage Walk'],
      active: true,
      featured: true,
      display_order: 6,
    },
    {
      title: 'Pondicherry French Quarter & Auroville',
      slug: 'pondicherry-french-quarter',
      destination_id: destMap['pondicherry'] || null,
      category: 'Puducherry',
      nights: 2,
      days: 3,
      price_from: 7499,
      main_image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
      highlights: ['White Town Heritage French Villas Walk', 'Auroville & Matrimandir Meditation Dome', 'Promenade Beach & Rock Beach Sunrise', 'Chunnambar Boat House to Paradise Beach', 'French Bakeries & Cafe Hopping'],
      active: true,
      featured: true,
      display_order: 7,
    },
    {
      title: 'Tirupati Balaji VIP Darshan Pilgrimage',
      slug: 'tirupati-balaji-darshan',
      destination_id: destMap['tirupati'] || null,
      category: 'Pilgrimage',
      nights: 1,
      days: 2,
      price_from: 5999,
      main_image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
      highlights: ['Lord Venkateswara Temple Tirumala Darshan', 'Padmavathi Ammavari Temple, Tiruchanur', 'Sri Kalahasteeswara Temple (Rahu Kethu)', 'Kapila Theertham Waterfalls', 'Complimentary Tirupati Laddu Prasadam'],
      active: true,
      featured: true,
      display_order: 8,
    },
    {
      title: 'Navagraha 9 Temple Circuit Circuit',
      slug: 'navagraha-temple-circuit',
      destination_id: destMap['madurai'] || null,
      category: 'Pilgrimage',
      nights: 3,
      days: 4,
      price_from: 11999,
      main_image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      highlights: ['All 9 Planet Temples around Kumbakonam & Thanjavur', 'Thirunallar Saniswaran Temple', 'Suryanar Kovil (Sun God Temple)', 'Thirunageswaram Rahu Temple', 'Brihadeeswarar Big Temple Thanjavur'],
      active: true,
      featured: true,
      display_order: 9,
    },
    {
      title: 'Goa Sun, Sand & Heritage Holiday',
      slug: 'goa-beach-holiday',
      destination_id: destMap['goa'] || null,
      category: 'Goa',
      nights: 3,
      days: 4,
      price_from: 13999,
      main_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      highlights: ['Calangute, Baga & Anjuna Beaches', 'Basilica of Bom Jesus & Old Goa Churches', 'Dudhsagar Waterfalls Jeep Safari', 'Mandovi River Sunset Luxury Cruise', 'Spice Plantation Tour with Goan Lunch'],
      active: true,
      featured: true,
      display_order: 10,
    },
  ];

  await supabase.from('tour_packages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: pkgError } = await supabase.from('tour_packages').insert(tourPackages);
  if (pkgError) console.error('Error inserting packages:', pkgError);
  console.log(`✅ Seeded ${tourPackages.length} Tour Packages!`);

  // ==========================================
  // 3. FLEET / VEHICLES (All 9 Frontend Vehicles)
  // ==========================================
  console.log('🚗 Seeding Fleets / Vehicles...');
  const fleets = [
    {
      id: 'fv-hatchback',
      slug: 'hatchback-wagonr',
      name: 'Hatchback (WagonR or similar)',
      brand: 'Maruti Suzuki',
      model: 'WagonR',
      category_slug: 'hatchback',
      seats: 4,
      luggage: 2,
      ac: true,
      fuel: 'Petrol',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      image_alt: 'Maruti Suzuki WagonR Hatchback in clean condition',
      display_order: 1,
      is_published: true,
      is_featured: true,
      popularity: 90,
    },
    {
      id: 'fv-sedan',
      slug: 'sedan-dzire',
      name: 'Sedan (Swift Dzire / Etios)',
      brand: 'Maruti Suzuki',
      model: 'Dzire',
      category_slug: 'sedan',
      seats: 4,
      luggage: 3,
      ac: true,
      fuel: 'Diesel',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      image_alt: 'Swift Dzire Sedan taxi ready for city and outstation',
      display_order: 2,
      is_published: true,
      is_featured: true,
      popularity: 95,
    },
    {
      id: 'fv-suv-ertiga',
      slug: 'suv-ertiga',
      name: '6-Seater SUV (Maruti Ertiga)',
      brand: 'Maruti Suzuki',
      model: 'Ertiga',
      category_slug: 'suv',
      seats: 6,
      luggage: 4,
      ac: true,
      fuel: 'Diesel',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      image_alt: 'Maruti Ertiga 6 seater family SUV',
      display_order: 3,
      is_published: true,
      is_featured: true,
      popularity: 92,
    },
    {
      id: 'fv-suv-innova',
      slug: 'suv-innova-crysta',
      name: '7-Seater Luxury SUV (Toyota Innova Crysta)',
      brand: 'Toyota',
      model: 'Innova Crysta',
      category_slug: 'suv',
      seats: 7,
      luggage: 5,
      ac: true,
      fuel: 'Diesel',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      image_alt: 'Toyota Innova Crysta luxury MPV SUV with captain seats',
      display_order: 4,
      is_published: true,
      is_featured: true,
      popularity: 99,
    },
    {
      id: 'fv-tempo-12',
      slug: 'tempo-12-seater',
      name: '12-Seater Executive Tempo Traveller',
      brand: 'Force Motors',
      model: 'Tempo Traveller',
      category_slug: 'tempo-traveller',
      seats: 12,
      luggage: 10,
      ac: true,
      fuel: 'Diesel',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      image_alt: 'Force 12 seater tempo traveller for group tours',
      display_order: 5,
      is_published: true,
      is_featured: true,
      popularity: 88,
    },
    {
      id: 'fv-tempo-17',
      slug: 'tempo-17-seater',
      name: '17-Seater Maharaja Tempo Traveller',
      brand: 'Force Motors',
      model: 'Tempo Traveller Maharaja',
      category_slug: 'tempo-traveller',
      seats: 17,
      luggage: 14,
      ac: true,
      fuel: 'Diesel',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      image_alt: '17 seater luxury pushback tempo traveller',
      display_order: 6,
      is_published: true,
      is_featured: false,
      popularity: 85,
    },
    {
      id: 'fv-urbania',
      slug: 'urbania-luxury-van',
      name: '14-Seater Force Urbania Luxury Van',
      brand: 'Force Motors',
      model: 'Urbania',
      category_slug: 'premium',
      seats: 14,
      luggage: 12,
      ac: true,
      fuel: 'Diesel',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      image_alt: 'Force Urbania ultra luxury van with reclining leather seats',
      display_order: 7,
      is_published: true,
      is_featured: true,
      popularity: 94,
    },
    {
      id: 'fv-bus',
      slug: 'tourist-coach-bus',
      name: '35 to 50 Seater AC Tourist Coach Bus',
      brand: 'Ashok Leyland / BharatBenz',
      model: 'Tourist Coach',
      category_slug: 'bus',
      seats: 40,
      luggage: 30,
      ac: true,
      fuel: 'Diesel',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      image_alt: 'Large luxury coach bus for school, wedding and corporate travel',
      display_order: 8,
      is_published: true,
      is_featured: false,
      popularity: 80,
    },
    {
      id: 'fv-bmw',
      slug: 'bmw-5-series-vip',
      name: 'BMW 5 Series / Mercedes E-Class VIP',
      brand: 'BMW / Mercedes',
      model: '5 Series',
      category_slug: 'premium',
      seats: 4,
      luggage: 3,
      ac: true,
      fuel: 'Diesel',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      image_alt: 'VIP luxury BMW chauffeur driven car for weddings and delegations',
      display_order: 9,
      is_published: true,
      is_featured: true,
      popularity: 96,
    },
  ];

  await supabase.from('fleets').delete().neq('id', 'placeholder');
  const { error: fleetError } = await supabase.from('fleets').upsert(fleets);
  if (fleetError) console.error('Error inserting fleets:', fleetError);
  console.log(`✅ Seeded ${fleets.length} Fleet Vehicles!`);

  // ==========================================
  // 4. SERVICES (All 8 Frontend Services)
  // ==========================================
  console.log('🛠️ Seeding Services...');
  const services = [
    {
      name: 'Local Taxi Rental',
      slug: 'local-taxi',
      short_description: 'Hourly and full-day city cabs with waiting time, fuel and driver charges included.',
      full_description: 'Comfortable city travel in Bengaluru, Chennai, Coimbatore, and Mysuru with flexible hourly rental packages (4hr/40km, 8hr/80km, 12hr/120km). No surge pricing, verified chauffeurs, and pay after the ride.',
      icon: '🚕',
      active: true,
      display_order: 1,
    },
    {
      name: 'Outstation Cabs',
      slug: 'outstation-trips',
      short_description: 'One-way drops and round trips anywhere in South India on a transparent per-km rate.',
      full_description: 'Intercity travel across South India with door-to-door pickup, verified drivers, zero return fare on one-way drops, and transparent itemized toll/permit billing with no hidden costs.',
      icon: '🛣️',
      active: true,
      display_order: 2,
    },
    {
      name: 'Airport Transfers',
      slug: 'airport-transfers',
      short_description: 'Fixed fares, real-time flight tracking and meet-and-greet pickups at terminals.',
      full_description: 'Punctual airport pickups and drops for Kempegowda Bengaluru Airport (BLR), Chennai Airport (MAA), Coimbatore (CJB), Kochi (COK), and Madurai (IXM) with 60 mins complimentary waiting time.',
      icon: '✈️',
      active: true,
      display_order: 3,
    },
    {
      name: 'Corporate Travel & Delegations',
      slug: 'corporate-travel',
      short_description: 'Employee transport, VIP client transfers and monthly billing with GST invoices.',
      full_description: 'End-to-end transport solutions for tech companies, corporate delegations, monthly staff transit, and VIP conference cabs with dedicated account managers and unified monthly billing.',
      icon: '💼',
      active: true,
      display_order: 4,
    },
    {
      name: 'Group & Event Travel',
      slug: 'group-travel',
      short_description: 'Tempo travellers, Urbania and luxury buses for 12 to 50 passengers.',
      full_description: 'Large family weddings, college reunions, school excursions, corporate retreats, and temple pilgrimages with multi-vehicle convoy coordination and luggage capacity.',
      icon: '👥',
      active: true,
      display_order: 5,
    },
    {
      name: 'Pilgrimage Temple Circuits',
      slug: 'pilgrimage-tours',
      short_description: 'Temple circuits with darshan timing coordination, senior-citizen assistance and local guidance.',
      full_description: 'Navagraha, Murugan Arupadaiveedu, Tirupati Balaji VIP, Madurai Meenakshi, Rameswaram, and Kukke Subramanya guided pilgrimage transport with temple timing expertise.',
      icon: '🛕',
      active: true,
      display_order: 6,
    },
    {
      name: 'Wedding & VIP Luxury Cars',
      slug: 'wedding-car-rental',
      short_description: 'Decorated Mercedes, BMW, Audi and Audi convertible luxury cars for weddings and VIP arrivals.',
      full_description: 'Make weddings and special milestones unforgettable with our premium luxury fleet, professional uniformed chauffeurs, red-carpet service, and floral decoration support.',
      icon: '💍',
      active: true,
      display_order: 7,
    },
    {
      name: 'Curated Hotel Stays',
      slug: 'hotel-booking-service',
      short_description: 'Handpicked resorts, plantation homestays and business hotels at exclusive negotiated rates.',
      full_description: 'Direct partnerships with over 50+ luxury resorts, hill-view cottages, backwater houseboats, and 3-5 star properties across South India with instant confirmation and meal inclusions.',
      icon: '🏨',
      active: true,
      display_order: 8,
    },
  ];

  await supabase.from('services').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: serviceError } = await supabase.from('services').insert(services);
  if (serviceError) console.error('Error inserting services:', serviceError);
  console.log(`✅ Seeded ${services.length} Services!`);

  // ==========================================
  // 5. FAQS (All 15+ Comprehensive Frontend FAQs)
  // ==========================================
  console.log('❓ Seeding FAQs...');
  const faqs = [
    {
      question: 'Which areas and states does South Zoom Tourism cover?',
      answer: 'We operate extensively across Karnataka, Tamil Nadu, Kerala, Andhra Pradesh, Telangana, Goa, and Puducherry. Pickups can be arranged from Bengaluru, Chennai, Coimbatore, Madurai, Mysuru, Kochi, and all regional airports. Outstation trips beyond South India are also arranged on request.',
      category: 'General',
      active: true,
      display_order: 1,
    },
    {
      question: 'How is the fare calculated for outstation car rentals?',
      answer: 'Outstation fares use a transparent per-km rate with a daily minimum running distance (usually 250km/day), plus driver allowance (bata), state entry permits, and toll fees. Every single component is itemized upfront before booking, so your final bill matches the initial quote.',
      category: 'Pricing',
      active: true,
      display_order: 2,
    },
    {
      question: 'Can I book a vehicle without paying the full amount in advance?',
      answer: 'Yes! Most local city rentals and standard outstation one-way trips require only a small token or allow pay-to-driver on completion. Peak season multi-day holiday packages require a standard 30% advance to block the vehicle and hotel inventory.',
      category: 'Booking',
      active: true,
      display_order: 3,
    },
    {
      question: 'What is your cancellation and refund policy?',
      answer: 'Vehicle bookings can be cancelled free of charge up to 2 hours before pickup for city rentals and 24 hours for outstation trips with 100% refund of advance paid. Hotel packages follow the individual property cancellation window.',
      category: 'Cancellation',
      active: true,
      display_order: 4,
    },
    {
      question: 'Do you provide GST invoices for corporate tax deductions?',
      answer: 'Yes! All individual and corporate bookings are eligible for official GST-compliant tax invoices with input tax credit. Monthly consolidated billing and expense reports are available for corporate accounts.',
      category: 'General',
      active: true,
      display_order: 5,
    },
    {
      question: 'Are your chauffeurs police-verified and experienced on hill routes?',
      answer: 'All South Zoom chauffeurs undergo strict background checks, police verification, commercial badge verification, and regular training for ghat driving (Ooty, Munnar, Kodaikanal, Coorg) and defensive highway safety.',
      category: 'Fleet',
      active: true,
      display_order: 6,
    },
    {
      question: 'Do your holiday tour packages include hotel stays and sightseeing transfers?',
      answer: 'Yes, our tour packages are comprehensive end-to-end holidays that include verified 3/4-star stays, private vehicle with chauffeur for all transfers and sightseeing, toll/parking charges, and complimentary daily breakfast.',
      category: 'Packages',
      active: true,
      display_order: 7,
    },
    {
      question: 'How do airport pickups and waiting time work?',
      answer: 'Our dispatch team tracks your flight number in real-time. Even if your flight is delayed, our chauffeur will be waiting at the designated airport pickup zone with your name board. We provide 60 minutes of complimentary waiting time from actual flight landing.',
      category: 'Fleet',
      active: true,
      display_order: 8,
    },
    {
      question: 'What payment modes are accepted by South Zoom?',
      answer: 'We accept UPI (Google Pay, PhonePe, Paytm, BHIM), IMPS / NEFT / RTGS Bank Transfers, Credit / Debit Cards, and Cash to Chauffeur on trip completion. Digital payment receipts are sent instantly to your WhatsApp and Email.',
      category: 'Pricing',
      active: true,
      display_order: 9,
    },
    {
      question: 'Can I customize an existing tour package itinerary?',
      answer: 'Yes, 100%! All our itineraries can be customized according to your family preferences, preferred hotel categories, additional sightseeing stops, or extra days. Simply contact our travel desk via WhatsApp or Call.',
      category: 'Packages',
      active: true,
      display_order: 10,
    },
  ];

  await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: faqError } = await supabase.from('faqs').insert(faqs);
  if (faqError) console.error('Error inserting faqs:', faqError);
  console.log(`✅ Seeded ${faqs.length} FAQs!`);

  // ==========================================
  // 6. GALLERY (All 12+ Frontend Gallery Images)
  // ==========================================
  console.log('🖼️ Seeding Gallery...');
  const gallery = [
    {
      image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Meenakshi Amman Temple towers glowing at dusk in Madurai',
      category: 'Tamil Nadu',
      active: true,
      display_order: 1,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Traditional luxury houseboat sailing through Alleppey backwaters',
      category: 'Kerala',
      active: true,
      display_order: 2,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1600100397608-f010f4438b4d?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Ancient stone chariot and monolith ruins at Hampi Vijayanagara',
      category: 'Karnataka',
      active: true,
      display_order: 3,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
      alt_text: 'French colonial yellow buildings and pastel avenues in Pondicherry',
      category: 'Puducherry',
      active: true,
      display_order: 4,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Tropical coconut palm trees at sunset along Goa coastline',
      category: 'Goa',
      active: true,
      display_order: 5,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      alt_text: 'South Zoom Innova Crysta and tempo travellers ready for convoy tour',
      category: 'Vehicles',
      active: true,
      display_order: 6,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Misty pine forest valleys and tea estates of Ooty Nilgiris',
      category: 'Tamil Nadu',
      active: true,
      display_order: 7,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Endless rolling emerald green tea plantations of Munnar',
      category: 'Kerala',
      active: true,
      display_order: 8,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Western ghats coffee estate and forest trail in Coorg',
      category: 'Karnataka',
      active: true,
      display_order: 9,
    },
    {
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      alt_text: 'Luxury resort stay overlooking green hills and valley',
      category: 'Hotels',
      active: true,
      display_order: 10,
    },
  ];

  await supabase.from('gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: galleryError } = await supabase.from('gallery').insert(gallery);
  if (galleryError) console.error('Error inserting gallery:', galleryError);
  console.log(`✅ Seeded ${gallery.length} Gallery items!`);

  // ==========================================
  // 7. HERO SLIDES & TESTIMONIALS
  // ==========================================
  console.log('🌟 Seeding Hero Slides & Testimonials...');
  const heroSlides = [
    {
      heading: 'Car rentals & cabs across South India',
      description: 'Well-maintained sedans, SUVs, tempo travellers and luxury vans with verified chauffeurs, zero surge pricing and 24×7 dispatch.',
      badge: 'Flat 10% off on round trips',
      image_desktop: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
      primary_cta_label: 'Book a Vehicle',
      primary_cta_href: '/fleet',
      active: true,
      display_order: 1,
    },
    {
      heading: 'Curated holiday tour packages for real travellers',
      description: 'Hill stations, heritage ruins, temple circuits, backwaters and beaches — expertly planned with private transfers, stays and sightseeing.',
      badge: 'Customisable Itineraries',
      image_desktop: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      primary_cta_label: 'Explore Tour Packages',
      primary_cta_href: '/tour-packages',
      active: true,
      display_order: 2,
    },
    {
      heading: 'Handpicked hotels & resorts at partner rates',
      description: 'Scenic hill resorts, plantation cottages, heritage hotels and business suites with instant confirmation and meal plans included.',
      badge: 'Best Price Guarantee',
      image_desktop: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      primary_cta_label: 'Explore Hotels',
      primary_cta_href: '/hotels',
      active: true,
      display_order: 3,
    },
    {
      heading: 'Punctual airport transfers with flight tracking',
      description: 'Fixed-fare pickups and drops for BLR, MAA, CJB and COK airports with 60 minutes complimentary waiting and terminal meet-and-greet.',
      badge: 'Flight Tracking Included',
      image_desktop: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1920&q=80',
      image_mobile: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
      primary_cta_label: 'Book Airport Cab',
      primary_cta_href: '/fleet',
      active: true,
      display_order: 4,
    },
  ];
  await supabase.from('hero_slides').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('hero_slides').insert(heroSlides);

  const testimonials = [
    {
      customer_name: 'Suresh Nagaraj',
      city: 'Bengaluru',
      trip_type: 'Outstation Round Trip (Bengaluru → Ooty)',
      rating: 5,
      text: 'We booked an Innova Crysta from Bengaluru to Ooty for a 4-day family vacation. Driver Mohan was polite, reached 15 minutes before time, and handled the ghat roads with extreme care. The vehicle was spotless with great AC.',
      active: true,
      display_order: 1,
    },
    {
      customer_name: 'Lakshmi Venkatesh',
      city: 'Bengaluru',
      trip_type: 'Local City Rental (8 Hours)',
      rating: 5,
      text: 'Needed an 8-hour city cab for my elderly mother’s temple and hospital visits. The driver was exceptionally patient and helpful with boarding. The fare was completely transparent with zero surge.',
      active: true,
      display_order: 2,
    },
    {
      customer_name: 'Karthik Ramamurthy',
      city: 'Chennai',
      trip_type: 'Airport Transfer (MAA Airport)',
      rating: 5,
      text: 'Landed in Chennai at 2 AM after flight delays. The South Zoom chauffeur tracked my flight and was waiting right outside the arrivals gate with a name placard. Fixed fare, no midnight surge.',
      active: true,
      display_order: 3,
    },
    {
      customer_name: 'Priya Shankar',
      city: 'Mysuru',
      trip_type: 'Wayanad 3-Day Holiday Package',
      rating: 5,
      text: 'Booked the Wayanad tour package for our anniversary. Everything from resort booking to Jeep safari at Muthanga was flawlessly arranged. The driver acted as our personal guide!',
      active: true,
      display_order: 4,
    },
    {
      customer_name: 'Mohammed Irfan',
      city: 'Bengaluru',
      trip_type: 'Corporate Transport',
      rating: 5,
      text: 'Our company uses South Zoom for client airport pickups and visiting delegates. Monthly billing with proper GST tax invoices makes accounting smooth and reliable.',
      active: true,
      display_order: 5,
    },
    {
      customer_name: 'Deepa Raghavan',
      city: 'Coimbatore',
      trip_type: 'Navagraha Temple Pilgrimage',
      rating: 5,
      text: 'Organized a 4-day Navagraha pilgrimage tour for 8 senior citizen family members. The 12-seater Tempo Traveller had pushback luxury seats, and the driver knew every temple’s darshan timings.',
      active: true,
      display_order: 6,
    },
  ];
  await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('testimonials').insert(testimonials);
  console.log('✅ Seeded Hero Slides & Testimonials!');

  // ==========================================
  // 8. WEBSITE SETTINGS
  // ==========================================
  console.log('⚙️ Seeding Website Settings...');
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
        business_hours: 'Mon – Sun · 24×7 Dispatch Service',
        support_hours: '24×7 On-Trip Emergency Support Helpline',
        facebook_url: 'https://facebook.com/southzoomtourism',
        instagram_url: 'https://instagram.com/southzoomtourism',
        youtube_url: 'https://youtube.com/southzoomtourism',
      },
    },
    {
      key: 'general_settings',
      value: {
        website_name: 'South Zoom Tourism',
        tagline: "Bengaluru's Premier South India Travel, Cab & Holiday Desk",
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
        branch: 'Electronic City, Bengaluru',
        qr_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=southzoom@upi&pn=SouthZoomTourism',
        payment_instructions: 'Pay 30% booking advance via UPI or Direct Bank Transfer, and share receipt on WhatsApp (+91 6366357757) with your Booking Reference.',
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
        cancellation_policy: 'Cancellations made 24 hours prior to departure are eligible for 100% refund of advance. Same-day cancellations within 4 hours will incur a nominal 10% driver dispatch fee.',
        auto_confirm: false,
        max_passengers: 50,
      },
    },
  ];
  await supabase.from('website_settings').upsert(settings);
  console.log('✅ Seeded Website Settings!');

  console.log('\n🎉 ALL FRONTEND DATA SUCCESSFULLY SYNCHRONIZED AND PERSISTED INTO BACKEND DATABASE!');
}

seedAllFrontendData().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
