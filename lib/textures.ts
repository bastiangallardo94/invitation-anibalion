import * as THREE from "three";

const S = 16;

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  r = Math.max(0, Math.min(255, r + amt));
  g = Math.max(0, Math.min(255, g + amt));
  b = Math.max(0, Math.min(255, b + amt));
  return `rgb(${r},${g},${b})`;
}

function noisy(ctx: CanvasRenderingContext2D, base: string, amp: number) {
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      ctx.fillStyle = shade(base, Math.floor(Math.random() * (amp * 2 + 1) - amp));
      ctx.fillRect(x, y, 1, 1);
    }
  }
}

function makeTexture(
  draw: (ctx: CanvasRenderingContext2D) => void,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, S, S);
  draw(ctx);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function mat(map: THREE.Texture): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ map, roughness: 1 });
}

export interface Textures {
  grassTop: THREE.CanvasTexture;
  grassSide: THREE.CanvasTexture;
  dirt: THREE.CanvasTexture;
  stone: THREE.CanvasTexture;
  planks: THREE.CanvasTexture;
  logSide: THREE.CanvasTexture;
  logTop: THREE.CanvasTexture;
  leaves: THREE.CanvasTexture;
  chest: THREE.CanvasTexture;
  sand: THREE.CanvasTexture;
  tnt: THREE.CanvasTexture;
  gravel: THREE.CanvasTexture;
  birchSide: THREE.CanvasTexture;
  birchTop: THREE.CanvasTexture;
  birchLeaves: THREE.CanvasTexture;
  flowerRed: THREE.CanvasTexture;
  flowerYellow: THREE.CanvasTexture;
  tallGrass: THREE.CanvasTexture;
  cakeTop: THREE.CanvasTexture;
  cakeSide: THREE.CanvasTexture;
}

export type BlockMaterials = Record<string, THREE.MeshStandardMaterial[]>;

let texCache: Textures | null = null;
let matCache: BlockMaterials | null = null;

function drawFlower(
  ctx: CanvasRenderingContext2D,
  petal: string,
  petalLight: string,
  center: string,
) {
  ctx.fillStyle = "#3f7d2f";
  ctx.fillRect(7, 7, 1, 9); // stem
  ctx.fillRect(5, 11, 2, 1); // leaf
  ctx.fillRect(9, 12, 2, 1); // leaf
  ctx.fillStyle = petal;
  ctx.fillRect(7, 1, 2, 1);
  ctx.fillRect(6, 2, 4, 1);
  ctx.fillRect(5, 3, 6, 2);
  ctx.fillRect(6, 5, 4, 1);
  ctx.fillRect(7, 6, 2, 1);
  ctx.fillStyle = petalLight;
  ctx.fillRect(6, 3, 2, 1);
  ctx.fillRect(8, 4, 2, 1);
  ctx.fillStyle = center;
  ctx.fillRect(7, 3, 2, 2);
}

export function getTextures(): Textures {
  if (texCache) return texCache;

  const grassTop = makeTexture((ctx) => noisy(ctx, "#8fce54", 14));
  const dirt = makeTexture((ctx) => noisy(ctx, "#966c4a", 18));
  const grassSide = makeTexture((ctx) => {
    noisy(ctx, "#966c4a", 18);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < S; x++) {
        ctx.fillStyle = shade("#79c04b", Math.floor(Math.random() * 15 - 7));
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
  const stone = makeTexture((ctx) => noisy(ctx, "#8a8a8a", 16));
  const planks = makeTexture((ctx) => {
    noisy(ctx, "#b8945f", 10);
    ctx.fillStyle = "#8a6238";
    for (let y = 0; y < S; y += 4) ctx.fillRect(0, y, S, 1);
  });
  const logSide = makeTexture((ctx) => {
    for (let x = 0; x < S; x++) {
      ctx.fillStyle = shade("#6b4a2b", Math.floor(Math.random() * 24 - 12));
      ctx.fillRect(x, 0, 1, S);
    }
  });
  const logTop = makeTexture((ctx) => {
    noisy(ctx, "#9c7a4e", 10);
    ctx.strokeStyle = "#7a5a35";
    for (let r = 1; r < 8; r += 2) ctx.strokeRect(r, r, S - 2 * r, S - 2 * r);
  });
  const leaves = makeTexture((ctx) => {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        ctx.fillStyle = shade("#3f7d2f", Math.floor(Math.random() * 32 - 16));
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });
  const chest = makeTexture((ctx) => {
    noisy(ctx, "#9c6b35", 10);
    ctx.fillStyle = "#5e3c1a";
    ctx.fillRect(0, 0, S, 1);
    ctx.fillRect(0, S - 1, S, 1);
    ctx.fillRect(0, 0, 1, S);
    ctx.fillRect(S - 1, 0, 1, S);
  });
  const sand = makeTexture((ctx) => noisy(ctx, "#dbd3a0", 10));

  const tnt = makeTexture((ctx) => {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        ctx.fillStyle = shade("#c0392b", Math.floor(Math.random() * 20 - 10));
        ctx.fillRect(x, y, 1, 1);
      }
    }
    ctx.fillStyle = "#e8e0d0";
    ctx.fillRect(0, 6, S, 4);

    ctx.fillStyle = "#1a1a1a";
    const px = (x: number, y: number) => ctx.fillRect(x, y, 1, 1);
    const letter = (ch: string, ox: number, oy: number) => {
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

    const fw = (cx: number, cy: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(cx - 1, cy, 3, 1);
      ctx.fillRect(cx, cy - 1, 1, 3);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx, cy, 1, 1);
    };
    fw(4, 2, "#7fd8ff");
    fw(12, 3, "#ffe066");
    fw(5, 13, "#ff9bd2");
    fw(11, 12, "#ffffff");
    fw(8, 1, "#ffb347");
  });

  const gravel = makeTexture((ctx) => {
    noisy(ctx, "#8a7f78", 26);
    for (let i = 0; i < 26; i++) {
      ctx.fillStyle = shade("#8a7f78", Math.random() > 0.5 ? 40 : -40);
      ctx.fillRect(Math.floor(Math.random() * S), Math.floor(Math.random() * S), 1, 1);
    }
  });

  const birchSide = makeTexture((ctx) => {
    noisy(ctx, "#d8d3c8", 8);
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = "#3b3b3b";
      const y = Math.floor(Math.random() * S);
      const x = Math.floor(Math.random() * (S - 4));
      ctx.fillRect(x, y, 2 + Math.floor(Math.random() * 3), 1);
    }
  });
  const birchTop = makeTexture((ctx) => {
    noisy(ctx, "#d8d3c8", 8);
    ctx.strokeStyle = "#9a9488";
    for (let r = 1; r < 8; r += 2) ctx.strokeRect(r, r, S - 2 * r, S - 2 * r);
  });
  const birchLeaves = makeTexture((ctx) => {
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        ctx.fillStyle = shade("#6fae4b", Math.floor(Math.random() * 30 - 15));
        ctx.fillRect(x, y, 1, 1);
      }
    }
  });

  const flowerRed = makeTexture((ctx) => drawFlower(ctx, "#d64545", "#ef6b6b", "#ffe066"));
  const flowerYellow = makeTexture((ctx) => drawFlower(ctx, "#f2c94c", "#ffe082", "#c98a1b"));
  const tallGrass = makeTexture((ctx) => {
    const blades: [number, number, number][] = [
      [3, 6, 15],
      [5, 9, 15],
      [7, 4, 15],
      [9, 8, 15],
      [11, 6, 14],
      [13, 9, 15],
    ];
    for (const [x, y0, y1] of blades) {
      ctx.fillStyle = shade("#4f9c3a", Math.floor(Math.random() * 24 - 12));
      ctx.fillRect(x, y0, 1, y1 - y0);
    }
  });

  const cakeTop = makeTexture((ctx) => {
    ctx.fillStyle = "#f3e8d6";
    ctx.fillRect(0, 0, S, S);
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? "#e0557f" : "#ffd54f";
      ctx.fillRect(2 + Math.floor(Math.random() * 12), 2 + Math.floor(Math.random() * 12), 1, 1);
    }
    ctx.fillStyle = "#d64545";
    ctx.fillRect(7, 7, 2, 2);
  });
  const cakeSide = makeTexture((ctx) => {
    ctx.fillStyle = "#f3e8d6";
    ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = "#e8b9c8";
    ctx.fillRect(0, 5, S, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, S, 3);
    ctx.fillStyle = "#d9a15b";
    ctx.fillRect(0, 12, S, 2);
  });

  texCache = {
    grassTop,
    grassSide,
    dirt,
    stone,
    planks,
    logSide,
    logTop,
    leaves,
    chest,
    sand,
    tnt,
    gravel,
    birchSide,
    birchTop,
    birchLeaves,
    flowerRed,
    flowerYellow,
    tallGrass,
    cakeTop,
    cakeSide,
  };
  return texCache;
}

export function getBlockMaterials(): BlockMaterials {
  if (matCache) return matCache;

  const t = getTextures();

  matCache = {
    grass: [mat(t.grassSide), mat(t.grassSide), mat(t.grassTop), mat(t.dirt), mat(t.grassSide), mat(t.grassSide)],
    dirt: Array.from({ length: 6 }, () => mat(t.dirt)),
    stone: Array.from({ length: 6 }, () => mat(t.stone)),
    planks: Array.from({ length: 6 }, () => mat(t.planks)),
    log: [mat(t.logSide), mat(t.logSide), mat(t.logTop), mat(t.logTop), mat(t.logSide), mat(t.logSide)],
    leaves: Array.from({ length: 6 }, () => mat(t.leaves)),
    chest: Array.from({ length: 6 }, () => mat(t.chest)),
    sand: Array.from({ length: 6 }, () => mat(t.sand)),
    tnt: Array.from({ length: 6 }, () => mat(t.tnt)),
    gravel: Array.from({ length: 6 }, () => mat(t.gravel)),
    birchLog: [mat(t.birchSide), mat(t.birchSide), mat(t.birchTop), mat(t.birchTop), mat(t.birchSide), mat(t.birchSide)],
    birchLeaves: Array.from({ length: 6 }, () => mat(t.birchLeaves)),
    cake: [mat(t.cakeSide), mat(t.cakeSide), mat(t.cakeTop), mat(t.cakeSide), mat(t.cakeSide), mat(t.cakeSide)],
  };
  return matCache;
}
