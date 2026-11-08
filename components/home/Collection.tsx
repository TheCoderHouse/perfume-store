"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getProduct, inr, startingPrice } from "@/lib/products";

const PICKS = [
  { slug: "coco-mademoiselle", img: "/images/stone-2.png", bg: "#2a1614" },
  { slug: "versace-eros", img: "/images/stone-5.png", bg: "#0e2f35" },
  { slug: "ysl-libre", img: "/images/stone-7.png", bg: "#17120d" },
  { slug: "chanel-no5", img: "/images/stone-1.png", bg: "#1a1512" },
  { slug: "nectarine-blossom-honey", img: "/images/stone-3.png", bg: "#2a1d12" },
  { slug: "red-diamond", img: "/images/stone-4.png", bg: "#3b1014" },
];
const LIST = PICKS.map((x) => ({ ...getProduct(x.slug)!, img: x.img, bg: x.bg }));
const N = LIST.length;
const EXTRA = 3; // extra copies of the film ahead of the first panel: the strip starts several panels early
const ZOOM_START = 0.6; // photo scale at the start (it grows to 1 as the window opens)
const GAP_START = 0.55; // space between panels at the start, as a fraction of a panel width (it closes up)
const LAND = 3; // the strip lands with the 4th product centred, so the move never has to swing back
const pad = (n: number) => String(n).padStart(2, "0");

const CREAM = "#f6f0e4";
const DARK = "#171513";

/*
  The collection is ONE strip of film drawn in WebGL. The PHOTOS are never bent: each panel's photo is a flat,
  axis-aligned image that simply travels with its panel. What bends is the WINDOW (the border) through which
  each photo is seen — it follows a gentle S-shaped path that is flat in the middle and sweeps up to the
  right / down to the left — so the panels can only ever move together, attached end to end.

    s        distance along the strip
    uBend    1 → the window follows the S-path, 0 → perfectly straight
    uMask    height of the window, thin slit → full frame
    uZoom    scale of the photos / panels
    uGap     space between panels
*/
const VERT = /* glsl */ `
  uniform float uCw;
  uniform float uGap;
  uniform float uIndex;
  uniform float uScroll;
  uniform float uBend;
  uniform float uMask;
  uniform float uZoom;
  uniform float uH;
  uniform float uSide;
  uniform float uSideMask;
  uniform float uSideOff;
  uniform float uKind; // 0 = the main strip, +1 / -1 = the thin parallel slide above / below it
  varying vec2 vPos;    // this point on screen (centred px)
  varying vec2 vCenter; // where the middle of this panel's flat photo sits on screen

  // the S-path: nearly flat across the middle, sweeping up to the right and down to the left
  vec2 curve(float xs, out vec2 nrm) {
    float xn = xs / uH;
    float y = uBend * uH * (0.1 * xn + 0.17 * xn * xn * xn);
    float dy = uBend * (0.1 + 0.51 * xn * xn);
    vec2 T = normalize(vec2(1.0, dy));
    nrm = vec2(-T.y, T.x);
    return vec2(xs, y);
  }

  void main() {
    bool isSide = abs(uKind) > 0.5;
    float mk = isSide ? uSideMask * uSide : uMask;
    float off = isSide ? uKind * uSideOff * uZoom : 0.0;
    float base = uIndex * (uCw + uGap) + uScroll;

    vec2 n;
    vec2 c = curve((position.x + base) * uZoom, n);
    vec2 p = c + n * (position.y * mk * uZoom + off);

    vec2 nc;
    vec2 cc = curve(base * uZoom, nc);
    vCenter = cc + nc * off;
    vPos = p;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 0.0, 1.0);
  }
`;
const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uLit;
  uniform float uPlane;
  uniform vec3 uBg;
  uniform float uCw;
  uniform float uH;
  uniform float uZoom;
  uniform float uW;
  uniform float uFade;
  varying vec2 vPos;
  varying vec2 vCenter;

  void main() {
    // the photo is flat: sample it by where this point is relative to the photo's own (unrotated) centre
    vec2 uv = (vPos - vCenter) / (vec2(uCw, uH) * uZoom) + 0.5;
    vec3 col = uBg;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
      // cover-fit a square photo into the panel
      if (uPlane < 1.0) uv.x = (uv.x - 0.5) * uPlane + 0.5;
      else uv.y = (uv.y - 0.5) / uPlane + 0.5;
      vec4 tex = texture2D(uTex, uv);
      col = mix(uBg, tex.rgb, tex.a); // the cut-outs are transparent: sit them on the product's own ground
    }
    float g = dot(col, vec3(0.299, 0.587, 0.114));

    // intro: panels away from the middle are pale and grey, fading into the ground
    float near = 1.0 - smoothstep(uW * 0.12, uW * 0.6, length(vCenter));
    col = mix(vec3(g), col, mix(1.0, near, uFade));
    float a = mix(1.0, 0.3 + 0.7 * near, uFade);

    col = mix(vec3(g) * 0.3, col, uLit);
    gl_FragColor = vec4(col, a);
    #include <colorspace_fragment>
  }
`;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Desktop: when the visitor reaches the section, a joined reel of all the products
 * sweeps in from the top-right along a wavy path, straightens and opens up, then splits
 * into the individual panels. The section pins and scrolling slides the strip sideways
 * (damped, then eased onto the nearest panel); the centre panel is lit, the rest fall
 * back to dark greyscale, and the big title rolls over.
 * Mobile / reduced motion: a simple swipeable carousel.
 */
export default function Collection() {
  const wrap = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const root = section.current!;
      const stage = stageRef.current!;
      const track = trackRef.current!;
      const canvas = canvasRef.current!;
      const swaps = gsap.utils.toArray<HTMLElement>("[data-pos]", root);
      const dots = gsap.utils.toArray<HTMLElement>(".cg-dot", root);
      const ui = gsap.utils.toArray<HTMLElement>(".cg-ui", root);
      const cards = gsap.utils.toArray<HTMLElement>(".cg-card", root);

      /* ---- layout shared by the DOM hit-areas and the WebGL strip ---- */
      let W = 0;
      let H = 0;
      let cw = 0;
      let gap = 0;
      let step = 0;
      const layout = () => {
        W = stage.clientWidth;
        H = stage.clientHeight;
        cw = Math.min(W * 0.56, H * 0.88);
        gap = W * 0.011;
        step = cw + gap;
        stage.style.setProperty("--cg-w", `${cw}px`);
        stage.style.setProperty("--cg-gap", `${gap}px`);
      };
      layout();

      let current = -1;
      const applyActive = (i: number) => {
        if (i === current) return;
        current = i;
        cards.forEach((c, k) => c.classList.toggle("is-active", k === i));
        swaps.forEach((s) => {
          const k = Number(s.dataset.i);
          s.dataset.pos = k < i ? "before" : k > i ? "after" : "active";
        });
        dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
        if (counter.current) counter.current.textContent = pad(i + 1);
      };
      applyActive(0);

      /* ---- WebGL (falls back to the plain DOM strip if unavailable) ---- */
      let renderer: THREE.WebGLRenderer | null = null;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
        if (!renderer.getContext()) renderer = null;
      } catch {
        renderer = null;
      }

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 10, 20000);
      const meshes: THREE.Mesh[] = [];
      const shared = {
        uCw: { value: 0 },
        uGap: { value: 0 },
        uScroll: { value: 0 },
        uBend: { value: 1 },
        uMask: { value: 1 },
        uZoom: { value: ZOOM_START },
        uW: { value: 1 },
        uFade: { value: 1 },
        uSide: { value: 1 },
        uSideMask: { value: 0.045 },
        uSideOff: { value: 0 },
        uH: { value: 1 },
        uPlane: { value: 1 },
      };
      const lits = LIST.map((_, k) => (k === LAND ? 1 : 0));
      const mats: THREE.ShaderMaterial[] = []; // the main reel, one per product
      const allMats: THREE.ShaderMaterial[] = []; // + the thin parallel slides
      const textures: THREE.Texture[] = [];

      // animated intro state — one object, so everything moves as a unit
      const intro = { scroll: 0, bend: 0, mask: 1, zoom: 1, gapK: 1, lit: 0, side: 0, extra: 0, fade: 0 };
      let introDone = !renderer;
      let ready = !renderer;

      const resize = () => {
        layout();
        if (!renderer) return;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H, false);
        camera.aspect = W / H;
        camera.position.set(0, 0, H / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
        camera.updateProjectionMatrix();
        shared.uCw.value = cw;
        shared.uH.value = H;
        shared.uPlane.value = cw / H;
        // centre of a thin slide, in strip units: clear of the main reel, scaling with it
        shared.uSideOff.value = H * 0.72;
        shared.uW.value = W;
        meshes.forEach((m) => {
          m.geometry.dispose();
          m.geometry = new THREE.PlaneGeometry(cw, H, 56, 4);
        });
      };

      const tl = gsap.timeline({
        paused: true,
        onComplete: () => {
          introDone = true;
          stage.classList.remove("cg-lit");
        },
      });

      if (renderer) {
        renderer.setClearColor(0x000000, 0);
        for (let k = -EXTRA; k < N; k++) {
          const prod = ((k % N) + N) % N;
          // the main reel + a thin parallel slide above (+1) and below (-1) it, all sharing one path
          [0, 1, -1].forEach((kind) => {
            const mat = new THREE.ShaderMaterial({
              uniforms: {
                ...shared,
                uIndex: { value: k },
                uTex: { value: null },
                uLit: { value: 1 },
                uBg: { value: new THREE.Color(LIST[prod].bg) },
                uKind: { value: kind },
              },
              vertexShader: VERT,
              fragmentShader: FRAG,
              side: THREE.DoubleSide,
              transparent: true,
              depthTest: false,
              depthWrite: false,
            });
            mat.userData.prod = prod;
            allMats.push(mat);
            if (kind === 0 && k >= 0) mats.push(mat);
            const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
            mesh.frustumCulled = false;
            mesh.userData = { side: kind !== 0, extra: k < 0 };
            meshes.push(mesh);
            scene.add(mesh);
          });
        }
        resize();

        // start state: a thin, fully-bent, shrunken reel waiting off-screen top-right
        // the whole reel is squeezed into a point in the top-right corner; it grows out of it as it slides
        // start: a thin, curved window, photos at 60% scale, wide gaps, the 2nd extra panel just left of centre
        const gap0 = GAP_START * cw;
        intro.extra = 1;
        intro.bend = 1;
        intro.mask = 0.38;
        intro.side = 1;
        intro.fade = 1;
        intro.zoom = ZOOM_START;
        intro.gapK = gap0 / gap;
        intro.scroll = (-0.15 * W) / ZOOM_START + 2 * (cw + gap0);
        intro.lit = 1;
        stage.classList.add("cg-gl", "cg-lit");
        stage.style.backgroundColor = CREAM;
        gsap.set(ui, { autoAlpha: 0 });

        const loader = new THREE.TextureLoader();
        Promise.all(
          LIST.map(async (p, k) => {
            const t = await loader.loadAsync(p.img);
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = renderer!.capabilities.getMaxAnisotropy();
            textures.push(t);
            allMats.forEach((m) => {
              if (m.userData.prod === k) m.uniforms.uTex.value = t;
            });
          }),
        ).then(() => {
          ready = true;
          tryRun();
        });
      } else {
        stage.style.backgroundColor = DARK;
      }

      /* ---- scroll: one damped value drives the strip ---- */
      let target = 0; // px, where the strip wants to be
      let pos = 0; // px, where it is (damped)
      let prog = 0;
      let lastMove = 0;
      let snapping = false;
      let inPin = false;
      let visible = true;

      // ONE continuous motion — the reel never reverses. It sweeps in at the top-right, passes through the
      // reverse curve in the middle, carries on to the bottom-left, and as it opens up it lands with the
      // LAND-th product centred. (While it plays, page scroll is locked, then handed over at that panel.)
      let played = false;
      let wantPlay = false;
      let silent = false;
      let lockedScroll = false;
      const land = () => {
        intro.scroll = 0;
        intro.extra = 0;
        intro.fade = 0;
        if (!silent) {
          pos = target = LAND * step;
          const lenis = window.__lenis;
          if (lenis) lenis.scrollTo(pin.start + (LAND / (N - 1)) * (pin.end - pin.start), { immediate: true, force: true });
        }
        applyActive(Math.max(0, Math.min(N - 1, Math.round(pos / step))));
        if (lockedScroll) {
          lockedScroll = false;
          window.__lenis?.start();
        }
      };
      // One continuous move, following the reference: the strip slides left/down along the S-path as a thin curved
      // window that slowly widens; then the window opens, the photos grow, the gaps close and the border
      // straightens until the panels fill the screen — landing with panel LAND in the middle.
      tl.to(stage, { backgroundColor: DARK, duration: 1.9, ease: "power2.inOut" }, 0.3)
        .to(intro, { scroll: () => -LAND * step, duration: 2.8, ease: "power2.out" }, 0)
        .to(intro, { mask: 0.52, duration: 1.2, ease: "none" }, 0)
        .to(intro, { mask: 1, duration: 1.5, ease: "power2.inOut" }, 1.2)
        .to(intro, { zoom: 0.75, duration: 1.2, ease: "none" }, 0)
        .to(intro, { zoom: 1, duration: 1.5, ease: "power2.inOut" }, 1.2)
        .to(intro, { bend: 0, duration: 2.7, ease: "power1.inOut" }, 0.2)
        .to(intro, { gapK: 1, duration: 2.2, ease: "power2.inOut" }, 0.5)
        .to(intro, { side: 0, duration: 0.9, ease: "power2.in" }, 1.2)
        .to(intro, { fade: 0, duration: 0.8, ease: "power2.out" }, 2.1)
        .call(land, [], 2.8)
        .to(intro, { lit: 0, duration: 0.8, ease: "power2.out" }, 2.8)
        .to(ui, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 2.85);

      const run = () => {
        if (played || !renderer) return;
        played = true;
        const lenis = window.__lenis;
        if (lenis) {
          lockedScroll = true;
          lenis.stop();
          // bring the stage to the top while the reel is already moving — no waiting
          if (Math.abs(window.scrollY - pin.start) > 4) lenis.scrollTo(pin.start, { duration: 0.5, force: true, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
        }
        tl.play();
      };
      const tryRun = () => {
        if (wantPlay && ready) run();
      };
      let armed = false;
      const introTrigger = renderer
        ? ScrollTrigger.create({
            trigger: wrap.current!,
            start: "top 45%",
            onEnter: (self) => {
              if (played) return;
              // fires synchronously on creation when the page loads already inside / past the section
              if (!armed || self.progress >= 1) {
                // already scrolled past (reload / jump): skip straight to the finished state
                played = true;
                silent = true;
                tl.progress(1);
                return;
              }
              wantPlay = true;
              tryRun();
            },
          })
        : null;
      armed = true;

      // leave the section upward → rewind the intro so it plays again the next time you scroll in
      const resetIntro = () => {
        if (!played || !renderer) return;
        played = false;
        wantPlay = false;
        silent = false;
        tl.pause();
        tl.progress(0, true);
        introDone = false;
        intro.extra = 1;
        stage.classList.add("cg-lit");
        if (lockedScroll) {
          lockedScroll = false;
          window.__lenis?.start();
        }
      };
      const resetTrigger = renderer ? ScrollTrigger.create({ trigger: wrap.current!, start: "top bottom", onLeaveBack: resetIntro }) : null;

      const pin = ScrollTrigger.create({
        trigger: root,
        pin: true,
        start: "top top",
        end: () => "+=" + (N - 1) * window.innerHeight * 0.9,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          prog = self.progress;
          target = prog * (N - 1) * step;
          inPin = prog > 0.0005 && prog < 0.9995;
          lastMove = performance.now();
        },
        onRefresh: (self) => {
          layout();
          prog = self.progress;
          target = prog * (N - 1) * step;
          pos = target;
        },
      });
      trigger.current = pin;

      const vis = ScrollTrigger.create({
        trigger: wrap.current!,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (visible = self.isActive),
      });

      let last = gsap.ticker.time;
      const tick = () => {
        const now = gsap.ticker.time;
        const dt = Math.min(0.05, now - last);
        last = now;

        pos += (target - pos) * (1 - Math.exp(-dt * 9));
        if (Math.abs(target - pos) < 0.05) pos = target;
        const f = pos / step;
        track.style.transform = `translate3d(${-pos}px,0,0)`;
        applyActive(Math.max(0, Math.min(N - 1, Math.round(f))));

        // after the user stops, ease the strip onto the nearest panel
        const lenis = window.__lenis;
        if (lenis && introDone && inPin && !snapping && performance.now() - lastMove > 170) {
          const want = Math.round(prog * (N - 1));
          if (Math.abs(prog * (N - 1) - want) > 0.004) {
            snapping = true;
            lenis.scrollTo(pin.start + (want / (N - 1)) * (pin.end - pin.start), {
              duration: 0.95,
              easing: (t: number) => 1 - Math.pow(1 - t, 4),
              onComplete: () => (snapping = false),
            });
            window.setTimeout(() => (snapping = false), 1300);
          }
        }

        if (!renderer || !visible) return;
        shared.uScroll.value = -pos + intro.scroll;
        shared.uFade.value = intro.fade;
        shared.uBend.value = intro.bend;
        shared.uMask.value = intro.mask;
        shared.uSide.value = intro.side;
        meshes.forEach((m) => {
          const u = m.userData as { side: boolean; extra: boolean };
          m.visible = (!u.side || intro.side > 0.01) && (!u.extra || intro.extra > 0.5);
        });
        shared.uZoom.value = intro.zoom;
        shared.uGap.value = gap * intro.gapK;
        mats.forEach((m, k) => {
          const d = Math.abs(k - f);
          lits[k] += (1 - smooth(0.32, 0.9, d) - lits[k]) * (1 - Math.exp(-dt * 6));
          m.uniforms.uLit.value = Math.max(lits[k], intro.lit);
        });
        renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);

      const ro = new ResizeObserver(() => {
        resize();
        target = prog * (N - 1) * step;
        pos = target;
      });
      ro.observe(stage);

      return () => {
        trigger.current = null;
        gsap.ticker.remove(tick);
        ro.disconnect();
        if (lockedScroll) window.__lenis?.start();
        introTrigger?.kill();
        resetTrigger?.kill();
        pin.kill();
        vis.kill();
        tl.kill();
        meshes.forEach((m) => m.geometry.dispose());
        allMats.forEach((m) => m.dispose());
        textures.forEach((t) => t.dispose());
        renderer?.dispose();
        stage.classList.remove("cg-gl", "cg-lit");
        stage.style.backgroundColor = "";
      };
    });
    return () => mm.revert();
  }, []);

  /** Ease the pinned strip to panel k (used when a side panel is clicked / focused). */
  const goTo = (k: number) => {
    const st = trigger.current;
    if (!st) return false;
    const y = st.start + (k / (N - 1)) * (st.end - st.start);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.1, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
    else window.scrollTo({ top: y, behavior: "smooth" });
    return true;
  };

  return (
    // The outer div is owned by React; GSAP's pin-spacer is created inside it.
    <div ref={wrap}>
      <section ref={section} className="relative overflow-hidden" aria-label="The collection">
        {/* Desktop stage */}
        <div
          ref={stageRef}
          className="relative hidden h-[100svh] w-full overflow-hidden bg-[#171513] text-[#efe5d0] min-[900px]:block motion-reduce:hidden"
          style={{ ["--cg-w" as string]: "min(56vw, 88svh)", ["--cg-gap" as string]: "1.1vw" }}
        >
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

          {/* DOM strip: the click / focus targets (and the no-WebGL fallback). It tracks the WebGL strip exactly. */}
          <div
            ref={trackRef}
            className="absolute inset-y-0 left-0 flex h-full items-stretch will-change-transform"
            style={{ columnGap: "var(--cg-gap)", paddingLeft: "calc((100% - var(--cg-w)) / 2)" }}
          >
            {LIST.map((p, i) => (
              <Link
                key={p.slug}
                href={`/product/${p.slug}`}
                data-cursor="View"
                aria-label={`${p.name} — ${p.family}, ${inr(startingPrice(p))}`}
                onClick={(e) => {
                  if (!e.currentTarget.classList.contains("is-active") && goTo(i)) e.preventDefault();
                }}
                onFocus={(e) => {
                  if (!e.currentTarget.classList.contains("is-active")) goTo(i);
                }}
                className="cg-card relative block h-full shrink-0 overflow-hidden"
                style={{ width: "var(--cg-w)", ["--cg-bg" as string]: p.bg }}
              >
                <div className="cg-img absolute inset-0">
                  <Image src={p.img} alt={`${p.name} in a carved stone niche`} fill sizes="56vw" priority={i < 2} className="object-cover" />
                </div>
              </Link>
            ))}

            {/* Section heading: sits in the empty ground left of the first panel and scrolls away with it */}
            <div className="cg-ui pointer-events-none absolute bottom-[12vh] left-[4vw] max-w-[22vw]">
              <p className="eyebrow mb-4 opacity-70">The Collection</p>
              <p className="display text-[clamp(2.4rem,4vw,4.5rem)] italic">Six signatures.</p>
            </div>
          </div>

          {/* top bar */}
          <div className="cg-ui pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-end px-[3vw] pt-24">
            <p className="eyebrow tabular-nums opacity-80">
              <span ref={counter}>01</span> / {pad(N)}
            </p>
          </div>

          {/* rolling title */}
          <div className="cg-ui pointer-events-none absolute inset-x-0 bottom-[7vh] z-10 flex flex-col items-center">
            <div className="relative h-[clamp(5rem,11.5vw,13.5rem)] w-full overflow-hidden">
              {LIST.map((p, i) => (
                <div key={p.slug} data-i={i} data-pos={i === 0 ? "active" : "after"} className="cg-swap absolute inset-0 flex items-center justify-center">
                  <h2
                    className={`display relative whitespace-nowrap pb-[0.12em] pr-[0.1em] ${p.name.length > 16 ? "text-[clamp(3rem,6.6vw,8rem)]" : "text-[clamp(4.2rem,10.5vw,12.5rem)]"} italic leading-[1.1] text-[#f6f0e4] drop-shadow-[0_2px_40px_rgba(0,0,0,0.35)]`}
                  >
                    {p.name}
                    <sup className="eyebrow absolute right-0 top-[0.28em] translate-x-full text-[0.8rem] not-italic tracking-[0.2em] opacity-80">({pad(i + 1)})</sup>
                  </h2>
                </div>
              ))}
            </div>
            <p className="eyebrow relative mt-1 text-[0.7rem] opacity-75">/{pad(N)} Fragrances</p>
          </div>

          {/* price + link for the lit panel */}
          <div className="cg-ui absolute bottom-[5vh] right-[3vw] z-10 h-12 w-64">
            {LIST.map((p, i) => (
              <div key={p.slug} data-i={i} data-pos={i === 0 ? "active" : "after"} className="cg-swap absolute inset-0 flex items-center justify-end gap-6">
                <span className="text-sm">{inr(startingPrice(p))}</span>
                <Link href={`/product/${p.slug}`} className="btn !min-h-11 !px-6" tabIndex={-1}>
                  Discover <ArrowUpRight size={14} />
                </Link>
              </div>
            ))}
          </div>

          {/* progress ticks */}
          <div className="cg-ui absolute bottom-[5vh] left-[3vw] z-10 flex gap-2" aria-hidden>
            {LIST.map((p) => (
              <span key={p.slug} className="cg-dot block h-[2px] w-8 bg-current opacity-25 transition-all duration-500 [&.is-on]:w-14 [&.is-on]:opacity-100" />
            ))}
          </div>
        </div>

        {/* Mobile / reduced motion: swipeable snap carousel */}
        <div className="py-16 min-[900px]:hidden motion-reduce:block">
          <div className="px-5">
            <p className="eyebrow mb-3">The Collection</p>
            <h2 className="display text-5xl">Six signatures.</h2>
          </div>
          <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scroll-padding-inline:1.25rem]">
            {LIST.map((p) => (
              <article key={p.slug} className="w-[78%] max-w-sm shrink-0 snap-start">
                <Link href={`/product/${p.slug}`} className="relative block aspect-[3/4] overflow-hidden bg-ink" style={{ background: p.bg }}>
                  <Image src={p.img} alt={`${p.name} in a carved stone niche`} fill sizes="80vw" className="object-contain p-[6%]" />
                </Link>
                <p className="eyebrow mt-4 text-[0.6rem] opacity-70">{p.family} · {p.gender}</p>
                <h3 className="display mt-1.5 text-4xl italic leading-none">{p.name}</h3>
                <p className="mt-2 text-sm opacity-80">{p.tagline}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm">{inr(startingPrice(p))}</span>
                  <Link href={`/product/${p.slug}`} className="u-link eyebrow inline-flex min-h-11 items-center gap-2 text-[0.62rem]">Discover <ArrowUpRight size={13} /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
