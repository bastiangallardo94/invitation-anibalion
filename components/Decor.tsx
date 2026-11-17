"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CHEST_POS, TREE_POSITIONS } from "@/lib/constants";
import { getBlockMaterials, getTextures } from "@/lib/textures";

function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type PlantKind = "red" | "yellow" | "grass";

interface PlantSpec {
  x: number;
  z: number;
  kind: PlantKind;
  scale: number;
  rot: number;
}

const PLANT_SPECS: PlantSpec[] = (() => {
  const rng = mulberry32(2024);
  const kinds: PlantKind[] = ["grass", "grass", "grass", "red", "yellow"];
  const specs: PlantSpec[] = [];
  let attempts = 0;
  while (specs.length < 80 && attempts < 600) {
    attempts++;
    const x = (rng() * 2 - 1) * 8;
    const z = (rng() * 2 - 1) * 8;
    if (Math.abs(x) < 1.7) continue; // keep the path clear
    if (Math.hypot(x - CHEST_POS.x, z - CHEST_POS.z) < 2.6) continue;
    let nearTree = false;
    for (const t of TREE_POSITIONS) {
      if (Math.hypot(x - t.x, z - t.z) < 1.4) nearTree = true;
    }
    if (nearTree) continue;
    specs.push({
      x,
      z,
      kind: kinds[Math.floor(rng() * kinds.length)],
      scale: 0.7 + rng() * 0.5,
      rot: rng() * Math.PI,
    });
  }
  return specs;
})();

function plantMaterial(map: THREE.Texture) {
  return new THREE.MeshStandardMaterial({
    map,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
    roughness: 1,
    depthWrite: true,
  });
}

export function Plants() {
  const mats = useMemo(() => {
    const t = getTextures();
    return {
      red: plantMaterial(t.flowerRed),
      yellow: plantMaterial(t.flowerYellow),
      grass: plantMaterial(t.tallGrass),
    };
  }, []);

  return (
    <group>
      {PLANT_SPECS.map((p, i) => {
        const h = 0.8 * p.scale;
        return (
          <group key={i} position={[p.x, h / 2, p.z]} rotation={[0, p.rot, 0]}>
            <mesh material={mats[p.kind]}>
              <planeGeometry args={[h, h]} />
            </mesh>
            <mesh material={mats[p.kind]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[h, h]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export function Path() {
  const gravel = getBlockMaterials().gravel;
  const tiles: [number, number][] = [];
  for (let z = 3; z <= 9; z++) {
    for (let x = -1; x <= 1; x++) {
      if (Math.abs(x) === 1 && (z === 4 || z === 8)) continue; // slightly organic edges
      tiles.push([x, z]);
    }
  }
  return (
    <group>
      {tiles.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.021, z]} material={gravel} receiveShadow>
          <boxGeometry args={[1, 0.04, 1]} />
        </mesh>
      ))}
    </group>
  );
}

export function BirthdayCorner() {
  const mats = getBlockMaterials();
  return (
    <group position={[-3.2, 0, 5.4]}>
      <mesh position={[0, 0.5, 0]} material={mats.planks} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh position={[0, 1.25, 0]} material={mats.cake} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.6]} />
      </mesh>
      {/* candle flame */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[0.08, 0.16, 0.08]} />
        <meshStandardMaterial color="#ffd166" emissive="#ffb703" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

const BALLOON_COLORS = ["#e0557f", "#f2c94c", "#56ccf2", "#6fcf97", "#bb6bd9"];

export function Balloons() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      const t = state.clock.elapsedTime;
      group.current.position.y = 3.4 + Math.sin(t * 1.4) * 0.12;
      group.current.rotation.y = Math.sin(t * 0.4) * 0.15;
    }
  });

  return (
    <group ref={group} position={[3.4, 3.4, 4.8]}>
      {BALLOON_COLORS.map((color, i) => {
        const angle = (i / BALLOON_COLORS.length) * Math.PI * 2;
        const bx = Math.cos(angle) * 0.45;
        const bz = Math.sin(angle) * 0.45;
        const by = ((i % 3) - 1) * 0.25;
        return (
          <group key={color} position={[bx, by, bz]}>
            <mesh castShadow>
              <sphereGeometry args={[0.28, 16, 16]} />
              <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
            </mesh>
            <mesh position={[0, -0.75, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 1.4, 4]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
