import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp'; // Keep sharp for resizing if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function processFleets() {
  const configs = [
    {
      source: 'fleet_sedan_yellow_board_1786680814709.jpg',
      target: 'fleet-dzire-ka.jpg'
    },
    {
      source: 'fleet_sedan_yellow_board_1786680814709.jpg',
      target: 'fleet-sedan.jpg'
    },
    {
      source: 'fleet_ertiga_yellow_board_1786680959170.jpg',
      target: 'fleet-ertiga-ka.jpg'
    },
    {
      source: 'fleet_ertiga_yellow_board_1786680959170.jpg',
      target: 'fleet-small-suv.jpg'
    },
    {
      source: 'fleet_innova_yellow_board_1786681018168.jpg',
      target: 'fleet-innova-ka.jpg'
    },
    {
      source: 'fleet_innova_yellow_board_1786681018168.jpg',
      target: 'fleet-big-suv.jpg'
    },
    {
      source: 'fleet_tempo_yellow_board_1786681490500.jpg',
      target: 'fleet-tempo-ka.jpg'
    },
    {
      source: 'fleet_bmw_yellow_board_1786681054247.jpg',
      target: 'fleet-bmw-ka.jpg'
    },
    {
      source: 'fleet_bmw_yellow_board_1786681054247.jpg',
      target: 'fleet-premium.jpg'
    }
  ];

  for (const c of configs) {
    const srcPath = path.join(projectRoot, 'src/assets', c.source);
    const targetPath = path.join(projectRoot, 'src/assets', c.target);

    if (!fs.existsSync(srcPath)) {
      console.log('Source missing:', c.source);
      continue;
    }
    
    // Just copy the original image over, removing any stickers
    fs.copyFileSync(srcPath, targetPath);
    console.log(`Restored clean unbranded image to ${c.target} using ${c.source}`);
  }

  // 7. Hatchback WagonR (clean 1024 to 1200x896) - just resize, no sticker
  const hatchSrcPath = path.join(projectRoot, 'src/assets/fleet_hatchback_yb_1786682364244.jpg');
  if (fs.existsSync(hatchSrcPath)) {
      const cleanHatch = await sharp(hatchSrcPath)
        .resize(1200, 896, { fit: 'contain', background: '#ffffff' })
        .toBuffer();

      fs.writeFileSync(path.join(projectRoot, 'src/assets/fleet-wagonr-ka.jpg'), cleanHatch);
      fs.writeFileSync(path.join(projectRoot, 'src/assets/fleet-hatchback.jpg'), cleanHatch);
      console.log('Restored clean WagonR & Hatchback (resized, no sticker)');
  }

  // Note: fleet-bus-ka.jpg and fleet-urbania-ka.jpg were modified in place or from self, 
  // if they are completely ruined and we don't have originals, we can't easily un-brand them, 
  // but let's assume we removed the sticker step for now.
}

processFleets()
  .then(() => console.log('Successfully removed stickers and restored fleet images!'))
  .catch(console.error);
