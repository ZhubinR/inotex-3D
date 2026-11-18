// src/components/lego/transitions.ts
import gsap from "gsap";
import * as THREE from "three";
import type { LegoModel } from "./LegoBuilder";
import type { ModelName } from "./models";

export type Holder = { holder: THREE.Group; model: LegoModel };
type Fn = (h: Holder, delay: number) => gsap.core.Timeline;

export function resetHolder(h: Holder) {
  gsap.killTweensOf(h.holder.scale);
  gsap.killTweensOf(h.holder.rotation);
  gsap.killTweensOf(h.holder.position);
  h.holder.scale.setScalar(1);
  h.holder.rotation.set(0, 0, 0);
  h.holder.position.set(0, 0, 0);
  h.model.layers.forEach((l) => {
    gsap.killTweensOf(l.position);
    gsap.killTweensOf(l.rotation);
    gsap.killTweensOf(l.scale);
    l.position.set(0, 0, 0);
    l.rotation.set(0, 0, 0);
    l.scale.set(1, 1, 1);
    l.visible = true;
  });
}

const show = (l: THREE.Object3D) => () => {
  l.visible = true;
};

/**
 * Deterministic halo coordinates behind the model so layers of the next model
 * fly forward FROM the floating brick cloud behind the model, and layers of the
 * previous model fly backward INTO the floating brick cloud.
 */
function cloudSlotPosition(i: number, total: number, radius: number) {
  const angle = i * 2.39996 + 0.4; // Golden angle distribution in the halo behind the model
  const ring = 0.55 + (i / Math.max(1, total - 1)) * 0.85;
  return {
    px: Math.cos(angle) * radius * ring,
    py: Math.sin(angle) * radius * 0.75 * ring,
    pz: -radius * (1.25 + (i % 3) * 0.35), // Strictly behind the model
    rx: ((i % 2 ? 1 : -1) * Math.PI) / 3,
    ry: angle * 0.6,
    rz: ((i % 3) - 1) * 0.45,
  };
}

/**
 * Assembles the incoming model by pulling bricks forward from the floating halo behind it.
 */
function assembleFromBehindCloud(
  h: Holder,
  delay: number,
  step = 0.055,
  dur = 0.82,
  ease = "back.out(1.35)"
) {
  const tl = gsap.timeline({ delay });
  const L = h.model.layers;
  const radius = Math.max(h.model.size.x, h.model.size.z, h.model.size.y) * 0.85;

  L.forEach((l, i) => {
    const slot = cloudSlotPosition(i, L.length, radius);
    l.visible = false;
    l.position.set(slot.px, slot.py, slot.pz);
    l.rotation.set(slot.rx, slot.ry, slot.rz);
    l.scale.setScalar(0.32);

    const at = i * step;
    tl.call(show(l), undefined, at);
    tl.to(l.position, { x: 0, y: 0, z: 0, duration: dur, ease }, at);
    tl.to(l.rotation, { x: 0, y: 0, z: 0, duration: dur, ease }, at);
    tl.to(l.scale, { x: 1, y: 1, z: 1, duration: dur, ease }, at);
  });
  return tl;
}

export const ENTER: Record<ModelName, Fn> = {
  hall: (h, d) => assembleFromBehindCloud(h, d, 0.055, 0.85, "back.out(1.4)"),
  meeting: (h, d) => assembleFromBehindCloud(h, d, 0.055, 0.82, "power4.out"),
  ecosystem: (h, d) => assembleFromBehindCloud(h, d, 0.055, 0.85, "back.out(1.5)"),
  stage: (h, d) => assembleFromBehindCloud(h, d, 0.055, 0.82, "back.out(1.4)"),
  cafe: (h, d) => assembleFromBehindCloud(h, d, 0.06, 0.85, "back.out(1.45)"),
  pitch: (h, d) => assembleFromBehindCloud(h, d, 0.055, 0.82, "back.out(1.5)"),
  reverse: (h, d) => assembleFromBehindCloud(h, d, 0.055, 0.85, "power4.out"),
  night: (h, d) => assembleFromBehindCloud(h, d, 0.06, 0.88, "back.out(1.35)"),
  jobs: (h, d) => assembleFromBehindCloud(h, d, 0.055, 0.82, "power3.out"),
  growth: (h, d) => assembleFromBehindCloud(h, d, 0.055, 0.85, "back.out(1.5)"),
  expo: (h, d) => assembleFromBehindCloud(h, d, 0.04, 0.5, "power2.out"),
  gate: (h, d) => assembleFromBehindCloud(h, d, 0.055, 0.82, "back.out(1.4)"),
};

/**
 * Disassembles the previous model backward into the floating halo behind the model,
 * where its bricks become the new floating cloud.
 */
export function exitModel(h: Holder, _name: ModelName, onDone: () => void) {
  const L = h.model.layers;
  const radius = Math.max(h.model.size.x, h.model.size.z, h.model.size.y) * 0.9;
  const tl = gsap.timeline({ onComplete: onDone });
  const T = 0.52;

  L.forEach((l, i) => {
    const slot = cloudSlotPosition(i, L.length, radius);
    const delay = (L.length - 1 - i) * 0.016;
    tl.to(
      l.position,
      {
        x: slot.px,
        y: slot.py,
        z: slot.pz,
        duration: T,
        ease: "power3.inOut",
      },
      delay
    );
    tl.to(
      l.rotation,
      {
        x: slot.rx,
        y: slot.ry,
        z: slot.rz,
        duration: T,
        ease: "power2.inOut",
      },
      delay
    );
    tl.to(
      l.scale,
      {
        x: 0.22,
        y: 0.22,
        z: 0.22,
        duration: T,
        ease: "power2.in",
      },
      delay
    );
  });

  return tl;
}