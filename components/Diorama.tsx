"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { Tree } from "./Tree";
import { getBlockMaterials, getTextures } from "@/lib/textures";
import { getCreatureSprite, CREATURE_KINDS, type CreatureKind } from "@/lib/sprites";

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
  // grupo de "enemigos" delante a la izquierda
  { kind: "zombie", x: -12, z: -7, h: 1.9, radius: 1.2, speed: 0.5, phase: 0.3 },
  { kind: "zombie", x: -13.5, z: -9, h: 1.9, radius: 1.0, speed: 0.45, phase: 2.1 },
  { kind: "skeleton", x: -15, z: -11, h: 1.9, radius: 1.4, speed: 0.6, phase: 1.2 },
  { kind: "creeper", x: -11, z: -12, h: 1.6, radius: 1.1, speed: 0.4, phase: 3.4 },
  // animales delante a la derecha
  { kind: "cow", x: 13, z: -8, h: 1.3, radius: 1.8, speed: 0.35, phase: 0.8 },
  { kind: "pig", x: 11, z: -12, h: 1.0, radius: 1.5, speed: 0.5, phase: 1.7 },
  { kind: "sheep", x: 16, z: -2, h: 1.15, radius: 1.6, speed: 0.4, phase: 2.6 },
  { kind: "chicken", x: 10.5, z: 6, h: 0.8, radius: 0.9, speed: 0.8, phase: 0.2 },
  { kind: "sheep", x: 18, z: -12, h: 1.15, radius: 1.7, speed: 0.38, phase: 4.1 },
  // resto alrededor
  { kind: "zombie", x: 14, z: 12, h: 1.9, radius: 1.3, speed: 0.5, phase: 1.9 },
  { kind: "skeleton", x: -11, z: 13, h: 1.9, radius: 1.2, speed: 0.55, phase: 0.9 },
  { kind: "villager", x: -16, z: 6, h: 1.85, radius: 1.0, speed: 0.3, phase: 2.2 },
  { kind: "cow", x: -10, z: 15, h: 1.3, radius: 1.6, speed: 0.34, phase: 3.0 },
  { kind: "creeper", x: 17, z: 8, h: 1.6, radius: 1.0, speed: 0.42, phase: 1.1 },
  { kind: "slime", x: 9, z: 14, h: 0.95, radius: 1.4, speed: 0.7, phase: 2.8 },
  { kind: "pig", x: -18, z: -4, h: 1.0, radius: 1.4, speed: 0.45, phase: 4.4 },
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

function AnimatedCreature({
  c,
  material,
  aspect,
}: {
  c: CreatureSpec;
  material: THREE.Material;
  aspect: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const x = c.x + Math.sin(t * c.speed + c.phase) * c.radius;
    const z = c.z + Math.cos(t * c.speed * 0.7 + c.phase * 1.3) * c.radius;
    const step = Math.abs(Math.sin(t * 5 + c.phase)) * 0.06;
    group.current.position.set(x, c.h / 2 - 0.02 + step, z);
  });

  return (
    <group ref={group} position={[c.x, c.h / 2 - 0.02, c.z]}>
      <Billboard>
        <mesh material={material}>
          <planeGeometry args={[c.h * aspect, c.h]} />
        </mesh>
      </Billboard>
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

  const creatureMats = useMemo(() => {
    const out = {} as Record<CreatureKind, { mat: THREE.Material; aspect: number }>;
    for (const k of CREATURE_KINDS) {
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
        const m = creatureMats[c.kind];
        return <AnimatedCreature key={`mob-${i}`} c={c} material={m.mat} aspect={m.aspect} />;
      })}
    </group>
  );
}
