import React from 'react';
import {
  Code2,
  Bug,
  FolderGit2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCode,
  ShieldAlert,
  Play,
  Terminal,
} from 'lucide-react';
import { UserProfile, UserUsage, RepositoryProject, DebugCorrection } from '../types';
import { sound } from '../utils/sound';
import { ActiveTab } from './Sidebar';

interface DashboardViewProps {
  user: UserProfile;
  usage: UserUsage;
  projects: RepositoryProject[];
  corrections: DebugCorrection[];
  onNavigate: (tab: ActiveTab) => void;
  onStartTour: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  usage,
  projects,
  corrections,
  onNavigate,
  onStartTour,
}) => {
  const maxDaily = usage.maxDailySeconds || (usage.plan === 'paid' ? 72000 : 28800);
  const dailyUsed = usage.dailySecondsUsed || 0;
  const remainingDailySeconds = Math.max(0, maxDaily - dailyUsed);
  const remainingDailyHours = (remainingDailySeconds / 3600).toFixed(1);
  const isNearlyExhausted = usage.plan === 'free' && remainingDailySeconds > 0 && remainingDailySeconds <= 5400;
  const isExhausted = usage.plan === 'free' && remainingDailySeconds <= 0;
  const fixedCount = corrections.filter((c) => c.status === 'accepted').length;
  const totalErrorsFound = corrections.reduce((acc, c) => acc + c.detectedIssues.length, 0);
  const totalFilesAnalyzed = projects.reduce((acc, p) => acc + p.files.length, 0);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-6xl mx-auto">
      
      {/* Daily Allowance Exhausted Banner */}
      {isExhausted && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-900 flex items-start justify-between gap-4 text-xs font-sans">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-rose-950 font-pixel">
                DAILY 8-HOUR FREE ALLOWANCE REACHED
              </div>
              <p className="mt-0.5 leading-relaxed text-rose-800">
                Your free-tier AI operations (AI Debugger & AI Chat) are paused until midnight UTC.
                You can continue using non-AI tools (Code Editor, Repository Explorer, and Architecture Visualizer), or upgrade to CodeBloom Pro ($25/mo) for 20h/day priority compute.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('pricing')}
            className="px-3.5 py-2 rounded-xl bg-[#493B55] text-white font-bold hover:bg-[#382D42] shrink-0 cursor-pointer"
          >
            Upgrade to Pro ($25/mo)
          </button>
        </div>
      )}

      {/* Daily Allowance Nearly Exhausted Warning */}
      {isNearlyExhausted && !isExhausted && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-3 text-xs font-sans">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Allowance Notice:</strong> You have {remainingDailyHours} hours remaining today. Usage resets automatically every day at midnight UTC.
            </span>
          </div>
          <button
            onClick={() => onNavigate('pricing')}
            className="text-amber-900 font-bold underline shrink-0 cursor-pointer"
          >
            Manage Plan →
          </button>
        </div>
      )}

      {/* Top Welcome Banner with Cat Mascot */}
      <div className="rounded-3xl border-2 border-[#493B55] pixel-box-shadow bg-gradient-to-r from-[#FFF9F2] via-[#F8DCE8]/30 to-[#DCCFF5]/40 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 mb-2">
            <span className="font-pixel">DEVELOPER WORKSPACE</span>
            <span aria-hidden="true">·</span>
            <span>{user.skillLevel} Level</span>
          </div>

          <h1 className="font-pixel text-2xl sm:text-3xl lg:text-4xl text-[#493B55] mb-2">
            WELCOME BACK, {user.fullName.toUpperCase()}!
          </h1>

          <p className="text-xs sm:text-sm text-[#493B55]/85 leading-relaxed font-sans mb-6">
            Your CodeBloom companion is ready. We have indexed your active repositories and calibrated our AST engine for {user.preferredLanguages.join(', ')}.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sound.playBloomChime(783.99);
                onNavigate('debugger');
              }}
              className="bg-[#493B55] text-white hover:bg-[#382D42] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-[#493B55] pixel-box-shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bug className="w-4 h-4 text-[#F8DCE8]" />
              <span>Debug Code Now</span>
            </button>

            <button
              onClick={() => {
                sound.playSoftTick();
                onNavigate('repositories');
              }}
              className="bg-white hover:bg-[#FFF9F2] text-[#493B55] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-[#493B55]/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <FolderGit2 className="w-4 h-4 text-[#493B55]" />
              <span>Analyze New Repo</span>
            </button>

            <button
              onClick={onStartTour}
              className="bg-[#DCCFF5]/80 hover:bg-[#DCCFF5] text-[#493B55] px-3.5 py-2.5 rounded-xl font-semibold text-xs border border-[#493B55]/20 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Take Platform Tour</span>
            </button>
          </div>
        </div>

        {/* Mascot Mini Portrait */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden border-2 border-[#493B55] bg-white shrink-0 pixel-box-shadow-sm relative">
          <img
            src="/src/assets/images/hero_mascot_cat_1794308342384.jpg"
            alt="Cat mascot"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-white/95 text-[10px] font-semibold text-[#493B55] px-1.5 py-0.5 rounded text-center border border-[#493B55]/20 shadow-xs">
            Companion Active 🐾
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: Daily Usage Hours */}
        <div className="bg-white rounded-2xl border-2 border-[#493B55] pixel-box-shadow p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#493B55]/70 mb-2">
            <span className="font-semibold">Today's Remaining Usage</span>
            <Clock className="w-4 h-4 text-[#493B55]" />
          </div>
          <div className="font-pixel text-2xl font-bold text-[#493B55] tabular-nums">
            {usage.plan === 'paid' ? `${remainingDailyHours} hrs` : isExhausted ? '0.0 hrs' : `${remainingDailyHours} hrs`}
          </div>
          <div className="text-[11px] text-[#493B55]/60 mt-1 flex items-center justify-between">
            <span>{usage.plan === 'paid' ? 'Pro (20h/day limit)' : 'Resets at midnight UTC'}</span>
            <button
              onClick={() => onNavigate('pricing')}
              className="text-[#493B55] font-bold underline cursor-pointer"
            >
              Details
            </button>
          </div>
        </div>

        {/* Card 2: Files Analyzed */}
        <div className="bg-white rounded-2xl border-2 border-[#493B55] pixel-box-shadow p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#493B55]/70 mb-2">
            <span className="font-semibold">Analyzed Files</span>
            <FileCode className="w-4 h-4 text-[#493B55]" />
          </div>
          <div className="font-pixel text-2xl font-bold text-[#493B55] tabular-nums">
            {totalFilesAnalyzed || 14}
          </div>
          <div className="text-[11px] text-[#493B55]/60 mt-1">Across {projects.length || 1} repository</div>
        </div>

        {/* Card 3: Issues Found */}
        <div className="bg-white rounded-2xl border-2 border-[#493B55] pixel-box-shadow p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#493B55]/70 mb-2">
            <span className="font-semibold">Issues Identified</span>
            <ShieldAlert className="w-4 h-4 text-[#493B55]" />
          </div>
          <div className="font-pixel text-2xl font-bold text-amber-600 tabular-nums">
            {totalErrorsFound || 3}
          </div>
          <div className="text-[11px] text-[#493B55]/60 mt-1">Syntax & race conditions</div>
        </div>

        {/* Card 4: Bugs Fixed */}
        <div className="bg-white rounded-2xl border-2 border-[#493B55] pixel-box-shadow p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-[#493B55]/70 mb-2">
            <span className="font-semibold">Patches Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-pixel text-2xl font-bold text-emerald-600 tabular-nums">
            {fixedCount || 2}
          </div>
          <div className="text-[11px] text-[#493B55]/60 mt-1">Zero regressions</div>
        </div>

      </div>

      {/* Main Grid: Recent Projects + Learning Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Projects */}
        <div className="lg:col-span-7 bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#493B55]/15 mb-4">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-[#493B55]" />
              <h2 className="font-pixel text-base font-bold text-[#493B55]">
                RECENT REPOSITORIES
              </h2>
            </div>
            <button
              onClick={() => onNavigate('repositories')}
              className="text-xs font-semibold text-[#493B55] hover:underline cursor-pointer"
            >
              View All ({projects.length})
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#493B55]/60">
              No repositories added yet. Upload a ZIP or link a GitHub URL!
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => {
                    sound.playBloomChime(659.25);
                    onNavigate('architecture');
                  }}
                  className="p-4 rounded-2xl bg-[#FFF9F2] hover:bg-[#F8DCE8]/30 border border-[#493B55]/15 hover:border-[#493B55]/40 transition-all flex items-center justify-between cursor-pointer"
                >
                  <div>
                    <div className="text-xs sm:text-sm font-bold font-code text-[#493B55]">
                      {proj.name}
                    </div>
                    <div className="text-[11px] text-[#493B55]/70 flex items-center gap-2 mt-0.5">
                      <span>{proj.files.length} files</span>
                      <span>·</span>
                      <span>{proj.dependencies.length} deps</span>
                      <span>·</span>
                      <span className="capitalize">{proj.source}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-code bg-[#D8F0E3] text-[#493B55] px-2 py-0.5 rounded font-bold">
                      {proj.complexityScore}/100 Score
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#493B55]/60" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Code Analysis prompt */}
          <div className="mt-6 p-4 rounded-2xl bg-[#DCCFF5]/40 border border-[#493B55]/20 flex items-center justify-between">
            <div className="text-xs text-[#493B55]">
              <span className="font-bold">Need a fast snippet review?</span> Paste code in the editor to see instant side-by-side AST fixes.
            </div>
            <button
              onClick={() => onNavigate('editor')}
              className="bg-[#493B55] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
            >
              Open Editor
            </button>
          </div>
        </div>

        {/* Right Column: Suggested Learning Tasks & Onboarding */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#493B55]/15 mb-4">
              <span className="font-pixel text-sm font-bold text-[#493B55]">
                RECOMMENDED SPRINT
              </span>
              <span className="text-[10px] font-code bg-[#FFE4D2] text-[#493B55] px-1.5 py-0.5 rounded font-bold">
                {user.skillLevel}
              </span>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Inspect entry point in Architecture Map', done: true },
                { title: 'Run side-by-side debugger on useRepository hook', done: true },
                { title: 'Read Day 1 personalized onboarding guide', done: false },
                { title: 'Ask Cat AI to explain the authentication pipeline', done: false },
              ].map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-xs text-[#493B55] p-2 rounded-xl bg-[#FFF9F2] border border-[#493B55]/10"
                >
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      task.done ? 'bg-emerald-600 text-white' : 'border border-[#493B55]/40 bg-white'
                    }`}
                  >
                    {task.done ? '✓' : ''}
                  </div>
                  <span className={task.done ? 'line-through text-[#493B55]/50' : 'font-medium'}>
                    {task.title}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('tasks')}
              className="mt-4 w-full text-center text-xs font-bold text-[#493B55] hover:underline cursor-pointer"
            >
              Open Full Task Manager →
            </button>
          </div>

          {/* Quick Mascot Tip Card */}
          <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-5 flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#493B55] shrink-0 bg-[#F8DCE8]">
              <img
                src="/src/assets/images/mascot_cat_debugging_pen_1794308342603.jpg"
                alt="Cat mascot"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs">
              <div className="font-pixel text-[#493B55] font-bold mb-1">CAT COMPANION TIP</div>
              <p className="text-[#493B55]/85 leading-relaxed font-sans">
                "Did you know? In the Architecture Map you can drag nodes to rearrange clusters or click any component to trace all downstream callers!"
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
