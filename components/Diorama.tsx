"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { BoxMob, type BoxMobKind } from "./BoxMob";
import { HumanoidMob } from "./HumanoidMob";
import { Tree } from "./Tree";
import { getBlockMaterials, getTextures } from "@/lib/textures";
import type { CreatureKind } from "@/lib/sprites";

const EXT = 70;

interface CreatureSpec {
  kind: CreatureKind;
  x: number;
  z: number;
  h: number;
  radius: number;
  speed: number;
  phase: number;
}

const CREATURES: CreatureSpec[] = [
  // Zombies 3D
  { kind: "zombie", x: -4, z: 0, h: 1.85, radius: 1.2, speed: 0.5, phase: 0.3 },
  { kind: "zombie", x: 4, z: -3, h: 1.85, radius: 1.1, speed: 0.45, phase: 2.1 },
  // Esqueletos 3D
  { kind: "skeleton", x: -3, z: -6, h: 1.85, radius: 1.1, speed: 0.58, phase: 0.9 },
  { kind: "skeleton", x: 5, z: -5, h: 1.85, radius: 1.1, speed: 0.55, phase: 1.2 },
  { kind: "skeleton", x: 3, z: 5, h: 1.85, radius: 1.0, speed: 0.6, phase: 2.6 },
  // Aldeano 3D
  { kind: "villager", x: -6, z: 4, h: 1.8, radius: 0.8, speed: 0.3, phase: 0.8 },
  // Animales 3D
  { kind: "cow", x: 6, z: -2, h: 1.0, radius: 1.3, speed: 0.35, phase: 0.8 },
  { kind: "pig", x: -4, z: -2, h: 1.0, radius: 1.1, speed: 0.5, phase: 1.7 },
  { kind: "sheep", x: 4, z: 7, h: 1.0, radius: 1.1, speed: 0.4, phase: 2.6 },
  { kind: "chicken", x: -7, z: 7, h: 1.0, radius: 0.8, speed: 0.8, phase: 0.2 },
  { kind: "creeper", x: 9, z: 6, h: 1.0, radius: 1.0, speed: 0.42, phase: 1.1 },
  { kind: "slime", x: -9, z: -5, h: 1.0, radius: 1.0, speed: 0.7, phase: 2.8 },
];

const HILLS: { x: number; z: number; s: number }[] = [
  { x: -30, z: -18, s: 1.8 },
  { x: 30, z: -22, s: 2.2 },
  { x: 38, z: 8, s: 1.7 },
  { x: -34, z: 16, s: 2.0 },
  { x: 8, z: -40, s: 2.4 },
  { x: -10, z: 40, s: 1.9 },
];

const FAR_TREES: { x: number; z: number; variant: "oak" | "birch" }[] = [
  { x: -17, z: -13, variant: "oak" },
  { x: 19, z: -15, variant: "birch" },
  { x: -21, z: 7, variant: "oak" },
  { x: 21, z: 13, variant: "birch" },
  { x: 6, z: -23, variant: "oak" },
];

const HUMANOIDS = new Set<CreatureKind>(["zombie", "skeleton", "villager"]);
const BOX_MOBS = new Set<CreatureKind>(["cow", "pig", "sheep", "chicken", "creeper", "slime"]);

function Hill({ x, z, s }: { x: number; z: number; s: number }) {
  const mats = getBlockMaterials();
  return (
    <group position={[x, 0, z]} scale={s}>
      <mesh position={[0, 1, 0]} material={mats.grass} receiveShadow>
        <boxGeometry args={[8, 2, 8]} />
      </mesh>
      <mesh position={[0, 3, 0]} material={mats.grass}>
        <boxGeometry args={[5, 2, 5]} />
      </mesh>
      <mesh position={[0, 4.5, 0]} material={mats.grass}>
        <boxGeometry args={[3, 1, 3]} />
      </mesh>
    </group>
  );
}

export function Diorama() {
  const grassMat = useMemo(() => {
    const t = getTextures().grassTop.clone();
    t.repeat.set(EXT * 2, EXT * 2);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 1 });
  }, []);

  const skins = useMemo(() => {
    const t = getTextures();
    return { zombie: t.zombieSkin, skeleton: t.skeletonSkin, villager: t.villagerSkin };
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} material={grassMat} receiveShadow>
        <planeGeometry args={[EXT * 2, EXT * 2]} />
      </mesh>

      {HILLS.map((h, i) => (
        <Hill key={`hill-${i}`} x={h.x} z={h.z} s={h.s} />
      ))}

      {FAR_TREES.map((t, i) => (
        <Tree key={`far-${i}`} x={t.x} z={t.z} variant={t.variant} />
      ))}

      {CREATURES.map((c, i) => {
        const wander = { x: c.x, z: c.z, radius: c.radius, speed: c.speed, phase: c.phase };
        if (HUMANOIDS.has(c.kind)) {
          const skin = skins[c.kind as "zombie" | "skeleton" | "villager"];
          return (
            <HumanoidMob
              key={`humanoid-${i}`}
              wander={wander}
              skin={skin}
              height={c.h}
              armsForward={c.kind === "zombie"}
            />
          );
        }
        if (BOX_MOBS.has(c.kind)) {
          return <BoxMob key={`box-${i}`} kind={c.kind as BoxMobKind} wander={wander} />;
        }
        return null;
      })}
    </group>
  );
}
