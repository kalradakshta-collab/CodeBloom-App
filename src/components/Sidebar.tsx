import React from 'react';
import {
  LayoutDashboard,
  Code2,
  Bug,
  FolderGit2,
  Network,
  Bot,
  BookOpen,
  ListTodo,
  HelpCircle,
  CreditCard,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  Shield,
  Clock,
} from 'lucide-react';
import { UserProfile, UserUsage } from '../types';
import { sound } from '../utils/sound';

export type ActiveTab =
  | 'dashboard'
  | 'editor'
  | 'debugger'
  | 'repositories'
  | 'architecture'
  | 'assistant'
  | 'onboarding'
  | 'tasks'
  | 'how-to-use'
  | 'pricing'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  user: UserProfile | null;
  usage: UserUsage | null;
  onLogout: () => void;
  onStartTour: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  user,
  usage,
  onLogout,
  onStartTour,
}) => {
  const menuItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'editor', label: 'Code Editor', icon: Code2 },
    { id: 'debugger', label: 'AI Debugger', icon: Bug, badge: 'Core' },
    { id: 'repositories', label: 'My Repositories', icon: FolderGit2 },
    { id: 'architecture', label: 'Architecture Map', icon: Network },
    { id: 'assistant', label: 'AI Cat Assistant', icon: Bot },
    { id: 'onboarding', label: 'Onboarding Guides', icon: BookOpen },
    { id: 'tasks', label: 'Task Manager', icon: ListTodo },
    { id: 'how-to-use', label: 'How to Use', icon: HelpCircle },
    { id: 'pricing', label: 'Pricing & Usage', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const maxDaily = usage?.maxDailySeconds || (usage?.plan === 'paid' ? 72000 : 28800);
  const dailyUsed = usage?.dailySecondsUsed || 0;
  const remainingSeconds = Math.max(0, maxDaily - dailyUsed);
  const remainingHours = (remainingSeconds / 3600).toFixed(1);
  const percentUsed = Math.min(100, Math.round((dailyUsed / maxDaily) * 100));
  const isNearlyExhausted = usage?.plan === 'free' && remainingSeconds > 0 && remainingSeconds <= 5400;
  const isExhausted = usage?.plan === 'free' && remainingSeconds <= 0;

  return (
    <aside className="w-64 bg-white/95 border-r-2 border-[#493B55]/15 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto z-30">
      <div>
        {/* Brand Lockup */}
        <div className="p-5 border-b border-[#493B55]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F8DCE8] border border-[#493B55] flex items-center justify-center pixel-box-shadow-sm select-none text-base">
              🌸
            </div>
            <div>
              <div className="font-pixel text-base font-bold text-[#493B55] tracking-tight">
                CODEBLOOM
              </div>
              <div className="text-[10px] text-[#493B55]/60 font-medium">Developer Platform</div>
            </div>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-3 my-2 rounded-2xl bg-gradient-to-r from-[#FFF9F2] to-[#F8DCE8]/40 border border-[#493B55]/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#493B55] bg-[#DCCFF5] shrink-0">
              <img
                src="/src/assets/images/hero_mascot_cat_1794308342384.jpg"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#493B55] truncate">{user.fullName}</div>
              <div className="text-[10px] text-[#493B55]/70 flex items-center gap-1">
                <span className="truncate">{user.skillLevel}</span>
                <span>·</span>
                <span className="capitalize">{usage?.plan || 'Free'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playSoftTick();
                  onSelectTab(item.id);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#493B55] text-[#FFF9F2] pixel-box-shadow-sm'
                    : 'text-[#493B55]/85 hover:bg-[#F8DCE8]/40 hover:text-[#493B55]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#F8DCE8]' : 'text-[#493B55]/70'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-code font-bold uppercase ${
                      isActive ? 'bg-[#F8DCE8] text-[#493B55]' : 'bg-[#DCCFF5] text-[#493B55]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Accounting & Tour */}
      <div className="p-4 border-t border-[#493B55]/10 bg-[#FFF9F2]/70 space-y-3">
        {/* Usage Pill */}
        <div className={`p-3 rounded-xl border text-xs transition-colors ${
          isExhausted
            ? 'bg-rose-50 border-rose-300'
            : isNearlyExhausted
            ? 'bg-amber-50 border-amber-300'
            : 'bg-white border-[#493B55]/15'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#493B55] mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#493B55]/70" />
              <span>{usage?.plan === 'paid' ? 'Pro Allowance' : 'Daily Free Usage'}</span>
            </span>
            <span className="font-code tabular-nums font-bold">
              {usage?.plan === 'paid' ? `${remainingHours}h / day` : isExhausted ? '0.0h left' : `${remainingHours}h left`}
            </span>
          </div>

          <div className="text-[10px] text-[#493B55]/70 flex items-center justify-between mb-1">
            <span>{usage?.plan === 'paid' ? '20h daily limit · $25/mo' : '8h included per day'}</span>
            <span className="text-[9px] text-[#493B55]/50">Resets 00:00 UTC</span>
          </div>

          {usage?.plan !== 'paid' && (
            <div className="w-full bg-[#FFF9F2] rounded-full h-1.5 border border-[#493B55]/10 overflow-hidden mt-1">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isExhausted ? 'bg-rose-500' : isNearlyExhausted ? 'bg-amber-500' : 'bg-[#493B55]'
                }`}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
          )}

          {isExhausted && (
            <div className="mt-1.5 text-[10px] text-rose-700 font-semibold leading-tight">
              Free AI operations paused until midnight UTC.
            </div>
          )}

          {isNearlyExhausted && !isExhausted && (
            <div className="mt-1.5 text-[10px] text-amber-800 font-semibold leading-tight">
              Daily allowance nearly exhausted!
            </div>
          )}

          {usage?.plan !== 'paid' && (
            <button
              onClick={() => {
                sound.playBloomChime(783.99);
                onSelectTab('pricing');
              }}
              className="mt-2 text-[10px] font-bold text-[#493B55] hover:underline flex items-center justify-between w-full cursor-pointer"
            >
              <span>Upgrade to Pro ($25/mo)</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Take a Tour button */}
        <button
          onClick={() => {
            sound.playBloomChime(659.25);
            onStartTour();
          }}
          className="w-full bg-[#DCCFF5]/80 hover:bg-[#DCCFF5] text-[#493B55] text-xs font-bold py-2 px-3 rounded-xl border border-[#493B55]/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Take a Tour</span>
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            sound.playSoftTick();
            onLogout();
          }}
          className="w-full text-center text-xs text-[#493B55]/60 hover:text-rose-600 transition-colors py-1 flex items-center justify-center gap-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
