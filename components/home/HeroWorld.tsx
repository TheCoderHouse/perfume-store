/* eslint-disable react-hooks/immutability -- three.js objects are mutated imperatively inside useFrame by design */
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, Sparkles, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";

export interface HeroSlide {
  slug: string;
  lines: [string, string];
  img: string;
  focus: [number, number]; // 0..1 point of interest inside the photo
  sky: string;
  glow: string;
  ground: string;
}

const mod = (n: number, m: number) => ((n % m) + m) % m;
const wrap = (d: number, n: number) => mod(d + n / 2, n) - n / 2;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ---------- title textures (drawn with the site's serif so they stay on-brand) ---------- */
function drawTitle(lines: [string, string], outline: boolean, fam: string) {
  const c = document.createElement("canvas");
  c.width = 2400;
  c.height = 900;
  const g = c.getContext("2d")!;
  let size = 340;
  const spacing = (s: number) => s * 0.07;
  const width = (txt: string, s: number, italic: boolean) => {
    g.font = `${italic ? "italic 300" : "400"} ${s}px ${fam}`;
    return [...txt].reduce((w, ch) => w + g.measureText(ch).width + spacing(s), -spacing(s));
  };
  while (size > 120 && Math.max(width(lines[0], size, false), width(lines[1], size, true)) > 2200) size -= 10;
  g.textBaseline = "middle";
  g.lineJoin = "round";
  [lines[0], lines[1]].forEach((txt, li) => {
    const italic = li === 1;
    g.font = `${italic ? "italic 300" : "400"} ${size}px ${fam}`;
    let x = c.width / 2 - width(txt, size, italic) / 2;
    const y = 300 + li * (size * 0.98);
    for (const ch of txt) {
      if (outline) {
        g.lineWidth = 5;
        g.strokeStyle = "rgba(244,236,220,0.95)";
        g.strokeText(ch, x, y);
      } else {
        g.fillStyle = "#f6eedd";
        g.fillText(ch, x, y);
      }
      x += g.measureText(ch).width + spacing(size);
    }
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ---------- ridge silhouettes ---------- */
function ridgeGeometry(seed: number, amp: number, base: number) {
  const s = new THREE.Shape();
  s.moveTo(-70, -10);
  for (let x = -70; x <= 70; x += 1.5) {
    const y = base + amp * (Math.sin(x * 0.11 + seed) * 0.5 + Math.sin(x * 0.27 + seed * 2.3) * 0.3 + Math.sin(x * 0.05 + seed * 0.7) * 0.7 + 0.8);
    s.lineTo(x, y);
  }
  s.lineTo(70, -10);
  return new THREE.ShapeGeometry(s);
}

/* ---------- the spinning photograph ---------- */
const PH_VERT = /* glsl */ `
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){
    vUv = uv;
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vV = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }`;
const PH_FRAG = /* glsl */ `
  uniform sampler2D uTex; uniform float uImg; uniform float uFrame; uniform vec2 uFoc; uniform vec3 uAcc;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  vec2 cover(vec2 uv){
    vec2 s = uImg > uFrame ? vec2(uFrame/uImg, 1.0) : vec2(1.0, uImg/uFrame);
    return uv * s + (vec2(1.0) - s) * uFoc;
  }
  void main(){
    vec2 uv = vUv;
    if (!gl_FrontFacing) uv.x = 1.0 - uv.x; // back side reads un-mirrored
    vec4 tx = texture2D(uTex, cover(uv));
    if (tx.a < 0.06) discard;
    vec3 col = tx.rgb;
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 3.0);
    col += uAcc * f * 0.25;
    col *= 1.0 - 0.3 * f;
    gl_FragColor = vec4(col, tx.a);
    #include <colorspace_fragment>
  }`;

const GLOW_FRAG = /* glsl */ `
  uniform vec3 uCol; varying vec2 vUv;
  void main(){ float d = distance(vUv, vec2(0.5)); float a = smoothstep(0.5, 0.0, d); a = pow(a, 2.2) * 0.75;
    gl_FragColor = vec4(uCol * a, a); }`;

function World({ slides, t, onOpen, mobile }: { slides: HeroSlide[]; t: number; onOpen: (i: number) => void; mobile: boolean }) {
  const N = slides.length;
  const textures = useTexture(slides.map((s) => s.img));
  const { camera, pointer, scene, size } = useThree();
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const p = useRef(t);
  const lastIdx = useRef(mod(t, N));
  const turn = useRef({ cur: 0, target: 0, start: 0, pending: false, w: 0, h: 0 });
  const groupRefs = useRef<(THREE.Group | null)[]>([]);
  const solidRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const lineRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const cap = useRef<THREE.Mesh>(null);
  const ground = useRef<THREE.MeshStandardMaterial & { color: THREE.Color }>(null);
  const [titles, setTitles] = useState<{ solid: THREE.CanvasTexture; outline: THREE.CanvasTexture }[] | null>(null);
  const reduce = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  const pal = useMemo(() => ({ top: new THREE.Color(slides[0].sky), glow: new THREE.Color(slides[0].glow), ground: new THREE.Color(slides[0].ground) }), [slides]);
  const target = useMemo(() => slides.map((s) => ({ top: new THREE.Color(s.sky), glow: new THREE.Color(s.glow), ground: new THREE.Color(s.ground) })), [slides]);

  const skyMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { uTop: { value: pal.top }, uGlow: { value: pal.glow }, uGround: { value: pal.ground } },
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uTop; uniform vec3 uGlow; uniform vec3 uGround; varying vec3 vP;
          void main(){ float h = vP.y; vec3 c = mix(uGlow, uTop, smoothstep(0.0, 0.5, h));
            c = mix(uGround*0.6 + uGlow*0.15, c, smoothstep(-0.2, 0.03, h)); gl_FragColor = vec4(c,1.0);
            #include <colorspace_fragment> }`,
      }),
    [pal],
  );

  const capMat = useMemo(() => {
    textures.forEach((x) => {
      x.colorSpace = THREE.SRGBColorSpace;
      x.anisotropy = 8;
    });
    const im = textures[0].image as HTMLImageElement;
    return new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      vertexShader: PH_VERT,
      fragmentShader: PH_FRAG,
      uniforms: {
        uTex: { value: textures[0] },
        uImg: { value: im.width / im.height },
        uFrame: { value: Math.min(1.45, Math.max(0.66, im.width / im.height)) },
        uFoc: { value: new THREE.Vector2(...slides[0].focus) },
        uAcc: { value: pal.glow },
      },
    });
  }, [textures, slides, pal]);

  const glowMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uCol: { value: pal.glow } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: GLOW_FRAG + "",
      }),
    [pal],
  );

  const ridges = useMemo(() => [ridgeGeometry(1.2, 1.6, -2.2), ridgeGeometry(3.7, 1.2, -2.3), ridgeGeometry(6.1, 0.8, -2.35)], []);
  const ridgeMats = useMemo(() => ridges.map(() => new THREE.MeshBasicMaterial({ fog: false })), [ridges]);

  // Titles drawn with the page's serif once it has loaded.
  useEffect(() => {
    let dead = false;
    (async () => {
      const fam = getComputedStyle(document.documentElement).getPropertyValue("--font-cormorant").trim() || "Georgia, serif";
      try {
        await Promise.all([document.fonts.load(`400 120px ${fam}`), document.fonts.load(`italic 300 120px ${fam}`)]);
      } catch {}
      if (dead) return;
      setTitles(slides.map((s) => ({ solid: drawTitle(s.lines, false, fam), outline: drawTitle(s.lines, true, fam) })));
    })();
    return () => {
      dead = true;
    };
  }, [slides]);

  useEffect(() => {
    scene.fog = new THREE.Fog("#000000", 9, 36);
  }, [scene]);

  useFrame((state, dt) => {
    const time = state.clock.elapsedTime;
    const k = 1 - Math.pow(0.004, dt);
    const idx = mod(tRef.current, N);
    const tg = target[idx];
    pal.top.lerp(tg.top, k);
    pal.glow.lerp(tg.glow, k);
    pal.ground.lerp(tg.ground, k);

    // fog + ground + ridges follow the palette
    if (scene.fog) (scene.fog as THREE.Fog).color.copy(pal.glow).lerp(pal.ground, 0.72);
    if (ground.current) ground.current.color.copy(pal.ground).multiplyScalar(1.2);
    ridgeMats.forEach((m, i) => m.color.copy(pal.ground).lerp(pal.glow, [0.34, 0.18, 0.07][i]));

    // photograph: one full 360° turn per step, image swapped while edge-on
    const u = capMat.uniforms;
    const m = reduce ? 0 : 1;
    const tn = turn.current;
    if (tn.w === 0) {
      const im0 = textures[0].image as HTMLImageElement;
      const fa0 = Math.min(1.45, Math.max(0.66, im0.width / im0.height));
      tn.h = Math.min(mobile ? 3.2 : 3.6, 4.6 / fa0);
      tn.w = tn.h * fa0;
      if (cap.current) cap.current.scale.set(tn.w, tn.h, 1);
    }
    const swap = (i: number) => {
      const im = textures[i].image as HTMLImageElement;
      const asp = im.width / im.height;
      const fa = Math.min(1.45, Math.max(0.66, asp));
      u.uTex.value = textures[i];
      u.uImg.value = asp;
      u.uFrame.value = fa;
      u.uFoc.value.set(...slides[i].focus);
      const H = Math.min(mobile ? 3.2 : 3.6, 4.6 / fa);
      tn.w = H * fa;
      tn.h = H;
    };
    if (idx !== lastIdx.current) {
      const dir = wrap(idx - lastIdx.current, N) > 0 ? 1 : -1;
      lastIdx.current = idx;
      const spinning = Math.abs(tn.target - tn.cur) > 0.3;
      if (!spinning) {
        // exactly one flip (180°) per change; fast repeats never stack extra turns
        tn.start = tn.cur;
        tn.target = tn.cur + dir * Math.PI;
        tn.pending = true;
      } else if (!tn.pending) {
        swap(idx); // already past edge-on: just change the picture
      }
    }
    tn.cur = THREE.MathUtils.damp(tn.cur, tn.target, 3.4, dt);
    if (tn.pending && Math.abs(tn.cur - tn.start) >= Math.PI / 2) {
      swap(lastIdx.current);
      tn.pending = false;
    }
    if (!tn.pending && Math.abs(tn.cur - tn.target) < 0.002) {
      const k2 = Math.round(tn.target / (Math.PI * 2)) * Math.PI * 2;
      tn.cur -= k2;
      tn.target -= k2;
      tn.start = tn.cur;
    }
    if (cap.current) {
      cap.current.position.y = 0.62 + Math.sin(time * 0.8) * 0.07 * m;
      cap.current.rotation.y = tn.cur + pointer.x * 0.28 * m;
      cap.current.rotation.x = THREE.MathUtils.damp(cap.current.rotation.x, -pointer.y * 0.1 * m, 4, dt);
      cap.current.scale.x = THREE.MathUtils.damp(cap.current.scale.x, tn.w, 5, dt);
      cap.current.scale.y = THREE.MathUtils.damp(cap.current.scale.y, tn.h, 5, dt);
    }

    // camera parallax
    const aspect = size.width / size.height;
    const z = aspect < 0.8 ? 13.5 : aspect < 1.2 ? 11 : 9.4;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.7 * m, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 0.4 + pointer.y * 0.25 * m, 2.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, z, 2, dt);
    camera.lookAt(0, 0.15, 0);

    // title ring
    p.current = THREE.MathUtils.damp(p.current, tRef.current, 2.8, dt);
    const R = 7.5;
    const step = mobile ? 0.5 : 0.6;
    const sc = aspect < 0.8 ? 0.8 : 0.92;
    for (let i = 0; i < N; i++) {
      const g = groupRefs.current[i];
      if (!g) continue;
      const d = wrap(i - p.current, N);
      const ad = Math.abs(d);
      const a = d * step;
      g.visible = ad < 2.7;
      g.position.set(Math.sin(a) * R, -0.85, (Math.cos(a) - 1) * R + 1.5);
      g.rotation.y = a * 1.05;
      g.scale.setScalar(sc * (1 - 0.2 * smooth(0, 1, ad)));
      const sm = solidRefs.current[i];
      const lm = lineRefs.current[i];
      if (sm) sm.opacity = 1 - smooth(0.12, 0.65, ad);
      if (lm) lm.opacity = smooth(0.1, 0.8, ad) * (1 - smooth(1.4, 2.6, ad)) * 0.85;
    }
  });

  return (
    <>
      <mesh scale={90} material={skyMat}>
        <sphereGeometry args={[1, 32, 24]} />
      </mesh>

      {ridges.map((g, i) => (
        <mesh key={i} geometry={g} material={ridgeMats[i]} position={[0, 0, -16 - i * 9]} />
      ))}

      {/* mirrored floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.3, -10]}>
        <planeGeometry args={[120, 80]} />
        <MeshReflectorMaterial
          ref={ground as never}
          resolution={mobile ? 512 : 1024}
          blur={[380, 120]}
          mixBlur={0.9}
          mixStrength={mobile ? 38 : 64}
          mirror={1}
          roughness={1}
          depthScale={1.1}
          minDepthThreshold={0.3}
          maxDepthThreshold={1.3}
          color="#120a05"
          metalness={0.35}
        />
      </mesh>

      {/* halo + portal */}
      <mesh position={[0, 0.55, -1.2]} scale={[8.5, 8.5, 1]} material={glowMat}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      <mesh
        ref={cap}
        material={capMat}
        onClick={() => onOpen(mod(tRef.current, N))}
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "")}
      >
        <planeGeometry args={[1, 1]} />
      </mesh>

      {/* title ring */}
      {titles &&
        slides.map((s, i) => (
          <group key={s.slug} ref={(el) => void (groupRefs.current[i] = el)}>
            <mesh>
              <planeGeometry args={[3.7, 1.39]} />
              <meshBasicMaterial ref={(el) => void (solidRefs.current[i] = el)} map={titles[i].solid} transparent depthWrite={false} toneMapped={false} fog={false} />
            </mesh>
            <mesh position={[0, 0, 0.001]}>
              <planeGeometry args={[3.7, 1.39]} />
              <meshBasicMaterial ref={(el) => void (lineRefs.current[i] = el)} map={titles[i].outline} transparent depthWrite={false} toneMapped={false} fog={false} />
            </mesh>
          </group>
        ))}

      <Sparkles count={mobile ? 30 : 70} scale={[16, 6, 8]} position={[0, 0.8, 0]} size={3.2} speed={0.18} opacity={0.55} color="#f6e6c4" />
      <ambientLight intensity={0.6} />
    </>
  );
}

export default function HeroWorld({
  slides,
  t,
  onOpen,
  visible,
  mobile,
}: {
  slides: HeroSlide[];
  t: number;
  onOpen: (i: number) => void;
  visible: boolean;
  mobile: boolean;
}) {
  return (
    <Canvas
      flat
      frameloop={visible ? "always" : "never"}
      dpr={[1, mobile ? 1.5 : 1.75]}
      camera={{ position: [0, 0.4, 9.4], fov: 32, near: 0.1, far: 200 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      style={{ touchAction: "pan-y" }}
    >
      <World slides={slides} t={t} onOpen={onOpen} mobile={mobile} />
    </Canvas>
  );
}
