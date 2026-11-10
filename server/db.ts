import fs from 'fs';
import path from 'path';

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
  passwordHash: string;
  createdAt: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

export interface UserUsage {
  userId: string;
  plan: 'free' | 'paid';
  subscriptionStatus: 'active' | 'none' | 'cancelled';
  dailySecondsUsed: number;
  maxDailySeconds: number; // Free: 28,800s (8 hours/day). Pro: 72,000s (20 hours/day)
  monthlySecondsUsed: number;
  maxMonthlySeconds: number; // Free: 864,000s. Pro: 900,000s (250 hours/month)
  currentDayUTC: string; // YYYY-MM-DD in UTC
  nextResetUTC: string; // ISO string of upcoming midnight UTC
  billingHistory: { date: string; amount: number; description: string; status: string }[];
  lastActive: string;
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

export interface DebugCorrection {
  id: string;
  userId: string;
  projectId?: string;
  filename: string;
  language: string;
  originalCode: string;
  correctedCode: string;
  detectedIssues: {
    line: number;
    column?: number;
    type: 'syntax' | 'undefined_variable' | 'type_error' | 'runtime_hazard' | 'style' | 'missing_import';
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestedFix: string;
  }[];
  explanation: string;
  whyOriginalWasWrong: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  projectId?: string;
  sender: 'user' | 'cat';
  text: string;
  codeSnippet?: string;
  createdAt: string;
}

export interface DevTask {
  id: string;
  userId: string;
  projectId?: string;
  milestone: 'Day 1' | 'Day 2' | 'Day 3' | 'Custom';
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  estimatedMins: number;
  completed: boolean;
  createdAt: string;
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

interface DatabaseSchema {
  users: Record<string, UserProfile>;
  usage: Record<string, UserUsage>;
  projects: Record<string, RepositoryProject>;
  corrections: Record<string, DebugCorrection>;
  chats: Record<string, ChatMessage[]>;
  tasks: Record<string, DevTask[]>;
  vscodeSessions: Record<string, VsCodeSession[]>;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export function getTodayUTC(): string {
  return new Date().toISOString().split('T')[0];
}

export function getNextMidnightUTC(): string {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return next.toISOString();
}

// Ensure database directory and file exist
function initDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      users: {},
      usage: {},
      projects: {},
      corrections: {},
      chats: {},
      tasks: {},
      vscodeSessions: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.tasks) parsed.tasks = {};
    if (!parsed.vscodeSessions) parsed.vscodeSessions = {};
    // Purge deprecated hardcoded 'developer@codebloom.dev' (Alex River) if present
    if (parsed.users && parsed.users['developer@codebloom.dev']) {
      delete parsed.users['developer@codebloom.dev'];
      delete parsed.usage['developer@codebloom.dev'];
      delete parsed.tasks['developer@codebloom.dev'];
      delete parsed.chats['developer@codebloom.dev'];
      delete parsed.vscodeSessions['developer@codebloom.dev'];
      // Also purge corrections and projects tied to that old demo identity
      if (parsed.corrections) {
        Object.keys(parsed.corrections).forEach((k) => {
          if (parsed.corrections[k].userId === 'developer@codebloom.dev') {
            delete parsed.corrections[k];
          }
        });
      }
      if (parsed.projects) {
        Object.keys(parsed.projects).forEach((k) => {
          if (parsed.projects[k].userId === 'developer@codebloom.dev') {
            delete parsed.projects[k];
          }
        });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  } catch (err) {
    console.error('Error reading db.json, re-initializing', err);
    const initialData: DatabaseSchema = {
      users: {},
      usage: {},
      projects: {},
      corrections: {},
      chats: {},
      tasks: {},
      vscodeSessions: {},
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = initDb();
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // Users
  getUser(email: string): UserProfile | undefined {
    return this.data.users[email];
  }

  saveUser(user: UserProfile): void {
    this.data.users[user.email] = user;
    if (!this.data.usage[user.email]) {
      this.data.usage[user.email] = {
        userId: user.email,
        plan: 'free', // New users always receive Free plan by default!
        subscriptionStatus: 'none',
        dailySecondsUsed: 0,
        maxDailySeconds: 28800, // 8 hours per day
        monthlySecondsUsed: 0,
        maxMonthlySeconds: 864000,
        currentDayUTC: getTodayUTC(),
        nextResetUTC: getNextMidnightUTC(),
        billingHistory: [],
        lastActive: new Date().toISOString(),
      };
    }

    // Initialize personal onboarding tasks for the user if they have none
    if (!this.data.tasks[user.email] || this.data.tasks[user.email].length === 0) {
      this.initUserTasks(user.email);
    }

    this.save();
  }

  private initUserTasks(userId: string) {
    this.data.tasks[userId] = [
      {
        id: `t-${Date.now()}-1`,
        userId,
        milestone: 'Day 1',
        title: 'Explore repository topology in CodeBloom Architecture Map',
        category: 'Architecture',
        priority: 'high',
        deadline: 'Day 1 Sprint',
        estimatedMins: 15,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `t-${Date.now()}-2`,
        userId,
        milestone: 'Day 1',
        title: 'Submit your first file to CodeBloom Side-by-Side Debugger',
        category: 'Code Quality',
        priority: 'medium',
        deadline: 'Day 1 Sprint',
        estimatedMins: 10,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `t-${Date.now()}-3`,
        userId,
        milestone: 'Day 2',
        title: 'Connect Visual Studio Code with CodeBloom Extension token',
        category: 'Editor Integration',
        priority: 'high',
        deadline: 'Day 2 Sprint',
        estimatedMins: 15,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `t-${Date.now()}-4`,
        userId,
        milestone: 'Day 3',
        title: 'Review personalized Onboarding Roadmap and export Markdown',
        category: 'Delivery',
        priority: 'medium',
        deadline: 'Day 3 Sprint',
        estimatedMins: 20,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  deleteUser(email: string): boolean {
    if (this.data.users[email]) {
      delete this.data.users[email];
      delete this.data.usage[email];
      delete this.data.chats[email];
      delete this.data.tasks[email];
      delete this.data.vscodeSessions[email];

      // Clean up user's private projects and corrections
      Object.keys(this.data.projects).forEach((id) => {
        if (this.data.projects[id].userId === email) {
          delete this.data.projects[id];
        }
      });
      Object.keys(this.data.corrections).forEach((id) => {
        if (this.data.corrections[id].userId === email) {
          delete this.data.corrections[id];
        }
      });

      this.save();
      return true;
    }
    return false;
  }

  // Optional Sandbox Demo Mode setup (clearly separated and tagged as demo)
  initDemoSandbox(): { user: UserProfile; usage: UserUsage } {
    const demoEmail = 'demo@codebloom.dev';
    if (!this.data.users[demoEmail]) {
      const demoUser: UserProfile = {
        fullName: 'Demo Sandbox Guest',
        email: demoEmail,
        occupation: 'Software Engineer',
        professionalPosition: 'Evaluating CodeBloom',
        workExperience: '1-3 years',
        programmingExperience: 'TypeScript & Python',
        preferredLanguages: ['TypeScript', 'Python', 'JavaScript'],
        skillLevel: 'Intermediate',
        purpose: 'Evaluating architecture visualizer and AI debugger',
        emailVerified: true,
        passwordHash: 'demo_sandbox_hash',
        createdAt: new Date().toISOString(),
        isDemo: true,
      };
      this.data.users[demoEmail] = demoUser;
      this.data.usage[demoEmail] = {
        userId: demoEmail,
        plan: 'free',
        subscriptionStatus: 'none',
        dailySecondsUsed: 120,
        maxDailySeconds: 28800,
        monthlySecondsUsed: 120,
        maxMonthlySeconds: 864000,
        currentDayUTC: getTodayUTC(),
        nextResetUTC: getNextMidnightUTC(),
        billingHistory: [],
        lastActive: new Date().toISOString(),
      };
      this.initUserTasks(demoEmail);
      this.save();
    }
    return {
      user: this.data.users[demoEmail],
      usage: this.data.usage[demoEmail],
    };
  }

  // Usage & Accounting
  getUsage(email: string): UserUsage {
    const today = getTodayUTC();
    if (!this.data.usage[email]) {
      this.data.usage[email] = {
        userId: email,
        plan: 'free',
        subscriptionStatus: 'none',
        dailySecondsUsed: 0,
        maxDailySeconds: 28800,
        monthlySecondsUsed: 0,
        maxMonthlySeconds: 864000,
        currentDayUTC: today,
        nextResetUTC: getNextMidnightUTC(),
        billingHistory: [],
        lastActive: new Date().toISOString(),
      };
      this.save();
    } else {
      // Check for automatic daily reset at midnight UTC
      const userUsage = this.data.usage[email];
      if (userUsage.currentDayUTC !== today) {
        userUsage.currentDayUTC = today;
        userUsage.dailySecondsUsed = 0; // Automatically reset daily allowance!
        userUsage.nextResetUTC = getNextMidnightUTC();
        this.save();
      }
      if (!userUsage.maxDailySeconds) {
        userUsage.maxDailySeconds = userUsage.plan === 'paid' ? 72000 : 28800;
        userUsage.maxMonthlySeconds = userUsage.plan === 'paid' ? 900000 : 864000;
        userUsage.nextResetUTC = getNextMidnightUTC();
        this.save();
      }
    }
    return this.data.usage[email];
  }

  recordUsage(email: string, secondsDelta: number): UserUsage {
    const usage = this.getUsage(email);
    const delta = Math.max(0, secondsDelta);
    usage.dailySecondsUsed = (usage.dailySecondsUsed || 0) + delta;
    usage.monthlySecondsUsed = (usage.monthlySecondsUsed || 0) + delta;
    usage.lastActive = new Date().toISOString();
    this.save();
    return usage;
  }

  upgradeToPaid(email: string): UserUsage {
    const usage = this.getUsage(email);
    usage.plan = 'paid';
    usage.subscriptionStatus = 'active';
    usage.maxDailySeconds = 72000;
    usage.maxMonthlySeconds = 900000;
    usage.billingHistory.push({
      date: new Date().toISOString(),
      amount: 25.0,
      description: 'CodeBloom Pro — Monthly Subscription ($25 USD/mo, Billed Monthly)',
      status: 'Paid (Verified)',
    });
    this.save();
    return usage;
  }

  cancelSubscription(email: string): UserUsage {
    const usage = this.getUsage(email);
    usage.subscriptionStatus = 'cancelled';
    this.save();
    return usage;
  }

  // Projects - STRICT USER ISOLATION
  getProjects(userId: string): RepositoryProject[] {
    return Object.values(this.data.projects).filter((p) => p.userId === userId);
  }

  getProject(id: string): RepositoryProject | undefined {
    return this.data.projects[id];
  }

  saveProject(project: RepositoryProject): void {
    this.data.projects[project.id] = project;
    this.save();
  }

  // Corrections & Debug History - STRICT USER ISOLATION
  saveCorrection(correction: DebugCorrection): void {
    this.data.corrections[correction.id] = correction;
    this.save();
  }

  getCorrections(userId: string): DebugCorrection[] {
    return Object.values(this.data.corrections)
      .filter((c) => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  updateCorrectionStatus(id: string, status: 'accepted' | 'rejected'): DebugCorrection | undefined {
    const corr = this.data.corrections[id];
    if (corr) {
      corr.status = status;
      this.save();
      return corr;
    }
    return undefined;
  }

  // Chats - STRICT USER ISOLATION
  getChat(userId: string): ChatMessage[] {
    return this.data.chats[userId] || [];
  }

  addChatMessage(msg: ChatMessage): void {
    if (!this.data.chats[msg.userId]) {
      this.data.chats[msg.userId] = [];
    }
    this.data.chats[msg.userId].push(msg);
    this.save();
  }

  clearChat(userId: string): void {
    this.data.chats[userId] = [];
    this.save();
  }

  // Tasks - STRICT USER ISOLATION
  getTasks(userId: string): DevTask[] {
    return this.data.tasks[userId] || [];
  }

  saveTask(task: DevTask): DevTask {
    if (!this.data.tasks[task.userId]) {
      this.data.tasks[task.userId] = [];
    }
    const existingIndex = this.data.tasks[task.userId].findIndex((t) => t.id === task.id);
    if (existingIndex >= 0) {
      this.data.tasks[task.userId][existingIndex] = task;
    } else {
      this.data.tasks[task.userId].unshift(task);
    }
    this.save();
    return task;
  }

  updateTask(userId: string, id: string, updates: Partial<DevTask>): DevTask | undefined {
    const userTasks = this.data.tasks[userId];
    if (!userTasks) return undefined;
    const task = userTasks.find((t) => t.id === id);
    if (task) {
      Object.assign(task, updates);
      this.save();
      return task;
    }
    return undefined;
  }

  deleteTask(userId: string, id: string): boolean {
    const userTasks = this.data.tasks[userId];
    if (!userTasks) return false;
    const initialLen = userTasks.length;
    this.data.tasks[userId] = userTasks.filter((t) => t.id !== id);
    if (this.data.tasks[userId].length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // VS Code Extension Sessions - STRICT USER ISOLATION
  getVsCodeSessions(userId: string): VsCodeSession[] {
    return this.data.vscodeSessions[userId] || [];
  }

  registerVsCodeSession(session: VsCodeSession): void {
    if (!this.data.vscodeSessions[session.userId]) {
      this.data.vscodeSessions[session.userId] = [];
    }
    const existingIdx = this.data.vscodeSessions[session.userId].findIndex((s) => s.id === session.id);
    if (existingIdx >= 0) {
      this.data.vscodeSessions[session.userId][existingIdx] = session;
    } else {
      this.data.vscodeSessions[session.userId].unshift(session);
    }
    this.save();
  }

  removeVsCodeSession(userId: string, sessionId: string): boolean {
    const list = this.data.vscodeSessions[userId];
    if (!list) return false;
    this.data.vscodeSessions[userId] = list.filter((s) => s.id !== sessionId);
    this.save();
    return true;
  }
}

export const db = new JsonDatabase();
