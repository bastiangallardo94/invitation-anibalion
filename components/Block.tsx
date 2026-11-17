"use client";

import * as THREE from "three";
import { getBlockMaterials } from "@/lib/textures";

const boxGeom = new THREE.BoxGeometry(1, 1, 1);

export function Block({
  type,
  position,
  materialOverride,
}: {
  type: keyof ReturnType<typeof getBlockMaterials>;
  position: [number, number, number];
  materialOverride?: THREE.MeshStandardMaterial[];
}) {
  const materials = materialOverride ?? getBlockMaterials()[type];
  return (
    <mesh
      geometry={boxGeom}
      material={materials}
      position={position}
      castShadow
      receiveShadow
    />
  );
}
