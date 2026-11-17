import { useGame } from "./store";
import { playerState } from "./playerState";

export function interact() {
  const g = useGame.getState();
  if (g.invitationShown || g.phase === "exploding") return;

  if (g.chestOpen) {
    g.setChestOpen(false);
    return;
  }

  if (g.nearChest && g.chestItems.length > 0) {
    g.setChestOpen(true);
    g.triggerSwing();
    if (typeof document !== "undefined") document.exitPointerLock?.();
    return;
  }

  if (g.phase === "none" && g.inventory.tnt > 0) {
    const p = playerState.pos;
    const fx = -Math.sin(playerState.yaw);
    const fz = -Math.cos(playerState.yaw);
    const clamp = (v: number) => Math.min(8, Math.max(-8, v));
    const bx = clamp(Math.round(p.x + fx * 1.8));
    const bz = clamp(Math.round(p.z + fz * 1.8));
    g.placeTnt([bx, 0, bz]);
    g.triggerSwing();
    return;
  }

  if (g.phase === "placed" && g.nearTnt && g.inventory.lighter > 0) {
    g.igniteTnt();
    g.triggerSwing();
  }
}

export interface ActionCtx {
  chestOpen: boolean;
  nearChest: boolean;
  chestLen: number;
  phase: string;
  nearTnt: boolean;
  tnt: number;
  lighter: number;
}

export function getActionLabel(c: ActionCtx): string {
  if (c.chestOpen) return "Cerrar";
  if (c.nearChest && c.chestLen > 0) return "Abrir cofre";
  if (c.phase === "none" && c.tnt > 0) return "Colocar dinamita";
  if (c.phase === "placed" && c.nearTnt && c.lighter > 0) return "Encender";
  return "";
}
