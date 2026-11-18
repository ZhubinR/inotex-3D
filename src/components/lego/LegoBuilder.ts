// src/components/lego/LegoBuilder.ts
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

export const PLATE = 0.4;
const STUD_R = 0.31;
const STUD_H = 0.19;

// Black & white are intentionally excluded/remapped to cohesive brand tones
export const LEGO_COLORS = {
  blue: 0x385dae,
  navy: 0x16337a,
  teal: 0x00956e,
  yellow: 0xffb81d,
  gray: 0x898b8e,
  light: 0xc9cbcd,
  dark: 0x2a2f37,
  brown: 0x7a5232,
  leaf: 0x2e9e58,
  face: 0xf6c744,
  glass: 0x8fd3f0,
  night: 0x0c1f3f,
} as const;

export type LegoColor = keyof typeof LEGO_COLORS;

type Piece = {
  kind: "box" | "round";
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: LegoColor;
  studs: boolean;
  layer: number;
};

type Part = { geo: THREE.BufferGeometry; color: LegoColor; layer: number };

export type LegoModel = {
  root: THREE.Group;
  layers: THREE.Group[];
  size: THREE.Vector3;
  /** Hex colors of the bricks in this model, used when its bricks float into the background cloud */
  palette: number[];
};

export interface FigOptions {
  rot?: number;
  hat?: LegoColor;
  arms?: boolean;
  leftArm?: number;
  rightArm?: number;
  sitting?: boolean;
  cup?: LegoColor;
  mic?: boolean;
  card?: LegoColor;
  briefcase?: LegoColor;
  brickHeld?: LegoColor;
}

const matCache = new Map<LegoColor, THREE.Material>();
function material(c: LegoColor) {
  let m = matCache.get(c);
  if (!m) {
    m =
      c === "glass"
        ? new THREE.MeshPhysicalMaterial({
            color: LEGO_COLORS[c],
            roughness: 0.08,
            metalness: 0,
            transparent: true,
            opacity: 0.64,
            clearcoat: 1,
          })
        : new THREE.MeshPhysicalMaterial({
            color: LEGO_COLORS[c],
            roughness: 0.24,
            metalness: 0.03,
            clearcoat: 0.8,
            clearcoatRoughness: 0.15,
          });
    matCache.set(c, m);
  }
  return m;
}

const boxCache = new Map<string, THREE.BufferGeometry>();
function boxGeo(w: number, h: number, d: number) {
  const k = `${w.toFixed(3)}|${h.toFixed(3)}|${d.toFixed(3)}`;
  let g = boxCache.get(k);
  if (!g) {
    const r = Math.min(0.055, w / 3, h / 3, d / 3);
    g = new RoundedBoxGeometry(w, h, d, 2, r).toNonIndexed();
    boxCache.set(k, g);
  }
  return g.clone();
}

let studGeoCache: THREE.BufferGeometry | null = null;
function studGeo() {
  if (!studGeoCache) {
    const g = new THREE.CylinderGeometry(STUD_R, STUD_R, STUD_H, 16, 1);
    g.translate(0, STUD_H / 2, 0);
    studGeoCache = g.toNonIndexed();
  }
  return studGeoCache.clone();
}

const roundCache = new Map<string, THREE.BufferGeometry>();
function cylGeo(r: number, h: number) {
  const k = `${r.toFixed(3)}|${h.toFixed(3)}`;
  let g = roundCache.get(k);
  if (!g) {
    g = new THREE.CylinderGeometry(r, r, h, 24, 1).toNonIndexed();
    roundCache.set(k, g);
  }
  return g.clone();
}

const at = (g: THREE.BufferGeometry, x: number, y: number, z: number) =>
  g.translate(x, y, z);

export class LegoBuilder {
  private pieces: Piece[] = [];
  private parts: Part[] = [];

  private layerOf(y: number) {
    return Math.max(0, Math.floor((y - 1) / 3) + 1);
  }

  brick(
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    color: LegoColor,
    o: { h?: number; studs?: boolean } = {}
  ) {
    const h = o.h ?? 3;
    this.pieces.push({
      kind: "box",
      x,
      y,
      z,
      w,
      d,
      h,
      color,
      studs: o.studs ?? color !== "glass",
      layer: this.layerOf(y),
    });
    return this;
  }

  plate(
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    color: LegoColor,
    studs = true
  ) {
    return this.brick(x, y, z, w, d, color, { h: 1, studs });
  }

  tile(x: number, y: number, z: number, w: number, d: number, color: LegoColor) {
    return this.brick(x, y, z, w, d, color, { h: 1, studs: false });
  }

  stack(
    x: number,
    y: number,
    z: number,
    w: number,
    d: number,
    rows: number,
    color: LegoColor | LegoColor[]
  ) {
    for (let r = 0; r < rows; r++) {
      const c = Array.isArray(color) ? color[r % color.length] : color;
      this.brick(x, y + r * 3, z, w, d, c);
    }
    return this;
  }

  base(w: number, d: number, color: LegoColor = "dark") {
    return this.plate(0, 0, 0, w, d, color);
  }

  round(
    x: number,
    y: number,
    z: number,
    d: number,
    h: number,
    color: LegoColor,
    studs = true
  ) {
    this.pieces.push({
      kind: "round",
      x,
      y,
      z,
      w: d,
      d,
      h,
      color,
      studs,
      layer: this.layerOf(y),
    });
    return this;
  }

  slope(
    x: number,
    y: number,
    z: number,
    len: number,
    dep: number,
    dir: 0 | 1 | 2 | 3,
    color: LegoColor,
    h = 3
  ) {
    const hh = h * PLATE;
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(dep, 0);
    sh.lineTo(1, hh);
    sh.lineTo(0, hh);
    sh.closePath();
    let g: THREE.BufferGeometry = new THREE.ExtrudeGeometry(sh, {
      depth: len,
      bevelEnabled: false,
    });
    g.applyMatrix4(
      new THREE.Matrix4().set(0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, dep, 0, 0, 0, 1)
    );
    g.rotateY((-dir * Math.PI) / 2);
    g.computeBoundingBox();
    const bb = g.boundingBox!;
    g.translate(x - bb.min.x, y * PLATE - bb.min.y, z - bb.min.z);
    g = g.index ? g.toNonIndexed() : g;
    g.deleteAttribute("uv");
    this.parts.push({ geo: g, color, layer: this.layerOf(y) });
    return this;
  }

  fig(
    x: number,
    y: number,
    z: number,
    torso: LegoColor,
    legs: LegoColor = "dark",
    o: FigOptions = {}
  ) {
    const parts: Part[] = [];
    const layer = this.layerOf(y);
    const add = (g: THREE.BufferGeometry, c: LegoColor) =>
      parts.push({ geo: g, color: c, layer });
    const bx = (
      w: number,
      h: number,
      d: number,
      px: number,
      py: number,
      pz: number,
      c: LegoColor
    ) => add(at(boxGeo(w, h, d), px, py + h / 2, pz), c);

    const S = 1.24;
    const sit = o.sitting ?? false;

    if (sit) {
      bx(0.36 * S, 0.38 * S, 0.78 * S, -0.21 * S, 0, 0.22 * S, legs);
      bx(0.36 * S, 0.38 * S, 0.78 * S, 0.21 * S, 0, 0.22 * S, legs);
      bx(0.82 * S, 0.16 * S, 0.44 * S, 0, 0.38 * S, 0, legs);
    } else {
      bx(0.36 * S, 0.82 * S, 0.42 * S, -0.21 * S, 0, 0, legs);
      bx(0.36 * S, 0.82 * S, 0.42 * S, 0.21 * S, 0, 0, legs);
      bx(0.82 * S, 0.16 * S, 0.44 * S, 0, 0.82 * S, 0, legs);
    }

    const hipY = (sit ? 0.54 : 0.98) * S;
    bx(0.84 * S, 0.78 * S, 0.45 * S, 0, hipY, 0, torso);

    const rArmUp =
      o.rightArm !== undefined
        ? o.rightArm > 0.4
        : !!(o.arms || o.cup || o.mic || o.card || o.brickHeld);
    const lArmUp =
      o.leftArm !== undefined
        ? o.leftArm > 0.4
        : !!(o.arms || o.brickHeld);

    for (const s of [-1, 1]) {
      const isUp = s > 0 ? rArmUp : lArmUp;
      const shoulderX = s * 0.54 * S;
      if (isUp) {
        bx(0.24 * S, 0.32 * S, 0.68 * S, shoulderX, hipY + 0.42 * S, 0.24 * S, torso);
        bx(0.22 * S, 0.22 * S, 0.22 * S, shoulderX, hipY + 0.44 * S, 0.62 * S, "face");
      } else {
        bx(0.24 * S, 0.72 * S, 0.28 * S, shoulderX, hipY + 0.04 * S, 0, torso);
        bx(0.22 * S, 0.22 * S, 0.24 * S, shoulderX, hipY - 0.16 * S, 0.04 * S, "face");
      }
    }

    const headY = hipY + 0.78 * S;
    add(at(cylGeo(0.28 * S, 0.38 * S), 0, headY + 0.19 * S, 0), "face");
    add(at(cylGeo(0.14 * S, 0.1 * S), 0, headY + 0.43 * S, 0), "face");

    if (o.hat) {
      add(at(cylGeo(0.33 * S, 0.22 * S), 0, headY + 0.42 * S, 0), o.hat);
      add(at(boxGeo(0.55 * S, 0.08 * S, 0.68 * S), 0, headY + 0.34 * S, 0.1 * S), o.hat);
    }

    if (o.cup) {
      const cx = 0.54 * S;
      const cy = hipY + 0.55 * S;
      const cz = 0.76 * S;
      add(at(cylGeo(0.24 * S, 0.42 * S), cx, cy, cz), o.cup);
      add(at(cylGeo(0.18 * S, 0.08 * S), cx, cy + 0.22 * S, cz), "brown");
    }

    if (o.mic) {
      const mx = 0.54 * S;
      const my = hipY + 0.62 * S;
      const mz = 0.72 * S;
      add(at(cylGeo(0.08 * S, 0.45 * S), mx, my, mz), "dark");
      add(at(cylGeo(0.16 * S, 0.2 * S), mx, my + 0.28 * S, mz), "light");
    }

    if (o.card) {
      const cx = 0.54 * S;
      const cy = hipY + 0.85 * S;
      const cz = 0.72 * S;
      const innerColor: LegoColor = o.card === "yellow" ? "teal" : "yellow";
      bx(0.75 * S, 0.85 * S, 0.12 * S, cx, cy - 0.2 * S, cz, o.card);
      bx(0.52 * S, 0.52 * S, 0.15 * S, cx, cy - 0.08 * S, cz, innerColor);
    }

    if (o.briefcase) {
      const bxPos = -0.72 * S;
      const byPos = hipY - 0.45 * S;
      bx(0.18 * S, 0.55 * S, 0.72 * S, bxPos, byPos, 0.05 * S, o.briefcase);
      bx(0.14 * S, 0.15 * S, 0.32 * S, bxPos, byPos + 0.55 * S, 0.05 * S, "yellow");
    }

    if (o.brickHeld) {
      const byPos = hipY + 0.38 * S;
      const bzPos = 0.82 * S;
      bx(0.95 * S, 0.52 * S, 0.95 * S, 0, byPos, bzPos, o.brickHeld);
      add(at(studGeo(), -0.22 * S, byPos + 0.52 * S, bzPos - 0.22 * S), o.brickHeld);
      add(at(studGeo(), 0.22 * S, byPos + 0.52 * S, bzPos - 0.22 * S), o.brickHeld);
      add(at(studGeo(), -0.22 * S, byPos + 0.52 * S, bzPos + 0.22 * S), o.brickHeld);
      add(at(studGeo(), 0.22 * S, byPos + 0.52 * S, bzPos + 0.22 * S), o.brickHeld);
    }

    const m = new THREE.Matrix4()
      .makeRotationY(o.rot ?? 0)
      .setPosition(x, y * PLATE, z);
    parts.forEach((p) => {
      p.geo.applyMatrix4(m);
      this.parts.push(p);
    });
    return this;
  }

  /**
   * Builds and normalizes the model to a larger heroic size (`fitSize = 4.15`).
   */
  build(fitSize = 4.15): LegoModel {
    const covered = new Set<string>();
    const colorCounts = new Map<LegoColor, number>();

    for (const p of this.pieces) {
      if (p.y > 0 && p.color !== "dark" && p.color !== "gray") {
        colorCounts.set(p.color, (colorCounts.get(p.color) ?? 0) + 1);
      }
      const cells =
        p.kind === "round"
          ? [[Math.floor(p.x + p.w / 2), Math.floor(p.z + p.d / 2)]]
          : this.cells(p);
      for (const [i, j] of cells) covered.add(`${i}|${j}|${p.y}`);
      if (p.kind === "round" && p.w > 1) {
        for (const [i, j] of this.cells(p)) covered.add(`${i}|${j}|${p.y}`);
      }
    }

    for (const p of this.pieces) {
      const top = p.y + p.h;
      const bh = p.h * PLATE;
      if (p.kind === "box") {
        this.parts.push({
          geo: at(
            boxGeo(p.w - 0.05, bh - 0.025, p.d - 0.05),
            p.x + p.w / 2,
            p.y * PLATE + bh / 2,
            p.z + p.d / 2
          ),
          color: p.color,
          layer: p.layer,
        });
        if (p.studs) {
          for (const [i, j] of this.cells(p)) {
            if (covered.has(`${i}|${j}|${top}`)) continue;
            this.parts.push({
              geo: at(studGeo(), i + 0.5, top * PLATE - 0.01, j + 0.5),
              color: p.color,
              layer: p.layer,
            });
          }
        }
      } else {
        const cx = p.x + p.w / 2;
        const cz = p.z + p.d / 2;
        this.parts.push({
          geo: at(
            cylGeo(p.w / 2 - 0.025, bh - 0.025),
            cx,
            p.y * PLATE + bh / 2,
            cz
          ),
          color: p.color,
          layer: p.layer,
        });
        if (p.studs) {
          const key = `${Math.floor(cx)}|${Math.floor(cz)}|${top}`;
          if (!covered.has(key)) {
            this.parts.push({
              geo: at(studGeo(), cx, top * PLATE - 0.01, cz),
              color: p.color,
              layer: p.layer,
            });
          }
        }
      }
    }

    const byLayer = new Map<number, Map<LegoColor, THREE.BufferGeometry[]>>();
    for (const p of this.parts) {
      if (!byLayer.has(p.layer)) byLayer.set(p.layer, new Map());
      const m = byLayer.get(p.layer)!;
      if (!m.has(p.color)) m.set(p.color, []);
      m.get(p.color)!.push(p.geo);
    }

    const content = new THREE.Group();
    const layers: THREE.Group[] = [];
    [...byLayer.keys()]
      .sort((a, b) => a - b)
      .forEach((li) => {
        const lg = new THREE.Group();
        byLayer.get(li)!.forEach((geos, color) => {
          const clean = geos.map((g) => {
            const c = g.index ? g.toNonIndexed() : g;
            for (const n of Object.keys(c.attributes)) {
              if (n !== "position" && n !== "normal") c.deleteAttribute(n);
            }
            return c;
          });
          const mesh = new THREE.Mesh(
            mergeGeometries(clean, false)!,
            material(color)
          );
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          lg.add(mesh);
        });
        layers.push(lg);
        content.add(lg);
      });

    const box = new THREE.Box3().setFromObject(content);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    layers.forEach((lg) =>
      lg.children.forEach((m) =>
        (m as THREE.Mesh).geometry.translate(-center.x, -center.y, -center.z)
      )
    );

    const root = new THREE.Group();
    root.add(content);
    const maxDim = Math.max(size.x * 0.92, size.z * 0.92, size.y * 1.02);
    root.scale.setScalar(fitSize / Math.max(maxDim, 0.001));

    const sortedPalette = [...colorCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([c]) => LEGO_COLORS[c]);
    const palette =
      sortedPalette.length > 0
        ? sortedPalette
        : [LEGO_COLORS.blue, LEGO_COLORS.teal, LEGO_COLORS.yellow];

    return { root, layers, size, palette };
  }

  private cells(p: Piece) {
    const out: number[][] = [];
    for (let i = p.x; i < p.x + p.w; i++) {
      for (let j = p.z; j < p.z + p.d; j++) out.push([i, j]);
    }
    return out;
  }
}