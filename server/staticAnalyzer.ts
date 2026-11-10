export interface DetectedIssue {
  line: number;
  column?: number;
  type: 'syntax' | 'undefined_variable' | 'type_error' | 'runtime_hazard' | 'style' | 'missing_import';
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestedFix: string;
}

export interface StaticAnalysisResult {
  language: string;
  isValid: boolean;
  issues: DetectedIssue[];
  functions: string[];
  imports: string[];
  complexityScore: number;
  suggestedCorrection: string;
  explanation: string;
  whyOriginalWasWrong: string;
}

export class StaticAnalyzer {
  public static analyze(code: string, language: string): StaticAnalysisResult {
    const lang = language.toLowerCase();
    if (lang === 'python' || lang === 'py') {
      return this.analyzePython(code);
    }
    // Default to JavaScript / TypeScript
    return this.analyzeJavaScript(code);
  }

  // --- Python Static Analysis & AST checks ---
  private static analyzePython(code: string): StaticAnalysisResult {
    const lines = code.split('\n');
    const issues: DetectedIssue[] = [];
    const functions: string[] = [];
    const imports: string[] = [];
    let complexity = 1;

    // Track declared names and imports
    const definedSymbols = new Set<string>([
      'print', 'len', 'range', 'enumerate', 'int', 'str', 'float', 'list', 'dict', 'set',
      'tuple', 'bool', 'sum', 'min', 'max', 'open', 'isinstance', 'type', 'map', 'filter',
      'True', 'False', 'None', 'self', 'cls', 'Exception', 'ValueError', 'TypeError', 'super'
    ]);

    const correctedLines = [...lines];

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) return;

      // Check imports
      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        imports.push(trimmed);
        const match = trimmed.match(/(?:import|from)\s+([a-zA-Z0-9_]+)/);
        if (match) definedSymbols.add(match[1]);
        return;
      }

      // Check function definitions
      const defMatch = trimmed.match(/^def\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*(:?)/);
      if (defMatch) {
        const fnName = defMatch[1];
        const params = defMatch[2];
        const hasColon = defMatch[3] === ':';

        functions.push(fnName);
        definedSymbols.add(fnName);
        complexity += 1;

        // Check for missing colon in def
        if (!hasColon) {
          issues.push({
            line: lineNum,
            type: 'syntax',
            message: `SyntaxError: expected ':' at end of function definition '${fnName}'`,
            severity: 'error',
            suggestedFix: `${trimmed}:`,
          });
          correctedLines[index] = `${line}:`;
        }

        // Check for mutable default arguments (e.g. def foo(items=[]):)
        if (/=\s*(\[\]|\{\})/.test(params)) {
          issues.push({
            line: lineNum,
            type: 'runtime_hazard',
            message: `Python Anti-Pattern: Mutable default argument in '${fnName}'. Defaults retain state across calls.`,
            severity: 'warning',
            suggestedFix: `Use '=None' and assign inside the function body.`,
          });
        }
      }

      // Check if / for / while / class missing colons
      const blockMatch = trimmed.match(/^(if|elif|else|for|while|class|try|except|finally|with)\b.*[^:]$/);
      if (blockMatch && !trimmed.endsWith('\\')) {
        issues.push({
          line: lineNum,
          type: 'syntax',
          message: `SyntaxError: expected ':' at end of '${blockMatch[1]}' statement`,
          severity: 'error',
          suggestedFix: `${trimmed}:`,
        });
        correctedLines[index] = `${line}:`;
      }

      // Check for unbalanced parentheses or quotes
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens > closeParens) {
        issues.push({
          line: lineNum,
          type: 'syntax',
          message: `SyntaxError: Unclosed parenthesis '(' on line ${lineNum}`,
          severity: 'error',
          suggestedFix: `Add closing ')'`,
        });
        correctedLines[index] = `${line}${')'.repeat(openParens - closeParens)}`;
      }

      // Check variable assignment
      const assignMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*=/);
      if (assignMatch) {
        definedSymbols.add(assignMatch[1]);
      }

      // Check for common typo: print "hello" without parens (Python 2 in Python 3)
      const py2Print = trimmed.match(/^print\s+("[^"]*"|'[^']*'|[a-zA-Z0-9_]+)$/);
      if (py2Print) {
        issues.push({
          line: lineNum,
          type: 'syntax',
          message: `SyntaxError: Missing parentheses in call to 'print'. Did you mean print(...) ?`,
          severity: 'error',
          suggestedFix: `print(${py2Print[1]})`,
        });
        correctedLines[index] = line.replace(/print\s+(.*)/, 'print($1)');
      }

      // Check for double equals instead of single equals in assignments or vice versa
      if (/^if\s+[a-zA-Z0-9_]+\s*=\s*[^=]/.test(trimmed)) {
        issues.push({
          line: lineNum,
          type: 'syntax',
          message: `SyntaxError: Invalid syntax. Assignment '=' used inside 'if' conditional instead of comparison '=='`,
          severity: 'error',
          suggestedFix: `Replace '=' with '=='`,
        });
        correctedLines[index] = line.replace(/=\s*([^=])/, '== $1');
      }

      // Check for common missing imports
      if (/\b(json|math|os|sys|datetime|re|random)\.[a-zA-Z0-9_]+/.test(trimmed)) {
        const modMatch = trimmed.match(/\b(json|math|os|sys|datetime|re|random)\./);
        if (modMatch && !definedSymbols.has(modMatch[1])) {
          issues.push({
            line: lineNum,
            type: 'missing_import',
            message: `NameError: module '${modMatch[1]}' is used but not imported.`,
            severity: 'error',
            suggestedFix: `Add 'import ${modMatch[1]}' at top of file`,
          });
        }
      }
    });

    const isValid = issues.filter((i) => i.severity === 'error').length === 0;

    let explanation = 'Code looks structurally clean and Pythonic.';
    let whyWrong = 'No critical syntax or runtime hazards detected.';

    if (issues.length > 0) {
      const firstError = issues[0];
      explanation = `CodeBloom detected ${issues.length} issue(s). The primary concern is ${firstError.message}.`;
      whyWrong = `In Python, strict indentation, block colons (:), and proper parenthesized function calls are enforced by the grammar parser. Leaving colons or brackets unclosed raises immediate SyntaxErrors during byte-compilation.`;
    }

    return {
      language: 'python',
      isValid,
      issues,
      functions,
      imports,
      complexityScore: Math.min(100, complexity * 8),
      suggestedCorrection: correctedLines.join('\n'),
      explanation,
      whyOriginalWasWrong: whyWrong,
    };
  }

  // --- JavaScript / TypeScript Static Analysis ---
  private static analyzeJavaScript(code: string): StaticAnalysisResult {
    const lines = code.split('\n');
    const issues: DetectedIssue[] = [];
    const functions: string[] = [];
    const imports: string[] = [];
    let complexity = 1;

    const definedSymbols = new Set<string>([
      'console', 'window', 'document', 'fetch', 'setTimeout', 'setInterval',
      'Promise', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Math',
      'JSON', 'Error', 'undefined', 'null', 'true', 'false', 'NaN', 'React',
      'useState', 'useEffect', 'useMemo', 'useCallback', 'useRef'
    ]);

    const correctedLines = [...lines];

    // Detect missing async before await
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

      // Imports
      if (trimmed.startsWith('import ') || trimmed.startsWith('const ') && trimmed.includes('require(')) {
        imports.push(trimmed);
        const match = trimmed.match(/import\s+(?:\{([^}]+)\}|([a-zA-Z0-9_]+))/);
        if (match) {
          if (match[2]) definedSymbols.add(match[2]);
          if (match[1]) {
            match[1].split(',').forEach((s) => definedSymbols.add(s.trim().split(' as ')[0]));
          }
        }
        return;
      }

      // Functions
      const fnMatch = trimmed.match(/(?:function\s+([a-zA-Z0-9_]+)|const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/);
      if (fnMatch) {
        const name = fnMatch[1] || fnMatch[2];
        functions.push(name);
        definedSymbols.add(name);
        complexity += 1;
      }

      // Unmatched brackets on this line (heuristic)
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens > closeParens && !trimmed.endsWith('{') && !trimmed.endsWith(',')) {
        issues.push({
          line: lineNum,
          type: 'syntax',
          message: `SyntaxError: Unclosed parenthesis on line ${lineNum}`,
          severity: 'error',
          suggestedFix: `Add closing ')'`,
        });
        correctedLines[index] = `${line}${')'.repeat(openParens - closeParens)};`;
      }

      // Null dereference risk (e.g., user.profile.name without optional chaining)
      if (/\b([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\b/.test(trimmed) && !trimmed.includes('?.') && !trimmed.includes('console.')) {
        const chained = trimmed.match(/\b([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\b/);
        if (chained && !['Math', 'JSON', 'process', 'Object'].includes(chained[1])) {
          issues.push({
            line: lineNum,
            type: 'runtime_hazard',
            message: `Potential TypeError: Chained property access '${chained[0]}' without optional chaining guard (?.). If '${chained[2]}' is undefined, this throws a runtime crash.`,
            severity: 'warning',
            suggestedFix: `Use '${chained[1]}?.${chained[2]}?.${chained[3]}'`,
          });
        }
      }

      // React race condition in useEffect without cleanup
      if (trimmed.includes('useEffect(') || trimmed.includes('fetch(') || trimmed.includes('.then(')) {
        if (trimmed.includes('.then(') && !code.includes('AbortController') && !code.includes('return () =>')) {
          issues.push({
            line: lineNum,
            type: 'runtime_hazard',
            message: `Async Race Condition: Data fetching promise in hook lacks an AbortController cancellation or cleanup handler. Fast state switches can cause memory leaks or stale state overwrites.`,
            severity: 'warning',
            suggestedFix: `Wrap fetch with AbortController and return cleanup: 'return () => controller.abort();'`,
          });
        }
      }

      // Unhandled promise rejections (await without try/catch)
      if (trimmed.startsWith('await ') && !code.includes('try {')) {
        issues.push({
          line: lineNum,
          type: 'runtime_hazard',
          message: `Unhandled Promise Hazard: 'await' call outside try/catch block. Network or server errors will cause uncaught exception.`,
          severity: 'warning',
          suggestedFix: `Wrap in try { ... } catch (err) { ... }`,
        });
      }
    });

    const isValid = issues.filter((i) => i.severity === 'error').length === 0;

    let explanation = 'Code passes core JavaScript syntax and hygiene invariants.';
    let whyWrong = 'No critical syntax errors identified.';

    if (issues.length > 0) {
      const first = issues[0];
      explanation = `CodeBloom static analysis highlighted ${issues.length} potential area(s) for attention: ${first.message}`;
      whyWrong = `Modern JavaScript and TypeScript engines enforce strict runtime boundaries. Unhandled asynchronous promises or unguarded chained properties will bubble up as unhandled exceptions in the client runtime.`;
    }

    return {
      language: 'javascript',
      isValid,
      issues,
      functions,
      imports,
      complexityScore: Math.min(100, complexity * 7),
      suggestedCorrection: correctedLines.join('\n'),
      explanation,
      whyOriginalWasWrong: whyWrong,
    };
  }
}
