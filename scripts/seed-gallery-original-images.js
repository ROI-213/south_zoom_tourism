import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://wraacxqwvsfugpzxatie.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWFjeHF3dnNmdWdwenhhdGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1MTU3NSwiZXhwIjoyMTAzNzI3NTc1fQ.DlMaYOM3IWiwCUH6sK12nioTDvJKmDKJXTacLSQdlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET_NAME = 'website-media';

const frontendGalleryItems = [
  // Karnataka
  {
    category: 'Karnataka',
    alt_text: 'Golden Hour at Hampi Vijayanagara Stone Chariot',
    relPath: 'src/assets/destinations/dest_hampi_1786683714278.jpg',
    targetName: 'gallery/hampi-stone-chariot.jpg',
    order: 1,
  },
  {
    category: 'Karnataka',
    alt_text: 'Pristine Om Beach & Cliff Trek in Gokarna',
    relPath: 'src/assets/destinations/dest_gokarna_1786683734925.jpg',
    targetName: 'gallery/gokarna-om-beach.jpg',
    order: 2,
  },
  {
    category: 'Karnataka',
    alt_text: 'Royal Mysore Palace Illuminated at Night',
    relPath: 'src/assets/destinations/dest-mysuru-new.jpg',
    targetName: 'gallery/mysuru-palace.jpg',
    order: 3,
  },
  {
    category: 'Karnataka',
    alt_text: 'Majestic Cascades of Jog Falls',
    relPath: 'src/assets/destinations/dest_jog_falls_1786683754955.jpg',
    targetName: 'gallery/jog-falls.jpg',
    order: 4,
  },
  {
    category: 'Karnataka',
    alt_text: 'Ancient 6th-century Rock Cut Cave Temples in Badami',
    relPath: 'src/assets/destinations/dest_badami_1786683832864.jpg',
    targetName: 'gallery/badami-caves.jpg',
    order: 5,
  },
  {
    category: 'Karnataka',
    alt_text: 'Western Ghats Coffee Plantations & Hills in Coorg',
    relPath: 'src/assets/tour-coorg.png',
    targetName: 'gallery/coorg-coffee.png',
    order: 6,
  },
  {
    category: 'Karnataka',
    alt_text: 'Mullayanagiri Peak and Tea Trails in Chikkamagaluru',
    relPath: 'src/assets/destinations/dest-chikkamagaluru-new.png',
    targetName: 'gallery/chikkamagaluru.png',
    order: 7,
  },
  {
    category: 'Karnataka',
    alt_text: 'Vidhana Soudha & Garden City Landmarks in Bengaluru',
    relPath: 'src/assets/destinations/dest-bengaluru-new.jpg',
    targetName: 'gallery/bengaluru.jpg',
    order: 8,
  },

  // Kerala
  {
    category: 'Kerala',
    alt_text: 'Emerald Rolling Tea Garden Hills of Munnar',
    relPath: 'src/assets/destinations/dest-munnar-new.png',
    targetName: 'gallery/munnar-tea-gardens.png',
    order: 9,
  },
  {
    category: 'Kerala',
    alt_text: 'Deluxe Traditional Houseboat on Alleppey Backwaters',
    relPath: 'src/assets/pkg-alleppey.png',
    targetName: 'gallery/alleppey-houseboat.png',
    order: 10,
  },
  {
    category: 'Kerala',
    alt_text: 'Lush Forests and Mountain Passes in Wayanad',
    relPath: 'src/assets/destinations/dest-wayanad.jpg',
    targetName: 'gallery/wayanad-hills.jpg',
    order: 11,
  },

  // Tamil Nadu
  {
    category: 'Tamil Nadu',
    alt_text: 'Meenakshi Amman Temple Gopuram Towers at Dusk in Madurai',
    relPath: 'src/assets/destinations/dest-madurai-new.png',
    targetName: 'gallery/madurai-meenakshi.png',
    order: 12,
  },
  {
    category: 'Tamil Nadu',
    alt_text: 'Nilgiri Mountain Railway Toy Train & Tea Valleys in Ooty',
    relPath: 'src/assets/pkg-ooty.png',
    targetName: 'gallery/ooty-nilgiris.png',
    order: 13,
  },
  {
    category: 'Tamil Nadu',
    alt_text: 'Scenic Star Lake and Pine Forests in Kodaikanal',
    relPath: 'src/assets/destinations/dest-kodai-new.png',
    targetName: 'gallery/kodaikanal.png',
    order: 14,
  },
  {
    category: 'Tamil Nadu',
    alt_text: 'Marina Beach & Heritage Coastline in Chennai',
    relPath: 'src/assets/destinations/dest-chennai.jpg',
    targetName: 'gallery/chennai-marina.jpg',
    order: 15,
  },
  {
    category: 'Tamil Nadu',
    alt_text: 'Ancient Dravidian Carvings of Navagraha Temple Circuit',
    relPath: 'src/assets/tour-navagraha.png',
    targetName: 'gallery/navagraha-temple.png',
    order: 16,
  },

  // Andhra Pradesh
  {
    category: 'Andhra Pradesh',
    alt_text: 'Sacred Tirumala Venkateswara Temple at Sunrise in Tirupati',
    relPath: 'src/assets/tour-tirupati.png',
    targetName: 'gallery/tirupati-temple.png',
    order: 17,
  },

  // Puducherry
  {
    category: 'Puducherry',
    alt_text: 'French Colonial Yellow Villas and Pastel Quarter in Pondicherry',
    relPath: 'src/assets/destinations/dest-pondy-new.png',
    targetName: 'gallery/pondicherry-french.png',
    order: 18,
  },

  // Goa
  {
    category: 'Goa',
    alt_text: 'Tropical Palm Fringed Beaches & Sunset Coast in Goa',
    relPath: 'src/assets/destinations/dest-goa-new2.jpg',
    targetName: 'gallery/goa-beach.jpg',
    order: 19,
  },

  // Vehicles & Fleet
  {
    category: 'Vehicles',
    alt_text: 'South Zoom Clean Fleet of Sedans, SUVs and Tempo Travellers',
    relPath: 'src/assets/hero-fleet.jpg',
    targetName: 'gallery/south-zoom-fleet.jpg',
    order: 20,
  },

  // Stays & Hotels
  {
    category: 'Hotels',
    alt_text: 'Handpicked Partner Luxury Resort with Panoramic Valley Views',
    relPath: 'src/assets/hero-hotels.jpg',
    targetName: 'gallery/partner-resort.jpg',
    order: 21,
  },
  {
    category: 'Hotels',
    alt_text: 'Deluxe Room Stays with Hill and Garden Balconies',
    relPath: 'src/assets/about-banner.jpg',
    targetName: 'gallery/deluxe-stay.jpg',
    order: 22,
  },
];

async function seedFrontendGalleryToBackend() {
  console.log('🚀 Uploading all frontend original gallery images to Supabase...\n');

  const rowsToInsert = [];

  for (const item of frontendGalleryItems) {
    const fullPath = path.resolve(process.cwd(), item.relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ File not found: ${fullPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const contentType = item.relPath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(item.targetName, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error(`❌ Failed to upload ${item.targetName}:`, uploadError.message);
    } else {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(item.targetName);

      const publicUrl = publicUrlData.publicUrl;
      console.log(`✅ Uploaded [${item.category}] ${item.alt_text} -> ${publicUrl}`);

      rowsToInsert.push({
        image_url: publicUrl,
        alt_text: item.alt_text,
        category: item.category,
        active: true,
        display_order: item.order,
      });
    }
  }

  console.log('\n🧹 Clearing old unsplash gallery entries in Supabase...');
  await supabase.from('gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log(`📥 Inserting ${rowsToInsert.length} authentic original gallery items into Supabase backend...`);
  const { error: insertError } = await supabase.from('gallery').insert(rowsToInsert);

  if (insertError) {
    console.error('❌ Failed to insert gallery items:', insertError.message);
  } else {
    console.log(`\n🎉 SUCCESS! All ${rowsToInsert.length} authentic frontend gallery images are now stored in Supabase backend and will appear in the Admin Gallery!`);
  }
}

seedFrontendGalleryToBackend().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
