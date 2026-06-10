const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function createPNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    crcTable[i] = c;
  }
  function crc32(buf) {
    let c = 0xFFFFFFFF;
    for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }
  function chunk(type, data) {
    const l = Buffer.alloc(4); l.writeUInt32BE(data.length);
    const t = Buffer.from(type);
    const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])));
    return Buffer.concat([l, t, data, c]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB, no alpha

  // Triangle vertices: apex top-center, base bottom-left to bottom-right
  const pad = size * 0.12;
  const cx = size / 2, ty = pad;
  const lx = pad, rx = size - pad, by = size - pad;

  function sign(px, py, ax, ay, bx, by2) {
    return (px - bx) * (ay - by2) - (ax - bx) * (py - by2);
  }
  function inTriangle(px, py) {
    const d1 = sign(px, py, cx, ty, rx, by);
    const d2 = sign(px, py, rx, by, lx, by);
    const d3 = sign(px, py, lx, by, cx, ty);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  }

  const raw = [];
  for (let y = 0; y < size; y++) {
    raw.push(0);
    for (let x = 0; x < size; x++) {
      if (inTriangle(x, y)) {
        raw.push(0xD4, 0xAF, 0x37);
      } else {
        raw.push(0x0A, 0x0A, 0x0A);
      }
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(raw), { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))]);
}

const outDir = path.join(__dirname, '../public/icons');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPNG(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPNG(512));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180));
console.log('PWA icons generated in public/icons/');
