import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Zap } from 'lucide-react';
import {
  createGrid,
  getNeighbors,
  checkAnnihilation,
  calculateCoherence
} from './utils/latticeLogic';
import {
  CellState,
  Coordinate,
  SimulationConfig,
  SimulationStats
} from './types';
import {
  K_STAR,
  DEFAULT_GRID_SIZE,
  DEFAULT_BIAS,
  ANIMATION_SPEED_MS
} from './constants';
import { GridVisualizer } from './components/GridVisualizer';
import { SimulationControls } from './components/SimulationControls';
import { InfoPanel } from './components/InfoPanel';

const SeamLattice: React.FC = () => {
  // --- State ---
  const [config, setConfig] = useState<SimulationConfig>({
    gridSize: DEFAULT_GRID_SIZE,
    thresholdK: K_STAR,
    propagationBias: DEFAULT_BIAS,
    delay: ANIMATION_SPEED_MS,
  });

  const [grid, setGrid] = useState<CellState[][]>(createGrid(DEFAULT_GRID_SIZE));
  const [queue, setQueue] = useState<Coordinate[]>([]);
  const [stats, setStats] = useState<SimulationStats>({
    steps: 0,
    coherence: 1,
    activeSeams: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [annihilated, setAnnihilated] = useState(false);

  // Refs for animation loop stability
  const queueRef = useRef<Coordinate[]>([]);
  const gridRef = useRef<CellState[][]>(grid);
  const configRef = useRef(config);

  // Sync refs
  useEffect(() => { configRef.current = config; }, [config]);

  // --- Logic ---

  // Reset Logic
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setAnnihilated(false);
    const newGrid = createGrid(config.gridSize);
    setGrid(newGrid);
    gridRef.current = newGrid;
    setQueue([]);
    queueRef.current = [];
    setStats({ steps: 0, coherence: 1, activeSeams: 0 });
  }, [config.gridSize]);

  // Ignite Logic (Start Cascade)
  const handleIgnite = useCallback(() => {
    handleReset();

    // Start from center
    const center = Math.floor(config.gridSize / 2);
    const startNode: Coordinate = { row: center, col: center };

    setQueue([startNode]);
    queueRef.current = [startNode];
    setIsRunning(true);
  }, [config.gridSize, handleReset]);

  // Simulation Step
  const stepSimulation = useCallback(() => {
    const currentQueue = queueRef.current;

    if (currentQueue.length === 0) {
      setIsRunning(false);
      // Check annihilation
      if (checkAnnihilation(gridRef.current)) {
        setAnnihilated(true);
      }
      return;
    }

    // Process a "wave" (first N items or just 1? Python script did 1.
    // To make it look good in React, let's process 1 but fast, or a batch.)
    // Let's process 1 item per tick for clear propagation visualization.

    const [currentNode, ...remainingQueue] = currentQueue;
    const { row, col } = currentNode;

    // Mutate copy of grid
    const newGrid = gridRef.current.map(r => [...r]);
    const oldVal = newGrid[row][col];

    // Flip self
    newGrid[row][col] *= -1;

    // Check neighbors
    const neighbors = getNeighbors(currentNode, configRef.current.gridSize);
    const newInQueue: Coordinate[] = [];

    neighbors.forEach(n => {
      // Propagation Condition:
      // If neighbor matches the OLD value (meaning it hasn't flipped yet relative to the pressure)
      // AND random entropy check passes.
      if (newGrid[n.row][n.col] === oldVal) {
        // Random check
        const kStarAdjusted = configRef.current.thresholdK - configRef.current.propagationBias;
        if (Math.random() > kStarAdjusted) {
          // Check if already in queue to prevent duplicates (simple check)
          // In a large simulation, use a Set for lookup. For < 50x50, Array.some is fine.
          const inRest = remainingQueue.some(q => q.row === n.row && q.col === n.col);
          const inNew = newInQueue.some(q => q.row === n.row && q.col === n.col);

          if (!inRest && !inNew) {
            newInQueue.push(n);
          }
        }
      }
    });

    // Update Refs
    gridRef.current = newGrid;
    queueRef.current = [...remainingQueue, ...newInQueue];

    // Update State
    setGrid(newGrid);
    setQueue(queueRef.current);
    setStats(prev => ({
      steps: prev.steps + 1,
      coherence: calculateCoherence(newGrid),
      activeSeams: queueRef.current.length
    }));

  }, []);

  // Animation Loop
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (isRunning && !annihilated) {
      intervalId = setInterval(stepSimulation, config.delay);
    }
    return () => {
      if (intervalId !== undefined) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning, annihilated, config.delay, stepSimulation]);


  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-rose-500/30">

      {/* Left Panel: Controls & Info */}
      <div className="w-full md:w-1/3 min-w-[350px] border-r border-zinc-800 flex flex-col h-screen overflow-y-auto custom-scrollbar z-20 bg-zinc-950 shadow-2xl">
        <div className="p-6 md:p-8 flex-1 flex flex-col gap-8">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-500 to-indigo-500 bg-clip-text text-transparent">
              Seam Lattice
            </h1>
            <p className="text-zinc-500 mt-2 font-mono text-sm">
              Non-orientable topology prototype
            </p>
          </header>

          <SimulationControls
            config={config}
            isRunning={isRunning}
            onUpdateConfig={(c) => setConfig(prev => ({ ...prev, ...c }))}
            onToggleRun={() => setIsRunning(!isRunning)}
            onReset={handleReset}
            onIgnite={handleIgnite}
          />

          <InfoPanel />
        </div>
      </div>

      {/* Right Panel: Visualization */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-zinc-950 p-6 overflow-hidden">

        {/* Background Grid Decoration (Faded for focus) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none opacity-50" />

        {/* Status Bar */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex gap-4">
            <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 px-4 py-2 rounded-lg shadow-xl">
              <div className="text-xs text-zinc-500 uppercase font-bold">Step</div>
              <div className="font-mono text-xl">{stats.steps}</div>
            </div>
          </div>

          <div className="bg-zinc-900/80 backdrop-blur border border-zinc-800 px-4 py-2 rounded-lg shadow-xl text-right">
             <div className="text-xs text-zinc-500 uppercase font-bold">State Coherence</div>
             <div className="font-mono text-xl flex items-center gap-2 justify-end">
                {stats.coherence === 1 || stats.coherence === -1 ? (
                  <span className="text-emerald-400">RESOLVED</span>
                ) : (
                   stats.coherence.toFixed(3)
                )}
             </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="relative z-0 flex flex-col items-center w-full">
            <div className="mb-8 relative w-full flex justify-center">
               <GridVisualizer grid={grid} activeCells={queue} />

               {/* Center Marker Hint (Only at start) */}
               {!isRunning && stats.steps === 0 && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
                    <span className="bg-zinc-950/90 text-white text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-700 shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        START (p=0.5)
                    </span>
                 </div>
               )}
            </div>

            {/* Annihilation Message */}
            {annihilated && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-500">
                 <div className="bg-zinc-900 border border-emerald-500/50 p-8 rounded-2xl shadow-2xl text-center max-w-sm transform scale-110">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mb-4 animate-bounce">
                       <Zap size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Resolution Achieved</h2>
                    <p className="text-zinc-400 mb-6 leading-relaxed">
                      The conflicting states have unified.
                      <br/>
                      <span className="text-emerald-400 font-medium">"A-ha Moment" reached.</span>
                    </p>
                    <button
                      onClick={handleReset}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2 mx-auto shadow-lg shadow-emerald-900/20"
                    >
                      <RotateCcw size={18} />
                      Reset Lattice
                    </button>
                 </div>
              </div>
            )}
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-center pointer-events-none">
          <div className="bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-full px-6 py-3 shadow-xl flex items-center gap-6 pointer-events-auto">
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-xs text-zinc-300 font-medium">State A</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-xs text-zinc-300 font-medium">State B</span>
             </div>
             <div className="w-px h-4 bg-zinc-700"></div>
             <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-white bg-rose-500 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                <span className="text-xs text-white font-bold">The Seam (Active Change)</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeamLattice;
