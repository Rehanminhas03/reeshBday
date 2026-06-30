"use client";

import { Suspense, Component, type ReactNode, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Preload, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import Rose from "./Rose";
import Petals from "./Petals";
import Hearts from "./Hearts";
import PostFX from "./PostFX";
import { scrollState, lerp, smoothstep } from "@/lib/scroll";
import type { Quality } from "@/lib/useEnvironment";

/* ---------------------------------------------------------------------------
   Tiny error boundary — if a dropped-in rose.glb fails to parse, we silently
   fall back to the procedural rose instead of crashing the whole scene.
--------------------------------------------------------------------------- */
class ModelBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ---------------------------------------------------------------------------
   Warm, flickering candle lights. Intensity is modulated each frame with a
   layered sine "noise" so the room feels alive with candle flame.
--------------------------------------------------------------------------- */
function CandleLights({ reduced }: { reduced: boolean }) {
  const key = useRef<THREE.PointLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.SpotLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (reduced) return;
    // Pseudo-noise flame flicker (cheap, no allocations).
    const flickerA =
      0.78 +
      Math.sin(t * 11) * 0.08 +
      Math.sin(t * 27 + 1.3) * 0.05 +
      Math.sin(t * 3.3) * 0.06;
    const flickerB =
      0.8 + Math.sin(t * 8.5 + 2) * 0.1 + Math.sin(t * 19) * 0.05;
    if (key.current) key.current.intensity = 22 * flickerA;
    if (fill.current) fill.current.intensity = 9 * flickerB;
    if (rim.current) rim.current.intensity = 30 * (0.9 + (flickerA - 0.78));
  });

  return (
    <>
      <ambientLight intensity={0.18} color="#5a2a1a" />
      {/* warm key candle, front-right */}
      <pointLight
        ref={key}
        position={[2.6, 1.8, 3.2]}
        intensity={22}
        distance={18}
        decay={2}
        color="#ffb368"
        castShadow={false}
      />
      {/* soft amber fill, left */}
      <pointLight
        ref={fill}
        position={[-3, -0.5, 2]}
        intensity={9}
        distance={16}
        decay={2}
        color="#d9a04e"
      />
      {/* strong cool-warm rim on the rose from behind */}
      <spotLight
        ref={rim}
        position={[-1.5, 3.5, -4]}
        angle={0.6}
        penumbra={1}
        intensity={30}
        distance={22}
        decay={2}
        color="#ff8a6a"
      />
    </>
  );
}

/* ---------------------------------------------------------------------------
   Camera rig — a single scrubbed cinematic move through the acts of the story.
--------------------------------------------------------------------------- */
function CameraRig({ reduced }: { reduced: boolean }) {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    const p = scrollState.progress;
    const gp = scrollState.galleryProgress;

    // Gentle cinematic dolly. The rose lives front-and-centre at the start and
    // for the finale; while the photo gallery takes over it eases back so the
    // backdrop softens behind the cards.
    let z = lerp(6.2, 7.2, smoothstep(0, 0.35, p)); // hero → settle
    z = lerp(z, 8.4, gp); // pull back during the gallery
    z = lerp(z, 5.7, smoothstep(0.86, 1, p)); // close in for the finale

    const y = lerp(0.25, 0.1, p);

    // Subtle mouse parallax (disabled for reduced motion).
    const px = reduced ? 0 : pointer.x * 0.5;
    const py = reduced ? 0 : pointer.y * 0.35;

    camera.position.x = lerp(camera.position.x, px, 0.05);
    camera.position.y = lerp(camera.position.y, y + py, 0.06);
    camera.position.z = lerp(camera.position.z, z, 0.06);

    target.current.set(0, 0, 0);
    camera.lookAt(target.current);
  });

  return null;
}

/* ---------------------------------------------------------------------------
   The whole 3D world.
--------------------------------------------------------------------------- */
export default function Scene({
  hasModel,
  quality,
  reduced,
}: {
  hasModel: boolean;
  quality: Quality;
  reduced: boolean;
}) {
  const dpr: [number, number] =
    quality === "high" ? [1, 2] : quality === "medium" ? [1, 1.5] : [1, 1.2];

  return (
    <Canvas
      className="!fixed inset-0"
      dpr={dpr}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{ position: [0, 0.25, 6.2], fov: 42, near: 0.1, far: 100 }}
    >
      <color attach="background" args={["#0a0506"]} />
      <fog attach="fog" args={["#0a0506", 9, 24]} />

      <CameraRig reduced={reduced} />
      <CandleLights reduced={reduced} />

      <Suspense fallback={null}>
        {/* The hero rose: try the GLTF model, fall back to procedural. */}
        {hasModel ? (
          <ModelBoundary fallback={<Rose reduced={reduced} />}>
            <Rose useModel reduced={reduced} />
          </ModelBoundary>
        ) : (
          <Rose reduced={reduced} />
        )}

        <Petals quality={quality} frozen={reduced} />
        <Hearts quality={quality} frozen={reduced} />

        {/* Lightformer-built environment (no network) so the petals' glass
            material catches warm reflections. */}
        <Environment resolution={256} frames={1}>
          <color attach="background" args={["#070304"]} />
          <Lightformer
            intensity={2.2}
            color="#ffb368"
            position={[2, 2, 3]}
            scale={[4, 4, 1]}
          />
          <Lightformer
            intensity={1.4}
            color="#c0303a"
            position={[-3, 0, 2]}
            scale={[3, 3, 1]}
          />
          <Lightformer
            intensity={0.8}
            color="#5a0f1e"
            position={[0, -3, -2]}
            scale={[6, 3, 1]}
          />
        </Environment>

        <Preload all />
      </Suspense>

      <PostFX quality={quality} />
      <AdaptiveDpr pixelated />
    </Canvas>
  );
}
