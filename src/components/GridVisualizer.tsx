import React, { useMemo } from 'react';
import { CellState, Coordinate } from '../types';
import { COLORS } from '../constants';

interface GridVisualizerProps {
  grid: CellState[][];
  activeCells: Coordinate[]; // Cells currently in the processing queue
}

export const GridVisualizer: React.FC<GridVisualizerProps> = ({ grid, activeCells }) => {
  const size = grid.length;

  // Optimize active lookup
  const activeSet = useMemo(() => {
    const set = new Set<string>();
    activeCells.forEach(c => set.add(`${c.row},${c.col}`));
    return set;
  }, [activeCells]);

  return (
    <div
      className="grid gap-2 p-6 bg-zinc-950 rounded-2xl border border-zinc-800 shadow-2xl transition-all duration-500"
      style={{
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        aspectRatio: '1 / 1',
        maxWidth: '700px', // Zoomed in: significantly larger than previous 500px
        width: '100%',
        perspective: '1200px' // Increased depth for better 3D effect on large cells
      }}
    >
      {grid.map((row, rIndex) => (
        row.map((cellState, cIndex) => {
          const isActive = activeSet.has(`${rIndex},${cIndex}`);
          const colorClass = cellState === CellState.POSITIVE ? COLORS.POSITIVE : COLORS.NEGATIVE;
          const isNegative = cellState === CellState.NEGATIVE;

          return (
            <div
              key={`${rIndex}-${cIndex}`}
              className={`
                rounded-md flex items-center justify-center
                transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${colorClass}
                ${isActive ? 'z-20 ring-4 ring-white/50 shadow-[0_0_30px_rgba(255,255,255,0.4)]' : 'opacity-90 hover:opacity-100'}
              `}
              style={{
                // Rotate based on state (flip)
                // Active cells get significantly larger scale (The Seam Zone)
                transform: `rotateY(${isNegative ? 180 : 0}deg) scale(${isActive ? 1.25 : 1})`,
              }}
              title={`(${rIndex}, ${cIndex}) ${cellState > 0 ? '+' : '-'}`}
            >
              {/* Optional: Add a subtle inner dot for texture on large cells */}
              <div className="w-1.5 h-1.5 rounded-full bg-black/10 dark:bg-white/10" />
            </div>
          );
        })
      ))}
    </div>
  );
};
