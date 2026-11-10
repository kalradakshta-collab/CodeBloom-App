import React, { useState } from 'react';
import { X, GitBranch, Terminal, Sparkles, FolderUp, Check, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface AnalyzeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (repoName: string) => void;
}

export const AnalyzeModal: React.FC<AnalyzeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'analyzing' | 'done'>('input');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = repoUrl.trim() || 'facebook/react';

    setIsProcessing(true);
    setStep('analyzing');
    sound.playBloomChime(523.25);

    setTimeout(() => {
      sound.playBloomChime(659.25);
    }, 500);

    setTimeout(() => {
      sound.playBloomChime(783.99);
      setStep('done');
      setIsProcessing(false);
      sound.playSuccessHarp();

      setTimeout(() => {
        onSuccess(name);
        onClose();
        setStep('input');
      }, 700);
    }, 1200);
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

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#F8DCE8] border border-[#493B55] flex items-center justify-center text-sm">
            🌸
          </div>
          <span className="font-pixel text-lg font-bold text-[#493B55]">
            ANALYZE CODEBASE
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#493B55]/80 mb-6 font-sans">
          Connect your repository to generate a full architecture bloom and unleash the Cat debugging companion.
        </p>

        {step === 'input' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#493B55] mb-1.5">
                GitHub / GitLab Repository URL
              </label>
              <div className="relative">
                <Terminal className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#493B55]/50" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/facebook/react"
                  className="w-full bg-white border border-[#493B55]/30 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#493B55] font-code outline-none focus:ring-2 focus:ring-[#DCCFF5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#493B55] mb-1.5">
                  Target Branch
                </label>
                <div className="relative">
                  <GitBranch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#493B55]/50" />
                  <input
                    type="text"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    placeholder="main"
                    className="w-full bg-white border border-[#493B55]/30 rounded-xl pl-8 pr-3 py-2 text-xs text-[#493B55] font-code outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#493B55] mb-1.5">
                  Analysis Depth
                </label>
                <select className="w-full bg-white border border-[#493B55]/30 rounded-xl px-3 py-2 text-xs text-[#493B55] font-sans outline-none">
                  <option>Full AST + Call Graph</option>
                  <option>Modules Only (Fast)</option>
                  <option>Security & Cycle Audit</option>
                </select>
              </div>
            </div>

            {/* Quick Demo Links */}
            <div className="pt-2 text-xs text-[#493B55]/70 flex items-center gap-1.5">
              <span>Or try:</span>
              <button
                type="button"
                onClick={() => setRepoUrl('facebook/react')}
                className="text-xs font-code font-bold underline hover:text-[#493B55] cursor-pointer"
              >
                React
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setRepoUrl('tailwindlabs/tailwindcss')}
                className="text-xs font-code font-bold underline hover:text-[#493B55] cursor-pointer"
              >
                Tailwind
              </button>
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#493B55] hover:bg-[#382D42] text-[#FFF9F2] py-3 rounded-xl font-semibold text-sm border-2 border-[#493B55] pixel-box-shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-[#F8DCE8]" />
                <span>Begin Deep Decoding</span>
              </button>
            </div>
          </form>
        )}

        {step === 'analyzing' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#DCCFF5] border-2 border-[#493B55] flex items-center justify-center text-2xl animate-spin">
              🌸
            </div>
            <div className="font-pixel text-base text-[#493B55]">DECODING AST SYNTAX NODES...</div>
            <p className="text-xs text-[#493B55]/70 font-code">
              Parsing imports · Computing cyclomatic scores · Resolving call graph
            </p>
          </div>
        )}

        {step === 'done' && (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#D8F0E3] border-2 border-[#493B55] flex items-center justify-center text-emerald-700">
              <Check className="w-8 h-8" />
            </div>
            <div className="font-pixel text-base text-[#493B55]">CODEBASE BLOOM READY!</div>
            <p className="text-xs text-[#493B55]/80">
              Architecture graph generated. Launching workspace...
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
