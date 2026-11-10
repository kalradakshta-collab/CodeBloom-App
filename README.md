# 🌸 CodeBloom — AI-Powered Codebase Architecture & Onboarding Visualizer

> **Understand. Visualize. Debug. Bloom.**  
> The premium full-stack developer companion combining deep AST static analysis with an enchanting pastel aesthetic inspired by Nomi AI and Petalyx.

---

## 🌟 Architectural Overview

CodeBloom transforms foreign and complex software repositories into crystal-clear visual knowledge. It combines:
1. **Nomi AI Persona**: Oversized pixel typography, cute white cat mascot holding a tiny pen, floating contextual speech bubbles, and friendly developer guidance.
2. **Petalyx Serenity**: Dreamy pastel gradients (lavender `#DCCFF5`, baby pink `#F8DCE8`, mint `#D8F0E3`, soft peach `#FFE4D2`, sky blue `#DCEBFA`, cream `#FFF9F2`, dark plum `#493B55`), gentle falling sakura petals canvas, and calm visual focus.
3. **Hermetic Static & AST Analysis**: Deterministic tokenization, import resolution, and cycle detection combined with Google Gemini 2.5 Flash / BharatCode reasoning.

---

## 🚀 Features & Modules

### 1. User Registration & Personalization (9 Factors)
- Complete account creation, login, email verification, password reset, and profile management.
- Collects:
  1. Full Name
  2. Email Address
  3. Current Occupation
  4. Professional Position
  5. Work Experience
  6. Programming Experience
  7. Preferred Programming Languages
  8. Skill Level (*Beginner, Intermediate, Advanced, Student*)
  9. Purpose of using CodeBloom
- **Dynamic Personalization**:
  - *Beginner / Student*: Simple everyday analogies, zero confusing jargon.
  - *Intermediate*: Technical best practices, architectural trade-offs.
  - *Advanced*: Memory safety, concurrency, AST mechanics, and complexity analysis.

### 2. Complete Interactive Code Editor
- Monaco-style IDE with line numbers, indentation, syntax highlighting, and live error markers.
- Python, JavaScript, and TypeScript support.
- File upload (`.py`, `.js`, `.ts`, `.json`), work saving, and verified file download.
- 1-click **"Analyze in Debugger"** handoff.

### 3. Signature Side-by-Side AI Code Debugger
- **Left Column**: Original user code with line numbers, highlighted error markers, and click-to-explain.
- **Right Column**: Suggested corrected code with line additions, removals, and invariant verification.
- **Cat Mascot with Pen**: *"Meow! I found a little mistake. Let's fix it together!"*
- **Action Controls**:
  - View Explanation
  - Apply Correction
  - Accept All Corrections
  - Reject Correction
  - Download Corrected Code
  - Compare Changes (Split vs. Unified)
- **Zero-Overwrite Guarantee**: Never silently modifies user code without explicit user consent.

### 4. Smart Repository Analyzer & Explorer
- Upload ZIP archives with **strict Zip-Slip path-traversal protection**.
- Connect public GitHub repository URLs (`github.com/owner/repo`).
- Analyzes folder trees, files, functions, classes, modules, and dependencies.
- Collapsible interactive file explorer with instant symbol breakdown.

### 5. Interactive Architecture Visualizer
- Topological node-link diagram reflecting actual repository code.
- Nodes: *Main Application (Lavender)*, *Components (Baby Pink)*, *Functions (Soft Peach)*, *Modules (Mint Green)*, *Dependencies (Sky Blue)*.
- Features: Draggable nodes, zoom controls, dependency highlighting, node inspector with cyclomatic complexity, and JSON diagram export.

### 6. AI Personal Developer Assistant
- Context-aware conversational Cat mascot understanding the active code and active repository.
- Natural typing responses, code suggestions, and charming encouragement.

### 7. Personalized Onboarding Guide
- Auto-generates customized Day 1, Day 2, and Day 3 learning paths.
- Lists application entry points, tech stacks, and critical files to read first.
- Exportable as formatted Markdown (`.md`).

### 8. Developer Task Manager
- Breaks repository onboarding into bite-sized milestones.
- Interactive progress bar and completion tracking with soft sound chimes.

### 9. Transparent Pricing & Server-Side Usage Accounting
- **Free Tier**: 8 hours (28,800 seconds) of included AI companion usage.
- **Pro Tier ($25/mo)**: Unlimited AI companion hours and high-density multi-repo processing.
- Server-authoritative tracking (not a frontend timer).
- Explicit user opt-in; no automatic credit card charges.

### 10. Progressive Web App (PWA)
- Installable on desktop and mobile (`manifest.json`, `icon.svg`).
- Service Worker (`sw.js`) with offline caching.

---

## 🛠️ Project Structure

```
├── .data/
│   └── db.json                  # Persistent JSON database (Users, Usage, Projects, Corrections, Chats)
├── public/
│   ├── icon.svg                 # PWA custom blossom & cat icon
│   ├── manifest.json            # Web App Manifest
│   └── sw.js                    # Service Worker with offline caching
├── server/
│   ├── db.ts                    # Database abstraction layer & seeding
│   ├── staticAnalyzer.ts        # Language-specific static parsers (Python, JS/TS)
│   ├── aiService.ts             # Gemini 2.5 Flash / BharatCode integration & level calibration
│   └── repoAnalyzer.ts          # Safe ZIP processing (anti-path-traversal) & AST generator
├── src/
│   ├── assets/images/           # Generated mascot and landscape art
│   ├── components/
│   │   ├── Navbar.tsx           # Floating top bar with sound & blossom controls
│   │   ├── Sidebar.tsx          # 11-item platform navigation sidebar
│   │   ├── DashboardView.tsx    # Platform overview with stats & quick actions
│   │   ├── CodeEditorView.tsx   # Monaco-style code editor
│   │   ├── SideBySideDebuggerView.tsx # Signature 2-column error correction
│   │   ├── RepoExplorerView.tsx # Repository file tree & ZIP/GitHub importer
│   │   ├── InteractiveArchitectureView.tsx # Draggable node-link graph
│   │   ├── OnboardingGuideView.tsx # Tailored Day 1-3 guides & MD export
│   │   ├── HowToUseView.tsx     # 10-step interactive tutorial & FAQ
│   │   ├── PricingView.tsx      # Server usage meter & $25 upgrade modal
│   │   ├── SettingsView.tsx     # 9-field profile editor & account controls
│   │   ├── GuidedTourModal.tsx  # Multi-step platform tour
│   │   ├── HeroSection.tsx      # Landing page hero
│   │   ├── FeaturesSection.tsx  # 6 feature bento cards
│   │   ├── SignatureDebugger.tsx# Landing preview debugger
│   │   ├── ArchitectureVisualizer.tsx # Landing preview visualizer
│   │   ├── PetalCanvas.tsx      # Interactive falling sakura petals
│   │   └── Footer.tsx           # Quiet, refined footer
│   ├── services/
│   │   └── api.ts               # Client REST API fetcher
│   ├── types/
│   │   └── index.ts             # Shared TypeScript schemas
│   ├── utils/
│   │   └── sound.ts             # Web Audio API pentatonic synthesizer
│   ├── App.tsx                  # Root switcher (Platform vs. Landing)
│   ├── main.tsx                 # Client entrypoint
│   └── index.css                # Tailwind CSS v4 design tokens
├── server.ts                    # Express + Vite middleware full-stack server
├── package.json                 # Dependencies & scripts
└── tsconfig.json                # TypeScript compiler config
```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register user with all 9 personalization fields |
| `POST` | `/api/auth/login` | Authenticate user session |
| `GET` | `/api/auth/me` | Fetch active user profile and usage record |
| `POST` | `/api/auth/profile` | Update user personalization settings |
| `DELETE` | `/api/auth/delete-account` | Permanently delete user data |
| `GET` | `/api/usage` | Server-side accounting of remaining free seconds |
| `POST` | `/api/usage/tick` | Record active user interaction seconds |
| `POST` | `/api/subscription/upgrade` | Upgrade to CodeBloom Pro ($25 plan) |
| `POST` | `/api/subscription/cancel` | Cancel subscription |
| `POST` | `/api/debug/analyze` | Run static analysis + AI debug on code snippet |
| `GET` | `/api/debug/history` | List user correction history |
| `PATCH` | `/api/debug/history/:id` | Accept or reject suggested correction |
| `POST` | `/api/repository/analyze-zip` | Safely unpack & analyze uploaded ZIP codebase |
| `POST` | `/api/repository/analyze-github` | Parse GitHub repository structure & AST |
| `GET` | `/api/repository/list` | List analyzed repositories |
| `POST` | `/api/assistant/chat` | Contextual question answering with Cat mascot |
| `POST` | `/api/onboarding-guide` | Generate tailored onboarding roadmap |

---

## 🧪 Testing Instructions

1. **Test User Registration & Personalization**:
   - Navigate to **Settings** in the sidebar.
   - Change the **Skill Level** between *Beginner*, *Intermediate*, and *Advanced*.
   - Submit a code snippet in the Debugger and note how the Cat mascot's explanation automatically adapts its tone and technical depth.
2. **Test Side-by-Side Debugging**:
   - Go to **AI Debugger** or **Code Editor**.
   - Click **Analyze in Debugger**.
   - Notice the red error lines on the left and the green proposed fixes on the right.
   - Click **Accept All Corrections** to apply fixes or **Download Corrected** to export the file.
3. **Test Repository Upload**:
   - Go to **My Repositories**.
   - Upload any `.zip` codebase or connect `facebook/react`.
   - Inspect the generated folder tree and jump to the **Architecture Map** to drag nodes around.
4. **Test Server Usage Meter**:
   - Open **Pricing & Usage**.
   - Inspect the remaining hours countdown and test the $25 Pro upgrade button.
5. **Test Platform Tour**:
   - Click **Take a Tour** on the Dashboard or bottom sidebar.

---

## 📦 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack server (runs on port 3000)
npm run dev

# 3. Build for production
npm run build
npm start
```
