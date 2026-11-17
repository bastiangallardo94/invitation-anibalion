import type { PlayerObject } from "skin3d";

export type Locomotion = "idle" | "walk" | "run" | "air";

/**
 * Drives the limbs of a skin3d PlayerObject without moving its root, so the
 * character can be positioned by the game loop.
 */
export function animateCharacter(
  player: PlayerObject,
  mode: Locomotion,
  phase: number,
) {
  const s = player.skin;

  s.head.rotation.set(0, 0, 0);
  s.body.rotation.set(0, 0, 0);
  s.leftArm.rotation.set(0, 0, 0);
  s.rightArm.rotation.set(0, 0, 0);
  s.leftLeg.rotation.set(0, 0, 0);
  s.rightLeg.rotation.set(0, 0, 0);

  if (mode === "idle") {
    const t = phase * 0.9;
    s.leftArm.rotation.z = Math.cos(t) * 0.03 + 0.06;
    s.rightArm.rotation.z = -Math.cos(t) * 0.03 - 0.06;
    s.head.rotation.y = Math.sin(t * 0.5) * 0.04;
  } else if (mode === "walk" || mode === "run") {
    const run = mode === "run";
    const amp = run ? 1.15 : 0.55;
    const t = phase * (run ? 1.5 : 1);
    s.leftLeg.rotation.x = Math.sin(t) * amp;
    s.rightLeg.rotation.x = Math.sin(t + Math.PI) * amp;
    s.leftArm.rotation.x = Math.sin(t + Math.PI) * amp;
    s.rightArm.rotation.x = Math.sin(t) * amp;
    s.leftArm.rotation.z = 0.06;
    s.rightArm.rotation.z = -0.06;
    s.head.rotation.x = run ? 0.08 : 0;
    s.head.rotation.y = Math.sin(t / 4) * 0.05;
  } else {
    // airborne pose
    s.leftArm.rotation.x = -0.7;
    s.rightArm.rotation.x = -0.7;
    s.leftArm.rotation.z = 0.2;
    s.rightArm.rotation.z = -0.2;
    s.leftLeg.rotation.x = 0.3;
    s.rightLeg.rotation.x = -0.25;
  }
}

/** Overrides the right arm to play a short hit/swing animation. */
export function animateSwing(player: PlayerObject, progress: number) {
  const angle = Math.sin(Math.min(1, Math.max(0, progress)) * Math.PI) * 2.1;
  player.skin.rightArm.rotation.x = -angle;
  player.skin.rightArm.rotation.z = 0.12;
  player.skin.body.rotation.y = -Math.sin(progress * Math.PI) * 0.08;
}
