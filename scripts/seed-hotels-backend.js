import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wraacxqwvsfugpzxatie.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWFjeHF3dnNmdWdwenhhdGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1MTU3NSwiZXhwIjoyMTAzNzI3NTc1fQ.DlMaYOM3IWiwCUH6sK12nioTDvJKmDKJXTacLSQdlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedHotels() {
  console.log('🔄 Fetching destinations from Supabase...');
  const { data: destinations } = await supabase.from('destinations').select('id, name, slug');

  const destMap = {};
  if (destinations) {
    destinations.forEach((d) => {
      if (d.slug) destMap[d.slug.toLowerCase()] = d.id;
      if (d.name) destMap[d.name.toLowerCase()] = d.id;
    });
  }

  console.log('🏨 Preparing existing website hotels for backend database...');

  const hotelCatalogue = [
    {
      name: 'Hillview Mountain Resort',
      city: 'Ooty',
      destination_id: destMap['ooty'] || null,
      star_rating: 4,
      description:
        'Valley-facing resort on the Coonoor road with bonfire lawns, an indoor play area, Nilgiri tea garden views and heated rooms.',
      main_image:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
      rooms: [
        {
          room_type: 'Deluxe Valley Room',
          price_per_night: 4200,
          capacity_adults: 2,
          capacity_children: 2,
          amenities: ['Valley view', 'Room heater', 'Free breakfast', 'Wi-Fi', 'Parking'],
          image_url:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: 'Two-Bedroom Garden Cottage',
          price_per_night: 6400,
          capacity_adults: 4,
          capacity_children: 2,
          amenities: ['Private lawn', 'Fireplace', 'Free breakfast', 'Wi-Fi'],
          image_url:
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Marina Grand',
      city: 'Chennai',
      destination_id: destMap['chennai'] || null,
      star_rating: 4,
      description:
        'Business hotel ten minutes from Chennai International Airport with 24-hour check-in, complimentary airport shuttle and conference suites.',
      main_image:
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
      rooms: [
        {
          room_type: 'Executive King Room',
          price_per_night: 3800,
          capacity_adults: 2,
          capacity_children: 1,
          amenities: ['Airport pickup', 'Work desk', 'Wi-Fi', 'Free breakfast', 'Gym access'],
          image_url:
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: 'Business Luxury Suite',
          price_per_night: 7200,
          capacity_adults: 3,
          capacity_children: 2,
          amenities: ['Lounge access', 'Late checkout', 'Living area', 'Bathtub'],
          image_url:
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Backwater Wave Resort & Spa',
      city: 'Alleppey',
      destination_id: destMap['alleppey'] || null,
      star_rating: 4,
      description:
        'Lake-facing cottages overlooking Punnamada lake with sunset backwater boat cruise, Ayurvedic massage center and Kerala breakfast.',
      main_image:
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
      rooms: [
        {
          room_type: 'Lake Facing Cottage',
          price_per_night: 3300,
          capacity_adults: 2,
          capacity_children: 2,
          amenities: ['Lake view', 'Boat ride included', 'AC', 'Free breakfast', 'Ayurveda'],
          image_url:
            'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: 'Backwater Family Suite',
          price_per_night: 5200,
          capacity_adults: 4,
          capacity_children: 3,
          amenities: ['Lake view', 'Living area', 'Private deck', 'Breakfast'],
          image_url:
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Temple Stay Residency',
      city: 'Madurai',
      destination_id: destMap['madurai'] || null,
      star_rating: 3,
      description:
        'Four hundred metres from the Meenakshi Amman temple east tower, with a pure-vegetarian kitchen, darshan wake-up assistance and lockers.',
      main_image:
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
      rooms: [
        {
          room_type: 'Family Room (Near Temple)',
          price_per_night: 2600,
          capacity_adults: 4,
          capacity_children: 2,
          amenities: ['Temple view', 'Pure veg canteen', 'Hot water', 'Wi-Fi'],
          image_url:
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: 'Pilgrim Twin Room',
          price_per_night: 1400,
          capacity_adults: 2,
          capacity_children: 1,
          amenities: ['Hot water', 'Locker', '24hr desk', 'Veg meals'],
          image_url:
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: "Coorg Planter's Luxury Homestay",
      city: 'Coorg',
      destination_id: destMap['coorg'] || null,
      star_rating: 4,
      description:
        'Authentic Kodava plantation stay with dawn coffee estate walks, bonfires, nature trails and home-cooked traditional meals.',
      main_image:
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
      rooms: [
        {
          room_type: "Planter's Plantation Room",
          price_per_night: 4500,
          capacity_adults: 2,
          capacity_children: 2,
          amenities: ['Estate walk', 'Bonfire', 'All meals included', 'Nature trail'],
          image_url:
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: 'Heritage Wooden Cottage',
          price_per_night: 5800,
          capacity_adults: 4,
          capacity_children: 2,
          amenities: ['Balcony', 'Fireplace', 'Estate view', 'Bonfire'],
          image_url:
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Bengaluru Grand Executive Suites',
      city: 'Bengaluru',
      destination_id: destMap['bengaluru'] || null,
      star_rating: 5,
      description:
        'Five-star suites near Indiranagar and Koramangala with swimming pool, spa, high-speed Wi-Fi, fine dining restaurant and luxury airport transfers.',
      main_image:
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
      rooms: [
        {
          room_type: 'Executive Suite',
          price_per_night: 5200,
          capacity_adults: 2,
          capacity_children: 2,
          amenities: ['Swimming pool', 'Gym', 'Spa', 'Breakfast', 'Wi-Fi'],
          image_url:
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: '1 BHK Service Apartment',
          price_per_night: 4400,
          capacity_adults: 2,
          capacity_children: 2,
          amenities: ['Kitchenette', 'Washing machine', 'Work desk', 'Housekeeping'],
          image_url:
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Mysuru Heritage Palace Inn',
      city: 'Mysuru',
      destination_id: destMap['mysuru'] || null,
      star_rating: 4,
      description:
        'Royal architecture heritage stay located 5 minutes from Mysore Palace, with courtyard swimming pool, traditional banquet hall and silk market access.',
      main_image:
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
      rooms: [
        {
          room_type: 'Palace View Heritage Room',
          price_per_night: 3800,
          capacity_adults: 2,
          capacity_children: 2,
          amenities: ['Palace view', 'Pool access', 'Breakfast', 'Heritage decor'],
          image_url:
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: 'Royal Maharaja Suite',
          price_per_night: 6200,
          capacity_adults: 4,
          capacity_children: 2,
          amenities: ['Living room', 'Four-poster bed', 'Balcony', 'Breakfast'],
          image_url:
            'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Chikkamagaluru Coffee Stay',
      city: 'Chikkamagaluru',
      destination_id: destMap['chikkamagaluru'] || null,
      star_rating: 4,
      description:
        'Nestled in the Western Ghats foothills surrounded by coffee blossoms, Mullayanagiri peak trekking trails, estate waterfalls and bonfires.',
      main_image:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: true,
      rooms: [
        {
          room_type: 'Deluxe Coffee Estate Cottage',
          price_per_night: 3100,
          capacity_adults: 2,
          capacity_children: 2,
          amenities: ['Coffee estate view', 'Trekking', 'Campfire', 'Breakfast'],
          image_url:
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Mist Valley Resort',
      city: 'Munnar',
      destination_id: destMap['munnar'] || null,
      star_rating: 4,
      description:
        'Tea-garden resort at 5,200 ft with glass-front rooms, sunrise infinity deck, tea museum excursions and resident naturalist walks.',
      main_image:
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: false,
      rooms: [
        {
          room_type: 'Tea Garden Deluxe Room',
          price_per_night: 5600,
          capacity_adults: 2,
          capacity_children: 2,
          amenities: ['Tea garden view', 'Room heater', 'Breakfast', 'Infinity deck'],
          image_url:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: 'Glass Valley Suite',
          price_per_night: 7800,
          capacity_adults: 3,
          capacity_children: 2,
          amenities: ['Glass wall view', 'Fireplace', 'Jacuzzi', 'Breakfast'],
          image_url:
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Blue Lagoon Beach Resort',
      city: 'Goa',
      destination_id: destMap['goa'] || null,
      star_rating: 5,
      description:
        'Beachfront 5-star resort in Candolim with two swimming pools, shack-style beach grill, water sports desk, spa and sunset cocktail lounge.',
      main_image:
        'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: false,
      rooms: [
        {
          room_type: 'Garden Double Room',
          price_per_night: 8200,
          capacity_adults: 2,
          capacity_children: 1,
          amenities: ['Garden view', 'Pool access', 'Free breakfast', 'Beach access'],
          image_url:
            'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: 'Sea View Luxury Suite',
          price_per_night: 12500,
          capacity_adults: 3,
          capacity_children: 2,
          amenities: ['Direct sea view', 'Private daybed', 'Butler', 'Spa credit'],
          image_url:
            'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
    {
      name: 'Yatri Nivas',
      city: 'Tirupati',
      destination_id: destMap['tirupati'] || null,
      star_rating: 3,
      description:
        'Budget-friendly lodge a short drive from Alipiri footpath, with darshan booking help desk, luggage storage rooms and early vegetarian canteen.',
      main_image:
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
      active: true,
      featured: false,
      rooms: [
        {
          room_type: 'Standard Twin Room',
          price_per_night: 1650,
          capacity_adults: 2,
          capacity_children: 2,
          amenities: ['Hot water', 'Luggage storage', 'Pure veg canteen', '24hr check-in'],
          image_url:
            'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
        },
        {
          room_type: '8-Bed Dormitory',
          price_per_night: 2400,
          capacity_adults: 8,
          capacity_children: 4,
          amenities: ['8 Bunk beds', 'Lockers', 'Shared bath', 'AC'],
          image_url:
            'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=800&q=80',
        },
      ],
    },
  ];

  console.log(`Clearing existing hotels to perform clean sync...`);
  await supabase.from('hotels').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const item of hotelCatalogue) {
    const { rooms, ...hotelData } = item;
    const { data: insertedHotel, error: hError } = await supabase
      .from('hotels')
      .insert(hotelData)
      .select('id, name')
      .single();

    if (hError) {
      console.error(`❌ Failed to insert hotel "${item.name}":`, hError);
      continue;
    }

    console.log(`✅ Stored Hotel: ${insertedHotel.name} (ID: ${insertedHotel.id})`);

    if (rooms && rooms.length > 0) {
      const roomsPayload = rooms.map((r) => ({
        hotel_id: insertedHotel.id,
        room_type: r.room_type,
        price_per_night: r.price_per_night,
        capacity_adults: r.capacity_adults || 2,
        capacity_children: r.capacity_children || 0,
        amenities: r.amenities || ['Wi-Fi', 'AC', 'Hot Water'],
        image_url: r.image_url || hotelData.main_image,
        active: true,
      }));

      const { error: rError } = await supabase.from('hotel_rooms').insert(roomsPayload);
      if (rError) {
        console.error(`   ❌ Failed to insert rooms for "${insertedHotel.name}":`, rError);
      } else {
        console.log(`   🛏️ Inserted ${roomsPayload.length} room types`);
      }
    }
  }

  console.log('\n🎉 ALL WEBSITE HOTELS & ROOMS HAVE BEEN STORED IN SUPABASE BACKEND!');
}

seedHotels().catch(console.error);
