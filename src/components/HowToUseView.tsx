import React, { useState } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { ActiveTab } from './Sidebar';

interface HowToUseViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const HowToUseView: React.FC<HowToUseViewProps> = ({ onNavigate }) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const steps = [
    {
      num: 1,
      title: 'Create your account',
      desc: 'Sign up with your email to unlock persistent repository storage, server-side usage tracking, and your personalized learning profile.',
      tab: 'settings' as ActiveTab,
    },
    {
      num: 2,
      title: 'Complete your developer profile',
      desc: 'Set your experience level (Beginner, Intermediate, Advanced, Student) and preferred languages so our Cat AI crafts explanations tailored to your background.',
      tab: 'settings' as ActiveTab,
    },
    {
      num: 3,
      title: 'Choose code input method',
      desc: 'Upload a source file, paste code directly in the Monaco-style editor, drop a ZIP archive, or connect a public GitHub repository.',
      tab: 'editor' as ActiveTab,
    },
    {
      num: 4,
      title: 'Select the programming language',
      desc: 'Choose between Python, JavaScript, or TypeScript to activate the exact static analyzer and AST token parsers.',
      tab: 'editor' as ActiveTab,
    },
    {
      num: 5,
      title: 'Click Analyze Code',
      desc: 'Our hermetic static analysis engine and AI companion verify syntax boundaries, variable scopes, unhandled promises, and memory leaks in seconds.',
      tab: 'debugger' as ActiveTab,
    },
    {
      num: 6,
      title: 'View detected errors and explanations',
      desc: 'Inspect red error markers and line-level issue badges. Click any error to read gentle, clear root-cause explanations.',
      tab: 'debugger' as ActiveTab,
    },
    {
      num: 7,
      title: 'Compare original code with suggested corrections',
      desc: 'Review side-by-side: original code on the left with error callouts, and suggested verified corrections on the right with green diff highlights.',
      tab: 'debugger' as ActiveTab,
    },
    {
      num: 8,
      title: 'Accept or reject corrections',
      desc: 'CodeBloom never silently overwrites your work. Explicitly accept individual suggestions, accept all patches, or reject what you want.',
      tab: 'debugger' as ActiveTab,
    },
    {
      num: 9,
      title: 'Download or save corrected code',
      desc: 'Save your reviewed code directly to browser storage or download clean, verified source files ready to commit.',
      tab: 'editor' as ActiveTab,
    },
    {
      num: 10,
      title: 'Explore the architecture diagram and onboarding guide',
      desc: 'Open the topological graph to visualize module connections, functions, and packages, then export your tailored Day 1–Day 3 onboarding guide.',
      tab: 'architecture' as ActiveTab,
    },
  ];

  const faqs = [
    {
      q: 'Does CodeBloom execute my uploaded code on the server?',
      a: 'Never. CodeBloom relies strictly on AST static analysis, token parsing, and AI-powered reasoning. We never execute untrusted user code on the application server.',
    },
    {
      q: 'How does the free 8-hour allowance work?',
      a: 'Every registered developer receives 8 hours (480 minutes / 28,800 seconds) of actual AI compute allowance every single day, automatically resetting at midnight (00:00 UTC). Only actual AI processing time is counted; time spent reading diffs, editing code, browsing the dashboard, or idle time is completely free!',
    },
    {
      q: 'Can I upload proprietary repositories via ZIP?',
      a: 'Yes. Our ZIP parser runs hermetically with strict Zip-Slip path-traversal protection and never shares your code with other users or public feeds.',
    },
    {
      q: 'How does the Cat mascot adapt to my experience level?',
      a: 'Beginners receive simple, everyday analogies with zero intimidating jargon. Intermediate developers receive architectural best practices, and Advanced engineers receive deep memory-safety, concurrency, and AST mechanics.',
    },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Title */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 mb-1">
          <span className="font-pixel">COMPREHENSIVE USER MANUAL</span>
          <span aria-hidden="true">·</span>
          <span>Interactive 10-Step Tutorial</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl text-[#493B55] mb-3">
          HOW TO USE CODEBLOOM
        </h1>
        <p className="text-xs sm:text-sm text-[#493B55]/85 leading-relaxed font-sans max-w-2xl">
          Everything you need to master codebases, debug mistakes without confusion, and navigate repositories with your feline AI companion.
        </p>
      </div>

      {/* 10-Step Interactive Roadmap */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8">
        <h2 className="font-pixel text-base font-bold text-[#493B55] mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#493B55]" />
          <span>STEP-BY-STEP PLATFORM WORKFLOW</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {steps.map((s) => {
            const isSelected = activeStep === s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  sound.playSoftTick();
                  setActiveStep(s.num);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#FFF9F2] border-[#493B55] pixel-box-shadow-sm'
                    : 'bg-white hover:bg-[#FFF9F2] border-[#493B55]/15'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-xs bg-[#DCCFF5] text-[#493B55] px-2 py-0.5 rounded font-bold">
                      STEP {s.num}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playBloomChime(783.99);
                        onNavigate(s.tab);
                      }}
                      className="text-[11px] font-bold text-[#493B55] hover:underline flex items-center gap-1"
                    >
                      <span>Jump</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-[#493B55] mb-1">
                    {s.title}
                  </h3>
                  <p className="text-xs text-[#493B55]/80 leading-relaxed font-sans">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8">
        <h2 className="font-pixel text-base font-bold text-[#493B55] mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#493B55]" />
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = expandedFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#493B55]/20 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => {
                    sound.playSoftTick();
                    setExpandedFaq(isOpen ? null : idx);
                  }}
                  className="w-full text-left p-4 bg-[#FFF9F2] flex items-center justify-between font-bold text-xs sm:text-sm text-[#493B55] cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs text-[#493B55]/85 leading-relaxed font-sans border-t border-[#493B55]/10">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
