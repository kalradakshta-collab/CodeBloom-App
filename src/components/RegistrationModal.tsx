import React, { useState } from 'react';
import { X, Sparkles, User, Mail, Briefcase, Code2, GraduationCap, ArrowRight } from 'lucide-react';
import { sound } from '../utils/sound';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (userData: any) => void;
  onSwitchToLogin: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('Software Engineer');
  const [professionalPosition, setProfessionalPosition] = useState('Full Stack Developer');
  const [workExperience, setWorkExperience] = useState('1-3 years');
  const [programmingExperience, setProgrammingExperience] = useState('2 years TypeScript & Python');
  const [preferredLanguages, setPreferredLanguages] = useState('Python, JavaScript, TypeScript');
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [purpose, setPurpose] = useState('Understand repository architecture and debug with AI');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playBloomChime(783.99);
    setLoading(true);

    const langs = preferredLanguages
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      fullName,
      email,
      occupation,
      professionalPosition,
      workExperience,
      programmingExperience,
      preferredLanguages: langs,
      skillLevel,
      purpose,
    };

    setTimeout(() => {
      onRegisterSuccess(payload);
      setLoading(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493B55]/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow w-full max-w-xl p-6 sm:p-8 relative my-8">
        
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

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#F8DCE8] border border-[#493B55] flex items-center justify-center text-sm">
            🌸
          </div>
          <span className="font-pixel text-lg font-bold text-[#493B55]">
            CREATE DEVELOPER ACCOUNT
          </span>
        </div>
        <p className="text-xs text-[#493B55]/80 mb-6 font-sans">
          We collect these 9 personalization factors to calibrate explanation complexity and onboarding guides.
        </p>

        {/* 9 Fields Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. Full name */}
            <div>
              <label className="block font-semibold text-[#493B55] mb-1">
                1. Full Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
                required
                className="w-full bg-white border border-[#493B55]/25 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#DCCFF5] text-[#493B55]"
              />
            </div>

            {/* 2. Email */}
            <div>
              <label className="block font-semibold text-[#493B55] mb-1">
                2. Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@domain.com"
                required
                className="w-full bg-white border border-[#493B55]/25 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#DCCFF5] text-[#493B55]"
              />
            </div>

            {/* 3. Occupation */}
            <div>
              <label className="block font-semibold text-[#493B55] mb-1">
                3. Current Occupation
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Software Engineer"
                className="w-full bg-white border border-[#493B55]/25 rounded-xl px-3 py-2 outline-none text-[#493B55]"
              />
            </div>

            {/* 4. Position */}
            <div>
              <label className="block font-semibold text-[#493B55] mb-1">
                4. Professional Position
              </label>
              <input
                type="text"
                value={professionalPosition}
                onChange={(e) => setProfessionalPosition(e.target.value)}
                placeholder="Full Stack Engineer"
                className="w-full bg-white border border-[#493B55]/25 rounded-xl px-3 py-2 outline-none text-[#493B55]"
              />
            </div>

            {/* 5. Work Experience */}
            <div>
              <label className="block font-semibold text-[#493B55] mb-1">
                5. Work Experience
              </label>
              <select
                value={workExperience}
                onChange={(e) => setWorkExperience(e.target.value)}
                className="w-full bg-white border border-[#493B55]/25 rounded-xl px-3 py-2 outline-none cursor-pointer text-[#493B55]"
              >
                <option value="Under 1 year">Under 1 year</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
                <option value="Student / Academic">Student / Academic</option>
              </select>
            </div>

            {/* 6. Programming Experience */}
            <div>
              <label className="block font-semibold text-[#493B55] mb-1">
                6. Programming Experience
              </label>
              <input
                type="text"
                value={programmingExperience}
                onChange={(e) => setProgrammingExperience(e.target.value)}
                placeholder="e.g. 2 years TS & Python"
                className="w-full bg-white border border-[#493B55]/25 rounded-xl px-3 py-2 outline-none text-[#493B55]"
              />
            </div>

            {/* 7. Preferred Languages */}
            <div>
              <label className="block font-semibold text-[#493B55] mb-1">
                7. Preferred Languages
              </label>
              <input
                type="text"
                value={preferredLanguages}
                onChange={(e) => setPreferredLanguages(e.target.value)}
                placeholder="Python, JavaScript, TypeScript"
                className="w-full bg-white border border-[#493B55]/25 rounded-xl px-3 py-2 font-code outline-none text-[#493B55]"
              />
            </div>

            {/* 8. Skill Level */}
            <div>
              <label className="block font-semibold text-[#493B55] mb-1">
                8. Skill Level (AI Calibration)
              </label>
              <select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                className="w-full bg-[#DCCFF5]/60 border border-[#493B55]/30 rounded-xl px-3 py-2 font-bold outline-none cursor-pointer text-[#493B55]"
              >
                <option value="Beginner">Beginner (Simple analogies)</option>
                <option value="Student">Student (Learning-oriented)</option>
                <option value="Intermediate">Intermediate (Best practices)</option>
                <option value="Advanced">Advanced (AST & Concurrency)</option>
              </select>
            </div>

          </div>

          {/* 9. Purpose */}
          <div>
            <label className="block font-semibold text-[#493B55] mb-1">
              9. Purpose of Using CodeBloom
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
              placeholder="e.g. Onboard to large repositories faster, debug without confusion..."
              className="w-full bg-white border border-[#493B55]/25 rounded-xl px-3 py-2 outline-none text-[#493B55]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#493B55] hover:bg-[#382D42] text-white py-3 rounded-xl font-bold text-xs sm:text-sm border-2 border-[#493B55] pixel-box-shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#F8DCE8]" />
            <span>{loading ? 'Creating Your Sanctuary...' : 'Complete Registration & Start Free (8h)'}</span>
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#493B55]/10 text-center text-xs text-[#493B55]/70">
          Already have an account?{' '}
          <button
            onClick={() => {
              onClose();
              onSwitchToLogin();
            }}
            className="font-bold underline text-[#493B55] cursor-pointer"
          >
            Sign In Here
          </button>
        </div>

      </div>
    </div>
  );
};
