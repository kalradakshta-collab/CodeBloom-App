import React, { useState } from 'react';
import { Sparkles, Check, RefreshCw, AlertCircle, Terminal, HelpCircle } from 'lucide-react';
import { sound } from '../utils/sound';

interface BugScenario {
  id: string;
  title: string;
  file: string;
  errorLine: number;
  errorType: string;
  brokenCode: string[];
  fixedCode: string[];
  explanation: string;
  catComment: string;
}

const BUG_SCENARIOS: BugScenario[] = [
  {
    id: 'race-condition',
    title: 'Async Race Condition',
    file: 'src/hooks/useRepositoryData.ts',
    errorLine: 12,
    errorType: 'Unhandled Async State Leak',
    brokenCode: [
      '// Fetch repo AST and commit history',
      'export function useRepository(repoId: string) {',
      '  const [repo, setRepo] = useState<Repo | null>(null);',
      '  const [loading, setLoading] = useState(true);',
      '',
      '  useEffect(() => {',
      '    setLoading(true);',
      '    // ⚠️ Bug: Race condition if repoId changes before fetch resolves',
      '    fetchRepoData(repoId).then((data) => {',
      '      setRepo(data);',
      '      setLoading(false);',
      '    });',
      '  }, [repoId]);',
      '',
      '  return { repo, loading };',
      '}'
    ],
    fixedCode: [
      '// Fetch repo AST and commit history',
      'export function useRepository(repoId: string) {',
      '  const [repo, setRepo] = useState<Repo | null>(null);',
      '  const [loading, setLoading] = useState(true);',
      '',
      '  useEffect(() => {',
      '    const controller = new AbortController();',
      '    setLoading(true);',
      '    ',
      '    fetchRepoData(repoId, { signal: controller.signal })',
      '      .then((data) => setRepo(data))',
      '      .catch((err) => { if (err.name !== "AbortError") throw err; })',
      '      .finally(() => setLoading(false));',
      '',
      '    return () => controller.abort();',
      '  }, [repoId]);',
      '',
      '  return { repo, loading };',
      '}'
    ],
    explanation:
      'When rapid route switches occur, stale network requests can resolve out-of-order, overwriting newer state with outdated repository metadata. CodeBloom adds an AbortController cleanup handler to invalidate obsolete fetch cycles.',
    catComment:
      'Purr! Stale promises are like chasing yesterday’s laser pointer. I wrapped it with an AbortController so only the active repo resolves!'
  },
  {
    id: 'null-deref',
    title: 'Null Pointer Dereference',
    file: 'src/parser/astResolver.ts',
    errorLine: 9,
    errorType: 'TypeError: Cannot read property "imports" of undefined',
    brokenCode: [
      '// Parse dependency imports from node declarations',
      'export function extractDependencies(node: ASTNode) {',
      '  const dependencies: string[] = [];',
      '  ',
      '  for (const child of node.children) {',
      '    // ⚠️ Bug: child.declaration might be null on comment or empty nodes',
      '    const specifiers = child.declaration.imports;',
      '    for (const spec of specifiers) {',
      '      dependencies.push(spec.source.value);',
      '    }',
      '  }',
      '  return dependencies;',
      '}'
    ],
    fixedCode: [
      '// Parse dependency imports from node declarations',
      'export function extractDependencies(node: ASTNode) {',
      '  const dependencies: string[] = [];',
      '  ',
      '  for (const child of node.children) {',
      '    // ✅ Fixed: Optional chaining and type narrowing guard',
      '    const specifiers = child.declaration?.imports ?? [];',
      '    for (const spec of specifiers) {',
      '      if (spec?.source?.value) {',
      '        dependencies.push(spec.source.value);',
      '      }',
      '    }',
      '  }',
      '  return dependencies;',
      '}'
    ],
    explanation:
      'AST parsers encounter comments, whitespace, and synthetic tokens whose declarations are undefined. Using strict optional chaining and fallback empty arrays prevents unhandled runtime TypeErrors.',
    catComment:
      'Meow! Empty nodes need soft paws. I added safe optional chaining `child.declaration?.imports ?? []` so nothing crashes when parsing comments!'
  },
  {
    id: 'memory-leak',
    title: 'Dangling Event Listener',
    file: 'src/components/GraphCanvas.tsx',
    errorLine: 11,
    errorType: 'Memory Leak: Unremoved ResizeObserver',
    brokenCode: [
      '// Listen for canvas viewport resizing',
      'export function useCanvasResize(canvasRef: RefObject<HTMLCanvasElement>) {',
      '  useEffect(() => {',
      '    const el = canvasRef.current;',
      '    if (!el) return;',
      '    ',
      '    const observer = new ResizeObserver((entries) => {',
      '      // ⚠️ Bug: Observer continues executing after component unmounts',
      '      recalculateViewportBounds(entries[0]);',
      '    });',
      '    observer.observe(el);',
      '  }, [canvasRef]);',
      '}'
    ],
    fixedCode: [
      '// Listen for canvas viewport resizing',
      'export function useCanvasResize(canvasRef: RefObject<HTMLCanvasElement>) {',
      '  useEffect(() => {',
      '    const el = canvasRef.current;',
      '    if (!el) return;',
      '    ',
      '    const observer = new ResizeObserver((entries) => {',
      '      recalculateViewportBounds(entries[0]);',
      '    });',
      '    observer.observe(el);',
      '',
      '    // ✅ Fixed: Disconnect observer on teardown',
      '    return () => observer.disconnect();',
      '  }, [canvasRef]);',
      '}'
    ],
    explanation:
      'Failing to return a cleanup function leaves the ResizeObserver retained in the browser runtime memory heap, triggering layout thrashing and gradual memory leaks across navigation changes.',
    catComment:
      'Always sweep up loose yarn! I tucked in a `return () => observer.disconnect();` cleanup function so your browser stays feather-light.'
  }
];

export const SignatureDebugger: React.FC = () => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [isFixed, setIsFixed] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [showDiff, setShowDiff] = useState(true);

  const scenario = BUG_SCENARIOS[selectedScenarioIndex];

  const handleFixClick = () => {
    if (isFixed) return;
    setIsFixing(true);
    sound.playBloomChime(587.33);

    setTimeout(() => {
      sound.playBloomChime(783.99);
    }, 300);

    setTimeout(() => {
      setIsFixing(false);
      setIsFixed(true);
      sound.playSuccessHarp();
    }, 700);
  };

  const handleReset = () => {
    sound.playSoftTick();
    setIsFixed(false);
  };

  const handleSelectScenario = (index: number) => {
    sound.playSoftTick();
    setSelectedScenarioIndex(index);
    setIsFixed(false);
  };

  return (
    <section id="debugger" className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-transparent via-[#F8DCE8]/20 to-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading with Cat Mascot Lead */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          
          <div className="lg:col-span-8">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#493B55]/70 mb-2">
              <span className="font-pixel">SIGNATURE DEBUGGING WORKSPACE</span>
              <span aria-hidden="true">·</span>
              <span>Intelligent Error Correction</span>
            </div>
            
            {/* Required Heading: "Oops! Found a little bug?" */}
            <h2 className="font-pixel text-3xl sm:text-4xl lg:text-5xl text-[#493B55] mb-4">
              OOPS! FOUND A LITTLE BUG?
            </h2>

            {/* Required Description */}
            <p className="text-base sm:text-lg text-[#493B55]/85 max-w-2xl leading-relaxed">
              Our AI debugging companion helps you understand and fix coding mistakes without the confusion. With real-time AST analysis and calm, gentle explanations, no bug stays mysterious for long.
            </p>
          </div>

          {/* Right Mascot Spotlight (Cat holding tiny pen) */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-2 border-[#493B55] pixel-box-shadow bg-[#FFF9F2] relative">
                <img
                  src="/src/assets/images/mascot_cat_debugging_pen_1794308342603.jpg"
                  alt="CodeBloom Cat mascot holding tiny pen to fix code bug"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 right-2 bg-white/95 text-[10px] font-semibold text-[#493B55] px-2 py-1 rounded-md text-center border border-[#493B55]/20 shadow-xs">
                  Inspector Cat on Duty 🐾
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Scenario Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-[#493B55]/70 mr-2">Select Scenario:</span>
          {BUG_SCENARIOS.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => handleSelectScenario(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedScenarioIndex === idx
                  ? 'bg-[#493B55] text-[#FFF9F2] pixel-box-shadow-sm'
                  : 'bg-white/80 text-[#493B55] hover:bg-white border border-[#493B55]/20'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Real Debugging Workspace Window */}
        <div className="rounded-3xl border-2 border-[#493B55] pixel-box-shadow bg-[#251E2B] text-[#FFF9F2] overflow-hidden">
          
          {/* Top IDE Window Titlebar */}
          <div className="bg-[#1C1622] px-4 py-3 border-b border-[#493B55]/40 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {/* Traffic light window controls */}
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF8080]/90" />
                <div className="w-3 h-3 rounded-full bg-[#FFD580]/90" />
                <div className="w-3 h-3 rounded-full bg-[#A8E6CF]/90" />
              </div>
              <div className="text-xs font-code text-[#F8DCE8]/80 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>{scenario.file}</span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-3 text-xs">
              <span className={`px-2.5 py-1 rounded-md font-code text-[11px] font-medium border ${
                isFixed
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40'
                  : 'bg-rose-950/80 text-rose-300 border-rose-600/40'
              }`}>
                {isFixed ? '✓ Bug Resolved · 0 Invariants Violated' : `⚠️ ${scenario.errorType}`}
              </span>

              <button
                onClick={() => setShowDiff(!showDiff)}
                className="hidden sm:inline-block px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-medium transition-colors cursor-pointer"
              >
                {showDiff ? 'Compact Code' : 'Unified Diff'}
              </button>
            </div>
          </div>

          {/* Main IDE Workspace Split (Code Editor + Inspector Explanation) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#493B55]/30">
            
            {/* Left Column: Real Interactive Code Editor */}
            <div className="lg:col-span-7 p-4 sm:p-6 font-code text-xs sm:text-sm overflow-x-auto bg-[#251E2B]">
              <div className="space-y-1">
                {(isFixed ? scenario.fixedCode : scenario.brokenCode).map((line, idx) => {
                  const lineNum = idx + 1;
                  const isErrorLine = !isFixed && line.includes('⚠️ Bug');
                  const isAddedLine = isFixed && (line.includes('const controller =') || line.includes('return () =>') || line.includes('optional chaining') || line.includes('child.declaration?.imports'));

                  return (
                    <div
                      key={idx}
                      className={`flex items-start py-0.5 px-2 rounded transition-colors ${
                        isErrorLine
                          ? 'bg-rose-500/20 border-l-2 border-rose-400 text-rose-200'
                          : isAddedLine
                          ? 'bg-emerald-500/20 border-l-2 border-emerald-400 text-emerald-200'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span className="w-8 shrink-0 text-white/30 select-none text-right pr-3 text-[11px]">
                        {lineNum}
                      </span>
                      <pre className="font-code leading-relaxed whitespace-pre font-normal">
                        {line}
                      </pre>
                    </div>
                  );
                })}
              </div>

              {/* In-Editor Error Ribbon when broken */}
              {!isFixed && (
                <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-200 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error Detected at Line {scenario.errorLine}:</span>{' '}
                    <span>{scenario.errorType}. High chance of race conditions or null access.</span>
                  </div>
                </div>
              )}

              {/* Success Banner when fixed */}
              {isFixed && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 flex items-start gap-2 text-xs">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Clean Code Patch Applied!</span>{' '}
                    <span>All module invariants preserved. No memory leaks detected.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: AI Cat Explanation & Fix Trigger */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-[#2D2434] flex flex-col justify-between">
              <div>
                
                {/* Cat Mascot Chat Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-[#F8DCE8] shrink-0">
                    <img
                      src="/src/assets/images/mascot_cat_debugging_pen_1794308342603.jpg"
                      alt="Cat Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#FFF9F2] flex items-center gap-1.5">
                      <span>Bloom Inspector</span>
                      <span className="text-[10px] bg-[#F8DCE8] text-[#493B55] px-1.5 py-0.2 rounded font-code font-bold">
                        AI Guide
                      </span>
                    </div>
                    <div className="text-[11px] text-[#F8DCE8]/70">Companion Diagnostic Engine</div>
                  </div>
                </div>

                {/* Cat Mascot Friendly Speech */}
                <div className="p-3.5 rounded-2xl bg-white/10 border border-[#F8DCE8]/20 text-xs text-[#FFF9F2] mb-4 leading-relaxed relative">
                  <p className="font-medium text-[#F8DCE8] mb-1">🐾 Cat AI Note:</p>
                  <p>{scenario.catComment}</p>
                </div>

                {/* Explanation Panel */}
                <div className="mb-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F8DCE8]/70 mb-2 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Root Cause Analysis</span>
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed font-sans">
                    {scenario.explanation}
                  </p>
                </div>

                {/* Suggested Correction summary */}
                <div className="bg-[#1C1622] rounded-xl p-3 border border-white/10 mb-6">
                  <div className="text-[11px] font-semibold text-[#DCCFF5] mb-1">Suggested Correction:</div>
                  <div className="text-[11px] text-white/70 font-code">
                    {isFixed ? '✓ Applied and verified' : 'Ready to patch in 1-click'}
                  </div>
                </div>

              </div>

              {/* Bottom Interactive Trigger: "Let's Fix It Together!" */}
              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <button
                  onClick={handleFixClick}
                  disabled={isFixed || isFixing}
                  className={`flex-1 py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                    isFixed
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40 cursor-default'
                      : isFixing
                      ? 'bg-[#F8DCE8] text-[#493B55] border-[#F8DCE8] animate-pulse'
                      : 'bg-[#F8DCE8] text-[#493B55] hover:bg-[#FFE4D2] border-[#493B55] pixel-box-shadow-sm hover:translate-y-[-1px]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#493B55]" />
                  <span>{isFixed ? "Patched Successfully! ✨" : isFixing ? "Patching Code..." : "Let's Fix It Together!"}</span>
                </button>

                {isFixed && (
                  <button
                    onClick={handleReset}
                    title="Reset to broken state"
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
