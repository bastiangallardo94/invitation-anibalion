"use client";

import { useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { getActionLabel, interact } from "@/lib/actions";
import { touchInput } from "@/lib/input";
import { useGame } from "@/lib/store";

function Joystick() {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pid = useRef<number | null>(null);
  const R = 48;

  const setKnob = (dx: number, dy: number) => {
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    }
  };

  const move = (e: ReactPointerEvent) => {
    if (pid.current !== e.pointerId || !baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const len = Math.hypot(dx, dy) || 1;
    if (len > R) {
      dx = (dx / len) * R;
      dy = (dy / len) * R;
    }
    setKnob(dx, dy);
    touchInput.moveX = dx / R;
    touchInput.moveY = -dy / R;
  };

  const reset = () => {
    pid.current = null;
    touchInput.moveX = 0;
    touchInput.moveY = 0;
    setKnob(0, 0);
  };

  return (
    <div
      ref={baseRef}
      className="pointer-events-auto absolute bottom-7 left-6 h-32 w-32 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        pid.current = e.pointerId;
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={move}
      onPointerUp={reset}
      onPointerCancel={reset}
    >
      <div
        ref={knobRef}
        className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full border-2 border-white/50 bg-white/40"
        style={{ transform: "translate(-50%, -50%)" }}
      />
    </div>
  );
}

function LookPad() {
  const pid = useRef<number | null>(null);
  const last = useRef({ x: 0, y: 0 });

  return (
    <div
      className="pointer-events-auto absolute inset-y-0 right-0 w-1/2"
      style={{ touchAction: "none" }}
      onPointerDown={(e) => {
        pid.current = e.pointerId;
        last.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (pid.current !== e.pointerId) return;
        touchInput.lookDX += e.clientX - last.current.x;
        touchInput.lookDY += e.clientY - last.current.y;
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={() => (pid.current = null)}
      onPointerCancel={() => (pid.current = null)}
    />
  );
}

export function TouchControls() {
  const ctx = useGame((s) => ({
    chestOpen: s.chestOpen,
    nearChest: s.nearChest,
    chestLen: s.chestItems.length,
    phase: s.phase,
    nearTnt: s.nearTnt,
    tnt: s.inventory.tnt,
    lighter: s.inventory.lighter,
  }));

  const label = getActionLabel(ctx);

  return (
    <div className="absolute inset-0 z-10 font-mono">
      <LookPad />
      <Joystick />

      <button
        className="pointer-events-auto absolute bottom-8 right-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 text-sm font-bold text-white backdrop-blur-sm"
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          e.preventDefault();
          touchInput.jump = true;
        }}
        onPointerUp={() => (touchInput.jump = false)}
        onPointerCancel={() => (touchInput.jump = false)}
      >
        Saltar
      </button>

      {label && (
        <button
          className="pointer-events-auto absolute bottom-36 right-6 rounded-full border-2 border-yellow-300/70 bg-black/60 px-5 py-3 text-sm font-bold text-yellow-200 backdrop-blur-sm"
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            e.preventDefault();
            interact();
          }}
        >
          {label}
        </button>
      )}
    </div>
  );
}
