export interface UserProfile {
  fullName: string;
  email: string;
  occupation: string;
  professionalPosition: string;
  workExperience: string;
  programmingExperience: string;
  preferredLanguages: string[];
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Student';
  purpose: string;
  emailVerified: boolean;
  createdAt: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

export interface VsCodeSession {
  id: string;
  userId: string;
  editorVersion: string;
  connectedAt: string;
  lastPing: string;
  activeWorkspace: string;
  clientType: 'vscode-desktop' | 'vscode-web';
}

export interface UserUsage {
  userId: string;
  plan: 'free' | 'paid';
  subscriptionStatus: 'active' | 'none' | 'cancelled';
  dailySecondsUsed: number;
  maxDailySeconds: number; // 28,800s (8h/day) for Free, 72,000s (20h/day) for Pro
  monthlySecondsUsed: number;
  maxMonthlySeconds: number; // 900,000s for Pro
  currentDayUTC: string;
  nextResetUTC: string;
  billingHistory: { date: string; amount: number; description: string; status: string }[];
  lastActive: string;
}

export interface DetectedIssue {
  line: number;
  column?: number;
  type: 'syntax' | 'undefined_variable' | 'type_error' | 'runtime_hazard' | 'style' | 'missing_import';
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestedFix: string;
}

export interface DebugCorrection {
  id: string;
  userId: string;
  filename: string;
  language: string;
  originalCode: string;
  correctedCode: string;
  detectedIssues: DetectedIssue[];
  explanation: string;
  whyOriginalWasWrong: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface AnalyzedFile {
  path: string;
  language: string;
  content: string;
  lines: number;
  errorsCount: number;
  functions: string[];
  imports: string[];
}

export interface RepositoryProject {
  id: string;
  userId: string;
  name: string;
  source: 'github' | 'zip' | 'upload' | 'demo';
  repoUrl?: string;
  createdAt: string;
  files: AnalyzedFile[];
  dependencies: { name: string; version: string; type: string }[];
  complexityScore: number;
  architectureNodes: { id: string; label: string; type: string; connections: string[]; lines: number }[];
  onboardingGuide?: {
    overview: string;
    techStack: string[];
    entryPoint: string;
    criticalFiles: string[];
    learningPath: { step: string; description: string; files: string[] }[];
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'cat';
  text: string;
  codeSnippet?: string;
  createdAt: string;
}

export interface DevTask {
  id: string;
  userId?: string;
  projectId?: string;
  milestone: 'Day 1' | 'Day 2' | 'Day 3' | 'Custom';
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  estimatedMins: number;
  completed: boolean;
  createdAt?: string;
}
