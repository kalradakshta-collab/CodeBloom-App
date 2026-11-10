import {
  UserProfile,
  UserUsage,
  DebugCorrection,
  RepositoryProject,
  ChatMessage,
  DetectedIssue,
  DevTask,
  VsCodeSession,
} from '../types';

class ApiService {
  private token: string = localStorage.getItem('bloom_token') || '';

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem('bloom_token', token);
  }

  public getToken(): string {
    return this.token;
  }

  public clearToken() {
    this.token = '';
    localStorage.removeItem('bloom_token');
  }

  public isAuthenticated(): boolean {
    return Boolean(this.token && this.token.length > 0);
  }

  private headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    };
  }

  // Auth
  public async getMe(): Promise<{ user: UserProfile; usage: UserUsage }> {
    const res = await fetch('/api/auth/me', { headers: this.headers() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  }

  public async register(data: any): Promise<{ user: UserProfile; usage: UserUsage; token: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const json = await res.json();
    this.setToken(json.token);
    return json;
  }

  public async login(email: string): Promise<{ user: UserProfile; usage: UserUsage; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Login failed');
    const json = await res.json();
    this.setToken(json.token);
    return json;
  }

  public async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch('/api/auth/profile', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    const json = await res.json();
    return json.user;
  }

  public async deleteAccount(): Promise<void> {
    const res = await fetch('/api/auth/delete-account', {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok) throw new Error('Failed to delete account');
    this.clearToken();
  }

  // Usage & Subscription
  public async getUsage(): Promise<{
    usage: UserUsage;
    plan: 'free' | 'paid';
    dailySecondsUsed: number;
    maxDailySeconds: number;
    remainingDailySeconds: number;
    remainingDailyHours: string;
    nextResetUTC: string;
    currentDayUTC: string;
    hoursToReset: number;
    minutesToReset: number;
    isNearlyExhausted: boolean;
    isExhausted: boolean;
    allowAiOperations: boolean;
    percentUsed: number;
  }> {
    const res = await fetch('/api/usage', { headers: this.headers() });
    if (!res.ok) throw new Error('Failed to fetch usage');
    return res.json();
  }

  public async tickUsage(deltaSeconds: number = 10): Promise<any> {
    const res = await fetch('/api/usage/tick', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ deltaSeconds }),
    });
    return res.json();
  }

  public async upgradeSubscription(confirmed: boolean = true): Promise<any> {
    const res = await fetch('/api/subscription/upgrade', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ confirmed }),
    });
    if (!res.ok) throw new Error('Upgrade failed');
    return res.json();
  }

  public async cancelSubscription(): Promise<any> {
    const res = await fetch('/api/subscription/cancel', {
      method: 'POST',
      headers: this.headers(),
    });
    return res.json();
  }

  // Debugger
  public async analyzeCode(
    code: string,
    language: string,
    filename: string
  ): Promise<{
    id: string;
    correctedCode: string;
    detectedIssues: DetectedIssue[];
    explanation: string;
    whyOriginalWasWrong: string;
    catComment: string;
  }> {
    const res = await fetch('/api/debug/analyze', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ code, language, filename }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Code analysis failed');
    }
    return res.json();
  }

  public async getCorrectionHistory(): Promise<DebugCorrection[]> {
    const res = await fetch('/api/debug/history', { headers: this.headers() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.corrections || [];
  }

  public async updateCorrectionStatus(id: string, status: 'accepted' | 'rejected'): Promise<any> {
    const res = await fetch(`/api/debug/history/${id}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify({ status }),
    });
    return res.json();
  }

  // Repositories
  public async getRepositories(): Promise<RepositoryProject[]> {
    const res = await fetch('/api/repository/list', { headers: this.headers() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.projects || [];
  }

  public async analyzeGitHubRepo(repoUrl: string): Promise<RepositoryProject> {
    const res = await fetch('/api/repository/analyze-github', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ repoUrl }),
    });
    if (!res.ok) throw new Error('GitHub analysis failed');
    const json = await res.json();
    return json.project;
  }

  public async analyzeZipFile(base64Data: string, filename: string): Promise<RepositoryProject> {
    const res = await fetch('/api/repository/analyze-zip', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ base64Data, filename }),
    });
    if (!res.ok) throw new Error('ZIP analysis failed');
    const json = await res.json();
    return json.project;
  }

  // Assistant Chat
  public async getChatMessages(): Promise<ChatMessage[]> {
    const res = await fetch('/api/assistant/chat', { headers: this.headers() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.messages || [];
  }

  public async sendChatMessage(
    message: string,
    currentCode?: string,
    activeFile?: string,
    projectId?: string
  ): Promise<ChatMessage> {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ message, currentCode, activeFile, projectId }),
    });
    if (!res.ok) throw new Error('Message sending failed');
    const json = await res.json();
    return json.message;
  }

  // Tasks
  public async getTasks(): Promise<DevTask[]> {
    const res = await fetch('/api/tasks', { headers: this.headers() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.tasks || [];
  }

  public async createTask(task: Partial<DevTask>): Promise<DevTask> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(task),
    });
    if (!res.ok) throw new Error('Failed to create task');
    const json = await res.json();
    return json.task;
  }

  public async updateTask(id: string, updates: Partial<DevTask>): Promise<DevTask> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update task');
    const json = await res.json();
    return json.task;
  }

  public async deleteTask(id: string): Promise<void> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok) throw new Error('Failed to delete task');
  }

  public async activateDemoSandbox(): Promise<{ user: UserProfile; usage: UserUsage; token: string }> {
    const res = await fetch('/api/auth/demo-sandbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to activate demo sandbox');
    const json = await res.json();
    this.setToken(json.token);
    return json;
  }

  // VS Code Extension Link
  public async getVsCodeSessions(): Promise<VsCodeSession[]> {
    const res = await fetch('/api/vscode/sessions', { headers: this.headers() });
    if (!res.ok) return [];
    const json = await res.json();
    return json.sessions || [];
  }

  public async disconnectVsCode(sessionId: string): Promise<void> {
    const res = await fetch('/api/vscode/disconnect', {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ sessionId }),
    });
    if (!res.ok) throw new Error('Failed to disconnect VS Code session');
  }
}

export const api = new ApiService();
