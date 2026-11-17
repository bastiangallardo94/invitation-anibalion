// Generates pixel-art PNG textures into public/textures/.
// Run: node scripts/generate-textures.mjs
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOCKS = join(ROOT, "public/textures/blocks");
mkdirSync(BLOCKS, { recursive: true });

let seed = 20261225;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const ri = (n) => Math.floor(rand() * n);

function hex(h) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}
function shade(h, amt) {
  const [r, g, b] = hex(h);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  return [c(r), c(g), c(b), 255];
}
function newImg(w, h) {
  return new PNG({ width: w, height: h });
}
function set(img, x, y, rgba) {
  x |= 0;
  y |= 0;
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
  const i = (img.width * y + x) << 2;
  img.data[i] = rgba[0];
  img.data[i + 1] = rgba[1];
  img.data[i + 2] = rgba[2];
  img.data[i + 3] = rgba[3] ?? 255;
}
function rect(img, x, y, w, h, rgba) {
  for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) set(img, x + xx, y + yy, rgba);
}
function fillAll(img, rgba) {
  rect(img, 0, 0, img.width, img.height, rgba);
}
function sprinkle(img, count, base, amp, maxSize = 2) {
  for (let i = 0; i < count; i++) {
    const w = 1 + ri(maxSize);
    const h = 1 + ri(maxSize);
    rect(img, ri(img.width), ri(img.height), w, h, shade(base, ri(amp * 2 + 1) - amp));
  }
}
function save(img, path) {
  writeFileSync(path, PNG.sync.write(img));
}

// ---------- blocks ----------
function grassTop() {
  const img = newImg(16, 16);
  fillAll(img, hex("#79c04a"));
  sprinkle(img, 70, "#79c04a", 16, 2);
  sprinkle(img, 18, "#79c04a", 26, 1);
  return img;
}

function grassSide() {
  const img = newImg(16, 16);
  fillAll(img, hex("#866043"));
  sprinkle(img, 60, "#866043", 20, 2);
  for (let x = 0; x < 16; x++) {
    const h = 2 + ri(3);
    for (let y = 0; y < h; y++) set(img, x, y, shade("#79c04a", ri(28) - 14));
  }
  return img;
}

function dirt() {
  const img = newImg(16, 16);
  fillAll(img, hex("#866043"));
  sprinkle(img, 80, "#866043", 20, 2);
  for (let i = 0; i < 6; i++) rect(img, ri(16), ri(16), 2, 1, hex("#6b4a32"));
  return img;
}

function stone() {
  const img = newImg(16, 16);
  fillAll(img, hex("#7f7f7f"));
  sprinkle(img, 90, "#7f7f7f", 16, 2);
  for (let i = 0; i < 7; i++) rect(img, ri(16), ri(16), 2 + ri(2), 2, hex("#696969"));
  for (let i = 0; i < 5; i++) rect(img, ri(16), ri(16), 1, 1, hex("#9a9a9a"));
  return img;
}

function planks() {
  const img = newImg(16, 16);
  fillAll(img, hex("#b08b57"));
  sprinkle(img, 50, "#b08b57", 12, 2);
  for (const y of [3, 7, 11, 15]) rect(img, 0, y, 16, 1, hex("#6e4d2a"));
  for (const [x, y, h] of [
    [4, 0, 3],
    [12, 0, 3],
    [7, 4, 3],
    [15, 4, 3],
    [4, 8, 3],
    [12, 8, 3],
    [7, 12, 3],
    [15, 12, 3],
  ]) {
    rect(img, x, y, 1, h, hex("#8a6238"));
  }
  for (const [x, y] of [
    [2, 1],
    [13, 1],
    [5, 9],
    [10, 13],
  ]) {
    set(img, x, y, hex("#5a3a1e"));
  }
  return img;
}

function logSide() {
  const img = newImg(16, 16);
  for (let x = 0; x < 16; x++) {
    const colAmt = ri(24) - 12;
    for (let y = 0; y < 16; y++) set(img, x, y, shade("#6b4a2b", colAmt + ri(10) - 5));
  }
  for (let i = 0; i < 5; i++) rect(img, ri(16), ri(16), 1, 2 + ri(2), hex("#543a22"));
  return img;
}

function logTop() {
  const img = newImg(16, 16);
  fillAll(img, hex("#9c7a4e"));
  sprinkle(img, 40, "#9c7a4e", 10, 2);
  for (let r = 1; r < 8; r += 2) {
    for (let x = r; x < 16 - r; x++) {
      set(img, x, r, hex("#7a5a35"));
      set(img, x, 15 - r, hex("#7a5a35"));
      set(img, r, x, hex("#7a5a35"));
      set(img, 15 - r, x, hex("#7a5a35"));
    }
  }
  return img;
}

function leaves(base) {
  const img = newImg(16, 16);
  fillAll(img, hex(base));
  sprinkle(img, 90, base, 22, 2);
  sprinkle(img, 30, base, 34, 1);
  return img;
}

function chest() {
  const img = newImg(16, 16);
  fillAll(img, hex("#9c6b35"));
  sprinkle(img, 50, "#9c6b35", 12, 2);
  rect(img, 0, 0, 16, 1, hex("#5e3c1a"));
  rect(img, 0, 15, 16, 1, hex("#5e3c1a"));
  rect(img, 0, 0, 1, 16, hex("#5e3c1a"));
  rect(img, 15, 0, 1, 16, hex("#5e3c1a"));
  rect(img, 0, 7, 16, 1, hex("#6b4423"));
  return img;
}

function sand() {
  const img = newImg(16, 16);
  fillAll(img, hex("#dbd3a0"));
  sprinkle(img, 70, "#dbd3a0", 12, 2);
  for (let i = 0; i < 6; i++) set(img, ri(16), ri(16), hex("#c4bb86"));
  return img;
}

function gravel() {
  const img = newImg(16, 16);
  fillAll(img, hex("#8a7f78"));
  const colors = ["#6e6560", "#9a928b", "#7d7168", "#a89c92", "#5f5751"];
  for (let i = 0; i < 26; i++) {
    const c = colors[ri(colors.length)];
    rect(img, ri(16), ri(16), 2, 2, hex(c));
  }
  return img;
}

function birchSide() {
  const img = newImg(16, 16);
  fillAll(img, hex("#d8d3c8"));
  sprinkle(img, 30, "#d8d3c8", 8, 1);
  for (let i = 0; i < 8; i++) {
    const y = ri(16);
    const x = ri(12);
    rect(img, x, y, 2 + ri(3), 1, hex("#3b3b3b"));
  }
  return img;
}

function birchTop() {
  const img = newImg(16, 16);
  fillAll(img, hex("#d8d3c8"));
  sprinkle(img, 30, "#d8d3c8", 8, 2);
  for (let r = 1; r < 8; r += 2) {
    for (let x = r; x < 16 - r; x++) {
      set(img, x, r, hex("#9a9488"));
      set(img, x, 15 - r, hex("#9a9488"));
      set(img, r, x, hex("#9a9488"));
      set(img, 15 - r, x, hex("#9a9488"));
    }
  }
  return img;
}

function tnt() {
  const img = newImg(16, 16);
  fillAll(img, hex("#c0392b"));
  sprinkle(img, 40, "#c0392b", 12, 2);
  rect(img, 0, 6, 16, 4, hex("#e8e0d0"));
  const px = (x, y) => set(img, x, y, hex("#1a1a1a"));
  const letter = (ch, ox, oy) => {
    if (ch === "T") {
      px(ox, oy);
      px(ox + 1, oy);
      px(ox + 2, oy);
      px(ox + 1, oy + 1);
      px(ox + 1, oy + 2);
    }
    if (ch === "N") {
      px(ox, oy);
      px(ox, oy + 1);
      px(ox, oy + 2);
      px(ox + 1, oy + 1);
      px(ox + 2, oy);
      px(ox + 2, oy + 1);
      px(ox + 2, oy + 2);
    }
  };
  letter("T", 2, 6);
  letter("N", 7, 6);
  letter("T", 12, 6);
  const fw = (cx, cy, color) => {
    rect(img, cx - 1, cy, 3, 1, hex(color));
    rect(img, cx, cy - 1, 1, 3, hex(color));
    set(img, cx, cy, hex("#ffffff"));
  };
  fw(4, 2, "#7fd8ff");
  fw(12, 3, "#ffe066");
  fw(5, 13, "#ff9bd2");
  fw(11, 12, "#ffffff");
  fw(8, 1, "#ffb347");
  return img;
}

function flower(petal, petalLight, center) {
  const img = newImg(16, 16); // transparent
  for (let y = 7; y < 16; y++) set(img, 7, y, hex("#3f7d2f"));
  rect(img, 5, 11, 2, 1, hex("#3f7d2f"));
  rect(img, 9, 12, 2, 1, hex("#3f7d2f"));
  rect(img, 7, 1, 2, 1, hex(petal));
  rect(img, 6, 2, 4, 1, hex(petal));
  rect(img, 5, 3, 6, 2, hex(petal));
  rect(img, 6, 5, 4, 1, hex(petal));
  rect(img, 7, 6, 2, 1, hex(petal));
  rect(img, 6, 3, 2, 1, hex(petalLight));
  rect(img, 8, 4, 2, 1, hex(petalLight));
  rect(img, 7, 3, 2, 2, hex(center));
  return img;
}

function tallGrass() {
  const img = newImg(16, 16); // transparent
  const blades = [
    [3, 6, 15],
    [5, 9, 15],
    [7, 4, 15],
    [9, 8, 15],
    [11, 6, 14],
    [13, 9, 15],
  ];
  for (const [x, y0, y1] of blades) {
    const c = shade("#4f9c3a", ri(24) - 12);
    for (let y = y0; y < y1; y++) set(img, x, y, c);
  }
  return img;
}

function cakeTop() {
  const img = newImg(16, 16);
  fillAll(img, hex("#f3e8d6"));
  for (let i = 0; i < 10; i++) set(img, 2 + ri(12), 2 + ri(12), hex(i % 2 ? "#e0557f" : "#ffd54f"));
  rect(img, 7, 7, 2, 2, hex("#d64545"));
  return img;
}

function cakeSide() {
  const img = newImg(16, 16);
  fillAll(img, hex("#f3e8d6"));
  rect(img, 0, 0, 16, 3, hex("#ffffff"));
  rect(img, 0, 5, 16, 2, hex("#e8b9c8"));
  rect(img, 0, 12, 16, 2, hex("#d9a15b"));
  return img;
}

// ---------- skin (64x64) ----------
function skin() {
  const img = newImg(64, 64); // transparent
  const F = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  const SKIN = "#e0ac69";
  const HAIR = "#3b2b20";
  const SHIRT = "#16a6b0";
  const SHIRT_DARK = "#0f8c95";
  const PANTS = "#3b4a8f";
  const SHOE = "#2b2b2b";

  F(0, 0, 32, 16, SKIN);
  F(8, 0, 8, 8, HAIR);
  F(24, 8, 8, 8, HAIR);
  F(0, 8, 8, 5, HAIR);
  F(16, 8, 8, 5, HAIR);
  F(8, 8, 8, 2, HAIR);
  F(8, 8, 8, 1, "#c98f52");
  F(10, 11, 1, 2, "#2c2a4a");
  F(14, 11, 1, 2, "#2c2a4a");
  F(9, 11, 1, 1, "#ffffff");
  F(13, 11, 1, 1, "#ffffff");
  F(11, 14, 3, 1, "#8a5a3a");

  F(16, 16, 24, 16, SHIRT);
  F(20, 20, 8, 2, SHIRT_DARK);
  F(20, 30, 8, 2, SHIRT_DARK);

  F(40, 16, 16, 16, SHIRT);
  F(48, 16, 4, 4, SKIN);
  F(40, 29, 16, 3, SKIN);

  F(32, 48, 16, 16, SHIRT);
  F(40, 48, 4, 4, SKIN);
  F(32, 61, 16, 3, SKIN);

  F(0, 16, 16, 16, PANTS);
  F(8, 16, 4, 4, SHOE);
  F(0, 29, 16, 3, SHOE);
  F(0, 26, 16, 1, "#2f3a70");

  F(16, 48, 16, 16, PANTS);
  F(24, 48, 4, 4, SHOE);
  F(16, 61, 16, 3, SHOE);
  F(16, 58, 16, 1, "#2f3a70");

  return img;
}

// ---------- write ----------
const blocks = {
  "grass_top.png": grassTop(),
  "grass_side.png": grassSide(),
  "dirt.png": dirt(),
  "stone.png": stone(),
  "planks.png": planks(),
  "log_side.png": logSide(),
  "log_top.png": logTop(),
  "leaves.png": leaves("#3f7d2f"),
  "chest.png": chest(),
  "sand.png": sand(),
  "gravel.png": gravel(),
  "birch_side.png": birchSide(),
  "birch_top.png": birchTop(),
  "birch_leaves.png": leaves("#6fae4b"),
  "tnt.png": tnt(),
  "flower_red.png": flower("#d64545", "#ef6b6b", "#ffe066"),
  "flower_yellow.png": flower("#f2c94c", "#ffe082", "#c98a1b"),
  "tall_grass.png": tallGrass(),
  "cake_top.png": cakeTop(),
  "cake_side.png": cakeSide(),
};

for (const [name, img] of Object.entries(blocks)) save(img, join(BLOCKS, name));
save(skin(), join(ROOT, "public/textures/skin.png"));
console.log("Generated", Object.keys(blocks).length + 1, "textures in public/textures/");
