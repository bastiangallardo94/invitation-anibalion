"use client";

import { useMemo } from "react";
import * as THREE from "three";

export function Sky() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {
          topColor: { value: new THREE.Color("#3f8fd6") },
          bottomColor: { value: new THREE.Color("#d6efff") },
          offset: { value: 12 },
          exponent: { value: 0.7 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 topColor;
          uniform vec3 bottomColor;
          uniform float offset;
          uniform float exponent;
          varying vec3 vWorldPosition;
          void main() {
            float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
            float f = pow(max(h, 0.0), exponent);
            gl_FragColor = vec4(mix(bottomColor, topColor, f), 1.0);
          }
        `,
      }),
    [],
  );

  return (
    <mesh material={material} frustumCulled={false}>
      <sphereGeometry args={[85, 32, 16]} />
    </mesh>
  );
}
