import { readdirSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const IMAGES_DIR = join(process.cwd(), 'public', 'images');
const QUALITY = 80; // 80 is a strong size/quality balance for WebP

const exts = new Set(['.jpg', '.jpeg', '.png']);

async function convert(file: string) {
  const ext = extname(file).toLowerCase();
  if (!exts.has(ext)) return;
  const inPath = join(IMAGES_DIR, file);
  const outName = `${basename(file, ext)}.webp`;
  const outPath = join(IMAGES_DIR, outName);
  try {
    const before = statSync(inPath).size;
    await sharp(inPath).webp({ quality: QUALITY }).toFile(outPath);
    const after = statSync(outPath).size;
    const savedPct = Math.round((1 - after / before) * 100);
    console.log(`✓ ${file} → ${outName}  ${(before / 1024).toFixed(1)} KB → ${(after / 1024).toFixed(1)} KB  (-${savedPct}%)`);
  } catch (err) {
    console.error(`✗ ${file} failed:`, err);
  }
}

async function main() {
  const files = readdirSync(IMAGES_DIR);
  for (const f of files) {
    await convert(f);
  }
  console.log('\nDone. WebP files written alongside originals.');
}

main();
