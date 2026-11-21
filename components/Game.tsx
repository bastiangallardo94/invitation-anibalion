"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Player } from "./Player";
import { Sky } from "./Sky";
import { Tnt } from "./Tnt";
import { World } from "./World";
import { HUD } from "./ui/HUD";
import { Hotbar } from "./ui/Hotbar";
import { MusicToggle } from "./ui/MusicToggle";
import { ChestModal } from "./ui/ChestModal";
import { InvitationModal } from "./ui/InvitationModal";
import { TouchControls } from "./ui/TouchControls";
import { downloadImage } from "@/lib/download";
import { useGame } from "@/lib/store";
import { useIsTouch } from "@/lib/useIsTouch";
import { loadAllTextures } from "@/lib/textures";

function TextureGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    loadAllTextures()
      .catch((err) => console.error("No se pudieron cargar las texturas", err))
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  if (!ready) return null;
  return <>{children}</>;
}

export default function Game() {
  const chestOpen = useGame((s) => s.chestOpen);
  const invitationShown = useGame((s) => s.invitationShown);
  const isTouch = useIsTouch();
  const downloaded = useRef(false);

  useEffect(() => {
    if (invitationShown && !downloaded.current) {
      downloaded.current = true;
      downloadImage("/invitacion-anibal-v2.jpeg", "invitacion-anibal.jpeg");
    }
  }, [invitationShown]);

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-sky-300 select-none">
      <Canvas
        shadows
        camera={{ fov: 60, position: [0, 4, 14], near: 0.1, far: 120 }}
        className="touch-none"
      >
        <color attach="background" args={["#87ceeb"]} />
        <fog attach="fog" args={["#cfe9ff", 14, 60]} />
        <Sky />
        <ambientLight intensity={0.7} />
        <hemisphereLight args={["#dff1ff", "#7a9a5a", 0.5]} />
        <directionalLight
          position={[12, 22, 8]}
          intensity={1.6}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
          shadow-camera-far={70}
        />
        <Suspense fallback={null}>
          <TextureGate>
            <World />
            <Player />
            <Tnt />
          </TextureGate>
        </Suspense>
      </Canvas>

      <HUD />
      <MusicToggle />
      <Hotbar />
      {isTouch && <TouchControls />}
      {chestOpen && <ChestModal />}
      {invitationShown && <InvitationModal />}
    </div>
  );
}
