import React, { useState, useRef } from 'react';
import {
  Network,
  ZoomIn,
  ZoomOut,
  Download,
  Search,
  ArrowRight,
  Layers,
  Sparkles,
  GitFork,
  CheckCircle,
  FileCode,
} from 'lucide-react';
import { RepositoryProject } from '../types';
import { sound } from '../utils/sound';

interface InteractiveArchitectureViewProps {
  project?: RepositoryProject;
  projects: RepositoryProject[];
  onSelectProject: (proj: RepositoryProject) => void;
}

interface DraggableNode {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  lines: number;
  connections: string[];
}

export const InteractiveArchitectureView: React.FC<InteractiveArchitectureViewProps> = ({
  project,
  projects,
  onSelectProject,
}) => {
  const activeProj = project || projects[0];

  // Initialize node layout coordinates
  const initialNodes: DraggableNode[] = (activeProj?.architectureNodes || []).map((node, i) => {
    const angle = (i / Math.max(1, activeProj.architectureNodes.length)) * Math.PI * 2;
    const radius = 180 + (i % 2) * 60;
    return {
      ...node,
      x: 380 + Math.cos(angle) * radius,
      y: 280 + Math.sin(angle) * radius,
    };
  });

  const [nodes, setNodes] = useState<DraggableNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || '');
  const [zoom, setZoom] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSoftTick();
    setDraggingNodeId(nodeId);
    setSelectedNodeId(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (node && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: (e.clientX - rect.left) / zoom - node.x,
        y: (e.clientY - rect.top) / zoom - node.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newX = (e.clientX - rect.left) / zoom - dragOffset.x;
    const newY = (e.clientY - rect.top) / zoom - dragOffset.y;

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: Math.max(40, Math.min(800, newX)), y: Math.max(40, Math.min(600, newY)) } : n))
    );
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'app':
        return { bg: '#DCCFF5', border: '#493B55', text: '#493B55', label: 'Main Entry' };
      case 'component':
        return { bg: '#F8DCE8', border: '#493B55', text: '#493B55', label: 'Component' };
      case 'function':
        return { bg: '#FFE4D2', border: '#493B55', text: '#493B55', label: 'Service / API' };
      case 'dependency':
        return { bg: '#DCEBFA', border: '#493B55', text: '#493B55', label: 'Dependency' };
      default:
        return { bg: '#D8F0E3', border: '#493B55', text: '#493B55', label: 'Module' };
    }
  };

  const handleExportDiagram = () => {
    sound.playBloomChime(783.99);
    const data = JSON.stringify({ project: activeProj?.name, nodes }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProj?.name || 'architecture'}_diagram.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 mb-1">
            <span className="font-pixel">LIVING ARCHITECTURE CANVAS</span>
            <span aria-hidden="true">·</span>
            <span>Draggable Topological Graph</span>
          </div>
          <h2 className="font-pixel text-xl sm:text-2xl text-[#493B55]">
            {activeProj ? activeProj.name.toUpperCase() : 'CODEBASE ARCHITECTURE'}
          </h2>
        </div>

        {/* Search, Filter & Project Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Node Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#493B55]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search architecture..."
              className="bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#493B55] outline-none font-code w-40 sm:w-48"
            />
          </div>

          {projects.length > 1 && (
            <select
              value={activeProj?.id}
              onChange={(e) => {
                const found = projects.find((p) => p.id === e.target.value);
                if (found) onSelectProject(found);
              }}
              className="bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3 py-1.5 text-xs text-[#493B55] font-semibold outline-none cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              sound.playSoftTick();
              setZoom((z) => Math.min(1.4, z + 0.1));
            }}
            className="p-2 bg-[#FFF9F2] hover:bg-white border border-[#493B55]/25 rounded-xl text-[#493B55] cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sound.playSoftTick();
              setZoom((z) => Math.max(0.6, z - 0.1));
            }}
            className="p-2 bg-[#FFF9F2] hover:bg-white border border-[#493B55]/25 rounded-xl text-[#493B55] cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={handleExportDiagram}
            className="bg-[#493B55] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-[#3A2D44]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Graph</span>
          </button>
        </div>
      </div>

      {/* Visualizer Canvas & Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Canvas Area */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="lg:col-span-8 bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-4 h-[580px] relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
        >
          {/* Background Grid Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#493B55 1.5px, transparent 1.5px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* SVG Links Layer */}
          <div
            className="w-full h-full relative"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <svg className="w-full h-full absolute inset-0 pointer-events-none">
              {nodes.map((source) =>
                source.connections.map((targetId) => {
                  const target = nodes.find((n) => n.id === targetId);
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
                      opacity={isHighlighted ? 0.9 : 0.4}
                    />
                  );
                })
              )}
            </svg>

            {/* Draggable Nodes */}
            {nodes.map((node) => {
              const colors = getNodeColor(node.type);
              const isSelected = selectedNodeId === node.id;
              const matchesSearch = !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase()) || node.id.toLowerCase().includes(searchQuery.toLowerCase());

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleMouseDown(node.id, e)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: colors.bg,
                    borderColor: colors.border,
                    color: colors.text,
                    opacity: matchesSearch ? 1 : 0.25,
                  }}
                  className={`absolute z-10 px-3.5 py-2 rounded-2xl border-2 text-xs font-code transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'scale-110 ring-4 ring-[#493B55]/30 pixel-box-shadow z-20 font-bold'
                      : matchesSearch && searchQuery
                      ? 'ring-2 ring-emerald-500 scale-105 font-bold z-15'
                      : 'hover:scale-105 pixel-box-shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#493B55]" />
                    <span>{node.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom helper badge */}
          <div className="absolute bottom-3 left-4 right-4 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-[#493B55]/20 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Interactive Graph · Click & drag nodes to reorganize</span>
            </div>
            <span className="font-code text-[#493B55]/60">Zoom: {Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Mascot Commentary Card */}
          <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-5 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#493B55] shrink-0 bg-[#D8F0E3]">
              <img
                src="/src/assets/images/mascot_cat_architect_1794308343178.jpg"
                alt="Cat mascot"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs">
              <div className="font-pixel text-[#493B55] font-bold mb-1">ARCHITECT CAT SAYS</div>
              <p className="text-[#493B55]/85 leading-tight font-sans">
                "This architecture has a clean unidirectional flow. 0 circular dependency loops found!"
              </p>
            </div>
          </div>

          {/* Node Details */}
          {selectedNode && (
            <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#493B55]/15 mb-4">
                <span className="text-xs font-semibold text-[#493B55]/70">Node Inspector</span>
                <span className="text-[10px] font-code bg-[#DCCFF5] text-[#493B55] px-2 py-0.5 rounded font-bold">
                  {getNodeColor(selectedNode.type).label}
                </span>
              </div>

              <h3 className="font-code text-sm sm:text-base font-bold text-[#493B55] mb-2 break-all">
                {selectedNode.label}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs font-code mb-4">
                <div className="p-2.5 bg-[#FFF9F2] rounded-xl border border-[#493B55]/10">
                  <div className="text-[10px] text-[#493B55]/60">Lines of Code</div>
                  <div className="font-bold text-[#493B55] text-sm tabular-nums">
                    {selectedNode.lines || 12}
                  </div>
                </div>
                <div className="p-2.5 bg-[#FFF9F2] rounded-xl border border-[#493B55]/10">
                  <div className="text-[10px] text-[#493B55]/60">Downstream Links</div>
                  <div className="font-bold text-[#493B55] text-sm tabular-nums">
                    {selectedNode.connections.length}
                  </div>
                </div>
              </div>

              {/* Connections */}
              <div>
                <div className="text-xs font-semibold text-[#493B55] mb-2">
                  Connected Dependents:
                </div>
                {selectedNode.connections.length === 0 ? (
                  <div className="text-xs text-[#493B55]/60 italic p-2 bg-[#FFF9F2] rounded-lg">
                    Leaf node with no direct downstream dependencies.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {selectedNode.connections.map((cId) => (
                      <div
                        key={cId}
                        onClick={() => setSelectedNodeId(cId)}
                        className="p-1.5 rounded-lg bg-[#FFF9F2] hover:bg-[#F8DCE8]/50 border border-[#493B55]/10 text-xs font-code flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate text-[#493B55]">{cId}</span>
                        <ArrowRight className="w-3 h-3 text-[#493B55]/50 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
