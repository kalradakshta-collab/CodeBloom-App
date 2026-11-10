import React, { useState } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Code2,
  GraduationCap,
  Sparkles,
  Shield,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile } from '../types';
import { sound } from '../utils/sound';

interface SettingsViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onDeleteAccount: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  onUpdateProfile,
  onDeleteAccount,
}) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [occupation, setOccupation] = useState(user.occupation);
  const [professionalPosition, setProfessionalPosition] = useState(user.professionalPosition);
  const [workExperience, setWorkExperience] = useState(user.workExperience);
  const [programmingExperience, setProgrammingExperience] = useState(user.programmingExperience);
  const [preferredLanguages, setPreferredLanguages] = useState(user.preferredLanguages.join(', '));
  const [skillLevel, setSkillLevel] = useState<UserProfile['skillLevel']>(user.skillLevel);
  const [purpose, setPurpose] = useState(user.purpose);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playBloomChime(783.99);

    const langs = preferredLanguages
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onUpdateProfile({
      fullName,
      occupation,
      professionalPosition,
      workExperience,
      programmingExperience,
      preferredLanguages: langs.length > 0 ? langs : ['Python', 'JavaScript'],
      skillLevel,
      purpose,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handlePasswordReset = () => {
    sound.playSoftTick();
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
      
      {/* Title Header */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 mb-1">
          <span className="font-pixel">DEVELOPER PROFILE & PERSONALIZATION</span>
          <span aria-hidden="true">·</span>
          <span>Adaptive Companion Settings</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl text-[#493B55] mb-2">
          ACCOUNT & PERSONALIZATION
        </h1>
        <p className="text-xs sm:text-sm text-[#493B55]/85 leading-relaxed font-sans max-w-xl">
          CodeBloom tailors its AST explanations, debugger advice, and onboarding guides based on these 9 profile factors.
        </p>

        {savedSuccess && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profile and personalization settings saved successfully! ✨</span>
          </div>
        )}
      </div>

      {/* Main Profile Form (All 9 Required Fields) */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8 space-y-6">
        
        <h2 className="font-pixel text-base font-bold text-[#493B55] border-b border-[#493B55]/15 pb-3">
          PERSONALIZATION METRICS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. Full Name */}
          <div>
            <label className="block text-xs font-semibold text-[#493B55] mb-1">
              1. Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3.5 py-2 text-xs text-[#493B55] outline-none focus:ring-2 focus:ring-[#DCCFF5]"
              required
            />
          </div>

          {/* 2. Email Address (Verified) */}
          <div>
            <label className="block text-xs font-semibold text-[#493B55] mb-1">
              2. Email Address (Verified)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-[#FFF9F2]/60 border border-[#493B55]/20 rounded-xl px-3.5 py-2 text-xs text-[#493B55]/70 outline-none cursor-not-allowed"
            />
          </div>

          {/* 3. Current Occupation */}
          <div>
            <label className="block text-xs font-semibold text-[#493B55] mb-1">
              3. Current Occupation
            </label>
            <input
              type="text"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="e.g. Software Engineer, University Student, Tech Lead"
              className="w-full bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3.5 py-2 text-xs text-[#493B55] outline-none focus:ring-2 focus:ring-[#DCCFF5]"
            />
          </div>

          {/* 4. Professional Position */}
          <div>
            <label className="block text-xs font-semibold text-[#493B55] mb-1">
              4. Professional Position / Seniority
            </label>
            <input
              type="text"
              value={professionalPosition}
              onChange={(e) => setProfessionalPosition(e.target.value)}
              placeholder="e.g. Full Stack Developer, DevOps, Frontend Lead"
              className="w-full bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3.5 py-2 text-xs text-[#493B55] outline-none focus:ring-2 focus:ring-[#DCCFF5]"
            />
          </div>

          {/* 5. Work Experience */}
          <div>
            <label className="block text-xs font-semibold text-[#493B55] mb-1">
              5. Work Experience
            </label>
            <select
              value={workExperience}
              onChange={(e) => setWorkExperience(e.target.value)}
              className="w-full bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3.5 py-2 text-xs text-[#493B55] outline-none cursor-pointer"
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
            <label className="block text-xs font-semibold text-[#493B55] mb-1">
              6. Programming Experience Breakdown
            </label>
            <input
              type="text"
              value={programmingExperience}
              onChange={(e) => setProgrammingExperience(e.target.value)}
              placeholder="e.g. 3 years TypeScript, 1 year Python"
              className="w-full bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3.5 py-2 text-xs text-[#493B55] outline-none focus:ring-2 focus:ring-[#DCCFF5]"
            />
          </div>

          {/* 7. Preferred Programming Languages */}
          <div>
            <label className="block text-xs font-semibold text-[#493B55] mb-1">
              7. Preferred Programming Languages (comma separated)
            </label>
            <input
              type="text"
              value={preferredLanguages}
              onChange={(e) => setPreferredLanguages(e.target.value)}
              placeholder="Python, JavaScript, TypeScript, Go"
              className="w-full bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3.5 py-2 text-xs text-[#493B55] font-code outline-none focus:ring-2 focus:ring-[#DCCFF5]"
            />
          </div>

          {/* 8. Skill Level (Crucial for AI Explanation Calibration) */}
          <div>
            <label className="block text-xs font-semibold text-[#493B55] mb-1">
              8. Skill Level (Calibrates AI Explanations)
            </label>
            <select
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as UserProfile['skillLevel'])}
              className="w-full bg-[#DCCFF5]/50 border border-[#493B55]/30 rounded-xl px-3.5 py-2 text-xs font-bold text-[#493B55] outline-none cursor-pointer"
            >
              <option value="Beginner">Beginner (Simple analogies, zero jargon)</option>
              <option value="Student">Student (Learning-oriented step-by-step guidance)</option>
              <option value="Intermediate">Intermediate (Technical patterns & trade-offs)</option>
              <option value="Advanced">Advanced (Concurrency, AST internals & memory safety)</option>
            </select>
          </div>

        </div>

        {/* 9. Purpose of using CodeBloom */}
        <div>
          <label className="block text-xs font-semibold text-[#493B55] mb-1">
            9. Primary Purpose for Using CodeBloom
          </label>
          <textarea
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={2}
            placeholder="e.g. Onboard to large repositories faster, spot silent bugs, understand architecture"
            className="w-full bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3.5 py-2 text-xs text-[#493B55] outline-none focus:ring-2 focus:ring-[#DCCFF5]"
          />
        </div>

        <button
          type="submit"
          className="bg-[#493B55] hover:bg-[#382D42] text-white px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm border-2 border-[#493B55] pixel-box-shadow-sm transition-all cursor-pointer"
        >
          Save Profile Updates
        </button>

      </form>

      {/* Security & Danger Zone */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8 space-y-6">
        <h2 className="font-pixel text-base font-bold text-[#493B55] border-b border-[#493B55]/15 pb-3">
          SECURITY & ACCOUNT CONTROLS
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#FFF9F2] border border-[#493B55]/15">
          <div>
            <div className="text-xs font-bold text-[#493B55]">Password Security</div>
            <div className="text-[11px] text-[#493B55]/70">
              Send password reset link to {user.email}
            </div>
          </div>
          <button
            onClick={handlePasswordReset}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFF9F2] border border-[#493B55]/20 text-xs font-semibold text-[#493B55] cursor-pointer"
          >
            {resetSuccess ? 'Reset Link Dispatched! ✨' : 'Reset Password'}
          </button>
        </div>

        {/* Delete Account */}
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-rose-800">Delete Account</div>
            <div className="text-[11px] text-rose-600">
              Permanently delete user profile, project analyses, and history.
            </div>
          </div>

          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onDeleteAccount}
                className="bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-white text-rose-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-rose-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold cursor-pointer"
            >
              Delete Account
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
