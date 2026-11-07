/* eslint-disable react-hooks/immutability -- three.js materials are mutated imperatively inside useFrame by design */
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, OrbitControls, RoundedBox, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import type { BottleSpec } from "@/lib/products";

const BODY = {
  square: { dims: [1.5, 1.9, 0.95] as const, r: 0.09 },
  round: { dims: [1.7, 1.75, 1.05] as const, r: 0.5 },
  tall: { dims: [1.15, 2.4, 0.85] as const, r: 0.08 },
};

function makeLabel(spec: BottleSpec["label"]) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 640;
  const draw = () => {
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, c.width, c.height);
    if (spec.plate) {
      g.fillStyle = spec.plate;
      g.fillRect(40, 40, 944, 560);
      g.strokeStyle = spec.color;
      g.lineWidth = 5;
      g.strokeRect(64, 64, 896, 512);
    }
    g.fillStyle = spec.color;
    g.textAlign = "center";
    g.textBaseline = "middle";
    const serif = `"Cormorant Garamond", Georgia, serif`;
    const big = spec.line1.length > 9 ? 112 : 150;
    g.font = `500 ${big}px ${serif}`;
    // manual letter-spacing for a refined wordmark
    const drawSpaced = (text: string, y: number, spacing: number) => {
      const chars = [...text];
      const widths = chars.map((ch) => g.measureText(ch).width + spacing);
      const total = widths.reduce((a, b) => a + b, 0) - spacing;
      let x = c.width / 2 - total / 2;
      g.textAlign = "left";
      chars.forEach((ch, i) => {
        g.fillText(ch, x, y);
        x += widths[i];
      });
    };
    drawSpaced(spec.line1, spec.line2 ? 250 : 320, 14);
    if (spec.line2) {
      g.font = `400 ${big * 0.62}px ${serif}`;
      drawSpaced(spec.line2, 410, 26);
      g.fillRect(c.width / 2 - 60, 480, 120, 3);
    }
  };
  draw();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (typeof document !== "undefined" && document.fonts?.ready) {
    document.fonts.ready.then(() => {
      draw();
      tex.needsUpdate = true;
    });
  }
  return tex;
}

interface BottleProps {
  spec: BottleSpec;
  mode: "hero" | "orbit";
  spin?: MutableRefObject<number>;
  scale?: number;
}

function Bottle({ spec, mode, spin, scale = 1 }: BottleProps) {
  const root = useRef<THREE.Group>(null);
  const pop = useRef(0);
  const prevKey = useRef("");
  const { dims, r } = BODY[spec.shape];
  const [w, h, d] = dims;

  const glassM = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
        roughness: 0.04,
        metalness: 0.1,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
        envMapIntensity: 2.4,
        color: new THREE.Color(spec.glass).lerp(new THREE.Color("#ffffff"), 0.4),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const liquidM = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(spec.liquid),
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.9,
        emissive: new THREE.Color(spec.liquid),
        emissiveIntensity: 0.22,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const capM = useMemo(() => new THREE.MeshPhysicalMaterial({ color: new THREE.Color(spec.cap.color), envMapIntensity: 1.6 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []);
  const collarM = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color(spec.collar), metalness: 1, roughness: 0.22 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const labelTex = useMemo(() => makeLabel(spec.label), [spec.label]);
  useEffect(() => () => labelTex.dispose(), [labelTex]);

  const tmp = useMemo(() => new THREE.Color(), []);
  const white = useMemo(() => new THREE.Color("#ffffff"), []);

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.0015, dt);
    glassM.color.lerp(tmp.set(spec.glass).lerp(white, 0.4), k);
    liquidM.color.lerp(tmp.set(spec.liquid), k);
    liquidM.emissive.lerp(tmp.set(spec.liquid), k);
    capM.color.lerp(tmp.set(spec.cap.color), k);
    capM.metalness = THREE.MathUtils.lerp(capM.metalness, spec.cap.metal, k);
    capM.roughness = THREE.MathUtils.lerp(capM.roughness, spec.cap.rough, k);
    capM.transparent = !!spec.cap.crystal;
    capM.opacity = THREE.MathUtils.lerp(capM.opacity, spec.cap.crystal ? 0.55 : 1, k);
    collarM.color.lerp(tmp.set(spec.collar), k);

    const g = root.current;
    if (!g) return;
    const key = `${spec.shape}-${spec.cap.shape}-${spec.label.line1}`;
    if (key !== prevKey.current) {
      prevKey.current = key;
      pop.current = 0;
    }
    pop.current = Math.min(1, pop.current + dt * 1.4);
    const e = 1 - Math.pow(1 - pop.current, 4);
    g.scale.setScalar(scale * (0.7 + 0.3 * e));

    if (mode === "hero") {
      const px = state.pointer.x;
      const py = state.pointer.y;
      const targetY = -0.55 + px * 0.55 + (spin?.current ?? 0) * Math.PI * 2 + (1 - e) * 2.4;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 3.2, dt);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -py * 0.16, 3, dt);
      g.rotation.z = THREE.MathUtils.damp(g.rotation.z, px * 0.05, 3, dt);
    } else {
      g.rotation.y += dt * 0.0; // OrbitControls handles motion
    }
  });

  const liquidH = h * 0.72;
  const capH = spec.cap.size[1];
  const neckY = h / 2 + 0.1;
  const capY = h / 2 + 0.2 + capH / 2;

  return (
    <group ref={root}>
      {/* glass shell */}
      <RoundedBox args={[w, h, d]} radius={r} smoothness={5} material={glassM} />
      {/* liquid */}
      <RoundedBox
        args={[w - 0.2, liquidH, d - 0.2]}
        radius={Math.max(0.02, r - 0.06)}
        smoothness={4}
        position={[0, -h / 2 + 0.16 + liquidH / 2, 0]}
        material={liquidM}
      />
      {/* label */}
      <mesh position={[0, spec.label.plate ? 0.1 : 0.0, d / 2 + 0.004]}>
        <planeGeometry args={[Math.min(w * 0.7, 1.2), Math.min(w * 0.7, 1.2) * 0.625]} />
        <meshStandardMaterial map={labelTex} transparent toneMapped={false} roughness={0.5} metalness={0.3} depthWrite={false} />
      </mesh>
      {/* sprayer tube */}
      <mesh position={[0.05, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, h * 0.92, 8]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.5} />
      </mesh>
      {/* neck + collar */}
      <mesh position={[0, neckY, 0]} material={collarM}>
        <cylinderGeometry args={[0.24, 0.27, 0.2, 40]} />
      </mesh>
      {/* cap */}
      <group position={[0, capY, 0]}>
        {spec.cap.shape === "cyl" && (
          <mesh material={capM}>
            <cylinderGeometry args={[spec.cap.size[0] / 2, spec.cap.size[0] / 2, capH, 64]} />
          </mesh>
        )}
        {spec.cap.shape === "oct" && (
          <mesh material={capM} rotation={[0, Math.PI / 8, 0]}>
            <cylinderGeometry args={[spec.cap.size[0] / 2, spec.cap.size[0] * 0.38, capH, 8]} />
          </mesh>
        )}
        {spec.cap.shape === "box" && (
          <RoundedBox args={spec.cap.size} radius={0.05} smoothness={4} material={capM} />
        )}
      </group>
    </group>
  );
}

function Rig({ accent }: { accent: string }) {
  return (
    <Environment resolution={256} frames={1}>
      <color attach="background" args={["#0b0b0c"]} />
      <Lightformer form="rect" intensity={5} position={[0, 4, 4]} scale={[10, 3, 1]} />
      <Lightformer form="rect" intensity={3} position={[-5, 1, 2]} rotation-y={Math.PI / 2} scale={[8, 4, 1]} color="#fff4e0" />
      <Lightformer form="rect" intensity={3.5} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[8, 4, 1]} color={accent} />
      <Lightformer form="ring" intensity={4} position={[0, 1, -5]} scale={6} color="#ffffff" />
      <Lightformer form="rect" intensity={1.5} position={[0, -4, 2]} scale={[10, 2, 1]} color="#ffe9c4" />
    </Environment>
  );
}

export interface Bottle3DProps {
  spec: BottleSpec;
  accent?: string;
  bg?: string;
  mode?: "hero" | "orbit";
  spin?: MutableRefObject<number>;
  scale?: number;
  sparkles?: boolean;
  shadow?: boolean;
  className?: string;
}

export default function Bottle3D({
  spec,
  accent = "#d4a24c",
  bg = "#17120e",
  mode = "orbit",
  spin,
  scale = 1,
  sparkles = true,
  shadow = true,
  className,
}: Bottle3DProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className} role="img" aria-label={`3D model of the ${spec.label.line1} ${spec.label.line2 ?? ""} bottle`}>
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 9.2], fov: 28 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        style={{ touchAction: mode === "orbit" ? "pan-y" : "auto" }}
      >
        <color attach="background" args={[bg]} />
        <Rig accent={accent} />
        <ambientLight intensity={0.25} />
        <Float speed={1.4} rotationIntensity={0.12} floatIntensity={0.6} floatingRange={[-0.08, 0.1]}>
          <Bottle spec={spec} mode={mode} spin={spin} scale={scale} />
        </Float>
        {sparkles && <Sparkles count={36} scale={[7, 5, 3]} size={2.4} speed={0.25} opacity={0.7} color={accent} />}
        {shadow && <ContactShadows position={[0, -1.75, 0]} opacity={0.55} scale={9} blur={2.8} far={3} />}
        {mode === "orbit" && (
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.4} minPolarAngle={Math.PI / 2.6} maxPolarAngle={Math.PI / 1.7} />
        )}
      </Canvas>
    </div>
  );
}
