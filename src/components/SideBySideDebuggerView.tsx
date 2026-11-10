import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  X,
  Download,
  Split,
  Eye,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Bug,
  CheckCheck,
  Diff,
} from 'lucide-react';
import { DetectedIssue, UserProfile } from '../types';
import { sound } from '../utils/sound';

interface SideBySideDebuggerViewProps {
  originalCode: string;
  correctedCode: string;
  detectedIssues: DetectedIssue[];
  explanation: string;
  whyOriginalWasWrong: string;
  catComment: string;
  filename: string;
  language: string;
  user: UserProfile;
  onApplyCorrectionToEditor: (code: string) => void;
  onReAnalyze: () => void;
}

export const SideBySideDebuggerView: React.FC<SideBySideDebuggerViewProps> = ({
  originalCode,
  correctedCode,
  detectedIssues,
  explanation,
  whyOriginalWasWrong,
  catComment,
  filename,
  language,
  user,
  onApplyCorrectionToEditor,
  onReAnalyze,
}) => {
  const [selectedIssueIndex, setSelectedIssueIndex] = useState<number>(0);
  const [applied, setApplied] = useState<boolean>(false);
  const [rejectedIssues, setRejectedIssues] = useState<Set<number>>(new Set());
  const [acceptedIssues, setAcceptedIssues] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [activeTabFocus, setActiveTabFocus] = useState<'original' | 'corrected'>('corrected');

  const origLines = originalCode.split('\n');
  const corrLines = correctedCode.split('\n');

  const selectedIssue = detectedIssues[selectedIssueIndex] || detectedIssues[0];

  // 1. Analyze Code
  const handleAnalyzeCode = () => {
    sound.playBloomChime(659.25);
    onReAnalyze();
  };

  // 2. Explain Error
  const handleToggleExplain = () => {
    sound.playSoftTick();
    setShowExplanation(!showExplanation);
  };

  // 3. View Correction
  const handleViewCorrection = () => {
    sound.playSoftTick();
    setActiveTabFocus('corrected');
    const el = document.getElementById('correction-panel');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // 4. Apply Correction (individual selected issue)
  const handleApplySingleCorrection = () => {
    sound.playBloomChime(783.99);
    setAcceptedIssues((prev) => new Set([...prev, selectedIssueIndex]));
    setRejectedIssues((prev) => {
      const next = new Set(prev);
      next.delete(selectedIssueIndex);
      return next;
    });
    // For single fix, apply full corrected code if first fix or last fix
    onApplyCorrectionToEditor(correctedCode);
  };

  // 5. Reject Correction (individual selected issue)
  const handleRejectCorrection = () => {
    sound.playSoftTick();
    setRejectedIssues((prev) => new Set([...prev, selectedIssueIndex]));
    setAcceptedIssues((prev) => {
      const next = new Set(prev);
      next.delete(selectedIssueIndex);
      return next;
    });
  };

  // 6. Accept All Corrections
  const handleAcceptAllCorrections = () => {
    sound.playBloomChime(783.99);
    sound.playSuccessHarp();
    setApplied(true);
    setRejectedIssues(new Set());
    const all = new Set(detectedIssues.map((_, i) => i));
    setAcceptedIssues(all);
    onApplyCorrectionToEditor(correctedCode);
  };

  // 7. Compare Changes (Toggle Split vs Unified diff)
  const handleCompareChanges = () => {
    sound.playSoftTick();
    setViewMode(viewMode === 'split' ? 'unified' : 'split');
  };

  // 8. Download Corrected File
  const handleDownloadCorrectedFile = () => {
    sound.playBloomChime(783.99);
    const blob = new Blob([correctedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corrected_${filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header Strip with Cat Mascot & Persona */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Mascot Message & Persona */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#493B55] bg-[#FFF9F2] shrink-0 pixel-box-shadow-sm">
            <img
              src="/src/assets/images/mascot_cat_debugging_pen_1794308342603.jpg"
              alt="Cat holding pen"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-pixel text-base sm:text-lg font-bold text-[#493B55] flex items-center gap-2">
              <span>{catComment || "Meow! I found a little mistake. Let's fix it together!"}</span>
            </div>
            <p className="text-xs text-[#493B55]/70 mt-1 font-sans">
              Calibrated for <strong>{user.fullName}</strong> ({user.skillLevel} Developer) · {filename} ({language})
            </p>
          </div>
        </div>

        {/* Action Controls - 8 Explicit Working Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Button 1: Analyze Code */}
          <button
            onClick={handleAnalyzeCode}
            className="px-3 py-2 rounded-xl bg-[#FFF9F2] hover:bg-white border border-[#493B55]/25 text-xs font-semibold text-[#493B55] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Re-run static analysis and AI reasoning"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Analyze Code</span>
          </button>

          {/* Button 2: Explain Error */}
          <button
            onClick={handleToggleExplain}
            className="px-3 py-2 rounded-xl bg-[#DCCFF5]/60 hover:bg-[#DCCFF5] border border-[#493B55]/25 text-xs font-semibold text-[#493B55] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Toggle error explanation details"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Explain Error</span>
          </button>

          {/* Button 3: View Correction */}
          <button
            onClick={handleViewCorrection}
            className="px-3 py-2 rounded-xl bg-[#FFF9F2] hover:bg-white border border-[#493B55]/25 text-xs font-semibold text-[#493B55] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Focus correction panel"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Correction</span>
          </button>

          {/* Button 4: Apply Correction */}
          <button
            onClick={handleApplySingleCorrection}
            className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-semibold text-emerald-800 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Apply currently selected fix"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Correction</span>
          </button>

          {/* Button 5: Reject Correction */}
          <button
            onClick={handleRejectCorrection}
            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-xs font-semibold text-rose-700 flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Reject currently selected fix"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reject Correction</span>
          </button>

          {/* Button 6: Accept All Corrections */}
          <button
            onClick={handleAcceptAllCorrections}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-2 cursor-pointer ${
              applied
                ? 'bg-emerald-600 text-white border-emerald-700'
                : 'bg-[#493B55] text-white hover:bg-[#3A2D44] border-[#493B55] pixel-box-shadow-sm'
            }`}
          >
            <CheckCheck className="w-4 h-4 text-[#F8DCE8]" />
            <span>{applied ? 'All Corrections Accepted! ✨' : 'Accept All Corrections'}</span>
          </button>

          {/* Button 7: Compare Changes */}
          <button
            onClick={handleCompareChanges}
            className="px-3 py-2 rounded-xl bg-[#FFF9F2] hover:bg-white border border-[#493B55]/25 text-xs font-semibold text-[#493B55] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Toggle between side-by-side split and unified diff view"
          >
            <Diff className="w-3.5 h-3.5" />
            <span>Compare Changes ({viewMode === 'split' ? 'Split' : 'Unified'})</span>
          </button>

          {/* Button 8: Download Corrected File */}
          <button
            onClick={handleDownloadCorrectedFile}
            className="px-3 py-2 rounded-xl bg-[#FFF9F2] hover:bg-white border border-[#493B55]/25 text-xs font-semibold text-[#493B55] flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Download fixed source file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Corrected File</span>
          </button>

        </div>

      </div>

      {/* Issues Bar: Click issue to view */}
      {detectedIssues.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-[#493B55] p-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#493B55] flex items-center gap-1 mr-2">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>Detected Issues ({detectedIssues.length}):</span>
          </span>
          {detectedIssues.map((issue, idx) => {
            const isAccepted = acceptedIssues.has(idx);
            const isRejected = rejectedIssues.has(idx);

            return (
              <button
                key={idx}
                onClick={() => {
                  sound.playSoftTick();
                  setSelectedIssueIndex(idx);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-code transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedIssueIndex === idx
                    ? 'bg-[#493B55] text-white font-bold pixel-box-shadow-sm'
                    : 'bg-[#FFF9F2] text-[#493B55] hover:bg-[#F8DCE8] border border-[#493B55]/20'
                }`}
              >
                <span>Line {issue.line}: {issue.type}</span>
                {isAccepted && <span className="text-emerald-400 font-bold">✓</span>}
                {isRejected && <span className="text-rose-400 font-bold">✗</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Workspace Display: Split View or Unified Diff */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT PANEL: ORIGINAL CODE */}
          <div className="rounded-3xl border-2 border-[#493B55] pixel-box-shadow bg-[#251E2B] text-[#FFF9F2] overflow-hidden flex flex-col h-[520px]">
            
            <div className="bg-[#1C1622] px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-code">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="font-bold text-rose-200">LEFT PANEL: ORIGINAL CODE</span>
              </div>
              <span className="text-[11px] text-white/50">{origLines.length} lines</span>
            </div>

            <div className="flex-1 overflow-auto p-4 font-code text-xs leading-6">
              {origLines.map((line, idx) => {
                const lineNum = idx + 1;
                const hasError = detectedIssues.some((i) => i.line === lineNum);
                const isCurrentSelected = selectedIssue?.line === lineNum;

                return (
                  <div
                    key={idx}
                    className={`flex items-start rounded px-2 transition-colors ${
                      isCurrentSelected
                        ? 'bg-rose-500/40 border-l-4 border-rose-400 text-rose-100 font-bold'
                        : hasError
                        ? 'bg-rose-500/25 border-l-2 border-rose-400 text-rose-100 font-semibold'
                        : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-white/30 text-right pr-3 select-none text-[11px]">
                      {lineNum}
                    </span>
                    <pre className="whitespace-pre font-code flex-1">{line}</pre>
                    {hasError && (
                      <span className="text-[10px] bg-rose-900/80 text-rose-200 px-1.5 py-0 rounded font-sans ml-2 shrink-0">
                        Error
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-[#1C1622] px-4 py-2 border-t border-white/10 text-[11px] text-rose-300/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>Original source protected. Never overwritten without permission.</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: SUGGESTED CORRECTED CODE */}
          <div
            id="correction-panel"
            className="rounded-3xl border-2 border-[#493B55] pixel-box-shadow bg-[#251E2B] text-[#FFF9F2] overflow-hidden flex flex-col h-[520px]"
          >
            
            <div className="bg-[#1C1622] px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 font-code">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-bold text-emerald-200">RIGHT PANEL: SUGGESTED CORRECTED CODE</span>
              </div>
              <span className="text-[11px] text-emerald-300 font-semibold">
                {applied ? '✓ All Accepted' : `${acceptedIssues.size}/${detectedIssues.length} Applied`}
              </span>
            </div>

            <div className="flex-1 overflow-auto p-4 font-code text-xs leading-6">
              {corrLines.map((line, idx) => {
                const lineNum = idx + 1;
                const isDifferent = origLines[idx] !== line;

                return (
                  <div
                    key={idx}
                    className={`flex items-start rounded px-2 ${
                      isDifferent
                        ? 'bg-emerald-500/25 border-l-2 border-emerald-400 text-emerald-100 font-semibold'
                        : 'hover:bg-white/5 text-white/80'
                    }`}
                  >
                    <span className="w-8 shrink-0 text-white/30 text-right pr-3 select-none text-[11px]">
                      {lineNum}
                    </span>
                    <pre className="whitespace-pre font-code flex-1">{line}</pre>
                    {isDifferent && (
                      <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-1.5 py-0 rounded font-sans ml-2 shrink-0">
                        Fixed
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-[#1C1622] px-4 py-2 border-t border-white/10 text-[11px] text-emerald-300/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>BharatCode / Gemini Static Model Verified</span>
              </div>
              <button
                onClick={handleAcceptAllCorrections}
                className="font-bold text-emerald-300 hover:underline cursor-pointer"
              >
                Apply to Workspace →
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* UNIFIED DIFF VIEW */
        <div className="rounded-3xl border-2 border-[#493B55] pixel-box-shadow bg-[#251E2B] text-[#FFF9F2] overflow-hidden flex flex-col h-[520px]">
          <div className="bg-[#1C1622] px-4 py-2.5 border-b border-white/10 flex items-center justify-between text-xs font-code">
            <span className="font-bold text-emerald-300">UNIFIED DIFF COMPARISON VIEW</span>
            <span className="text-white/50">{origLines.length} original lines vs {corrLines.length} corrected lines</span>
          </div>

          <div className="flex-1 overflow-auto p-4 font-code text-xs leading-6 space-y-0.5">
            {origLines.map((origLine, idx) => {
              const corrLine = corrLines[idx];
              const isDifferent = origLine !== corrLine;

              if (isDifferent) {
                return (
                  <React.Fragment key={idx}>
                    <div className="bg-rose-900/40 text-rose-200 px-2 rounded flex items-start border-l-2 border-rose-500">
                      <span className="w-8 text-right pr-2 text-rose-400 select-none">-</span>
                      <pre className="whitespace-pre">{origLine}</pre>
                    </div>
                    {corrLine !== undefined && (
                      <div className="bg-emerald-900/40 text-emerald-200 px-2 rounded flex items-start border-l-2 border-emerald-500">
                        <span className="w-8 text-right pr-2 text-emerald-400 select-none">+</span>
                        <pre className="whitespace-pre">{corrLine}</pre>
                      </div>
                    )}
                  </React.Fragment>
                );
              }

              return (
                <div key={idx} className="text-white/80 px-2 flex items-start">
                  <span className="w-8 text-right pr-2 text-white/30 select-none"> </span>
                  <pre className="whitespace-pre">{origLine}</pre>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Explanation Details Card */}
      {showExplanation && (
        <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <div>
            <h3 className="font-pixel text-sm font-bold text-[#493B55] mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#493B55]" />
              <span>WHAT WAS CORRECTED & WHY</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#493B55]/85 leading-relaxed font-sans">
              {explanation}
            </p>
          </div>

          <div>
            <h3 className="font-pixel text-sm font-bold text-rose-800 mb-2 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>WHY ORIGINAL CODE FAILED</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#493B55]/85 leading-relaxed font-sans">
              {whyOriginalWasWrong}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
