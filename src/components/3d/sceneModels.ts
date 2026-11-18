// src/components/3d/SceneModels.ts
// Bespoke "scene sculptures" for every chapter except the hero.
// Same family as HeroLogoModel: clean PBR geometry, brand colours, glow accents.
// Lego bricks are used ONLY as a small accent element (stage, stools, caps, held bricks...).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { LegoModel } from "../lego/LegoBuilder";
import type { ModelName } from "../lego/models";

const K = {
  blue: 0x385dae,
  navy: 0x16337a,
  teal: 0x00956e,
  yellow: 0xffb81d,
  gray: 0x898b8e,
  silver: 0xb9bec7,
  light: 0xe9ecf1,
  white: 0xf7f8fb,
  dark: 0x2a2f37,
  skin: 0xf6c744,
  brown: 0x7a5232,
  glass: 0x8fd3f0,
  night: 0x0c1f3f,
  leaf: 0x2e9e58,
  warm: 0xffe39a,
} as const;

type V3 = [number, number, number];
type Kind = "solid" | "glass" | "glow" | "beam";
type Opt = { r?: V3; s?: V3; kind?: Kind };

const PI = Math.PI;
const F = 0.15; // floor top of every slab
const Y = new THREE.Vector3(0, 1, 0);

const mats = new Map<string, THREE.Material>();
function mat(c: number, kind: Kind = "solid") {
  const key = `${c}|${kind}`;
  let m = mats.get(key);
  if (m) return m;
  if (kind === "glass") {
    m = new THREE.MeshPhysicalMaterial({
      color: c,
      roughness: 0.08,
      metalness: 0.04,
      transparent: true,
      opacity: 0.52,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      ior: 1.5,
      reflectivity: 0.85,
      depthWrite: false,
    });
  } else if (kind === "glow") {
    m = new THREE.MeshStandardMaterial({
      color: c,
      emissive: c,
      emissiveIntensity: 1.15,
      roughness: 0.25,
      metalness: 0.06,
    });
  } else if (kind === "beam") {
    m = new THREE.MeshBasicMaterial({
      color: c,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  } else {
    m = new THREE.MeshPhysicalMaterial({
      color: c,
      roughness: 0.22,
      metalness: 0.08,
      clearcoat: 0.75,
      clearcoatRoughness: 0.14,
      reflectivity: 0.65,
      sheen: 0.25,
      sheenColor: new THREE.Color(c),
      sheenRoughness: 0.32,
    });
  }
  mats.set(key, m);
  return m;
}

/**
 * پاکسازی صریح کش متریال‌های اشتراکی در زمان Unmount شدن کامل Canvas
 * از بروز نشت حافظه و متریال‌های Dispose شده جلوگیری می‌کند.
 */
export function clearSceneMaterialsCache() {
  mats.forEach((m) => m.dispose());
  mats.clear();
}

const rnd = (i: number) => {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};
const face = (from: [number, number], to: [number, number]) =>
  Math.atan2(to[0] - from[0], to[1] - from[1]);

// ---------------------------------------------------------------------------
// Person
// ---------------------------------------------------------------------------
type Hold = {
  item: "cup" | "mic" | "card" | "paper" | "lens" | "brick" | "case";
  c?: number;
  hand?: 1 | -1;
};
interface PersonOpt {
  rot?: number;
  sit?: number; // seat height; undefined = standing
  hat?: number;
  legs?: number;
  arms?: [V3, V3]; // direction of arm on +x side, arm on -x side
  hold?: Hold;
}

class SB {
  layers: THREE.Group[] = [];
  private target!: THREE.Object3D;

  constructor() {
    this.layer();
  }

  layer() {
    const g = new THREE.Group();
    this.layers.push(g);
    this.target = g;
    return this;
  }

  put(geo: THREE.BufferGeometry, c: number, p: V3, o: Opt = {}) {
    const m = new THREE.Mesh(geo, mat(c, o.kind));
    m.position.set(...p);
    if (o.r) m.rotation.set(...o.r);
    if (o.s) m.scale.set(...o.s);
    const solid = !o.kind || o.kind === "solid";
    m.castShadow = solid;
    m.receiveShadow = solid;
    this.target.add(m);
    return m;
  }

  box(w: number, h: number, d: number, p: V3, c: number, o: Opt = {}) {
    const r = Math.min(0.06, w / 3, h / 3, d / 3);
    return this.put(new RoundedBoxGeometry(w, h, d, 2, r), c, p, o);
  }
  cyl(rt: number, rb: number, h: number, p: V3, c: number, o: Opt = {}, seg = 24) {
    return this.put(new THREE.CylinderGeometry(rt, rb, h, seg), c, p, o);
  }
  sph(r: number, p: V3, c: number, o: Opt = {}) {
    return this.put(new THREE.SphereGeometry(r, 24, 16), c, p, o);
  }
  tor(R: number, r: number, p: V3, c: number, o: Opt = {}, arc = PI * 2) {
    return this.put(new THREE.TorusGeometry(R, r, 10, 40, arc), c, p, o);
  }
  cone(r: number, h: number, p: V3, c: number, o: Opt = {}, open = false) {
    return this.put(new THREE.ConeGeometry(r, h, 32, 1, open), c, p, o);
  }
  cap(r: number, len: number, p: V3, c: number, o: Opt = {}) {
    return this.put(new THREE.CapsuleGeometry(r, len, 6, 14), c, p, o);
  }

  grp(p: V3, ry: number, fn: () => void) {
    const g = new THREE.Group();
    g.position.set(...p);
    g.rotation.y = ry;
    const prev = this.target;
    prev.add(g);
    this.target = g;
    fn();
    this.target = prev;
    return g;
  }

  /** Straight cylinder between two points */
  link(a: V3, b: V3, r: number, c: number, o: Opt = {}) {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const d = B.clone().sub(A);
    const len = d.length();
    const m = this.cyl(
      r,
      r,
      len,
      [(A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2],
      c,
      o,
      8
    );
    m.quaternion.setFromUnitVectors(Y, d.normalize());
    return m;
  }

  /** Glowing curved arrow */
  arrow(pts: V3[], r: number, c: number) {
    const curve = new THREE.CatmullRomCurve3(
      pts.map((p) => new THREE.Vector3(...p))
    );
    this.put(new THREE.TubeGeometry(curve, 80, r, 8, false), c, [0, 0, 0], {
      kind: "glow",
    });
    const end = curve.getPoint(1);
    const dir = curve.getTangent(1);
    const tip = end.clone().addScaledVector(dir, r * 3.5);
    const cn = this.cone(r * 3.2, r * 8, [tip.x, tip.y, tip.z], c, {
      kind: "glow",
    });
    cn.quaternion.setFromUnitVectors(Y, dir);
  }

  // ---- Lego accent pieces (p = centre of the body) ----
  lego(w: number, d: number, h: number, p: V3, c: number, o: Opt = {}) {
    const u = 0.5;
    this.box(w * u - 0.03, h, d * u - 0.03, p, c, o);
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < d; j++) {
        this.cyl(
          0.15,
          0.15,
          0.1,
          [
            p[0] + (i - (w - 1) / 2) * u,
            p[1] + h / 2 + 0.04,
            p[2] + (j - (d - 1) / 2) * u,
          ],
          c,
          o,
          14
        );
      }
    }
  }
  legoRound(r: number, h: number, p: V3, c: number) {
    this.cyl(r, r, h, p, c, {}, 28);
    this.cyl(0.16, 0.16, 0.1, [p[0], p[1] + h / 2 + 0.04, p[2]], c, {}, 14);
  }

  // ---- Figures ----
  person(p: V3, torso: number, o: PersonOpt = {}) {
    const sit = o.sit;
    const hipY = sit !== undefined ? sit + 0.28 : 0.8;
    const legC = o.legs ?? K.dark;
    this.grp(p, o.rot ?? 0, () => {
      for (const s of [-1, 1]) {
        if (sit !== undefined) {
          this.box(0.28, 0.28, 0.62, [s * 0.17, sit + 0.14, 0.3], legC);
          const sh = sit + 0.28;
          this.box(0.26, sh, 0.26, [s * 0.17, sh / 2, 0.58], legC);
          this.box(0.28, 0.12, 0.42, [s * 0.17, 0.06, 0.72], K.navy);
        } else {
          this.box(0.3, 0.8, 0.32, [s * 0.17, 0.4, 0], legC);
          this.box(0.3, 0.1, 0.5, [s * 0.17, 0.05, 0.08], K.navy);
        }
      }
      this.box(0.78, 0.84, 0.44, [0, hipY + 0.42, 0], torso);
      this.sph(0.3, [0, hipY + 1.15, 0], K.skin);
      this.sph(0.04, [-0.1, hipY + 1.18, 0.27], K.dark);
      this.sph(0.04, [0.1, hipY + 1.18, 0.27], K.dark);
      if (o.hat) {
        this.cyl(0.31, 0.33, 0.16, [0, hipY + 1.4, 0], o.hat);
      }

      const arms: [V3, V3] = o.arms ?? [
        [0.15, -1, 0],
        [-0.15, -1, 0],
      ];
      const hands: THREE.Vector3[] = [];
      [1, -1].forEach((s, i) => {
        const d = new THREE.Vector3(...arms[i]).normalize();
        const S = new THREE.Vector3(s * 0.5, hipY + 0.68, 0);
        const mid = S.clone().addScaledVector(d, 0.3);
        const m = this.cap(0.1, 0.42, [mid.x, mid.y, mid.z], torso);
        m.quaternion.setFromUnitVectors(Y, d);
        const H = S.clone().addScaledVector(d, 0.64);
        this.sph(0.11, [H.x, H.y, H.z], K.skin);
        hands.push(H);
      });

      const h = o.hold;
      if (!h) return;
      const H = hands[h.hand === -1 ? 1 : 0];
      const c = h.c ?? K.yellow;
      switch (h.item) {
        case "cup":
          this.cyl(0.14, 0.11, 0.28, [H.x, H.y + 0.08, H.z + 0.04], c);
          this.cyl(0.15, 0.15, 0.05, [H.x, H.y + 0.24, H.z + 0.04], K.white);
          break;
        case "mic":
          this.cyl(0.045, 0.045, 0.5, [H.x, H.y + 0.2, H.z], K.dark);
          this.sph(0.11, [H.x, H.y + 0.5, H.z], K.light);
          break;
        case "card":
          this.box(0.62, 0.5, 0.05, [H.x, H.y + 0.45, H.z], c);
          this.sph(0.1, [H.x, H.y + 0.45, H.z + 0.04], K.white, {
            kind: "glow",
          });
          break;
        case "paper":
          this.box(0.5, 0.66, 0.03, [H.x, H.y + 0.12, H.z + 0.06], K.white, {
            r: [-0.3, 0, 0],
          });
          this.box(0.34, 0.09, 0.035, [H.x, H.y + 0.28, H.z + 0.09], c, {
            r: [-0.3, 0, 0],
          });
          break;
        case "lens":
          this.tor(0.28, 0.045, [H.x, H.y + 0.4, H.z + 0.05], K.dark);
          this.cyl(0.26, 0.26, 0.03, [H.x, H.y + 0.4, H.z + 0.05], K.glass, {
            kind: "glass",
            r: [PI / 2, 0, 0],
          });
          this.cyl(0.04, 0.04, 0.25, [H.x, H.y + 0.1, H.z + 0.04], K.dark);
          break;
        case "brick":
          this.lego(2, 2, 0.38, [0, hipY + 1.0, 0.72], c);
          break;
        case "case":
          this.box(0.62, 0.46, 0.2, [H.x, H.y - 0.4, H.z], c);
          this.box(0.14, 0.1, 0.22, [H.x, H.y - 0.25, H.z], K.yellow);
          break;
      }
    });
  }

  build(fit: number, palette: number[]): LegoModel {
    const content = new THREE.Group();
    this.layers.forEach((l) => content.add(l));
    const box = new THREE.Box3().setFromObject(content);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    // Recentre so each layer's origin = model centre (needed for the assemble/disassemble transitions)
    this.layers.forEach((l) =>
      l.children.forEach((ch) => ch.position.sub(center))
    );
    const root = new THREE.Group();
    root.add(content);
    const maxDim = Math.max(size.x * 0.92, size.z * 0.92, size.y * 1.02);
    root.scale.setScalar(fit / Math.max(maxDim, 0.001));
    return { root, layers: this.layers, size, palette };
  }
}

const slab = (b: SB, w: number, d: number, c: number = K.light) => {
  b.box(w, 0.3, d, [0, 0, 0], c);
  b.box(w * 1.025, 0.08, d * 1.025, [0, -0.19, 0], K.navy);
};
const disc = (b: SB, r: number, c: number = K.light) => {
  b.cyl(r, r, 0.3, [0, 0, 0], c, {}, 56);
  b.cyl(r * 1.025, r * 1.025, 0.08, [0, -0.19, 0], K.navy, {}, 56);
};

// ---------------------------------------------------------------------------
// ABOUT ("meeting"): technological development — ascending steps
//   Lego bricks -> gear -> chip -> atom, with a rising glowing growth arrow
// ---------------------------------------------------------------------------
function gear(b: SB, p: V3, R: number, c: number) {
  b.grp(p, 0, () => {
    b.cyl(R, R, 0.3, [0, 0, 0], c, { r: [PI / 2, 0, 0] }, 40);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * PI * 2;
      b.box(0.26, 0.28, 0.3, [Math.cos(a) * (R + 0.1), Math.sin(a) * (R + 0.1), 0], c, {
        r: [0, 0, a],
      });
    }
    b.cyl(R * 0.36, R * 0.36, 0.34, [0, 0, 0], K.dark, { r: [PI / 2, 0, 0] }, 24);
  });
}
function chip(b: SB, p: V3, c: number) {
  b.grp(p, 0, () => {
    b.box(1.3, 1.3, 0.18, [0, 0, 0], K.dark);
    b.box(0.7, 0.7, 0.22, [0, 0, 0.02], c, { kind: "glow" });
    for (let k = 0; k < 5; k++) {
      const t = -0.5 + k * 0.25;
      b.box(0.1, 0.2, 0.08, [t, 0.72, 0], K.silver);
      b.box(0.1, 0.2, 0.08, [t, -0.72, 0], K.silver);
      b.box(0.2, 0.1, 0.08, [0.72, t, 0], K.silver);
      b.box(0.2, 0.1, 0.08, [-0.72, t, 0], K.silver);
    }
  });
}
function atom(b: SB, p: V3) {
  b.grp(p, 0, () => {
    b.sph(0.24, [0, 0, 0], K.yellow, { kind: "glow" });
    const rots: V3[] = [
      [PI / 2, 0, 0],
      [PI / 2, 0, PI / 3],
      [PI / 2, 0, -PI / 3],
    ];
    const cols = [K.blue, K.teal, K.navy];
    rots.forEach((r, i) => {
      b.tor(0.85, 0.035, [0, 0, 0], cols[i], { r }, PI * 2);
    });
    b.sph(0.09, [0.85, 0, 0], K.teal, { kind: "glow" });
    b.sph(0.09, [-0.42, 0.7, 0.2], K.blue, { kind: "glow" });
    b.sph(0.09, [-0.42, -0.7, -0.2], K.yellow, { kind: "glow" });
  });
}

function about(b: SB) {
  slab(b, 9.8, 4.6);
  const hs = [0.7, 1.4, 2.1, 2.8];
  const xs = [-3.0, -1.0, 1.0, 3.0];
  const cs = [K.gray, K.blue, K.teal, K.navy];
  hs.forEach((h, i) => {
    b.layer();
    b.box(1.9, h, 2.6, [xs[i], F + h / 2, 0], cs[i]);
  });
  b.layer();
  // 1) building blocks (the only lego element)
  b.lego(4, 2, 0.5, [xs[0], F + hs[0] + 0.25, 0], K.yellow);
  b.lego(2, 2, 0.5, [xs[0] - 0.25, F + hs[0] + 0.79, 0], K.blue);
  b.layer();
  gear(b, [xs[1], F + hs[1] + 0.95, 0], 0.62, K.yellow);
  b.layer();
  chip(b, [xs[2], F + hs[2] + 1.0, 0], K.yellow);
  b.layer();
  atom(b, [xs[3], F + hs[3] + 1.25, 0]);
  b.layer();
  b.arrow(
    [
      [-3.8, F + 1.6, 1.8],
      [-1.6, F + 2.5, 1.8],
      [0.8, F + 3.7, 1.8],
      [3.0, F + 5.3, 1.8],
      [4.3, F + 6.3, 1.8],
    ],
    0.07,
    K.yellow
  );
}

// ---------------------------------------------------------------------------
// ECOSYSTEM: 3-tier pyramid + interlocking chain ring + connected nodes
// ---------------------------------------------------------------------------
function ecosystem(b: SB) {
  disc(b, 4.6);
  const tiers: [number, number][] = [
    [4.2, K.teal],
    [2.9, K.blue],
    [1.6, K.navy],
  ];
  tiers.forEach(([w, c], i) => {
    b.layer();
    b.box(w, 0.6, w, [0, F + 0.3 + i * 0.6, 0], c);
  });
  b.layer();
  b.lego(2, 2, 0.4, [0, F + 1.8 + 0.2, 0], K.yellow);
  b.sph(0.26, [0, F + 2.5, 0], K.yellow, { kind: "glow" });

  const R = 3.3;
  const cols = [K.teal, K.blue, K.yellow, K.navy, K.teal, K.blue];
  const nodes: V3[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k * PI) / 3 + PI / 6;
    nodes.push([Math.cos(a) * R, F + 0.5, Math.sin(a) * R]);
  }
  b.layer();
  nodes.forEach((n, k) => {
    b.sph(0.36, n, cols[k]);
    b.tor(0.55, 0.035, [n[0], F + 0.04, n[2]], cols[k], { r: [PI / 2, 0, 0] });
  });
  b.layer();
  for (let k = 0; k < 6; k++) {
    const A = nodes[k];
    const B = nodes[(k + 1) % 6];
    const ang = Math.atan2(-(B[2] - A[2]), B[0] - A[0]);
    for (let j = 0; j < 4; j++) {
      const t = 0.2 + j * 0.2;
      const pos: V3 = [
        A[0] + (B[0] - A[0]) * t,
        A[1],
        A[2] + (B[2] - A[2]) * t,
      ];
      b.grp(pos, ang, () => {
        b.tor(0.17, 0.045, [0, 0, 0], K.silver, {
          r: [j % 2 ? PI / 2 : 0, 0, 0],
          s: [1.5, 1, 1],
        });
      });
    }
  }
  b.layer();
  nodes.forEach((n) => b.link(n, [0, F + 2.5, 0], 0.022, K.teal, { kind: "glow" }));
}

// ---------------------------------------------------------------------------
// STAGE: keynote — lego stage, screen with chart, speaker at podium, audience
// ---------------------------------------------------------------------------
function stage(b: SB) {
  slab(b, 9.6, 8.4);
  b.layer();
  b.lego(14, 7, 0.5, [0, F + 0.25, -1.6], K.blue);
  b.layer();
  b.box(5.6, 2.9, 0.14, [0, F + 0.5 + 1.95, -3.2], K.navy);
  [0.9, 1.5, 2.1, 1.7].forEach((h, i) =>
    b.box(0.45, h * 0.7, 0.06, [-1.1 + i * 0.75, F + 0.5 + 0.75 + (h * 0.7) / 2, -3.1], [K.teal, K.yellow, K.glass, K.yellow][i], { kind: "glow" })
  );
  b.box(0.9, 3.8, 0.5, [-3.3, F + 0.5 + 1.9, -2.9], K.teal);
  b.box(0.9, 3.8, 0.5, [3.3, F + 0.5 + 1.9, -2.9], K.teal);
  b.layer();
  b.person([0, F + 0.5, -2.0], K.teal, {
    rot: 0,
    arms: [
      [0.9, 0.7, 0.3],
      [-0.2, -1, 0.1],
    ],
    hold: { item: "mic", hand: 1 },
  });
  b.box(1.0, 1.15, 0.6, [0, F + 0.5 + 0.58, -1.3], K.yellow);
  b.cone(1.6, 5.2, [0, F + 0.5 + 2.6, -1.8], K.warm, { kind: "beam" });
  // audience (seen from behind)
  const rows: [number, number[]][] = [
    [1.9, [-2.4, -0.8, 0.8, 2.4]],
    [3.4, [-1.6, 0, 1.6]],
  ];
  const cols = [K.blue, K.yellow, K.teal, K.navy];
  rows.forEach(([z, xsr], ri) => {
    b.layer();
    xsr.forEach((x, i) => {
      b.box(0.95, 0.12, 0.95, [x, F + 0.44, z + 0.05], K.gray);
      b.box(0.95, 0.9, 0.1, [x, F + 0.9, z + 0.52], K.gray);
      b.person([x, F, z], cols[(i + ri) % 4], {
        rot: PI,
        sit: 0.5,
        arms: i === 1 && ri === 0 ? [[0.3, 1, 0.1], [-0.2, -0.3, 0.9]] : undefined,
      });
    });
  });
}

// ---------------------------------------------------------------------------
// CAFÉ: two people sitting on lego stools, holding coffee cups
// ---------------------------------------------------------------------------
function cafe(b: SB) {
  slab(b, 8.4, 5.4);
  b.layer();
  b.cyl(0.55, 0.55, 0.08, [0, F + 0.04, 0], K.navy, {}, 32);
  b.cyl(0.1, 0.1, 1.05, [0, F + 0.55, 0], K.navy);
  b.cyl(1.2, 1.2, 0.1, [0, F + 1.1, 0], K.yellow, {}, 48);
  b.layer();
  const seat = 0.6;
  for (const s of [-1, 1]) {
    b.legoRound(0.5, seat, [s * 1.65, F + seat / 2, 0], s < 0 ? K.teal : K.blue);
  }
  b.layer();
  b.person([-1.65, F, 0], K.blue, {
    rot: PI / 2,
    sit: seat,
    hat: K.navy,
    arms: [
      [-0.2, -0.1, 1],
      [0.2, -0.45, 0.9],
    ],
    hold: { item: "cup", c: K.yellow, hand: 1 },
  });
  b.person([1.65, F, 0], K.teal, {
    rot: -PI / 2,
    sit: seat,
    arms: [
      [-0.2, -0.45, 0.9],
      [0.2, -0.1, 1],
    ],
    hold: { item: "cup", c: K.teal, hand: -1 },
  });
  b.layer();
  b.cyl(0.03, 0.03, 1.4, [0, 4.6, 0], K.dark);
  b.cone(0.7, 0.5, [0, 3.75, 0], K.yellow);
  b.sph(0.17, [0, 3.45, 0], K.warm, { kind: "glow" });
  b.cone(1.5, 2.3, [0, 2.3, 0], K.warm, { kind: "beam" });
  b.layer();
  // plant
  b.cyl(0.32, 0.25, 0.5, [-3.5, F + 0.25, -1.6], K.brown);
  [0.3, 0.55, 0.8].forEach((y, i) =>
    b.sph(0.38 - i * 0.07, [-3.5 + (i - 1) * 0.12, F + 0.55 + y * 0.6, -1.6], K.leaf)
  );
  b.cyl(0.32, 0.25, 0.5, [3.5, F + 0.25, -1.6], K.brown);
  [0.3, 0.55, 0.8].forEach((y, i) =>
    b.sph(0.38 - i * 0.07, [3.5 + (i - 1) * 0.12, F + 0.55 + y * 0.6, -1.6], K.leaf)
  );
}

// ---------------------------------------------------------------------------
// PITCH: audition — presenter on a lego stage in a spotlight with an idea bulb,
//        three judges holding up score paddles
// ---------------------------------------------------------------------------
function pitch(b: SB) {
  slab(b, 10, 6.6);
  b.layer();
  b.lego(7, 7, 0.4, [-2.6, F + 0.2, 0], K.teal);
  b.layer();
  b.person([-2.6, F + 0.4, 0], K.yellow, {
    rot: PI / 2,
    arms: [
      [0.3, 0.9, 0.5],
      [-0.2, -1, 0],
    ],
    hold: { item: "mic", hand: 1 },
  });
  b.cone(1.5, 5.4, [-2.6, F + 0.4 + 2.7, 0], K.warm, { kind: "beam" });
  b.layer();
  // idea bulb
  b.sph(0.42, [-2.6, 4.7, 0], K.yellow, { kind: "glow" });
  b.cyl(0.22, 0.2, 0.3, [-2.6, 4.15, 0], K.silver);
  b.cyl(0.18, 0.18, 0.12, [-2.6, 3.92, 0], K.dark);
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * PI * 2;
    b.link(
      [-2.6 + Math.cos(a) * 0.62, 4.7 + Math.sin(a) * 0.62, 0],
      [-2.6 + Math.cos(a) * 0.85, 4.7 + Math.sin(a) * 0.85, 0],
      0.03,
      K.yellow,
      { kind: "glow" }
    );
  }
  b.layer();
  // judges table + judges
  b.box(1.0, 0.12, 5.2, [2.5, F + 1.1, 0], K.navy);
  b.box(0.9, 1.1, 0.12, [2.5, F + 0.55, -2.3], K.navy);
  b.box(0.9, 1.1, 0.12, [2.5, F + 0.55, 2.3], K.navy);
  const jz = [-1.7, 0, 1.7];
  const jc = [K.blue, K.teal, K.yellow];
  const pc = [K.yellow, K.teal, K.blue];
  jz.forEach((z, i) => {
    b.layer();
    b.box(0.9, 0.12, 0.9, [3.6, F + 0.44, z], K.gray);
    b.person([3.6, F, z], jc[i], {
      rot: -PI / 2,
      sit: 0.5,
      arms: [
        [-0.3, 0.9, 0.5],
        [-0.2, -0.6, 0.6],
      ],
      hold: { item: "card", c: pc[i], hand: 1 },
    });
  });
}

// ---------------------------------------------------------------------------
// REVERSE PITCH: company shows the missing piece it needs, helpers bring bricks
// ---------------------------------------------------------------------------
function reverse(b: SB) {
  slab(b, 10.2, 6.4);
  b.layer();
  b.box(2.2, 4.2, 1.8, [-3.4, F + 2.1, -1.4], K.navy);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 2; col++) {
      const on = (row + col * 2) % 3 !== 0;
      b.box(0.5, 0.4, 0.06, [-3.4 + (col - 0.5) * 0.85, F + 0.7 + row * 0.75, -1.4 + 0.93], on ? K.yellow : K.blue, {
        kind: on ? "glow" : "solid",
      });
    }
  }
  b.layer();
  // speech bubble with the missing lego slot
  b.box(3.0, 1.6, 0.25, [-1.5, F + 5.0, 0], K.white);
  b.cone(0.3, 0.75, [-2.3, F + 4.0, 0], K.white, { r: [PI, 0, 0] });
  b.box(1.5, 0.55, 0.06, [-1.5, F + 5.0, 0.14], K.dark);
  b.lego(4, 2, 0.5, [-1.5, F + 5.0, 0.3], K.yellow, { kind: "glass" });
  b.layer();
  b.person([-2.3, F, 1.5], K.yellow, {
    rot: face([-2.3, 1.5], [0.5, 2.5]),
    hat: K.teal,
    arms: [
      [0, 1, 0.3],
      [-0.2, -1, 0.1],
    ],
    hold: { item: "mic", hand: 1 },
  });
  const helpers: { p: [number, number]; c: number; b: number }[] = [
    { p: [1.2, 2.0], c: K.teal, b: K.yellow },
    { p: [3.0, 0.4], c: K.blue, b: K.teal },
    { p: [3.9, 2.4], c: K.navy, b: K.blue },
  ];
  helpers.forEach((h) => {
    b.layer();
    b.person([h.p[0], F, h.p[1]], h.c, {
      rot: face(h.p, [-2.3, 1.2]),
      arms: [
        [0.15, 0.4, 1],
        [-0.15, 0.4, 1],
      ],
      hold: { item: "brick", c: h.b },
    });
  });
  b.layer();
  b.arrow(
    [
      [1.1, F + 3.3, 1.8],
      [0.3, F + 4.7, 1.2],
      [-0.5, F + 5.1, 0.5],
    ],
    0.045,
    K.teal
  );
  b.arrow(
    [
      [3.0, F + 3.1, 0.4],
      [1.4, F + 5.2, 0.2],
      [-0.3, F + 5.5, 0.3],
    ],
    0.04,
    K.yellow
  );
}

// ---------------------------------------------------------------------------
// NIGHT: networking — people around a glowing network globe, connected nodes
// ---------------------------------------------------------------------------
function night(b: SB) {
  disc(b, 4.4, K.night);
  b.tor(4.35, 0.04, [0, F, 0], K.teal, { r: [PI / 2, 0, 0], kind: "glow" });
  b.layer();
  const N = 6;
  const R = 2.5;
  const cols = [K.blue, K.yellow, K.teal, K.blue, K.yellow, K.teal];
  const armSets: [V3, V3][] = [
    [[0.9, 0.6, 0.3], [-0.15, -1, 0.1]],
    [[0.2, -0.2, 1], [-0.15, -1, 0]],
    [[0.3, 0.1, 1], [-0.3, 0.1, 1]],
    [[0.2, -0.2, 1], [-0.15, -1, 0]],
    [[0.15, -1, 0], [-0.9, 0.6, 0.3]],
    [[0.3, 0.1, 1], [-0.3, 0.1, 1]],
  ];
  const heads: V3[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * PI * 2 + 0.3;
    const x = Math.cos(a) * R;
    const z = Math.sin(a) * R;
    heads.push([x, F + 2.9, z]);
    b.layer();
    b.person([x, F, z], cols[i], {
      rot: face([x, z], [0, 0]),
      arms: armSets[i],
      hat: i % 3 === 1 ? K.navy : undefined,
      hold: i === 1 || i === 3 ? { item: "cup", c: K.yellow, hand: 1 } : undefined,
    });
  }
  b.layer();
  // network graph above heads
  heads.forEach((h, i) => {
    b.sph(0.13, h, i % 2 ? K.yellow : K.teal, { kind: "glow" });
    b.link(h, heads[(i + 1) % N], 0.025, K.teal, { kind: "glow" });
    b.link(h, heads[(i + 2) % N], 0.015, K.blue, { kind: "glow" });
  });
  // central globe
  b.layer();
  const globe = b.put(new THREE.IcosahedronGeometry(0.95, 1), K.teal, [0, F + 3.9, 0], { kind: "glow" });
  globe.castShadow = false;
  globe.material = new THREE.MeshStandardMaterial({
    color: K.teal,
    wireframe: true,
    roughness: 0.2,
    metalness: 0.6,
  });
  b.sph(0.32, [0, F + 3.9, 0], K.yellow, { kind: "glow" });
  [0, 2, 4].forEach((i) => b.link(heads[i], [0, F + 3.9, 0], 0.02, K.yellow, { kind: "glow" }));
  // lego lounge cubes + stars
  b.layer();
  b.lego(2, 2, 0.5, [-1.0, F + 0.25, 1.1], K.yellow);
  b.lego(2, 2, 0.5, [1.1, F + 0.25, -1.0], K.blue);
  for (let i = 0; i < 12; i++) {
    b.sph(0.05 + rnd(i) * 0.04, [(rnd(i + 3) - 0.5) * 8, 4.6 + rnd(i + 9) * 1.8, (rnd(i + 5) - 0.5) * 4], K.warm, { kind: "glow" });
  }
}

// ---------------------------------------------------------------------------
// JOBS: job board with listing cards, briefcase on a lego plinth,
//       job seekers with resume / magnifier
// ---------------------------------------------------------------------------
function jobs(b: SB) {
  slab(b, 10, 6);
  b.layer();
  b.cyl(0.07, 0.07, 1.0, [-2.4, F + 0.5, -1.8], K.dark);
  b.cyl(0.07, 0.07, 1.0, [2.4, F + 0.5, -1.8], K.dark);
  b.box(5.8, 3.6, 0.2, [0, F + 2.8, -1.8], K.navy);
  const cardX = [-1.85, 0, 1.85];
  const cardY = [F + 3.6, F + 2.0];
  const hdr = [K.teal, K.yellow, K.blue, K.blue, K.teal, K.yellow];
  cardY.forEach((y, r) => {
    cardX.forEach((x, c) => {
      b.layer();
      const hi = r === 0 && c === 1;
      b.box(1.5, 1.2, 0.08, [x, y, -1.66], hi ? K.warm : K.light);
      b.box(1.5, 0.22, 0.1, [x, y + 0.49, -1.64], hdr[r * 3 + c]);
      b.sph(0.2, [x - 0.4, y - 0.05, -1.58], K.skin);
      b.box(0.55, 0.07, 0.09, [x + 0.3, y - 0.0, -1.58], K.gray);
      b.box(0.55, 0.07, 0.09, [x + 0.3, y - 0.2, -1.58], K.silver);
      if (hi) b.sph(0.17, [x + 0.55, y - 0.42, -1.55], K.teal, { kind: "glow" });
    });
  });
  b.layer();
  b.lego(10, 6, 0.5, [0, F + 0.25, 1.0], K.yellow);
  b.box(2.3, 1.4, 1.0, [0, F + 0.5 + 0.75, 1.0], K.brown);
  b.box(2.35, 0.12, 1.05, [0, F + 0.5 + 0.8, 1.0], K.dark);
  b.box(0.34, 0.28, 0.1, [0, F + 0.5 + 0.8, 1.55], K.yellow);
  b.tor(0.42, 0.06, [0, F + 0.5 + 1.45, 1.0], K.dark, {}, PI);
  b.layer();
  b.person([-3.5, F, 1.6], K.teal, {
    rot: face([-3.5, 1.6], [0, 1.2]),
    arms: [
      [0.2, 0.5, 1],
      [-0.15, -1, 0],
    ],
    hold: { item: "lens", hand: 1 },
  });
  b.layer();
  b.person([3.3, F, 1.8], K.blue, {
    rot: face([3.3, 1.8], [0, 1.2]),
    arms: [
      [0.2, 0.5, 1],
      [-0.15, -1, 0],
    ],
    hold: { item: "paper", c: K.teal, hand: 1 },
    hat: K.yellow,
  });
  b.layer();
  b.person([4.2, F, 0.2], K.yellow, {
    rot: face([4.2, 0.2], [0, 0.5]),
    arms: [
      [0.4, 1, 0.2],
      [-0.15, -1, 0],
    ],
  });
}

// ---------------------------------------------------------------------------
// IMPACT ("growth"): 3D bar chart + glowing trend line + arrow, lego caps
// ---------------------------------------------------------------------------
function growth(b: SB) {
  slab(b, 9.6, 4.6);
  b.layer();
  b.box(8.4, 5.0, 0.1, [0, F + 2.6, -1.9], K.glass, { kind: "glass" });
  for (let k = 1; k <= 4; k++) {
    b.box(8.0, 0.03, 0.12, [0, F + k * 1.0, -1.85], K.white);
  }
  b.box(0.14, 4.8, 0.22, [-4.1, F + 2.4, -1.6], K.navy);
  b.box(8.4, 0.14, 0.22, [0, F + 0.07, -1.6], K.navy);
  const hs = [1.0, 1.8, 2.5, 3.3, 4.2];
  const xs = [-3.0, -1.5, 0, 1.5, 3.0];
  const cs = [K.gray, K.blue, K.teal, K.navy, K.blue];
  const tops: V3[] = [];
  hs.forEach((h, i) => {
    b.layer();
    b.box(1.0, h, 1.0, [xs[i], F + h / 2, -0.4], cs[i]);
    b.lego(2, 2, 0.16, [xs[i], F + h + 0.08, -0.4], i === 4 ? K.yellow : K.light);
    tops.push([xs[i], F + h + 0.8, -0.4]);
  });
  b.layer();
  const pts: V3[] = [...tops, [4.1, tops[4][1] + 0.7, -0.4]];
  b.arrow(pts, 0.06, K.yellow);
  tops.forEach((t) => b.sph(0.14, t, K.yellow, { kind: "glow" }));
}

// ---------------------------------------------------------------------------
// GATE ("register"): open door arch with warm light, red-carpet invitation,
//                    host welcoming guests, floating invitation envelope
// ---------------------------------------------------------------------------
function gate(b: SB) {
  slab(b, 8.6, 8);
  b.layer();
  const zD = -2.2;
  // glowing interior
  b.box(2.7, 3.6, 0.05, [0, F + 1.8, zD - 0.3], K.warm, { kind: "glow" });
  const half = b.put(new THREE.CircleGeometry(1.35, 40, 0, PI), K.warm, [0, F + 3.6, zD - 0.27], {
    kind: "glow",
  });
  half.castShadow = false;
  b.layer();
  b.box(0.6, 3.6, 0.7, [-1.5, F + 1.8, zD], K.navy);
  b.box(0.6, 3.6, 0.7, [1.5, F + 1.8, zD], K.navy);
  b.tor(1.5, 0.3, [0, F + 3.6, zD], K.navy, {}, PI);
  b.layer();
  b.lego(4, 2, 0.5, [0, F + 3.6 + 1.5 + 0.38, zD], K.yellow);
  b.layer();
  // open door leaf
  b.grp([-1.2, F, zD + 0.3], -1.1, () => {
    b.box(1.25, 3.4, 0.1, [0.62, 1.7, 0], K.teal);
    b.sph(0.08, [1.0, 1.6, 0.1], K.yellow);
  });
  b.layer();
  // carpet
  b.box(1.8, 0.05, 6.2, [0, F + 0.03, zD + 3.4], K.navy);
  b.box(0.08, 0.06, 6.2, [-0.86, F + 0.04, zD + 3.4], K.yellow);
  b.box(0.08, 0.06, 6.2, [0.86, F + 0.04, zD + 3.4], K.yellow);
  b.layer();
  b.person([2.4, F, 0.9], K.teal, {
    rot: face([2.4, 0.9], [0, zD]),
    hat: K.yellow,
    arms: [
      [-0.2, 0.2, 1],
      [-0.9, 0.3, 0.5],
    ],
  });
  b.layer();
  b.person([0.3, F + 0.05, 1.8], K.blue, {
    rot: PI,
    arms: [
      [0.2, 0.1, 1],
      [-0.2, -1, 0],
    ],
    hold: { item: "case", c: K.yellow, hand: 1 },
  });
  b.person([-0.4, F + 0.05, 3.4], K.yellow, {
    rot: PI,
    hat: K.navy,
    arms: [
      [0.2, 0.5, 1],
      [-0.2, -1, 0],
    ],
    hold: { item: "card", c: K.teal, hand: 1 },
  });
  b.layer();
  // floating invitation envelope
  b.grp([1.4, F + 3.6, 0.2], -0.35, () => {
    b.box(1.0, 0.68, 0.08, [0, 0, 0], K.white);
    const sh = new THREE.Shape();
    sh.moveTo(-0.5, 0.34);
    sh.lineTo(0.5, 0.34);
    sh.lineTo(0, -0.1);
    sh.closePath();
    b.put(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false }), K.light, [0, 0, 0.04]);
    b.sph(0.1, [0, -0.08, 0.1], K.yellow, { kind: "glow" });
  });
  // confetti
  const cc = [K.yellow, K.teal, K.blue, K.navy];
  for (let i = 0; i < 16; i++) {
    b.box(0.1, 0.1, 0.03, [(rnd(i) - 0.5) * 5, 2 + rnd(i + 7) * 4, -1.5 + rnd(i + 2) * 3], cc[i % 4], {
      r: [rnd(i + 1) * 3, rnd(i + 4) * 3, rnd(i + 8) * 3],
    });
  }
}

function expo(b: SB) {
  b.sph(0.01, [0, 0, 0], K.blue);
}

const BUILDERS: Record<ModelName, ((b: SB) => void) | null> = {
  hall: null,
  meeting: about,
  ecosystem,
  stage,
  cafe,
  pitch,
  reverse,
  night,
  jobs,
  growth,
  expo,
  gate,
};

const PALETTES: Partial<Record<ModelName, number[]>> = {
  meeting: [K.blue, K.teal, K.yellow, K.navy, K.gray],
  ecosystem: [K.teal, K.blue, K.yellow, K.navy, K.silver],
  stage: [K.blue, K.yellow, K.teal, K.navy],
  cafe: [K.yellow, K.teal, K.blue, K.navy],
  pitch: [K.teal, K.yellow, K.blue, K.navy],
  reverse: [K.yellow, K.teal, K.blue, K.navy],
  night: [K.teal, K.yellow, K.blue, K.navy],
  jobs: [K.yellow, K.blue, K.teal, K.navy],
  growth: [K.blue, K.teal, K.yellow, K.navy, K.gray],
  gate: [K.yellow, K.teal, K.blue, K.navy],
};

export function buildSceneModel(name: ModelName, fit = 4.15): LegoModel {
  const b = new SB();
  const fn = BUILDERS[name] ?? expo;
  fn(b);
  return b.build(fit, PALETTES[name] ?? [K.blue, K.teal, K.yellow, K.navy, K.gray]);
}