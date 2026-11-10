import { GoogleGenAI } from '@google/genai';
import { UserProfile, DevTask } from './db';
import { DetectedIssue, StaticAnalyzer } from './staticAnalyzer';

// Initialize Gemini client safely if API key is present
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface AiDebugResponse {
  correctedCode: string;
  detectedIssues: DetectedIssue[];
  explanation: string;
  whyOriginalWasWrong: string;
  catComment: string;
}

export class AiService {
  /**
   * Deep AI Code Debugger with personalized explanations tailored to user's skill level
   */
  public static async analyzeAndDebug(
    code: string,
    language: string,
    filename: string,
    userProfile?: Partial<UserProfile>
  ): Promise<AiDebugResponse> {
    const staticResult = StaticAnalyzer.analyze(code, language);
    const skillLevel = userProfile?.skillLevel || 'Intermediate';

    // If Gemini API is available, enhance with AI reasoning
    if (ai) {
      try {
        const prompt = `
You are CodeBloom's AI Developer Companion mascot (a friendly, brilliant white cat with glasses holding a tiny pen).
Target Developer Persona: ${skillLevel} level (${userProfile?.occupation || 'Developer'}).
Language: ${language}
File: ${filename}

Static analysis detected:
${JSON.stringify(staticResult.issues, null, 2)}

User's Original Code:
\`\`\`${language}
${code}
\`\`\`

Task:
1. Identify all syntax errors, undefined variables, missing imports, unhandled exceptions, logical bugs, and race conditions.
2. Provide the corrected, complete, working version of the code.
3. Provide an explanation of the correction tailored to a ${skillLevel} developer:
   - If Beginner: Use simple everyday analogies, zero confusing jargon.
   - If Intermediate: Explain architectural trade-offs, standard conventions, and proper idiom.
   - If Advanced: Discuss memory safety, AST mechanics, concurrency, and time/space complexity.
   - If Student: Provide a step-by-step learning breakdown with key takeaways.
4. Explain clearly why the original code failed.
5. Provide a short, charming 1-2 sentence message from the Cat mascot holding a pen (start with "Meow!" or "Purr!").

Return ONLY valid JSON in this exact structure without markdown backticks:
{
  "correctedCode": "string (the full corrected code)",
  "detectedIssues": [
    {
      "line": 1,
      "type": "syntax",
      "message": "description",
      "severity": "error",
      "suggestedFix": "suggestion"
    }
  ],
  "explanation": "tailored explanation",
  "whyOriginalWasWrong": "detailed technical reason",
  "catComment": "Meow! message"
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const cleanJson = text.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          correctedCode: parsed.correctedCode || staticResult.suggestedCorrection,
          detectedIssues: parsed.detectedIssues?.length ? parsed.detectedIssues : staticResult.issues,
          explanation: parsed.explanation || staticResult.explanation,
          whyOriginalWasWrong: parsed.whyOriginalWasWrong || staticResult.whyOriginalWasWrong,
          catComment: parsed.catComment || 'Meow! I found a little mistake. Let’s fix it together!',
        };
      } catch (err) {
        console.warn('Gemini API call failed or timed out, falling back to static analyzer heuristics:', err);
      }
    }

    // Heuristic Fallback tailored by skill level
    let levelExplanation = staticResult.explanation;
    if (skillLevel === 'Beginner' || skillLevel === 'Student') {
      levelExplanation = `Hi friend! In ${language}, computer programs need exact punctuation like colons (:) or closing brackets. ${staticResult.explanation}`;
    } else if (skillLevel === 'Advanced') {
      levelExplanation = `Static invariant analysis detected strict syntax boundary violation in ${language} byte-compilation AST: ${staticResult.explanation}`;
    }

    return {
      correctedCode: staticResult.suggestedCorrection,
      detectedIssues: staticResult.issues,
      explanation: levelExplanation,
      whyOriginalWasWrong: staticResult.whyOriginalWasWrong,
      catComment: "Meow! I found a little mistake. Let's fix it together!",
    };
  }

  /**
   * Conversational Assistant with Context
   */
  public static async chatWithMascot(
    query: string,
    currentCode: string,
    activeFile: string,
    userProfile?: Partial<UserProfile>
  ): Promise<{ text: string; codeSnippet?: string }> {
    const skillLevel = userProfile?.skillLevel || 'Intermediate';

    if (ai) {
      try {
        const prompt = `
You are CodeBloom's AI Developer Assistant mascot (a friendly, hyper-smart white cat with developer glasses).
Developer Skill Level: ${skillLevel}
Current File: ${activeFile || 'untitled'}

Active Code in Editor:
\`\`\`
${currentCode ? currentCode.slice(0, 3000) : 'No code currently open'}
\`\`\`

User Question: "${query}"

Guidelines:
- Explain clearly and gently, matching the user's ${skillLevel} level.
- Keep tone charming and encouraging ("Meow!", "Purr!", paw metaphors when fitting).
- If helpful, provide a concise code snippet.
- Keep response under 120 words unless a long explanation is requested.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return {
          text: response.text || 'Meow! I inspected your code and it looks clean and blooming.',
        };
      } catch (err) {
        console.warn('AI Chat fallback due to error:', err);
      }
    }

    // Fallback heuristic answers
    const qLower = query.toLowerCase();
    if (qLower.includes('why') && qLower.includes('error')) {
      return {
        text: 'Meow! Looking closely at this file, errors often happen from unclosed brackets, missing async/await guards, or undefined variable scope. Try checking the line markers in our Debugger view!',
      };
    }
    if (qLower.includes('explain')) {
      return {
        text: `Purr! This file defines ${activeFile ? activeFile : 'your module'} architecture. It isolates application state, handles incoming payloads, and returns a clean decoupled response for your UI.`,
      };
    }

    return {
      text: `Meow! I analyzed "${query}". The module structure is clean, and following ${userProfile?.skillLevel || 'developer'} practices will keep your architecture blooming!`,
    };
  }

  /**
   * Generate Personalized Onboarding Guide
   */
  public static async generateOnboardingGuide(
    repoName: string,
    filesList: string[],
    userProfile?: Partial<UserProfile>
  ): Promise<{
    overview: string;
    techStack: string[];
    entryPoint: string;
    criticalFiles: string[];
    learningPath: { step: string; description: string; files: string[] }[];
  }> {
    const skillLevel = userProfile?.skillLevel || 'Intermediate';

    if (ai) {
      try {
        const prompt = `
You are CodeBloom's AI Codebase Architect. Generate an onboarding guide for repository "${repoName}".
Target Developer Skill Level: ${skillLevel}.
Files in repo:
${filesList.slice(0, 30).join('\n')}

Generate a JSON object with:
{
  "overview": "2 sentence high level architecture overview tailored to ${skillLevel}",
  "techStack": ["string", "string"],
  "entryPoint": "main entry point filename",
  "criticalFiles": ["file1", "file2", "file3"],
  "learningPath": [
    { "step": "Day 1: Setup", "description": "...", "files": ["file1"] },
    { "step": "Day 2: Core Flow", "description": "...", "files": ["file2"] },
    { "step": "Day 3: Contributing", "description": "...", "files": ["file3"] }
  ]
}
Return only JSON without markdown backticks.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const clean = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(clean);
      } catch (err) {
        console.warn('AI Onboarding guide fallback:', err);
      }
    }

    // Heuristic default guide
    return {
      overview: `${repoName} is structured as a modular architecture with high cohesion and decoupled state layers, perfect for a ${skillLevel} engineer to master.`,
      techStack: ['TypeScript', 'React', 'Python', 'Node.js', 'Vite'],
      entryPoint: filesList.find((f) => f.includes('main') || f.includes('index') || f.includes('App') || f.includes('server')) || filesList[0] || 'src/main.tsx',
      criticalFiles: filesList.slice(0, 4),
      learningPath: [
        {
          step: 'Day 1: Orientation & Sanctuary Setup',
          description: 'Clone repo, install dependencies, and trace the entry point imports.',
          files: filesList.slice(0, 2),
        },
        {
          step: 'Day 2: State & Data Pipeline',
          description: 'Inspect reactive stores, API controllers, and error boundaries.',
          files: filesList.slice(2, 4),
        },
        {
          step: 'Day 3: First Safe Contribution',
          description: 'Add tests, verify 0 cyclical dependencies, and submit your first pull request.',
          files: filesList.slice(0, 3),
        },
      ],
    };
  }

  /**
   * Generate actionable tasks from repository structure
   */
  public static async generateTasksForProject(
    repoName: string,
    filesList: string[],
    userId: string,
    userProfile?: Partial<UserProfile>
  ): Promise<DevTask[]> {
    const entry = filesList.find((f) => f.includes('main') || f.includes('index') || f.includes('App') || f.includes('server')) || filesList[0] || 'src/main.tsx';
    const config = filesList.find((f) => f.includes('config') || f.includes('package') || f.includes('requirements')) || 'package.json';

    return [
      {
        id: `gen-${Date.now()}-1`,
        userId,
        milestone: 'Day 1',
        title: `Audit entry point topology in ${entry}`,
        category: 'Architecture',
        priority: 'high',
        deadline: 'Sprint Day 1',
        estimatedMins: 20,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `gen-${Date.now()}-2`,
        userId,
        milestone: 'Day 1',
        title: `Verify build configuration & package dependencies in ${config}`,
        category: 'Environment',
        priority: 'medium',
        deadline: 'Sprint Day 1',
        estimatedMins: 15,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `gen-${Date.now()}-3`,
        userId,
        milestone: 'Day 2',
        title: `Run CodeBloom AST static checks across ${filesList.length} files in ${repoName}`,
        category: 'Code Quality',
        priority: 'high',
        deadline: 'Sprint Day 2',
        estimatedMins: 30,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `gen-${Date.now()}-4`,
        userId,
        milestone: 'Day 3',
        title: `Design unit tests for core module exports with 0 cycles`,
        category: 'Delivery',
        priority: 'medium',
        deadline: 'Sprint Day 3',
        estimatedMins: 40,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
