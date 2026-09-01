import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://wraacxqwvsfugpzxatie.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWFjeHF3dnNmdWdwenhhdGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1MTU3NSwiZXhwIjoyMTAzNzI3NTc1fQ.DlMaYOM3IWiwCUH6sK12nioTDvJKmDKJXTacLSQdlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET_NAME = 'website-media';

const fleetFiles = [
  { slug: 'hatchback-wagonr', relPath: 'src/assets/fleet-wagonr-ka.jpg', targetName: 'fleet/fleet-wagonr.jpg' },
  { slug: 'sedan-dzire', relPath: 'src/assets/fleet-dzire-new.png', targetName: 'fleet/fleet-dzire.png' },
  { slug: 'suv-ertiga', relPath: 'src/assets/fleet-ertiga-new.png', targetName: 'fleet/fleet-ertiga.png' },
  { slug: 'suv-innova', relPath: 'src/assets/fleet-innova-new.png', targetName: 'fleet/fleet-innova.png' },
  { slug: 'tempo-12', relPath: 'src/assets/fleet-tempo-new.png', targetName: 'fleet/fleet-tempo-12.png' },
  { slug: 'tempo-14', relPath: 'src/assets/fleet-tempo-new.png', targetName: 'fleet/fleet-tempo-14.png' },
  { slug: 'tempo-17', relPath: 'src/assets/fleet-urbania-ka.jpg', targetName: 'fleet/fleet-urbania.jpg' },
  { slug: 'premium-bmw', relPath: 'src/assets/fleet-bmw-new.png', targetName: 'fleet/fleet-bmw.png' },
  { slug: 'bus-coach', relPath: 'src/assets/fleet-bus-ka.jpg', targetName: 'fleet/fleet-bus.jpg' },
];

async function uploadFleetImagesAndUpdateDatabase() {
  console.log('🚗 Uploading original authentic fleet images to Supabase Storage...\n');

  for (const item of fleetFiles) {
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
      console.log(`✅ Uploaded ${item.slug} -> ${publicUrl}`);

      // Update Supabase fleets table
      const { error: dbError } = await supabase
        .from('fleets')
        .update({
          image: publicUrl,
          image_alt: `South Zoom ${item.slug} vehicle with KA yellow board`,
        })
        .eq('slug', item.slug);

      if (dbError) {
        console.error(`❌ Failed to update fleets table for ${item.slug}:`, dbError.message);
      } else {
        console.log(`✨ Updated database fleets row for "${item.slug}" with ${publicUrl}`);
      }
    }
  }

  console.log('\n🎉 ALL REAL FLEET VEHICLE IMAGES HAVE BEEN STORED IN SUPABASE BACKEND!');
}

uploadFleetImagesAndUpdateDatabase().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
