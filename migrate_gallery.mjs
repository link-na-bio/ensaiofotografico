import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = "https://ruildppqtxrgycgsactu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1aWxkcHBxdHhyZ3ljZ3NhY3R1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1MjA0OTYsImV4cCI6MjA4OTA5NjQ5Nn0.iZI_yzmOQBJWMdDUetuyRLFKHMrJ_SHkTOetFYnUQ2w";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials from .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("Fetching estilos...");
  const { data: estilos, error } = await supabase
    .from('estilos')
    .select('*')
    .order('criado_em', { ascending: false });

  if (error) {
    console.error("Error fetching", error);
    return;
  }

  console.log(`Found ${estilos.length} estilos.`);

  const publicGaleriaDir = path.join(__dirname, 'public', 'images', 'galeria');
  if (!fs.existsSync(publicGaleriaDir)) {
    fs.mkdirSync(publicGaleriaDir, { recursive: true });
  }

  const staticData = [];

  for (let i = 0; i < estilos.length; i++) {
    const estilo = estilos[i];
    let localUrl = null;

    if (estilo.img_url) {
      console.log(`Processing [${i+1}/${estilos.length}] ${estilo.titulo}...`);
      try {
        const uniqueId = estilo.id || `estilo_${i}`;
        const safeTitle = (estilo.titulo || 'img').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        const fileName = `${safeTitle}-${uniqueId}.webp`;
        const localPath = path.join(publicGaleriaDir, fileName);
        localUrl = `/images/galeria/${fileName}`;

        if (fs.existsSync(localPath)) {
          console.log(` -> Already exists, skipping download.`);
        } else {
          const response = await fetch(estilo.img_url);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(localPath);

          console.log(` -> Saved to ${localUrl}`);
        }
      } catch (err) {
        console.error(` -> Failed to process image ${estilo.img_url}:`, err.message);
        localUrl = estilo.img_url; // fallback to original if fail
      }
    }

    staticData.push({
      ...estilo,
      img_url: localUrl
    });
  }

  console.log("Writing app/galeria/data.ts...");
  const dataTsContent = `export const galleryData = ${JSON.stringify(staticData, null, 2)};\n`;
  fs.writeFileSync(path.join(__dirname, 'app', 'galeria', 'data.ts'), dataTsContent);
  console.log("Done.");
}

main();
