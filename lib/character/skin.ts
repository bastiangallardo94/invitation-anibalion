import * as THREE from "three";

/**
 * Generates a 64x64 Minecraft "classic" skin in the standard UV layout used by
 * skin3d's PlayerObject. Base regions are painted; the outer (hat/jacket) layer
 * regions are left transparent so only the inner layer shows.
 */
export function makeSkinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 64, 64);

  const fill = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  const SKIN = "#e0ac69";
  const SKIN_SHADE = "#c98f52";
  const HAIR = "#3b2b20";
  const SHIRT = "#16a6b0";
  const SHIRT_DARK = "#0f8c95";
  const PANTS = "#3b4a8f";
  const PANTS_DARK = "#2f3a70";
  const SHOE = "#2b2b2b";

  // --- Head (base region x0..32, y0..16) ---
  fill(0, 0, 32, 16, SKIN);
  fill(8, 0, 8, 8, HAIR); // top of head
  fill(24, 8, 8, 8, HAIR); // back of head
  fill(0, 8, 8, 5, HAIR); // right side hair
  fill(16, 8, 8, 5, HAIR); // left side hair
  fill(8, 8, 8, 2, HAIR); // fringe on face
  fill(8, 8, 8, 1, SKIN_SHADE); // forehead shading
  // Face (8,8)-(16,16)
  fill(10, 11, 1, 2, "#2c2a4a"); // right eye
  fill(14, 11, 1, 2, "#2c2a4a"); // left eye
  fill(9, 11, 1, 1, "#ffffff");
  fill(13, 11, 1, 1, "#ffffff");
  fill(11, 14, 3, 1, "#8a5a3a"); // mouth

  // --- Body (base region x16..40, y16..32) ---
  fill(16, 16, 24, 16, SHIRT);
  fill(20, 20, 8, 2, SHIRT_DARK); // collar
  fill(20, 30, 8, 2, SHIRT_DARK); // hem

  // --- Right arm (base region x40..56, y16..32) ---
  fill(40, 16, 16, 16, SHIRT);
  fill(48, 16, 4, 4, SKIN); // palm (bottom face)
  fill(40, 29, 16, 3, SKIN); // hand band

  // --- Left arm (base region x32..48, y48..64) ---
  fill(32, 48, 16, 16, SHIRT);
  fill(40, 48, 4, 4, SKIN);
  fill(32, 61, 16, 3, SKIN);

  // --- Right leg (base region x0..16, y16..32) ---
  fill(0, 16, 16, 16, PANTS);
  fill(8, 16, 4, 4, SHOE);
  fill(0, 29, 16, 3, SHOE);
  fill(0, 26, 16, 1, PANTS_DARK);

  // --- Left leg (base region x16..32, y48..64) ---
  fill(16, 48, 16, 16, PANTS);
  fill(24, 48, 4, 4, SHOE);
  fill(16, 61, 16, 3, SHOE);
  fill(16, 58, 16, 1, PANTS_DARK);

  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
