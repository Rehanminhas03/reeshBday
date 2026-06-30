"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";
import type { Quality } from "@/lib/useEnvironment";

/** A small, slightly-rounded 3D heart built from an extruded shape. */
function makeHeartGeometry() {
  const s = new THREE.Shape();
  const x = 0,
    y = 0;
  s.moveTo(x, y + 0.5);
  s.bezierCurveTo(x, y + 0.5, x - 0.5, y + 0.9, x - 0.9, y + 0.5);
  s.bezierCurveTo(x - 1.4, y + 0.05, x - 0.55, y - 0.55, x, y - 0.95);
  s.bezierCurveTo(x + 0.55, y - 0.55, x + 1.4, y + 0.05, x + 0.9, y + 0.5);
  s.bezierCurveTo(x + 0.5, y + 0.9, x, y + 0.5, x, y + 0.5);

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.12,
    bevelSegments: 3,
    steps: 1,
  });
  geo.center();
  geo.scale(0.42, 0.42, 0.42);
  return geo;
}

interface HeartState {
  pos: THREE.Vector3;
  rise: number;
  spin: number;
  drift: number;
  phase: number;
  scale: number;
  flicker: number;
}

const COUNTS: Record<Quality, number> = { high: 26, medium: 16, low: 8 };
const SPREAD_X = 14;
const SPREAD_Y = 22;
const SPREAD_Z = 7;

/**
 * Glowing hearts that float upward like warm embers. Emissive so Bloom catches
 * them. Each gently flickers (candle-like) and sways as it rises.
 */
export default function Hearts({
  quality,
  frozen = false,
}: {
  quality: Quality;
  frozen?: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const count = COUNTS[quality];

  const geometry = useMemo(makeHeartGeometry, []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ff4d5e",
        emissive: "#ff5a48",
        emissiveIntensity: 2.4, // pushed high so Bloom blooms them
        roughness: 0.35,
        metalness: 0,
        toneMapped: false,
      }),
    [],
  );

  const states = useMemo<HeartState[]>(() => {
    const arr: HeartState[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * SPREAD_X,
          (Math.random() - 0.5) * SPREAD_Y,
          (Math.random() - 0.5) * SPREAD_Z - 1,
        ),
        rise: 0.35 + Math.random() * 0.6,
        spin: (Math.random() - 0.5) * 0.5,
        drift: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        scale: 0.3 + Math.random() * 0.5,
        flicker: 0.6 + Math.random() * 0.8,
      });
    }
    return arr;
  }, [count]);

  // Per-instance colour buffer so each heart can flicker independently.
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (mesh && !mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(count * 3).fill(1),
        3,
      );
    }
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material, count]);

  useFrame((stateCtx, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const d = Math.min(delta, 0.05);
    const t = stateCtx.clock.elapsedTime;
    const surge =
      frozen ? 1 : 1 + Math.min(Math.abs(scrollState.velocity) * 0.03, 1.6);

    for (let i = 0; i < count; i++) {
      const s = states[i];
      if (!frozen) {
        s.pos.y += s.rise * surge * d;
        s.pos.x += Math.sin(t * 0.4 + s.phase) * s.drift * d;
        if (s.pos.y > SPREAD_Y / 2) {
          s.pos.y = -SPREAD_Y / 2;
          s.pos.x = (Math.random() - 0.5) * SPREAD_X;
        }
      }
      dummy.position.copy(s.pos);
      dummy.rotation.set(
        Math.sin(t * 0.3 + s.phase) * 0.3,
        t * s.spin + s.phase,
        Math.sin(t * 0.5 + s.phase) * 0.2,
      );
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Candle flicker on brightness.
      const flick = 0.7 + Math.sin(t * s.flicker * 3 + s.phase) * 0.3;
      color.setRGB(flick, flick, flick);
      mesh.setColorAt(i, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
