// src/components/lego/models.ts
import type { LegoModel } from "./LegoBuilder";
import { buildHeroLogoModel } from "../3d/HeroLogoModel";
import { buildSceneModel } from "../3d/sceneModels";

export type ModelName =
  | "hall"
  | "meeting"
  | "ecosystem"
  | "stage"
  | "cafe"
  | "pitch"
  | "reverse"
  | "night"
  | "jobs"
  | "growth"
  | "expo"
  | "gate";

export function buildLegoModel(name: ModelName): LegoModel {
  // Hero: bespoke INOTEX brand sculpture
  if (name === "hall") return buildHeroLogoModel(3.85);
  // Every other chapter: bespoke scene sculpture (lego used only as a small accent)
  return buildSceneModel(name, 4.15);
}

export const MODEL_NAMES: ModelName[] = [
  "hall",
  "meeting",
  "ecosystem",
  "stage",
  "cafe",
  "pitch",
  "reverse",
  "night",
  "jobs",
  "growth",
  "expo",
  "gate",
];