"use client";

import { useMemo } from "react";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Tree } from "./Tree";
import { getBlockMaterials, getTextures } from "@/lib/textures";
import { getCreatureSprite, type CreatureKind } from "@/lib/sprites";

const EXT = 70;

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

const CREATURES: { kind: CreatureKind; x: number; z: number; h: number }[] = [
  { kind: "zombie", x: -12, z: -7, h: 1.9 },
  { kind: "skeleton", x: -14, z: -10, h: 1.9 },
  { kind: "cow", x: 13, z: -8, h: 1.3 },
  { kind: "pig", x: 11, z: -12, h: 1.0 },
  { kind: "sheep", x: 16, z: -2, h: 1.15 },
  { kind: "chicken", x: 10.5, z: 7, h: 0.8 },
  { kind: "zombie", x: 14, z: 12, h: 1.9 },
  { kind: "skeleton", x: -11, z: 13, h: 1.9 },
  { kind: "sheep", x: -16, z: 5, h: 1.15 },
  { kind: "cow", x: -10, z: 15, h: 1.3 },
];

export function Diorama() {
  const grassMat = useMemo(() => {
    const t = getTextures().grassTop.clone();
    t.repeat.set(EXT, EXT);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map: t, roughness: 1 });
  }, []);

  const creatureMats = useMemo(() => {
    const kinds: CreatureKind[] = ["zombie", "skeleton", "cow", "pig", "sheep", "chicken"];
    const out = {} as Record<CreatureKind, { mat: THREE.Material; aspect: number }>;
    for (const k of kinds) {
      const s = getCreatureSprite(k);
      out[k] = {
        mat: new THREE.MeshStandardMaterial({
          map: s.texture,
          transparent: true,
          alphaTest: 0.5,
          side: THREE.DoubleSide,
          roughness: 1,
        }),
        aspect: s.aspect,
      };
    }
    return out;
  }, []);

  return (
    <group>
      {/* Extended ground so the sides of the island never look empty. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} material={grassMat} receiveShadow>
        <planeGeometry args={[EXT * 2, EXT * 2]} />
      </mesh>

      {HILLS.map((h, i) => (
        <Hill key={`hill-${i}`} x={h.x} z={h.z} s={h.s} />
      ))}

      {FAR_TREES.map((t, i) => (
        <Tree key={`far-${i}`} x={t.x} z={t.z} variant={t.variant} />
      ))}

      {CREATURES.map((c, i) => {
        const m = creatureMats[c.kind];
        return (
          <Billboard key={`mob-${i}`} position={[c.x, c.h / 2 - 0.02, c.z]}>
            <mesh material={m.mat}>
              <planeGeometry args={[c.h * m.aspect, c.h]} />
            </mesh>
          </Billboard>
        );
      })}
    </group>
  );
}
