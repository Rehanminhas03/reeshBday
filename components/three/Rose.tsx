"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import { scrollState, smoothstep, lerp } from "@/lib/scroll";

const MODEL_PATH = "/models/rose.glb";

/* ---------------------------------------------------------------------------
   Petal geometry — a single, gently curved & curled petal built from a 2D
   shape, then displaced in 3D so it cups like a real rose petal. One geometry
   is shared by every petal (cheap), each petal just gets its own transform.
--------------------------------------------------------------------------- */
function makePetalGeometry() {
  const shape = new THREE.Shape();
  // A soft, rounded petal silhouette (wider at top, tapered base).
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.55, 0.05, 0.62, 0.7, 0.34, 1.15);
  shape.bezierCurveTo(0.16, 1.42, -0.16, 1.42, -0.34, 1.15);
  shape.bezierCurveTo(-0.62, 0.7, -0.55, 0.05, 0, 0);

  const geo = new THREE.ShapeGeometry(shape, 24);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();

  // Curl the petal: cup it inward (x) and bow it backward (y) so the edges
  // furl like a blossom rather than lying flat.
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const cup = Math.pow(Math.abs(v.x), 2) * 0.9; // sides fold toward centre
    const bow = Math.pow(v.y / 1.4, 2) * 0.5; // tip leans back
    v.z = cup + bow;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  geo.translate(0, -0.05, 0);
  return geo;
}

interface PetalSpec {
  angle: number; // azimuth around the stem
  radius: number; // distance from centre
  scale: number;
  tilt: number; // how far it leans outward when open (radians)
  start: number; // when (0..1 of global bloom) this petal begins to open
  yLift: number;
}

/** Lay petals out in expanding rings using the golden angle for a natural spiral. */
function buildPetalSpecs(): PetalSpec[] {
  const specs: PetalSpec[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const rings = [
    { count: 1, radius: 0.0, scale: 0.5, tilt: 0.15, start: 0.0, lift: 0.42 },
    { count: 3, radius: 0.16, scale: 0.62, tilt: 0.5, start: 0.08, lift: 0.34 },
    { count: 5, radius: 0.34, scale: 0.8, tilt: 0.85, start: 0.22, lift: 0.22 },
    { count: 7, radius: 0.55, scale: 0.98, tilt: 1.15, start: 0.4, lift: 0.1 },
    { count: 9, radius: 0.8, scale: 1.18, tilt: 1.45, start: 0.58, lift: -0.02 },
    { count: 11, radius: 1.05, scale: 1.4, tilt: 1.72, start: 0.74, lift: -0.12 },
  ];
  let idx = 0;
  for (const ring of rings) {
    for (let i = 0; i < ring.count; i++) {
      const angle =
        ring.count === 1 ? 0 : (i / ring.count) * Math.PI * 2 + idx * golden;
      specs.push({
        angle,
        radius: ring.radius,
        scale: ring.scale * (0.94 + ((idx * 13) % 7) / 60),
        tilt: ring.tilt,
        start: ring.start,
        yLift: ring.lift,
      });
      idx++;
    }
  }
  return specs;
}

/* ---------------------------------------------------------------------------
   Procedural rose — the always-available, genuinely pretty fallback.
--------------------------------------------------------------------------- */
function ProceduralRose({ openRef }: { openRef: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const petalRefs = useRef<THREE.Group[]>([]);

  const specs = useMemo(buildPetalSpecs, []);
  const geometry = useMemo(makePetalGeometry, []);

  // Shared, romantic, slightly-translucent petal material.
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#9e0f1e"),
        roughness: 0.42,
        metalness: 0,
        transmission: 0.55, // light passes through the thin petal edges
        thickness: 0.9,
        ior: 1.35,
        sheen: 1,
        sheenColor: new THREE.Color("#ff7a8a"),
        sheenRoughness: 0.5,
        clearcoat: 0.25,
        clearcoatRoughness: 0.6,
        attenuationColor: new THREE.Color("#5a0f1e"),
        attenuationDistance: 0.6,
        side: THREE.DoubleSide,
        emissive: new THREE.Color("#2a0207"),
        emissiveIntensity: 0.35,
      }),
    [],
  );

  const calyxMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#2f3d14",
        roughness: 0.8,
        metalness: 0,
      }),
    [],
  );

  useDisposeResources(geometry, material, calyxMat);

  useFrame((_, delta) => {
    const open = openRef.current ?? 0;

    // Each petal opens on its own little schedule for a staggered bloom.
    for (let i = 0; i < specs.length; i++) {
      const s = specs[i];
      const p = petalRefs.current[i];
      if (!p) continue;
      const local = smoothstep(s.start, Math.min(1, s.start + 0.42), open);

      // Closed → petals stand almost upright & hug the core.
      // Open → they lean outward and drift out along their radius.
      const tilt = lerp(0.12, s.tilt, local);
      const radius = lerp(s.radius * 0.25, s.radius, local);
      const sc = lerp(s.scale * 0.55, s.scale, local);

      p.position.set(
        Math.cos(s.angle) * radius,
        lerp(s.yLift * 0.4, s.yLift, local),
        Math.sin(s.angle) * radius,
      );
      p.rotation.set(0, 0, 0);
      p.rotateY(s.angle); // face outward around the stem
      p.rotateX(-tilt); // lean back as it opens
      p.scale.setScalar(sc);
    }

    // Slow living rotation + a gentle scroll-driven turn and breathing.
    if (group.current) {
      const t = group.current.userData.t ?? 0;
      group.current.userData.t = t + delta;
      const p = scrollState.progress;
      const breathe = Math.sin(t * 0.6) * 0.015;
      group.current.rotation.y = t * 0.12 + p * Math.PI * 1.4;

      // Recede into a soft background bokeh while the photo gallery takes the
      // stage, then return to full presence for the finale.
      const gp = scrollState.galleryProgress;
      const recede = smoothstep(0.0, 0.12, gp) * (1 - smoothstep(0.88, 1, gp));
      group.current.position.z = lerp(0, -9, recede);
      group.current.scale.setScalar((1 + breathe) * lerp(1, 0.55, recede));
    }
  });

  return (
    <group ref={group} rotation={[0.18, 0, 0]}>
      {specs.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            if (el) petalRefs.current[i] = el;
          }}
        >
          <mesh geometry={geometry} material={material} castShadow />
        </group>
      ))}

      {/* Calyx / sepals peeking from beneath the bloom */}
      <group position={[0, -0.35, 0]}>
        {Array.from({ length: 5 }).map((_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh
              key={i}
              geometry={geometry}
              material={calyxMat}
              position={[Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18]}
              rotation={[Math.PI * 0.62, a, 0]}
              scale={0.55}
            />
          );
        })}
      </group>
    </group>
  );
}

/** Dispose shared GPU resources when the rose unmounts. */
function useDisposeResources(...resources: { dispose: () => void }[]) {
  useLayoutEffect(() => {
    return () => resources.forEach((r) => r.dispose());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/* ---------------------------------------------------------------------------
   GLTF rose — used automatically if you drop a model at public/models/rose.glb.
--------------------------------------------------------------------------- */
function GltfRose({ openRef }: { openRef: React.RefObject<number> }) {
  const { scene } = useGLTF(MODEL_PATH);
  const group = useRef<THREE.Group>(null);

  const cloned = useMemo(() => {
    const s = scene.clone(true);

    // Lift the imported materials into our candlelit world: kill any flat
    // ambient, add a faint warm emissive so nothing reads as pure black, and
    // tint the rose bloom material a touch warmer/redder.
    s.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat) return;
        mat.roughness = Math.min(0.85, (mat.roughness ?? 0.6) + 0.1);
        mat.metalness = 0;
        mat.emissive = new THREE.Color("#1a0306");
        mat.emissiveIntensity = 0.35;
        mat.envMapIntensity = 1.1;
        mat.needsUpdate = true;
      });
    });

    // Auto-fit ANY model: centre it on its bloom and scale to a romantic size,
    // so the long stem trails down into the candlelit dark.
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 3.4 / Math.max(size.x, size.y * 0.45, 0.001);
    s.scale.setScalar(scale);
    // Bring the TOP (the bloom) to roughly the origin; stem hangs below.
    const bloomCentreY = box.max.y - size.y * 0.11;
    s.position.set(
      -center.x * scale,
      -bloomCentreY * scale + 0.4,
      -center.z * scale,
    );
    return s;
  }, [scene]);

  useFrame((_, delta) => {
    if (!group.current) return;
    const open = openRef.current ?? 0;
    const t = (group.current.userData.t ?? 0) + delta;
    group.current.userData.t = t;
    const p = scrollState.progress;
    group.current.rotation.y = t * 0.12 + p * Math.PI * 1.4;
    // Bloom = scale up from a bud on load.
    const sc = lerp(0.4, 1, smoothstep(0, 1, open));
    const gp = scrollState.galleryProgress;
    const recede = smoothstep(0.0, 0.12, gp) * (1 - smoothstep(0.88, 1, gp));
    group.current.position.z = lerp(0, -9, recede);
    group.current.scale.setScalar(
      sc * (1 + Math.sin(t * 0.6) * 0.015) * lerp(1, 0.55, recede),
    );
  });

  return (
    <group ref={group}>
      <primitive object={cloned} />
    </group>
  );
}

/* ---------------------------------------------------------------------------
   Public Rose component. Tries the GLTF; the parent <Suspense>/error boundary
   falls back to the procedural rose if the model is missing.
--------------------------------------------------------------------------- */
export default function Rose({
  useModel = false,
  reduced = false,
}: {
  useModel?: boolean;
  reduced?: boolean;
}) {
  const openRef = useRef(0);

  // Bloom-open timeline on mount. Reduced motion → start fully open.
  useLayoutEffect(() => {
    if (reduced) {
      openRef.current = 1;
      return;
    }
    openRef.current = 0;
    const tween = gsap.to(openRef, {
      current: 1,
      duration: 4,
      delay: 0.4,
      ease: "power2.out",
    });

    // Final-wish re-bloom: as the page nears the end, ensure full openness
    // and give a soft "swell" by nudging openness past settle.
    const watcher = gsap.ticker.add(() => {
      if (scrollState.progress > 0.9) {
        openRef.current = Math.max(openRef.current, 1);
      }
    });

    return () => {
      tween.kill();
      gsap.ticker.remove(watcher);
    };
  }, [reduced]);

  if (useModel) {
    return <GltfRose openRef={openRef} />;
  }
  return <ProceduralRose openRef={openRef} />;
}

// Preload only if the file is actually present (guarded by parent).
export const preloadRoseModel = () => useGLTF.preload(MODEL_PATH);
