import React from 'react';
import { BookOpen, Lightbulb } from 'lucide-react';
import { K_STAR } from '../constants';

export const InfoPanel: React.FC = () => {
  return (
    <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">

      {/* Real World Context - Priority display */}
      <div className="p-4 bg-amber-900/20 border border-amber-500/20 rounded-lg">
        <h4 className="flex items-center gap-2 font-bold text-amber-400 mb-2">
          <Lightbulb size={16} />
          What is happening?
        </h4>
        <p className="mb-2 text-amber-100/90">
          <strong>The Analogy:</strong> Imagine this grid is a network of beliefs or opinions.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-1 text-amber-200/80 text-xs">
          <li><span className="text-rose-400 font-bold">Red Cells</span>: Holding "Opinion A".</li>
          <li><span className="text-blue-400 font-bold">Blue Cells</span>: Holding "Opinion B".</li>
          <li><span className="text-white font-bold">Glowing Cells</span>: The moment of doubt ("The Seam").</li>
        </ul>
        <p className="mt-3 text-amber-100/90">
          When you change your mind on one thing (flip a cell), it creates a ripple effect. Neighboring beliefs must also flip to stay consistent. When the whole grid turns one color, the internal conflict is resolved (Annihilation).
        </p>
      </div>

      <div className="p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-lg opacity-80 hover:opacity-100 transition-opacity">
        <h4 className="flex items-center gap-2 font-bold text-indigo-300 mb-2">
          <BookOpen size={16} />
          The Science
        </h4>
        <p className="mb-2 text-xs">
          Technically, this visualizes the boundary point of structural discontinuity.
          The lattice models a non-orientable topology where understanding emerges discretely
          from continuous information acquisition.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Threshold k*</div>
          <div className="font-mono text-lg text-emerald-400 font-bold">
            {K_STAR.toFixed(3)}
          </div>
        </div>
        <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Topology</div>
          <div className="font-mono text-lg text-rose-400 font-bold">
            Toroidal
          </div>
        </div>
      </div>

      <div className="flex gap-2 text-xs text-zinc-500 pt-4 border-t border-zinc-800">
         <span>SeamAware.com Prototype</span>
         <span>•</span>
         <span>Mac Mayo</span>
      </div>
    </div>
  );
};
