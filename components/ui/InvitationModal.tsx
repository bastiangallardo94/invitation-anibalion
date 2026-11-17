"use client";

import { useGame } from "@/lib/store";

export function InvitationModal() {
  const hide = useGame((s) => s.hideInvitation);
  const reset = useGame((s) => s.reset);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 font-mono"
      onPointerDown={hide}
    >
      <div
        className="flex max-h-[94vh] w-[min(94vw,520px)] flex-col items-center rounded-lg border-4 border-[#d4a0c0] bg-[#2a1a2e] p-5 shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2 className="mb-1 text-center text-xl font-bold text-white">
          ¡Boom! Tu invitación está lista
        </h2>
        <p className="mb-3 text-center text-xs text-white/60">
          La descarga comenzó automáticamente. Si no, usa el botón.
        </p>

        <div className="w-full max-w-sm overflow-auto rounded border-4 border-white/20 shadow-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/invitacion-anibal.jpeg"
            alt="Invitación de cumpleaños de Aníbal"
            className="mx-auto max-h-[60vh] w-auto"
          />
        </div>

        <div className="mt-4 flex w-full gap-2">
          <a
            href="/invitacion-anibal.jpeg"
            download="invitacion-anibal.jpeg"
            className="flex-1 rounded border-2 border-white bg-[#7ab648] px-4 py-2.5 text-center font-bold text-white shadow transition hover:bg-[#8cc95a]"
          >
            Descargar
          </a>
          <button
            onClick={reset}
            className="flex-1 rounded border-2 border-white bg-[#a83f3f] px-4 py-2.5 font-bold text-white shadow transition hover:bg-[#c04b4b]"
          >
            Repetir
          </button>
        </div>
      </div>
    </div>
  );
}
