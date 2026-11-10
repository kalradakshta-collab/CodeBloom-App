import React, { useState, useRef, useEffect } from 'react';
import {
  Code2,
  Play,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  Bug,
  FileCode,
  Copy,
  Check,
  AlertCircle,
  Save,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { sound } from '../utils/sound';
import { StaticAnalyzer, DetectedIssue } from '../../server/staticAnalyzer';

interface CodeEditorViewProps {
  onAnalyzeCode: (code: string, language: string, filename: string) => void;
  initialCode?: string;
  initialLanguage?: string;
  initialFilename?: string;
}

const SAMPLE_CODES: Record<string, { code: string; filename: string }> = {
  python: {
    filename: 'calculator.py',
    code: `# Python Sample with deliberate syntax and logic bugs
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
`,
  },
  javascript: {
    filename: 'userFetcher.js',
    code: `// JavaScript Sample with async race condition and null pointer
import { useState, useEffect } from 'react';

export function useUserProfile(userId) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ⚠️ Bug: Race condition - no AbortController cleanup
    fetch('/api/users/' + userId)
      .then(res => res.json())
      .then(data => {
        // ⚠️ Bug: Chained property access without optional chaining
        console.log(data.profile.preferences.theme);
        setUser(data);
      });
  }, [userId]);

  return user;
}
`,
  },
  typescript: {
    filename: 'astParser.ts',
    code: `// TypeScript Sample with unhandled promise and missing return type
export function parseTokens(source: string): string[] {
  const tokens: string[] = [];
  const lines = source.split('\\n');
  
  lines.forEach((line) => {
    // Unsafe null access
    const firstChar = line[0]?.toUpperCase() || '';
    tokens.push(firstChar);
  });

  return tokens;
}
`,
  },
};

export const CodeEditorView: React.FC<CodeEditorViewProps> = ({
  onAnalyzeCode,
  initialCode,
  initialLanguage = 'python',
  initialFilename = 'main.py',
}) => {
  const [language, setLanguage] = useState(initialLanguage);
  const [filename, setFilename] = useState(initialFilename);
  const [code, setCode] = useState(initialCode || SAMPLE_CODES[initialLanguage]?.code || SAMPLE_CODES.python.code);
  const [copied, setCopied] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [detectedIssues, setDetectedIssues] = useState<DetectedIssue[]>([]);
  const [showSyntaxHighlight, setShowSyntaxHighlight] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const lines = code.split('\n');

  // Live lightweight static analysis as user types
  useEffect(() => {
    try {
      const result = StaticAnalyzer.analyze(code, language);
      setDetectedIssues(result.issues);
    } catch {
      // ignore transient parse states
    }
  }, [code, language]);

  // Handle Tab key for proper indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleLanguageChange = (newLang: string) => {
    sound.playSoftTick();
    setLanguage(newLang);
    if (SAMPLE_CODES[newLang]) {
      setCode(SAMPLE_CODES[newLang].code);
      setFilename(SAMPLE_CODES[newLang].filename);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playBloomChime(659.25);
    setFilename(file.name);

    if (file.name.endsWith('.py')) setLanguage('python');
    else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) setLanguage('typescript');
    else if (file.name.endsWith('.js') || file.name.endsWith('.jsx')) setLanguage('javascript');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setCode(content);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    sound.playBloomChime(783.99);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    sound.playSoftTick();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    sound.playBloomChime(659.25);
    localStorage.setItem(`bloom_saved_${filename}`, code);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleReset = () => {
    sound.playSoftTick();
    if (SAMPLE_CODES[language]) {
      setCode(SAMPLE_CODES[language].code);
    } else {
      setCode('');
    }
  };

  const handleSendToDebugger = () => {
    sound.playBloomChime(783.99);
    onAnalyzeCode(code, language, filename);
  };

  const syntaxErrorsCount = detectedIssues.filter((i) => i.severity === 'error').length;
  const warningsCount = detectedIssues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* Editor Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-5">
        
        {/* Left: Language & Filename */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#DCCFF5] border-2 border-[#493B55] flex items-center justify-center pixel-box-shadow-sm shrink-0">
            <Code2 className="w-5 h-5 text-[#493B55]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="font-code font-bold text-xs sm:text-sm text-[#493B55] bg-[#FFF9F2] px-2 py-0.5 rounded border border-[#493B55]/20 outline-none w-44"
              />
              <span className="text-[10px] text-[#493B55]/60 font-code">({lines.length} lines)</span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-[#493B55]/60">Language:</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-[#FFF9F2] border border-[#493B55]/20 rounded-md px-2 py-0.5 text-xs text-[#493B55] font-semibold outline-none cursor-pointer"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
              </select>

              {syntaxErrorsCount > 0 && (
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold font-code">
                  {syntaxErrorsCount} syntax error{syntaxErrorsCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".py,.js,.jsx,.ts,.tsx,.json,.txt"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl bg-[#FFF9F2] hover:bg-white border border-[#493B55]/20 text-xs font-semibold text-[#493B55] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Upload code file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload File</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-[#FFF9F2] hover:bg-white border border-[#493B55]/20 text-xs font-semibold text-[#493B55] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-[#FFF9F2] hover:bg-white border border-[#493B55]/20 text-xs font-semibold text-[#493B55] flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleSave}
            className="p-2 rounded-xl bg-[#FFF9F2] hover:bg-white border border-[#493B55]/20 text-xs font-semibold text-[#493B55] transition-colors cursor-pointer flex items-center gap-1"
            title="Save work"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedNotification ? 'Saved! ✨' : 'Save'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-[#FFF9F2] hover:bg-white border border-[#493B55]/20 text-xs text-[#493B55] transition-colors cursor-pointer"
            title="Reset to sample"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Primary Action: Send to AI Debugger */}
          <button
            onClick={handleSendToDebugger}
            className="bg-[#493B55] hover:bg-[#382D42] text-[#FFF9F2] px-4 py-2 rounded-xl font-bold text-xs sm:text-sm border-2 border-[#493B55] pixel-box-shadow-sm flex items-center gap-2 cursor-pointer transition-all"
          >
            <Bug className="w-4 h-4 text-[#F8DCE8]" />
            <span>Analyze in Debugger</span>
          </button>

        </div>

      </div>

      {/* Real-time Inline Syntax Notification Bar */}
      {detectedIssues.length > 0 && (
        <div className="p-3 bg-white rounded-2xl border-2 border-rose-300 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold text-rose-900 truncate">
              {detectedIssues[0].message} (Line {detectedIssues[0].line})
            </span>
          </div>
          <button
            onClick={handleSendToDebugger}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer"
          >
            Fix in Debugger →
          </button>
        </div>
      )}

      {/* Editor Body */}
      <div className="rounded-3xl border-2 border-[#493B55] pixel-box-shadow bg-[#251E2B] text-[#FFF9F2] overflow-hidden flex flex-col h-[560px]">
        
        {/* Editor Titlebar */}
        <div className="bg-[#1C1622] px-4 py-2.5 border-b border-[#493B55]/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF8080]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FFD580]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#A8E6CF]" />
            </div>
            <span className="font-code text-[#F8DCE8]">{filename}</span>
            <span className="text-white/40">·</span>
            <span className="text-[11px] text-white/50">{language}</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#F8DCE8]/70">
            <span>Tab: 2 spaces</span>
            <span>·</span>
            <span>UTF-8</span>
          </div>
        </div>

        {/* Textarea with Line Numbers & Error Markers */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Line Numbers & Error Markers Column */}
          <div className="w-14 bg-[#1C1622]/80 border-r border-white/10 select-none py-3 pr-2 font-code text-xs text-white/30 space-y-0.5 overflow-hidden">
            {lines.map((_, idx) => {
              const lineNum = idx + 1;
              const lineError = detectedIssues.find((i) => i.line === lineNum);

              return (
                <div key={idx} className="h-6 leading-6 flex items-center justify-between">
                  <span className="w-3 text-center">
                    {lineError ? (
                      <span className="text-rose-400 font-bold" title={lineError.message}>
                        ●
                      </span>
                    ) : null}
                  </span>
                  <span className={lineError ? 'text-rose-300 font-bold' : ''}>
                    {lineNum}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interactive Code Textarea */}
          <div className="flex-1 relative overflow-auto">
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste or write your source code here..."
              spellCheck={false}
              className="w-full h-full bg-transparent text-[#FFF9F2] font-code text-xs sm:text-sm leading-6 p-3 outline-none resize-none selection:bg-[#F8DCE8] selection:text-[#493B55] whitespace-pre"
              style={{
                tabSize: 2,
              }}
            />
          </div>

        </div>

        {/* Footer Status Bar */}
        <div className="bg-[#1C1622] px-4 py-1.5 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60 font-code">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${syntaxErrorsCount > 0 ? 'bg-rose-400' : 'bg-emerald-400'}`} />
            <span>
              {syntaxErrorsCount > 0
                ? `${syntaxErrorsCount} issue(s) detected by AST parser`
                : 'Syntax Clean · Ready for Analysis'}
            </span>
          </div>
          <div>
            <span>Press "Analyze in Debugger" to open Side-by-Side review</span>
          </div>
        </div>

      </div>

    </div>
  );
};
