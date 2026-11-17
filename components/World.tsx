"use client";

import { Block } from "./Block";
import { Chest } from "./Chest";
import { Diorama } from "./Diorama";
import { Balloons, BirthdayCorner, Path, Plants } from "./Decor";
import { Tree } from "./Tree";
import { BIRCH_POSITIONS, TREE_POSITIONS } from "@/lib/constants";

export function World() {
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
