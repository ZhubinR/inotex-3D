// src/lib/SceneState.ts
import type Lenis from "lenis";

export const SceneState = {
  chapter: 0,
  /** Active service pillar from scroll in EcosystemSection (-1 = Ecosystem header pyramid, 0..5 = services) */
  activePillar: -1,
  /** Pillar hovered in 3D canvas */
  hoverPillar: -1,
  /** Service row hovered in EcosystemSection */
  rowHover: -1,
  /** Cursor ring active state */
  canvasHover: false,
  /** Selected role in CountdownSection (0 = startup, 1 = enterprise, 2 = investor) */
  role: 0,
  /** Timestamp of last role change (ms) */
  rolePulse: 0,
  mouseX: 0,
  mouseY: 0,
  /** Lenis smooth scroll instance */
  lenis: null as Lenis | null,
};

type Listener = (chapter: number) => void;
const listeners = new Set<Listener>();

export function setChapter(chapter: number) {
  if (SceneState.chapter === chapter) return;
  SceneState.chapter = chapter;
  listeners.forEach((l) => l(chapter));
}

export function subscribeChapter(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export const sceneState = SceneState;