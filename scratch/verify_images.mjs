import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFile = path.join(__dirname, '..', 'app', 'galeria', 'data.ts');
const publicDir = path.join(__dirname, '..', 'public');

async function check() {
  const content = fs.readFileSync(dataFile, 'utf8');
  const match = content.match(/export const galleryData = (\[[\s\S]*\]);/);
  if (!match) {
    console.error("Failed to parse data.ts");
    process.exit(1);
  }
  
  const data = JSON.parse(match[1]);
  console.log(`Checking ${data.length} items...`);
  
  let missing = 0;
  for (const item of data) {
    if (item.img_url && item.img_url.startsWith('/')) {
      const fullPath = path.join(publicDir, item.img_url);
      if (!fs.existsSync(fullPath)) {
        console.log(`Missing: ${item.img_url}`);
        missing++;
      }
    } else {
        console.log(`Item ${item.id} has invalid or null img_url: ${item.img_url}`);
        missing++;
    }
  }
  
  console.log(`Check complete. Total missing: ${missing}`);
}

check();
