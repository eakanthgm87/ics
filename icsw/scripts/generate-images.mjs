/**
 * Generates every illustration the design references but that was not supplied.
 * Output: public/images/*.svg  (flat, layered vector scenes in the ICS palette)
 *
 * Each file is a drop-in replacement target: swap the .svg for a real .jpg/.png
 * of the same aspect ratio and nothing else in the app needs to change.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "images");
mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------------ palette */
const C = {
  green: "#264130",
  greenMid: "#3C5E48",
  greenSoft: "#8CA894",
  mint: "#DAEBDE",
  mintPale: "#F1FEF3",
  brown: "#A37541",
  sand: "#E8DEC9",
  gold: "#C5A059",
  cream: "#F7F3E8",
  sky: "#BFD9D3",
  skyDeep: "#7FA8A0",
  dusk: "#E9C89A",
  ink: "#1B2E22",
  white: "#FFFFFF",
  slate: "#57655F",
};

const rnd = (seed) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

const wrap = (w, h, body, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img">
<defs>${defs}</defs>
${body}
</svg>`;

const linGrad = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("")}</linearGradient>`;

const radGrad = (id, stops) =>
  `<radialGradient id="${id}">${stops
    .map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`)
    .join("")}</radialGradient>`;

const save = (name, svg) => {
  writeFileSync(join(OUT, name), svg);
  return name;
};

/* --------------------------------------------------------------- primitives */

/** A standing person, stylised, facing forward. */
function figure(x, y, scale, top, bottom, skin = "#C89A6B", i = 0) {
  const s = (n) => n * scale;
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0" cy="${s(2)}" rx="${s(13)}" ry="${s(3)}" fill="${C.ink}" opacity="0.12"/>
    <rect x="${s(-8)}" y="${s(-30)}" width="${s(6)}" height="${s(30)}" rx="${s(3)}" fill="${C.ink}" opacity="0.85"/>
    <rect x="${s(2)}" y="${s(-30)}" width="${s(6)}" height="${s(30)}" rx="${s(3)}" fill="${C.ink}" opacity="0.85"/>
    <path d="M${s(-13)} ${s(-72)} h${s(26)} a${s(5)} ${s(5)} 0 0 1 ${s(5)} ${s(5)} v${s(32)} a${s(5)} ${s(5)} 0 0 1 -${s(5)} ${s(5)} h-${s(26)} a${s(5)} ${s(5)} 0 0 1 -${s(5)} -${s(5)} v-${s(32)} a${s(5)} ${s(5)} 0 0 1 ${s(5)} -${s(5)} z" fill="${top}"/>
    <rect x="${s(-20)}" y="${s(-70)}" width="${s(7)}" height="${s(34)}" rx="${s(3.5)}" fill="${top}"/>
    <rect x="${s(13)}" y="${s(-70)}" width="${s(7)}" height="${s(34)}" rx="${s(3.5)}" fill="${top}"/>
    <rect x="${s(-13)}" y="${s(-36)}" width="${s(26)}" height="${s(10)}" fill="${bottom}"/>
    <circle cx="${s(-16.5)}" cy="${s(-34)}" r="${s(3.5)}" fill="${skin}"/>
    <circle cx="${s(16.5)}" cy="${s(-34)}" r="${s(3.5)}" fill="${skin}"/>
    <rect x="${s(-5)}" y="${s(-80)}" width="${s(10)}" height="${s(10)}" fill="${skin}"/>
    <circle cx="0" cy="${s(-88)}" r="${s(11)}" fill="${skin}"/>
    <path d="M${s(-11)} ${s(-89)} a${s(11)} ${s(11)} 0 0 1 ${s(22)} 0 q-${s(11)} ${s(
    i % 2 ? -3 : 4
  )} -${s(22)} 0 z" fill="${C.ink}" opacity="0.8"/>
  </g>`;
}

/** Row of people walking towards viewer. */
function crowd(y, x0, x1, n, scale, seed) {
  const r = rnd(seed);
  const tops = [C.green, C.greenMid, "#2F4A57", C.brown, "#4A3B5E"];
  const bots = ["#2C3A44", C.green, "#3A3A46", "#54443A"];
  let out = "";
  for (let i = 0; i < n; i++) {
    const x = x0 + ((x1 - x0) * i) / (n - 1) + (r() - 0.5) * 18;
    const sc = scale * (0.9 + r() * 0.25);
    out += figure(x, y + (r() - 0.5) * 10, sc, tops[(i + Math.floor(r() * 5)) % tops.length], bots[i % bots.length], i % 3 === 0 ? "#8D5A3B" : i % 3 === 1 ? "#C89A6B" : "#E0B68C", i);
  }
  return out;
}

/** Leafy tree. */
function tree(x, y, h, seed) {
  const r = rnd(seed);
  const cw = h * 0.62;
  return `<g transform="translate(${x},${y})">
    <rect x="${-h * 0.045}" y="${-h * 0.42}" width="${h * 0.09}" height="${h * 0.42}" fill="#5B4632"/>
    <ellipse cx="0" cy="${-h * 0.62}" rx="${cw * 0.55}" ry="${h * 0.3}" fill="${C.greenMid}"/>
    <ellipse cx="${-cw * 0.3}" cy="${-h * 0.5}" rx="${cw * 0.36}" ry="${h * 0.22}" fill="${C.green}" opacity="0.9"/>
    <ellipse cx="${cw * 0.3}" cy="${-h * 0.53}" rx="${cw * 0.34}" ry="${h * 0.21}" fill="#33553E"/>
    <ellipse cx="${(r() - 0.5) * cw * 0.4}" cy="${-h * 0.78}" rx="${cw * 0.3}" ry="${h * 0.17}" fill="${C.greenSoft}" opacity="0.55"/>
  </g>`;
}

/** Colonnade / arcade block used for the heritage campus scenes. */
function arcade(x, y, w, h, arches, fill, shade) {
  const aw = w / arches;
  let a = "";
  for (let i = 0; i < arches; i++) {
    const ax = x + i * aw + aw * 0.16;
    const awi = aw * 0.68;
    a += `<path d="M${ax} ${y + h} v${-h * 0.52} a${awi / 2} ${awi / 2} 0 0 1 ${awi} 0 v${h * 0.52} z" fill="${shade}"/>`;
  }
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>${a}
  <rect x="${x}" y="${y}" width="${w}" height="${h * 0.07}" fill="${shade}" opacity="0.35"/></g>`;
}

/* ------------------------------------------------------------------ scenes */

/** Heritage campus at golden hour with students walking — homepage hero. */
function heroCampus(w, h) {
  const defs =
    linGrad("sky", [["0%", "#F3D9A8"], ["55%", "#E7BE8C"], ["100%", "#D9A87A"]]) +
    linGrad("stone", [["0%", "#C98F63"], ["100%", "#A96F4B"]]) +
    linGrad("ground", [["0%", "#C9A484"], ["100%", "#AE8467"]]) +
    radGrad("glow", [["0%", "#FFE9BC", 0.95], ["100%", "#FFE9BC", 0]]);
  const hz = h * 0.66;
  let b = `<rect width="${w}" height="${h}" fill="url(#sky)"/>
  <circle cx="${w * 0.62}" cy="${h * 0.28}" r="${h * 0.5}" fill="url(#glow)"/>`;
  // distant treeline
  for (let i = 0; i < 16; i++) b += tree(w * 0.02 + (i * w) / 16, hz - 4, h * 0.2, i + 7);
  // arcades left + right
  b += arcade(-w * 0.02, hz - h * 0.42, w * 0.44, h * 0.42, 6, "url(#stone)", "#7E4F36");
  b += arcade(w * 0.6, hz - h * 0.4, w * 0.44, h * 0.4, 6, "url(#stone)", "#7E4F36");
  // clock tower
  const tx = w * 0.5,
    tw = w * 0.075,
    ty = hz - h * 0.78;
  b += `<rect x="${tx - tw / 2}" y="${ty}" width="${tw}" height="${hz - ty}" fill="url(#stone)"/>
  <rect x="${tx - tw / 2}" y="${ty}" width="${tw}" height="${h * 0.02}" fill="#7E4F36"/>
  <circle cx="${tx}" cy="${ty + h * 0.075}" r="${tw * 0.26}" fill="${C.cream}"/>
  <circle cx="${tx}" cy="${ty + h * 0.075}" r="${tw * 0.26}" fill="none" stroke="#7E4F36" stroke-width="3"/>
  <path d="M${tx} ${ty + h * 0.075} v${-tw * 0.16} M${tx} ${ty + h * 0.075} l${tw * 0.12} ${tw * 0.07}" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M${tx - tw * 0.62} ${ty} L${tx} ${ty - h * 0.07} L${tx + tw * 0.62} ${ty} z" fill="#8B5A3C"/>`;
  // plaza
  b += `<rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#ground)"/>`;
  for (let i = 1; i < 9; i++)
    b += `<path d="M${(w / 9) * i} ${hz} L${(w / 9) * i + (i - 4.5) * 60} ${h}" stroke="#9C7356" stroke-width="2" opacity="0.5"/>`;
  b += crowd(h * 0.86, w * 0.1, w * 0.92, 13, (h / 560) * 0.9, 91);
  b += `<rect width="${w}" height="${h}" fill="#241505" opacity="0.18"/>`;
  return wrap(w, h, b, defs);
}

/** Modern low-rise campus with lawn — gallery / life-at-ICS banner. */
function heroModernCampus(w, h) {
  const defs =
    linGrad("sky2", [["0%", "#CFE4E6"], ["100%", "#EAF1E8"]]) +
    linGrad("wood", [["0%", "#C79A63"], ["100%", "#9C7444"]]) +
    linGrad("lawn", [["0%", "#7E9E6E"], ["100%", "#5E8154"]]);
  const hz = h * 0.6;
  let b = `<rect width="${w}" height="${h}" fill="url(#sky2)"/>`;
  for (let i = 0; i < 12; i++) b += tree(w * 0.03 + (i * w) / 12, hz + 6, h * 0.34, i + 21);
  // long timber building
  b += `<rect x="${w * 0.08}" y="${hz - h * 0.34}" width="${w * 0.84}" height="${h * 0.34}" fill="url(#wood)"/>
  <path d="M${w * 0.05} ${hz - h * 0.34} H${w * 0.95} L${w * 0.9} ${hz - h * 0.42} H${w * 0.1} z" fill="#8A6438"/>`;
  for (let i = 0; i < 22; i++) {
    const x = w * 0.1 + (i * w * 0.8) / 22;
    b += `<rect x="${x}" y="${hz - h * 0.29}" width="${w * 0.022}" height="${h * 0.2}" rx="3" fill="#D8E9EC" opacity="0.85"/>`;
  }
  b += `<rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#lawn)"/>`;
  // flower beds
  const r = rnd(5);
  for (let i = 0; i < 90; i++) {
    const x = r() * w,
      y = hz + 10 + r() * (h - hz - 14);
    b += `<circle cx="${x}" cy="${y}" r="${2 + r() * 3}" fill="${["#E4B7CB", "#F0D9A0", "#C9DFA8", "#E8A87C"][i % 4]}" opacity="0.8"/>`;
  }
  b += crowd(h * 0.92, w * 0.08, w * 0.95, 10, (h / 420) * 0.7, 33);
  return wrap(w, h, b, defs);
}

/** Tree-shaded courtyard with students — admissions hero. */
function heroCourtyard(w, h) {
  const defs =
    linGrad("sky3", [["0%", "#D8E6D6"], ["100%", "#F0F3E6"]]) +
    linGrad("brick", [["0%", "#B8795A"], ["100%", "#94593F"]]) +
    linGrad("lawn3", [["0%", "#88A877"], ["100%", "#65885A"]]);
  const hz = h * 0.62;
  let b = `<rect width="${w}" height="${h}" fill="url(#sky3)"/>`;
  b += `<rect x="${w * 0.42}" y="${hz - h * 0.46}" width="${w * 0.6}" height="${h * 0.46}" fill="url(#brick)"/>`;
  for (let row = 0; row < 3; row++)
    for (let i = 0; i < 12; i++)
      b += `<rect x="${w * 0.45 + i * w * 0.046}" y="${hz - h * 0.4 + row * h * 0.13}" width="${w * 0.03}" height="${h * 0.085}" rx="2" fill="#CFE0E4" opacity="0.9"/>`;
  b += `<rect x="${w * 0.45}" y="${hz - h * 0.5}" width="${w * 0.54}" height="${h * 0.05}" rx="4" fill="${C.green}" opacity="0.85"/>`;
  b += `<rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#lawn3)"/>`;
  // shade tree, kept to the left edge so centred hero copy stays clear
  b += `<g><rect x="${w * 0.09}" y="${hz - h * 0.36}" width="${w * 0.022}" height="${h * 0.36}" fill="#5A4430"/>
    <ellipse cx="${w * 0.1}" cy="${hz - h * 0.46}" rx="${w * 0.15}" ry="${h * 0.16}" fill="${C.greenMid}"/>
    <ellipse cx="${w * 0.03}" cy="${hz - h * 0.4}" rx="${w * 0.1}" ry="${h * 0.12}" fill="${C.green}"/>
    <ellipse cx="${w * 0.17}" cy="${hz - h * 0.41}" rx="${w * 0.09}" ry="${h * 0.11}" fill="#33553E"/></g>`;
  b += `<ellipse cx="${w * 0.11}" cy="${hz + h * 0.12}" rx="${w * 0.09}" ry="${h * 0.04}" fill="#A98B6A"/>`;
  b += crowd(h * 0.93, w * 0.12, w * 0.9, 9, (h / 420) * 0.78, 64);
  b += `<rect width="${w}" height="${h}" fill="#1B2E22" opacity="0.2"/>`;
  return wrap(w, h, b, defs);
}

/** Grand heritage facade — contact hero. */
function heroHeritage(w, h) {
  const defs =
    linGrad("sky4", [["0%", "#C7D6DC"], ["100%", "#E7E2D2"]]) +
    linGrad("stone4", [["0%", "#D8C295"], ["100%", "#B49B6E"]]);
  const hz = h * 0.82;
  let b = `<rect width="${w}" height="${h}" fill="url(#sky4)"/>`;
  b += `<rect x="0" y="${h * 0.3}" width="${w}" height="${hz - h * 0.3}" fill="url(#stone4)"/>`;
  // wings
  b += arcade(0, h * 0.42, w * 0.34, hz - h * 0.42, 5, "url(#stone4)", "#9B8258");
  b += arcade(w * 0.66, h * 0.42, w * 0.34, hz - h * 0.42, 5, "url(#stone4)", "#9B8258");
  // central tower with rose window
  const tx = w * 0.5;
  b += `<rect x="${tx - w * 0.09}" y="${h * 0.12}" width="${w * 0.18}" height="${hz - h * 0.12}" fill="url(#stone4)"/>
  <path d="M${tx - w * 0.1} ${h * 0.12} L${tx} ${h * 0.02} L${tx + w * 0.1} ${h * 0.12} z" fill="#9B8258"/>
  <circle cx="${tx}" cy="${h * 0.22}" r="${w * 0.035}" fill="${C.cream}"/>
  <circle cx="${tx}" cy="${h * 0.22}" r="${w * 0.035}" fill="none" stroke="#8C7449" stroke-width="3"/>
  <circle cx="${tx}" cy="${h * 0.56}" r="${w * 0.055}" fill="#9B8258"/>
  <circle cx="${tx}" cy="${h * 0.56}" r="${w * 0.04}" fill="${C.cream}" opacity="0.7"/>`;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b += `<path d="M${tx} ${h * 0.56} l${Math.cos(a) * w * 0.05} ${Math.sin(a) * w * 0.05}" stroke="#8C7449" stroke-width="2.5"/>`;
  }
  b += `<path d="M${tx - w * 0.035} ${hz} v${-h * 0.18} a${w * 0.035} ${w * 0.035} 0 0 1 ${w * 0.07} 0 v${h * 0.18} z" fill="#6A5637"/>`;
  b += `<rect y="${hz}" width="${w}" height="${h - hz}" fill="#6E8C63"/>`;
  for (let i = 0; i < 9; i++) b += tree(w * 0.04 + (i * w) / 9, h, h * 0.22, i + 3);
  b += `<rect width="${w}" height="${h}" fill="#1B2E22" opacity="0.22"/>`;
  return wrap(w, h, b, defs);
}

/**
 * Portrait placeholder — an editorial silhouette rather than a cartoon:
 * tonal backdrop, a soft studio vignette, and a featureless bust so it reads
 * as a deliberate stand-in until a real photograph is dropped in.
 */
function portrait(w, h, bg, top, skin, hair, seed = 1, initials = "") {
  const r = rnd(seed);
  const id = "p" + seed;
  const defs =
    radGrad("vg" + id, [["0%", C.white, 0.5], ["70%", C.white, 0.08], ["100%", C.ink, 0.06]]) +
    linGrad("bd" + id, [["0%", bg], ["100%", shade(bg, -12)]]) +
    linGrad("tp" + id, [["0%", top], ["100%", shade(top, -18)]]);
  const cx = w / 2;
  const hs = Math.min(w, h);

  let b = `<rect width="${w}" height="${h}" fill="url(#bd${id})"/>`;
  // soft backdrop arc
  b += `<circle cx="${cx}" cy="${h * 0.44}" r="${hs * 0.46}" fill="${C.white}" opacity="0.28"/>`;
  b += `<rect width="${w}" height="${h}" fill="url(#vg${id})"/>`;

  // shoulders
  b += `<path d="M${cx - w * 0.46} ${h} q${w * 0.04} ${-h * 0.32} ${w * 0.46} ${-h * 0.32} q${w * 0.42} 0 ${w * 0.46} ${h * 0.32} z" fill="url(#tp${id})"/>`;
  // collar notch
  b += `<path d="M${cx - hs * 0.13} ${h * 0.7} q${hs * 0.13} ${hs * 0.12} ${hs * 0.26} 0 l${-hs * 0.05} ${hs * 0.1} h${-hs * 0.16} z" fill="${shade(top, -28)}" opacity="0.55"/>`;
  // neck
  b += `<path d="M${cx - hs * 0.1} ${h * 0.58} h${hs * 0.2} v${hs * 0.14} q${-hs * 0.1} ${hs * 0.05} ${-hs * 0.2} 0 z" fill="${shade(skin, -10)}"/>`;
  // head
  b += `<ellipse cx="${cx}" cy="${h * 0.44}" rx="${hs * 0.185}" ry="${hs * 0.225}" fill="${skin}"/>`;
  // hair: one of three silhouettes, no facial features
  const style = Math.floor(r() * 3);
  if (style === 0) {
    b += `<path d="M${cx - hs * 0.195} ${h * 0.44} a${hs * 0.195} ${hs * 0.215} 0 0 1 ${hs * 0.39} 0 q${-hs * 0.04} ${-hs * 0.15} -${hs * 0.195} -${hs * 0.15} q-${hs * 0.155} 0 -${hs * 0.195} ${hs * 0.15} z" fill="${hair}"/>`;
  } else if (style === 1) {
    b += `<path d="M${cx - hs * 0.2} ${h * 0.47} q-${hs * 0.03} -${hs * 0.29} ${hs * 0.2} -${hs * 0.29} q${hs * 0.23} 0 ${hs * 0.2} ${hs * 0.29} q-${hs * 0.02} ${hs * 0.14} ${hs * 0.03} ${hs * 0.2} l-${hs * 0.09} ${hs * 0.02} q-${hs * 0.05} -${hs * 0.16} -${hs * 0.04} -${hs * 0.25} q-${hs * 0.18} ${hs * 0.06} -${hs * 0.36} 0 q${hs * 0.01} ${hs * 0.09} -${hs * 0.04} ${hs * 0.25} l-${hs * 0.09} -${hs * 0.02} q${hs * 0.05} -${hs * 0.06} ${hs * 0.03} -${hs * 0.2} z" fill="${hair}"/>`;
  } else {
    b += `<path d="M${cx - hs * 0.2} ${h * 0.45} a${hs * 0.2} ${hs * 0.22} 0 0 1 ${hs * 0.4} 0 q0 -${hs * 0.2} -${hs * 0.2} -${hs * 0.2} q-${hs * 0.2} 0 -${hs * 0.2} ${hs * 0.2} z" fill="${hair}"/>
    <path d="M${cx - hs * 0.2} ${h * 0.44} q-${hs * 0.05} ${hs * 0.16} 0 ${hs * 0.24} M${cx + hs * 0.2} ${h * 0.44} q${hs * 0.05} ${hs * 0.16} 0 ${hs * 0.24}" stroke="${hair}" stroke-width="${hs * 0.07}" stroke-linecap="round" fill="none"/>`;
  }
  // gentle rim light on one cheek
  b += `<path d="M${cx + hs * 0.11} ${h * 0.35} q${hs * 0.08} ${hs * 0.09} 0 ${hs * 0.18}" stroke="${C.white}" stroke-width="${hs * 0.02}" opacity="0.18" fill="none"/>`;
  // corner monogram plate
  if (initials)
    b += `<g opacity="0.85"><rect x="${w - hs * 0.2}" y="${h - hs * 0.2}" width="${hs * 0.14}" height="${hs * 0.14}" rx="${hs * 0.04}" fill="${C.white}" opacity="0.75"/>
    <text x="${w - hs * 0.13}" y="${h - hs * 0.105}" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-size="${hs * 0.055}" font-weight="700" fill="${C.green}">${initials}</text></g>`;
  return wrap(w, h, b, defs);
}

/** Lighten (+) or darken (-) a hex colour by a percentage. */
function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + (v * pct) / 100)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((v) => f(v).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** Interior scene builder: room shell + supplied furniture/props layer. */
function room(w, h, wallTop, wallBottom, floor, inner) {
  const defs = linGrad("wall", [["0%", wallTop], ["100%", wallBottom]]);
  const hz = h * 0.62;
  return wrap(
    w,
    h,
    `<rect width="${w}" height="${h}" fill="url(#wall)"/>
     <rect y="${hz}" width="${w}" height="${h - hz}" fill="${floor}"/>
     <rect y="${hz - 6}" width="${w}" height="6" fill="${C.ink}" opacity="0.12"/>
     ${inner(hz)}`,
    defs
  );
}

const sciLab = (w, h) =>
  room(w, h, "#EAF0F2", "#D5E2E6", "#C8CFD2", (hz) => {
    let b = "";
    for (let i = 0; i < 3; i++)
      b += `<rect x="${w * (0.06 + i * 0.32)}" y="${h * 0.14}" width="${w * 0.24}" height="${h * 0.26}" rx="6" fill="#CFE6EC" stroke="#A9C4CC" stroke-width="3"/>`;
    b += `<rect y="${hz - h * 0.06}" width="${w}" height="${h * 0.06}" fill="#E8EDEF"/>`;
    b += `<rect x="${w * 0.08}" y="${hz + h * 0.12}" width="${w * 0.84}" height="${h * 0.12}" rx="6" fill="#E9EEF0"/>`;
    for (let i = 0; i < 6; i++) {
      const x = w * 0.14 + i * w * 0.14;
      b += `<path d="M${x - 10} ${hz + h * 0.12} l7 -26 h6 l7 26 z" fill="${["#7FD1C8", "#F2B6C6", "#F6DD91", "#9CC8F0", "#C6ACE8", "#93DDA5"][i]}" opacity="0.95"/>`;
    }
    b += crowd(hz + h * 0.1, w * 0.18, w * 0.82, 4, (h / 380) * 0.8, 12);
    return b;
  });

const library = (w, h) =>
  room(w, h, "#F0E3CE", "#E2CEB0", "#B98E5F", (hz) => {
    let b = "";
    for (let s = 0; s < 4; s++) {
      const x = w * (0.03 + s * 0.25);
      b += `<rect x="${x}" y="${h * 0.08}" width="${w * 0.2}" height="${hz - h * 0.08}" fill="#8A5F39"/>`;
      for (let r2 = 0; r2 < 5; r2++) {
        const y = h * 0.11 + r2 * ((hz - h * 0.14) / 5);
        b += `<rect x="${x + 4}" y="${y}" width="${w * 0.2 - 8}" height="${(hz - h * 0.14) / 5 - 8}" fill="#6E4A2C"/>`;
        for (let k = 0; k < 11; k++)
          b += `<rect x="${x + 7 + k * ((w * 0.2 - 14) / 11)}" y="${y + 4}" width="${(w * 0.2 - 16) / 11}" height="${(hz - h * 0.14) / 5 - 16}" fill="${["#C6564B", "#3E6B8E", "#D9A441", "#4E7A52", "#8A5A9C"][(k + r2) % 5]}"/>`;
      }
    }
    b += `<rect x="${w * 0.12}" y="${hz + h * 0.1}" width="${w * 0.76}" height="${h * 0.1}" rx="6" fill="#8A5F39"/>`;
    for (let i = 0; i < 4; i++)
      b += `<g><rect x="${w * (0.2 + i * 0.18)}" y="${hz + h * 0.02}" width="${w * 0.07}" height="${h * 0.055}" rx="${w * 0.035}" fill="${C.green}"/><rect x="${w * (0.229 + i * 0.18)}" y="${h * 0.06}" width="3" height="${hz + h * 0.02 - h * 0.06}" fill="#6E4A2C" opacity="0.5"/></g>`;
    b += crowd(hz + h * 0.1, w * 0.18, w * 0.84, 5, (h / 380) * 0.62, 77);
    return b;
  });

const readingRoom = (w, h) =>
  room(w, h, "#F2F4EE", "#E4E9E0", "#D9C7A8", (hz) => {
    let b = `<rect x="${w * 0.04}" y="${h * 0.06}" width="${w * 0.54}" height="${hz - h * 0.12}" rx="4" fill="#CBE0DC"/>`;
    for (let i = 1; i < 4; i++)
      b += `<rect x="${w * 0.04 + (i * w * 0.54) / 4}" y="${h * 0.06}" width="5" height="${hz - h * 0.12}" fill="#F2F4EE"/>`;
    b += `<rect x="${w * 0.04}" y="${hz - h * 0.2}" width="${w * 0.54}" height="${h * 0.08}" fill="#8FAF7E" opacity="0.8"/>`;
    b += `<rect x="${w * 0.64}" y="${h * 0.1}" width="${w * 0.32}" height="${hz - h * 0.14}" fill="#A9793F"/>`;
    for (let r2 = 0; r2 < 4; r2++)
      for (let k = 0; k < 14; k++)
        b += `<rect x="${w * 0.66 + k * (w * 0.28 / 14)}" y="${h * 0.14 + r2 * ((hz - h * 0.22) / 4)}" width="${w * 0.26 / 14}" height="${(hz - h * 0.24) / 4}" fill="${["#C6564B", "#3E6B8E", "#D9A441", "#4E7A52"][(k + r2) % 4]}"/>`;
    const seats = [[0.18, "#A8C4D8"], [0.36, "#B9CFA8"], [0.56, "#DCC7A4"], [0.76, "#A8C4D8"]];
    seats.forEach(([p, col], i) => {
      b += `<g><ellipse cx="${w * p}" cy="${hz + h * 0.2}" rx="${w * 0.075}" ry="${h * 0.055}" fill="${col}"/><rect x="${w * p - w * 0.06}" y="${hz + h * 0.09}" width="${w * 0.12}" height="${h * 0.12}" rx="${w * 0.04}" fill="${col}"/>${figure(w * p, hz + h * 0.19, (h / 380) * 0.5, [C.green, C.brown, "#3E6B8E", C.greenMid][i], "#2C3A44", "#C89A6B", i)}</g>`;
    });
    return b;
  });

const multimedia = (w, h) =>
  room(w, h, "#DFE5E8", "#C9D3D8", "#9AA5AA", (hz) => {
    let b = `<rect x="${w * 0.02}" y="${h * 0.06}" width="${w * 0.96}" height="${h * 0.16}" rx="6" fill="#B7C3C9"/>`;
    b += `<rect x="${w * 0.06}" y="${hz + h * 0.06}" width="${w * 0.88}" height="${h * 0.08}" rx="4" fill="#E7ECEE"/>`;
    for (let i = 0; i < 5; i++) {
      const x = w * 0.1 + i * w * 0.18;
      b += `<g><rect x="${x}" y="${hz - h * 0.16}" width="${w * 0.14}" height="${h * 0.16}" rx="4" fill="#26333A"/>
      <rect x="${x + 4}" y="${hz - h * 0.15}" width="${w * 0.14 - 8}" height="${h * 0.14}" rx="2" fill="${["#2E6F8E", "#3A7A5E", "#6E4A8E", "#8E5A3A", "#2E6F8E"][i]}"/>
      <path d="M${x + w * 0.03} ${hz - h * 0.04} l${w * 0.04} ${-h * 0.06} l${w * 0.04} ${h * 0.06} z" fill="#FFFFFF" opacity="0.5"/>
      <rect x="${x + w * 0.02}" y="${hz + h * 0.04}" width="${w * 0.1}" height="${h * 0.02}" rx="3" fill="#3C4A52"/></g>`;
      b += figure(x + w * 0.07, hz + h * 0.22, (h / 380) * 0.55, [C.green, "#3E6B8E", C.brown, C.greenMid, "#4A3B5E"][i], "#2C3A44", "#C89A6B", i);
    }
    return b;
  });

const sportsField = (w, h) => {
  const defs = linGrad("sky5", [["0%", "#CDE3EC"], ["100%", "#E9F1E6"]]) + linGrad("turf", [["0%", "#79A063"], ["100%", "#588049"]]);
  const hz = h * 0.42;
  let b = `<rect width="${w}" height="${h}" fill="url(#sky5)"/>`;
  b += `<rect x="${w * 0.05}" y="${hz - h * 0.22}" width="${w * 0.5}" height="${h * 0.22}" fill="#C9D4D8"/>`;
  for (let i = 0; i < 10; i++) b += `<rect x="${w * 0.07 + i * w * 0.048}" y="${hz - h * 0.18}" width="${w * 0.03}" height="${h * 0.1}" fill="#8FB4C4"/>`;
  for (let i = 0; i < 8; i++) b += tree(w * 0.58 + (i * w * 0.42) / 8, hz + 4, h * 0.26, i + 44);
  b += `<rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#turf)"/>`;
  for (let i = 0; i < 8; i++) b += `<rect y="${hz + (i * (h - hz)) / 8}" width="${w}" height="${(h - hz) / 16}" fill="#FFFFFF" opacity="0.05"/>`;
  b += `<ellipse cx="${w * 0.5}" cy="${h * 0.8}" rx="${w * 0.18}" ry="${h * 0.1}" fill="none" stroke="#FFFFFF" stroke-width="4" opacity="0.7"/>`;
  b += `<path d="M0 ${h * 0.62} H${w}" stroke="#FFFFFF" stroke-width="4" opacity="0.6"/>`;
  const kit = ["#2E5FA3", "#C63C3C", "#E0B93C", "#2E5FA3", "#C63C3C", "#E0B93C", "#2E5FA3", "#C63C3C"];
  for (let i = 0; i < 8; i++)
    b += figure(w * 0.14 + i * w * 0.1, h * (0.72 + (i % 3) * 0.07), (h / 460) * 0.72, kit[i], "#FFFFFF", i % 2 ? "#8D5A3B" : "#C89A6B", i);
  b += `<circle cx="${w * 0.52}" cy="${h * 0.9}" r="${h * 0.022}" fill="#FFFFFF" stroke="${C.ink}" stroke-width="2"/>`;
  return wrap(w, h, b, defs);
};

const orchestra = (w, h) =>
  room(w, h, "#5E3B26", "#3F2617", "#6B4427", (hz) => {
    let b = `<rect y="${h * 0.02}" width="${w}" height="${h * 0.08}" fill="#472B1A"/>`;
    for (let i = 0; i < 6; i++) {
      const x = w * 0.12 + i * w * 0.16,
        y = hz + h * (i % 2 ? 0.14 : 0.06);
      b += figure(x, y, (h / 420) * 0.62, ["#1B2E22", "#243447", "#1B2E22", "#3A2A3F", "#1B2E22", "#243447"][i], "#1B2E22", i % 2 ? "#8D5A3B" : "#E0B68C", i);
      b += `<g transform="translate(${x + 18},${y - h * 0.1}) rotate(28)"><ellipse cx="0" cy="0" rx="${h * 0.028}" ry="${h * 0.05}" fill="#8B3E22"/><rect x="-2" y="${-h * 0.11}" width="4" height="${h * 0.07}" fill="#5A2814"/></g>`;
      b += `<rect x="${x - 24}" y="${y - h * 0.06}" width="46" height="34" rx="3" fill="#F3EEE2" transform="rotate(-8 ${x} ${y})"/>`;
    }
    return b;
  });

const artStudio = (w, h) =>
  room(w, h, "#F3EDE1", "#E7DCC8", "#B98E5F", (hz) => {
    let b = "";
    const r = rnd(9);
    for (let i = 0; i < 14; i++) {
      const x = w * 0.04 + (i % 7) * w * 0.135,
        y = h * 0.08 + Math.floor(i / 7) * h * 0.2;
      b += `<rect x="${x}" y="${y}" width="${w * 0.11}" height="${h * 0.16}" rx="3" fill="${["#E4A26B", "#7FA8C4", "#C6D98F", "#E0879E", "#F0CE72", "#9C8EC4", "#7FC4A8"][i % 7]}" stroke="${C.white}" stroke-width="4"/>
      <path d="M${x + 6} ${y + h * 0.12} q${w * 0.025} ${-h * 0.07} ${w * 0.05} 0 t${w * 0.05} 0" stroke="${C.white}" stroke-width="3" opacity="${0.4 + r() * 0.4}" fill="none"/>`;
    }
    for (let i = 0; i < 3; i++) {
      const x = w * 0.2 + i * w * 0.3;
      b += `<g><path d="M${x} ${hz + h * 0.3} l${w * 0.045} ${-h * 0.3} M${x + w * 0.09} ${hz + h * 0.3} l${-w * 0.045} ${-h * 0.3}" stroke="#8A5F39" stroke-width="6"/>
      <rect x="${x}" y="${hz - h * 0.06}" width="${w * 0.09}" height="${h * 0.12}" fill="${C.white}" stroke="#8A5F39" stroke-width="4"/></g>`;
      b += figure(x + w * 0.045, hz + h * 0.3, (h / 380) * 0.55, [C.brown, C.green, "#3E6B8E"][i], "#2C3A44", "#C89A6B", i);
    }
    return b;
  });

const theatre = (w, h) =>
  room(w, h, "#2A1C2E", "#17101B", "#6B4427", (hz) => {
    let b = `<rect width="${w}" height="${h * 0.18}" fill="#120C16"/>`;
    for (let i = 0; i < 5; i++)
      b += `<g><rect x="${w * (0.12 + i * 0.19)}" y="${h * 0.06}" width="18" height="22" rx="4" fill="#3A2C40"/>
      <path d="M${w * (0.12 + i * 0.19) + 9} ${h * 0.1} L${w * (0.12 + i * 0.19) - 60} ${hz + h * 0.3} L${w * (0.12 + i * 0.19) + 78} ${hz + h * 0.3} z" fill="#F6E3A8" opacity="0.14"/></g>`;
    b += `<path d="M0 ${h * 0.18} h${w * 0.16} q0 ${h * 0.3} -${w * 0.16} ${h * 0.34} z" fill="#7A1F2B"/>
          <path d="M${w} ${h * 0.18} h${-w * 0.16} q0 ${h * 0.3} ${w * 0.16} ${h * 0.34} z" fill="#7A1F2B"/>`;
    b += `<rect x="${w * 0.2}" y="${hz - h * 0.12}" width="${w * 0.6}" height="${h * 0.12}" fill="#2E3E4E" opacity="0.7"/>`;
    b += figure(w * 0.42, hz + h * 0.28, (h / 380) * 1.1, "#2E5FA3", "#1B2436", "#E0B68C", 0);
    b += figure(w * 0.58, hz + h * 0.28, (h / 380) * 1.1, "#8A8F96", "#3A3F46", "#C89A6B", 1);
    b += crowd(hz + h * 0.32, w * 0.1, w * 0.92, 7, (h / 380) * 0.5, 55);
    return b;
  });

const debate = (w, h) =>
  room(w, h, "#EEF2F3", "#DDE5E7", "#C3B49B", (hz) => {
    let b = `<rect x="${w * 0.06}" y="${h * 0.08}" width="${w * 0.42}" height="${h * 0.3}" rx="4" fill="#F7FAFA" stroke="#B9C6C9" stroke-width="4"/>`;
    for (let i = 0; i < 5; i++)
      b += `<path d="M${w * 0.1} ${h * 0.14 + i * h * 0.05} h${w * (0.1 + (i % 3) * 0.08)}" stroke="#7FA8C4" stroke-width="4" stroke-linecap="round" opacity="0.7"/>`;
    b += `<rect x="${w * 0.54}" y="${h * 0.1}" width="${w * 0.4}" height="${h * 0.28}" rx="4" fill="#CFE0E4"/>`;
    b += `<rect x="${w * 0.1}" y="${hz + h * 0.1}" width="${w * 0.8}" height="${h * 0.1}" rx="8" fill="#E9EEF0"/>`;
    b += crowd(hz + h * 0.1, w * 0.16, w * 0.84, 6, (h / 380) * 0.6, 88);
    for (let i = 0; i < 4; i++)
      b += `<rect x="${w * (0.2 + i * 0.16)}" y="${hz + h * 0.06}" width="${w * 0.08}" height="${h * 0.03}" rx="2" fill="${C.white}"/>`;
    return b;
  });

const classroom = (w, h) =>
  room(w, h, "#EEF3EC", "#DCE7DA", "#C7B197", (hz) => {
    let b = `<rect x="${w * 0.08}" y="${h * 0.08}" width="${w * 0.5}" height="${h * 0.3}" rx="4" fill="${C.green}"/>`;
    for (let i = 0; i < 4; i++)
      b += `<path d="M${w * 0.12} ${h * 0.15 + i * h * 0.06} h${w * (0.14 + (i % 2) * 0.16)}" stroke="${C.mintPale}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`;
    b += `<rect x="${w * 0.64}" y="${h * 0.12}" width="${w * 0.3}" height="${h * 0.24}" rx="4" fill="#CFE0E4"/>`;
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 4; i++) {
        const x = w * (0.14 + i * 0.22),
          y = hz + h * (0.1 + row * 0.18);
        b += `<rect x="${x - w * 0.055}" y="${y}" width="${w * 0.11}" height="${h * 0.035}" rx="3" fill="#B98E5F"/>`;
        b += figure(x, y, (h / 380) * (0.52 + row * 0.08), [C.green, C.brown, "#3E6B8E", C.greenMid][i], "#2C3A44", i % 2 ? "#8D5A3B" : "#C89A6B", i);
      }
    return b;
  });

const campusDetail = (w, h) => {
  const defs = linGrad("stone6", [["0%", "#C2A277"], ["100%", "#9C7B52"]]);
  let b = `<rect width="${w}" height="${h}" fill="url(#stone6)"/>`;
  const cx = w / 2;
  b += `<path d="M${cx - w * 0.26} ${h} v${-h * 0.42} a${w * 0.26} ${w * 0.26} 0 0 1 ${w * 0.52} 0 v${h * 0.42} z" fill="#6E5437"/>`;
  b += `<path d="M${cx - w * 0.19} ${h} v${-h * 0.38} a${w * 0.19} ${w * 0.19} 0 0 1 ${w * 0.38} 0 v${h * 0.38} z" fill="#2E2318"/>`;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + (i / 6) * Math.PI;
    b += `<circle cx="${cx + Math.cos(a) * w * 0.225}" cy="${h * 0.42 + Math.sin(a) * w * 0.225}" r="${w * 0.018}" fill="#D8BE93"/>`;
  }
  b += `<rect x="0" y="0" width="${w * 0.1}" height="${h}" fill="#8A6C47"/><rect x="${w * 0.9}" y="0" width="${w * 0.1}" height="${h}" fill="#8A6C47"/>`;
  for (let i = 0; i < 10; i++) {
    b += `<path d="M${w * 0.05} ${h * 0.05 + i * h * 0.1} q${w * 0.04} ${h * 0.03} 0 ${h * 0.06}" stroke="#6E5437" stroke-width="3" fill="none"/>`;
    b += `<path d="M${w * 0.95} ${h * 0.05 + i * h * 0.1} q${-w * 0.04} ${h * 0.03} 0 ${h * 0.06}" stroke="#6E5437" stroke-width="3" fill="none"/>`;
  }
  b += `<ellipse cx="${w * 0.14}" cy="${h * 0.88}" rx="${w * 0.1}" ry="${h * 0.14}" fill="${C.greenMid}" opacity="0.85"/>
        <ellipse cx="${w * 0.88}" cy="${h * 0.8}" rx="${w * 0.09}" ry="${h * 0.18}" fill="${C.green}" opacity="0.8"/>`;
  return wrap(w, h, b, defs);
};

const campusExterior = (w, h) => {
  const defs = linGrad("sky7", [["0%", "#CBE0EA"], ["100%", "#EDF2EA"]]) + linGrad("glass", [["0%", "#9FC4D8"], ["100%", "#6E97B0"]]);
  const hz = h * 0.72;
  let b = `<rect width="${w}" height="${h}" fill="url(#sky7)"/>`;
  b += `<rect x="${w * 0.06}" y="${h * 0.16}" width="${w * 0.88}" height="${hz - h * 0.16}" fill="#E3E7E4"/>`;
  for (let r2 = 0; r2 < 3; r2++)
    for (let i = 0; i < 11; i++)
      b += `<rect x="${w * 0.09 + i * w * 0.077}" y="${h * 0.2 + r2 * h * 0.17}" width="${w * 0.06}" height="${h * 0.12}" rx="3" fill="url(#glass)"/>`;
  b += `<rect x="${w * 0.06}" y="${h * 0.13}" width="${w * 0.88}" height="${h * 0.04}" fill="${C.green}"/>`;
  b += `<rect y="${hz}" width="${w}" height="${h - hz}" fill="#7E9E6E"/>`;
  b += `<path d="M0 ${h} q${w * 0.3} ${-h * 0.2} ${w * 0.55} ${-h * 0.18} L${w} ${h} z" fill="#C7C0AE"/>`;
  for (let i = 0; i < 7; i++) b += tree(w * 0.05 + (i * w) / 7, hz + 8, h * 0.2, i + 66);
  b += crowd(h * 0.95, w * 0.1, w * 0.9, 8, (h / 380) * 0.6, 17);
  return wrap(w, h, b, defs);
};

const fountainPlaza = (w, h) => {
  const defs = linGrad("sky8", [["0%", "#D6E7EC"], ["100%", "#F1F0E4"]]);
  const hz = h * 0.6;
  let b = `<rect width="${w}" height="${h}" fill="url(#sky8)"/>`;
  b += `<rect x="${w * 0.02}" y="${hz - h * 0.3}" width="${w * 0.96}" height="${h * 0.3}" fill="#B08A63"/>`;
  for (let i = 0; i < 16; i++)
    b += `<rect x="${w * 0.05 + i * w * 0.058}" y="${hz - h * 0.25}" width="${w * 0.032}" height="${h * 0.16}" rx="3" fill="#D8E6E8"/>`;
  for (let i = 0; i < 9; i++) b += tree(w * 0.04 + (i * w) / 9, hz + 10, h * 0.3, i + 12);
  b += `<rect y="${hz}" width="${w}" height="${h - hz}" fill="#C3B08E"/>`;
  b += `<ellipse cx="${w * 0.5}" cy="${h * 0.84}" rx="${w * 0.15}" ry="${h * 0.08}" fill="#8FB8C4"/>
        <ellipse cx="${w * 0.5}" cy="${h * 0.84}" rx="${w * 0.15}" ry="${h * 0.08}" fill="none" stroke="#9C8A6B" stroke-width="7"/>
        <rect x="${w * 0.49}" y="${h * 0.7}" width="${w * 0.02}" height="${h * 0.14}" fill="#9C8A6B"/>
        <path d="M${w * 0.5} ${h * 0.68} q${-w * 0.05} ${h * 0.06} -${w * 0.03} ${h * 0.12} M${w * 0.5} ${h * 0.68} q${w * 0.05} ${h * 0.06} ${w * 0.03} ${h * 0.12}" stroke="#CFE4EA" stroke-width="5" fill="none"/>`;
  b += crowd(h * 0.95, w * 0.08, w * 0.92, 9, (h / 420) * 0.72, 29);
  return wrap(w, h, b, defs);
};

/** Stylised street map for the contact page. */

/* --------------------------------------------------------- award card tops */
function awardHeader(w, h, tint, kind) {
  const defs = linGrad("aw" + kind, [["0%", tint[0]], ["100%", tint[1]]]);
  let b = `<rect width="${w}" height="${h}" fill="url(#aw${kind})"/>`;
  for (let i = 0; i < 6; i++)
    b += `<circle cx="${(w / 6) * i + 20}" cy="${h * (i % 2 ? 0.2 : 0.8)}" r="${h * 0.3}" fill="${C.white}" opacity="0.07"/>`;
  const cx = w / 2,
    cy = h / 2;
  const art = {
    globe: `<circle cx="${cx}" cy="${cy}" r="${h * 0.26}" fill="none" stroke="${C.white}" stroke-width="5"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${h * 0.12}" ry="${h * 0.26}" fill="none" stroke="${C.white}" stroke-width="4"/>
      <path d="M${cx - h * 0.26} ${cy} h${h * 0.52}" stroke="${C.white}" stroke-width="4"/>`,
    leaf: `<path d="M${cx} ${cy + h * 0.24} C${cx - h * 0.3} ${cy + h * 0.1} ${cx - h * 0.2} ${cy - h * 0.28} ${cx + h * 0.06} ${cy - h * 0.26} C${cx + h * 0.3} ${cy - h * 0.24} ${cx + h * 0.18} ${cy + h * 0.12} ${cx} ${cy + h * 0.24} z" fill="none" stroke="${C.white}" stroke-width="5"/>
      <path d="M${cx} ${cy + h * 0.24} L${cx + h * 0.1} ${cy - h * 0.22}" stroke="${C.white}" stroke-width="4"/>`,
    bulb: `<path d="M${cx} ${cy - h * 0.26} a${h * 0.19} ${h * 0.19} 0 0 1 ${h * 0.1} ${h * 0.35} h${-h * 0.2} a${h * 0.19} ${h * 0.19} 0 0 1 ${h * 0.1} ${-h * 0.35} z" fill="none" stroke="${C.white}" stroke-width="5"/>
      <path d="M${cx - h * 0.08} ${cy + h * 0.14} h${h * 0.16} M${cx - h * 0.06} ${cy + h * 0.22} h${h * 0.12}" stroke="${C.white}" stroke-width="4" stroke-linecap="round"/>`,
    trophy: `<path d="M${cx - h * 0.14} ${cy - h * 0.24} h${h * 0.28} v${h * 0.14} a${h * 0.14} ${h * 0.14} 0 0 1 ${-h * 0.28} 0 z" fill="none" stroke="${C.white}" stroke-width="5"/>
      <path d="M${cx} ${cy + h * 0.04} v${h * 0.12} M${cx - h * 0.1} ${cy + h * 0.16} h${h * 0.2}" stroke="${C.white}" stroke-width="5" stroke-linecap="round"/>
      <path d="M${cx - h * 0.14} ${cy - h * 0.18} h${-h * 0.08} a${h * 0.08} ${h * 0.08} 0 0 0 ${h * 0.08} ${h * 0.1} M${cx + h * 0.14} ${cy - h * 0.18} h${h * 0.08} a${h * 0.08} ${h * 0.08} 0 0 1 ${-h * 0.08} ${h * 0.1}" fill="none" stroke="${C.white}" stroke-width="4"/>`,
  }[kind];
  return wrap(w, h, b + art, defs);
}

/* ------------------------------------------------------------- hand doodles */
const doodle = (name, path, vb = 100) =>
  wrap(
    140,
    140,
    `<g transform="translate(70,70)"><g transform="translate(-${vb / 2},-${vb / 2})">${path}</g></g>`,
    ""
  ).replace("<svg ", `<svg data-doodle="${name}" `);

const D = (d, extra = "") =>
  `<g fill="none" stroke="${C.green}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/>${extra}</g>`;

const doodles = {
  "doodle-books": D(
    "M12 74 h58 a6 6 0 0 1 6 6 v6 h-64 z M16 62 h58 M14 50 h56 a5 5 0 0 1 5 5 v7 h-63 z M20 38 h52 M18 26 h54 a5 5 0 0 1 5 5 v7 h-64 z"
  ),
  "doodle-pencil": D("M18 84 l8 -22 L66 22 a8 8 0 0 1 12 12 L38 74 z M60 28 l12 12 M18 84 l14 -6 M26 62 l12 12"),
  "doodle-gradcap": D("M10 40 L50 22 L90 40 L50 58 z M24 48 v20 c0 8 52 8 52 0 v-20 M86 42 v22 M86 66 a3 3 0 1 0 0 6 a3 3 0 1 0 0 -6"),
  "doodle-speechbubble": D("M16 22 h68 a8 8 0 0 1 8 8 v34 a8 8 0 0 1 -8 8 h-40 l-18 14 v-14 h-10 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8 z M34 44 h32 M34 56 h20"),
  "doodle-beaker": D("M38 16 h24 M42 16 v26 L22 78 a8 8 0 0 0 7 12 h42 a8 8 0 0 0 7 -12 L58 42 V16 M30 66 h40", `<circle cx="44" cy="74" r="3.5" stroke="${C.green}" stroke-width="2.6"/><circle cx="58" cy="80" r="2.5" stroke="${C.green}" stroke-width="2.6"/>`),
  "doodle-lightbulb": D("M50 14 a24 24 0 0 1 14 43 v9 h-28 v-9 A24 24 0 0 1 50 14 z M38 74 h24 M42 84 h16 M50 30 v18 M20 28 l8 6 M80 28 l-8 6 M14 56 h10 M76 56 h10"),
  "doodle-airplane": D("M10 58 L88 26 L66 82 L52 60 z M52 60 L88 26 M40 72 l12 -12 M28 84 l10 -18"),
  "doodle-sun": D("M50 50 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0 M50 14 v10 M50 76 v10 M14 50 h10 M76 50 h10 M24 24 l7 7 M76 24 l-7 7 M24 76 l7 -7 M76 76 l-7 -7"),
};


/* ----------------------------------------------------------------- generate */
const made = [];
const add = (n, s) => made.push(save(n, s));

// heroes / banners
add("hero-campus.svg", heroCampus(1240, 560));
add("hero-gallery.svg", heroModernCampus(1240, 380));
add("hero-life.svg", heroModernCampus(1240, 340));
add("hero-admissions.svg", heroCourtyard(1240, 420));
add("hero-contact.svg", heroHeritage(1240, 320));
add("about-hero.svg", fountainPlaza(600, 440));

// about page people
add("founder.svg", portrait(480, 520, "#E5DCCB", C.green, "#D8B08C", "#4A4038", 2, "KS"));
add("principal.svg", portrait(488, 608, "#DCE7E2", "#2E4A56", "#C89A6B", "#2B2320", 3, "AR"));
const facultyTints = ["#E2EDE5", "#E8E2D6", "#DEE7EE", "#EDE4E8", "#E4EDE9"];
const facultyTops = [C.green, "#2E4A56", C.brown, "#4A3B5E", C.greenMid];
const facultySkin = ["#E0B68C", "#C89A6B", "#8D5A3B", "#D8A87C", "#C89A6B"];
const facultyHair = ["#3A2E26", "#241E1A", "#4A3A2A", "#2B2320", "#35291F"];
const facultyInitials = ["DS", "AR", "MH", "SD", "RI"];
for (let i = 0; i < 5; i++)
  add(
    `faculty-${i + 1}.svg`,
    portrait(
      320,
      260,
      facultyTints[i],
      facultyTops[i],
      facultySkin[i],
      facultyHair[i],
      i + 10,
      facultyInitials[i]
    )
  );

// award card headers
add("award-1.svg", awardHeader(300, 200, ["#2F5A46", "#1C3327"], "globe"));
add("award-2.svg", awardHeader(300, 200, ["#4C7A4E", "#2F5236"], "leaf"));
add("award-3.svg", awardHeader(300, 200, ["#B88948", "#8A6330"], "bulb"));
add("award-4.svg", awardHeader(300, 200, ["#A37541", "#6E4A28"], "trophy"));

// academics stage images
add("stage-early-years.svg", classroom(540, 380));
add("stage-primary.svg", artStudio(540, 380));
add("stage-middle.svg", sciLab(540, 380));
add("stage-high.svg", debate(540, 380));

// life at ICS facilities
add("facility-sports.svg", sportsField(620, 460));
add("facility-labs.svg", sciLab(620, 460));
add("facility-library.svg", library(620, 460));
add("facility-reading.svg", readingRoom(620, 460));
add("facility-multimedia.svg", multimedia(620, 460));

// gallery masonry
add("gal-orchestra.svg", orchestra(320, 420));
add("gal-art-studio.svg", artStudio(320, 220));
add("gal-campus-life.svg", campusExterior(360, 180));
add("gal-science-lab.svg", sciLab(360, 320));
add("gal-sports.svg", sportsField(280, 260));
add("gal-debate.svg", debate(280, 220));
add("gal-theatre.svg", theatre(280, 360));
add("gal-library.svg", library(300, 420));
add("gal-campus-detail.svg", campusDetail(300, 220));

// founder story chapters
add("chapter-1.svg", campusDetail(712, 560));
add("chapter-2.svg", classroom(712, 560));
add("chapter-3.svg", campusExterior(712, 560));
add("chapter-4.svg", theatre(712, 560));
add("chapter-5.svg", fountainPlaza(712, 560));

// doodles
Object.entries(doodles).forEach(([n, p]) => add(`${n}.svg`, doodle(n, p)));

console.log(`generated ${made.length} files into public/images`);
