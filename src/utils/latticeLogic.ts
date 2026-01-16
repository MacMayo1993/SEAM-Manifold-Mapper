import { CellState, Coordinate } from '../types';

/**
 * Creates an N x N grid initialized to a specific state (default POSITIVE).
 */
export const createGrid = (size: number, initialState: CellState = CellState.POSITIVE): CellState[][] => {
  return Array.from({ length: size }, () => Array(size).fill(initialState));
};

/**
 * Handles Toroidal wrapping for coordinates.
 * -1 wraps to size-1, size wraps to 0.
 */
export const wrapCoord = (val: number, max: number): number => {
  return (val % max + max) % max;
};

/**
 * Gets toroidal neighbors (Up, Down, Left, Right).
 */
export const getNeighbors = (coord: Coordinate, size: number): Coordinate[] => {
  const { row, col } = coord;
  return [
    { row: wrapCoord(row - 1, size), col }, // Up
    { row: wrapCoord(row + 1, size), col }, // Down
    { row, col: wrapCoord(col - 1, size) }, // Left
    { row, col: wrapCoord(col + 1, size) }  // Right
  ];
};

/**
 * Checks if the grid is fully uniform (Annihilation state).
 */
export const checkAnnihilation = (grid: CellState[][]): boolean => {
  if (grid.length === 0) return true;
  const firstVal = grid[0][0];
  return grid.every(row => row.every(cell => cell === firstVal));
};

/**
 * Calculates coherence (-1 is all negative, 1 is all positive, 0 is mix).
 */
export const calculateCoherence = (grid: CellState[][]): number => {
  let sum = 0;
  const size = grid.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      sum += grid[r][c];
    }
  }
  return sum / (size * size);
};
