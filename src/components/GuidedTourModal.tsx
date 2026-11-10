import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, X } from 'lucide-react';
import { sound } from '../utils/sound';
import { ActiveTab } from './Sidebar';

interface GuidedTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: ActiveTab) => void;
}

export const GuidedTourModal: React.FC<GuidedTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const tourSteps: {
    title: string;
    description: string;
    tab: ActiveTab;
    tip: string;
    catSpeech: string;
  }[] = [
    {
      title: 'Welcome to CodeBloom!',
      description:
        'CodeBloom is your AI-powered codebase architecture and onboarding companion. Let us show you around in 4 quick highlights.',
      tab: 'dashboard',
      tip: 'Explore your real-time stats and server usage from the main dashboard.',
      catSpeech: 'Meow! I am your companion cat. I will guide you through foreign codebases!',
    },
    {
      title: 'Complete Code Editor',
      description:
        'Write or upload Python and JavaScript/TypeScript files with live line numbers, error highlighting, and download capabilities.',
      tab: 'editor',
      tip: 'Click "Analyze in Debugger" anytime to inspect bugs side-by-side.',
      catSpeech: 'Purr! Paste any broken code here and I will sniff out syntax traps!',
    },
    {
      title: 'Signature Side-by-Side Debugger',
      description:
        'Our signature two-column workspace. Original code on the left with error callouts, and suggested verified corrections on the right.',
      tab: 'debugger',
      tip: 'We never silently overwrite your code. Accept or reject suggestions explicitly.',
      catSpeech: 'Holding my tiny pen to highlight exactly what line needs fixing!',
    },
    {
      title: 'Living Architecture Map',
      description:
        'Visualize interconnected functions, components, modules, and external packages in living pastel colors. Drag nodes to reorganize clusters.',
      tab: 'architecture',
      tip: 'Click any node to see cyclomatic complexity and downstream dependents.',
      catSpeech: 'Zero circular loops! Your architecture has never bloomed so brightly.',
    },
  ];

  const step = tourSteps[currentStep];

  const handleNext = () => {
    sound.playBloomChime(659.25);
    if (currentStep < tourSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      onNavigateToTab(tourSteps[next].tab);
    } else {
      sound.playSuccessHarp();
      onClose();
    }
  };

  const handlePrev = () => {
    sound.playSoftTick();
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      onNavigateToTab(tourSteps[prev].tab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493B55]/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow w-full max-w-lg p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playSoftTick();
            onClose();
          }}
          className="absolute top-5 right-5 p-1.5 rounded-lg border border-[#493B55]/20 hover:bg-[#F8DCE8] text-[#493B55] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 mb-4">
          {tourSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-8 bg-[#493B55]' : 'w-2 bg-[#493B55]/20'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-[#F8DCE8] border border-[#493B55] flex items-center justify-center text-sm">
            🌸
          </div>
          <div>
            <span className="text-[10px] font-pixel text-[#493B55]/60 uppercase">
              PLATFORM TOUR · {currentStep + 1} OF {tourSteps.length}
            </span>
            <h3 className="font-pixel text-lg sm:text-xl font-bold text-[#493B55]">
              {step.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-[#493B55]/85 leading-relaxed font-sans mb-4">
          {step.description}
        </p>

        {/* Cat Mascot Tip */}
        <div className="p-3.5 rounded-2xl bg-white border border-[#493B55]/15 flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#493B55] shrink-0 bg-[#DCCFF5]">
            <img
              src="/src/assets/images/hero_mascot_cat_1794308342384.jpg"
              alt="Cat"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-xs">
            <div className="font-bold text-[#493B55] mb-0.5">Cat Mascot Says:</div>
            <p className="text-[#493B55]/80 font-sans leading-relaxed">{step.catSpeech}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#493B55]/10">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-2 text-xs font-bold text-[#493B55] disabled:opacity-30 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="bg-[#493B55] hover:bg-[#382D42] text-[#FFF9F2] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-[#493B55] pixel-box-shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{currentStep === tourSteps.length - 1 ? 'Finish Tour! 🌸' : 'Next Step'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
