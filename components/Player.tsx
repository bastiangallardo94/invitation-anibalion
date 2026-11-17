"use client";
"use no memo";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { interact } from "@/lib/actions";
import { resolveMovement } from "@/lib/collision";
import { CHEST_POS, PLAYER_SPAWN, WORLD_HALF } from "@/lib/constants";
import { consumeTouchLook, touchInput } from "@/lib/input";
import { playerState } from "@/lib/playerState";
import { useGame } from "@/lib/store";
import { getTextures } from "@/lib/textures";

const keys = {
  forward: false,
  back: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
};

const skin = new THREE.MeshStandardMaterial({ color: "#e0ac69", roughness: 1 });
const shirt = new THREE.MeshStandardMaterial({ color: "#16a6b0", roughness: 1 });
const pants = new THREE.MeshStandardMaterial({ color: "#3b4a8f", roughness: 1 });
const hair = new THREE.MeshStandardMaterial({ color: "#3b2b20", roughness: 1 });

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export function Player() {
  const { camera, gl } = useThree();

  const pos = useRef(new THREE.Vector3(PLAYER_SPAWN.x, PLAYER_SPAWN.y, PLAYER_SPAWN.z));
  const vel = useRef(new THREE.Vector3());
  const yaw = useRef(0);
  const pitch = useRef(0.35);
  const onGround = useRef(true);
  const lastNear = useRef(false);
  const lastNearTnt = useRef(false);

  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const headMats = useMemo(() => {
    const t = getTextures().head;
    return [skin, skin, hair, skin, skin, new THREE.MeshStandardMaterial({ map: t, roughness: 1 })];
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.back = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.right = true;
          break;
        case "Space":
          keys.jump = true;
          e.preventDefault();
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.sprint = true;
          break;
        case "KeyE":
        case "Enter":
          interact();
          break;
        case "Escape": {
          const g = useGame.getState();
          g.setChestOpen(false);
          g.hideInvitation();
          break;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.back = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.right = false;
          break;
        case "Space":
          keys.jump = false;
          break;
        case "ShiftLeft":
        case "ShiftRight":
          keys.sprint = false;
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    const onClick = () => {
      if (document.pointerLockElement !== el) el.requestPointerLock?.();
    };
    const onLockChange = () => {
      useGame.getState().setLocked(!!document.pointerLockElement);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === el) {
        yaw.current -= e.movementX * 0.0025;
        pitch.current = clamp(pitch.current + e.movementY * 0.0025, -0.5, 1.1);
      }
    };
    el.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onLockChange);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      el.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onLockChange);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const g = useGame.getState();
    const frozen = g.chestOpen || g.invitationShown || g.phase === "exploding";

    const look = consumeTouchLook();
    if (look.dx !== 0) yaw.current -= look.dx * 0.004;
    if (look.dy !== 0) pitch.current = clamp(pitch.current + look.dy * 0.004, -0.5, 1.1);

    let f = (keys.forward ? 1 : 0) - (keys.back ? 1 : 0) + touchInput.moveY;
    let s = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) + touchInput.moveX;
    f = clamp(f, -1, 1);
    s = clamp(s, -1, 1);
    const speed = keys.sprint ? 6 : 4;

    let mx = 0;
    let mz = 0;
    if (!frozen && (f !== 0 || s !== 0)) {
      const fx = -Math.sin(yaw.current);
      const fz = -Math.cos(yaw.current);
      const rx = Math.cos(yaw.current);
      const rz = -Math.sin(yaw.current);
      mx = fx * f + rx * s;
      mz = fz * f + rz * s;
      const len = Math.hypot(mx, mz);
      if (len > 0) {
        mx /= len;
        mz /= len;
      }
    }

    vel.current.x = mx * speed;
    vel.current.z = mz * speed;
    vel.current.y -= 20 * dt;

    if ((keys.jump || touchInput.jump) && onGround.current && !frozen) {
      vel.current.y = 7;
      onGround.current = false;
      touchInput.jump = false;
    }

    const r = resolveMovement(
      pos.current.x,
      pos.current.y,
      pos.current.z,
      vel.current.x * dt,
      vel.current.y * dt,
      vel.current.z * dt,
      0.35,
      0.35,
      1.8,
    );
    pos.current.set(r.x, r.y, r.z);
    onGround.current = r.onGround;
    if (r.hitCeil) vel.current.y = 0;
    if (onGround.current) vel.current.y = 0;

    const lim = WORLD_HALF - 0.6;
    pos.current.x = clamp(pos.current.x, -lim, lim);
    pos.current.z = clamp(pos.current.z, -lim, lim);

    playerState.pos.copy(pos.current);
    playerState.yaw = yaw.current;

    if (rootRef.current) rootRef.current.position.copy(pos.current);
    if (bodyRef.current) bodyRef.current.rotation.y = yaw.current;

    const moving = onGround.current && Math.hypot(vel.current.x, vel.current.z) > 0.3;
    const t = state.clock.elapsedTime;
    const swing = moving ? Math.sin(t * 9) : 0;
    if (leftArmRef.current) leftArmRef.current.rotation.x = swing * 0.6;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -swing * 0.6;
    if (leftLegRef.current) leftLegRef.current.rotation.x = -swing * 0.5;
    if (rightLegRef.current) rightLegRef.current.rotation.x = swing * 0.5;

    const dist = Math.hypot(
      pos.current.x - CHEST_POS.x,
      pos.current.z - CHEST_POS.z,
    );
    const near = dist < 2.4;
    if (near !== lastNear.current) {
      lastNear.current = near;
      g.setNearChest(near);
    }

    let nearTnt = false;
    if (g.phase === "placed" && g.tntPos) {
      nearTnt =
        Math.hypot(pos.current.x - g.tntPos[0], pos.current.z - g.tntPos[2]) < 3.5;
    }
    if (nearTnt !== lastNearTnt.current) {
      lastNearTnt.current = nearTnt;
      g.setNearTnt(nearTnt);
    }

    const cp = Math.cos(pitch.current);
    const sp = Math.sin(pitch.current);
    const camDist = 6.5;
    const target = new THREE.Vector3(
      pos.current.x + Math.sin(yaw.current) * camDist * cp,
      pos.current.y + 1.6 + sp * camDist,
      pos.current.z + Math.cos(yaw.current) * camDist * cp,
    );
    camera.position.lerp(target, 0.18);
    camera.lookAt(pos.current.x, pos.current.y + 1.6, pos.current.z);

    if (g.phase === "exploding") {
      camera.position.x += (Math.random() - 0.5) * 0.5;
      camera.position.y += (Math.random() - 0.5) * 0.4;
      camera.position.z += (Math.random() - 0.5) * 0.5;
    }
  });

  return (
    <group ref={rootRef} position={[PLAYER_SPAWN.x, PLAYER_SPAWN.y, PLAYER_SPAWN.z]}>
      <group ref={bodyRef}>
        <mesh position={[0, 0.95, 0]} material={shirt} castShadow>
          <boxGeometry args={[0.5, 0.7, 0.3]} />
        </mesh>

        <group ref={leftArmRef} position={[-0.35, 1.3, 0]}>
          <mesh position={[0, -0.325, 0]} material={shirt} castShadow>
            <boxGeometry args={[0.2, 0.65, 0.25]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.35, 1.3, 0]}>
          <mesh position={[0, -0.325, 0]} material={shirt} castShadow>
            <boxGeometry args={[0.2, 0.65, 0.25]} />
          </mesh>
        </group>

        <group ref={leftLegRef} position={[-0.15, 0.9, 0]}>
          <mesh position={[0, -0.3, 0]} material={pants} castShadow>
            <boxGeometry args={[0.25, 0.6, 0.25]} />
          </mesh>
        </group>
        <group ref={rightLegRef} position={[0.15, 0.9, 0]}>
          <mesh position={[0, -0.3, 0]} material={pants} castShadow>
            <boxGeometry args={[0.25, 0.6, 0.25]} />
          </mesh>
        </group>

        <mesh position={[0, 1.65, 0]} material={headMats} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        </mesh>
      </group>
    </group>
  );
}
