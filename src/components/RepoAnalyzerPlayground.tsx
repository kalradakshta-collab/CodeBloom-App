import React, { useState } from 'react';
import { FolderGit2, Upload, FileCode2, Check, ArrowRight, ShieldCheck, Sparkles, AlertTriangle, Layers } from 'lucide-react';
import { sound } from '../utils/sound';

interface RepoSummary {
  name: string;
  filesCount: number;
  dependenciesCount: number;
  complexityScore: number;
  circularCycles: number;
  files: { path: string; lines: number; type: string }[];
  catTip: string;
}

const REPO_PRESETS: Record<string, RepoSummary> = {
  'facebook/react': {
    name: 'facebook/react',
    filesCount: 1420,
    dependenciesCount: 38,
    complexityScore: 84,
    circularCycles: 0,
    files: [
      { path: 'packages/react/src/React.js', lines: 145, type: 'Core Export' },
      { path: 'packages/react-reconciler/src/ReactFiber.js', lines: 890, type: 'Reconciliation' },
      { path: 'packages/react-dom/src/client/ReactDOMRoot.js', lines: 320, type: 'DOM Renderer' },
      { path: 'packages/scheduler/src/forks/Scheduler.js', lines: 410, type: 'Task Priority' },
    ],
    catTip: 'Purr! React Fiber uses cooperative concurrency. Notice how ReactFiberWorkLoop handles interruption without dropping frame rates!'
  },
  'tailwindlabs/tailwindcss': {
    name: 'tailwindlabs/tailwindcss',
    filesCount: 680,
    dependenciesCount: 19,
    complexityScore: 72,
    circularCycles: 0,
    files: [
      { path: 'packages/tailwindcss/src/index.ts', lines: 210, type: 'Compiler Entry' },
      { path: 'packages/tailwindcss/src/ast.ts', lines: 520, type: 'Lightning CSS AST' },
      { path: 'packages/tailwindcss/src/candidate.ts', lines: 340, type: 'Class Matcher' },
      { path: 'packages/tailwindcss/src/theme.ts', lines: 180, type: 'Variable Engine' },
    ],
    catTip: 'Meow! Tailwind v4 rewrote the parser in Rust/LightningCSS for instant JIT compilation with zero config overhead!'
  },
  'bloom/dreamy-cart': {
    name: 'bloom/dreamy-cart',
    filesCount: 46,
    dependenciesCount: 12,
    complexityScore: 32,
    circularCycles: 0,
    files: [
      { path: 'src/App.tsx', lines: 110, type: 'Layout Root' },
      { path: 'src/components/Checkout.tsx', lines: 230, type: 'Component' },
      { path: 'src/services/stripe.ts', lines: 95, type: 'Payment API' },
      { path: 'src/store/cartStore.ts', lines: 140, type: 'Zustand State' },
    ],
    catTip: 'A dreamy, clean codebase! Modularity is 98%, and cart state is purely decoupled from checkout side effects.'
  }
};

export const RepoAnalyzerPlayground: React.FC = () => {
  const [selectedRepoKey, setSelectedRepoKey] = useState<string>('bloom/dreamy-cart');
  const [customInput, setCustomInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);

  const activeRepo = REPO_PRESETS[selectedRepoKey] || REPO_PRESETS['bloom/dreamy-cart'];

  const handleRunAnalysis = (key: string) => {
    sound.playBloomChime(523.25);
    setIsAnalyzing(true);
    setSelectedRepoKey(key);

    setTimeout(() => {
      sound.playBloomChime(659.25);
    }, 400);

    setTimeout(() => {
      sound.playBloomChime(783.99);
      setIsAnalyzing(false);
      sound.playSuccessHarp();
    }, 900);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    handleRunAnalysis(customInput.trim());
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    sound.playBloomChime(659.25);
    handleRunAnalysis('bloom/dreamy-cart');
  };

  return (
    <section className="py-20 sm:py-28 relative bg-[#FFF9F2]/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-[#493B55]/70 mb-2">
            <span className="font-pixel">SMART REPOSITORY LAB</span>
            <span aria-hidden="true">·</span>
            <span>Live Analysis Playground</span>
          </div>
          <h2 className="font-pixel text-3xl sm:text-4xl text-[#493B55] mb-3">
            TEST ANY REPOSITORY IN SECONDS
          </h2>
          <p className="text-base text-[#493B55]/80">
            Upload a ZIP archive or connect public GitHub repositories to experience instant architecture blooms.
          </p>
        </div>

        {/* Input Bar & Preset Switches */}
        <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Input Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleCustomSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FolderGit2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#493B55]/60" />
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter github.com/owner/repo..."
                    className="w-full bg-[#FFF9F2] border border-[#493B55]/30 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#493B55] font-code outline-none focus:ring-2 focus:ring-[#DCCFF5]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="bg-[#493B55] hover:bg-[#382D42] text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-[#F8DCE8]" />
                  <span>Analyze</span>
                </button>
              </form>

              {/* Preset Buttons */}
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="text-[#493B55]/60">Or pick preset:</span>
                {Object.keys(REPO_PRESETS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRunAnalysis(key)}
                    className={`px-2.5 py-1 rounded-lg font-code transition-colors cursor-pointer ${
                      selectedRepoKey === key
                        ? 'bg-[#F8DCE8] text-[#493B55] font-bold border border-[#493B55]'
                        : 'bg-[#FFF9F2] text-[#493B55]/80 hover:bg-[#DCCFF5]/50 border border-[#493B55]/15'
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: ZIP Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => handleRunAnalysis('bloom/dreamy-cart')}
              className={`lg:col-span-5 border-2 border-dashed rounded-2xl p-4 text-center transition-colors cursor-pointer flex flex-col items-center justify-center ${
                dragOver
                  ? 'border-[#493B55] bg-[#F8DCE8]/50'
                  : 'border-[#493B55]/30 hover:border-[#493B55] bg-[#FFF9F2]'
              }`}
            >
              <Upload className="w-5 h-5 text-[#493B55]/70 mb-1" />
              <div className="text-xs font-semibold text-[#493B55]">Drop Repository .ZIP Here</div>
              <div className="text-[10px] text-[#493B55]/60 mt-0.5">Parsed client-side with zero data egress</div>
            </div>

          </div>
        </div>

        {/* Results Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Metrics summary */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#493B55]/15 mb-4">
                <span className="text-xs font-semibold text-[#493B55]/70">Repository Health</span>
                <span className="text-[11px] font-code bg-[#D8F0E3] text-[#493B55] px-2 py-0.5 rounded font-bold">
                  {isAnalyzing ? 'Scanning...' : 'Validated'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#493B55]/70">Source Files</span>
                  <span className="font-code font-bold text-[#493B55] tabular-nums">
                    {isAnalyzing ? '...' : activeRepo.filesCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#493B55]/70">Dependencies</span>
                  <span className="font-code font-bold text-[#493B55] tabular-nums">
                    {isAnalyzing ? '...' : activeRepo.dependenciesCount} packages
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#493B55]/70">Complexity Score</span>
                  <span className="font-code font-bold text-[#493B55] tabular-nums">
                    {isAnalyzing ? '...' : `${activeRepo.complexityScore}/100`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#493B55]/70">Circular Dependencies</span>
                  <span className="font-code font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>0 detected</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Cat Mascot Commentary */}
            <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-5 flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#493B55] shrink-0 bg-[#F8DCE8]">
                <img
                  src="/src/assets/images/hero_mascot_cat_1794308342384.jpg"
                  alt="Cat Mascot"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs">
                <div className="font-pixel text-[#493B55] font-bold mb-1">CAT ARCHITECT TIP</div>
                <p className="text-[#493B55]/85 leading-relaxed font-sans">
                  {isAnalyzing ? 'Decoding AST syntax nodes...' : activeRepo.catTip}
                </p>
              </div>
            </div>

          </div>

          {/* Files Manifest Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#493B55]/15 mb-4">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-[#493B55]" />
                <span className="text-xs sm:text-sm font-bold text-[#493B55]">
                  High-Impact Files ({activeRepo.name})
                </span>
              </div>
              <span className="text-[11px] font-code text-[#493B55]/60">Ranked by AST Centrality</span>
            </div>

            <div className="space-y-2">
              {activeRepo.files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FFF9F2] border border-[#493B55]/10 hover:border-[#493B55]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-pixel text-xs text-[#493B55]/50 w-5">
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-code font-bold text-[#493B55]">
                        {file.path}
                      </div>
                      <div className="text-[10px] text-[#493B55]/60 font-sans">
                        {file.type}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-code font-semibold text-[#493B55] tabular-nums">
                      {file.lines} LOC
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#493B55]/10 flex items-center justify-between text-xs text-[#493B55]/70">
              <span>Ready for interactive onboarding tour</span>
              <button
                onClick={() => {
                  sound.playBloomChime(783.99);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="font-bold text-[#493B55] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Launch Visualizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
