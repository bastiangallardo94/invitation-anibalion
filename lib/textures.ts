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

function noisy(
  ctx: CanvasRenderingContext2D,
  base: string,
  amp: number,
) {
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
  head: THREE.CanvasTexture;
  tnt: THREE.CanvasTexture;
}

export type BlockMaterials = Record<string, THREE.MeshStandardMaterial[]>;

let texCache: Textures | null = null;
let matCache: BlockMaterials | null = null;

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
  const head = makeTexture((ctx) => {
    ctx.fillStyle = "#3b2b20";
    ctx.fillRect(0, 0, S, 4);
    ctx.fillStyle = "#e0ac69";
    ctx.fillRect(0, 4, S, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(4, 7, 2, 2);
    ctx.fillRect(10, 7, 2, 2);
    ctx.fillStyle = "#4a3bd0";
    ctx.fillRect(5, 7, 1, 1);
    ctx.fillRect(11, 7, 1, 1);
    ctx.fillStyle = "#8a5a3a";
    ctx.fillRect(6, 11, 4, 1);
  });

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
    head,
    tnt,
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
  };
  return matCache;
}
