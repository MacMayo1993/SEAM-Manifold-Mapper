import React, { useState } from 'react';
import { Map as MapIcon, Activity } from 'lucide-react';
import ManifoldGenerator from './ManifoldGenerator';
import SeamLattice from './SeamLattice';

export default function App() {
  const [activeTab, setActiveTab] = useState('manifold');

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-rose-500 rounded-lg shadow-lg">
                  <MapIcon className="text-white" size={20} />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-black tracking-tight leading-none">SEAM EXPLORER</h1>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Topology Lab</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('manifold')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'manifold'
                    ? 'bg-white text-indigo-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon size={16} />
                <span>Manifold Generator</span>
              </button>
              <button
                onClick={() => setActiveTab('seam')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  activeTab === 'seam'
                    ? 'bg-white text-rose-600 shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Activity size={16} />
                <span>Seam Lattice</span>
              </button>
            </div>

            {/* Optional: GitHub or Info Link */}
            <div className="text-xs text-slate-400 font-mono hidden md:block">
              Mac Mayo • 2026
            </div>
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <div className="relative">
        {activeTab === 'manifold' ? <ManifoldGenerator /> : <SeamLattice />}
      </div>
    </div>
  );
}
