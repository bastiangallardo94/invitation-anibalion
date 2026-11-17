"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CHEST_POS } from "@/lib/constants";
import { useGame } from "@/lib/store";
import { getBlockMaterials } from "@/lib/textures";

export function Chest() {
  const chestOpen = useGame((s) => s.chestOpen);
  const lidRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const target = chestOpen ? -1.15 : 0;
    if (lidRef.current) {
      const cur = lidRef.current.rotation.x;
      lidRef.current.rotation.x += (target - cur) * 0.15;
    }
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshBasicMaterial;
      m.opacity += ((chestOpen ? 0.35 : 0) - m.opacity) * 0.1;
      glowRef.current.rotation.y = state.clock.elapsedTime * 0.6;
    }
  });

  const chest = getBlockMaterials().chest;

  return (
    <group position={[CHEST_POS.x, 0, CHEST_POS.z]}>
      <mesh position={[0, 0.275, 0]} material={chest} castShadow receiveShadow>
        <boxGeometry args={[1, 0.55, 0.6]} />
      </mesh>

      <group ref={lidRef} position={[0, 0.55, -0.3]}>
        <mesh position={[0, 0.225, 0.3]} material={chest} castShadow>
          <boxGeometry args={[1, 0.45, 0.6]} />
        </mesh>
        <mesh position={[0, 0.05, 0.58]}>
          <boxGeometry args={[0.22, 0.18, 0.06]} />
          <meshStandardMaterial color="#2a1a0a" />
        </mesh>
      </group>

      <mesh ref={glowRef} position={[0, 0.6, 0]} visible={chestOpen}>
        <boxGeometry args={[1.2, 0.6, 0.8]} />
        <meshBasicMaterial
          color="#ffd76a"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
