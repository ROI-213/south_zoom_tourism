import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://wraacxqwvsfugpzxatie.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWFjeHF3dnNmdWdwenhhdGllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE1MTU3NSwiZXhwIjoyMTAzNzI3NTc1fQ.DlMaYOM3IWiwCUH6sK12nioTDvJKmDKJXTacLSQdlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET_NAME = 'website-media';

const imageFiles = [
  { key: 'ooty', relPath: 'src/assets/pkg-ooty.png', targetName: 'packages/pkg-ooty.png' },
  { key: 'munnar', relPath: 'src/assets/destinations/dest-munnar-new.png', targetName: 'packages/dest-munnar.png' },
  { key: 'coorg', relPath: 'src/assets/tour-coorg.png', targetName: 'packages/tour-coorg.png' },
  { key: 'alleppey', relPath: 'src/assets/pkg-alleppey.png', targetName: 'packages/pkg-alleppey.png' },
  { key: 'hampi', relPath: 'src/assets/destinations/dest_hampi_1786683714278.jpg', targetName: 'packages/dest-hampi.jpg' },
  { key: 'gokarna', relPath: 'src/assets/destinations/dest_gokarna_1786683734925.jpg', targetName: 'packages/dest-gokarna.jpg' },
  { key: 'pondicherry', relPath: 'src/assets/destinations/dest-pondy-new.png', targetName: 'packages/dest-pondy.png' },
  { key: 'tirupati', relPath: 'src/assets/tour-tirupati.png', targetName: 'packages/tour-tirupati.png' },
  { key: 'navagraha', relPath: 'src/assets/tour-navagraha.png', targetName: 'packages/tour-navagraha.png' },
  { key: 'goa', relPath: 'src/assets/destinations/dest-goa-new2.jpg', targetName: 'packages/dest-goa.jpg' },
  { key: 'madurai', relPath: 'src/assets/destinations/dest-madurai-new.png', targetName: 'destinations/dest-madurai.png' },
  { key: 'kodaikanal', relPath: 'src/assets/destinations/dest-kodai-new.png', targetName: 'destinations/dest-kodaikanal.png' },
  { key: 'chikkamagaluru', relPath: 'src/assets/destinations/dest-chikkamagaluru-new.png', targetName: 'destinations/dest-chikkamagaluru.png' },
  { key: 'wayanad', relPath: 'src/assets/destinations/dest-wayanad.jpg', targetName: 'destinations/dest-wayanad.jpg' },
  { key: 'mysuru', relPath: 'src/assets/destinations/dest-mysuru-new.jpg', targetName: 'destinations/dest-mysuru.jpg' },
  { key: 'bengaluru', relPath: 'src/assets/destinations/dest-bengaluru-new.jpg', targetName: 'destinations/dest-bengaluru.jpg' },
];

async function uploadImagesAndUpdateBackend() {
  console.log('📤 Uploading frontend original images to Supabase Storage...\n');

  const uploadedUrls = {};

  for (const item of imageFiles) {
    const fullPath = path.resolve(process.cwd(), item.relPath);
    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ File not found: ${fullPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const contentType = item.relPath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(item.targetName, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`❌ Failed to upload ${item.targetName}:`, error.message);
    } else {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(item.targetName);

      const publicUrl = publicUrlData.publicUrl;
      uploadedUrls[item.key] = publicUrl;
      console.log(`✅ Uploaded ${item.targetName} -> ${publicUrl}`);
    }
  }

  console.log('\n🔄 Updating Supabase `tour_packages` database table with uploaded backend image URLs...');

  const packageUpdates = [
    { slug: 'ooty-coonoor-escape', image: uploadedUrls['ooty'] },
    { slug: 'munnar-tea-trails', image: uploadedUrls['munnar'] },
    { slug: 'coorg-nature-retreat', image: uploadedUrls['coorg'] },
    { slug: 'alleppey-backwater-cruise', image: uploadedUrls['alleppey'] },
    { slug: 'hampi-ruins-exploration', image: uploadedUrls['hampi'] },
    { slug: 'gokarna-beach-trek', image: uploadedUrls['gokarna'] },
    { slug: 'pondicherry-french-quarter', image: uploadedUrls['pondicherry'] },
    { slug: 'tirupati-balaji-darshan', image: uploadedUrls['tirupati'] },
    { slug: 'navagraha-temple-circuit', image: uploadedUrls['navagraha'] },
    { slug: 'goa-beach-holiday', image: uploadedUrls['goa'] },
  ];

  for (const pkg of packageUpdates) {
    if (pkg.image) {
      const { error } = await supabase
        .from('tour_packages')
        .update({ main_image: pkg.image })
        .eq('slug', pkg.slug);

      if (error) {
        console.error(`❌ Failed to update package ${pkg.slug}:`, error.message);
      } else {
        console.log(`✅ Updated tour_package "${pkg.slug}" main_image = ${pkg.image}`);
      }
    }
  }

  console.log('\n🔄 Updating Supabase `destinations` database table with uploaded backend image URLs...');

  const destinationUpdates = [
    { slug: 'ooty', image: uploadedUrls['ooty'] },
    { slug: 'munnar', image: uploadedUrls['munnar'] },
    { slug: 'coorg', image: uploadedUrls['coorg'] },
    { slug: 'alleppey', image: uploadedUrls['alleppey'] },
    { slug: 'hampi', image: uploadedUrls['hampi'] },
    { slug: 'gokarna', image: uploadedUrls['gokarna'] },
    { slug: 'pondicherry', image: uploadedUrls['pondicherry'] },
    { slug: 'tirupati', image: uploadedUrls['tirupati'] },
    { slug: 'madurai', image: uploadedUrls['madurai'] },
    { slug: 'goa', image: uploadedUrls['goa'] },
    { slug: 'kodaikanal', image: uploadedUrls['kodaikanal'] },
    { slug: 'chikkamagaluru', image: uploadedUrls['chikkamagaluru'] },
    { slug: 'wayanad', image: uploadedUrls['wayanad'] },
    { slug: 'mysuru', image: uploadedUrls['mysuru'] },
    { slug: 'bengaluru', image: uploadedUrls['bengaluru'] },
  ];

  for (const dest of destinationUpdates) {
    if (dest.image) {
      const { error } = await supabase
        .from('destinations')
        .update({ image_url: dest.image })
        .eq('slug', dest.slug);

      if (error) {
        console.error(`❌ Failed to update destination ${dest.slug}:`, error.message);
      } else {
        console.log(`✅ Updated destination "${dest.slug}" image_url = ${dest.image}`);
      }
    }
  }

  console.log('\n🎉 ALL FRONTEND ORIGINAL IMAGES HAVE BEEN UPLOADED AND STORED IN SUPABASE BACKEND!');
}

uploadImagesAndUpdateBackend().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
