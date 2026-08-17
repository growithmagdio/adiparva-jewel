import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public', 'images');

// Folders to ensure
const folders = ['products', 'categories', 'hero', 'journal', 'craft'];

folders.forEach((folder) => {
  const p = path.join(publicDir, folder);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
});

// Helper to generate warm luxury SVG with filigree mandala pattern
function generateSVG(title, subtitle, width = 1200, height = 1500) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#241008"/>
        <stop offset="45%" stop-color="#321509"/>
        <stop offset="100%" stop-color="#4A210F"/>
      </linearGradient>
      <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#D99A38"/>
        <stop offset="50%" stop-color="#C47A20"/>
        <stop offset="100%" stop-color="#E2B258"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="1" fill="#D99A38" fill-opacity="0.12"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>

    <!-- Outer Gold Frame -->
    <rect x="24" y="24" width="${width - 48}" height="${height - 48}" stroke="url(#goldGrad)" stroke-width="2" fill="none" stroke-opacity="0.4"/>
    <rect x="34" y="34" width="${width - 68}" height="${height - 68}" stroke="#D99A38" stroke-width="0.75" fill="none" stroke-opacity="0.25"/>

    <!-- Central Filigree Rosette -->
    <g transform="translate(${width / 2}, ${height / 2 - 40})" stroke="url(#goldGrad)" fill="none" opacity="0.35">
      <circle r="140" stroke-width="1.5" stroke-dasharray="4 4"/>
      <circle r="100" stroke-width="1"/>
      <circle r="60" stroke-width="1.5"/>
      <circle r="20" stroke-width="2"/>
      <path d="M-160 0 H160 M0 -160 V160 M-110 -110 L110 110 M-110 110 L110 -110" stroke-width="0.75"/>
    </g>

    <!-- Content Block -->
    <g font-family="serif" text-anchor="middle">
      <text x="${width / 2}" y="${height / 2 + 110}" font-size="34" font-weight="500" fill="#F7EFE4" letter-spacing="1">${title}</text>
      <text x="${width / 2}" y="${height / 2 + 155}" font-size="14" font-family="sans-serif" font-weight="600" fill="#D99A38" letter-spacing="4">${subtitle || 'HERITAGE COLLECTION'}</text>
    </g>
  </svg>`;
}

const assets = [
  // Hero
  { file: 'hero/hero-temple-necklace.jpg', title: 'Maharani Temple Gold', sub: 'EST. IN THE TRADITION OF THE SOUTH', w: 1200, h: 1500 },
  { file: 'hero/hero-kundan-bridal.jpg', title: 'Royal Kundan Parure', sub: 'THE BRIDAL REPOSITORY', w: 1200, h: 1500 },

  // Categories
  { file: 'categories/temple-jewellery.jpg', title: 'Temple Jewellery', sub: 'NAGERCOIL STHAPATI GUILD' },
  { file: 'categories/kundan.jpg', title: 'Kundan & Polki', sub: 'JADAU DIAMOND SETTING' },
  { file: 'categories/bridal-sets.jpg', title: 'Grand Bridal Parures', sub: 'ROYAL HEIRLOOMS' },
  { file: 'categories/jadau.jpg', title: 'Jadau Craft', sub: 'PRECIOUS EMBEDDING' },
  { file: 'categories/meenakari.jpg', title: 'Meenakari Enamelwork', sub: 'BENARAS & JAIPUR' },
  { file: 'categories/antique-gold.jpg', title: 'Antique Gold', sub: 'VINTAGE POLISH' },
  { file: 'categories/jhumkas.jpg', title: 'Jhumkas & Earrings', sub: 'SACRED MOTIFS' },
  { file: 'categories/haarams.jpg', title: 'Grand Haarams', sub: 'LONG NECKLACES' },

  // Products
  { file: 'products/maharani-temple-necklace-1.jpg', title: 'Maharani Temple Necklace', sub: '22K ANTIQUE GOLD' },
  { file: 'products/royal-peacock-jhumkas-1.jpg', title: 'Royal Peacock Jhumkas', sub: 'TEMPLE GOLD & KEMP' },
  { file: 'products/lakshmi-kasu-haaram-1.jpg', title: 'Lakshmi Kasu Haaram', sub: 'COIN NECKLACE' },
  { file: 'products/nagercoil-bangles-1.jpg', title: 'Nagercoil Meenakari Bangles', sub: 'ENAMELWORK PAIR' },
  { file: 'products/chettinad-oddiyanam-1.jpg', title: 'Chettinad Oddiyanam', sub: 'WAIST BELT' },
  { file: 'products/polki-chandbali-1.jpg', title: 'Polki Chandbali', sub: 'UNCUT DIAMONDS' },
  { file: 'products/vanki-armlet-1.jpg', title: 'Antique Vanki Armlet', sub: 'NAGA MOTIF' },
  { file: 'products/jadau-rani-haar-1.jpg', title: 'Jadau Rani Haar', sub: 'ROYAL PEARLS' },
  { file: 'products/temple-kasu-mala-1.jpg', title: 'Temple Kasu Mala', sub: 'SOUTH INDIAN GOLD' },
  { file: 'products/swan-vaddanam-1.jpg', title: 'Swan Motif Vaddanam', sub: 'GOLD WAIST BELT' },

  // Journal
  { file: 'journal/anatomy-temple-necklace.jpg', title: 'Anatomy of a Temple Gold Necklace', sub: 'THE PARVA CHRONICLE', w: 1600, h: 900 },
  { file: 'journal/kundan-polki-guide.jpg', title: 'Understanding Kundan, Polki & Jadau', sub: 'THE PARVA CHRONICLE', w: 1600, h: 900 },
  { file: 'journal/sacred-motifs.jpg', title: 'Sacred Motifs: Swans, Peacocks & Lotus', sub: 'THE PARVA CHRONICLE', w: 1600, h: 900 },
  { file: 'journal/artisan-clusters.jpg', title: 'Preserving the Sthapati Guilds', sub: 'THE PARVA CHRONICLE', w: 1600, h: 900 },

  // Craft
  { file: 'craft/stage-1-wax-model.jpg', title: 'Wax Modeling & Sketching', sub: 'STAGE 1', w: 1200, h: 800 },
  { file: 'craft/stage-2-nakashi.jpg', title: 'Nakashi Repoussé Work', sub: 'STAGE 2', w: 1200, h: 800 },
  { file: 'craft/stage-3-jadau.jpg', title: 'Jadau Stone Setting', sub: 'STAGE 3', w: 1200, h: 800 },
  { file: 'craft/stage-4-meenakari.jpg', title: 'Meenakari Enamelling', sub: 'STAGE 4', w: 1200, h: 800 },
  { file: 'craft/stage-5-polish.jpg', title: 'Antique Polish & Assembly', sub: 'STAGE 5', w: 1200, h: 800 },
  { file: 'craft/stage-6-hallmark.jpg', title: 'BIS 916 Hallmarking', sub: 'STAGE 6', w: 1200, h: 800 },
];

assets.forEach((item) => {
  const filePath = path.join(publicDir, item.file);
  const svgContent = generateSVG(item.title, item.sub, item.w || 1200, item.h || 1500);
  fs.writeFileSync(filePath, svgContent, 'utf-8');
});

console.log(`Generated ${assets.length} placeholder image assets successfully.`);
