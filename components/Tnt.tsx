"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGame } from "@/lib/store";
import { getBlockMaterials } from "@/lib/textures";

const SHARD_COLORS = ["#ffd54f", "#ff7043", "#ff5252", "#ffffff", "#80d8ff", "#f8bbd0"];

interface ShardSpec {
  dir: THREE.Vector3;
  speed: number;
  color: string;
  size: number;
}

function randomDir(): THREE.Vector3 {
  const v = new THREE.Vector3(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
  );
  if (v.lengthSq() < 0.001) v.set(0, 1, 0);
  return v.normalize();
}

function makeShards(): ShardSpec[] {
  return Array.from({ length: 48 }, () => ({
    dir: randomDir(),
    speed: 3 + Math.random() * 8,
    color: SHARD_COLORS[Math.floor(Math.random() * SHARD_COLORS.length)],
    size: 0.12 + Math.random() * 0.22,
  }));
}

const SHARDS: ShardSpec[] = makeShards();

function Shard({
  origin,
  dir,
  speed,
  color,
  size,
}: {
  origin: [number, number, number];
  dir: THREE.Vector3;
  speed: number;
  color: string;
  size: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const vel = useRef(dir.clone().multiplyScalar(speed));
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 }),
    [color],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    vel.current.y -= 14 * dt;
    if (ref.current) {
      ref.current.position.addScaledVector(vel.current, dt);
      ref.current.rotation.x += dt * 7;
      ref.current.rotation.y += dt * 5;
    }
    material.opacity = Math.max(0, material.opacity - dt * 1.3);
  });

  return (
    <mesh ref={ref} position={origin} material={material}>
      <boxGeometry args={[size, size, size]} />
    </mesh>
  );
}

function Flash({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 1 }),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (ref.current) ref.current.scale.setScalar(ref.current.scale.x + dt * 20);
    material.opacity = Math.max(0, material.opacity - dt * 2.6);
  });

  return (
    <mesh ref={ref} position={position} material={material}>
      <sphereGeometry args={[0.5, 16, 16]} />
    </mesh>
  );
}

function Explosion({ origin }: { origin: [number, number, number] }) {
  return (
    <group>
      <Flash position={origin} />
      {SHARDS.map((s, i) => (
        <Shard key={i} origin={origin} {...s} />
      ))}
    </group>
  );
}

export function Tnt() {
  const phase = useGame((s) => s.phase);
  const tntPos = useGame((s) => s.tntPos);
  const setPhase = useGame((s) => s.setPhase);
  const showInvitation = useGame((s) => s.showInvitation);

  const meshRef = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const flashMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    if (phase === "lit") {
      const t = setTimeout(() => setPhase("exploding"), 2600);
      return () => clearTimeout(t);
    }
    if (phase === "exploding") {
      const t = setTimeout(() => {
        setPhase("done");
        showInvitation();
      }, 1400);
      return () => clearTimeout(t);
    }
  }, [phase, setPhase, showInvitation]);

  useFrame((state) => {
    if (phase === "lit") {
      const t = state.clock.elapsedTime;
      if (meshRef.current) {
        meshRef.current.scale.setScalar(1 + Math.sin(t * 22) * 0.07);
      }
      flashMat.opacity = Math.sin(t * 22) > 0 ? 0.85 : 0.1;
    }
  });

  if (!tntPos || phase === "none" || phase === "done") return null;

  const materials = getBlockMaterials().tnt;

  return (
    <group position={[tntPos[0], 0, tntPos[2]]}>
      {(phase === "placed" || phase === "lit") && (
        <>
          <mesh
            ref={meshRef}
            position={[0, 0.5, 0]}
            material={materials}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.9, 0.9, 0.9]} />
          </mesh>
          {phase === "lit" && (
            <mesh ref={flashRef} position={[0, 0.5, 0]} material={flashMat}>
              <boxGeometry args={[1.02, 1.02, 1.02]} />
            </mesh>
          )}
        </>
      )}
      {phase === "exploding" && <Explosion origin={[0, 0.5, 0]} />}
    </group>
  );
}
