"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type BoxMobKind = "cow" | "pig" | "sheep" | "chicken" | "creeper" | "slime";

export interface WanderSpec {
  x: number;
  z: number;
  radius: number;
  speed: number;
  phase: number;
}

interface StaticBox {
  size: [number, number, number];
  pos: [number, number, number];
  color: string;
}

interface LegDef {
  size: [number, number, number];
  pivot: [number, number, number];
  color: string;
}

interface AnimalModel {
  boxes: StaticBox[];
  legs?: LegDef[];
  bob?: boolean;
}

const MODELS: Record<BoxMobKind, AnimalModel> = {
  cow: {
    boxes: [
      { size: [0.7, 0.6, 1.0], pos: [0, 0.75, 0.05], color: "#e8e8e8" },
      { size: [0.55, 0.5, 0.5], pos: [0, 0.9, -0.6], color: "#e8e8e8" },
      { size: [0.35, 0.25, 0.2], pos: [0, 0.78, -0.86], color: "#f0a0a0" },
      { size: [0.1, 0.1, 0.1], pos: [0.22, 1.13, -0.55], color: "#d8d8d8" },
      { size: [0.1, 0.1, 0.1], pos: [-0.22, 1.13, -0.55], color: "#d8d8d8" },
      { size: [0.07, 0.07, 0.04], pos: [0.16, 0.98, -0.86], color: "#1a1a1a" },
      { size: [0.07, 0.07, 0.04], pos: [-0.16, 0.98, -0.86], color: "#1a1a1a" },
      { size: [0.02, 0.22, 0.3], pos: [0.36, 0.8, 0.15], color: "#2b2b2b" },
      { size: [0.02, 0.18, 0.22], pos: [-0.36, 0.72, -0.1], color: "#2b2b2b" },
      { size: [0.3, 0.02, 0.25], pos: [0.05, 1.06, 0.2], color: "#2b2b2b" },
    ],
    legs: [
      { size: [0.16, 0.5, 0.16], pivot: [0.22, 0.5, -0.25], color: "#d8d8d8" },
      { size: [0.16, 0.5, 0.16], pivot: [-0.22, 0.5, -0.25], color: "#d8d8d8" },
      { size: [0.16, 0.5, 0.16], pivot: [0.22, 0.5, 0.4], color: "#d8d8d8" },
      { size: [0.16, 0.5, 0.16], pivot: [-0.22, 0.5, 0.4], color: "#d8d8d8" },
    ],
  },
  pig: {
    boxes: [
      { size: [0.6, 0.5, 0.85], pos: [0, 0.6, 0.05], color: "#f0a0a0" },
      { size: [0.5, 0.4, 0.4], pos: [0, 0.65, -0.55], color: "#f0a0a0" },
      { size: [0.25, 0.18, 0.15], pos: [0, 0.58, -0.78], color: "#d97f7f" },
      { size: [0.12, 0.12, 0.06], pos: [0.18, 0.85, -0.5], color: "#e88f8f" },
      { size: [0.12, 0.12, 0.06], pos: [-0.18, 0.85, -0.5], color: "#e88f8f" },
      { size: [0.07, 0.07, 0.04], pos: [0.13, 0.7, -0.76], color: "#1a1a1a" },
      { size: [0.07, 0.07, 0.04], pos: [-0.13, 0.7, -0.76], color: "#1a1a1a" },
    ],
    legs: [
      { size: [0.14, 0.35, 0.14], pivot: [0.18, 0.35, -0.2], color: "#d97f7f" },
      { size: [0.14, 0.35, 0.14], pivot: [-0.18, 0.35, -0.2], color: "#d97f7f" },
      { size: [0.14, 0.35, 0.14], pivot: [0.18, 0.35, 0.3], color: "#d97f7f" },
      { size: [0.14, 0.35, 0.14], pivot: [-0.18, 0.35, 0.3], color: "#d97f7f" },
    ],
  },
  sheep: {
    boxes: [
      { size: [0.8, 0.7, 1.0], pos: [0, 0.8, 0.05], color: "#f4f4f4" },
      { size: [0.45, 0.5, 0.45], pos: [0, 0.95, -0.6], color: "#f4f4f4" },
      { size: [0.34, 0.3, 0.1], pos: [0, 0.9, -0.83], color: "#d8d8d8" },
      { size: [0.06, 0.08, 0.03], pos: [0.1, 0.98, -0.89], color: "#1a1a1a" },
      { size: [0.06, 0.08, 0.03], pos: [-0.1, 0.98, -0.89], color: "#1a1a1a" },
      { size: [0.12, 0.12, 0.08], pos: [0.24, 1.0, -0.6], color: "#e8e8e8" },
      { size: [0.12, 0.12, 0.08], pos: [-0.24, 1.0, -0.6], color: "#e8e8e8" },
    ],
    legs: [
      { size: [0.14, 0.45, 0.14], pivot: [0.24, 0.45, -0.25], color: "#e8e8e8" },
      { size: [0.14, 0.45, 0.14], pivot: [-0.24, 0.45, -0.25], color: "#e8e8e8" },
      { size: [0.14, 0.45, 0.14], pivot: [0.24, 0.45, 0.35], color: "#e8e8e8" },
      { size: [0.14, 0.45, 0.14], pivot: [-0.24, 0.45, 0.35], color: "#e8e8e8" },
    ],
  },
  chicken: {
    boxes: [
      { size: [0.4, 0.4, 0.5], pos: [0, 0.45, 0.05], color: "#f4f4f4" },
      { size: [0.3, 0.3, 0.3], pos: [0, 0.72, -0.2], color: "#f4f4f4" },
      { size: [0.12, 0.1, 0.12], pos: [0, 0.7, -0.38], color: "#f2c94c" },
      { size: [0.14, 0.1, 0.1], pos: [0, 0.9, -0.2], color: "#d64545" },
      { size: [0.05, 0.05, 0.03], pos: [0.09, 0.77, -0.33], color: "#1a1a1a" },
      { size: [0.05, 0.05, 0.03], pos: [-0.09, 0.77, -0.33], color: "#1a1a1a" },
      { size: [0.06, 0.24, 0.3], pos: [0.22, 0.48, 0.08], color: "#e0e0e0" },
      { size: [0.06, 0.24, 0.3], pos: [-0.22, 0.48, 0.08], color: "#e0e0e0" },
    ],
    legs: [
      { size: [0.06, 0.28, 0.06], pivot: [0.1, 0.28, 0.05], color: "#f2c94c" },
      { size: [0.06, 0.28, 0.06], pivot: [-0.1, 0.28, 0.05], color: "#f2c94c" },
    ],
  },
  creeper: {
    boxes: [
      { size: [0.5, 0.65, 0.35], pos: [0, 0.55, 0], color: "#5aa64a" },
      { size: [0.5, 0.5, 0.5], pos: [0, 1.0, 0], color: "#5aa64a" },
      { size: [0.02, 0.15, 0.15], pos: [0.26, 0.6, 0.05], color: "#4e8f3f" },
      { size: [0.02, 0.15, 0.15], pos: [-0.26, 0.65, -0.02], color: "#4e8f3f" },
      { size: [0.1, 0.1, 0.03], pos: [0.12, 1.06, -0.26], color: "#151515" },
      { size: [0.1, 0.1, 0.03], pos: [-0.12, 1.06, -0.26], color: "#151515" },
      { size: [0.12, 0.18, 0.03], pos: [0, 0.92, -0.26], color: "#151515" },
      { size: [0.05, 0.08, 0.03], pos: [0.09, 0.86, -0.26], color: "#151515" },
      { size: [0.05, 0.08, 0.03], pos: [-0.09, 0.86, -0.26], color: "#151515" },
    ],
    legs: [
      { size: [0.16, 0.25, 0.16], pivot: [0.15, 0.25, -0.12], color: "#5aa64a" },
      { size: [0.16, 0.25, 0.16], pivot: [-0.15, 0.25, -0.12], color: "#5aa64a" },
      { size: [0.16, 0.25, 0.16], pivot: [0.15, 0.25, 0.12], color: "#5aa64a" },
      { size: [0.16, 0.25, 0.16], pivot: [-0.15, 0.25, 0.12], color: "#5aa64a" },
    ],
  },
  slime: {
    bob: true,
    boxes: [
      { size: [0.6, 0.3, 0.6], pos: [0, 0.15, 0], color: "#6fcf6f" },
      { size: [0.46, 0.26, 0.46], pos: [0, 0.42, 0], color: "#6fcf6f" },
      { size: [0.3, 0.06, 0.3], pos: [0, 0.56, 0], color: "#8fe08f" },
      { size: [0.08, 0.08, 0.03], pos: [0.12, 0.4, -0.24], color: "#1a3a1a" },
      { size: [0.08, 0.08, 0.03], pos: [-0.12, 0.4, -0.24], color: "#1a3a1a" },
      { size: [0.12, 0.05, 0.03], pos: [0, 0.3, -0.24], color: "#1a3a1a" },
    ],
  },
};

export function BoxMob({ kind, wander }: { kind: BoxMobKind; wander: WanderSpec }) {
  const model = MODELS[kind];
  const group = useRef<THREE.Group>(null);
  const legRefs = useRef<(THREE.Group | null)[]>([]);
  const walkPhase = useRef(0);
  const heading = useRef(0);

  const materialFor = useMemo(() => {
    const cache = new Map<string, THREE.MeshStandardMaterial>();
    return (color: string) => {
      let m = cache.get(color);
      if (!m) {
        m = new THREE.MeshStandardMaterial({ color, roughness: 1 });
        cache.set(color, m);
      }
      return m;
    };
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const w = wander;
    const t = state.clock.elapsedTime;

    const x = w.x + Math.sin(t * w.speed + w.phase) * w.radius;
    const z = w.z + Math.cos(t * w.speed * 0.7 + w.phase * 1.3) * w.radius;
    const vx = Math.cos(t * w.speed + w.phase) * w.radius * w.speed;
    const vz = -Math.sin(t * w.speed * 0.7 + w.phase * 1.3) * w.radius * w.speed * 0.7;
    const speed = Math.hypot(vx, vz);

    if (group.current) {
      group.current.position.set(x, 0, z);
      if (speed > 0.02) {
        const target = Math.atan2(-vx, -vz);
        let diff = target - heading.current;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        heading.current += diff * Math.min(1, dt * 6);
        group.current.rotation.y = heading.current;
      }
    }

    if (speed > 0.02) walkPhase.current += dt * 9;
    const p = walkPhase.current;

    legRefs.current.forEach((leg, i) => {
      if (!leg || !model.legs) return;
      const def = model.legs[i];
      const off = def.pivot[0] * def.pivot[2] >= 0 ? 0 : Math.PI;
      leg.rotation.x = Math.sin(p + off) * 0.5;
    });

    if (model.bob && group.current) {
      group.current.position.y = Math.abs(Math.sin(p * 1.3 + w.phase)) * 0.08;
    }
  });

  return (
    <group ref={group} position={[wander.x, 0, wander.z]}>
      {model.boxes.map((b, i) => (
        <mesh key={`b${i}`} position={b.pos} material={materialFor(b.color)} castShadow>
          <boxGeometry args={b.size} />
        </mesh>
      ))}
      {model.legs?.map((leg, i) => (
        <group
          key={`l${i}`}
          ref={(el) => {
            legRefs.current[i] = el;
          }}
          position={leg.pivot}
        >
          <mesh position={[0, -leg.size[1] / 2, 0]} material={materialFor(leg.color)} castShadow>
            <boxGeometry args={leg.size} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
