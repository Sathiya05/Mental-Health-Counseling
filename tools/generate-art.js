/* Generates the illustrated SVG artwork set for the Serenity site.
   Run: node tools/generate-art.js                                     */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'assets', 'images');
fs.mkdirSync(OUT, { recursive: true });

const P = {
  teal: '#3F7C85',
  tealDk: '#2E555C',
  tealDp: '#142B30',
  tealLt: '#9DC4C9',
  tealPale: '#C6DEE1',
  sand: '#E4D9C8',
  sandDk: '#D5C6AF',
  sandDp: '#C2AD8E',
  cream: '#F7F3EC',
  cream2: '#FBF9F5',
  clay: '#C1785C',
  clayLt: '#D69A7B',
  sage: '#7E9B85',
  sageLt: '#9BB49C',
  ink: '#111111',
  grey: '#6B6B67'
};

const SKIN = ['#EBC9AC', '#DCA983', '#C68E6A', '#A9714F', '#F0D2BB', '#8D5A3B'];
const HAIR = ['#241C19', '#33241C', '#4A3527', '#1B1614', '#5B4331', '#2A2A2E'];
const GARB = [P.teal, P.sandDk, P.sage, P.clay, P.tealDk, P.sandDp];

/* deterministic pseudo random ------------------------------------------------ */
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const pick = (r, arr) => arr[Math.floor(r() * arr.length) % arr.length];

/* shared defs --------------------------------------------------------------- */
function grainDefs(id) {
  return `
  <filter id="grain-${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
    <feComponentTransfer><feFuncA type="linear" slope="0.16"/></feComponentTransfer>
  </filter>
  <filter id="soft-${id}" x="-25%" y="-25%" width="150%" height="150%">
    <feGaussianBlur stdDeviation="18"/>
  </filter>`;
}
const grainRect = (w, h, id, o = 0.5) =>
  `<rect width="${w}" height="${h}" filter="url(#grain-${id})" opacity="${o}" style="mix-blend-mode:multiply"/>`;

/* figure: seated person, baseline at (x,y), height ~ h ------------------------ */
function figure(x, y, h, o) {
  const { skin, hair, garb, hairStyle, facing = 1, glass = false, beard = false } = o;
  const hr = h * 0.15; // head radius
  const headY = y - h + hr;
  const neckW = hr * 0.72;
  const bodyTop = headY + hr * 1.55;
  const bodyH = h * 0.36;
  const shoulderW = h * 0.34;

  // torso + lap (seated)
  const torso = `M ${x - shoulderW / 2} ${bodyTop + shoulderW * 0.55}
    q 0 ${-shoulderW * 0.55} ${shoulderW / 2} ${-shoulderW * 0.5}
    l ${shoulderW / 2} 0
    q ${shoulderW / 2} ${-shoulderW * 0.05} ${shoulderW / 2} ${shoulderW * 0.5}
    l 0 ${bodyH}
    l ${-shoulderW} 0 Z`;

  const lap = `M ${x - shoulderW * 0.62} ${bodyTop + bodyH}
    q ${facing * shoulderW * 0.62} ${bodyH * 0.12} ${facing * shoulderW * 1.02} ${bodyH * 0.46}
    l 0 ${h * 0.1}
    l ${-facing * shoulderW * 1.02} 0 Z`;

  const legs = `M ${x - shoulderW * 0.5} ${y - h * 0.09}
    l ${facing * shoulderW * 0.92} 0
    l 0 ${h * 0.085}
    l ${-facing * shoulderW * 0.92} 0 Z`;

  // arm toward the listener
  const arm = `<path d="M ${x + facing * shoulderW * 0.34} ${bodyTop + shoulderW * 0.28}
      q ${facing * h * 0.1} ${h * 0.1} ${facing * h * 0.15} ${h * 0.2}"
      stroke="${garb}" stroke-width="${h * 0.075}" stroke-linecap="round" fill="none"/>
    <circle cx="${x + facing * (shoulderW * 0.34 + h * 0.15)}" cy="${bodyTop + shoulderW * 0.28 + h * 0.2}"
      r="${h * 0.036}" fill="${skin}"/>`;

  // hair
  let hairShape = '';
  const cap = `M ${x - hr * 1.04} ${headY + hr * 0.1}
      a ${hr * 1.04} ${hr * 1.1} 0 0 1 ${hr * 2.08} 0
      q ${-hr * 0.2} ${-hr * 0.5} ${-hr} ${-hr * 0.42}
      q ${-hr * 0.8} ${hr * 0.08} ${-hr * 1.08} ${hr * 0.42} Z`;
  if (hairStyle === 'bun') {
    hairShape = `<path d="${cap}" fill="${hair}"/><circle cx="${x}" cy="${headY - hr * 1.02}" r="${hr * 0.42}" fill="${hair}"/>`;
  } else if (hairStyle === 'long') {
    hairShape = `<path d="${cap}" fill="${hair}"/>
      <path d="M ${x - hr * 1.02} ${headY - hr * 0.1} q ${-hr * 0.3} ${hr * 2.4} ${hr * 0.16} ${hr * 3.1}
        l ${hr * 0.9} 0 q ${hr * 0.1} ${-hr * 1.3} ${-hr * 0.12} ${-hr * 1.9} Z" fill="${hair}"/>
      <path d="M ${x + hr * 1.02} ${headY - hr * 0.1} q ${hr * 0.3} ${hr * 2.4} ${-hr * 0.16} ${hr * 3.1}
        l ${-hr * 0.9} 0 q ${-hr * 0.1} ${-hr * 1.3} ${hr * 0.12} ${-hr * 1.9} Z" fill="${hair}"/>`;
  } else if (hairStyle === 'curly') {
    let c = '';
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (Math.PI * i) / 6;
      c += `<circle cx="${x + Math.cos(a) * hr * 1.0}" cy="${headY + Math.sin(a) * hr * 1.0}" r="${hr * 0.42}" fill="${hair}"/>`;
    }
    hairShape = c + `<circle cx="${x}" cy="${headY}" r="${hr * 1.02}" fill="${hair}"/>`;
  } else if (hairStyle === 'wrap') {
    hairShape = `<path d="M ${x - hr * 1.16} ${headY + hr * 0.5}
        a ${hr * 1.16} ${hr * 1.2} 0 0 1 ${hr * 2.32} 0
        q ${-hr * 0.5} ${-hr * 0.3} ${-hr * 1.16} ${-hr * 0.34}
        q ${-hr * 0.66} ${hr * 0.04} ${-hr * 1.16} ${hr * 0.34} Z" fill="${garb}"/>
      <path d="M ${x - hr * 1.14} ${headY + hr * 0.12} a ${hr * 1.14} ${hr * 1.2} 0 0 1 ${hr * 2.28} 0 Z" fill="${hair}"/>`;
  } else if (hairStyle === 'beard') {
    hairShape = `<path d="${cap}" fill="${hair}"/>
      <path d="M ${x - hr * 0.92} ${headY + hr * 0.16} q ${hr * 0.3} ${hr * 1.5} ${hr * 0.92} ${hr * 1.5}
        q ${hr * 0.62} 0 ${hr * 0.92} ${-hr * 1.5} q ${-hr * 0.5} ${hr * 0.35} ${-hr * 0.92} ${hr * 0.35}
        q ${-hr * 0.42} 0 ${-hr * 0.92} ${-hr * 0.35} Z" fill="${hair}"/>`;
  } else {
    hairShape = `<path d="${cap}" fill="${hair}"/>`;
  }

  const face = `<circle cx="${x - hr * 0.34}" cy="${headY + hr * 0.05}" r="${hr * 0.075}" fill="${P.ink}" opacity="0.72"/>
    <circle cx="${x + hr * 0.34}" cy="${headY + hr * 0.05}" r="${hr * 0.075}" fill="${P.ink}" opacity="0.72"/>
    <path d="M ${x - hr * 0.28} ${headY + hr * 0.46} q ${hr * 0.28} ${hr * 0.24} ${hr * 0.56} 0"
      stroke="${P.ink}" stroke-width="${hr * 0.075}" fill="none" opacity="0.5" stroke-linecap="round"/>`;

  const glasses = glass
    ? `<g fill="none" stroke="${P.tealDp}" stroke-width="${hr * 0.11}" opacity="0.8">
        <circle cx="${x - hr * 0.34}" cy="${headY + hr * 0.05}" r="${hr * 0.29}"/>
        <circle cx="${x + hr * 0.34}" cy="${headY + hr * 0.05}" r="${hr * 0.29}"/>
        <path d="M ${x - hr * 0.05} ${headY + hr * 0.05} h ${hr * 0.1}"/>
      </g>`
    : '';

  return `<g>
    <path d="${legs}" fill="${garb}" opacity="0.92"/>
    <path d="${lap}" fill="${garb}"/>
    ${arm}
    <path d="${torso}" fill="${garb}"/>
    <rect x="${x - neckW / 2}" y="${headY + hr * 0.72}" width="${neckW}" height="${hr * 0.9}" rx="${neckW * 0.4}" fill="${skin}"/>
    <circle cx="${x}" cy="${headY}" r="${hr}" fill="${skin}"/>
    ${hairShape}
    ${face}
    ${glasses}
  </g>`;
}

/* plant ---------------------------------------------------------------------- */
function plant(x, y, s, pot = P.clay) {
  const leaf = (dx, dy, rot, sc = 1) =>
    `<path d="M 0 0 q ${18 * sc} ${-16 * sc} ${4 * sc} ${-46 * sc} q ${-14 * sc} ${26 * sc} ${-4 * sc} ${46 * sc} Z"
      fill="${P.sage}" transform="translate(${dx},${dy}) rotate(${rot})"/>`;
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M 0 0 v -74" stroke="${P.sage}" stroke-width="5" stroke-linecap="round" fill="none"/>
    ${leaf(0, -70, -26)}${leaf(0, -70, 26)}${leaf(0, -92, -12, 0.85)}${leaf(0, -92, 12, 0.85)}
    <path d="M -30 0 h 60 l -8 54 h -44 Z" fill="${pot}"/>
    <path d="M -32 -6 h 64 v 12 h -64 Z" rx="6" fill="${pot}" opacity="0.85"/>
  </g>`;
}

/* window --------------------------------------------------------------------- */
function archWindow(x, y, w, h, rays = true) {
  const r = w / 2;
  const frame = `M ${x} ${y + h} v ${-h + r} a ${r} ${r} 0 0 1 ${r * 2} 0 v ${h - r} Z`;
  const glass = `M ${x + 9} ${y + h - 9} v ${-h + r - 8} a ${r - 9} ${r - 9} 0 0 1 ${(r - 9) * 2} 0 v ${h - r - 1} Z`;
  return `<g>
    <path d="${frame}" fill="${P.sandDk}"/>
    <path d="${glass}" fill="${P.cream}"/>
    <g stroke="${P.sandDk}" stroke-width="7">
      <path d="M ${x + w / 2} ${y + h - r} v ${-(h - r)}"/>
      <path d="M ${x + 9} ${y + h - h * 0.52} h ${w - 18}"/>
    </g>
    <circle cx="${x + w / 2 + r * 0.42}" cy="${y + h * 0.3}" r="${r * 0.24}" fill="${P.sandDp}" opacity="0.5"/>
    ${rays ? `<path d="M ${x} ${y + h - h * 0.55} L ${x - 240} ${y + h + 260} L ${x + w} ${y + h + 260} L ${x + w} ${y + h - h * 0.2} Z" fill="#FFFFFF" opacity="0.34"/>` : ''}
  </g>`;
}

/* chair ---------------------------------------------------------------------- */
function chair(x, y, s = 1, c = P.teal) {
  return `<g transform="translate(${x},${y}) scale(${s})">
    <path d="M -46 -6 h 92 v 12 h -92 Z" fill="${c}"/>
    <path d="M -44 -84 q 44 -14 88 0 v 80 h -88 Z" fill="${c}" opacity="0.9"/>
    <path d="M -40 -8 v 46 M 40 -8 v 46" stroke="${P.tealDp}" stroke-width="7" stroke-linecap="round" opacity="0.5"/>
  </g>`;
}

/* ---------------------------------------------------------------- SCENES --- */
function scene(id, opts) {
  const { wall, floor, rays = true, build } = opts;
  const W = 800;
  const H = 600;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>${grainDefs(id)}
    <linearGradient id="wall-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${wall[0]}"/><stop offset="1" stop-color="${wall[1]}"/>
    </linearGradient>
    <linearGradient id="ray-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="clip-${id}"><rect width="${W}" height="${H}"/></clipPath>
  </defs>
  <g clip-path="url(#clip-${id})">
    <rect width="${W}" height="${H}" fill="url(#wall-${id})"/>
    ${build(rays)}
    <rect y="470" width="${W}" height="${H - 470}" fill="${floor}"/>
    <rect y="466" width="${W}" height="5" fill="${P.sandDp}" opacity="0.45"/>
    ${grainRect(W, H, id, 0.45)}
  </g>
</svg>`;
}

/* hero: two people in conversation, warm room ------------------------------- */
const heroA = scene('heroA', {
  wall: [P.cream, P.sand],
  floor: '#EFE6D8',
  build: (rays) => `
    ${archWindow(556, 130, 170, 300, rays)}
    <rect x="96" y="150" width="132" height="164" rx="10" fill="${P.cream2}" stroke="${P.sandDp}" stroke-width="6"/>
    <path d="M 118 268 q 34 -46 60 -18 q 20 22 34 -6" stroke="${P.tealLt}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="140" cy="188" r="15" fill="${P.sandDp}" opacity="0.6"/>
    ${plant(66, 470, 0.92)}
    ${chair(300, 470, 0.98, P.teal)}
    ${chair(516, 470, 0.98, P.tealDk)}
    <ellipse cx="404" cy="546" rx="238" ry="40" fill="${P.sandDp}" opacity="0.35"/>
    ${figure(322, 546, 250, { skin: SKIN[0], hair: HAIR[1], garb: P.teal, hairStyle: 'bun', facing: 1 })}
    ${figure(492, 546, 244, { skin: SKIN[2], hair: HAIR[0], garb: P.sandDp, hairStyle: 'short', facing: -1 })}
    <path d="M 604 470 h 78 v -14 a 8 8 0 0 0 -8 -8 h -62 a 8 8 0 0 0 -8 8 Z" fill="${P.sandDp}" opacity="0.8"/>
    <path d="M 700 452 l 30 -66 a 16 16 0 0 1 30 12 l -22 58 Z" fill="${P.clayLt}"/>
    <path d="M 728 386 l 26 10" stroke="${P.sandDp}" stroke-width="7" stroke-linecap="round"/>`
});

/* hero split (Home 2): lone figure by a large window -------------------------- */
const heroB = scene('heroB', {
  wall: ['#F3EFE7', '#E9DFD0'],
  floor: '#E7DCCB',
  build: (rays) => `
    ${archWindow(430, 96, 250, 360, rays)}
    <rect x="72" y="196" width="120" height="150" rx="8" fill="${P.cream2}" stroke="${P.sandDp}" stroke-width="6"/>
    <circle cx="132" cy="240" r="26" fill="${P.tealPale}"/>
    <path d="M 92 320 q 40 -60 84 -16" stroke="${P.sandDp}" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.7"/>
    ${plant(340, 470, 1.06)}
    <ellipse cx="250" cy="552" rx="196" ry="34" fill="${P.sandDp}" opacity="0.3"/>
    ${figure(258, 548, 268, { skin: SKIN[4], hair: HAIR[2], garb: P.sage, hairStyle: 'long', facing: 1 })}
    <circle cx="470" cy="196" r="52" fill="#FFFFFF" opacity="0.5"/>`
});

/* approach: hands / listening ------------------------------------------------ */
const approach = scene('approach', {
  wall: ['#EEF3F3', '#DCE8E9'],
  floor: '#E2EDEE',
  build: (rays) => `
    ${archWindow(88, 128, 150, 262, rays)}
    <rect x="330" y="120" width="180" height="210" rx="12" fill="${P.cream2}" stroke="${P.tealPale}" stroke-width="7"/>
    <path d="M 356 200 q 40 -60 78 -14 q 26 32 50 -6" stroke="${P.tealLt}" stroke-width="8" fill="none" stroke-linecap="round"/>
    ${plant(690, 470, 0.95, P.teal)}
    <ellipse cx="420" cy="548" rx="250" ry="36" fill="${P.tealLt}" opacity="0.28"/>
    ${figure(348, 546, 252, { skin: SKIN[1], hair: HAIR[3], garb: P.teal, hairStyle: 'curly', facing: 1, glass: true })}
    ${figure(512, 546, 240, { skin: SKIN[5], hair: HAIR[0], garb: P.clayLt, hairStyle: 'wrap', facing: -1 })}`
});

/* family / group circle ------------------------------------------------------ */
const group = scene('group', {
  wall: [P.cream, P.sand],
  floor: '#EFE6D8',
  build: (rays) => `
    ${archWindow(60, 120, 140, 250, rays)}
    <circle cx="700" cy="150" r="86" fill="${P.tealPale}" opacity="0.5"/>
    ${plant(716, 470, 0.86)}
    <ellipse cx="400" cy="548" rx="286" ry="44" fill="${P.sandDp}" opacity="0.3"/>
    ${figure(214, 540, 226, { skin: SKIN[0], hair: HAIR[2], garb: P.teal, hairStyle: 'long', facing: 1 })}
    ${figure(392, 552, 234, { skin: SKIN[3], hair: HAIR[0], garb: P.sandDp, hairStyle: 'short', facing: 1 })}
    ${figure(566, 540, 224, { skin: SKIN[1], hair: HAIR[4], garb: P.sage, hairStyle: 'bun', facing: -1 })}
    ${figure(310, 566, 176, { skin: SKIN[4], hair: HAIR[1], garb: P.clayLt, hairStyle: 'curly', facing: -1 })}
    ${figure(478, 566, 172, { skin: SKIN[2], hair: HAIR[3], garb: P.tealLt, hairStyle: 'beard', facing: 1 })}`
});

/* solo / calm ---------------------------------------------------------------- */
const calm = scene('calm', {
  wall: ['#F4F0E8', '#E7DDCE'],
  floor: '#EADFCF',
  build: (rays) => `
    ${archWindow(500, 110, 200, 320, rays)}
    <rect x="90" y="170" width="150" height="180" rx="10" fill="${P.cream2}" stroke="${P.sandDp}" stroke-width="6"/>
    <path d="M 120 210 h 90 M 120 244 h 90 M 120 278 h 62" stroke="${P.tealPale}" stroke-width="9" stroke-linecap="round"/>
    ${plant(52, 470, 1.1)}
    <ellipse cx="300" cy="552" rx="216" ry="36" fill="${P.sandDp}" opacity="0.28"/>
    ${figure(300, 548, 260, { skin: SKIN[0], hair: HAIR[1], garb: P.tealDk, hairStyle: 'bun', facing: 1 })}
    <path d="M 400 512 q 40 -18 78 -2 v 34 q -38 -16 -78 4 Z" fill="${P.sandDp}"/>`
});

/* ------------------------------------------------------------- PORTRAITS --- */
function portrait(id, seed, style) {
  const r = rng(seed);
  const W = 640;
  const H = 800;
  const skin = SKIN[seed % SKIN.length];
  const hair = HAIR[seed % HAIR.length];
  const garb = GARB[seed % GARB.length];
  const bgA = style === 'teal' ? P.teal : P.sand;
  const bgB = style === 'teal' ? P.tealDk : P.sandDk;
  const hairStyle = ['bun', 'long', 'curly', 'wrap', 'beard', 'short'][seed % 6];
  const glass = seed % 3 === 0;
  const cx = W / 2;
  const headR = 118;
  const headY = 366;
  const hairShape = (() => {
    const cap = `M ${cx - headR * 1.06} ${headY + headR * 0.12} a ${headR * 1.06} ${headR * 1.12} 0 0 1 ${headR * 2.12} 0 q ${-headR * 0.22} ${-headR * 0.56} ${-headR * 1.02} ${-headR * 0.44} q ${-headR * 0.82} ${headR * 0.1} ${-headR * 1.1} ${headR * 0.44} Z`;
    if (hairStyle === 'bun')
      return `<path d="${cap}" fill="${hair}"/><circle cx="${cx}" cy="${headY - headR * 1.04}" r="${headR * 0.44}" fill="${hair}"/>`;
    if (hairStyle === 'long')
      return `<path d="${cap}" fill="${hair}"/>
        <path d="M ${cx - headR * 1.04} ${headY - headR * 0.12} q ${-headR * 0.34} ${headR * 2.6} ${headR * 0.16} ${headR * 3.3} l ${headR * 0.98} 0 q ${headR * 0.12} ${-headR * 1.4} ${-headR * 0.14} ${-headR * 2} Z" fill="${hair}"/>
        <path d="M ${cx + headR * 1.04} ${headY - headR * 0.12} q ${headR * 0.34} ${headR * 2.6} ${-headR * 0.16} ${headR * 3.3} l ${-headR * 0.98} 0 q ${-headR * 0.12} ${-headR * 1.4} ${headR * 0.14} ${-headR * 2} Z" fill="${hair}"/>`;
    if (hairStyle === 'curly') {
      let c = '';
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (Math.PI * i) / 8;
        c += `<circle cx="${cx + Math.cos(a) * headR * 1.0}" cy="${headY + Math.sin(a) * headR * 1.0}" r="${headR * 0.44}" fill="${hair}"/>`;
      }
      return c + `<circle cx="${cx}" cy="${headY}" r="${headR * 1.03}" fill="${hair}"/>`;
    }
    if (hairStyle === 'wrap')
      return `<path d="M ${cx - headR * 1.2} ${headY + headR * 0.6} a ${headR * 1.2} ${headR * 1.24} 0 0 1 ${headR * 2.4} 0 q ${-headR * 0.52} ${-headR * 0.34} ${-headR * 1.2} ${-headR * 0.4} q ${-headR * 0.68} ${headR * 0.06} ${-headR * 1.2} ${headR * 0.4} Z" fill="${garb}"/>
        <path d="M ${cx - headR * 1.16} ${headY + headR * 0.14} a ${headR * 1.16} ${headR * 1.24} 0 0 1 ${headR * 2.32} 0 Z" fill="${hair}"/>`;
    if (hairStyle === 'beard')
      return `<path d="${cap}" fill="${hair}"/>
        <path d="M ${cx - headR * 0.94} ${headY + headR * 0.18} q ${headR * 0.32} ${headR * 1.54} ${headR * 0.94} ${headR * 1.54} q ${headR * 0.62} 0 ${headR * 0.94} ${-headR * 1.54} q ${-headR * 0.5} ${headR * 0.36} ${-headR * 0.94} ${headR * 0.36} q ${-headR * 0.44} 0 ${-headR * 0.94} ${-headR * 0.36} Z" fill="${hair}"/>`;
    return `<path d="${cap}" fill="${hair}"/>`;
  })();

  const deco = style === 'teal'
    ? `<circle cx="562" cy="132" r="58" fill="#FFFFFF" opacity="0.12"/>
       <path d="M 60 620 q 60 -70 128 -8" stroke="#FFFFFF" stroke-width="5" fill="none" opacity="0.18" stroke-linecap="round"/>`
    : `<circle cx="98" cy="118" r="46" fill="${P.tealPale}" opacity="0.55"/>
       <circle cx="556" cy="150" r="24" fill="${P.clayLt}" opacity="0.45"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>${grainDefs(id)}
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${bgA}"/><stop offset="1" stop-color="${bgB}"/>
    </linearGradient>
    <clipPath id="pc-${id}"><rect width="${W}" height="${H}"/></clipPath>
  </defs>
  <g clip-path="url(#pc-${id})">
    <rect width="${W}" height="${H}" fill="url(#bg-${id})"/>
    ${deco}
    <circle cx="${cx}" cy="${headY}" r="${headR * 2.5}" fill="#FFFFFF" opacity="0.1"/>
    <path d="M ${cx - 232} ${H} q 0 -214 232 -214 q 232 0 232 214 Z" fill="${garb}"/>
    <path d="M ${cx - 62} ${H - 196} q 62 -44 124 0 l 0 196 h -124 Z" fill="${garb}" opacity="0.82"/>
    <rect x="${cx - 34}" y="${headY + headR * 0.7}" width="68" height="82" rx="30" fill="${skin}"/>
    <circle cx="${cx}" cy="${headY}" r="${headR}" fill="${skin}"/>
    ${hairShape}
    <circle cx="${cx - 40}" cy="${headY + 6}" r="7" fill="${P.ink}" opacity="0.7"/>
    <circle cx="${cx + 40}" cy="${headY + 6}" r="7" fill="${P.ink}" opacity="0.7"/>
    <path d="M ${cx - 32} ${headY + 52} q 32 28 64 0" stroke="${P.ink}" stroke-width="7" fill="none" opacity="0.45" stroke-linecap="round"/>
    ${glass ? `<g fill="none" stroke="${P.tealDp}" stroke-width="6" opacity="0.75">
        <rect x="${cx - 78}" y="${headY - 26}" width="76" height="62" rx="18"/>
        <rect x="${cx + 2}" y="${headY - 26}" width="76" height="62" rx="18"/>
        <path d="M ${cx - 2} ${headY + 4} h 4"/>
      </g>` : ''}
    ${grainRect(W, H, id, 0.5)}
  </g>
</svg>`;
}

/* ------------------------------------------------------------- ABSTRACTS --- */
function abstract(id, seed, motif) {
  const r = rng(seed);
  const W = 800;
  const H = 500;
  const scheme = [
    [P.sand, P.sandDk, P.tealLt],
    [P.tealPale, P.teal, P.cream],
    [P.cream, P.sand, P.clayLt],
    ['#E7EEEC', P.sageLt, P.tealDk],
    ['#F1EAE0', P.clayLt, P.sandDp]
  ][seed % 5];

  const motifs = {
    waves: `<path d="M -40 ${H * 0.66} q 200 -120 400 0 q 200 120 400 0 v ${H} h -800 Z" fill="${scheme[1]}" opacity="0.9"/>
            <path d="M -40 ${H * 0.78} q 200 -110 400 0 q 200 110 400 0 v ${H} h -800 Z" fill="${scheme[2]}" opacity="0.75"/>
            <circle cx="${W * 0.78}" cy="${H * 0.24}" r="66" fill="#FFFFFF" opacity="0.5"/>`,
    arcs: `<circle cx="${W * 0.3}" cy="${H * 0.72}" r="150" fill="${scheme[1]}"/>
           <circle cx="${W * 0.52}" cy="${H * 0.5}" r="120" fill="${scheme[2]}" opacity="0.85"/>
           <g stroke="${scheme[2]}" stroke-width="6" fill="none" opacity="0.7">
             <path d="M ${W * 0.6} ${H * 0.78} a 120 120 0 0 1 200 -70"/>
             <path d="M ${W * 0.6} ${H * 0.86} a 150 150 0 0 1 250 -90"/>
           </g>`,
    dots: `<g fill="${scheme[1]}">
             ${Array.from({ length: 7 }, (_, i) =>
               Array.from({ length: 4 }, (_, j) => `<circle cx="${120 + i * 88}" cy="${110 + j * 88}" r="${8 + ((i + j) % 3) * 5}"/>`).join('')
             ).join('')}
           </g>
           <circle cx="${W * 0.74}" cy="${H * 0.3}" r="92" fill="${scheme[2]}" opacity="0.8"/>`,
    leaf: `<path d="M ${W * 0.5} ${H * 0.9} q -180 -180 40 -330 q 210 130 130 330 Z" fill="${scheme[1]}"/>
           <path d="M ${W * 0.5} ${H * 0.9} q 190 -160 250 -300 q -120 90 -250 300 Z" fill="${scheme[2]}" opacity="0.85"/>
           <path d="M ${W * 0.5} ${H * 0.9} v -280" stroke="${P.cream}" stroke-width="7" opacity="0.7" stroke-linecap="round"/>`,
    steps: `<g fill="${scheme[1]}">
              <rect x="90" y="300" width="140" height="120" rx="16"/>
              <rect x="250" y="230" width="140" height="190" rx="16" opacity="0.9"/>
              <rect x="410" y="160" width="140" height="260" rx="16" opacity="0.8"/>
            </g>
            <rect x="570" y="90" width="140" height="330" rx="16" fill="${scheme[2]}" opacity="0.75"/>`
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>${grainDefs(id)}
    <linearGradient id="ab-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${scheme[0]}"/><stop offset="1" stop-color="${P.cream2}"/>
    </linearGradient>
    <clipPath id="abclip-${id}"><rect width="${W}" height="${H}"/></clipPath>
  </defs>
  <g clip-path="url(#abclip-${id})">
    <rect width="${W}" height="${H}" fill="url(#ab-${id})"/>
    ${motifs[motif]}
    ${grainRect(W, H, id, 0.4)}
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ WRITE --- */
const files = {
  'hero-counseling.svg': heroA,
  'hero-studio.svg': heroB,
  'approach-session.svg': approach,
  'session-group.svg': group,
  'session-solo.svg': calm,
  'about-space.svg': scene('aboutSpace', {
    wall: [P.cream, P.sand],
    floor: '#EFE6D8',
    build: (rays) => `
      ${archWindow(90, 120, 160, 280, rays)}
      <rect x="470" y="140" width="230" height="200" rx="10" fill="${P.cream2}" stroke="${P.sandDp}" stroke-width="6"/>
      <path d="M 500 260 q 60 -84 110 -20 q 34 44 62 -12" stroke="${P.tealLt}" stroke-width="8" fill="none" stroke-linecap="round"/>
      ${plant(390, 470, 1.02)}
      <path d="M 96 470 h 190 q 22 0 22 -22 v -22 h -234 v 22 q 0 22 22 22 Z" fill="${P.teal}"/>
      <ellipse cx="330" cy="546" rx="270" ry="40" fill="${P.sandDp}" opacity="0.28"/>`
  }),
  'contact-welcome.svg': scene('contactWelcome', {
    wall: ['#F2F7F8', '#DEEAEB'],
    floor: '#E3EEEE',
    build: (rays) => `
      ${archWindow(470, 120, 180, 290, rays)}
      ${plant(70, 470, 1.08, P.teal)}
      <circle cx="410" cy="210" r="74" fill="${P.tealPale}" opacity="0.6"/>
      <ellipse cx="300" cy="548" rx="230" ry="36" fill="${P.tealLt}" opacity="0.3"/>
      ${figure(300, 544, 254, { skin: SKIN[3], hair: HAIR[2], garb: P.tealDk, hairStyle: 'wrap', facing: 1 })}
      <path d="M 386 500 q 44 -22 84 -4 v 44 q -40 -18 -84 4 Z" fill="${P.sand}"/>`
  }),
  'login-side.svg': scene('loginSide', {
    wall: ['#F1F6F7', '#DCE9EA'],
    floor: '#E6F0F0',
    build: (rays) => `
      ${archWindow(430, 110, 230, 330, rays)}
      ${plant(96, 470, 1.0)}
      <ellipse cx="290" cy="550" rx="230" ry="38" fill="${P.tealLt}" opacity="0.32"/>
      ${figure(292, 546, 262, { skin: SKIN[1], hair: HAIR[3], garb: P.teal, hairStyle: 'curly', facing: 1, glass: true })}`
  }),
  'cta-band.svg': scene('ctaBand', {
    wall: [P.teal, P.tealDk],
    floor: '#274A50',
    build: () => `
      <circle cx="640" cy="130" r="120" fill="#FFFFFF" opacity="0.07"/>
      <circle cx="140" cy="470" r="150" fill="#FFFFFF" opacity="0.05"/>
      <g stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.16">
        <path d="M 60 200 q 160 -90 320 0 q 160 90 320 0"/>
        <path d="M 60 260 q 160 -90 320 0 q 160 90 320 0"/>
      </g>
      <circle cx="612" cy="410" r="54" fill="${P.sand}" opacity="0.9"/>
      <path d="M 596 410 h 32 M 612 394 v 32" stroke="${P.tealDp}" stroke-width="6" stroke-linecap="round"/>`
  }),
  'map-placeholder.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="800" height="500" role="img">
  <defs>${grainDefs('map')}</defs>
  <rect width="800" height="500" fill="${P.sand}"/>
  <g stroke="${P.cream2}" stroke-width="26" stroke-linecap="round">
    <path d="M -20 150 H 820 M -20 360 H 820 M 210 -20 V 520 M 560 -20 V 520"/>
  </g>
  <g stroke="${P.sandDp}" stroke-width="6" stroke-dasharray="14 16" opacity="0.8">
    <path d="M -20 260 H 820 M 380 -20 V 520"/>
  </g>
  <rect x="230" y="180" width="150" height="100" rx="10" fill="${P.sandDk}" opacity="0.55"/>
  <rect x="600" y="60" width="130" height="120" rx="10" fill="${P.sandDk}" opacity="0.4"/>
  <circle cx="400" cy="260" r="70" fill="${P.teal}" opacity="0.14"/>
  <path d="M 400 300 c -26 -30 -40 -50 -40 -70 a 40 40 0 1 1 80 0 c 0 20 -14 40 -40 70 Z" fill="${P.teal}"/>
  <circle cx="400" cy="228" r="15" fill="${P.cream2}"/>
  ${grainRect(800, 500, 'map', 0.35)}
</svg>`
};

// therapist portraits (6)
const portraits = [
  ['ananya', 11, 'sand'],
  ['meera', 27, 'teal'],
  ['arjun', 43, 'sand'],
  ['kavya', 58, 'teal'],
  ['rahul', 74, 'sand'],
  ['leela', 91, 'teal']
];
portraits.forEach(([n, s, st]) => (files[`therapist-${n}.svg`] = portrait(n, s, st)));

// abstracts for services + resources
const motifs = ['waves', 'arcs', 'dots', 'leaf', 'steps'];
['service-individual', 'service-couples', 'service-anxiety', 'service-growth', 'service-family', 'service-transition'].forEach(
  (n, i) => (files[`${n}.svg`] = abstract(n, i + 2, motifs[i % 5]))
);
['resource-stress', 'resource-communication', 'resource-habits', 'resource-first-session', 'resource-mindful', 'resource-sleep'].forEach(
  (n, i) => (files[`${n}.svg`] = abstract(n, i + 21, motifs[(i + 2) % 5]))
);

Object.entries(files).forEach(([name, content]) => {
  fs.writeFileSync(path.join(OUT, name), content.replace(/\n\s+/g, '\n'), 'utf8');
});

console.log(`Wrote ${Object.keys(files).length} SVG files to assets/images`);