export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface AABB {
  min: [number, number, number];
  max: [number, number, number];
}

export const WORLD_HALF = 9;
export const WORLD_SIZE = WORLD_HALF * 2;

export const CHEST_POS: Vec3 = { x: 0, y: 0, z: 3 };
export const PLAYER_SPAWN: Vec3 = { x: 0, y: 0, z: 9 };

export const TREE_POSITIONS: Vec3[] = [
  { x: -6, y: 0, z: -5 },
  { x: 5, y: 0, z: -6 },
  { x: -7, y: 0, z: 2 },
  { x: 7, y: 0, z: 0 },
  { x: 3, y: 0, z: -7 },
];

export function buildSolids(): AABB[] {
  const solids: AABB[] = [];
  solids.push({
    min: [CHEST_POS.x - 0.5, 0, CHEST_POS.z - 0.5],
    max: [CHEST_POS.x + 0.5, 1, CHEST_POS.z + 0.5],
  });
  for (const t of TREE_POSITIONS) {
    solids.push({
      min: [t.x - 0.5, 0, t.z - 0.5],
      max: [t.x + 0.5, 4, t.z + 0.5],
    });
  }
  return solids;
}

export const SOLIDS = buildSolids();
