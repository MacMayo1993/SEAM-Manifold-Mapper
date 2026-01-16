import React from 'react';
import { Play, Pause, RefreshCw, Zap, Settings2 } from 'lucide-react';
import { SimulationConfig } from '../types';
import { K_STAR } from '../constants';

interface ControlsProps {
  config: SimulationConfig;
  isRunning: boolean;
  onUpdateConfig: (newConfig: Partial<SimulationConfig>) => void;
  onToggleRun: () => void;
  onReset: () => void;
  onIgnite: () => void;
}

export const SimulationControls: React.FC<ControlsProps> = ({
  config,
  isRunning,
  onUpdateConfig,
  onToggleRun,
  onReset,
  onIgnite
}) => {
  return (
    <div className="flex flex-col gap-6 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-zinc-100 font-bold flex items-center gap-2">
          <Settings2 size={18} />
          <span>Lattice Parameters</span>
        </h3>
        <span className="text-xs font-mono text-zinc-500">v0.8.2-alpha</span>
      </div>

      {/* Primary Actions */}
      <div className="flex gap-2">
        <button
          onClick={onToggleRun}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all ${
            isRunning
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20'
          }`}
        >
          {isRunning ? <Pause size={18} /> : <Play size={18} />}
          {isRunning ? 'Pause Cascade' : 'Resume'}
        </button>

        <button
          onClick={onIgnite}
          disabled={isRunning}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Zap size={18} />
          Ignite Seam
        </button>

        <button
          onClick={onReset}
          className="p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all border border-zinc-700"
          title="Reset Grid"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Grid Size Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-zinc-400">Grid Size (N×N)</label>
            <span className="font-mono text-zinc-200">{config.gridSize}×{config.gridSize}</span>
          </div>
          <input
            type="range"
            min="5"
            max="25"
            step="2" // Keep it odd for perfect center
            value={config.gridSize}
            onChange={(e) => onUpdateConfig({ gridSize: parseInt(e.target.value) })}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Propagation Bias */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-zinc-400">Propagation Bias</label>
            <span className="font-mono text-zinc-200">{config.propagationBias.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.6"
            step="0.01"
            value={config.propagationBias}
            onChange={(e) => onUpdateConfig({ propagationBias: parseFloat(e.target.value) })}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />
          <p className="text-xs text-zinc-500">
            Probability adjustment applied to k* ({K_STAR.toFixed(3)}). Higher bias = more aggressive spread.
          </p>
        </div>

        {/* Speed */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="text-zinc-400">Tick Delay (ms)</label>
            <span className="font-mono text-zinc-200">{config.delay}ms</span>
          </div>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={config.delay}
            onChange={(e) => onUpdateConfig({ delay: parseInt(e.target.value) })}
            className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
