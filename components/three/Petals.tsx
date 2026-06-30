"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "@/lib/scroll";
import type { Quality } from "@/lib/useEnvironment";

/** A small, softly-curved petal used as the instanced particle. */
function makeFallingPetal() {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.5, 0.1, 0.5, 0.8, 0, 1);
  shape.bezierCurveTo(-0.5, 0.8, -0.5, 0.1, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 10);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.z = Math.pow(Math.abs(v.x), 2) * 0.6; // cup it a little
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  geo.center();
  return geo;
}

interface PetalState {
  pos: THREE.Vector3;
  rot: THREE.Euler;
  rotSpeed: THREE.Vector3;
  fall: number;
  swayPhase: number;
  swayAmp: number;
  scale: number;
}

const COUNTS: Record<Quality, number> = { high: 90, medium: 48, low: 22 };
const SPREAD_X = 16;
const SPREAD_Y = 20;
const SPREAD_Z = 8;

/**
 * Instanced falling rose petals. One draw call. Petals drift down, sway on a
 * sine breeze, and spin slowly. Fall speed & sway scale subtly with scroll
 * velocity so the storm intensifies as she scrolls.
 */
export default function Petals({
  quality,
  frozen = false,
}: {
  quality: Quality;
  frozen?: boolean;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const count = COUNTS[quality];

  const geometry = useMemo(makeFallingPetal, []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#a01624",
        roughness: 0.5,
        metalness: 0,
        emissive: "#400810",
        emissiveIntensity: 0.4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      }),
    [],
  );

  const states = useMemo<PetalState[]>(() => {
    const arr: PetalState[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * SPREAD_X,
          (Math.random() - 0.5) * SPREAD_Y,
          (Math.random() - 0.5) * SPREAD_Z,
        ),
        rot: new THREE.Euler(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI,
        ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
          (Math.random() - 0.5) * 0.6,
        ),
        fall: 0.5 + Math.random() * 0.9,
        swayPhase: Math.random() * Math.PI * 2,
        swayAmp: 0.4 + Math.random() * 0.9,
        scale: 0.12 + Math.random() * 0.22,
      });
    }
    return arr;
  }, [count]);

  useLayoutEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((stateCtx, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const d = Math.min(delta, 0.05);
    const t = stateCtx.clock.elapsedTime;
    // Surge factor from scroll velocity (gentle, capped).
    const surge = frozen ? 0 : 1 + Math.min(Math.abs(scrollState.velocity) * 0.04, 2.2);

    for (let i = 0; i < count; i++) {
      const s = states[i];
      if (!frozen) {
        s.pos.y -= s.fall * surge * d;
        s.pos.x +=
          Math.sin(t * 0.5 + s.swayPhase) * s.swayAmp * d * 0.6;
        s.rot.x += s.rotSpeed.x * d;
        s.rot.y += s.rotSpeed.y * d;
        s.rot.z += s.rotSpeed.z * d;
        // Recycle past the bottom back to the top.
        if (s.pos.y < -SPREAD_Y / 2) {
          s.pos.y = SPREAD_Y / 2;
          s.pos.x = (Math.random() - 0.5) * SPREAD_X;
        }
      }
      dummy.position.copy(s.pos);
      dummy.rotation.copy(s.rot);
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      frustumCulled={false}
    />
  );
}
