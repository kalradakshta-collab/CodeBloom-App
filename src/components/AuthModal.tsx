import React, { useState } from 'react';
import { X, Sparkles, Check, Github, Mail, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    sound.playBloomChime(783.99);
    setSubmitted(true);

    setTimeout(() => {
      onLoginSuccess(email.trim());
      onClose();
      setSubmitted(false);
    }, 900);
  };

  const handleOAuth = (provider: string) => {
    sound.playBloomChime(659.25);
    setSubmitted(true);

    setTimeout(() => {
      onLoginSuccess(`developer@${provider.toLowerCase()}.com`);
      onClose();
      setSubmitted(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493B55]/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow w-full max-w-md p-6 sm:p-8 relative">
        
        {/* Close */}
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
          <div className="w-8 h-8 rounded-lg bg-[#DCCFF5] border border-[#493B55] flex items-center justify-center text-sm">
            🌸
          </div>
          <span className="font-pixel text-lg font-bold text-[#493B55]">
            WELCOME TO CODEBLOOM
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#493B55]/80 mb-6 font-sans">
          Join 48,000+ engineers decoding architectures and debugging with the friendliest cat companion.
        </p>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#D8F0E3] border-2 border-[#493B55] flex items-center justify-center text-emerald-700">
              <Check className="w-6 h-6" />
            </div>
            <div className="font-pixel text-base text-[#493B55]">SESSION AUTHORIZED!</div>
            <p className="text-xs text-[#493B55]/80">Loading developer companion state...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* GitHub OAuth Button */}
            <button
              onClick={() => handleOAuth('GitHub')}
              className="w-full bg-white hover:bg-[#FFF9F2] text-[#493B55] py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm border-2 border-[#493B55] pixel-box-shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Github className="w-4 h-4" />
              <span>Continue with GitHub</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-[#493B55]/40 my-2">
              <div className="h-px bg-[#493B55]/15 flex-1" />
              <span>or email magic link</span>
              <div className="h-px bg-[#493B55]/15 flex-1" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#493B55]/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  required
                  className="w-full bg-white border border-[#493B55]/30 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[#493B55] font-sans outline-none focus:ring-2 focus:ring-[#DCCFF5]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#493B55] hover:bg-[#382D42] text-[#FFF9F2] py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-[#493B55] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Send Magic Sign-in Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <p className="text-[11px] text-center text-[#493B55]/60 mt-4">
              Free community tier included. No credit card required.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
