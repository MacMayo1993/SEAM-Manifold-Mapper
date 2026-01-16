// The candidate universal threshold k*
// k* = 1 / (2 * ln(2)) ≈ 0.7213475204444817
export const K_STAR = 1 / (2 * Math.log(2));

export const DEFAULT_GRID_SIZE = 11; // Odd number works best for "center" calculation
export const DEFAULT_BIAS = 0.25;
export const ANIMATION_SPEED_MS = 100;

export const COLORS = {
  POSITIVE: 'bg-rose-500', // Red
  NEGATIVE: 'bg-blue-500', // Blue
  ACTIVE: 'ring-2 ring-white', // Highlight for active processing
  BACKGROUND: 'bg-zinc-900',
};
