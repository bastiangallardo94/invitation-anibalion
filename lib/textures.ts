import * as THREE from "three";

export interface Textures {
  grassTop: THREE.Texture;
  grassSide: THREE.Texture;
  dirt: THREE.Texture;
  stone: THREE.Texture;
  planks: THREE.Texture;
  logSide: THREE.Texture;
  logTop: THREE.Texture;
  leaves: THREE.Texture;
  chest: THREE.Texture;
  sand: THREE.Texture;
  tnt: THREE.Texture;
  gravel: THREE.Texture;
  birchSide: THREE.Texture;
  birchTop: THREE.Texture;
  birchLeaves: THREE.Texture;
  flowerRed: THREE.Texture;
  flowerYellow: THREE.Texture;
  tallGrass: THREE.Texture;
  cakeTop: THREE.Texture;
  cakeSide: THREE.Texture;
  skin: THREE.Texture;
  zombieSkin: THREE.Texture;
  skeletonSkin: THREE.Texture;
  villagerSkin: THREE.Texture;
}

export type BlockMaterials = Record<string, THREE.MeshStandardMaterial[]>;

const URLS: Record<keyof Textures, string> = {
  grassTop: "/textures/blocks/grass_top.png",
  grassSide: "/textures/blocks/grass_side.png",
  dirt: "/textures/blocks/dirt.png",
  stone: "/textures/blocks/stone.png",
  planks: "/textures/blocks/planks.png",
  logSide: "/textures/blocks/log_side.png",
  logTop: "/textures/blocks/log_top.png",
  leaves: "/textures/blocks/leaves.png",
  chest: "/textures/blocks/chest.png",
  sand: "/textures/blocks/sand.png",
  tnt: "/textures/blocks/tnt.png",
  gravel: "/textures/blocks/gravel.png",
  birchSide: "/textures/blocks/birch_side.png",
  birchTop: "/textures/blocks/birch_top.png",
  birchLeaves: "/textures/blocks/birch_leaves.png",
  flowerRed: "/textures/blocks/flower_red.png",
  flowerYellow: "/textures/blocks/flower_yellow.png",
  tallGrass: "/textures/blocks/tall_grass.png",
  cakeTop: "/textures/blocks/cake_top.png",
  cakeSide: "/textures/blocks/cake_side.png",
  skin: "/textures/skin.png",
  zombieSkin: "/textures/mobs/skin_zombie.png",
  skeletonSkin: "/textures/mobs/skin_skeleton.png",
  villagerSkin: "/textures/mobs/skin_villager.png",
};

let texCache: Textures | null = null;
let matCache: BlockMaterials | null = null;
let loadPromise: Promise<void> | null = null;

/** Loads every texture image once. Call before rendering the 3D scene. */
export function loadAllTextures(): Promise<void> {
  if (texCache) return Promise.resolve();
  if (loadPromise) return loadPromise;

  const loader = new THREE.TextureLoader();
  const cache = {} as Textures;
  texCache = cache;

  const entries = Object.entries(URLS) as [keyof Textures, string][];
  loadPromise = Promise.all(
    entries.map(async ([key, url]) => {
      const tex = await loader.loadAsync(url);
      tex.magFilter = THREE.NearestFilter;
      tex.minFilter = THREE.NearestFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.needsUpdate = true;
      cache[key] = tex;
    }),
  ).then(() => undefined);

  return loadPromise;
}

export function getTextures(): Textures {
  if (!texCache) throw new Error("Textures are not loaded yet");
  return texCache;
}

function mat(map: THREE.Texture): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ map, roughness: 1 });
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
