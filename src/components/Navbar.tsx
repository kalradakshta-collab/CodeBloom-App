import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Menu, X, Terminal, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface NavbarProps {
  onOpenAnalyze: () => void;
  onOpenAuth: () => void;
  petalsEnabled: boolean;
  onTogglePetals: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAnalyze,
  onOpenAuth,
  petalsEnabled,
  onTogglePetals,
  soundEnabled,
  onToggleSound,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (id: string) => {
    sound.playSoftTick();
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-6 py-3 sm:py-4">
      <div
        className={`max-w-6xl mx-auto rounded-2xl transition-all duration-300 ${
          scrolled
            ? 'bg-[#FFF9F2]/90 backdrop-blur-md shadow-md border border-[#493B55]/15 py-2.5 px-4 sm:px-6'
            : 'bg-[#FFF9F2]/70 backdrop-blur-xs border border-[#493B55]/10 py-3 px-4 sm:px-6'
        }`}
      >
        <div className="flex items-center justify-between gap-6">
          {/* Zone 1: Logo Wordmark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              sound.playBloomChime(587.33);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group flex items-center gap-2.5 text-[#493B55] whitespace-nowrap shrink-0 transition-transform active:scale-95"
          >
            {/* Pixel Flower Blossom icon */}
            <div className="w-8 h-8 rounded-lg bg-[#F8DCE8] border border-[#493B55] flex items-center justify-center pixel-box-shadow-sm group-hover:bg-[#DCCFF5] transition-colors">
              <span className="text-base select-none">🌸</span>
            </div>
            <div className="flex flex-col">
              <span className="font-pixel text-base sm:text-lg font-bold tracking-tight text-[#493B55]">
                CODEBLOOM
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-[#493B55]/85">
            <button
              onClick={() => handleNavClick('hero')}
              className="hover:text-[#493B55] transition-colors hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="hover:text-[#493B55] transition-colors hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('architecture')}
              className="hover:text-[#493B55] transition-colors hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Architecture
            </button>
            <button
              onClick={() => handleNavClick('debugger')}
              className="hover:text-[#493B55] transition-colors hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Debugger
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="hover:text-[#493B55] transition-colors hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('assistant')}
              className="hover:text-[#493B55] transition-colors hover:underline underline-offset-4 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cat AI
            </button>
          </nav>

          {/* Zone 3: Sensory Toggles & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Petals Breeze Toggle */}
            <button
              onClick={() => {
                sound.playSoftTick();
                onTogglePetals();
              }}
              title={petalsEnabled ? 'Pause falling petals' : 'Enable falling petals'}
              className={`p-2 rounded-lg border transition-all text-xs font-medium cursor-pointer ${
                petalsEnabled
                  ? 'bg-[#F8DCE8]/80 text-[#493B55] border-[#493B55]/20 hover:bg-[#F8DCE8]'
                  : 'bg-white/60 text-[#493B55]/60 border-dashed border-[#493B55]/20 hover:text-[#493B55]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Sound Chime Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                if (!soundEnabled) {
                  sound.playBloomChime(659.25);
                }
              }}
              title={soundEnabled ? 'Mute ambient chimes' : 'Unmute ambient chimes'}
              className={`p-2 rounded-lg border transition-all text-xs font-medium cursor-pointer ${
                soundEnabled
                  ? 'bg-[#DCCFF5]/80 text-[#493B55] border-[#493B55]/20 hover:bg-[#DCCFF5]'
                  : 'bg-white/60 text-[#493B55]/60 border-dashed border-[#493B55]/20 hover:text-[#493B55]'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Login Button */}
            <button
              onClick={() => {
                sound.playSoftTick();
                onOpenAuth();
              }}
              className="hidden sm:inline-flex text-xs font-semibold text-[#493B55] hover:text-[#493B55]/80 px-3 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Login
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                sound.playBloomChime(783.99);
                onOpenAnalyze();
              }}
              className="bg-[#493B55] text-[#FFF9F2] hover:bg-[#3B2F45] text-xs font-semibold px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg border border-[#493B55] pixel-box-shadow-sm hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#493B55] rounded-lg border border-[#493B55]/20 hover:bg-[#F8DCE8]/50"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-[#493B55]/15 mt-3 flex flex-col gap-2.5 animate-fadeIn">
            <button
              onClick={() => handleNavClick('hero')}
              className="text-left py-1.5 px-2 text-sm font-medium text-[#493B55] hover:bg-[#F8DCE8]/40 rounded-md"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="text-left py-1.5 px-2 text-sm font-medium text-[#493B55] hover:bg-[#F8DCE8]/40 rounded-md"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('architecture')}
              className="text-left py-1.5 px-2 text-sm font-medium text-[#493B55] hover:bg-[#F8DCE8]/40 rounded-md"
            >
              Architecture Graph
            </button>
            <button
              onClick={() => handleNavClick('debugger')}
              className="text-left py-1.5 px-2 text-sm font-medium text-[#493B55] hover:bg-[#F8DCE8]/40 rounded-md"
            >
              Signature Debugger
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-left py-1.5 px-2 text-sm font-medium text-[#493B55] hover:bg-[#F8DCE8]/40 rounded-md"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('assistant')}
              className="text-left py-1.5 px-2 text-sm font-medium text-[#493B55] hover:bg-[#F8DCE8]/40 rounded-md"
            >
              Cat AI Assistant
            </button>
            <div className="pt-2 border-t border-[#493B55]/10 flex items-center justify-between">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="text-sm font-medium text-[#493B55] py-1 px-2"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAnalyze();
                }}
                className="bg-[#493B55] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Analyze Repo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
