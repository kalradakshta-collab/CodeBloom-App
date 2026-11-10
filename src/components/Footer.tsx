import React from 'react';
import { sound } from '../utils/sound';

interface FooterProps {
  onNavClick: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  return (
    <footer className="border-t border-[#493B55]/15 bg-[#FFF9F2] py-14 sm:py-20 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 pb-12 border-b border-[#493B55]/10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#F8DCE8] border border-[#493B55] flex items-center justify-center text-sm">
                🌸
              </div>
              <span className="font-pixel text-lg font-bold text-[#493B55]">
                CODEBLOOM
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-[#493B55]/80 max-w-sm mb-4 leading-relaxed font-sans">
              The AI-powered codebase architecture and onboarding visualizer. Combining deep static AST analysis with a serene, pastel developer companion.
            </p>

            <div className="text-xs text-[#493B55]/70 flex items-center gap-2 font-medium">
              <span>Understand</span>
              <span aria-hidden="true">·</span>
              <span>Visualize</span>
              <span aria-hidden="true">·</span>
              <span>Debug</span>
              <span aria-hidden="true">·</span>
              <span>Bloom</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <div className="text-xs font-bold text-[#493B55] uppercase tracking-wider mb-3">
                Product
              </div>
              <ul className="space-y-2 text-xs text-[#493B55]/80">
                <li>
                  <button
                    onClick={() => onNavClick('architecture')}
                    className="hover:text-[#493B55] hover:underline cursor-pointer"
                  >
                    Architecture Map
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavClick('debugger')}
                    className="hover:text-[#493B55] hover:underline cursor-pointer"
                  >
                    Signature Debugger
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavClick('features')}
                    className="hover:text-[#493B55] hover:underline cursor-pointer"
                  >
                    AST Visualizer
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavClick('assistant')}
                    className="hover:text-[#493B55] hover:underline cursor-pointer"
                  >
                    Cat Companion AI
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-[#493B55] uppercase tracking-wider mb-3">
                Resources
              </div>
              <ul className="space-y-2 text-xs text-[#493B55]/80">
                <li>
                  <button
                    onClick={() => onNavClick('how-it-works')}
                    className="hover:text-[#493B55] hover:underline cursor-pointer"
                  >
                    How It Works
                  </button>
                </li>
                <li>
                  <a href="#hero" className="hover:text-[#493B55] hover:underline">
                    Interactive Demos
                  </a>
                </li>
                <li>
                  <a href="#hero" className="hover:text-[#493B55] hover:underline">
                    AST Parser Specs
                  </a>
                </li>
                <li>
                  <a href="#hero" className="hover:text-[#493B55] hover:underline">
                    Security Whitepaper
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-bold text-[#493B55] uppercase tracking-wider mb-3">
                Companion
              </div>
              <div className="text-xs text-[#493B55]/80 space-y-1.5 leading-relaxed font-sans">
                <p>Designed with love for developers navigating foreign repositories.</p>
                <p className="text-[11px] text-[#493B55]/60 pt-2 font-code">
                  v2.4.0 · Hermetic Client AST
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#493B55]/70">
          <div>
            © {new Date().getFullYear()} CodeBloom. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <a href="#" className="hover:underline hover:text-[#493B55]">Privacy Policy</a>
            <span aria-hidden="true">·</span>
            <a href="#" className="hover:underline hover:text-[#493B55]">Terms of Service</a>
            <span aria-hidden="true">·</span>
            <a href="#" className="hover:underline hover:text-[#493B55]">GitHub Source</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
