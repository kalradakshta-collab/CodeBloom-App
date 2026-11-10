import JSZip from 'jszip';
import path from 'path';
import { AnalyzedFile, RepositoryProject } from './db';
import { StaticAnalyzer } from './staticAnalyzer';

export class RepoAnalyzer {
  /**
   * Safely process a ZIP archive buffer preventing path traversal (Zip Slip vulnerability protection)
   */
  public static async processZip(
    buffer: Buffer,
    repoName: string,
    userId: string
  ): Promise<RepositoryProject> {
    const zip = await JSZip.loadAsync(buffer);
    const analyzedFiles: AnalyzedFile[] = [];
    const dependenciesSet = new Map<string, string>();

    // Process files with strict path traversal checks
    const fileEntries = Object.entries(zip.files);
    const maxFiles = 150; // reasonable limit for web explorer
    let count = 0;

    for (const [relativePath, zipEntry] of fileEntries) {
      if (zipEntry.dir) continue;
      if (count >= maxFiles) break;

      // Zip-slip defense: normalize and ensure path does not escape
      const cleanPath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
      if (cleanPath.startsWith('..') || path.isAbsolute(cleanPath)) {
        continue; // skip dangerous paths
      }

      // Skip heavy binary files or huge node_modules
      if (
        cleanPath.includes('node_modules') ||
        cleanPath.includes('.git') ||
        cleanPath.endsWith('.jpg') ||
        cleanPath.endsWith('.png') ||
        cleanPath.endsWith('.lock') ||
        cleanPath.endsWith('.ico')
      ) {
        continue;
      }

      const ext = path.extname(cleanPath).toLowerCase();
      const isCode = ['.ts', '.tsx', '.js', '.jsx', '.py', '.json', '.html', '.css', '.md'].includes(ext);
      if (!isCode) continue;

      const content = await zipEntry.async('string');
      const lines = content.split('\n').length;

      let language = 'plaintext';
      if (['.ts', '.tsx'].includes(ext)) language = 'typescript';
      else if (['.js', '.jsx'].includes(ext)) language = 'javascript';
      else if (ext === '.py') language = 'python';
      else if (ext === '.json') language = 'json';

      // Parse package.json dependencies if present
      if (cleanPath.endsWith('package.json')) {
        try {
          const pkg = JSON.parse(content);
          if (pkg.dependencies) {
            Object.entries(pkg.dependencies).forEach(([k, v]) => dependenciesSet.set(k, String(v)));
          }
          if (pkg.devDependencies) {
            Object.entries(pkg.devDependencies).forEach(([k, v]) => dependenciesSet.set(k, String(v)));
          }
        } catch {
          // ignore invalid json
        }
      }

      // Static analysis
      const analysis = StaticAnalyzer.analyze(content, language);

      analyzedFiles.push({
        path: cleanPath,
        language,
        content: content.slice(0, 15000), // safety limit
        lines,
        errorsCount: analysis.issues.filter((i) => i.severity === 'error').length,
        functions: analysis.functions,
        imports: analysis.imports,
      });

      count++;
    }

    // Generate architecture nodes and connections
    const architectureNodes = this.buildArchitectureNodes(analyzedFiles);

    const dependencies = Array.from(dependenciesSet.entries()).map(([name, version]) => ({
      name,
      version,
      type: 'npm',
    }));

    const project: RepositoryProject = {
      id: `proj-${Date.now()}`,
      userId,
      name: repoName || 'Uploaded Codebase',
      source: 'zip',
      createdAt: new Date().toISOString(),
      files: analyzedFiles,
      dependencies,
      complexityScore: Math.min(95, Math.floor(analyzedFiles.reduce((acc, f) => acc + f.lines, 0) / 40) + 10),
      architectureNodes,
    };

    return project;
  }

  /**
   * Parse simulated or fetched GitHub repository structure
   */
  public static createDemoRepo(repoName: string, userId: string): RepositoryProject {
    const isPython = repoName.toLowerCase().includes('py') || repoName.toLowerCase().includes('fastapi');

    const files: AnalyzedFile[] = isPython
      ? [
          {
            path: 'main.py',
            language: 'python',
            content: `from fastapi import FastAPI, HTTPException\nfrom pydantic import BaseModel\n\napp = FastAPI(title="BloomAPI")\n\n@app.get("/")\ndef read_root():\n    return {"status": "blooming", "version": "1.0.0"}\n\n@app.post("/items")\ndef create_item(item: dict):\n    if not item:\n        raise HTTPException(status_code=400, detail="Item empty")\n    return {"saved": True, "data": item}\n`,
            lines: 14,
            errorsCount: 0,
            functions: ['read_root', 'create_item'],
            imports: ['from fastapi import FastAPI, HTTPException', 'from pydantic import BaseModel'],
          },
          {
            path: 'services/auth.py',
            language: 'python',
            content: `import jwt\nimport datetime\n\nSECRET = "bloom_super_secret_key"\n\ndef generate_token(user_id: str) -> str:\n    payload = {\n        "sub": user_id,\n        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)\n    }\n    return jwt.encode(payload, SECRET, algorithm="HS256")\n`,
            lines: 11,
            errorsCount: 0,
            functions: ['generate_token'],
            imports: ['import jwt', 'import datetime'],
          },
          {
            path: 'models/user.py',
            language: 'python',
            content: `from pydantic import BaseModel\n\nclass User(BaseModel):\n    id: str\n    email: str\n    is_active: bool = True\n`,
            lines: 6,
            errorsCount: 0,
            functions: ['User'],
            imports: ['from pydantic import BaseModel'],
          },
        ]
      : [
          {
            path: 'src/main.tsx',
            language: 'typescript',
            content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<App />);\n`,
            lines: 7,
            errorsCount: 0,
            functions: ['render'],
            imports: ["import React from 'react'", "import App from './App'"],
          },
          {
            path: 'src/App.tsx',
            language: 'typescript',
            content: `import React, { useState, useEffect } from 'react';\nimport { Header } from './components/Header';\nimport { GraphView } from './components/GraphView';\nimport { fetchProjectData } from './services/api';\n\nexport default function App() {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    const ctrl = new AbortController();\n    fetchProjectData(ctrl.signal).then(setData);\n    return () => ctrl.abort();\n  }, []);\n  return <div className="app"><Header /><GraphView data={data} /></div>;\n}\n`,
            lines: 14,
            errorsCount: 0,
            functions: ['App'],
            imports: ["import { Header } from './components/Header'", "import { GraphView } from './components/GraphView'"],
          },
          {
            path: 'src/services/api.ts',
            language: 'typescript',
            content: `export async function fetchProjectData(signal?: AbortSignal) {\n  const res = await fetch('/api/project', { signal });\n  if (!res.ok) throw new Error('Failed to load project');\n  return res.json();\n}\n`,
            lines: 6,
            errorsCount: 0,
            functions: ['fetchProjectData'],
            imports: [],
          },
          {
            path: 'package.json',
            language: 'json',
            content: `{\n  "name": "bloom-app",\n  "dependencies": {\n    "react": "^19.0.0",\n    "react-dom": "^19.0.0",\n    "lucide-react": "^0.546.0"\n  }\n}\n`,
            lines: 8,
            errorsCount: 0,
            functions: [],
            imports: [],
          },
        ];

    const dependencies = isPython
      ? [
          { name: 'fastapi', version: '^0.110.0', type: 'pip' },
          { name: 'pydantic', version: '^2.6.0', type: 'pip' },
          { name: 'pyjwt', version: '^2.8.0', type: 'pip' },
        ]
      : [
          { name: 'react', version: '^19.0.0', type: 'npm' },
          { name: 'react-dom', version: '^19.0.0', type: 'npm' },
          { name: 'lucide-react', version: '^0.546.0', type: 'npm' },
        ];

    const architectureNodes = this.buildArchitectureNodes(files);

    return {
      id: `proj-${Date.now()}`,
      userId,
      name: repoName,
      source: 'github',
      repoUrl: `https://github.com/${repoName}`,
      createdAt: new Date().toISOString(),
      files,
      dependencies,
      complexityScore: 42,
      architectureNodes,
    };
  }

  private static buildArchitectureNodes(files: AnalyzedFile[]) {
    return files.map((file, idx) => {
      let type = 'module';
      if (file.path.includes('component') || file.path.includes('Header') || file.path.includes('View')) {
        type = 'component';
      } else if (file.path.includes('main') || file.path.includes('App') || file.path.includes('index')) {
        type = 'app';
      } else if (file.path.includes('service') || file.path.includes('api')) {
        type = 'function';
      } else if (file.path.endsWith('.json')) {
        type = 'dependency';
      }

      // Connect to other files based on import hints
      const connections: string[] = [];
      files.forEach((other, oIdx) => {
        if (oIdx !== idx) {
          const otherBase = path.basename(other.path, path.extname(other.path));
          if (file.content.includes(otherBase)) {
            connections.push(other.path);
          }
        }
      });

      return {
        id: file.path,
        label: path.basename(file.path),
        type,
        connections,
        lines: file.lines,
      };
    });
  }
}
