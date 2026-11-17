import * as THREE from "three";

export type CreatureKind =
  | "zombie"
  | "skeleton"
  | "cow"
  | "pig"
  | "sheep"
  | "chicken"
  | "villager"
  | "creeper"
  | "slime";

export interface Sprite {
  texture: THREE.CanvasTexture;
  aspect: number;
}

type Rect = (x: number, y: number, w: number, h: number, color: string) => void;

function makeSprite(w: number, h: number, draw: (r: Rect) => void): Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  const r: Rect = (x, y, ww, hh, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, ww, hh);
  };
  draw(r);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return { texture: tex, aspect: w / h };
}

function drawZombie(r: Rect) {
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
}

function drawSkeleton(r: Rect) {
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
}

function drawCow(r: Rect) {
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
}

function drawPig(r: Rect) {
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
}

function drawSheep(r: Rect) {
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
}

function drawChicken(r: Rect) {
  r(3, 4, 6, 5, "#f4f4f4");
  r(4, 5, 3, 2, "#e0e0e0");
  r(8, 2, 3, 4, "#f4f4f4");
  r(10, 4, 1, 1, "#f2c94c");
  r(9, 1, 2, 1, "#d64545");
  r(9, 3, 1, 1, "#1a1a1a");
  r(4, 9, 1, 1, "#f2c94c");
  r(6, 9, 1, 1, "#f2c94c");
}

function drawVillager(r: Rect) {
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
}

function drawCreeper(r: Rect) {
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
}

function drawSlime(r: Rect) {
  r(2, 4, 12, 9, "#6fcf6f");
  r(2, 4, 12, 2, "#8fe08f");
  r(5, 7, 2, 2, "#1a3a1a");
  r(9, 7, 2, 2, "#1a3a1a");
  r(6, 10, 4, 1, "#1a3a1a");
  r(2, 12, 12, 1, "#5ab85a");
}

const cache: Partial<Record<CreatureKind, Sprite>> = {};

export function getCreatureSprite(kind: CreatureKind): Sprite {
  if (cache[kind]) return cache[kind]!;
  let sprite: Sprite;
  switch (kind) {
    case "zombie":
      sprite = makeSprite(20, 30, drawZombie);
      break;
    case "skeleton":
      sprite = makeSprite(20, 30, drawSkeleton);
      break;
    case "cow":
      sprite = makeSprite(22, 14, drawCow);
      break;
    case "pig":
      sprite = makeSprite(18, 12, drawPig);
      break;
    case "sheep":
      sprite = makeSprite(18, 12, drawSheep);
      break;
    case "chicken":
      sprite = makeSprite(12, 10, drawChicken);
      break;
    case "villager":
      sprite = makeSprite(20, 30, drawVillager);
      break;
    case "creeper":
      sprite = makeSprite(16, 30, drawCreeper);
      break;
    case "slime":
      sprite = makeSprite(16, 14, drawSlime);
      break;
  }
  cache[kind] = sprite;
  return sprite;
}
