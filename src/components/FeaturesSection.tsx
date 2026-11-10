import React, { useState } from 'react';
import {
  Network,
  Bug,
  Compass,
  FolderGit2,
  MessageSquareCode,
  ListTodo,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Code2
} from 'lucide-react';
import { sound } from '../utils/sound';

interface FeaturesSectionProps {
  onSelectFeature?: (featureId: string) => void;
  onOpenDebugger: () => void;
  onOpenArchitecture: () => void;
  onOpenAssistant: () => void;
  onOpenAnalyzer: () => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  onOpenDebugger,
  onOpenArchitecture,
  onOpenAssistant,
  onOpenAnalyzer,
}) => {
  // Interactive state for micro-demos inside cards
  const [activeArchNode, setActiveArchNode] = useState<string>('App.tsx');
  const [debugSnippetFixed, setDebugSnippetFixed] = useState<boolean>(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({ 0: true, 1: false, 2: false });
  const [assistantPrompt, setAssistantPrompt] = useState<string>('How does the bloom state tree resolve?');
  const [assistantAnswer, setAssistantAnswer] = useState<string>(
    'It runs AST static analysis in a WebWorker, builds a bidirectional DAG, and caches module hashes.'
  );

  const toggleTask = (index: number) => {
    sound.playSoftTick();
    setCheckedTasks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const completedTaskCount = Object.values(checkedTasks).filter(Boolean).length;

  return (
    <section id="features" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-[#493B55]/70 mb-2">
            <span className="font-pixel">MODULE OVERVIEW</span>
            <span aria-hidden="true">·</span>
            <span>Intelligent Developer Tooling</span>
          </div>
          <h2 className="font-pixel text-3xl sm:text-4xl text-[#493B55] mb-4">
            EVERYTHING NEEDED TO MASTER CODE
          </h2>
          <p className="text-base text-[#493B55]/80">
            Engineered with deep static analysis and wrapped in a serene pastel sanctuary. Every capability is designed to remove cognitive load.
          </p>
        </div>

        {/* 6 Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* 1. Codebase Architecture Visualizer */}
          <div className="rounded-3xl p-6 bg-gradient-to-b from-[#FFF9F2] to-[#DCCFF5]/30 border-2 border-[#493B55] pixel-box-shadow flex flex-col justify-between group hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#DCCFF5] border-2 border-[#493B55] flex items-center justify-center pixel-box-shadow-sm">
                  <Network className="w-6 h-6 text-[#493B55]" />
                </div>
                <button
                  onClick={() => {
                    sound.playBloomChime(659.25);
                    onOpenArchitecture();
                  }}
                  className="text-xs font-semibold text-[#493B55] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Interactive Map</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-[#493B55] mb-2">
                Codebase Architecture Visualizer
              </h3>
              <p className="text-sm text-[#493B55]/80 mb-5 leading-relaxed">
                Interactive architecture diagrams that expose function trees, module dependencies, and hierarchical data flows.
              </p>

              {/* Interactive Mini Diagram */}
              <div className="bg-white/80 rounded-xl p-3 border border-[#493B55]/20 mb-4">
                <div className="text-[11px] font-code text-[#493B55]/60 mb-2 flex items-center justify-between">
                  <span>DAG Tree Topology</span>
                  <span className="text-[#493B55] font-semibold">{activeArchNode}</span>
                </div>
                <div className="flex items-center justify-between gap-1 text-xs font-code">
                  <button
                    onClick={() => {
                      sound.playSoftTick();
                      setActiveArchNode('App.tsx');
                    }}
                    className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      activeArchNode === 'App.tsx'
                        ? 'bg-[#DCCFF5] text-[#493B55] border-[#493B55] font-bold'
                        : 'bg-white border-[#493B55]/20 text-[#493B55]/70'
                    }`}
                  >
                    App
                  </button>
                  <span className="text-[#493B55]/40">→</span>
                  <button
                    onClick={() => {
                      sound.playSoftTick();
                      setActiveArchNode('Router.tsx');
                    }}
                    className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      activeArchNode === 'Router.tsx'
                        ? 'bg-[#F8DCE8] text-[#493B55] border-[#493B55] font-bold'
                        : 'bg-white border-[#493B55]/20 text-[#493B55]/70'
                    }`}
                  >
                    Router
                  </button>
                  <span className="text-[#493B55]/40">→</span>
                  <button
                    onClick={() => {
                      sound.playSoftTick();
                      setActiveArchNode('Store.ts');
                    }}
                    className={`px-2 py-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      activeArchNode === 'Store.ts'
                        ? 'bg-[#FFE4D2] text-[#493B55] border-[#493B55] font-bold'
                        : 'bg-white border-[#493B55]/20 text-[#493B55]/70'
                    }`}
                  >
                    Store
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 pt-2 border-t border-[#493B55]/10">
              <span>Dynamic AST Rendering</span>
              <span aria-hidden="true">·</span>
              <span>Circular Cycle Detection</span>
            </div>
          </div>

          {/* 2. AI Code Debugger */}
          <div className="rounded-3xl p-6 bg-gradient-to-b from-[#FFF9F2] to-[#F8DCE8]/30 border-2 border-[#493B55] pixel-box-shadow flex flex-col justify-between group hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F8DCE8] border-2 border-[#493B55] flex items-center justify-center pixel-box-shadow-sm">
                  <Bug className="w-6 h-6 text-[#493B55]" />
                </div>
                <button
                  onClick={() => {
                    sound.playBloomChime(783.99);
                    onOpenDebugger();
                  }}
                  className="text-xs font-semibold text-[#493B55] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Fix Bugs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-[#493B55] mb-2">
                AI Code Debugger
              </h3>
              <p className="text-sm text-[#493B55]/80 mb-5 leading-relaxed">
                Spot silent bugs, explain root causes with plain clarity, and preview unified side-by-side corrected diffs.
              </p>

              {/* Interactive Code Preview */}
              <div className="bg-[#493B55] rounded-xl p-3 text-[#FFF9F2] text-xs font-code mb-4">
                <div className="flex items-center justify-between text-[10px] text-[#F8DCE8]/70 pb-2 border-b border-white/10 mb-2">
                  <span>useFetchData.ts</span>
                  <span className="text-[#A8E6CF]">Race Condition</span>
                </div>
                {debugSnippetFixed ? (
                  <div className="text-[#D8F0E3] leading-relaxed">
                    <p className="opacity-60">// Fixed with AbortController</p>
                    <p className="text-emerald-300">+ const ctrl = new AbortController();</p>
                    <p className="text-emerald-300">+ return () =&gt; ctrl.abort();</p>
                  </div>
                ) : (
                  <div className="text-[#F8DCE8] leading-relaxed">
                    <p className="opacity-60">// Memory leak & uncancelled effect</p>
                    <p className="text-rose-300">- fetchData().then(setData);</p>
                    <p className="text-rose-300">- // missing cleanup hook</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    sound.playBloomChime(debugSnippetFixed ? 523.25 : 880);
                    setDebugSnippetFixed(!debugSnippetFixed);
                  }}
                  className="mt-2.5 w-full bg-white/15 hover:bg-white/25 py-1 rounded text-[11px] font-sans font-semibold text-center transition-colors cursor-pointer"
                >
                  {debugSnippetFixed ? 'Reset Bug' : 'Simulate Fix Diff'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 pt-2 border-t border-[#493B55]/10">
              <span>TypeScript Validated</span>
              <span aria-hidden="true">·</span>
              <span>Zero Hallucinations</span>
            </div>
          </div>

          {/* 3. AI Onboarding Guide */}
          <div className="rounded-3xl p-6 bg-gradient-to-b from-[#FFF9F2] to-[#FFE4D2]/30 border-2 border-[#493B55] pixel-box-shadow flex flex-col justify-between group hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE4D2] border-2 border-[#493B55] flex items-center justify-center pixel-box-shadow-sm">
                  <Compass className="w-6 h-6 text-[#493B55]" />
                </div>
                <span className="text-[11px] font-code font-bold text-[#493B55]/70">DAY 1 SPEED</span>
              </div>

              <h3 className="text-lg font-bold text-[#493B55] mb-2">
                AI Onboarding Guide
              </h3>
              <p className="text-sm text-[#493B55]/80 mb-5 leading-relaxed">
                Explain unfamiliar repos in minutes. Generate tailored learning tracks that prioritize the critical 10% of files.
              </p>

              {/* Interactive File Priority Strip */}
              <div className="bg-white/80 rounded-xl p-3 border border-[#493B55]/20 mb-4 space-y-2">
                <div className="text-[11px] font-semibold text-[#493B55] flex items-center justify-between">
                  <span>Critical Entrypoints</span>
                  <span className="text-[#493B55]/60 text-[10px]">Read First</span>
                </div>
                <div className="flex items-center justify-between text-xs font-code p-1.5 bg-[#FFF9F2] rounded border border-[#493B55]/10">
                  <span className="text-[#493B55] font-medium">src/core/engine.ts</span>
                  <span className="text-[10px] bg-[#FFE4D2] text-[#493B55] px-1.5 py-0.5 rounded font-sans font-bold">Must Read</span>
                </div>
                <div className="flex items-center justify-between text-xs font-code p-1.5 bg-[#FFF9F2] rounded border border-[#493B55]/10">
                  <span className="text-[#493B55] font-medium">src/api/auth.ts</span>
                  <span className="text-[10px] bg-[#DCCFF5] text-[#493B55] px-1.5 py-0.5 rounded font-sans font-bold">Core Flow</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 pt-2 border-t border-[#493B55]/10">
              <span>Personalized Tracks</span>
              <span aria-hidden="true">·</span>
              <span>Architectural Context</span>
            </div>
          </div>

          {/* 4. Smart Repository Analyzer */}
          <div className="rounded-3xl p-6 bg-gradient-to-b from-[#FFF9F2] to-[#D8F0E3]/35 border-2 border-[#493B55] pixel-box-shadow flex flex-col justify-between group hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D8F0E3] border-2 border-[#493B55] flex items-center justify-center pixel-box-shadow-sm">
                  <FolderGit2 className="w-6 h-6 text-[#493B55]" />
                </div>
                <button
                  onClick={() => {
                    sound.playBloomChime(587.33);
                    onOpenAnalyzer();
                  }}
                  className="text-xs font-semibold text-[#493B55] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Lab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-[#493B55] mb-2">
                Smart Repository Analyzer
              </h3>
              <p className="text-sm text-[#493B55]/80 mb-5 leading-relaxed">
                Connect GitHub, GitLab, or upload raw ZIP archives. We parse folders, files, licenses, and external dependencies.
              </p>

              {/* Analyzer preview */}
              <div className="bg-white/80 rounded-xl p-3 border border-[#493B55]/20 mb-4">
                <div className="flex items-center justify-between text-xs font-code mb-2">
                  <span className="text-[#493B55] font-semibold">Parsed Manifest</span>
                  <span className="text-emerald-600 font-bold">Ready</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-[11px] font-code">
                  <div className="bg-[#D8F0E3]/50 p-2 rounded border border-[#493B55]/10">
                    <div className="text-base font-bold text-[#493B55]">142</div>
                    <div className="text-[10px] text-[#493B55]/70">Source Files</div>
                  </div>
                  <div className="bg-[#DCEBFA]/50 p-2 rounded border border-[#493B55]/10">
                    <div className="text-base font-bold text-[#493B55]">18</div>
                    <div className="text-[10px] text-[#493B55]/70">Sub-packages</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 pt-2 border-t border-[#493B55]/10">
              <span>GitHub API Synced</span>
              <span aria-hidden="true">·</span>
              <span>ZIP Drag-and-Drop</span>
            </div>
          </div>

          {/* 5. AI Developer Assistant */}
          <div className="rounded-3xl p-6 bg-gradient-to-b from-[#FFF9F2] to-[#DCEBFA]/35 border-2 border-[#493B55] pixel-box-shadow flex flex-col justify-between group hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#DCEBFA] border-2 border-[#493B55] flex items-center justify-center pixel-box-shadow-sm">
                  <MessageSquareCode className="w-6 h-6 text-[#493B55]" />
                </div>
                <button
                  onClick={() => {
                    sound.playBloomChime(783.99);
                    onOpenAssistant();
                  }}
                  className="text-xs font-semibold text-[#493B55] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Chat With Mascot</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-[#493B55] mb-2">
                AI Developer Assistant
              </h3>
              <p className="text-sm text-[#493B55]/80 mb-5 leading-relaxed">
                Ask deep contextual questions. Understand why legacy code was written that way and discover optimization avenues.
              </p>

              {/* Chat simulation */}
              <div className="bg-white/90 rounded-xl p-3 border border-[#493B55]/20 mb-4 text-xs">
                <div className="bg-[#DCEBFA]/60 p-2 rounded-lg text-[#493B55] font-medium mb-2 flex items-center gap-1.5">
                  <span className="text-xs">🐾</span>
                  <span className="truncate">{assistantPrompt}</span>
                </div>
                <div className="text-[11px] text-[#493B55]/85 bg-[#FFF9F2] p-2 rounded-lg border border-[#493B55]/10 leading-relaxed font-sans">
                  {assistantAnswer}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 pt-2 border-t border-[#493B55]/10">
              <span>Deep Context Awareness</span>
              <span aria-hidden="true">·</span>
              <span>Semantic Search</span>
            </div>
          </div>

          {/* 6. Developer Task Manager */}
          <div className="rounded-3xl p-6 bg-gradient-to-b from-[#FFF9F2] to-[#F8DCE8]/30 border-2 border-[#493B55] pixel-box-shadow flex flex-col justify-between group hover:translate-y-[-2px] transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F8DCE8] border-2 border-[#493B55] flex items-center justify-center pixel-box-shadow-sm">
                  <ListTodo className="w-6 h-6 text-[#493B55]" />
                </div>
                <span className="text-[11px] font-code font-bold text-[#493B55]/70">
                  {completedTaskCount}/3 DONE
                </span>
              </div>

              <h3 className="text-lg font-bold text-[#493B55] mb-2">
                Developer Task Manager
              </h3>
              <p className="text-sm text-[#493B55]/80 mb-5 leading-relaxed">
                Automatically breaks repo onboarding into bite-sized, sequential tasks. Track team velocity and celebrate progress.
              </p>

              {/* Interactive checklist */}
              <div className="bg-white/80 rounded-xl p-3 border border-[#493B55]/20 mb-4 space-y-2">
                {[
                  'Inspect main config in bloom.config.ts',
                  'Run sandbox build and test pipeline',
                  'Resolve identified unhandled promise',
                ].map((task, i) => (
                  <div
                    key={i}
                    onClick={() => toggleTask(i)}
                    className="flex items-center gap-2 text-xs text-[#493B55] cursor-pointer hover:bg-[#FFF9F2] p-1.5 rounded transition-colors"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        checkedTasks[i]
                          ? 'bg-[#493B55] border-[#493B55] text-white'
                          : 'border-[#493B55]/40 bg-white'
                      }`}
                    >
                      {checkedTasks[i] && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={checkedTasks[i] ? 'line-through opacity-60' : 'font-medium'}>
                      {task}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 pt-2 border-t border-[#493B55]/10">
              <span>Automatic Roadmap</span>
              <span aria-hidden="true">·</span>
              <span>Team Synchronization</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
