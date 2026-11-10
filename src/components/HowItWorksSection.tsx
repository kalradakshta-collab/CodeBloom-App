import React from 'react';
import { GitPullRequest, Cpu, Sparkles, Rocket, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface HowItWorksProps {
  onGetStarted: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ onGetStarted }) => {
  const steps = [
    {
      step: '01',
      title: 'Connect Your Repository',
      desc: 'Point to any public or private GitHub/GitLab URL, or drop a zipped folder. No tokens or invasive repo permissions required.',
      icon: GitPullRequest,
      accent: '#DCCFF5',
    },
    {
      step: '02',
      title: 'Semantic AST Blossom',
      desc: 'Our engine extracts syntax trees, resolves module references, and detects circular chains in under 4 seconds.',
      icon: Cpu,
      accent: '#F8DCE8',
    },
    {
      step: '03',
      title: 'Inspect With Cat Companion',
      desc: 'Chat with our AI cat assistant to explain opaque legacy code, surface silent race conditions, and simulate unified patches.',
      icon: Sparkles,
      accent: '#FFE4D2',
    },
    {
      step: '04',
      title: 'Accelerate Team Onboarding',
      desc: 'Auto-generate personalized learning maps for junior and senior hires. Turn weeks of code confusion into hours of clarity.',
      icon: Rocket,
      accent: '#D8F0E3',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-[#493B55]/70 mb-2">
            <span className="font-pixel">THE ONBOARDING ENGINE</span>
            <span aria-hidden="true">·</span>
            <span>Simple 4-Step Process</span>
          </div>
          <h2 className="font-pixel text-3xl sm:text-4xl text-[#493B55] mb-4">
            FROM COMPLEX TO CRYSTAL CLEAR
          </h2>
          <p className="text-base text-[#493B55]/80">
            How CodeBloom guides your team through the largest codebases with calm confidence.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white/90 rounded-3xl p-6 border-2 border-[#493B55] pixel-box-shadow flex flex-col justify-between hover:translate-y-[-2px] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-pixel text-2xl font-bold text-[#493B55] tabular-nums">
                      {item.step}
                    </span>
                    <div
                      className="w-10 h-10 rounded-xl border border-[#493B55] flex items-center justify-center"
                      style={{ backgroundColor: item.accent }}
                    >
                      <Icon className="w-5 h-5 text-[#493B55]" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-[#493B55] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#493B55]/80 leading-relaxed font-sans">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#493B55]/10 text-[11px] font-code text-[#493B55]/60 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#493B55]" />
                  <span>Step {idx + 1} of 4</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dreamy Petalyx Panoramic Showcase Banner */}
        <div className="rounded-3xl border-2 border-[#493B55] pixel-box-shadow overflow-hidden relative group">
          <div className="relative h-72 sm:h-96 w-full">
            <img
              src="/src/assets/images/dreamy_blossom_landscape_1794308343817.jpg"
              alt="Dreamy Petalyx cherry blossom river and pastel mountains landscape"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            />
            {/* Soft gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#493B55]/85 via-[#493B55]/40 to-transparent flex flex-col justify-end p-6 sm:p-12 text-[#FFF9F2]" />
            
            <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-12 right-6 sm:right-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 z-10">
              <div className="max-w-xl">
                <div className="text-xs font-semibold text-[#F8DCE8] tracking-wider mb-2 flex items-center gap-2">
                  <span className="font-pixel">SERENE SANCTUARY</span>
                  <span aria-hidden="true">·</span>
                  <span>Zero Stress Development</span>
                </div>
                <h3 className="font-pixel text-2xl sm:text-3xl text-white mb-2 leading-tight">
                  CODING IN A DREAMLIKE FLOW
                </h3>
                <p className="text-xs sm:text-sm text-[#F8DCE8]/90 font-sans leading-relaxed">
                  Inspired by peaceful botanical gardens and pixel nostalgia. CodeBloom creates an oasis where technical complexity dissolves into calm understanding.
                </p>
              </div>

              <button
                onClick={() => {
                  sound.playBloomChime(783.99);
                  onGetStarted();
                }}
                className="bg-[#FFF9F2] text-[#493B55] hover:bg-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl border-2 border-[#493B55] pixel-box-shadow-sm hover:translate-y-[-1px] transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <span>Bloom Your Repo Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
