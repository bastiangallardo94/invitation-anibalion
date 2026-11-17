import { SOLIDS, type AABB } from "./constants";

function overlaps(
  x: number,
  y: number,
  z: number,
  s: AABB,
  hx: number,
  hz: number,
  height: number,
): boolean {
  return (
    x - hx < s.max[0] &&
    x + hx > s.min[0] &&
    y < s.max[1] &&
    y + height > s.min[1] &&
    z - hz < s.max[2] &&
    z + hz > s.min[2]
  );
}

export interface Resolved {
  x: number;
  y: number;
  z: number;
  onGround: boolean;
  hitCeil: boolean;
}

export function resolveMovement(
  x: number,
  y: number,
  z: number,
  dx: number,
  dy: number,
  dz: number,
  hx: number,
  hz: number,
  height: number,
): Resolved {
  let nx = x + dx;
  let ny = y + dy;
  let nz = z + dz;
  let onGround = false;
  let hitCeil = false;

  // X axis
  for (const s of SOLIDS) {
    if (overlaps(nx, y, z, s, hx, hz, height)) {
      if (dx > 0) nx = s.min[0] - hx;
      else if (dx < 0) nx = s.max[0] + hx;
    }
  }

  // Z axis
  for (const s of SOLIDS) {
    if (overlaps(nx, y, nz, s, hx, hz, height)) {
      if (dz > 0) nz = s.min[2] - hz;
      else if (dz < 0) nz = s.max[2] + hz;
    }
  }

  // Y axis
  for (const s of SOLIDS) {
    if (overlaps(nx, ny, nz, s, hx, hz, height)) {
      if (dy <= 0) {
        ny = s.max[1];
        onGround = true;
      } else {
        ny = s.min[1] - height;
        hitCeil = true;
      }
    }
  }

  if (ny <= 0) {
    ny = 0;
    onGround = true;
  }

  return { x: nx, y: ny, z: nz, onGround, hitCeil };
}
