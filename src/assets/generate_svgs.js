import fs from 'fs';

const createSvg = (title, subtitle, carShapePath, boardY = 440) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="550" viewBox="0 0 800 550" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Clean White Background -->
  <rect width="800" height="550" fill="#FFFFFF"/>
  
  <!-- Subtle floor shadow -->
  <ellipse cx="400" cy="470" rx="310" ry="25" fill="#000000" fill-opacity="0.06"/>

  <!-- Vehicle Illustration (White Body) -->
  ${carShapePath}

  <!-- Yellow Commercial Board on Bumper -->
  <g transform="translate(0, 0)">
    <rect x="230" y="${boardY}" width="340" height="48" rx="6" fill="#FFC72C" stroke="#111827" stroke-width="2.5"/>
    <rect x="234" y="${boardY + 4}" width="332" height="40" rx="4" fill="none" stroke="#111827" stroke-width="1" stroke-dasharray="4 2"/>
    <text x="400" y="${boardY + 30}" text-anchor="middle" fill="#000000" font-family="'Arial Black', 'Impact', sans-serif" font-weight="900" font-size="18" letter-spacing="1.5">SOUTH ZOOM TOURISM</text>
  </g>
</svg>`;

// 1. Hatchback (WagonR)
const hatchbackSvg = createSvg('Hatchback', 'WagonR or similar', `
  <path d="M180 340 C190 280 230 180 320 170 L480 170 C540 180 580 230 610 300 L630 350 C650 370 650 420 630 440 L170 440 C150 420 150 370 180 340 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4"/>
  <path d="M310 185 L475 185 C515 200 540 240 555 285 L245 285 C265 235 285 195 310 185 Z" fill="#1E293B" opacity="0.85"/>
  <circle cx="240" cy="440" r="45" fill="#0F172A"/>
  <circle cx="240" cy="440" r="25" fill="#E2E8F0" stroke="#64748B" stroke-width="3"/>
  <circle cx="560" cy="440" r="45" fill="#0F172A"/>
  <circle cx="560" cy="440" r="25" fill="#E2E8F0" stroke="#64748B" stroke-width="3"/>
  <rect x="200" y="360" width="400" height="60" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <path d="M170 360 L220 360 L210 390 L170 380 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
  <path d="M630 360 L580 360 L590 390 L630 380 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
`, 430);

// 2. Sedan (Swift Dzire)
const sedanSvg = createSvg('Sedan', 'Swift Dzire or similar', `
  <path d="M130 380 C150 350 200 320 280 290 L380 200 C440 195 520 200 570 280 L670 340 C710 360 720 400 700 440 L120 440 C100 420 110 390 130 380 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4"/>
  <path d="M295 295 L385 210 L515 210 L555 285 Z" fill="#0F172A" opacity="0.85"/>
  <circle cx="210" cy="440" r="45" fill="#0F172A"/>
  <circle cx="210" cy="440" r="24" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
  <circle cx="590" cy="440" r="45" fill="#0F172A"/>
  <circle cx="590" cy="440" r="24" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
  <rect x="170" y="365" width="460" height="50" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <path d="M125 375 L175 365 L170 400 L120 395 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
  <path d="M675 375 L625 365 L630 400 L680 395 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
`, 430);

// 3. Small SUV (Ertiga)
const smallSuvSvg = createSvg('Small SUV', 'Ertiga or similar', `
  <path d="M150 360 C170 300 230 190 320 180 L520 180 C580 190 620 260 650 330 L670 370 C690 390 690 420 670 440 L150 440 C130 420 130 380 150 360 Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4"/>
  <path d="M310 195 L515 195 L565 285 L245 285 Z" fill="#0F172A" opacity="0.85"/>
  <circle cx="230" cy="440" r="46" fill="#0F172A"/>
  <circle cx="230" cy="440" r="25" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
  <circle cx="590" cy="440" r="46" fill="#0F172A"/>
  <circle cx="590" cy="440" r="25" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
  <rect x="190" y="350" width="430" height="65" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <path d="M145 360 L195 355 L190 390 L140 385 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
  <path d="M655 360 L605 355 L610 390 L660 385 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
`, 430);

// 4. Big SUV (Innova Crysta)
const bigSuvSvg = createSvg('Big SUV', 'Innova Crysta or similar', `
  <path d="M130 360 C150 280 220 170 310 160 L540 160 C610 170 650 240 680 320 L710 360 C730 380 730 420 710 440 L130 440 C110 420 110 380 130 360 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="4"/>
  <path d="M300 175 L535 175 L600 280 L230 280 Z" fill="#0F172A" opacity="0.88"/>
  <circle cx="220" cy="440" r="48" fill="#0F172A"/>
  <circle cx="220" cy="440" r="26" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
  <circle cx="620" cy="440" r="48" fill="#0F172A"/>
  <circle cx="620" cy="440" r="26" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
  <rect x="170" y="340" width="480" height="75" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <path d="M125 350 L180 345 L175 385 L120 380 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
  <path d="M685 350 L630 345 L635 385 L690 380 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
`, 430);

// 5. Premium (BMW)
const premiumSvg = createSvg('Premium', 'BMW or similar', `
  <path d="M120 370 C140 330 210 290 300 270 L400 190 C470 185 550 190 600 260 L690 330 C730 350 740 390 720 435 L110 435 C90 415 100 385 120 370 Z" fill="#FFFFFF" stroke="#94A3B8" stroke-width="4"/>
  <path d="M315 275 L405 200 L545 200 L585 275 Z" fill="#0F172A" opacity="0.9"/>
  <circle cx="200" cy="435" r="45" fill="#0F172A"/>
  <circle cx="200" cy="435" r="25" fill="#CBD5E1" stroke="#1E293B" stroke-width="4"/>
  <circle cx="610" cy="435" r="45" fill="#0F172A"/>
  <circle cx="610" cy="435" r="25" fill="#CBD5E1" stroke="#1E293B" stroke-width="4"/>
  <rect x="160" y="355" width="480" height="55" rx="8" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
  <path d="M115 365 L165 355 L160 395 L110 390 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
  <path d="M695 365 L645 355 L650 395 L700 390 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
`, 425);

// 6. Group Buses (Tempo Traveller, Urbania, Luxury & Multi-Axle)
const groupBusesSvg = createSvg('Group Buses', 'Tempo traveller, Urbania, Luxury & Multi-axle', `
  <path d="M110 390 C120 220 140 140 220 130 L660 130 C720 140 730 200 730 380 C730 420 710 440 680 440 L140 440 C110 440 100 410 110 390 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="4"/>
  <rect x="180" y="160" width="510" height="120" rx="8" fill="#1E293B" opacity="0.85"/>
  <line x1="270" y1="160" x2="270" y2="280" stroke="#FFFFFF" stroke-width="3" opacity="0.5"/>
  <line x1="370" y1="160" x2="370" y2="280" stroke="#FFFFFF" stroke-width="3" opacity="0.5"/>
  <line x1="470" y1="160" x2="470" y2="280" stroke="#FFFFFF" stroke-width="3" opacity="0.5"/>
  <line x1="570" y1="160" x2="570" y2="280" stroke="#FFFFFF" stroke-width="3" opacity="0.5"/>
  <circle cx="210" cy="440" r="45" fill="#0F172A"/>
  <circle cx="210" cy="440" r="24" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
  <circle cx="550" cy="440" r="45" fill="#0F172A"/>
  <circle cx="550" cy="440" r="24" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
  <circle cx="650" cy="440" r="45" fill="#0F172A"/>
  <circle cx="650" cy="440" r="24" fill="#E2E8F0" stroke="#475569" stroke-width="3"/>
  <rect x="150" y="330" width="540" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <path d="M115 340 L160 335 L155 380 L110 375 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
  <path d="M705 340 L660 335 L665 380 L710 375 Z" fill="#FEF08A" stroke="#CA8A04" stroke-width="2"/>
`, 430);

const targetDir = 'c:/Users/LENOVO/Downloads/south-zoom-tourism-main/south-zoom-tourism-main/src/assets';
fs.writeFileSync(`${targetDir}/fleet-hatchback.svg`, hatchbackSvg);
fs.writeFileSync(`${targetDir}/fleet-sedan.svg`, sedanSvg);
fs.writeFileSync(`${targetDir}/fleet-small-suv.svg`, smallSuvSvg);
fs.writeFileSync(`${targetDir}/fleet-big-suv.svg`, bigSuvSvg);
fs.writeFileSync(`${targetDir}/fleet-premium.svg`, premiumSvg);
fs.writeFileSync(`${targetDir}/fleet-group-buses.svg`, groupBusesSvg);

console.log('Successfully wrote SVG files');
