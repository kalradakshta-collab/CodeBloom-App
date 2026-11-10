/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PetalCanvas } from './components/PetalCanvas';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { ArchitectureVisualizer } from './components/ArchitectureVisualizer';
import { SignatureDebugger } from './components/SignatureDebugger';
import { RepoAnalyzerPlayground } from './components/RepoAnalyzerPlayground';
import { AssistantWorkspace } from './components/AssistantWorkspace';
import { TaskManagerSection } from './components/TaskManagerSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { Footer } from './components/Footer';
import { AnalyzeModal } from './components/AnalyzeModal';
import { AuthModal } from './components/AuthModal';
import { RegistrationModal } from './components/RegistrationModal';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CodeEditorView } from './components/CodeEditorView';
import { SideBySideDebuggerView } from './components/SideBySideDebuggerView';
import { RepoExplorerView } from './components/RepoExplorerView';
import { InteractiveArchitectureView } from './components/InteractiveArchitectureView';
import { OnboardingGuideView } from './components/OnboardingGuideView';
import { HowToUseView } from './components/HowToUseView';
import { PricingView } from './components/PricingView';
import { SettingsView } from './components/SettingsView';
import { GuidedTourModal } from './components/GuidedTourModal';
import { api } from './services/api';
import {
  UserProfile,
  UserUsage,
  RepositoryProject,
  DebugCorrection,
  DetectedIssue,
  AnalyzedFile,
} from './types';
import { sound } from './utils/sound';
import { LayoutDashboard, Globe, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';

export default function App() {
  // App Mode: 'landing' or 'platform'
  const [appMode, setAppMode] = useState<'landing' | 'platform'>('platform');
  const [platformTab, setPlatformTab] = useState<ActiveTab>('dashboard');

  // Sensory states
  const [petalsEnabled, setPetalsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Modals
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // User & Platform Data from Backend
  const [user, setUser] = useState<UserProfile>({
    fullName: 'Alex River',
    email: 'developer@codebloom.dev',
    occupation: 'Full Stack Engineer',
    professionalPosition: 'Software Developer',
    workExperience: '2-4 years',
    programmingExperience: '3 years TypeScript & Python',
    preferredLanguages: ['Python', 'JavaScript', 'TypeScript'],
    skillLevel: 'Intermediate',
    purpose: 'Deep codebase onboarding & visual debugging',
    emailVerified: true,
    createdAt: new Date().toISOString(),
  });

  const [usage, setUsage] = useState<UserUsage>({
    userId: 'developer@codebloom.dev',
    plan: 'free',
    subscriptionStatus: 'none',
    dailySecondsUsed: 3600, // 1 hour used (7h remaining)
    maxDailySeconds: 28800, // 8 hours daily allowance
    monthlySecondsUsed: 3600,
    maxMonthlySeconds: 0,
    currentDayUTC: new Date().toISOString().split('T')[0],
    nextResetUTC: new Date(Date.now() + 7 * 3600 * 1000).toISOString(),
    billingHistory: [],
    lastActive: new Date().toISOString(),
  });

  const [projects, setProjects] = useState<RepositoryProject[]>([]);
  const [corrections, setCorrections] = useState<DebugCorrection[]>([]);

  // Active Code in Workspace
  const [activeCode, setActiveCode] = useState<string>(`# Python Sample with deliberate syntax and logic bugs
def calculate_metrics(items=[]):
    total = 0
    for i in items
        total += i
    
    # Missing closing parenthesis on print
    print("Calculated total: " + str(total)
    
    # Division without zero check
    average = total / len(items)
    return {"total": total, "average": average}

data = [10, 20, 30]
print(calculate_metrics(data))
`);
  const [activeLanguage, setActiveLanguage] = useState<string>('python');
  const [activeFilename, setActiveFilename] = useState<string>('metrics.py');

  // Debugger Results State
  const [debuggerData, setDebuggerData] = useState<{
    originalCode: string;
    correctedCode: string;
    detectedIssues: DetectedIssue[];
    explanation: string;
    whyOriginalWasWrong: string;
    catComment: string;
  }>({
    originalCode: `def calculate_metrics(items=[]):
    total = 0
    for i in items
        total += i
    print("Calculated total: " + str(total)
    average = total / len(items)
    return {"total": total, "average": average}`,
    correctedCode: `def calculate_metrics(items=None):
    if items is None:
        items = []
    total = sum(items)
    print("Calculated total: " + str(total))
    average = total / len(items) if items else 0
    return {"total": total, "average": average}`,
    detectedIssues: [
      {
        line: 4,
        type: 'syntax',
        message: "SyntaxError: expected ':' at end of 'for' statement",
        severity: 'error',
        suggestedFix: "for i in items:",
      },
      {
        line: 6,
        type: 'syntax',
        message: "SyntaxError: Unclosed parenthesis '(' on call to print",
        severity: 'error',
        suggestedFix: "print(...)",
      },
      {
        line: 2,
        type: 'runtime_hazard',
        message: "Python Anti-Pattern: Mutable default argument 'items=[]'",
        severity: 'warning',
        suggestedFix: "items=None",
      },
    ],
    explanation:
      "CodeBloom added the required colon to the 'for' loop, closed the unclosed parenthesis in print(), and replaced the mutable default argument with 'None' to avoid shared state across function invocations.",
    whyOriginalWasWrong:
      "Python byte-compilation requires strict colon terminators on control blocks and balanced parentheses. Leaving arguments as mutable '[]' retains state across subsequent calls.",
    catComment: "Meow! I found a little mistake in the loop colon and print parenthesis. Let's fix it together!",
  });

  const triggerNotification = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4500);
  };

  // Fetch initial data from backend
  useEffect(() => {
    async function loadData() {
      try {
        const me = await api.getMe();
        if (me.user) setUser(me.user);
        if (me.usage) setUsage(me.usage);

        const projs = await api.getRepositories();
        if (projs.length > 0) {
          setProjects(projs);
        } else {
          // Initialize demo repository
          const demo = await api.analyzeGitHubRepo('bloom/dreamy-cart');
          setProjects([demo]);
        }

        const corrs = await api.getCorrectionHistory();
        setCorrections(corrs);
      } catch (err) {
        console.warn('Initial backend sync, using cached demo data:', err);
      }
    }
    loadData();
  }, []);

  // Periodic usage status sync (without consuming allowance during idle reading or editing)
  useEffect(() => {
    if (appMode !== 'platform') return;

    const interval = setInterval(async () => {
      try {
        const res = await api.getUsage();
        if (res.usage) {
          setUsage(res.usage);
        }
      } catch {
        // silent
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [appMode]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  const handleTogglePetals = () => {
    setPetalsEnabled(!petalsEnabled);
  };

  // Run AI Code Debugger
  const handleAnalyzeCode = async (code: string, language: string, filename: string) => {
    try {
      sound.playBloomChime(523.25);
      triggerNotification(`Analyzing ${filename} with AST static parser & Gemini AI...`);

      const res = await api.analyzeCode(code, language, filename);

      setDebuggerData({
        originalCode: code,
        correctedCode: res.correctedCode,
        detectedIssues: res.detectedIssues,
        explanation: res.explanation,
        whyOriginalWasWrong: res.whyOriginalWasWrong,
        catComment: res.catComment,
      });

      setActiveCode(code);
      setActiveLanguage(language);
      setActiveFilename(filename);

      // Switch to debugger tab
      setPlatformTab('debugger');
      sound.playBloomChime(783.99);
      triggerNotification('Code analyzed! Side-by-side error correction workspace opened.');

      // Refresh backend usage
      api.getUsage().then((u) => {
        if (u.usage) setUsage(u.usage);
      }).catch(() => {});
    } catch (err: any) {
      triggerNotification(err.message || 'Analysis failed');
    }
  };

  // Apply correction from debugger to editor
  const handleApplyCorrectionToEditor = (correctedCode: string) => {
    setActiveCode(correctedCode);
    triggerNotification('Corrected code applied to workspace! Ready to test or download.');
  };

  // Handle ZIP upload
  const handleUploadZip = async (base64: string, name: string) => {
    try {
      sound.playBloomChime(659.25);
      triggerNotification(`Unpacking ZIP repository '${name}' with Zip-Slip protection...`);
      const res = await api.analyzeZipFile(base64, name);
      setProjects((prev) => [res, ...prev]);
      sound.playSuccessHarp();
      triggerNotification(`Repository '${res.name}' successfully parsed and mapped!`);
    } catch (err: any) {
      triggerNotification(err.message || 'ZIP upload failed');
    }
  };

  // Handle GitHub connect
  const handleAnalyzeGitHub = async (url: string) => {
    try {
      sound.playBloomChime(659.25);
      triggerNotification(`Connecting to GitHub repository '${url}'...`);
      const res = await api.analyzeGitHubRepo(url);
      setProjects((prev) => [res, ...prev]);
      sound.playSuccessHarp();
      triggerNotification(`GitHub repository '${res.name}' AST mapped!`);
    } catch (err: any) {
      triggerNotification(err.message || 'GitHub connection failed');
    }
  };

  // Update profile
  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await api.updateProfile(updates);
      setUser(updated);
      triggerNotification('Developer profile and AI calibration updated!');
    } catch (err: any) {
      triggerNotification(err.message || 'Profile update failed');
    }
  };

  // Subscription upgrade
  const handleUpgrade = async (confirmed: boolean = true) => {
    const res = await api.upgradeSubscription(confirmed);
    setUsage(res.usage);
    triggerNotification('Upgraded to CodeBloom Pro! 20h/day priority compute active.');
  };

  // Subscription cancel
  const handleCancel = async () => {
    const res = await api.cancelSubscription();
    setUsage(res.usage);
    triggerNotification('Subscription cancelled.');
  };

  // Account delete
  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      triggerNotification('Account deleted. Switched to public demo view.');
      setAppMode('landing');
    } catch (err: any) {
      triggerNotification(err.message || 'Delete failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] text-[#493B55] relative selection:bg-[#F8DCE8] selection:text-[#493B55]">
      
      {/* Falling Sakura Petals Layer */}
      <PetalCanvas enabled={petalsEnabled} />

      {/* Global Top App Mode Switcher (Judge / Evaluator convenience) */}
      <div className="bg-[#493B55] text-[#FFF9F2] px-4 py-2 text-xs flex items-center justify-between z-50 sticky top-0 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-pixel font-bold">🌸 CODEBLOOM FULL-STACK</span>
          <span className="hidden sm:inline text-white/50">·</span>
          <span className="hidden sm:inline text-[#F8DCE8] text-[11px]">
            {user.fullName} ({user.skillLevel} Level)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playSoftTick();
              setAppMode(appMode === 'platform' ? 'landing' : 'platform');
            }}
            className="bg-[#FFF9F2] text-[#493B55] px-3 py-1 rounded-lg text-xs font-bold hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            {appMode === 'platform' ? (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span>View Landing Page</span>
              </>
            ) : (
              <>
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Open Developer Platform</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {activeNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#493B55] text-[#FFF9F2] px-4 py-3 rounded-2xl border-2 border-[#F8DCE8] pixel-box-shadow flex items-center gap-2.5 text-xs sm:text-sm font-medium animate-fadeIn max-w-md shadow-xl">
          <span className="text-base select-none">🌸</span>
          <span>{activeNotification}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. FULL-STACK DEVELOPER PLATFORM WORKSPACE MODE */}
      {/* ========================================================= */}
      {appMode === 'platform' ? (
        <div className="flex min-h-[calc(100vh-36px)]">
          
          {/* Platform Sidebar */}
          <Sidebar
            activeTab={platformTab}
            onSelectTab={(tab) => setPlatformTab(tab)}
            user={user}
            usage={usage}
            onLogout={() => {
              triggerNotification('Signed out from workspace.');
              setAppMode('landing');
            }}
            onStartTour={() => setTourModalOpen(true)}
          />

          {/* Main Platform Content Viewport */}
          <main className="flex-1 overflow-y-auto bg-[#FFF9F2]/70 pb-16">
            
            {platformTab === 'dashboard' && (
              <DashboardView
                user={user}
                usage={usage}
                projects={projects}
                corrections={corrections}
                onNavigate={(tab) => setPlatformTab(tab)}
                onStartTour={() => setTourModalOpen(true)}
              />
            )}

            {platformTab === 'editor' && (
              <CodeEditorView
                onAnalyzeCode={handleAnalyzeCode}
                initialCode={activeCode}
                initialLanguage={activeLanguage}
                initialFilename={activeFilename}
              />
            )}

            {platformTab === 'debugger' && (
              <SideBySideDebuggerView
                originalCode={debuggerData.originalCode}
                correctedCode={debuggerData.correctedCode}
                detectedIssues={debuggerData.detectedIssues}
                explanation={debuggerData.explanation}
                whyOriginalWasWrong={debuggerData.whyOriginalWasWrong}
                catComment={debuggerData.catComment}
                filename={activeFilename}
                language={activeLanguage}
                user={user}
                onApplyCorrectionToEditor={handleApplyCorrectionToEditor}
                onReAnalyze={() => handleAnalyzeCode(activeCode, activeLanguage, activeFilename)}
              />
            )}

            {platformTab === 'repositories' && (
              <RepoExplorerView
                projects={projects}
                onUploadZip={handleUploadZip}
                onAnalyzeGitHub={handleAnalyzeGitHub}
                onSelectProjectForArchitecture={(proj) => {
                  setPlatformTab('architecture');
                }}
                onOpenFileInEditor={(file: AnalyzedFile) => {
                  setActiveCode(file.content);
                  setActiveLanguage(file.language);
                  setActiveFilename(file.path);
                  setPlatformTab('editor');
                }}
              />
            )}

            {platformTab === 'architecture' && (
              <InteractiveArchitectureView
                project={projects[0]}
                projects={projects}
                onSelectProject={(proj) => {
                  triggerNotification(`Loaded architecture for ${proj.name}`);
                }}
              />
            )}

            {platformTab === 'assistant' && (
              <div className="p-6 sm:p-8 max-w-4xl mx-auto">
                <AssistantWorkspace
                  project={projects[0]}
                  currentCode={activeCode}
                  activeFile={activeFilename}
                />
              </div>
            )}

            {platformTab === 'onboarding' && (
              <OnboardingGuideView project={projects[0]} user={user} />
            )}

            {platformTab === 'tasks' && (
              <div className="p-6 sm:p-8 max-w-5xl mx-auto">
                <TaskManagerSection />
              </div>
            )}

            {platformTab === 'how-to-use' && (
              <HowToUseView onNavigate={(tab) => setPlatformTab(tab)} />
            )}

            {platformTab === 'pricing' && (
              <PricingView
                usage={usage}
                onUpgrade={handleUpgrade}
                onCancel={handleCancel}
              />
            )}

            {platformTab === 'settings' && (
              <SettingsView
                user={user}
                onUpdateProfile={handleUpdateProfile}
                onDeleteAccount={handleDeleteAccount}
              />
            )}

          </main>
        </div>
      ) : (
        /* ========================================================= */
        /* 2. PUBLIC SHOWCASE & LANDING PAGE MODE */
        /* ========================================================= */
        <div>
          {/* Top Navbar */}
          <Navbar
            onOpenAnalyze={() => {
              setAppMode('platform');
              setPlatformTab('editor');
            }}
            onOpenAuth={() => setAuthModalOpen(true)}
            petalsEnabled={petalsEnabled}
            onTogglePetals={handleTogglePetals}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />

          {/* Hero Section */}
          <HeroSection
            onAnalyzeRepo={(repo) => {
              if (repo) handleAnalyzeGitHub(repo);
              setAppMode('platform');
              setPlatformTab('repositories');
            }}
            onExploreFeatures={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* Features Bento */}
          <FeaturesSection
            onOpenArchitecture={() => {
              setAppMode('platform');
              setPlatformTab('architecture');
            }}
            onOpenDebugger={() => {
              setAppMode('platform');
              setPlatformTab('debugger');
            }}
            onOpenAssistant={() => {
              setAppMode('platform');
              setPlatformTab('assistant');
            }}
            onOpenAnalyzer={() => {
              setAppMode('platform');
              setPlatformTab('repositories');
            }}
          />

          {/* Signature Debugger Section */}
          <SignatureDebugger />

          {/* Architecture Visualization Section */}
          <ArchitectureVisualizer />

          {/* Live Playground */}
          <div id="analyzer">
            <RepoAnalyzerPlayground />
          </div>

          {/* Assistant Workspace */}
          <AssistantWorkspace />

          {/* Task Manager */}
          <TaskManagerSection />

          {/* How It Works & Petalyx Panoramic */}
          <HowItWorksSection
            onGetStarted={() => {
              setAppMode('platform');
              setPlatformTab('dashboard');
            }}
          />

          {/* Footer */}
          <Footer
            onNavClick={(id) => {
              const el = document.getElementById(id);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {/* Guided Tour Modal */}
      <GuidedTourModal
        isOpen={tourModalOpen}
        onClose={() => setTourModalOpen(false)}
        onNavigateToTab={(tab) => setPlatformTab(tab)}
      />

      {/* Auth Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(email) => {
          api.login(email).then((res) => {
            setUser(res.user);
            setUsage(res.usage);
            triggerNotification(`Welcome back, ${res.user.fullName}!`);
            setAppMode('platform');
          });
        }}
      />

      <RegistrationModal
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        onRegisterSuccess={(userData) => {
          api.register(userData).then((res) => {
            setUser(res.user);
            setUsage(res.usage);
            triggerNotification(`Account created! Welcome, ${res.user.fullName}.`);
            setAppMode('platform');
          });
        }}
        onSwitchToLogin={() => setAuthModalOpen(true)}
      />

    </div>
  );
}
