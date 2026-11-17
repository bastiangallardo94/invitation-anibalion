"use client";

import { Block } from "./Block";

export function Tree({
  x,
  z,
  variant = "oak",
}: {
  x: number;
  z: number;
  variant?: "oak" | "birch";
}) {
  const trunkType = variant === "birch" ? "birchLog" : "log";
  const leafType = variant === "birch" ? "birchLeaves" : "leaves";
  const height = variant === "birch" ? 5 : 4;

  const trunks: [number, number, number][] = [];
  for (let i = 0; i < height; i++) trunks.push([x, i + 0.5, z]);

  const topY = height;
  const leaves: [number, number, number][] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dz === 0) continue;
      leaves.push([x + dx, topY, z + dz]);
    }
  }
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      leaves.push([x + dx, topY + 1, z + dz]);
    }
  }
  leaves.push([x, topY + 2, z]);
  leaves.push([x + 1, topY + 2, z]);
  leaves.push([x - 1, topY + 2, z]);
  leaves.push([x, topY + 2, z + 1]);
  leaves.push([x, topY + 2, z - 1]);
  leaves.push([x, topY + 3, z]);

  return (
    <group>
      {trunks.map((p, i) => (
        <Block key={`t${i}`} type={trunkType} position={p} />
      ))}
      {leaves.map((p, i) => (
        <Block key={`l${i}`} type={leafType} position={p} />
      ))}
    </group>
  );
}
