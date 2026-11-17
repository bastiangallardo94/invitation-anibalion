"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PlayerObject } from "skin3d";
import { animateCharacter } from "@/lib/character/animation";

export interface WanderSpec {
  x: number;
  z: number;
  radius: number;
  speed: number;
  phase: number;
}

export function HumanoidMob({
  wander,
  skin,
  height = 1.85,
  armsForward = false,
}: {
  wander: WanderSpec;
  skin: THREE.Texture;
  height?: number;
  armsForward?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const walkPhase = useRef(0);
  const heading = useRef(0);

  const character = useMemo(() => {
    const p = new PlayerObject({ materialType: "standard" });
    p.backEquipment = null;
    p.skin.map = skin;
    p.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    const s = height / 32;
    p.scale.setScalar(s);
    p.position.y = 16 * s;
    p.rotation.y = Math.PI;
    return p;
  }, [skin, height]);

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
    animateCharacter(character, speed > 0.02 ? "walk" : "idle", walkPhase.current);

    if (armsForward) {
      character.skin.leftArm.rotation.x = -1.35;
      character.skin.rightArm.rotation.x = -1.35;
      character.skin.leftArm.rotation.z = 0.05;
      character.skin.rightArm.rotation.z = -0.05;
    }
  });

  return (
    <group ref={group} position={[wander.x, 0, wander.z]}>
      <primitive object={character} />
    </group>
  );
}
