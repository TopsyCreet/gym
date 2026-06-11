/**
 * Flood-fill background remover for brand PNGs.
 * Seeds from all four borders and removes connected near-white pixels.
 * Interior white pixels (e.g. mascot muzzle, eyes) are preserved.
 */
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BRAND_DIR = join(__dirname, '..', 'src', 'assets', 'brand');
const THRESHOLD = 220; // pixels >= this on all RGB channels are "whitish"

async function removeBg(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const px = new Uint8Array(data.buffer);
  const visited = new Uint8Array(width * height);
  const queue = [];

  const idx = (x, y) => y * width + x;
  const isWhitish = (i) => px[i * channels] >= THRESHOLD && px[i * channels + 1] >= THRESHOLD && px[i * channels + 2] >= THRESHOLD;

  const seed = (x, y) => {
    const i = idx(x, y);
    if (!visited[i] && isWhitish(i)) { visited[i] = 1; queue.push(i); }
  };

  // Seed all four borders
  for (let x = 0; x < width; x++) { seed(x, 0); seed(x, height - 1); }
  for (let y = 0; y < height; y++) { seed(0, y); seed(width - 1, y); }

  // BFS — remove connected background white
  while (queue.length) {
    const i = queue.shift();
    px[i * channels + 3] = 0; // fully transparent

    const x = i % width;
    const y = Math.floor(i / width);
    for (const [nx, ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const ni = idx(nx, ny);
        if (!visited[ni] && isWhitish(ni)) { visited[ni] = 1; queue.push(ni); }
      }
    }
  }

  // Overwrite file in place
  await sharp(Buffer.from(px.buffer), { raw: { width, height, channels } })
    .png({ compressionLevel: 9 })
    .toFile(inputPath);
}

const files = (await readdir(BRAND_DIR)).filter(f => f.endsWith('.png'));
console.log(`Processing ${files.length} PNGs in ${BRAND_DIR}…`);
for (const f of files) {
  try {
    await removeBg(join(BRAND_DIR, f));
    console.log(`  ✓ ${f}`);
  } catch (e) {
    console.error(`  ✗ ${f}:`, e.message);
  }
}
console.log('Done.');
