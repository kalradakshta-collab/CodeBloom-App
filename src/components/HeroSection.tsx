import React, { useState } from 'react';
import { ArrowRight, Sparkles, Terminal, Play, GitBranch, ShieldCheck, Heart } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeroSectionProps {
  onAnalyzeRepo: (repoUrl?: string) => void;
  onExploreFeatures: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onAnalyzeRepo,
  onExploreFeatures,
}) => {
  const [repoInput, setRepoInput] = useState('');
  const [catPurrs, setCatPurrs] = useState(0);
  const [bubbleText, setBubbleText] = useState('Meow! Ready to explore your code?');

  const catQuotes = [
    'Meow! Ready to explore your code?',
    'Purr... Clean architecture makes my tail swish!',
    'I just sniffed 0 cyclical dependencies in this branch!',
    'Let me generate an AST blossom tree for you!',
    'Need a guided tour? I know where all the components sleep!',
    'Oops, caught a little async race condition earlier! Fixed it!'
  ];

  const handleCatClick = () => {
    sound.playBloomChime(659.25);
    setCatPurrs((prev) => prev + 1);
    const nextQuote = catQuotes[(catPurrs + 1) % catQuotes.length];
    setBubbleText(nextQuote);
  };

  const handleAnalyzeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playBloomChime(783.99);
    onAnalyzeRepo(repoInput.trim() || 'facebook/react');
  };

  const handleSampleClick = (sampleRepo: string) => {
    sound.playSoftTick();
    setRepoInput(sampleRepo);
    onAnalyzeRepo(sampleRepo);
  };

  return (
    <section id="hero" className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
      {/* Dreamy Petalyx pastel backdrop with clouds & soft gradients */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* Soft pastel atmosphere radial glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#F8DCE8]/45 via-[#DCCFF5]/35 to-transparent rounded-full blur-3xl opacity-80" />
        <div className="absolute top-48 -left-32 w-96 h-96 bg-[#FFE4D2]/40 rounded-full blur-3xl" />
        <div className="absolute top-64 -right-32 w-96 h-96 bg-[#DCEBFA]/50 rounded-full blur-3xl" />

        {/* Delicate floating SVG cloud shapes in pastel */}
        <svg className="absolute top-16 left-6 w-36 h-20 text-[#DCCFF5]/25" viewBox="0 0 100 50" fill="currentColor">
          <path d="M20,40 Q10,40 10,30 Q10,20 25,20 Q30,10 45,10 Q60,10 65,22 Q75,18 85,25 Q95,30 90,40 Z" />
        </svg>
        <svg className="absolute top-36 right-12 w-48 h-24 text-[#F8DCE8]/30" viewBox="0 0 100 50" fill="currentColor">
          <path d="M20,40 Q10,40 10,30 Q10,20 25,20 Q30,10 45,10 Q60,10 65,22 Q75,18 85,25 Q95,30 90,40 Z" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading, Value Prop, CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Tagline label (unboxed clean text with bullet separator) */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-[#493B55]/80 mb-3">
              <span className="font-pixel text-[#493B55]">AI COMPANION</span>
              <span aria-hidden="true" className="text-[#493B55]/40">·</span>
              <span>Understand. Visualize. Debug. Bloom.</span>
            </div>

            {/* Oversized pixel-style heading (Nomi AI Agent inspiration) */}
            <h1 className="font-pixel text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#493B55] mb-4 leading-none select-none">
              CODEBLOOM
            </h1>

            {/* Subtitle */}
            <h2 className="text-xl sm:text-2xl font-semibold text-[#493B55] mb-3 tracking-tight">
              Your codebase, decoded beautifully.
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#493B55]/85 max-w-xl mb-8 leading-relaxed font-normal">
              Understand complex repositories, visualize architecture, detect errors and get AI-powered guidance — all in one place with a gentle, intelligent developer companion.
            </p>

            {/* Interactive repository quick input */}
            <form onSubmit={handleAnalyzeSubmit} className="w-full max-w-lg mb-4">
              <div className="relative flex items-center bg-white/95 rounded-xl border-2 border-[#493B55] pixel-box-shadow p-1.5 focus-within:ring-2 focus-within:ring-[#DCCFF5]">
                <div className="pl-3 pr-2 text-[#493B55]/60 flex items-center">
                  <Terminal className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="github.com/owner/repository or drop ZIP..."
                  className="w-full bg-transparent text-sm sm:text-base text-[#493B55] placeholder:text-[#493B55]/40 outline-none px-1 py-1.5 font-code"
                />
                <button
                  type="submit"
                  className="bg-[#493B55] hover:bg-[#3A2D44] text-[#FFF9F2] text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <span>Decode</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Sample Repositories to Try */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#493B55]/80 mb-8">
              <span className="font-medium text-[#493B55]/60">Quick demos:</span>
              <button
                type="button"
                onClick={() => handleSampleClick('facebook/react')}
                className="px-2.5 py-1 bg-white/80 hover:bg-[#F8DCE8] border border-[#493B55]/20 rounded-md transition-colors font-code text-xs cursor-pointer"
              >
                facebook/react
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick('tailwindlabs/tailwindcss')}
                className="px-2.5 py-1 bg-white/80 hover:bg-[#DCCFF5] border border-[#493B55]/20 rounded-md transition-colors font-code text-xs cursor-pointer"
              >
                tailwindcss
              </button>
              <button
                type="button"
                onClick={() => handleSampleClick('shadcn/ui')}
                className="px-2.5 py-1 bg-white/80 hover:bg-[#D8F0E3] border border-[#493B55]/20 rounded-md transition-colors font-code text-xs cursor-pointer"
              >
                shadcn/ui
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => {
                  sound.playBloomChime(783.99);
                  onAnalyzeRepo();
                }}
                className="bg-[#493B55] text-[#FFF9F2] hover:bg-[#382D42] text-sm sm:text-base font-semibold px-6 py-3 rounded-xl border-2 border-[#493B55] pixel-box-shadow pixel-box-shadow-hover flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F8DCE8]" />
                <span>Analyze Your Codebase</span>
              </button>

              <button
                onClick={() => {
                  sound.playSoftTick();
                  onExploreFeatures();
                }}
                className="bg-white/90 text-[#493B55] hover:bg-[#FFF9F2] text-sm sm:text-base font-semibold px-5 py-3 rounded-xl border-2 border-[#493B55]/30 hover:border-[#493B55] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current text-[#493B55]/70" />
                <span>Explore Features</span>
              </button>
            </div>

            {/* Adjacent Trust Metrics */}
            <div className="mt-10 pt-6 border-t border-[#493B55]/15 grid grid-cols-3 gap-6 sm:gap-8 w-full max-w-lg">
              <div>
                <div className="font-pixel text-xl sm:text-2xl font-bold text-[#493B55] tabular-nums">48,200+</div>
                <div className="text-xs text-[#493B55]/70 mt-0.5">Repos Decoded</div>
              </div>
              <div>
                <div className="font-pixel text-xl sm:text-2xl font-bold text-[#493B55] tabular-nums">3.4x</div>
                <div className="text-xs text-[#493B55]/70 mt-0.5">Faster Onboarding</div>
              </div>
              <div>
                <div className="font-pixel text-xl sm:text-2xl font-bold text-[#493B55] tabular-nums">99.8%</div>
                <div className="text-xs text-[#493B55]/70 mt-0.5">AST Resolution</div>
              </div>
            </div>

          </div>

          {/* Right Column: Signature White Cat Mascot & Interactive Speech Bubble */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            
            {/* Mascot Wrapper Card with Nomi + Petalyx Fusion */}
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl bg-gradient-to-b from-[#F8DCE8]/50 via-[#DCCFF5]/30 to-[#FFE4D2]/40 p-4 border-2 border-[#493B55] pixel-box-shadow animate-gentle-float">
              
              {/* Floating Speech Bubble (Nomi inspiration) */}
              <div
                onClick={handleCatClick}
                className="absolute -top-7 left-4 sm:-left-6 right-4 sm:right-auto z-30 bg-white/95 text-[#493B55] px-4 py-2.5 rounded-2xl border-2 border-[#493B55] pixel-box-shadow-sm animate-bubble-bob cursor-pointer hover:bg-[#FFF9F2] transition-colors max-w-[310px]"
              >
                <div className="flex items-start gap-2">
                  <span className="text-base select-none">🐾</span>
                  <p className="text-xs sm:text-sm font-medium leading-tight">
                    {bubbleText}
                  </p>
                </div>
                {/* Bubble speech tail */}
                <div className="absolute -bottom-2 left-10 w-4 h-4 bg-white border-r-2 border-b-2 border-[#493B55] transform rotate-45" />
              </div>

              {/* High-Fidelity Cat Mascot Image */}
              <div
                onClick={handleCatClick}
                className="w-full h-full rounded-2xl overflow-hidden relative cursor-pointer group bg-[#FFF9F2] border border-[#493B55]/15"
                title="Click me to pet CodeBloom's cat mascot!"
              >
                <img
                  src="/src/assets/images/hero_mascot_cat_1794308342384.jpg"
                  alt="CodeBloom friendly white cat developer mascot with glasses"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle Interactive Petting Badge */}
                <div className="absolute bottom-3 right-3 bg-[#493B55]/90 text-[#FFF9F2] backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Heart className="w-3.5 h-3.5 fill-[#F8DCE8] text-[#F8DCE8]" />
                  <span>Pet me ({catPurrs})</span>
                </div>

                {/* Live Mascot Status Tag */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md border border-[#493B55]/20 text-[11px] font-code text-[#493B55] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#A8E6CF]" />
                  <span>online · watching repo</span>
                </div>
              </div>

              {/* Mini Interactive Floater Badges (Components parsed) */}
              <div className="absolute -bottom-4 -left-4 bg-white/95 border-2 border-[#493B55] rounded-xl px-3 py-1.5 pixel-box-shadow-sm flex items-center gap-2">
                <GitBranch className="w-3.5 h-3.5 text-[#493B55]" />
                <span className="text-xs font-semibold text-[#493B55]">main / v2.4</span>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white/95 border-2 border-[#493B55] rounded-xl px-3 py-1.5 pixel-box-shadow-sm flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-semibold text-[#493B55]">Zero Cycles</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
