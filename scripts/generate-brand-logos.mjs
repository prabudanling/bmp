/**
 * Generator logo merek (SVG) — Kompresor Udara, AC & Refrigerasi.
 * Menghasilkan 48 logo wordmark bergaya konsisten ke public/logos/brands/
 * Jalankan: bun scripts/generate-brand-logos.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join(process.cwd(), 'public', 'logos', 'brands')
mkdirSync(OUT, { recursive: true })

const FONT = 'Arial, Helvetica, sans-serif'
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Lebar font tebal ≈ 0.62 × fontSize per karakter */
function fitFont(text, maxW, start = 44, min = 18) {
  let fs = start
  while (text.length * fs * 0.62 > maxW && fs > min) fs--
  return fs
}

/* ============================================================
   Ikon generik (bukan salinan merek asli) — cx, cy, r, main, accent
   ============================================================ */
const hexPoints = (cx, cy, r) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = ((60 * i - 90) * Math.PI) / 180
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`
  }).join(' ')

function iconHex(cx, cy, r, main, accent, letter) {
  let s = `<polygon points="${hexPoints(cx, cy, r)}" fill="${main}"/>`
  if (letter) {
    s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="${accent}"/>`
    s += letterText(cx, cy, letter, r * 0.62, '#fff')
  }
  return s
}

function iconGear(cx, cy, r, main, accent, letter) {
  let s = ''
  for (let i = 0; i < 8; i++) {
    s += `<rect x="${cx - 5.5}" y="${cy - r - 3}" width="11" height="15" rx="3.5" fill="${main}" transform="rotate(${i * 45} ${cx} ${cy})"/>`
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${main}"/>`
  if (letter) {
    s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.6}" fill="${accent}"/>`
    s += letterText(cx, cy, letter, r * 0.52, '#fff')
  } else {
    s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="#fff" opacity="0.9"/>`
  }
  return s
}

function iconCircle(cx, cy, r, main, accent, letter, dot = false) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${main}"/>`
  if (letter) s += letterText(cx - (dot ? 8 : 0), cy, letter, r * 0.62, '#fff')
  if (dot) s += `<circle cx="${cx + r * 0.44}" cy="${cy - r * 0.44}" r="${r * 0.14}" fill="${accent}"/>`
  return s
}

function iconFan(cx, cy, r, main, accent) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${main}" stroke-width="7"/>`
  for (let i = 0; i < 3; i++) {
    s += `<ellipse cx="${cx}" cy="${cy - r * 0.52}" rx="${r * 0.24}" ry="${r * 0.44}" fill="${accent}" transform="rotate(${i * 120} ${cx} ${cy})"/>`
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.22}" fill="${main}"/>`
  return s
}

function iconMountain(cx, cy, r, main, accent) {
  return (
    `<polygon points="${cx - 46},${cy + 34} ${cx - 8},${cy - 38} ${cx + 18},${cy + 10} ${cx + 2},${cy + 34}" fill="${accent}"/>` +
    `<polygon points="${cx - 16},${cy + 34} ${cx + 16},${cy - 24} ${cx + 46},${cy + 34}" fill="${main}"/>` +
    `<polygon points="${cx + 6},${cy - 8} ${cx + 16},${cy - 24} ${cx + 26},${cy - 8} ${cx + 20},${cy - 2} ${cx + 12},${cy - 2}" fill="#fff"/>`
  )
}

function iconBolt(cx, cy, r, main, accent) {
  return (
    `<polygon points="${cx + 10},${cy - 46} ${cx - 22},${cy + 6} ${cx - 4},${cy + 6} ${cx - 12},${cy + 46} ${cx + 24},${cy - 8} ${cx + 4},${cy - 8}" fill="${main}"/>` +
    `<polygon points="${cx + 10},${cy - 46} ${cx - 4},${cy - 12} ${cx + 4},${cy - 8}" fill="${accent}"/>`
  )
}

function iconBar(cx, cy, r, main, accent) {
  return (
    `<rect x="${cx - 34}" y="${cy - 40}" width="26" height="80" rx="13" fill="${main}"/>` +
    `<rect x="${cx + 4}" y="${cy - 22}" width="26" height="62" rx="13" fill="${accent}"/>`
  )
}

function iconDiamond(cx, cy, r, main, accent, letter) {
  return (
    `<rect x="${cx - r * 0.72}" y="${cy - r * 0.72}" width="${r * 1.44}" height="${r * 1.44}" rx="10" fill="${main}" transform="rotate(45 ${cx} ${cy})"/>` +
    (letter ? letterText(cx, cy, letter, r * 0.5, '#fff') : '')
  )
}

function iconStar4(cx, cy, r, main) {
  const p = [
    [0, -1], [0.26, -0.26], [1, 0], [0.26, 0.26],
    [0, 1], [-0.26, 0.26], [-1, 0], [-0.26, -0.26],
  ]
    .map(([x, y]) => `${(cx + x * r * 0.95).toFixed(1)},${(cy + y * r * 0.95).toFixed(1)}`)
    .join(' ')
  return `<polygon points="${p}" fill="${main}"/>`
}

function iconWave(cx, cy, r, main, accent) {
  const w = (y, c) =>
    `<path d="M ${cx - 42} ${cy + y} q 21 -20 42 0 t 42 0" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`
  return w(-12, main) + w(12, accent)
}

function iconTBar(cx, cy, r, main, accent) {
  return (
    `<rect x="${cx - 36}" y="${cy - 40}" width="72" height="21" rx="8" fill="${main}"/>` +
    `<rect x="${cx - 10.5}" y="${cy - 40}" width="21" height="80" rx="8" fill="${accent}"/>`
  )
}

function iconTriDiamond(cx, cy, r, main, accent) {
  const d = (dx, dy, size, c) =>
    `<rect x="${cx + dx - size / 2}" y="${cy + dy - size / 2}" width="${size}" height="${size}" rx="4" fill="${c}" transform="rotate(45 ${cx + dx} ${cy + dy})"/>`
  return d(0, -22, 30, accent) + d(-22, 12, 30, main) + d(22, 12, 30, main)
}

function iconFlower(cx, cy, r, main, accent) {
  let s = ''
  for (let i = 0; i < 5; i++) {
    const a = ((72 * i - 90) * Math.PI) / 180
    s += `<circle cx="${(cx + 19 * Math.cos(a)).toFixed(1)}" cy="${(cy + 19 * Math.sin(a)).toFixed(1)}" r="13.5" fill="${accent}"/>`
  }
  s += `<circle cx="${cx}" cy="${cy}" r="11" fill="${main}"/>`
  return s
}

function iconFlag(cx, cy, r, main, accent) {
  return (
    `<rect x="${cx - 30}" y="${cy - 42}" width="9" height="84" rx="4" fill="${main}"/>` +
    `<polygon points="${cx - 21},${cy - 42} ${cx + 34},${cy - 26} ${cx - 21},${cy - 10}" fill="${accent}"/>`
  )
}

function iconWing(cx, cy, r, main, accent) {
  return (
    `<polygon points="${cx - 44},${cy - 4} ${cx + 44},${cy - 32} ${cx + 44},${cy - 16} ${cx - 44},${cy + 12}" fill="${main}"/>` +
    `<polygon points="${cx - 44},${cy + 18} ${cx + 30},${cy - 2} ${cx + 44},${cy - 2} ${cx + 44},${cy + 4} ${cx - 44},${cy + 34}" fill="${accent}"/>`
  )
}

function iconDrop(cx, cy, r, main, accent) {
  return (
    `<path d="M ${cx} ${cy - 44} C ${cx + 30} ${cy - 8} ${cx + 27} ${cy + 14} ${cx} ${cy + 36} C ${cx - 27} ${cy + 14} ${cx - 30} ${cy - 8} ${cx} ${cy - 44} Z" fill="${main}"/>` +
    `<circle cx="${cx - 10}" cy="${cy + 8}" r="7" fill="${accent}" opacity="0.85"/>`
  )
}

function iconLeaf(cx, cy, r, main, accent) {
  return (
    `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.62}" ry="${r * 0.92}" fill="${main}" transform="rotate(-32 ${cx} ${cy})"/>` +
    `<path d="M ${cx - 26} ${cy + 30} Q ${cx} ${cy} ${cx + 26} ${cy - 30}" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>`
  )
}

function iconArcs(cx, cy, r, main, accent) {
  return (
    `<path d="M ${cx - 14} ${cy + 20} a 20 20 0 0 1 28 0" fill="none" stroke="${accent}" stroke-width="9" stroke-linecap="round"/>` +
    `<path d="M ${cx - 30} ${cy + 32} a 38 38 0 0 1 60 0" fill="none" stroke="${main}" stroke-width="9" stroke-linecap="round"/>` +
    `<circle cx="${cx}" cy="${cy + 42}" r="7" fill="${main}"/>`
  )
}

function letterText(x, y, letter, fs, fill) {
  return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-weight="800" font-size="${fs.toFixed(1)}" fill="${fill}">${esc(letter)}</text>`
}

const ICONS = {
  hex: iconHex,
  gear: iconGear,
  circle: iconCircle,
  fan: iconFan,
  mountain: iconMountain,
  bolt: iconBolt,
  bar: iconBar,
  diamond: iconDiamond,
  star4: iconStar4,
  wave: iconWave,
  tbar: iconTBar,
  tridiamond: iconTriDiamond,
  flower: iconFlower,
  flag: iconFlag,
  wing: iconWing,
  drop: iconDrop,
  leaf: iconLeaf,
  arcs: iconArcs,
}

/* ============================================================
   Data 48 merek — kompresor udara (18), AC (20), refrigerasi (10)
   (termasuk ekspansi: Kobelco, Denair, Ceccato, Fini, Chigo, TCL,
   Polytron, Hisense, Haier, AUX, Dorin, Refcomp)
   main = warna teks, accent = warna ikon sekunder
   ============================================================ */
const BRANDS = [
  // ——— Kompresor Udara / Screw ———
  { slug: 'atlas-copco', name: 'Atlas Copco', icon: 'hex', letter: 'A', main: '#1E4A8E', accent: '#9DC3F0' },
  { slug: 'ingersoll-rand', name: 'Ingersoll|Rand', icon: 'gear', letter: 'IR', main: '#12356B', accent: '#C8102E' },
  { slug: 'sullair', name: 'SULLAIR', icon: 'fan', main: '#D6002B', accent: '#FF7A8A' },
  { slug: 'kaishan', name: 'KAISHAN', icon: 'mountain', main: '#C8102E', accent: '#F5A623' },
  { slug: 'elgi', name: 'ELGi', icon: 'circle', letter: 'E', main: '#005DAA', accent: '#00C2A8' },
  { slug: 'chicago-pneumatic', name: 'Chicago|Pneumatic', icon: 'bolt', main: '#E8541D', accent: '#FDB515' },
  { slug: 'hitachi', name: 'HITACHI', icon: 'bar', main: '#E60027', accent: '#FF9AA2' },
  { slug: 'fusheng', name: 'FUSHENG', icon: 'hex', letter: 'F', main: '#B01E2E', accent: '#E8A33D' },
  { slug: 'swan', name: 'SWAN', icon: 'circle', letter: 'S', main: '#D71920', accent: '#FFB3B8' },
  { slug: 'puma', name: 'PUMA', icon: 'diamond', letter: 'P', main: '#F36F21', accent: '#3D3A36' },
  { slug: 'abac', name: 'ABAC', icon: 'gear', letter: 'A', main: '#003A70', accent: '#D6002B' },
  { slug: 'airman', name: 'AIRMAN', icon: 'wing', main: '#1B3B6F', accent: '#D71920' },
  { slug: 'boge', name: 'BOGE', icon: 'hex', letter: 'B', main: '#4CA22F', accent: '#A6CE39' },
  { slug: 'compair', name: 'CompAir', icon: 'bar', main: '#005EB8', accent: '#E4002B' },
  // ——— Air Conditioner ———
  { slug: 'daikin', name: 'DAIKIN', icon: 'circle', letter: 'D', main: '#0096D6', accent: '#67C7EB' },
  { slug: 'panasonic', name: 'Panasonic', icon: 'arcs', main: '#0F5CA8', accent: '#45B6E8' },
  { slug: 'lg', name: 'LG', icon: 'circle', letter: 'L', dot: true, main: '#A50034', accent: '#FF4D6D' },
  { slug: 'samsung', name: 'SAMSUNG', icon: 'diamond', letter: 'S', main: '#1428A0', accent: '#7C96F5' },
  { slug: 'sharp', name: 'SHARP', icon: 'star4', main: '#E60012', accent: '#FF6B6B' },
  { slug: 'mitsubishi-electric', name: 'Mitsubishi|Electric', icon: 'tridiamond', main: '#E60012', accent: '#FF5252' },
  { slug: 'toshiba', name: 'TOSHIBA', icon: 'tbar', main: '#E60012', accent: '#FF8A8A' },
  { slug: 'gree', name: 'GREE', icon: 'fan', main: '#009F4D', accent: '#7EE0A3' },
  { slug: 'midea', name: 'MIDEA', icon: 'wave', main: '#00A0E9', accent: '#7FDFFF' },
  { slug: 'fujitsu-general', name: 'Fujitsu|General', icon: 'flag', main: '#E4002B', accent: '#00A651' },
  { slug: 'york', name: 'YORK', icon: 'circle', letter: 'Y', main: '#0057B8', accent: '#8FC9F5' },
  { slug: 'carrier', name: 'Carrier', icon: 'leaf', main: '#0072CE', accent: '#64B5F6' },
  { slug: 'sanyo', name: 'SANYO', icon: 'circle', letter: 'S', main: '#004098', accent: '#E60012' },
  { slug: 'aqua', name: 'AQUA', icon: 'drop', main: '#003DA5', accent: '#E4002B' },
  // ——— Kompresor Refrigerasi & Sparepart ———
  { slug: 'bitzer', name: 'BITZER', icon: 'gear', letter: 'B', main: '#005CA9', accent: '#C8102E' },
  { slug: 'copeland', name: 'Copeland', icon: 'circle', letter: 'C', main: '#16437E', accent: '#7FA8DC' },
  { slug: 'danfoss', name: 'DANFOSS', icon: 'diamond', letter: 'D', main: '#E32219', accent: '#FF8A7A' },
  { slug: 'tecumseh', name: 'Tecumseh', icon: 'gear', letter: 'T', main: '#B3202C', accent: '#12356B' },
  { slug: 'kulthorn', name: 'Kulthorn', icon: 'hex', letter: 'K', main: '#005EB8', accent: '#F2A900' },
  { slug: 'embraco', name: 'Embraco', icon: 'drop', main: '#0072BC', accent: '#59B947' },
  { slug: 'sanhua', name: 'SANHUA', icon: 'flower', main: '#E8452C', accent: '#F5A623' },
  { slug: 'frascold', name: 'Frascold', icon: 'hex', letter: 'F', main: '#004A97', accent: '#00A0E9' },
  // ——— Ekspansi: kompresor udara tambahan ———
  { slug: 'kobelco', name: 'KOBELCO', icon: 'hex', letter: 'K', main: '#C8102E', accent: '#F5A9B3' },
  { slug: 'denair', name: 'DENAIR', icon: 'bolt', main: '#0057A8', accent: '#6FB4E8' },
  { slug: 'ceccato', name: 'Ceccato', icon: 'circle', letter: 'C', main: '#00539F', accent: '#E4002B' },
  { slug: 'fini', name: 'FINI', icon: 'diamond', letter: 'F', main: '#D6002B', accent: '#12356B' },
  // ——— Ekspansi: AC tambahan ———
  { slug: 'chigo', name: 'CHIGO', icon: 'wave', main: '#E8452C', accent: '#F5A623' },
  { slug: 'tcl', name: 'TCL', icon: 'circle', letter: 'T', main: '#D40511', accent: '#FF6B7A' },
  { slug: 'polytron', name: 'Polytron', icon: 'diamond', letter: 'P', main: '#ED1C24', accent: '#FFB81C' },
  { slug: 'hisense', name: 'Hisense', icon: 'circle', letter: 'H', main: '#009B77', accent: '#7EDCC8' },
  { slug: 'haier', name: 'Haier', icon: 'wave', main: '#0066B3', accent: '#66B2E8' },
  { slug: 'aux', name: 'AUX', icon: 'circle', letter: 'A', main: '#005BAC', accent: '#E60012' },
  // ——— Ekspansi: refrigerasi tambahan ———
  { slug: 'dorin', name: 'DORIN', icon: 'gear', letter: 'D', main: '#C8102E', accent: '#12356B' },
  { slug: 'refcomp', name: 'Refcomp', icon: 'hex', letter: 'R', main: '#1D3C6E', accent: '#F2A900' },
]

/* ============================================================
   Perakitan SVG — viewBox 480×180, ikon di kiri + wordmark kanan
   ============================================================ */
const CX = 92
const CY = 90
const R = 46
const TEXT_X = 172
const TEXT_MAX_W = 480 - TEXT_X - 18

function buildSvg(b) {
  const icon = ICONS[b.icon](CX, CY, R, b.main, b.accent, b.letter, b.dot)
  const lines = b.name.split('|')
  let text = ''
  if (lines.length === 1) {
    const fs = fitFont(lines[0], TEXT_MAX_W)
    text = `<text x="${TEXT_X}" y="${CY}" dominant-baseline="central" font-family="${FONT}" font-weight="800" letter-spacing="0.5" font-size="${fs}" fill="${b.main}">${esc(lines[0])}</text>`
  } else {
    const fs1 = fitFont(lines[0], TEXT_MAX_W, 36, 20)
    const fs2 = fitFont(lines[1], TEXT_MAX_W, 30, 16)
    const h1 = fs1 * 0.62
    const h2 = fs2 * 0.62
    const mid = CY
    text =
      `<text x="${TEXT_X}" y="${mid - h2 / 2}" text-anchor="start" font-family="${FONT}" font-weight="800" letter-spacing="0.5" font-size="${fs1}" fill="${b.main}">${esc(lines[0])}</text>` +
      `<text x="${TEXT_X}" y="${mid + h2 + 6}" text-anchor="start" font-family="${FONT}" font-weight="700" letter-spacing="0.5" font-size="${fs2}" fill="${b.main}" opacity="0.82">${esc(lines[1])}</text>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 180" width="480" height="180" role="img" aria-label="${esc(b.name.replace('|', ' '))}">
<title>${esc(b.name.replace('|', ' '))}</title>
${icon}
${text}
</svg>
`
}

/* ============================================================ */
let written = 0
const manifest = []
for (const b of BRANDS) {
  writeFileSync(join(OUT, `${b.slug}.svg`), buildSvg(b), 'utf8')
  manifest.push({ slug: b.slug, name: b.name.replace('|', ' '), url: `/logos/brands/${b.slug}.svg` })
  written++
}
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
console.log(`✔ ${written} logo SVG ditulis ke ${OUT}`)
