"use client";

import { useEffect, useRef, useState } from "react";
import { ambientMusic } from "@/lib/audio";

function SpeakerOn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path
        d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" />
      <path
        d="M17 9l5 6M22 9l-5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MusicToggle() {
  const [muted, setMuted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    let saved = false;
    try {
      saved = localStorage.getItem("music-muted") === "1";
    } catch {
      /* ignore */
    }
    if (saved) {
      setMuted(true);
      ambientMusic.setMuted(true);
    }

    const onFirstInteraction = () => {
      if (startedRef.current) return;
      startedRef.current = true;
      void ambientMusic.start();
    };
    window.addEventListener("pointerdown", onFirstInteraction, { once: true });
    window.addEventListener("keydown", onFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, []);

  const toggle = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      void ambientMusic.start();
    }
    const next = ambientMusic.toggleMute();
    setMuted(next);
    try {
      localStorage.setItem("music-muted", next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? "Activar música" : "Silenciar música"}
      title={muted ? "Activar música" : "Silenciar música"}
      className="pointer-events-auto absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded border-2 border-black/60 bg-black/50 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70"
    >
      {muted ? <SpeakerOff /> : <SpeakerOn />}
    </button>
  );
}
