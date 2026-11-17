"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Block } from "./Block";
import { Chest } from "./Chest";
import { TREE_POSITIONS, WORLD_SIZE } from "@/lib/constants";
import { getTextures } from "@/lib/textures";

function Tree({ x, z }: { x: number; z: number }) {
  const trunks: [number, number, number][] = [];
  for (let i = 0; i < 4; i++) trunks.push([x, i + 0.5, z]);

  const leaves: [number, number, number][] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dz === 0) continue;
      leaves.push([x + dx, 4, z + dz]);
    }
  }
  for (let dx = -1; dx <= 1; dx++) {
    for (let dz = -1; dz <= 1; dz++) {
      leaves.push([x + dx, 5, z + dz]);
    }
  }
  leaves.push([x, 6, z]);
  leaves.push([x + 1, 6, z]);
  leaves.push([x - 1, 6, z]);
  leaves.push([x, 6, z + 1]);
  leaves.push([x, 6, z - 1]);
  leaves.push([x, 7, z]);

  return (
    <group>
      {trunks.map((p, i) => (
        <Block key={`t${i}`} type="log" position={p} />
      ))}
      {leaves.map((p, i) => (
        <Block key={`l${i}`} type="leaves" position={p} />
      ))}
    </group>
  );
}

export function World() {
  const groundMats = useMemo(() => {
    const t = getTextures();
    const top = t.grassTop.clone();
    top.repeat.set(WORLD_SIZE, WORLD_SIZE);
    top.wrapS = THREE.RepeatWrapping;
    top.wrapT = THREE.RepeatWrapping;
    top.needsUpdate = true;

    const side = t.grassSide.clone();
    side.repeat.set(WORLD_SIZE, 1);
    side.wrapS = THREE.RepeatWrapping;
    side.needsUpdate = true;

    const bottom = t.dirt.clone();
    bottom.repeat.set(WORLD_SIZE, WORLD_SIZE);
    bottom.wrapS = THREE.RepeatWrapping;
    bottom.wrapT = THREE.RepeatWrapping;
    bottom.needsUpdate = true;

    const topMat = new THREE.MeshStandardMaterial({ map: top, roughness: 1 });
    const sideMat = new THREE.MeshStandardMaterial({ map: side, roughness: 1 });
    const bottomMat = new THREE.MeshStandardMaterial({ map: bottom, roughness: 1 });
    return [sideMat, sideMat, topMat, bottomMat, sideMat, sideMat];
  }, []);

  const clouds: [number, number, number][] = [
    [-4, 9, -4],
    [3, 10, -6],
    [6, 9, 4],
    [-7, 11, 5],
    [0, 10, 1],
  ];

  return (
    <group>
      <mesh
        position={[0, -0.5, 0]}
        material={groundMats}
        receiveShadow
      >
        <boxGeometry args={[WORLD_SIZE, 1, WORLD_SIZE]} />
      </mesh>

      <Block type="stone" position={[-5, 0.5, 4]} />
      <Block type="stone" position={[-5.5, 0.5, 4]} />
      <Block type="dirt" position={[4, 0.5, 3]} />
      <Block type="planks" position={[2, 0.5, 4]} />
      <Block type="planks" position={[2, 0.5, 5]} />
      <Block type="sand" position={[-2, 0.5, -4]} />
      <Block type="sand" position={[-2, 0.5, -5]} />

      {TREE_POSITIONS.map((t, i) => (
        <Tree key={i} x={t.x} z={t.z} />
      ))}

      {clouds.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[3, 0.4, 1.6]} />
          <meshStandardMaterial color="#ffffff" flatShading />
        </mesh>
      ))}

      <Chest />
    </group>
  );
}
