import React, { useState } from 'react';
import { Layers, GitFork, ArrowUpRight, CheckCircle, Search, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { sound } from '../utils/sound';

interface ArchNode {
  id: string;
  label: string;
  type: 'app' | 'component' | 'function' | 'module' | 'dependency';
  subsystem: 'frontend' | 'backend' | 'data' | 'external';
  x: number;
  y: number;
  lines: number;
  complexity: string;
  connections: string[]; // Connected Node IDs
  description: string;
}

const NODES: ArchNode[] = [
  // Main App
  {
    id: 'app-root',
    label: 'CodeBloomApp.tsx',
    type: 'app',
    subsystem: 'frontend',
    x: 400,
    y: 60,
    lines: 180,
    complexity: 'Low (4)',
    connections: ['nav-comp', 'graph-engine', 'router-mod', 'auth-store'],
    description: 'Root container wiring providers, dynamic theme contexts, and petal canvas rendering.'
  },
  // Components
  {
    id: 'nav-comp',
    label: 'Navbar.tsx',
    type: 'component',
    subsystem: 'frontend',
    x: 180,
    y: 150,
    lines: 145,
    complexity: 'Low (3)',
    connections: ['sound-fn', 'auth-store'],
    description: 'Floating glassmorphic navigation with sound and bloom breeze controls.'
  },
  {
    id: 'graph-engine',
    label: 'BloomGraph.tsx',
    type: 'component',
    subsystem: 'frontend',
    x: 400,
    y: 170,
    lines: 320,
    complexity: 'Medium (9)',
    connections: ['dag-solver', 'ast-parser', 'd3-force'],
    description: 'Interactive SVG node-link renderer with topological layouts and smooth zoom pan.'
  },
  {
    id: 'debugger-comp',
    label: 'DebuggerWorkspace.tsx',
    type: 'component',
    subsystem: 'frontend',
    x: 620,
    y: 150,
    lines: 240,
    complexity: 'Medium (7)',
    connections: ['diff-engine', 'ast-parser'],
    description: 'Real-time code editor with live syntax diagnostics and cat inspector.'
  },
  // Modules
  {
    id: 'router-mod',
    label: 'routes.config.ts',
    type: 'module',
    subsystem: 'frontend',
    x: 140,
    y: 280,
    lines: 85,
    complexity: 'Low (2)',
    connections: ['auth-store'],
    description: 'Type-safe route manifests and code-split module loaders.'
  },
  {
    id: 'dag-solver',
    label: 'dagTopology.ts',
    type: 'module',
    subsystem: 'backend',
    x: 320,
    y: 290,
    lines: 210,
    complexity: 'High (14)',
    connections: ['ast-parser', 'graphlib'],
    description: 'Kahn algorithm cycle resolver; computes optimal tree rank heights.'
  },
  {
    id: 'diff-engine',
    label: 'unidiff.ts',
    type: 'module',
    subsystem: 'backend',
    x: 520,
    y: 290,
    lines: 160,
    complexity: 'Medium (6)',
    connections: ['ast-parser'],
    description: 'Generates Myers linear diff tokens and formatted patch hunks.'
  },
  // Functions
  {
    id: 'sound-fn',
    label: 'playBloomChime()',
    type: 'function',
    subsystem: 'frontend',
    x: 100,
    y: 400,
    lines: 48,
    complexity: 'Low (1)',
    connections: [],
    description: 'Synthesizes pure pentatonic sine frequencies using Web Audio API.'
  },
  {
    id: 'ast-parser',
    label: 'parseASTTree()',
    type: 'function',
    subsystem: 'backend',
    x: 420,
    y: 400,
    lines: 390,
    complexity: 'High (16)',
    connections: ['babel-parser', 'typescript'],
    description: 'Extracts import/export specifiers and variable scope bindings.'
  },
  // External Dependencies
  {
    id: 'auth-store',
    label: 'auth.state.ts',
    type: 'module',
    subsystem: 'data',
    x: 680,
    y: 280,
    lines: 120,
    complexity: 'Low (4)',
    connections: ['firebase-auth'],
    description: 'Reactive user session state and repository access tokens.'
  },
  {
    id: 'd3-force',
    label: 'd3-force (npm)',
    type: 'dependency',
    subsystem: 'external',
    x: 260,
    y: 480,
    lines: 0,
    complexity: 'External',
    connections: [],
    description: 'Velocity Verlet physical simulation for layout repulsion.'
  },
  {
    id: 'babel-parser',
    label: '@babel/parser (npm)',
    type: 'dependency',
    subsystem: 'external',
    x: 460,
    y: 490,
    lines: 0,
    complexity: 'External',
    connections: [],
    description: 'Standard ECMAScript AST tokenizer and CST builder.'
  },
  {
    id: 'firebase-auth',
    label: 'firebase/auth (npm)',
    type: 'dependency',
    subsystem: 'external',
    x: 690,
    y: 410,
    lines: 0,
    complexity: 'External',
    connections: [],
    description: 'Secure token verification and user profile management.'
  }
];

export const ArchitectureVisualizer: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('graph-engine');
  const [filterSubsystem, setFilterSubsystem] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedNode = NODES.find((n) => n.id === selectedNodeId) || NODES[0];

  const handleNodeClick = (id: string) => {
    sound.playBloomChime(659.25);
    setSelectedNodeId(id);
  };

  const getNodeColor = (type: ArchNode['type']) => {
    switch (type) {
      case 'app':
        return { bg: '#DCCFF5', text: '#493B55', border: '#493B55', tag: 'Main App' };
      case 'component':
        return { bg: '#F8DCE8', text: '#493B55', border: '#493B55', tag: 'Component' };
      case 'module':
        return { bg: '#D8F0E3', text: '#493B55', border: '#493B55', tag: 'Module' };
      case 'function':
        return { bg: '#FFE4D2', text: '#493B55', border: '#493B55', tag: 'Function' };
      case 'dependency':
        return { bg: '#DCEBFA', text: '#493B55', border: '#493B55', tag: 'Dependency' };
    }
  };

  // Filter nodes
  const filteredNodes = NODES.filter((n) => {
    const matchesFilter = filterSubsystem === 'all' || n.subsystem === filterSubsystem;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="architecture" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-[#493B55]/70 mb-2">
            <span className="font-pixel">DEPENDENCY TOPOLOGY</span>
            <span aria-hidden="true">·</span>
            <span>Live Interactive Graph</span>
          </div>

          {/* Heading required: "See how your code connects." */}
          <h2 className="font-pixel text-3xl sm:text-4xl lg:text-5xl text-[#493B55] mb-4">
            SEE HOW YOUR CODE CONNECTS.
          </h2>
          <p className="text-base sm:text-lg text-[#493B55]/85">
            Turn thousands of scattered files into an intuitive, living architecture diagram. Explore functions, components, modules, and third-party packages in harmonious pastel colors.
          </p>
        </div>

        {/* Legend / Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white/80 p-4 rounded-2xl border-2 border-[#493B55] pixel-box-shadow-sm">
          
          {/* Subsystem filter buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
            <span className="text-[#493B55]/70 mr-1 font-semibold">Subsystem:</span>
            {[
              { id: 'all', label: 'All Nodes' },
              { id: 'frontend', label: 'Frontend UI' },
              { id: 'backend', label: 'Core AST' },
              { id: 'data', label: 'Data & State' },
              { id: 'external', label: 'External NPM' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  sound.playSoftTick();
                  setFilterSubsystem(f.id);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  filterSubsystem === f.id
                    ? 'bg-[#493B55] text-white font-bold'
                    : 'bg-[#FFF9F2] text-[#493B55] hover:bg-[#F8DCE8]/50 border border-[#493B55]/15'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search within diagram */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#493B55]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find node or function..."
                className="pl-8 pr-3 py-1 bg-[#FFF9F2] text-xs text-[#493B55] rounded-lg border border-[#493B55]/20 outline-none w-44 font-code"
              />
            </div>
            
            {/* Zoom Controls */}
            <button
              onClick={() => {
                sound.playSoftTick();
                setZoomLevel((z) => Math.min(1.4, z + 0.1));
              }}
              className="p-1.5 rounded-lg bg-[#FFF9F2] border border-[#493B55]/20 text-[#493B55] hover:bg-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                sound.playSoftTick();
                setZoomLevel((z) => Math.max(0.7, z - 0.1));
              }}
              className="p-1.5 rounded-lg bg-[#FFF9F2] border border-[#493B55]/20 text-[#493B55] hover:bg-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Visualizer Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Canvas SVG Graph */}
          <div className="lg:col-span-8 bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-4 sm:p-6 relative overflow-hidden h-[540px] flex items-center justify-center">
            
            {/* Background Grid Pattern */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#493B55 1.5px, transparent 1.5px)`,
                backgroundSize: '24px 24px',
              }}
            />

            {/* SVG Interactive Topology Canvas */}
            <div
              className="w-full h-full relative transition-transform duration-300"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <svg className="w-full h-full absolute inset-0 pointer-events-none">
                <defs>
                  <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#493B55" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#DCCFF5" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Render Edge Lines between connected nodes */}
                {NODES.map((source) =>
                  source.connections.map((targetId) => {
                    const target = NODES.find((n) => n.id === targetId);
                    if (!target) return null;

                    const isHighlighted =
                      selectedNodeId === source.id || selectedNodeId === target.id;

                    return (
                      <line
                        key={`${source.id}-${target.id}`}
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke={isHighlighted ? '#493B55' : '#DCCFF5'}
                        strokeWidth={isHighlighted ? 2.5 : 1.5}
                        strokeDasharray={isHighlighted ? 'none' : '4,4'}
                        opacity={isHighlighted ? 0.9 : 0.5}
                      />
                    );
                  })
                )}
              </svg>

              {/* Render Interactive Nodes */}
              {filteredNodes.map((node) => {
                const colors = getNodeColor(node.type);
                const isSelected = selectedNodeId === node.id;
                const isConnected =
                  selectedNode.connections.includes(node.id) ||
                  node.connections.includes(selectedNode.id);

                return (
                  <button
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    className={`absolute z-10 px-3 py-1.5 rounded-xl border-2 text-xs font-code transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'scale-110 ring-4 ring-[#493B55]/20 pixel-box-shadow z-20 font-bold'
                        : isConnected
                        ? 'opacity-100 hover:scale-105'
                        : 'opacity-85 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: colors.bg,
                      borderColor: colors.border,
                      color: colors.text,
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#493B55]" />
                      <span>{node.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Color Key */}
            <div className="absolute bottom-3 left-4 right-4 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-[#493B55]/20 flex flex-wrap items-center justify-between text-[11px] gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DCCFF5] border border-[#493B55]" />
                  <span>Main App</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F8DCE8] border border-[#493B55]" />
                  <span>Components</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFE4D2] border border-[#493B55]" />
                  <span>Functions</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D8F0E3] border border-[#493B55]" />
                  <span>Modules</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#DCEBFA] border border-[#493B55]" />
                  <span>Dependencies</span>
                </span>
              </div>
              <span className="text-[#493B55]/60 font-code">Click node to inspect</span>
            </div>

          </div>

          {/* Node Inspector Side Panel & Cat Architecture Mascot */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Cat Mascot Commentary Card */}
            <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#493B55] shrink-0 bg-[#D8F0E3]">
                <img
                  src="/src/assets/images/mascot_cat_architect_1794308343178.jpg"
                  alt="Cat Architecture Guide"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs">
                <div className="font-pixel text-[#493B55] font-bold mb-1">ARCHITECT CAT SAYS</div>
                <p className="text-[#493B55]/85 leading-tight font-sans">
                  "No cyclical imports detected in this graph! Modularity score is blooming at 94%."
                </p>
              </div>
            </div>

            {/* Selected Node Details Card */}
            <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#493B55]/15">
                <span className="text-xs font-semibold text-[#493B55]/70">Node Inspector</span>
                <span className="text-[11px] font-code bg-[#DCCFF5] text-[#493B55] px-2 py-0.5 rounded font-bold">
                  {getNodeColor(selectedNode.type).tag}
                </span>
              </div>

              <h3 className="font-code text-base font-bold text-[#493B55] mb-2 break-all">
                {selectedNode.label}
              </h3>

              <p className="text-xs text-[#493B55]/80 mb-4 leading-relaxed font-sans">
                {selectedNode.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs font-code mb-4">
                <div className="p-2 bg-[#FFF9F2] rounded-xl border border-[#493B55]/10">
                  <div className="text-[10px] text-[#493B55]/60">Lines of Code</div>
                  <div className="font-bold text-[#493B55] text-sm tabular-nums">
                    {selectedNode.lines > 0 ? selectedNode.lines : 'External'}
                  </div>
                </div>
                <div className="p-2 bg-[#FFF9F2] rounded-xl border border-[#493B55]/10">
                  <div className="text-[10px] text-[#493B55]/60">Complexity</div>
                  <div className="font-bold text-[#493B55] text-sm">
                    {selectedNode.complexity}
                  </div>
                </div>
              </div>

              {/* Connections list */}
              <div>
                <div className="text-xs font-semibold text-[#493B55] mb-2 flex items-center justify-between">
                  <span>Downstream Dependents</span>
                  <span className="text-[10px] text-[#493B55]/60 tabular-nums">
                    {selectedNode.connections.length} links
                  </span>
                </div>
                {selectedNode.connections.length === 0 ? (
                  <div className="text-xs text-[#493B55]/50 italic p-2 bg-[#FFF9F2] rounded-lg">
                    Leaf node with no outbound dependencies.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedNode.connections.map((targetId) => {
                      const target = NODES.find((n) => n.id === targetId);
                      if (!target) return null;
                      return (
                        <button
                          key={targetId}
                          onClick={() => handleNodeClick(targetId)}
                          className="w-full text-left p-1.5 rounded-lg bg-[#FFF9F2] hover:bg-[#F8DCE8]/50 border border-[#493B55]/10 text-xs font-code flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="text-[#493B55] truncate">{target.label}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#493B55]/60 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
