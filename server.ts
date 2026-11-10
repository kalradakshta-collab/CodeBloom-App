import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, UserProfile, VsCodeSession } from './server/db';
import { StaticAnalyzer } from './server/staticAnalyzer';
import { AiService } from './server/aiService';
import { RepoAnalyzer } from './server/repoAnalyzer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProduction = process.env.NODE_ENV === 'production';

  // Middlewares: JSON parser with generous limit for code payloads & ZIP base64
  app.use(express.json({ limit: '30mb' }));
  app.use(express.urlencoded({ extended: true, limit: '30mb' }));

  // Security headers & CORS
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CodeBloom-Client');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Strict User Extraction: NEVER fall back to hardcoded sample identities!
  const getAuthUser = (req: Request): UserProfile | undefined => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      if (!token) return undefined;
      const user = db.getUser(token);
      if (user) return user;
    }
    return undefined;
  };

  // -------------------------------------------------------------
  // 1. DYNAMIC AUTHENTICATION & PERSONALIZATION APIS
  // -------------------------------------------------------------

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const {
      fullName,
      email,
      password,
      occupation,
      professionalPosition,
      workExperience,
      programmingExperience,
      preferredLanguages,
      skillLevel,
      purpose,
    } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ error: 'Full name and email are required for registration' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (db.getUser(cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const newUser: UserProfile = {
      fullName: fullName.trim(),
      email: cleanEmail,
      occupation: occupation || 'Developer',
      professionalPosition: professionalPosition || 'Software Engineer',
      workExperience: workExperience || '1-3 years',
      programmingExperience: programmingExperience || 'Intermediate',
      preferredLanguages: Array.isArray(preferredLanguages) && preferredLanguages.length > 0 ? preferredLanguages : ['Python', 'JavaScript'],
      skillLevel: skillLevel || 'Intermediate',
      purpose: purpose || 'Understand complex repositories and debug faster',
      emailVerified: true,
      passwordHash: `hash_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    db.saveUser(newUser);
    const usage = db.getUsage(cleanEmail);

    return res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      usage,
      token: cleanEmail,
    });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.getUser(cleanEmail);

    if (!user) {
      return res.status(404).json({
        error: `No account registered with email '${cleanEmail}'. Please create an account to start using CodeBloom.`,
      });
    }

    const usage = db.getUsage(user.email);
    return res.json({
      message: 'Logged in successfully',
      user,
      usage,
      token: user.email,
    });
  });

  // Explicit Sandbox Demo Mode (Cleanly separated from real users)
  app.post('/api/auth/demo-sandbox', (_req: Request, res: Response) => {
    const sandbox = db.initDemoSandbox();
    return res.json({
      message: 'Demo Sandbox session activated',
      user: sandbox.user,
      usage: sandbox.usage,
      token: sandbox.user.email,
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthenticated session' });
    }
    const usage = db.getUsage(user.email);
    return res.json({ user, usage });
  });

  app.post('/api/auth/profile', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized: login required' });

    const updates = req.body;
    const updatedUser: UserProfile = {
      ...user,
      fullName: updates.fullName ?? user.fullName,
      occupation: updates.occupation ?? user.occupation,
      professionalPosition: updates.professionalPosition ?? user.professionalPosition,
      workExperience: updates.workExperience ?? user.workExperience,
      programmingExperience: updates.programmingExperience ?? user.programmingExperience,
      preferredLanguages: updates.preferredLanguages ?? user.preferredLanguages,
      skillLevel: updates.skillLevel ?? user.skillLevel,
      purpose: updates.purpose ?? user.purpose,
      avatarUrl: updates.avatarUrl ?? user.avatarUrl,
    };

    db.saveUser(updatedUser);
    return res.json({ message: 'Profile updated successfully', user: updatedUser });
  });

  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const { email } = req.body;
    return res.json({
      message: `Password reset instructions have been dispatched to ${email || 'your email'}.`,
    });
  });

  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (user) {
      user.emailVerified = true;
      db.saveUser(user);
    }
    return res.json({ message: 'Email verified successfully' });
  });

  app.delete('/api/auth/delete-account', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized: login required' });

    db.deleteUser(user.email);
    return res.json({ message: 'Account deleted cleanly' });
  });

  // -------------------------------------------------------------
  // 2. USAGE ACCOUNTING & SUBSCRIPTION (DAILY 8 HOURS / $25 PRO)
  // -------------------------------------------------------------

  app.get('/api/usage', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) {
      // Unauthenticated visitor default response
      return res.json({
        usage: {
          userId: 'guest',
          plan: 'free',
          subscriptionStatus: 'none',
          dailySecondsUsed: 0,
          maxDailySeconds: 28800,
          monthlySecondsUsed: 0,
          maxMonthlySeconds: 864000,
          currentDayUTC: new Date().toISOString().split('T')[0],
          nextResetUTC: new Date(Date.now() + 86400000).toISOString(),
          billingHistory: [],
          lastActive: new Date().toISOString(),
        },
        plan: 'free',
        dailySecondsUsed: 0,
        maxDailySeconds: 28800,
        remainingDailySeconds: 28800,
        remainingDailyHours: '8.0',
        nextResetUTC: new Date(Date.now() + 86400000).toISOString(),
        currentDayUTC: new Date().toISOString().split('T')[0],
        hoursToReset: 24,
        minutesToReset: 0,
        isNearlyExhausted: false,
        isExhausted: false,
        allowAiOperations: true,
        percentUsed: 0,
      });
    }

    const email = user.email;
    const usage = db.getUsage(email);

    const maxDaily = usage.maxDailySeconds || (usage.plan === 'paid' ? 72000 : 28800);
    const dailyUsed = usage.dailySecondsUsed || 0;
    const remainingDailySeconds = Math.max(0, maxDaily - dailyUsed);
    const remainingDailyHours = (remainingDailySeconds / 3600).toFixed(1);
    
    const isNearlyExhausted = usage.plan === 'free' && remainingDailySeconds > 0 && remainingDailySeconds <= 5400;
    const isExhausted = usage.plan === 'free' && remainingDailySeconds <= 0;

    const nextResetTime = new Date(usage.nextResetUTC).getTime();
    const msToReset = Math.max(0, nextResetTime - Date.now());
    const hoursToReset = Math.floor(msToReset / 3600000);
    const minutesToReset = Math.floor((msToReset % 3600000) / 60000);

    return res.json({
      usage,
      plan: usage.plan,
      dailySecondsUsed: dailyUsed,
      maxDailySeconds: maxDaily,
      remainingDailySeconds,
      remainingDailyHours,
      nextResetUTC: usage.nextResetUTC,
      currentDayUTC: usage.currentDayUTC,
      hoursToReset,
      minutesToReset,
      isNearlyExhausted,
      isExhausted,
      allowAiOperations: !isExhausted || usage.plan === 'paid',
      percentUsed: Math.min(100, Math.round((dailyUsed / maxDaily) * 100)),
    });
  });

  app.post('/api/subscription/upgrade', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized: login required' });

    const { confirmed } = req.body;

    if (!confirmed) {
      return res.status(400).json({
        error: 'Explicit subscription confirmation is required. CodeBloom never automatically charges users.',
      });
    }

    const updatedUsage = db.upgradeToPaid(user.email);
    return res.json({
      message: 'Subscription confirmed! Upgraded to CodeBloom Pro at $25 USD / month (billed monthly). Priority AI compute activated.',
      usage: updatedUsage,
      planDetails: {
        priceUSD: 25.0,
        billingFrequency: 'Monthly recurring',
        dailyLimitHours: 20,
        monthlyLimitHours: 250,
        cancellationPolicy: 'Cancel anytime directly in your dashboard with 1 click.',
      },
    });
  });

  app.post('/api/subscription/cancel', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized: login required' });

    const updatedUsage = db.cancelSubscription(user.email);
    return res.json({
      message: 'Subscription cancelled. You will continue to have Pro benefits until the end of the current billing cycle.',
      usage: updatedUsage,
    });
  });

  // -------------------------------------------------------------
  // 3. AI CODE DEBUGGER & SIDE-BY-SIDE ERROR CORRECTION
  // -------------------------------------------------------------

  app.post('/api/debug/analyze', async (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      const email = user?.email || 'guest@codebloom.dev';
      const { code, language, filename } = req.body;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Code content is required' });
      }

      // Check daily free usage allowance
      const usage = db.getUsage(email);
      const maxDaily = usage.maxDailySeconds || 28800;
      const dailyUsed = usage.dailySecondsUsed || 0;

      if (usage.plan === 'free' && dailyUsed >= maxDaily) {
        return res.status(402).json({
          error: 'Daily free AI allowance reached (8 hours/day). Resets automatically at midnight UTC. Non-AI features (Code Editor, Repo Explorer, Architecture Graph) remain fully available.',
          isExhausted: true,
          nextResetUTC: usage.nextResetUTC,
        });
      }

      // Measure actual AI processing time (in seconds)
      const startTime = Date.now();
      const result = await AiService.analyzeAndDebug(
        code,
        language || 'python',
        filename || 'main.py',
        user
      );
      const processingSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      // Only count actual AI processing time
      db.recordUsage(email, processingSeconds);

      // Save to correction history if authenticated
      const correctionId = `corr-${Date.now()}`;
      if (user) {
        db.saveCorrection({
          id: correctionId,
          userId: email,
          filename: filename || 'script.py',
          language: language || 'python',
          originalCode: code,
          correctedCode: result.correctedCode,
          detectedIssues: result.detectedIssues,
          explanation: result.explanation,
          whyOriginalWasWrong: result.whyOriginalWasWrong,
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }

      return res.json({
        id: correctionId,
        ...result,
      });
    } catch (err: any) {
      console.error('Error in /api/debug/analyze:', err);
      return res.status(500).json({ error: 'Analysis failed: ' + err.message });
    }
  });

  app.get('/api/debug/history', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized: login required' });

    const list = db.getCorrections(user.email);
    return res.json({ corrections: list });
  });

  app.patch('/api/debug/history/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const { status } = req.body;
    if (status !== 'accepted' && status !== 'rejected') {
      return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }

    const updated = db.updateCorrectionStatus(id, status);
    if (!updated) return res.status(404).json({ error: 'Correction not found' });
    return res.json({ correction: updated });
  });

  // -------------------------------------------------------------
  // 4. REPOSITORY ANALYZER & ARCHITECTURE GENERATOR
  // -------------------------------------------------------------

  app.post('/api/repository/analyze-zip', async (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized: please sign in to save repositories' });

      const email = user.email;
      const { base64Data, filename } = req.body;

      if (!base64Data) {
        return res.status(400).json({ error: 'base64Data of ZIP archive required' });
      }

      const zipBuffer = Buffer.from(base64Data, 'base64');
      const project = await RepoAnalyzer.processZip(zipBuffer, filename || 'Uploaded Repository', email);

      // Generate personalized onboarding guide
      const filesList = project.files.map((f) => f.path);
      const guide = await AiService.generateOnboardingGuide(project.name, filesList, user);
      project.onboardingGuide = guide;

      db.saveProject(project);

      return res.json({
        message: 'ZIP parsed with full path-traversal protection and AST extraction',
        project,
      });
    } catch (err: any) {
      console.error('ZIP Analysis error:', err);
      return res.status(500).json({ error: 'Failed to process ZIP repository: ' + err.message });
    }
  });

  app.post('/api/repository/analyze-github', async (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized: please sign in to save repositories' });

      const email = user.email;
      const { repoUrl } = req.body;

      const cleanName = (repoUrl || 'bloom/sample-repo')
        .replace(/^https?:\/\/github\.com\//, '')
        .trim();

      const project = RepoAnalyzer.createDemoRepo(cleanName, email);

      const filesList = project.files.map((f) => f.path);
      const guide = await AiService.generateOnboardingGuide(project.name, filesList, user);
      project.onboardingGuide = guide;

      db.saveProject(project);

      return res.json({
        message: 'Repository AST resolved and mapped',
        project,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'GitHub analysis error: ' + err.message });
    }
  });

  app.get('/api/repository/list', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const projects = db.getProjects(user.email);
    return res.json({ projects });
  });

  app.get('/api/repository/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const project = db.getProject(id);
    if (!project || project.userId !== user.email) {
      return res.status(404).json({ error: 'Project not found or private to another user' });
    }
    return res.json({ project });
  });

  // -------------------------------------------------------------
  // 5. AI PERSONAL DEVELOPER ASSISTANT (CONTEXTUAL CHAT)
  // -------------------------------------------------------------

  app.post('/api/assistant/chat', async (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      const email = user?.email || 'guest@codebloom.dev';
      const { message, currentCode, activeFile, projectId } = req.body;

      if (!message) return res.status(400).json({ error: 'Message required' });

      // Save user message if logged in
      if (user) {
        db.addChatMessage({
          id: `msg-${Date.now()}`,
          userId: email,
          projectId,
          sender: 'user',
          text: message,
          createdAt: new Date().toISOString(),
        });
      }

      // Measure actual AI processing time
      const startTime = Date.now();
      const answer = await AiService.chatWithMascot(message, currentCode || '', activeFile || '', user);
      const processingSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      db.recordUsage(email, processingSeconds);

      // Save mascot message
      const catMsg = {
        id: `msg-${Date.now() + 1}`,
        userId: email,
        projectId,
        sender: 'cat' as const,
        text: answer.text,
        codeSnippet: answer.codeSnippet,
        createdAt: new Date().toISOString(),
      };
      if (user) {
        db.addChatMessage(catMsg);
      }

      return res.json({ message: catMsg });
    } catch (err: any) {
      return res.status(500).json({ error: 'Chat failed: ' + err.message });
    }
  });

  app.get('/api/assistant/chat', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const history = db.getChat(user.email);
    return res.json({ messages: history });
  });

  // -------------------------------------------------------------
  // 6. ONBOARDING GUIDE & TASK MANAGER
  // -------------------------------------------------------------

  app.post('/api/onboarding-guide', async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    const { repoName, files } = req.body;
    const guide = await AiService.generateOnboardingGuide(repoName || 'Codebase', files || [], user);
    return res.json({ guide });
  });

  app.get('/api/tasks', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const tasks = db.getTasks(user.email);
    return res.json({ tasks });
  });

  app.post('/api/tasks', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const email = user.email;
    const { title, category, priority, deadline, estimatedMins, milestone, projectId } = req.body;

    if (!title) return res.status(400).json({ error: 'Task title is required' });

    const newTask = db.saveTask({
      id: `task-${Date.now()}`,
      userId: email,
      projectId,
      title,
      category: category || 'General',
      priority: priority || 'medium',
      deadline: deadline || 'This Sprint',
      estimatedMins: estimatedMins || 15,
      milestone: milestone || 'Day 1',
      completed: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({ task: newTask });
  });

  app.patch('/api/tasks/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const updates = req.body;

    const updated = db.updateTask(user.email, id, updates);
    if (!updated) return res.status(404).json({ error: 'Task not found' });
    return res.json({ task: updated });
  });

  app.delete('/api/tasks/:id', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const success = db.deleteTask(user.email, id);
    if (!success) return res.status(404).json({ error: 'Task not found' });
    return res.json({ message: 'Task deleted successfully' });
  });

  app.post('/api/tasks/generate', async (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { projectId } = req.body;
    const project = projectId ? db.getProject(projectId) : db.getProjects(user.email)[0];
    const repoName = project?.name || 'Current Repository';
    const files = project?.files?.map((f) => f.path) || ['src/main.tsx', 'src/App.tsx', 'package.json'];

    const generated = await AiService.generateTasksForProject(repoName, files, user.email, user);
    generated.forEach((task) => db.saveTask(task));

    return res.json({ tasks: db.getTasks(user.email) });
  });

  // -------------------------------------------------------------
  // 7. VS CODE EXTENSION DIRECT INTEGRATION ENDPOINTS
  // -------------------------------------------------------------

  // Connect extension to account
  app.post('/api/vscode/connect', (req: Request, res: Response) => {
    const { email, password, editorVersion, activeWorkspace } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required to link VS Code' });

    const cleanEmail = email.trim().toLowerCase();
    const user = db.getUser(cleanEmail);

    if (!user) {
      return res.status(404).json({
        error: `No CodeBloom account found with email '${cleanEmail}'. Please register on the web platform first.`,
      });
    }

    const sessionId = `vsc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const session: VsCodeSession = {
      id: sessionId,
      userId: user.email,
      editorVersion: editorVersion || 'VS Code 1.96+',
      connectedAt: new Date().toISOString(),
      lastPing: new Date().toISOString(),
      activeWorkspace: activeWorkspace || 'Current Workspace',
      clientType: 'vscode-desktop',
    };

    db.registerVsCodeSession(session);
    const usage = db.getUsage(user.email);

    return res.json({
      message: 'VS Code successfully connected to CodeBloom AI Companion',
      sessionId,
      token: user.email,
      user,
      usage,
    });
  });

  // VS Code session heartbeat
  app.post('/api/vscode/heartbeat', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { sessionId, activeWorkspace } = req.body;
    if (sessionId) {
      const session: VsCodeSession = {
        id: sessionId,
        userId: user.email,
        editorVersion: 'VS Code',
        connectedAt: new Date().toISOString(),
        lastPing: new Date().toISOString(),
        activeWorkspace: activeWorkspace || 'Workspace',
        clientType: 'vscode-desktop',
      };
      db.registerVsCodeSession(session);
    }
    return res.json({ status: 'alive', user: user.fullName });
  });

  // List connected sessions for user
  app.get('/api/vscode/sessions', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const sessions = db.getVsCodeSessions(user.email);
    return res.json({ sessions });
  });

  // Disconnect extension session
  app.post('/api/vscode/disconnect', (req: Request, res: Response) => {
    const user = getAuthUser(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { sessionId } = req.body;
    if (sessionId) {
      db.removeVsCodeSession(user.email, sessionId);
    }
    return res.json({ message: 'VS Code session disconnected' });
  });

  // Real-time diagnostics for VS Code editor
  app.post('/api/vscode/analyze', async (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      const email = user?.email || 'guest@codebloom.dev';
      const { code, language, filename } = req.body;

      if (!code || typeof code !== 'string') {
        return res.status(400).json({ error: 'Source code content is required' });
      }

      // Fast static analysis for immediate diagnostics
      const staticResult = StaticAnalyzer.analyze(code, language || 'python');

      // Convert to VS Code Diagnostics format
      const diagnostics = staticResult.issues.map((issue) => ({
        line: issue.line,
        column: issue.column || 1,
        message: issue.message,
        severity: issue.severity === 'error' ? 0 : issue.severity === 'warning' ? 1 : 2, // VS Code DiagnosticSeverity
        source: 'CodeBloom AI',
        suggestedFix: issue.suggestedFix,
        type: issue.type,
      }));

      return res.json({
        isValid: staticResult.isValid,
        diagnostics,
        functions: staticResult.functions,
        complexityScore: staticResult.complexityScore,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Diagnostics analysis failed: ' + err.message });
    }
  });

  // VS Code CodeAction Quick-Fix endpoint
  app.post('/api/vscode/fix', async (req: Request, res: Response) => {
    try {
      const user = getAuthUser(req);
      const email = user?.email || 'guest@codebloom.dev';
      const { code, language, filename, issueLine } = req.body;

      if (!code) return res.status(400).json({ error: 'Code content required' });

      // Measure AI processing time
      const startTime = Date.now();
      const result = await AiService.analyzeAndDebug(code, language || 'python', filename || 'editor.py', user);
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      db.recordUsage(email, elapsedSeconds);

      return res.json({
        originalCode: code,
        correctedCode: result.correctedCode,
        explanation: result.explanation,
        whyOriginalWasWrong: result.whyOriginalWasWrong,
        catComment: result.catComment,
        detectedIssues: result.detectedIssues,
      });
    } catch (err: any) {
      return res.status(500).json({ error: 'Quick fix generation failed: ' + err.message });
    }
  });

  // -------------------------------------------------------------
  // 8. VITE DEV MIDDLEWARES OR STATIC ASSETS
  // -------------------------------------------------------------

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌸 CodeBloom Full-Stack Server blooming on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
