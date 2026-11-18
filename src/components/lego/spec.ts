// src/components/lego/spec.ts

export const LEGO_SPEC = {
  /** Horizontal pitch between adjacent studs (1 stud unit in 3D world space) */
  STUD_PITCH: 0.8,
  /** Height of a standard 1x brick (3 plates high) */
  BRICK_HEIGHT: 0.96,
  /** Height of a single plate (1/3 of a brick) */
  PLATE_HEIGHT: 0.32,
  /** Radius of the cylindrical stud on top of each brick */
  STUD_RADIUS: 0.24,
  /** Height of the cylindrical stud on top of each brick */
  STUD_HEIGHT: 0.17,
  /** Tiny gap between adjacent bricks so brick seams remain clearly visible */
  TOLERANCE: 0.035,
  /** Overall world scale multiplier to make models large and bold on screen */
  MODEL_SCALE: 0.62,
  /** Fixed instanced pool size for seamless brick-to-brick scroll transitions */
  MAX_BRICKS: 140,
} as const;

export type LegoColorKey =
  | 'inotexCyan'
  | 'inotexBlue'
  | 'inotexNavy'
  | 'inotexMagenta'
  | 'inotexYellow'
  | 'inotexOrange'
  | 'inotexGreen'
  | 'legoRed'
  | 'legoWhite'
  | 'legoLightGray'
  | 'legoDarkGray'
  | 'legoBlack'
  | 'legoGold';

export const LEGO_COLORS: Record<LegoColorKey, string> = {
  inotexCyan: '#00E5FF',
  inotexBlue: '#0066FF',
  inotexNavy: '#0F1E36',
  inotexMagenta: '#FF1E7A',
  inotexYellow: '#FFD600',
  inotexOrange: '#FF6D00',
  inotexGreen: '#00E676',
  legoRed: '#E3000B',
  legoWhite: '#F8F9FA',
  legoLightGray: '#A0A5A9',
  legoDarkGray: '#3E4347',
  legoBlack: '#1B1D1F',
  legoGold: '#FFB300',
};

/**
 * Converts discrete Lego grid coordinates (studs X, plates Y, studs Z)
 * and brick dimensions (width W, height in plates H, depth D) into centered 3D world coordinates.
 */
export function gridToWorld(
  gx: number,
  gyPlates: number,
  gz: number,
  wStuds: number,
  hPlates: number,
  dStuds: number
): [number, number, number] {
  const { STUD_PITCH, PLATE_HEIGHT } = LEGO_SPEC;
  const wx = (gx + wStuds * 0.5) * STUD_PITCH;
  const wy = (gyPlates + hPlates * 0.5) * PLATE_HEIGHT;
  const wz = (gz + dStuds * 0.5) * STUD_PITCH;
  return [wx, wy, wz];
}