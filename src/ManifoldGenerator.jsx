import React, { useState, useMemo, useEffect, useRef } from 'react';
import { RefreshCw, Play, Settings, Hash, Map as MapIcon, Info, Github, Box, Maximize2, Move3D, Layers } from 'lucide-react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// --- Constants ---
const DIRS = {
  N: { x: 0, y: -1, angle: 0 },
  E: { x: 1, y: 0, angle: Math.PI / 2 },
  S: { x: 0, y: 1, angle: Math.PI },
  W: { x: -1, y: 0, angle: -Math.PI / 2 }
};
const OPP = { N: "S", E: "W", S: "N", W: "E" };

// --- Helpers ---
const createRNG = (seed) => {
  let h = seed;
  return () => {
    h |= 0; h = h + 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const choice = (arr, random) => arr[Math.floor(random() * arr.length)];
const shuffle = (arr, random) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// --- Generator Logic ---
const getTemplates = () => [
  { name: "I3", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }] },
  { name: "L3", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { name: "O4", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { name: "T4", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }] },
  { name: "S4", cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }] },
  { name: "Z4", cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
  { name: "J4", cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }] },
  { name: "L4", cells: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 0, y: 2 }] },
  { name: "P5", cells: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }] },
  { name: "U5", cells: [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }] },
];

const rot90 = ({ x, y }) => ({ x: -y, y: x });
const rotateDir90 = (d) => ({ N: "E", E: "S", S: "W", W: "N" }[d]);

const rotateShape = (cells, ports) => {
  const rotatedCells = cells.map(rot90);
  const rotatedPorts = ports.map(p => ({ cell: rot90(p.cell), dir: rotateDir90(p.dir) }));
  const minX = Math.min(...rotatedCells.map(c => c.x));
  const minY = Math.min(...rotatedCells.map(c => c.y));
  return {
    cells: rotatedCells.map(c => ({ x: c.x - minX, y: c.y - minY })),
    ports: rotatedPorts.map(p => ({ cell: { x: p.cell.x - minX, y: p.cell.y - minY }, dir: p.dir }))
  };
};

const generateMap = (seed, pieceCount) => {
  const random = createRNG(seed);
  const templates = getTemplates();
  const shuffledIdx = shuffle(Array.from({ length: templates.length }, (_, i) => i), random);
  const chosenTemplates = shuffledIdx.slice(0, pieceCount).map(i => templates[i]);

  const colors = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#d946ef', '#f97316'];

  const processTemplate = (tmpl) => {
    let cells = tmpl.cells;
    let ports = [];
    const cellSet = new Set(cells.map(c => `${c.x},${c.y}`));
    cells.forEach(cell => {
      Object.entries(DIRS).forEach(([dir, delta]) => {
        if (!cellSet.has(`${cell.x + delta.x},${cell.y + delta.y}`)) ports.push({ cell, dir });
      });
    });
    const rots = Math.floor(random() * 4);
    for (let i = 0; i < rots; i++) {
      const res = rotateShape(cells, ports);
      cells = res.cells; ports = res.ports;
    }
    return { name: tmpl.name, cells, ports };
  };

  const first = processTemplate(chosenTemplates[0]);
  let occupied = new Set(first.cells.map(c => `${c.x},${c.y}`));
  let openPorts = first.ports.map(p => ({ ...p, worldCell: `${p.cell.x},${p.cell.y}` }));
  let pieces = [{ name: first.name, cells: first.cells.map(c => ({ ...c })), color: colors[0] }];

  for (let i = 1; i < chosenTemplates.length; i++) {
    const next = processTemplate(chosenTemplates[i]);
    let placed = false;
    for (let a = 0; a < 100; a++) {
      if (openPorts.length === 0) break;
      const target = choice(openPorts, random);
      const needed = OPP[target.dir];
      const candidates = next.ports.filter(p => p.dir === needed);
      if (candidates.length === 0) continue;
      const sp = choice(candidates, random);
      const [tx, ty] = target.worldCell.split(',').map(Number);
      const dx = tx + DIRS[target.dir].x - sp.cell.x;
      const dy = ty + DIRS[target.dir].y - sp.cell.y;
      const translated = next.cells.map(c => ({ x: c.x + dx, y: c.y + dy }));
      if (!translated.some(c => occupied.has(`${c.x},${c.y}`))) {
        translated.forEach(c => occupied.add(`${c.x},${c.y}`));
        pieces.push({ name: next.name, cells: translated, color: colors[i % colors.length] });
        const worldPorts = next.ports.map(p => ({
          cell: { x: p.cell.x + dx, y: p.cell.y + dy },
          worldCell: `${p.cell.x + dx},${p.cell.y + dy}`,
          dir: p.dir
        }));
        openPorts = [...openPorts.filter(p => p !== target), ...worldPorts]
          .filter(p => !occupied.has(`${p.cell.x + DIRS[p.dir].x},${p.cell.y + DIRS[p.dir].y}`));
        placed = true; break;
      }
    }
    if (!placed) return generateMap(seed + 777, pieceCount);
  }
  return { pieces, occupied };
};

// --- Three.js Component ---
const FoldedView = ({ mapData, foldFactor }) => {
  const mountRef = useRef(null);
  const hingesRef = useRef([]);
  const requestRef = useRef();

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9);
    
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Build Hierarchy Tree
    const cellsMap = new Map();
    mapData.pieces.forEach(p => p.cells.forEach(c => cellsMap.set(`${c.x},${c.y}`, p.color)));
    
    const keys = Array.from(cellsMap.keys());
    if (keys.length === 0) return;

    // Center root logic
    const coords = keys.map(k => k.split(',').map(Number));
    const avgX = coords.reduce((a, b) => a + b[0], 0) / coords.length;
    const avgY = coords.reduce((a, b) => a + b[1], 0) / coords.length;
    keys.sort((a, b) => {
      const [ax, ay] = a.split(',').map(Number);
      const [bx, by] = b.split(',').map(Number);
      return Math.hypot(ax - avgX, ay - avgY) - Math.hypot(bx - avgX, by - avgY);
    });

    const rootKey = keys[0];
    const visited = new Set([rootKey]);
    const queue = [rootKey];
    const rootObj = new THREE.Group();
    scene.add(rootObj);

    const hinges = [];
    const cellObjects = new Map();
    
    const createCellMesh = (color, x, y) => {
      const group = new THREE.Group();
      const geo = new THREE.BoxGeometry(0.96, 0.96, 0.08);
      const mat = new THREE.MeshPhongMaterial({ color: new THREE.Color(color), shininess: 30 });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      
      const borderMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      Object.entries(DIRS).forEach(([dir, delta]) => {
        if (!cellsMap.has(`${x + delta.x},${y + delta.y}`)) {
          const isVert = dir === 'N' || dir === 'S';
          const bGeo = isVert ? new THREE.BoxGeometry(1.02, 0.1, 0.12) : new THREE.BoxGeometry(0.1, 1.02, 0.12);
          const bMesh = new THREE.Mesh(bGeo, borderMat);
          bMesh.position.set(delta.x * 0.48, delta.y * 0.48, 0.02);
          group.add(bMesh);
        }
      });
      return group;
    };

    const rootMesh = createCellMesh(cellsMap.get(rootKey), ...rootKey.split(',').map(Number));
    rootObj.add(rootMesh);
    cellObjects.set(rootKey, rootMesh);

    while (queue.length > 0) {
      const currKey = queue.shift();
      const [cx, cy] = currKey.split(',').map(Number);
      
      Object.entries(DIRS).forEach(([dir, d]) => {
        const nbKey = `${cx + d.x},${cy + d.y}`;
        if (cellsMap.has(nbKey) && !visited.has(nbKey)) {
          visited.add(nbKey);
          const nbMesh = createCellMesh(cellsMap.get(nbKey), ...nbKey.split(',').map(Number));
          
          const hinge = new THREE.Group();
          hinge.position.set(d.x * 0.5, d.y * 0.5, 0);
          cellObjects.get(currKey).add(hinge);
          
          const offsetGroup = new THREE.Group();
          offsetGroup.position.set(d.x * 0.5, d.y * 0.5, 0);
          hinge.add(offsetGroup);
          offsetGroup.add(nbMesh);
          
          cellObjects.set(nbKey, nbMesh);
          hinges.push({ obj: hinge, dir });
          queue.push(nbKey);
        }
      });
    }

    hingesRef.current = hinges;
    const dist = Math.max(5, Math.sqrt(keys.length) * 2.5);
    camera.position.set(dist, dist, dist);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width === 0 || height === 0) continue;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(mountRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(requestRef.current);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mapData]);

  useEffect(() => {
    hingesRef.current.forEach(h => {
      const angle = (foldFactor * Math.PI) / 2;
      if (h.dir === 'N') h.obj.rotation.x = -angle;
      if (h.dir === 'S') h.obj.rotation.x = angle;
      if (h.dir === 'E') h.obj.rotation.y = angle;
      if (h.dir === 'W') h.obj.rotation.y = -angle;
    });
  }, [foldFactor]);

  return <div ref={mountRef} className="w-full h-full min-h-[400px]" />;
};

// --- Main Component ---
export default function ManifoldGenerator() {
  const [seed, setSeed] = useState(1234);
  const [pieceCount, setPieceCount] = useState(6);
  const [mapData, setMapData] = useState({ pieces: [], occupied: new Set() });
  const [is3D, setIs3D] = useState(false);
  const [foldFactor, setFoldFactor] = useState(0);

  useEffect(() => {
    setMapData(generateMap(seed, pieceCount));
    setFoldFactor(0);
  }, [seed, pieceCount]);

  const bounds = useMemo(() => {
    if (mapData.occupied.size === 0) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    const xs = Array.from(mapData.occupied).map(k => parseInt(k.split(',')[0]));
    const ys = Array.from(mapData.occupied).map(k => parseInt(k.split(',')[1]));
    return { minX: Math.min(...xs) - 1, maxX: Math.max(...xs) + 1, minY: Math.min(...ys) - 1, maxY: Math.max(...ys) + 1 };
  }, [mapData]);

  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;
  const cellSize = 40;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      <Header 
        seed={seed} 
        onRegenerate={() => setSeed(Math.floor(Math.random() * 1000000))} 
        pieceCount={pieceCount} 
        setPieceCount={setPieceCount} 
      />

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden p-6 gap-6">
        <div className="flex-1 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex items-center justify-center relative min-h-[500px]">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <button 
              onClick={() => setIs3D(!is3D)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm shadow-lg transition-all active:scale-95 ${is3D ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
            >
              {is3D ? <Maximize2 size={16}/> : <Box size={16}/>} {is3D ? 'Return to 2D' : 'Fold in 3D'}
            </button>
            {is3D && (
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Articulation</span>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {foldFactor < 0 ? 'Out: ' : foldFactor > 0 ? 'In: ' : ''}{Math.abs(Math.round(foldFactor * 100))}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="-1" 
                  max="1" 
                  step="0.01" 
                  value={foldFactor} 
                  onChange={(e) => setFoldFactor(parseFloat(e.target.value))} 
                  className="w-48 accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                />
                <div className="flex justify-between text-[8px] font-bold text-slate-300 uppercase tracking-tighter">
                  <span>Extrinsic (-100%)</span>
                  <span>Intrinsic (+100%)</span>
                </div>
              </div>
            )}
          </div>

          {is3D ? (
            <FoldedView mapData={mapData} foldFactor={foldFactor} />
          ) : (
            <div className="relative animate-in zoom-in-95 duration-500" style={{ width: width * cellSize, height: height * cellSize }}>
              {mapData.pieces.map((piece, pIdx) => (
                <React.Fragment key={pIdx}>
                  {piece.cells.map((cell, cIdx) => {
                    const hasNB = (dx, dy) => mapData.occupied.has(`${cell.x + dx},${cell.y + dy}`);
                    return (
                      <div key={`${pIdx}-${cIdx}`} className="absolute rounded-[2px] transition-all duration-300" style={{
                        width: cellSize, height: cellSize,
                        left: (cell.x - bounds.minX) * cellSize,
                        top: (cell.y - bounds.minY) * cellSize,
                        backgroundColor: piece.color,
                        borderTop: !hasNB(0, -1) ? '4px solid #000' : '1px solid rgba(255,255,255,0.1)',
                        borderRight: !hasNB(1, 0) ? '4px solid #000' : '1px solid rgba(255,255,255,0.1)',
                        borderBottom: !hasNB(0, 1) ? '4px solid #000' : '1px solid rgba(255,255,255,0.1)',
                        borderLeft: !hasNB(-1, 0) ? '4px solid #000' : '1px solid rgba(255,255,255,0.1)',
                        boxSizing: 'border-box'
                      }}>
                        {cIdx === 0 && <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white/40 font-bold select-none uppercase tracking-tighter">{piece.name}</span>}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-5">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 mb-4 uppercase text-xs tracking-wider"><Settings size={14} className="text-indigo-500" /> Piece Inventory</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {mapData.pieces.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: p.color }} />
                    <span className="font-semibold text-slate-700 text-sm tracking-tight">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">#{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-200">
             <h3 className="flex items-center gap-2 font-bold mb-3 uppercase text-[10px] tracking-widest text-indigo-400"><Move3D size={12}/> Bi-Directional Folding</h3>
             <p className="text-[11px] leading-relaxed opacity-80 font-medium">
               The slider now ranges from <b>-100% to +100%</b>. 
               Positive values fold the manifold <b>inwards</b> into a closed shape, while negative values fold it <b>outwards</b>, creating a spiked or blooming structure.
             </p>
          </div>
        </div>
      </main>
    </div>
  );
}

const Header = ({ seed, onRegenerate, pieceCount, setPieceCount }) => (
  <header className="flex items-center justify-between px-8 py-5 bg-white border-b shadow-sm z-20">
    <div className="flex items-center gap-4">
      <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100"><MapIcon className="text-white" size={20} /></div>
      <div className="flex flex-col">
        <h1 className="text-lg font-black tracking-tight leading-none">MANIFOLD GEN</h1>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bi-Directional Net Generator</span>
      </div>
    </div>
    <div className="flex items-center gap-8">
      {/* Piece Count Selector */}
      <div className="flex flex-col items-start gap-1">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
          <Layers size={10} /> Piece Count
        </span>
        <div className="flex items-center gap-3 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
          <input 
            type="range" 
            min="2" 
            max="10" 
            step="1" 
            value={pieceCount} 
            onChange={(e) => setPieceCount(parseInt(e.target.value))} 
            className="w-24 accent-indigo-600 h-1.5"
          />
          <span className="text-xs font-mono font-bold text-slate-600 w-4">{pieceCount}</span>
        </div>
      </div>

      {/* Active Seed */}
      <div className="flex flex-col items-end gap-1">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Seed</span>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 shadow-inner">
          <Hash size={12} className="text-slate-400" /><span className="text-xs font-mono font-bold text-indigo-600">{seed}</span>
        </div>
      </div>

      <button onClick={onRegenerate} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold text-xs shadow-lg shadow-indigo-100 active:translate-y-0.5">
        <RefreshCw size={14} /> Regenerate
      </button>
    </div>
  </header>
);
