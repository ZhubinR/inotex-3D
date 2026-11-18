// src/components/3d/InotexCanvas.tsx
"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneState, setChapter } from "@/lib/SceneState";
import { buildLegoModel, ModelName, clearSceneMaterialsCache } from "../lego/models";
import { LegoModel } from "../lego/LegoBuilder";
import { ENTER, exitModel, resetHolder } from "../lego/transitions";
import { detectQualityTier, QualityConfig } from "@/lib/webglCapabilities";

const BLUE = 0x385dae;
const TEAL = 0x00956e;
const YELLOW = 0xffb81d;
const GRAY = 0x898b8e;
const NAVY = 0x16337a;
const DEFAULT_PALETTE = [BLUE, TEAL, YELLOW, NAVY, GRAY];

const CHAPTER_MODELS: (ModelName | null)[] = [
  "hall",
  "meeting",
  null,
  "growth",
  null,
  "gate",
];
const PILLAR_MODELS: ModelName[] = [
  "stage",
  "cafe",
  "pitch",
  "reverse",
  "night",
  "jobs",
];

type Pose = {
  x: number;
  y: number;
  s: number;
  rx: number;
  ry: number;
  rz: number;
  cx: number;
  cy: number;
  cz: number;
  tx: number;
  ty: number;
  tz: number;
};

type Key = {
  nx: number;
  ny: number;
  s: number;
  rx: number;
  ry: number;
  rz: number;
  camX: number;
  camY: number;
  camZ: number;
  tarX: number;
  tarY: number;
  tarZ: number;
};

// Cinematic Chapter Poses and Camera Coordinates (Approved Phase 2 Rig)
const KEYS: Key[] = [
  // 0: Hero (3D INOTEX Logo) — Majestic frontal elevation
  { nx: -0.44, ny: -0.01, s: 1.08, rx: 0.26, ry: -0.40, rz: 0.0, camX: 0.0, camY: 0.4, camZ: 12.0, tarX: 0.0, tarY: 0.0, tarZ: 0.0 },
  // 1: Manifesto (Quantum / Tech Development) — Slightly low-angle ascending view
  { nx: -0.44, ny: -0.02, s: 1.05, rx: 0.40, ry: 0.34, rz: -0.02, camX: -0.6, camY: -0.3, camZ: 11.2, tarX: -0.4, tarY: 0.2, tarZ: 0.0 },
  // 2: Ecosystem & Services — Elevated 3/4 high angle showing 3-tier pyramid & satellites
  { nx: -0.44, ny: -0.02, s: 1.06, rx: 0.48, ry: -0.42, rz: 0.0, camX: -0.4, camY: 1.2, camZ: 12.4, tarX: -0.3, tarY: -0.2, tarZ: 0.0 },
  // 3: Impact (3D Bar Chart) — Low-angle heroic perspective accentuating vertical scale
  { nx: -0.44, ny: -0.02, s: 1.03, rx: 0.38, ry: 0.38, rz: 0.0, camX: -0.5, camY: -0.6, camZ: 11.6, tarX: -0.3, tarY: 0.4, tarZ: 0.0 },
  // 4: Experience (3D Vortex FX) — Centered panoramic perspective with wide depth
  { nx: 0.0, ny: 0.0, s: 0.01, rx: 0.50, ry: 0.0, rz: 0.0, camX: 0.0, camY: 0.0, camZ: 13.2, tarX: 0.0, tarY: 0.0, tarZ: 0.0 },
  // 5: Register (Welcome Arch & Portal) — Inviting eye-level corridor perspective
  { nx: -0.44, ny: -0.02, s: 1.06, rx: 0.38, ry: -0.44, rz: 0.0, camX: -0.5, camY: 0.1, camZ: 11.4, tarX: -0.3, tarY: 0.1, tarZ: 0.0 },
];

function resolve(
  i: number,
  halfW: number,
  halfH: number,
  narrow: boolean
): Pose {
  const k = KEYS[i] ?? KEYS[0];
  const fit = Math.min(1.0, halfW / 2.35);
  let x = k.nx * halfW;
  let y = k.ny * halfH;
  let cx = k.camX;
  let cy = k.camY;
  let cz = k.camZ;
  let tx = k.tarX;
  let ty = k.tarY;
  let tz = k.tarZ;

  if (narrow) {
    x = 0;
    y = halfH * 0.42;
    cx = 0;
    cy = 0.2;
    cz = Math.max(k.camZ, 12.6);
    tx = 0;
    ty = y * 0.25;
    tz = 0;
  }

  return {
    x,
    y,
    s: k.s * fit * (narrow ? 0.72 : 1),
    rx: k.rx,
    ry: k.ry,
    rz: k.rz,
    cx,
    cy,
    cz,
    tx,
    ty,
    tz,
  };
}

function softShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.65)");
  grad.addColorStop(0.65, "rgba(255,255,255,0.2)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function hexShardGeometry() {
  const shape = new THREE.Shape();
  const R = 0.95;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const x = Math.cos(a) * R;
    const y = Math.sin(a) * R;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.32,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.08,
    bevelThickness: 0.08,
  });
  geo.center();
  return geo;
}

const isInteractive = (t: EventTarget | null) =>
  !!(t as HTMLElement | null)?.closest?.(
    "a, button, input, textarea, select, label, figure, img, video, [data-cursor]"
  );

// Global performance diagnostics type
declare global {
  interface Window {
    __INOTEX_PERF__?: {
      fps: number;
      frameTimeMs: number;
      drawCalls: number;
      triangles: number;
      geometries: number;
      textures: number;
      tier: string;
      dpr: number;
    };
  }
}

export const InotexCanvas: React.FC<{ ready?: boolean }> = ({
  ready = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(ready);
  const playIntroRef = useRef<() => void>(() => {});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    gsap.registerPlugin(ScrollTrigger);

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Detect hardware capability tier (Multi-factor: GPU, Cores, Memory, Touch, DPR)
    const quality: QualityConfig = detectQualityTier();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: quality.antialias,
        alpha: true,
        powerPreference: quality.powerPreference,
        precision: quality.tier === "mobile" ? "mediump" : "highp",
      });
    } catch {
      // Graceful fallback if WebGL is unavailable
      return;
    }

    renderer.setPixelRatio(quality.maxDpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = quality.directionalShadows;
    renderer.shadowMap.type = quality.shadowMapType;
    renderer.shadowMap.autoUpdate = false; // Intelligent on-demand shadow updates!

    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const envTex = pmrem.fromScene(room, 0.04).texture;
    room.dispose(); // Explicit disposal of RoomEnvironment scene geometry & materials
    scene.environment = envTex;
    scene.environmentIntensity = 0.8;

    const FOV = 35;
    const CAM_Z = 12;
    const camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      60
    );
    const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;

    const pose: Pose = {
      ...resolve(
        0,
        halfH * (window.innerWidth / window.innerHeight),
        halfH,
        window.innerWidth < 900
      ),
    };

    const currentCamPos = new THREE.Vector3(pose.cx, pose.cy, pose.cz);
    const currentCamTar = new THREE.Vector3(pose.tx, pose.ty, pose.tz);
    camera.position.copy(currentCamPos);
    camera.lookAt(currentCamTar);

    // Studio Lighting Rig
    const key = new THREE.DirectionalLight(0xfffaed, 2.1);
    key.castShadow = quality.directionalShadows;
    if (quality.directionalShadows) {
      key.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
      Object.assign(key.shadow.camera, {
        left: -5.6,
        right: 5.6,
        top: 5.6,
        bottom: -5.6,
        near: 1,
        far: 32,
      });
      key.shadow.bias = -0.0002;
      key.shadow.normalBias = 0.025;
      key.shadow.radius = quality.tier === "high" ? 1.6 : 1.0;
    }
    scene.add(key, key.target);

    const hemi = new THREE.HemisphereLight(0xedf3fc, 0x0e1c32, 0.75);
    scene.add(hemi);

    const rimTeal = new THREE.DirectionalLight(0x00c896, 1.25);
    rimTeal.position.set(-7.5, 3.8, -4.5);
    scene.add(rimTeal);

    const fillYellow = new THREE.DirectionalLight(0xffbf2f, 0.5);
    fillYellow.position.set(6.5, -3.8, 3.8);
    scene.add(fillYellow);

    const coinRoot = new THREE.Group();
    const coinTilt = new THREE.Group();
    coinRoot.add(coinTilt);
    scene.add(coinRoot);

    const shadowTex = softShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      color: NAVY,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const shadowGeo = new THREE.PlaneGeometry(1, 1);
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.position.z = -2.0;
    scene.add(shadow);

    const experienceGroup = new THREE.Group();
    scene.add(experienceGroup);

    const hexRings: THREE.Mesh[] = [];
    const ringColors = [BLUE, TEAL, YELLOW, 0x16337a, 0x00956e, 0xffb81d];
    for (let idx = 0; idx < ringColors.length; idx++) {
      const col = ringColors[idx];
      const geo = new THREE.TorusGeometry(1.9 + idx * 0.95, 0.045, 8, 6);
      const mat = new THREE.MeshPhysicalMaterial({
        color: col,
        roughness: 0.16,
        metalness: 0.68,
        clearcoat: 0.9,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.z = (idx * Math.PI) / 6;
      experienceGroup.add(ring);
      hexRings.push(ring);
    }

    const TILE_COUNT = quality.shardCount;
    const shardGeo = hexShardGeometry();
    const shardMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.16,
      metalness: 0.15,
      clearcoat: 0.88,
      clearcoatRoughness: 0.1,
      reflectivity: 0.7,
    });
    const tiles = new THREE.InstancedMesh(shardGeo, shardMat, TILE_COUNT);
    tiles.frustumCulled = false;

    const tileData = Array.from({ length: TILE_COUNT }, (_, i) => {
      const angle = (i / TILE_COUNT) * Math.PI * 2 + (i % 3) * 0.25;
      const ringRadius = 1.65 + (i % 4) * 0.45;
      return {
        angle,
        ringRadius,
        zOffset: -2.0 - (i % 4) * 0.55,
        s: 0.09 + (i % 3) * 0.024,
        speed: 0.35 + (i % 5) * 0.08,
        phase: i * 1.7,
        spin: (i % 2 === 0 ? 1 : -1) * (0.25 + (i % 3) * 0.12),
        color: DEFAULT_PALETTE[i % DEFAULT_PALETTE.length],
      };
    });

    const tmpColor = new THREE.Color();
    const applyCloudPalette = (palette: number[]) => {
      for (let i = 0; i < TILE_COUNT; i++) {
        const c = palette[i % palette.length];
        tileData[i].color = c;
        tiles.setColorAt(i, tmpColor.set(c));
      }
      if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
    };
    applyCloudPalette(DEFAULT_PALETTE);
    scene.add(tiles);
    const tileDummy = new THREE.Object3D();

    const cloudState = { radiusFactor: 1 };

    const holders = new Map<
      ModelName,
      { holder: THREE.Group; model: LegoModel }
    >();
    let current: ModelName | null = null;
    let shadowNeedsUpdate = true;

    const getHolder = (name: ModelName) => {
      let h = holders.get(name);
      if (!h) {
        const model = buildLegoModel(name);
        const holder = new THREE.Group();
        holder.add(model.root);
        holder.visible = false;
        coinTilt.add(holder);
        h = { holder, model };
        holders.set(name, h);
      }
      return h;
    };

    const timelines = new Map<ModelName, gsap.core.Timeline>();
    const swapTo = (name: ModelName | null, animate = true) => {
      if (name === current) return;
      const prevName = current;
      const prev = prevName ? holders.get(prevName) : undefined;
      current = name;
      shadowNeedsUpdate = true; // Trigger shadow map update on model swap

      gsap.killTweensOf(cloudState);
      if (animate && !reduce) {
        gsap
          .timeline()
          .to(cloudState, {
            radiusFactor: 0.12,
            duration: 0.26,
            ease: "power2.in",
            onComplete: () => {
              if (prev) {
                applyCloudPalette(prev.model.palette);
              } else if (name) {
                applyCloudPalette(getHolder(name).model.palette);
              }
            },
          })
          .to(cloudState, {
            radiusFactor: 1,
            duration: 0.68,
            ease: "back.out(1.5)",
          });
      } else if (prev) {
        applyCloudPalette(prev.model.palette);
      }

      if (prev && prevName) {
        timelines.get(prevName)?.kill();
        if (animate && !reduce) {
          const old = prev;
          const exiting = prevName;
          timelines.set(
            exiting,
            exitModel(old, exiting, () => {
              if (current !== exiting) {
                old.holder.visible = false;
                resetHolder(old);
              }
            })
          );
        } else {
          prev.holder.visible = false;
          resetHolder(prev);
        }
      }

      if (!name) return;

      const next = getHolder(name);
      timelines.get(name)?.kill();
      resetHolder(next);
      next.holder.visible = true;
      if (animate && !reduce) {
        timelines.set(name, ENTER[name](next, prev ? 0.18 : 0.05));
      }
    };

    const wantedModel = (): ModelName | null => {
      const ch = SceneState.chapter;
      if (ch === 4) return null;
      if (ch === 2) {
        const p =
          SceneState.rowHover >= 0
            ? SceneState.rowHover
            : SceneState.activePillar;
        if (p < 0) return "ecosystem";
        return PILLAR_MODELS[Math.min(PILLAR_MODELS.length - 1, p)];
      }
      return CHAPTER_MODELS[ch] ?? "hall";
    };

    let introPlayed = false;
    const playIntro = () => {
      if (introPlayed) return;
      introPlayed = true;
      swapTo(wantedModel(), true);
    };
    playIntroRef.current = playIntro;
    if (readyRef.current) playIntro();

    let ctx: gsap.Context | null = null;
    let lastWidth = window.innerWidth;
    let activeTheme = "light";
    let isSceneVisible = true;

    const build = () => {
      ctx?.revert();
      const aspect = window.innerWidth / window.innerHeight;
      const halfW = halfH * aspect;
      const narrow = window.innerWidth < 900;
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-chapter]")
      );
      const poses = KEYS.map((_, i) => resolve(i, halfW, halfH, narrow));
      Object.assign(pose, poses[SceneState.chapter] ?? poses[0]);
      currentCamPos.set(pose.cx, pose.cy, pose.cz);
      currentCamTar.set(pose.tx, pose.ty, pose.tz);
      camera.position.copy(currentCamPos);
      camera.lookAt(currentCamTar);

      ctx = gsap.context(() => {
        sections.forEach((section, i) => {
          if (i > 0 && poses[i]) {
            gsap.fromTo(
              pose,
              { ...poses[i - 1] },
              {
                ...poses[i],
                ease: "power2.inOut",
                immediateRender: false,
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: "top 15%",
                  scrub: 0.8,
                  onUpdate: () => {
                    shadowNeedsUpdate = true;
                  },
                },
              }
            );
          }
          ScrollTrigger.create({
            trigger: section,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (!self.isActive) return;
              setChapter(i);
              activeTheme = section.dataset.theme || "light";
              document.body.dataset.theme = activeTheme;
              shadowNeedsUpdate = true;
            },
          });
        });

        const footer = document.querySelector("footer");
        if (footer) {
          gsap.fromTo(
            container,
            { opacity: 1 },
            {
              opacity: 0,
              ease: "none",
              immediateRender: false,
              scrollTrigger: {
                trigger: footer,
                start: "top 92%",
                end: "top 45%",
                scrub: true,
                onUpdate: (self) => {
                  isSceneVisible = self.progress < 0.99;
                },
              },
            }
          );
        }
      });
      ScrollTrigger.refresh();
      shadowNeedsUpdate = true;
    };

    build();

    const drag = {
      down: false,
      active: false,
      startX: 0,
      lastX: 0,
      spin: 0,
      vel: 0,
    };

    const onMove = (e: PointerEvent) => {
      SceneState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      SceneState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      if (drag.down) {
        if (!drag.active && Math.abs(e.clientX - drag.startX) > 5) {
          drag.active = true;
          document.body.classList.add("is-dragging");
        }
        if (drag.active) {
          const dx = e.clientX - drag.lastX;
          drag.spin += dx * 0.011;
          drag.vel = dx * 0.011;
          shadowNeedsUpdate = true;
        }
        drag.lastX = e.clientX;
      }
    };
    const onDown = (e: PointerEvent) => {
      if (reduce || e.pointerType !== "mouse" || e.button !== 0) return;
      if (e.clientX > window.innerWidth * 0.6 || isInteractive(e.target))
        return;
      if (SceneState.chapter === 4) return;
      drag.down = true;
      drag.active = false;
      drag.startX = drag.lastX = e.clientX;
      drag.vel = 0;
    };
    const onUp = () => {
      if (drag.active) {
        document.body.classList.remove("is-dragging");
        drag.spin =
          ((((drag.spin + Math.PI) % (Math.PI * 2)) + Math.PI * 2) %
            (Math.PI * 2)) -
          Math.PI;
        shadowNeedsUpdate = true;
      }
      drag.down = false;
      drag.active = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(build, 200);
      }
    };
    window.addEventListener("resize", onResize);

    // Page Visibility & Context Loss Handlers
    let isTabVisible = !document.hidden;
    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) shadowNeedsUpdate = true;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    let isContextLost = false;
    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
    };
    const onContextRestored = () => {
      isContextLost = false;
      build();
      shadowNeedsUpdate = true;
    };
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);

    const tilt = { x: 0, y: 0 };
    let lastScrollY = window.scrollY;
    let scrollVel = 0;
    let wanted: ModelName | null = null;
    let wantedSince = 0;
    let expBlend = 0;
    let frameCounter = 0;
    let lastPerfTime = performance.now();
    let fpsFrames = 0;

    const render = (time: number, deltaMs: number) => {
      // 1. Lifecycle: Sleep completely when tab is hidden, scene is transparent, or context is lost
      if (!isTabVisible || !isSceneVisible || isContextLost) return;

      const dt = Math.min(deltaMs, 50) / 1000;
      const damp = 1 - Math.pow(0.001, dt);

      // 2. Read scroll from SceneState / window without forcing DOM reflow
      const sy = SceneState.lenis ? SceneState.lenis.scroll : window.scrollY;
      const rawVel = dt > 0 ? (sy - lastScrollY) / dt : 0;
      lastScrollY = sy;
      scrollVel +=
        (THREE.MathUtils.clamp(rawVel, -3000, 3000) - scrollVel) * damp * 2.2;

      if (Math.abs(scrollVel) > 5) {
        shadowNeedsUpdate = true;
      }

      if (introPlayed) {
        const w = wantedModel();
        if (w !== wanted) {
          wanted = w;
          wantedSince = time;
        }
        if (wanted !== current && time - wantedSince > 0.08) {
          swapTo(wanted);
        }
      }

      if (!drag.active) {
        if (Math.abs(drag.vel) > 0.0001) {
          drag.spin += drag.vel;
          drag.vel *= Math.pow(0.04, dt);
          drag.spin *= Math.pow(0.28, dt);
          shadowNeedsUpdate = true;
        }
      }

      const roleAge = (performance.now() - SceneState.rolePulse) / 1000;
      const roleBoost =
        SceneState.rolePulse > 0 && roleAge < 0.7
          ? Math.sin((roleAge / 0.7) * Math.PI) * 0.12
          : 0;

      // Camera Choreography with smooth exponential damping
      const camDamp = reduce ? 1.0 : 1 - Math.pow(0.001, dt);
      const mouseParallaxX = reduce ? 0 : SceneState.mouseX * 0.22;
      const mouseParallaxY = reduce ? 0 : -SceneState.mouseY * 0.16;

      currentCamPos.x +=
        (pose.cx + mouseParallaxX - currentCamPos.x) * camDamp * 2.8;
      currentCamPos.y +=
        (pose.cy + mouseParallaxY - currentCamPos.y) * camDamp * 2.8;
      currentCamPos.z +=
        (pose.cz - currentCamPos.z) * camDamp * 2.8;

      currentCamTar.x +=
        (pose.tx + mouseParallaxX * 0.2 - currentCamTar.x) * camDamp * 2.8;
      currentCamTar.y +=
        (pose.ty + mouseParallaxY * 0.2 - currentCamTar.y) * camDamp * 2.8;
      currentCamTar.z +=
        (pose.tz - currentCamTar.z) * camDamp * 2.8;

      camera.position.copy(currentCamPos);
      camera.lookAt(currentCamTar);

      tilt.x += ((reduce ? 0 : SceneState.mouseY * 0.14) - tilt.x) * damp * 3;
      tilt.y += ((reduce ? 0 : SceneState.mouseX * 0.20) - tilt.y) * damp * 3;
      coinTilt.rotation.x = tilt.x + scrollVel * 0.00004;
      coinTilt.rotation.y =
        tilt.y +
        (reduce ? 0 : Math.sin(time * 0.35) * 0.08) +
        drag.spin +
        roleBoost * 2.5;

      const bob = reduce ? 0 : Math.sin(time * 0.9) * 0.045;
      coinRoot.position.set(pose.x, pose.y + bob, 0);
      coinRoot.scale.setScalar(Math.max(pose.s * (1 + roleBoost), 0.0001));
      coinRoot.rotation.set(pose.rx, pose.ry, pose.rz);

      key.position.set(pose.x + 5.2, pose.y + 7.8, 7.2);
      key.target.position.set(pose.x, pose.y, 0);

      rimTeal.position.set(pose.x - 7.5, pose.y + 3.8, -4.5);
      fillYellow.position.set(pose.x + 6.5, pose.y - 3.8, 3.8);

      const isExp = SceneState.chapter === 4;
      expBlend += ((isExp ? 1 : 0) - expBlend) * damp * 3;

      const shadowTarget = activeTheme === "light" && current && !isExp ? 0.18 : 0;
      shadowMat.opacity += (shadowTarget - shadowMat.opacity) * damp * 3;
      shadow.position.set(
        pose.x + 0.15 * pose.s,
        pose.y - 1.8 * pose.s + bob,
        -2.0
      );
      shadow.scale.set(4.0 * pose.s * 1.35, 1.6 * pose.s * 1.35, 1);

      experienceGroup.position.set(
        SceneState.mouseX * 0.5,
        -SceneState.mouseY * 0.35,
        -2.5
      );

      // Loop optimization: for loop instead of forEach allocation
      for (let idx = 0; idx < hexRings.length; idx++) {
        const ring = hexRings[idx];
        const mat = ring.material as THREE.MeshPhysicalMaterial;
        mat.opacity = expBlend * (0.75 - idx * 0.09);
        const dir = idx % 2 === 0 ? 1 : -1;
        ring.rotation.z = time * 0.22 * dir + idx * 0.5;
        ring.rotation.x =
          Math.sin(time * 0.4 + idx) * 0.35 + SceneState.mouseY * 0.25;
        ring.rotation.y =
          Math.cos(time * 0.35 + idx) * 0.35 + SceneState.mouseX * 0.25;
        const pulse = 1 + Math.sin(time * 1.4 + idx) * 0.06;
        ring.scale.setScalar(pulse * Math.max(0.001, expBlend));
      }

      const narrow = window.innerWidth < 900;
      for (let i = 0; i < TILE_COUNT; i++) {
        const d = tileData[i];
        const orbitAngle =
          d.angle + (reduce ? 0 : time * d.speed * 0.45) + sy * 0.0006;

        const r =
          d.ringRadius * cloudState.radiusFactor * Math.max(0.8, pose.s);
        let hx =
          pose.x +
          Math.cos(orbitAngle) * r * 1.05 +
          SceneState.mouseX * -0.15;
        const hy =
          pose.y +
          bob +
          Math.sin(orbitAngle) * r * 0.85 +
          (reduce ? 0 : Math.sin(time * d.speed + d.phase) * 0.12);
        const hz = d.zOffset * cloudState.radiusFactor;

        if (!narrow) {
          hx = Math.min(hx, -0.4);
        }

        const expAngle = d.angle + time * (0.35 + (i % 3) * 0.1);
        const expX = Math.cos(expAngle) * 2.4 - (narrow ? 0 : 1.2);
        const expY = Math.sin(expAngle) * 1.8;
        const expZ = -1.6 - (i % 3) * 0.8;

        tileDummy.position.set(
          THREE.MathUtils.lerp(hx, expX, expBlend),
          THREE.MathUtils.lerp(hy, expY, expBlend),
          THREE.MathUtils.lerp(hz, expZ, expBlend)
        );
        tileDummy.rotation.set(
          0.6 + (reduce ? 0 : Math.sin(time * d.speed + d.phase) * 0.55),
          (reduce ? 0 : time * d.spin) + scrollVel * 0.0005,
          d.phase * 0.35
        );

        const sMult =
          THREE.MathUtils.lerp(
            0.35 + 0.65 * cloudState.radiusFactor,
            1.45,
            expBlend
          ) * (introPlayed ? 1 : 0.0001);
        tileDummy.scale.setScalar(d.s * sMult);
        tileDummy.updateMatrix();
        tiles.setMatrixAt(i, tileDummy.matrix);
      }
      tiles.instanceMatrix.needsUpdate = true;

      // 3. Shadow Map Throttling: On-demand when motion occurs, or throttled every N frames during idle
      frameCounter++;
      if (
        quality.directionalShadows &&
        (shadowNeedsUpdate || frameCounter % quality.shadowUpdateInterval === 0)
      ) {
        renderer.shadowMap.needsUpdate = true;
        shadowNeedsUpdate = false;
      }

      renderer.render(scene, camera);

      // 4. Performance diagnostics (Exposed for measurement and verification)
      fpsFrames++;
      const now = performance.now();
      if (now - lastPerfTime >= 500) {
        const fps = Math.round((fpsFrames * 1000) / (now - lastPerfTime));
        const frameTimeMs = +(1000 / Math.max(fps, 1)).toFixed(2);
        window.__INOTEX_PERF__ = {
          fps,
          frameTimeMs,
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          geometries: renderer.info.memory.geometries,
          textures: renderer.info.memory.textures,
          tier: quality.tier,
          dpr: renderer.getPixelRatio(),
        };
        fpsFrames = 0;
        lastPerfTime = now;
      }
    };

    gsap.ticker.add(render);

    return () => {
      clearTimeout(resizeTimer);
      gsap.ticker.remove(render);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      timelines.forEach((t) => t.kill());

      // Explicit model geometry disposal without destroying active shared material cache prematurely
      holders.forEach(({ holder, model }) => {
        resetHolder({ holder, model });
        holder.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (mesh.isMesh && mesh.geometry) {
            mesh.geometry.dispose();
          }
        });
      });
      holders.clear();

      // Clear shared material cache upon full unmount
      clearSceneMaterialsCache();

      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("is-dragging");
      SceneState.hoverPillar = -1;
      SceneState.canvasHover = false;
      ctx?.revert();

      // Local scene mesh disposal
      hexRings.forEach((ring) => {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      });
      shardGeo.dispose();
      shardMat.dispose();
      shadowGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      scene.remove(hemi, key, rimTeal, fillYellow);

      renderer.dispose();
      renderer.forceContextLoss();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    readyRef.current = ready;
    if (ready) playIntroRef.current();
  }, [ready]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
};

export default InotexCanvas;
