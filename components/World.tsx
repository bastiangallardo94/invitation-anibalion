"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { Block } from "./Block";
import { Chest } from "./Chest";
import { Diorama } from "./Diorama";
import { Balloons, BirthdayCorner, Path, Plants } from "./Decor";
import { Tree } from "./Tree";
import { BIRCH_POSITIONS, TREE_POSITIONS, WORLD_SIZE } from "@/lib/constants";
import { getTextures } from "@/lib/textures";

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
    [0, 10, 0],
  ];

  return (
    <group>
      <Diorama />

      <mesh position={[0, -0.5, 0]} material={groundMats} receiveShadow>
        <boxGeometry args={[WORLD_SIZE, 1, WORLD_SIZE]} />
      </mesh>

      <Path />

      <Block type="stone" position={[-5, 0.5, 4]} />
      <Block type="stone" position={[-5.5, 0.5, 4]} />
      <Block type="dirt" position={[4, 0.5, 3]} />
      <Block type="sand" position={[-2, 0.5, -4]} />
      <Block type="sand" position={[-2, 0.5, -5]} />

      {TREE_POSITIONS.map((t, i) => (
        <Tree key={`oak-${i}`} x={t.x} z={t.z} />
      ))}
      {BIRCH_POSITIONS.map((t, i) => (
        <Tree key={`birch-${i}`} x={t.x} z={t.z} variant="birch" />
      ))}

      <Plants />
      <BirthdayCorner />
      <Balloons />

      {clouds.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <boxGeometry args={[3, 0.4, 1.6]} />
            <meshStandardMaterial color="#ffffff" flatShading />
          </mesh>
          <mesh position={[-1.4, 0.1, 0.6]}>
            <boxGeometry args={[1.6, 0.35, 1.2]} />
            <meshStandardMaterial color="#ffffff" flatShading />
          </mesh>
        </group>
      ))}

      <Chest />
    </group>
  );
}
