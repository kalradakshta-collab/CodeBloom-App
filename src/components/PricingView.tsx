import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  Lock,
  Calendar,
  Zap,
} from 'lucide-react';
import { UserUsage } from '../types';
import { sound } from '../utils/sound';

interface PricingViewProps {
  usage: UserUsage;
  onUpgrade: (confirmed: boolean) => Promise<void>;
  onCancel: () => Promise<void>;
}

export const PricingView: React.FC<PricingViewProps> = ({ usage, onUpgrade, onCancel }) => {
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Daily Allowance Calculation
  const maxDaily = usage.maxDailySeconds || (usage.plan === 'paid' ? 72000 : 28800);
  const dailyUsed = usage.dailySecondsUsed || 0;
  const remainingDailySeconds = Math.max(0, maxDaily - dailyUsed);
  const remainingDailyHours = (remainingDailySeconds / 3600).toFixed(1);
  const percentUsed = Math.min(100, Math.round((dailyUsed / maxDaily) * 100));

  const isNearlyExhausted = usage.plan === 'free' && remainingDailySeconds > 0 && remainingDailySeconds <= 5400; // <= 1.5h
  const isExhausted = usage.plan === 'free' && remainingDailySeconds <= 0;

  // Calculate time remaining until midnight UTC reset
  const nextResetTime = usage.nextResetUTC ? new Date(usage.nextResetUTC).getTime() : Date.now() + 3600000;
  const msToReset = Math.max(0, nextResetTime - Date.now());
  const hoursToReset = Math.floor(msToReset / 3600000);
  const minutesToReset = Math.floor((msToReset % 3600000) / 60000);

  const handleOpenCheckout = () => {
    sound.playBloomChime(659.25);
    setConsentChecked(false);
    setShowCheckoutModal(true);
  };

  const handleConfirmSubscription = async () => {
    if (!consentChecked) return;
    sound.playBloomChime(783.99);
    setUpgrading(true);
    try {
      await onUpgrade(true);
      setShowCheckoutModal(false);
      setSuccessMsg('🎉 Subscription verified! Upgraded to CodeBloom Pro at $25 USD / month. 20h/day priority limit active.');
      sound.playSuccessHarp();
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelClick = async () => {
    sound.playSoftTick();
    setCancelling(true);
    try {
      await onCancel();
      setSuccessMsg('Subscription cancelled. You will continue to have Pro benefits until the end of your current monthly billing cycle.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 mb-1">
          <span className="font-pixel">SUBSCRIPTION & USAGE ACCOUNTING</span>
          <span aria-hidden="true">·</span>
          <span>Automatic Midnight UTC Reset</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl text-[#493B55] mb-2">
          PLANS & DAILY USAGE
        </h1>
        <p className="text-xs sm:text-sm text-[#493B55]/85 leading-relaxed font-sans max-w-xl">
          CodeBloom provides 8 hours of included free usage every single day, resetting automatically at midnight UTC. No automatic surprise charges.
        </p>

        {successMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Daily Usage Meter Card */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#493B55]/15">
          <div>
            <div className="text-xs font-semibold text-[#493B55]/70 mb-1">Today's Usage Allowance</div>
            <div className="font-pixel text-2xl font-bold text-[#493B55]">
              {usage.plan === 'paid' ? `${remainingDailyHours} HOURS REMAINING (PRO)` : isExhausted ? '0.0 HOURS REMAINING' : `${remainingDailyHours} HOURS REMAINING`}
            </div>
            <div className="text-xs text-[#493B55]/70 mt-1 font-sans flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#493B55]" />
              <span>
                Resets daily at <strong>00:00 UTC</strong> (in ~{hoursToReset}h {minutesToReset}m).
              </span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-code font-bold uppercase ${
                usage.plan === 'paid'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isExhausted
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : isNearlyExhausted
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-[#DCCFF5] text-[#493B55] border border-[#493B55]/20'
              }`}
            >
              Plan: {usage.plan === 'paid' ? 'Pro ($25/mo)' : isExhausted ? 'Daily Limit Reached' : 'Free (8h/day)'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-code text-[#493B55] mb-1.5">
            <span>Daily Consumption ({percentUsed}%)</span>
            <span>
              {usage.plan === 'paid' ? '20 Hours Daily Limit' : '8 Hours Included Per Day'}
            </span>
          </div>
          <div className="w-full bg-[#FFF9F2] rounded-full h-3 border border-[#493B55]/20 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExhausted ? 'bg-rose-500' : isNearlyExhausted ? 'bg-amber-500' : 'bg-[#493B55]'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>

        {/* Exhaustion Banner */}
        {isExhausted && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Free-Tier Daily AI Allowance Reached</div>
              <p className="mt-1 leading-relaxed">
                Free-tier AI operations (AI Code Debugger and AI Cat Assistant) are paused until the next daily reset at <strong>00:00 UTC</strong> (in ~{hoursToReset}h {minutesToReset}m).
              </p>
              <p className="mt-1 font-semibold text-rose-950">
                You can continue writing code in the Editor, browsing files in the Repository Explorer, inspecting the Architecture Map, and completing onboarding tasks!
              </p>
            </div>
          </div>
        )}

        {/* Nearly Exhausted Warning */}
        {isNearlyExhausted && !isExhausted && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-800 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Allowance Notice:</strong> You have {remainingDailyHours} hours of free AI compute remaining today. It will replenish at midnight UTC.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Plan Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* FREE PLAN */}
        <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-pixel text-lg font-bold text-[#493B55]">FREE PLAN</span>
              <span className="text-xs bg-[#FFF9F2] px-2.5 py-1 rounded-lg border border-[#493B55]/20 font-bold">
                $0 / month
              </span>
            </div>

            <p className="text-xs text-[#493B55]/80 mb-6 font-sans leading-relaxed">
              Generous daily access for students, individual learners, and developers evaluating CodeBloom.
            </p>

            <ul className="space-y-3 text-xs text-[#493B55]/90 mb-8 font-sans">
              {[
                '8 hours of included AI usage every day',
                'Automatic daily reset at midnight (00:00 UTC)',
                'Essential Python, JavaScript & TypeScript static analysis',
                'Signature side-by-side error correction workspace',
                'Continuous access to Code Editor & Repository Explorer',
                'Interactive architecture diagrams & onboarding guides',
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#493B55]/10">
            <button
              disabled={usage.plan === 'free'}
              className="w-full py-2.5 rounded-xl border border-[#493B55]/30 text-xs font-bold text-[#493B55] text-center disabled:opacity-50"
            >
              {usage.plan === 'free' ? 'Current Active Tier' : 'Downgrade to Free'}
            </button>
          </div>
        </div>

        {/* PRO PLAN ($25 USD / month recurring) */}
        <div className="bg-gradient-to-b from-[#FFF9F2] to-[#F8DCE8]/40 rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-4 right-4 bg-[#493B55] text-[#FFF9F2] text-[10px] font-pixel px-2 py-0.5 rounded font-bold">
            PRO DEVELOPER
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-pixel text-lg font-bold text-[#493B55]">CODEBLOOM PRO</span>
              <div className="text-right">
                <span className="font-pixel text-2xl font-bold text-[#493B55]">$25</span>
                <span className="text-xs text-[#493B55]/70"> USD / month</span>
              </div>
            </div>

            <div className="text-[11px] text-[#493B55]/70 font-semibold mb-4">
              Recurring monthly subscription · Billed monthly
            </div>

            <p className="text-xs text-[#493B55]/80 mb-6 font-sans leading-relaxed">
              Designed for professional software engineers requiring higher usage limits and priority processing.
            </p>

            <ul className="space-y-3 text-xs text-[#493B55]/90 mb-8 font-sans">
              {[
                'Extended 20 hours / day usage limit (250 hours / month)',
                'Priority queueing & accelerated Gemini 2.5 Flash / BharatCode AI',
                'Advanced multi-file repository analysis and ZIP unpacking',
                'Extended debugging depth with line-by-line diff explanation',
                'Exportable Markdown and PDF onboarding documentation',
                'Cancel anytime with 1-click directly in your dashboard',
              ].map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#493B55] shrink-0" />
                  <span className="font-medium">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-[#493B55]/15 space-y-2">
            {usage.plan === 'paid' ? (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Pro Subscription Active
                </span>
                <button
                  onClick={handleCancelClick}
                  disabled={cancelling}
                  className="text-xs text-rose-600 hover:underline cursor-pointer"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleOpenCheckout}
                className="w-full bg-[#493B55] hover:bg-[#382D42] text-[#FFF9F2] py-3 rounded-xl font-bold text-xs sm:text-sm border-2 border-[#493B55] pixel-box-shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F8DCE8]" />
                <span>Subscribe to Pro ($25 USD / month)</span>
              </button>
            )}
            <p className="text-[10px] text-center text-[#493B55]/60 font-sans">
              Billed monthly at $25. Explicit consent required; never auto-subscribed.
            </p>
          </div>

        </div>

      </div>

      {/* Explicit Checkout Confirmation Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493B55]/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow w-full max-w-lg p-6 sm:p-8 relative">
            
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-lg border border-[#493B55]/20 hover:bg-[#F8DCE8] text-[#493B55] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#DCCFF5] border border-[#493B55] flex items-center justify-center text-sm">
                🌸
              </div>
              <div>
                <span className="text-[10px] font-pixel text-[#493B55]/60 uppercase">
                  CHECKOUT CONFIRMATION
                </span>
                <h3 className="font-pixel text-lg font-bold text-[#493B55]">
                  CODEBLOOM PRO SUBSCRIPTION
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#493B55]/80 mb-6 font-sans">
              Review your subscription terms before confirming. CodeBloom never charges users automatically without explicit authorization.
            </p>

            {/* Plan Details Card */}
            <div className="bg-white rounded-2xl border border-[#493B55]/20 p-4 space-y-2.5 text-xs font-sans mb-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#493B55]/10">
                <span className="text-[#493B55]/70">Subscription Plan:</span>
                <span className="font-bold text-[#493B55]">CodeBloom Pro</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#493B55]/10">
                <span className="text-[#493B55]/70">Pricing & Frequency:</span>
                <span className="font-bold text-[#493B55]">$25.00 USD / month (Billed Monthly)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#493B55]/10">
                <span className="text-[#493B55]/70">Extended Limit:</span>
                <span className="font-bold text-[#493B55]">20 hours/day (250 hours/month limit)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#493B55]/70">Cancellation Terms:</span>
                <span className="font-semibold text-emerald-700">Cancel anytime with 1-click</span>
              </div>
            </div>

            {/* Explicit Consent Checkbox */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#493B55]/25 cursor-pointer mb-6">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#493B55] cursor-pointer"
              />
              <span className="text-xs text-[#493B55] leading-relaxed">
                I authorize a recurring monthly charge of <strong>$25.00 USD</strong>. I understand I can cancel anytime directly from my dashboard.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#493B55]/30 text-xs font-bold text-[#493B55] hover:bg-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSubscription}
                disabled={!consentChecked || upgrading}
                className="flex-1 bg-[#493B55] hover:bg-[#382D42] text-[#FFF9F2] py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border border-[#493B55] pixel-box-shadow-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{upgrading ? 'Confirming...' : 'Confirm & Subscribe ($25/mo)'}</span>
              </button>
            </div>

            <div className="mt-3 text-center text-[10px] text-[#493B55]/60 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure sandbox verification · Zero card data stored in frontend</span>
            </div>

          </div>
        </div>
      )}

      {/* Billing History Table */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8">
        <h3 className="font-pixel text-sm font-bold text-[#493B55] mb-4">
          SUBSCRIPTION STATUS & INVOICES
        </h3>

        {usage.billingHistory.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#493B55]/60">
            No active invoices. You are currently on the Free included tier ($0/mo, 8h/day).
          </div>
        ) : (
          <div className="space-y-2 font-code text-xs">
            {usage.billingHistory.map((invoice, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-[#FFF9F2] border border-[#493B55]/15 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#493B55]">{invoice.description}</div>
                  <div className="text-[10px] text-[#493B55]/60">{invoice.date.slice(0, 10)}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#493B55]">${invoice.amount.toFixed(2)}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">{invoice.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
