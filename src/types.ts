export enum CellState {
  POSITIVE = 1, // Red, Outside, ⊕
  NEGATIVE = -1 // Blue, Inside, ⊖
}

export interface Coordinate {
  row: number;
  col: number;
}

export interface SimulationConfig {
  gridSize: number;
  thresholdK: number;
  propagationBias: number; // The adjustment factor (default 0.3 in python script)
  delay: number;
}

export interface SimulationStats {
  steps: number;
  coherence: number; // A measure of uniformity (-1 to 1)
  activeSeams: number; // Size of the queue
}
