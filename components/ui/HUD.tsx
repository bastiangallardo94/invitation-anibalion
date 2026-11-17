"use client";

import { getActionLabel } from "@/lib/actions";
import { useGame } from "@/lib/store";
import { useIsTouch } from "@/lib/useIsTouch";

function Step({ done, children }: { done: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-1.5">
      <span className={done ? "text-green-400" : "text-white/40"}>
        {done ? "✓" : "•"}
      </span>
      <span className={done ? "text-white/60 line-through" : "text-white/90"}>
        {children}
      </span>
    </li>
  );
}

export function HUD() {
  const isTouch = useIsTouch();
  const locked = useGame((s) => s.locked);
  const chestOpen = useGame((s) => s.chestOpen);
  const invitationShown = useGame((s) => s.invitationShown);
  const chestItems = useGame((s) => s.chestItems);
  const phase = useGame((s) => s.phase);
  const nearChest = useGame((s) => s.nearChest);
  const nearTnt = useGame((s) => s.nearTnt);
  const inventory = useGame((s) => s.inventory);

  const anyModal = chestOpen || invitationShown;
  const looted = chestItems.length === 0;
  const placed = phase !== "none";

  const label = getActionLabel({
    chestOpen,
    nearChest,
    chestLen: chestItems.length,
    phase,
    nearTnt,
    tnt: inventory.tnt,
    lighter: inventory.lighter,
  });

  return (
    <div className="pointer-events-none absolute inset-0 font-mono text-white">
      <div className="absolute left-3 top-3 max-w-xs rounded border-2 border-black/60 bg-black/50 p-3 text-xs leading-5 shadow">
        <h1 className="mb-1 text-sm font-bold text-yellow-200">
          Misión: ¡La invitación explosiva!
        </h1>
        <ol className="space-y-0.5">
          <Step done={looted}>Abre el cofre y saca los objetos</Step>
          <Step done={placed}>Coloca la dinamita</Step>
          <Step done={phase === "lit" || phase === "exploding" || phase === "done"}>
            Enciéndela con el mechero
          </Step>
          <Step done={invitationShown}>Disfruta la explosión</Step>
        </ol>
      </div>

      {!anyModal && !isTouch && !locked && (
        <div className="absolute inset-x-0 top-[38%] flex justify-center">
          <div className="rounded border-2 border-black/60 bg-black/60 px-5 py-3 text-center text-sm shadow-lg">
            <p className="font-bold">Haz clic para jugar</p>
            <p className="mt-1 text-white/80">
              WASD / Flechas para moverte · Espacio para saltar
              <br />
              E para interactuar · Shift para correr
            </p>
          </div>
        </div>
      )}

      {!anyModal && !isTouch && label && (
        <div className="absolute inset-x-0 top-[22%] flex justify-center">
          <div className="rounded border-2 border-yellow-300/70 bg-black/60 px-4 py-2 text-sm font-bold text-yellow-200 shadow-lg">
            Pulsa E para: {label}
          </div>
        </div>
      )}

      {!anyModal && isTouch && !label && !looted && (
        <div className="absolute inset-x-0 top-[16%] flex justify-center px-4">
          <div className="rounded border-2 border-yellow-300/70 bg-black/60 px-4 py-2 text-center text-sm font-bold text-yellow-200 shadow-lg">
            Usa el joystick para acercarte al cofre
          </div>
        </div>
      )}
    </div>
  );
}
