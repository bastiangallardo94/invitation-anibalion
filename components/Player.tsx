"use client";
"use no memo";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PlayerObject } from "skin3d";
import { interact } from "@/lib/actions";
import { animateCharacter, animateSwing, type Locomotion } from "@/lib/character/animation";
import { makeSkinTexture } from "@/lib/character/skin";
import { resolveMovement } from "@/lib/collision";
import { CHEST_POS, PLAYER_SPAWN, WORLD_HALF } from "@/lib/constants";
import { consumeTouchLook, touchInput } from "@/lib/input";
import { playerState } from "@/lib/playerState";
import { useGame } from "@/lib/store";

const keys = {
  forward: false,
  back: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
};

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
  const walkPhase = useRef(0);
  const swingTimer = useRef(0);
  const lastSwing = useRef(0);

  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);

  const character = useMemo(() => {
    const player = new PlayerObject({ materialType: "standard" });
    player.backEquipment = null;
    player.skin.map = makeSkinTexture();
    player.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    // Scale the Minecraft-pixel model (~32u tall) to ~1.85 world units and
    // align its feet with the player's origin (feet on the ground).
    const s = 1.85 / 32;
    player.scale.setScalar(s);
    player.position.y = 16 * s;
    player.rotation.y = Math.PI; // model faces +z; make it face forward (-z)
    return player;
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

    // Character animation
    const moving = onGround.current && Math.hypot(vel.current.x, vel.current.z) > 0.3;
    if (moving) walkPhase.current += dt * (keys.sprint ? 14 : 9);
    let mode: Locomotion = "idle";
    if (!onGround.current) mode = "air";
    else if (moving) mode = keys.sprint ? "run" : "walk";
    animateCharacter(character, mode, walkPhase.current);

    if (g.swing !== lastSwing.current) {
      lastSwing.current = g.swing;
      swingTimer.current = 0.34;
    }
    if (swingTimer.current > 0) {
      swingTimer.current -= dt;
      const p = 1 - Math.max(0, swingTimer.current) / 0.34;
      animateSwing(character, p);
    }

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
    const camDist = 5.8;
    const target = new THREE.Vector3(
      pos.current.x + Math.sin(yaw.current) * camDist * cp,
      pos.current.y + 1.5 + sp * camDist,
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
        <primitive object={character} />
      </group>
    </group>
  );
}
