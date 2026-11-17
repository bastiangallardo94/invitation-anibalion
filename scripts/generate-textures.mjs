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

function skinZombie() {
  const img = newImg(64, 64);
  const F = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  const SKIN = "#5b8a3c";
  const SKIN_D = "#4e7832";
  const HAIR = "#3f6b2a";
  const SHIRT = "#2f8f8f";
  const SHIRT_D = "#256b6b";
  const PANTS = "#3b4a8f";

  F(0, 0, 32, 16, SKIN);
  F(8, 0, 8, 8, HAIR);
  F(24, 8, 8, 8, HAIR);
  F(0, 8, 8, 4, HAIR);
  F(16, 8, 8, 4, HAIR);
  F(8, 8, 8, 2, SKIN_D);
  F(10, 11, 1, 2, "#1a1a1a");
  F(14, 11, 1, 2, "#1a1a1a");
  F(11, 14, 3, 1, "#1a1a1a");

  F(16, 16, 24, 16, SHIRT);
  F(20, 20, 8, 4, SHIRT_D);
  F(20, 30, 8, 2, SHIRT_D);

  F(40, 16, 16, 16, SHIRT);
  F(48, 16, 4, 4, SKIN);
  F(40, 29, 16, 3, SKIN);
  F(32, 48, 16, 16, SHIRT);
  F(40, 48, 4, 4, SKIN);
  F(32, 61, 16, 3, SKIN);

  F(0, 16, 16, 16, PANTS);
  F(8, 16, 4, 4, "#2b2b2b");
  F(0, 29, 16, 3, "#2b2b2b");
  F(16, 48, 16, 16, PANTS);
  F(24, 48, 4, 4, "#2b2b2b");
  F(16, 61, 16, 3, "#2b2b2b");
  return img;
}

function skinSkeleton() {
  const img = newImg(64, 64);
  const F = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  const BONE = "#d8d8d8";
  const BONE_D = "#a8a8a8";
  const BONE_L = "#eeeeee";

  F(0, 0, 32, 16, BONE);
  F(8, 8, 8, 8, BONE_L);
  F(10, 11, 2, 2, "#1a1a1a");
  F(13, 11, 2, 2, "#1a1a1a");
  F(11, 14, 3, 1, BONE_D);

  F(16, 16, 24, 16, BONE);
  F(23, 20, 2, 12, BONE_D);
  F(20, 22, 8, 1, BONE_D);
  F(20, 25, 8, 1, BONE_D);
  F(20, 28, 8, 1, BONE_D);

  F(40, 16, 16, 16, BONE);
  F(32, 48, 16, 16, BONE);

  F(0, 16, 16, 16, BONE);
  F(16, 48, 16, 16, BONE);
  return img;
}

function skinVillager() {
  const img = newImg(64, 64);
  const F = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  const SKIN = "#c8a07a";
  const HAIR = "#3b2b20";
  const ROBE = "#8a5a3a";
  const ROBE_D = "#6b4423";
  const NOSE = "#a87f5a";

  F(0, 0, 32, 16, SKIN);
  F(8, 0, 8, 8, HAIR);
  F(24, 8, 8, 8, HAIR);
  F(0, 8, 8, 5, HAIR);
  F(16, 8, 8, 5, HAIR);
  F(8, 8, 8, 2, HAIR);
  F(10, 9, 2, 5, NOSE);
  F(8, 11, 1, 1, "#1a1a1a");
  F(13, 11, 1, 1, "#1a1a1a");

  F(16, 16, 24, 16, ROBE);
  F(20, 20, 8, 12, ROBE_D);
  F(20, 20, 8, 2, "#5e3c1a");

  F(40, 16, 16, 16, ROBE);
  F(48, 16, 4, 4, SKIN);
  F(40, 29, 16, 3, SKIN);
  F(32, 48, 16, 16, ROBE);
  F(40, 48, 4, 4, SKIN);
  F(32, 61, 16, 3, SKIN);

  F(0, 16, 16, 16, "#5b3a1a");
  F(16, 48, 16, 16, "#5b3a1a");
  return img;
}

// ---------- mobs ----------
function mobZombie() {
  const img = newImg(20, 30);
  const r = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  r(6, 21, 3, 9, "#3b4a8f");
  r(11, 21, 3, 9, "#3b4a8f");
  r(6, 29, 3, 1, "#222222");
  r(11, 29, 3, 1, "#222222");
  r(5, 10, 10, 11, "#2f8f8f");
  r(9, 12, 2, 7, "#256b6b");
  r(0, 12, 5, 3, "#5b8a3c");
  r(15, 12, 5, 3, "#5b8a3c");
  r(0, 15, 4, 3, "#4e7832");
  r(16, 15, 4, 3, "#4e7832");
  r(6, 1, 8, 8, "#5b8a3c");
  r(6, 1, 8, 2, "#3f6b2a");
  r(8, 4, 1, 2, "#1a1a1a");
  r(11, 4, 1, 2, "#1a1a1a");
  r(8, 7, 4, 1, "#1a1a1a");
  return img;
}

function mobSkeleton() {
  const img = newImg(20, 30);
  const r = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  r(7, 21, 2, 9, "#d8d8d8");
  r(11, 21, 2, 9, "#d8d8d8");
  r(6, 10, 8, 11, "#d8d8d8");
  r(7, 12, 6, 1, "#a8a8a8");
  r(7, 15, 6, 1, "#a8a8a8");
  r(7, 18, 6, 1, "#a8a8a8");
  r(1, 12, 5, 2, "#d8d8d8");
  r(14, 12, 5, 2, "#d8d8d8");
  r(6, 1, 8, 8, "#e8e8e8");
  r(8, 4, 2, 2, "#1a1a1a");
  r(11, 4, 2, 2, "#1a1a1a");
  r(9, 7, 2, 1, "#1a1a1a");
  return img;
}

function mobCow() {
  const img = newImg(22, 14);
  const r = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  r(3, 4, 16, 7, "#e8e8e8");
  r(6, 5, 3, 2, "#2b2b2b");
  r(12, 6, 4, 2, "#2b2b2b");
  r(15, 4, 2, 2, "#2b2b2b");
  r(18, 2, 4, 7, "#e8e8e8");
  r(18, 3, 4, 1, "#d8d8d8");
  r(19, 5, 3, 2, "#f0a0a0");
  r(19, 4, 1, 1, "#1a1a1a");
  r(18, 1, 2, 1, "#d8d8d8");
  r(21, 1, 1, 2, "#d8d8d8");
  r(5, 10, 2, 3, "#8a8a8a");
  r(9, 10, 2, 3, "#8a8a8a");
  r(13, 10, 2, 3, "#8a8a8a");
  r(16, 10, 2, 3, "#8a8a8a");
  r(10, 11, 4, 1, "#f0a0a0");
  return img;
}

function mobPig() {
  const img = newImg(18, 12);
  const r = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  r(3, 5, 12, 5, "#f0a0a0");
  r(6, 6, 3, 2, "#e88f8f");
  r(14, 3, 4, 7, "#f0a0a0");
  r(17, 5, 1, 2, "#d97f7f");
  r(15, 4, 1, 1, "#1a1a1a");
  r(15, 2, 2, 1, "#d97f7f");
  r(4, 9, 2, 2, "#d97f7f");
  r(7, 9, 2, 2, "#d97f7f");
  r(11, 9, 2, 2, "#d97f7f");
  r(13, 9, 2, 2, "#d97f7f");
  return img;
}

function mobSheep() {
  const img = newImg(18, 12);
  const r = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  r(3, 4, 13, 6, "#f4f4f4");
  r(5, 5, 2, 2, "#e0e0e0");
  r(9, 6, 2, 2, "#e0e0e0");
  r(14, 3, 4, 7, "#f4f4f4");
  r(15, 5, 2, 3, "#d8d8d8");
  r(15, 5, 1, 1, "#1a1a1a");
  r(4, 10, 2, 2, "#4a4a4a");
  r(7, 10, 2, 2, "#4a4a4a");
  r(11, 10, 2, 2, "#4a4a4a");
  r(14, 10, 2, 2, "#4a4a4a");
  return img;
}

function mobChicken() {
  const img = newImg(12, 10);
  const r = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  r(3, 4, 6, 5, "#f4f4f4");
  r(4, 5, 3, 2, "#e0e0e0");
  r(8, 2, 3, 4, "#f4f4f4");
  r(10, 4, 1, 1, "#f2c94c");
  r(9, 1, 2, 1, "#d64545");
  r(9, 3, 1, 1, "#1a1a1a");
  r(4, 9, 1, 1, "#f2c94c");
  r(6, 9, 1, 1, "#f2c94c");
  return img;
}

function mobVillager() {
  const img = newImg(20, 30);
  const r = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  r(6, 27, 3, 3, "#5b3a1a");
  r(11, 27, 3, 3, "#5b3a1a");
  r(4, 9, 12, 18, "#8a5a3a");
  r(9, 12, 2, 12, "#6b4423");
  r(4, 13, 12, 3, "#7a4a2a");
  r(5, 1, 10, 9, "#c8a07a");
  r(5, 1, 10, 2, "#3b2b20");
  r(6, 3, 8, 1, "#3b2b20");
  r(9, 4, 2, 4, "#a87f5a");
  r(7, 4, 1, 1, "#1a1a1a");
  r(12, 4, 1, 1, "#1a1a1a");
  return img;
}

function mobCreeper() {
  const img = newImg(16, 30);
  const r = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  r(3, 22, 4, 8, "#4e8f3f");
  r(9, 22, 4, 8, "#4e8f3f");
  r(3, 8, 10, 15, "#5aa64a");
  r(5, 10, 2, 2, "#4e8f3f");
  r(9, 14, 2, 2, "#4e8f3f");
  r(4, 18, 2, 2, "#4e8f3f");
  r(10, 9, 2, 2, "#4e8f3f");
  r(4, 10, 3, 3, "#151515");
  r(9, 10, 3, 3, "#151515");
  r(7, 13, 2, 5, "#151515");
  r(6, 15, 1, 3, "#151515");
  r(9, 15, 1, 3, "#151515");
  return img;
}

function mobSlime() {
  const img = newImg(16, 14);
  const r = (x, y, w, h, c) => rect(img, x, y, w, h, hex(c));
  r(2, 4, 12, 9, "#6fcf6f");
  r(2, 4, 12, 2, "#8fe08f");
  r(5, 7, 2, 2, "#1a3a1a");
  r(9, 7, 2, 2, "#1a3a1a");
  r(6, 10, 4, 1, "#1a3a1a");
  r(2, 12, 12, 1, "#5ab85a");
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

// Texturas que vienen del pack CC0 (OpenGameArt) y no deben regenerarse.
const PACK_PROVIDED = new Set([
  "grass_top.png",
  "grass_side.png",
  "dirt.png",
  "planks.png",
  "log_side.png",
  "log_top.png",
  "leaves.png",
  "gravel.png",
  "stone.png",
  "flower_red.png",
  "flower_yellow.png",
  "tall_grass.png",
]);

let blockCount = 0;
for (const [name, img] of Object.entries(blocks)) {
  if (PACK_PROVIDED.has(name)) continue;
  save(img, join(BLOCKS, name));
  blockCount++;
}
save(skin(), join(ROOT, "public/textures/skin.png"));

const MOBS = join(ROOT, "public/textures/mobs");
mkdirSync(MOBS, { recursive: true });
const mobs = {
  "zombie.png": mobZombie(),
  "skeleton.png": mobSkeleton(),
  "cow.png": mobCow(),
  "pig.png": mobPig(),
  "sheep.png": mobSheep(),
  "chicken.png": mobChicken(),
  "villager.png": mobVillager(),
  "creeper.png": mobCreeper(),
  "slime.png": mobSlime(),
  "skin_zombie.png": skinZombie(),
  "skin_skeleton.png": skinSkeleton(),
  "skin_villager.png": skinVillager(),
};
for (const [name, img] of Object.entries(mobs)) save(img, join(MOBS, name));

console.log(
  "Generated",
  blockCount + Object.keys(mobs).length + 1,
  "textures (pack CC0 textures untouched)",
);
