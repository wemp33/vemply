// Generuje ikony PWA (logo: litera "V") bez żadnych zależności zewnętrznych.
// node tools/gen-icons.mjs
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(process.cwd(), 'icons');

/* ---------- minimalny enkoder PNG ---------- */
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}

function encodePNG(width, height, rgba) {
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // truecolour + alpha
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- geometria logo ---------- */
// odległość punktu od odcinka
function segDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const len2 = vx * vx + vy * vy;
  let t = len2 === 0 ? 0 : (wx * vx + wy * vy) / len2;
  t = Math.max(0, Math.min(1, t));
  const dx = px - (ax + t * vx), dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}

function lerp(a, b, t) { return a + (b - a) * t; }

// Litera V jako suma dwóch "kapsuł" w znormalizowanych współrzędnych 0..1
const V_A = [0.255, 0.245];  // góra-lewo
const V_B = [0.5, 0.775];    // dół-środek
const V_C = [0.745, 0.245];  // góra-prawo
const V_HALF = 0.0665;       // połowa grubości kreski

function vCoverage(nx, ny) {
  const d = Math.min(
    segDist(nx, ny, V_A[0], V_A[1], V_B[0], V_B[1]),
    segDist(nx, ny, V_C[0], V_C[1], V_B[0], V_B[1])
  );
  return d <= V_HALF ? 1 : 0;
}

/* ---------- renderowanie ikony ---------- */
// tryb 'app'  -> gradientowe tło + białe V (ikona na ekranie głównym)
// tryb 'mask' -> to samo, ale logo mniejsze (bezpieczna strefa maskable)
function renderIcon(size, { padding = 0, radius = null } = {}) {
  const SS = 4; // supersampling
  const buf = Buffer.alloc(size * size * 4);
  const inner = 1 - 2 * padding;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = (x + (sx + 0.5) / SS) / size;
          const fy = (y + (sy + 0.5) / SS) / size;

          // kształt tła (kwadrat lub zaokrąglony kwadrat)
          let bgA = 1;
          if (radius !== null) {
            const rr = radius;
            const cx = Math.min(Math.max(fx, rr), 1 - rr);
            const cy = Math.min(Math.max(fy, rr), 1 - rr);
            const dd = Math.hypot(fx - cx, fy - cy);
            bgA = dd <= rr ? 1 : 0;
          }

          // gradient tła: granat rozjaśniony -> głęboki granat (po przekątnej)
          const t = Math.min(1, Math.max(0, (fx + fy) / 2));
          const bgR = lerp(0x3a, 0x10, t);
          const bgG = lerp(0x57, 0x1c, t);
          const bgB = lerp(0xd6, 0x52, t);

          // logo V
          const lx = (fx - padding) / inner;
          const ly = (fy - padding) / inner;
          const cov = (lx >= 0 && lx <= 1 && ly >= 0 && ly <= 1) ? vCoverage(lx, ly) : 0;

          const pr = cov ? 255 : bgR;
          const pg = cov ? 255 : bgG;
          const pb = cov ? 255 : bgB;

          r += pr * bgA; g += pg * bgA; b += pb * bgA; a += 255 * bgA;
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      buf[i] = Math.round(r / n);
      buf[i + 1] = Math.round(g / n);
      buf[i + 2] = Math.round(b / n);
      buf[i + 3] = Math.round(a / n);
    }
  }
  return encodePNG(size, size, buf);
}

fs.mkdirSync(OUT, { recursive: true });

const targets = [
  ['icon-180.png', 180, { padding: 0.11 }],           // apple-touch-icon (iOS sam zaokrągla)
  ['icon-192.png', 192, { padding: 0.11 }],
  ['icon-512.png', 512, { padding: 0.11 }],
  ['icon-maskable-512.png', 512, { padding: 0.20 }],  // safe zone dla masek Androida
  ['favicon-64.png', 64, { padding: 0.06, radius: 0.22 }],
];

for (const [name, size, opts] of targets) {
  fs.writeFileSync(path.join(OUT, name), renderIcon(size, opts));
  console.log('ok:', name, size + 'x' + size);
}

// wersja wektorowa (favicon.svg)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#3A57D6"/><stop offset="1" stop-color="#101C52"/>
  </linearGradient></defs>
  <rect width="100" height="100" rx="22" fill="url(#g)"/>
  <path d="M28.5 27.5 L50 71 L71.5 27.5" fill="none" stroke="#fff" stroke-width="13.3"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
fs.writeFileSync(path.join(OUT, 'favicon.svg'), svg);
console.log('ok: favicon.svg');
