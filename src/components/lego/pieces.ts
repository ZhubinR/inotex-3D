// src/components/lego/pieces.ts
import { LegoColorKey } from './spec';

export type PieceId =
  | 'brick_2x4'
  | 'brick_2x3'
  | 'brick_2x2'
  | 'brick_1x4'
  | 'brick_1x2'
  | 'brick_1x1'
  | 'plate_2x4'
  | 'plate_2x2'
  | 'round_2x2'
  | 'slope_2x2';

export interface PieceDefinition {
  id: PieceId;
  /** Width along X in studs (when rotation = 0) */
  w: number;
  /** Height in plates (3 plates = 1 standard brick height, 1 plate = flat plate) */
  hPlates: number;
  /** Depth along Z in studs (when rotation = 0) */
  d: number;
  shape: 'box' | 'round' | 'slope';
}

export const LEGO_PIECES: Record<PieceId, PieceDefinition> = {
  brick_2x4: { id: 'brick_2x4', w: 2, hPlates: 3, d: 4, shape: 'box' },
  brick_2x3: { id: 'brick_2x3', w: 2, hPlates: 3, d: 3, shape: 'box' },
  brick_2x2: { id: 'brick_2x2', w: 2, hPlates: 3, d: 2, shape: 'box' },
  brick_1x4: { id: 'brick_1x4', w: 1, hPlates: 3, d: 4, shape: 'box' },
  brick_1x2: { id: 'brick_1x2', w: 1, hPlates: 3, d: 2, shape: 'box' },
  brick_1x1: { id: 'brick_1x1', w: 1, hPlates: 3, d: 1, shape: 'box' },
  plate_2x4: { id: 'plate_2x4', w: 2, hPlates: 1, d: 4, shape: 'box' },
  plate_2x2: { id: 'plate_2x2', w: 2, hPlates: 1, d: 2, shape: 'box' },
  round_2x2: { id: 'round_2x2', w: 2, hPlates: 3, d: 2, shape: 'round' },
  slope_2x2: { id: 'slope_2x2', w: 2, hPlates: 3, d: 2, shape: 'slope' },
};

export interface PlacedBrick {
  id: string;
  piece: PieceId;
  /** Grid X (in studs) */
  x: number;
  /** Grid Y (in brick layers, where 1 layer = 3 plates) */
  y: number;
  /** Grid Z (in studs) */
  z: number;
  /** Quarter-turn rotation around Y: 0 = 0deg, 1 = 90deg, 2 = 180deg, 3 = 270deg */
  rotY: 0 | 1 | 2 | 3;
  color: LegoColorKey;
  /** World-space center position computed by LegoBuilder */
  worldPos: [number, number, number];
  /** World-space scale [width, height, depth] in world units */
  worldSize: [number, number, number];
  /** Effective stud dimensions [wStuds, dStuds] after 90-degree rotation */
  studGrid: [number, number];
  /** World-space positions of all top studs belonging to this brick */
  studPositions: Array<[number, number, number]>;
}