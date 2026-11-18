// src/components/3d/InotexCanvas.tsx
"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SceneState, setChapter } from "@/lib/SceneState";
import { buildLegoModel, ModelName } from "../lego/models";
import { LegoModel } from "../lego/LegoBuilder";
import { ENTER, exitModel, resetHolder } from "../lego/transitions";

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
};

type Key = {
  nx: number;
  ny: number;
  s: number;
  rx: number;
  ry: number;
  rz: number;
};

// Balanced scale for refined 3D presence without overwhelming viewport or crowding text
const KEYS: Key[] = [
  { nx: -0.44, ny: -0.01, s: 1.08, rx: 0.28, ry: -0.42, rz: 0 }, // 0: Hero (3D INOTEX Logo)
  { nx: -0.44, ny: -0.03, s: 1.05, rx: 0.44, ry: 0.36, rz: 0 },  // 1: About (Quantum Computer)
  { nx: -0.44, ny: -0.02, s: 1.06, rx: 0.44, ry: -0.44, rz: 0 }, // 2: Ecosystem & Services
  { nx: -0.44, ny: -0.02, s: 1.03, rx: 0.44, ry: 0.4, rz: 0 },   // 3: Impact (3D Bar Chart)
  { nx: 0.0, ny: 0.0, s: 0.01, rx: 0.5, ry: 0.0, rz: 0 },        // 4: Experience (3D Vortex FX)
  { nx: -0.44, ny: -0.02, s: 1.06, rx: 0.44, ry: -0.48, rz: 0 }, // 5: Register (Welcome Arch)
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
  if (narrow) {
    x = 0;
    y = halfH * 0.42;
  }
  return {
    x,
    y,
    s: k.s * fit * (narrow ? 0.72 : 1),
    rx: k.rx,
    ry: k.ry,
    rz: k.rz,
  };
}

function softShadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.45, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function looseBrickGeometry() {
  const parts: THREE.BufferGeometry[] = [
    new RoundedBoxGeometry(1.96, 1.2, 1.96, 2, 0.06).toNonIndexed(),
  ];
  for (const sx of [-0.5, 0.5]) {
    for (const sz of [-0.5, 0.5]) {
      const st = new THREE.CylinderGeometry(0.3, 0.3, 0.17, 14).toNonIndexed();
      st.translate(sx, 0.685, sz);
      parts.push(st);
    }
  }
  parts.forEach((g) => {
    g.deleteAttribute("uv");
  });
  return mergeGeometries(parts, false)!;
}

const isInteractive = (t: EventTarget | null) =>
  !!(t as HTMLElement | null)?.closest?.(
    "a, button, input, textarea, select, label, figure, img, video, [data-cursor]"
  );

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

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.85;

    const FOV = 35;
    const CAM_Z = 12;
    const camera = new THREE.PerspectiveCamera(
      FOV,
      window.innerWidth / window.innerHeight,
      0.1,
      60
    );
    camera.position.set(0, 0, CAM_Z);
    const halfH = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z;

    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, {
      left: -5.2,
      right: 5.2,
      top: 5.2,
      bottom: -5.2,
      near: 1,
      far: 32,
    });
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.02;
    scene.add(key, key.target);

    const rimTeal = new THREE.DirectionalLight(TEAL, 1.1);
    rimTeal.position.set(-7, 3, -3);
    scene.add(rimTeal);

    const fillYellow = new THREE.DirectionalLight(YELLOW, 0.55);
    fillYellow.position.set(6, -5, 4);
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
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), shadowMat);
    shadow.position.z = -2.2;
    scene.add(shadow);

    const experienceGroup = new THREE.Group();
    scene.add(experienceGroup);

    const hexRings: THREE.Mesh[] = [];
    const ringColors = [BLUE, TEAL, YELLOW, 0x16337a, 0x00956e, 0xffb81d];
    ringColors.forEach((col, idx) => {
      const geo = new THREE.TorusGeometry(1.9 + idx * 0.95, 0.045, 8, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.z = (idx * Math.PI) / 6;
      experienceGroup.add(ring);
      hexRings.push(ring);
    });

    const narrowNow = window.innerWidth < 900;
    const TILE_COUNT = narrowNow ? 12 : 22;
    const tiles = new THREE.InstancedMesh(
      looseBrickGeometry(),
      new THREE.MeshPhysicalMaterial({
        roughness: 0.24,
        clearcoat: 0.78,
        clearcoatRoughness: 0.16,
      }),
      TILE_COUNT
    );
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

    const pose: Pose = {
      ...resolve(
        0,
        halfH * (window.innerWidth / window.innerHeight),
        halfH,
        false
      ),
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
                  scrub: 0.9,
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
              document.body.dataset.theme = section.dataset.theme || "light";
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
              },
            }
          );
        }
      });
      ScrollTrigger.refresh();
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

    const tilt = { x: 0, y: 0 };
    let lastScrollY = window.scrollY;
    let scrollVel = 0;
    let wanted: ModelName | null = null;
    let wantedSince = 0;
    let expBlend = 0;

    const render = (time: number, deltaMs: number) => {
      if (document.hidden) return;
      const dt = Math.min(deltaMs, 50) / 1000;
      const damp = 1 - Math.pow(0.001, dt);

      const sy = window.scrollY;
      const rawVel = dt > 0 ? (sy - lastScrollY) / dt : 0;
      lastScrollY = sy;
      scrollVel +=
        (THREE.MathUtils.clamp(rawVel, -3000, 3000) - scrollVel) * damp * 2.2;

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
        drag.spin += drag.vel;
        drag.vel *= Math.pow(0.04, dt);
        drag.spin *= Math.pow(0.28, dt);
      }

      const roleAge = (performance.now() - SceneState.rolePulse) / 1000;
      const roleBoost =
        SceneState.rolePulse > 0 && roleAge < 0.7
          ? Math.sin((roleAge / 0.7) * Math.PI) * 0.12
          : 0;

      tilt.x += ((reduce ? 0 : SceneState.mouseY * 0.18) - tilt.x) * damp * 3;
      tilt.y += ((reduce ? 0 : SceneState.mouseX * 0.26) - tilt.y) * damp * 3;
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

      key.position.set(pose.x + 5, pose.y + 8, 7);
      key.target.position.set(pose.x, pose.y, 0);

      const theme = document.body.dataset.theme;
      const isExp = SceneState.chapter === 4;
      expBlend += ((isExp ? 1 : 0) - expBlend) * damp * 3;

      const shadowTarget = theme === "light" && current && !isExp ? 0.15 : 0;
      shadowMat.opacity += (shadowTarget - shadowMat.opacity) * damp * 3;
      shadow.position.set(
        pose.x + 0.25 * pose.s,
        pose.y - 1.7 * pose.s + bob,
        -2.2
      );
      shadow.scale.set(3.8 * pose.s * 1.45, 1.65 * pose.s * 1.45, 1);

      experienceGroup.position.set(
        SceneState.mouseX * 0.5,
        -SceneState.mouseY * 0.35,
        -2.5
      );
      hexRings.forEach((ring, idx) => {
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = expBlend * (0.68 - idx * 0.08);
        const dir = idx % 2 === 0 ? 1 : -1;
        ring.rotation.z = time * 0.22 * dir + idx * 0.5;
        ring.rotation.x =
          Math.sin(time * 0.4 + idx) * 0.35 + SceneState.mouseY * 0.25;
        ring.rotation.y =
          Math.cos(time * 0.35 + idx) * 0.35 + SceneState.mouseX * 0.25;
        const pulse = 1 + Math.sin(time * 1.4 + idx) * 0.06;
        ring.scale.setScalar(pulse * Math.max(0.001, expBlend));
      });

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

      renderer.render(scene, camera);
    };
    gsap.ticker.add(render);

    return () => {
      clearTimeout(resizeTimer);
      gsap.ticker.remove(render);
      timelines.forEach((t) => t.kill());
      holders.forEach((h) => resetHolder(h));
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
      document.body.classList.remove("is-dragging");
      SceneState.hoverPillar = -1;
      SceneState.canvasHover = false;
      ctx?.revert();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      shadowTex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
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