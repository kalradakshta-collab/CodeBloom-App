import React, { useState, useRef } from 'react';
import {
  FolderGit2,
  Upload,
  FileCode,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Sparkles,
  GitBranch,
  ShieldCheck,
  Search,
  ArrowRight,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { RepositoryProject, AnalyzedFile } from '../types';
import { sound } from '../utils/sound';

interface RepoExplorerViewProps {
  projects: RepositoryProject[];
  onUploadZip: (base64: string, name: string) => void;
  onAnalyzeGitHub: (url: string) => void;
  onSelectProjectForArchitecture: (proj: RepositoryProject) => void;
  onOpenFileInEditor: (file: AnalyzedFile) => void;
}

export const RepoExplorerView: React.FC<RepoExplorerViewProps> = ({
  projects,
  onUploadZip,
  onAnalyzeGitHub,
  onSelectProjectForArchitecture,
  onOpenFileInEditor,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [githubUrlInput, setGithubUrlInput] = useState<string>('');
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [fileSearch, setFileSearch] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeProject = projects.find((p) => p.id === selectedProjectId) || projects[0];
  const activeFile = activeProject?.files.find((f) => f.path === selectedFilePath) || activeProject?.files[0];

  const handleZipFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playBloomChime(587.33);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      onUploadZip(base64, file.name.replace('.zip', ''));
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleGitHubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrlInput.trim()) return;

    sound.playBloomChime(659.25);
    setIsProcessing(true);
    onAnalyzeGitHub(githubUrlInput.trim());
    setGithubUrlInput('');
    setTimeout(() => setIsProcessing(false), 800);
  };

  const filteredFiles = activeProject?.files.filter((f) =>
    f.path.toLowerCase().includes(fileSearch.toLowerCase())
  ) || [];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Controls: Import GitHub or Upload ZIP */}
      <div className="bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#493B55]/70 mb-1">
              <span className="font-pixel">REPOSITORY IMPORT HUB</span>
              <span aria-hidden="true">·</span>
              <span>Hermetic Static Parsing</span>
            </div>
            <h2 className="font-pixel text-xl sm:text-2xl text-[#493B55]">
              CONNECT & EXPLORE CODEBASES
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* GitHub input */}
            <form onSubmit={handleGitHubSubmit} className="flex items-center gap-2">
              <input
                type="text"
                value={githubUrlInput}
                onChange={(e) => setGithubUrlInput(e.target.value)}
                placeholder="github.com/owner/repository"
                className="bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3 py-2 text-xs text-[#493B55] font-code outline-none w-56 sm:w-64"
              />
              <button
                type="submit"
                disabled={isProcessing}
                className="bg-[#493B55] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer hover:bg-[#3A2D44]"
              >
                Connect
              </button>
            </form>

            {/* ZIP upload button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleZipFile}
              accept=".zip"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#F8DCE8] hover:bg-[#FFE4D2] text-[#493B55] px-3.5 py-2 rounded-xl text-xs font-bold border border-[#493B55] pixel-box-shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload ZIP Archive</span>
            </button>
          </div>

        </div>

        {/* Project Selector Pills */}
        {projects.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#493B55]/10 overflow-x-auto text-xs">
            <span className="text-[#493B55]/60 font-semibold mr-1 shrink-0">Projects:</span>
            {projects.map((proj) => (
              <button
                key={proj.id}
                onClick={() => {
                  sound.playSoftTick();
                  setSelectedProjectId(proj.id);
                  setSelectedFilePath(proj.files[0]?.path || '');
                }}
                className={`px-3 py-1.5 rounded-xl font-code transition-all cursor-pointer shrink-0 ${
                  activeProject?.id === proj.id
                    ? 'bg-[#493B55] text-white font-bold pixel-box-shadow-sm'
                    : 'bg-[#FFF9F2] text-[#493B55] hover:bg-white border border-[#493B55]/20'
                }`}
              >
                {proj.name} ({proj.files.length} files)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Explorer Workspace */}
      {activeProject ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Repository Tree Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-5 h-[620px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#493B55]/10 mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#493B55]" />
                  <span className="font-bold text-xs text-[#493B55] truncate max-w-[180px]">
                    {activeProject.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playBloomChime(783.99);
                    onSelectProjectForArchitecture(activeProject);
                  }}
                  className="text-[11px] font-bold text-[#493B55] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Map</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Search file */}
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#493B55]/40" />
                <input
                  type="text"
                  value={fileSearch}
                  onChange={(e) => setFileSearch(e.target.value)}
                  placeholder="Filter files..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#FFF9F2] border border-[#493B55]/20 rounded-xl text-xs font-code outline-none text-[#493B55]"
                />
              </div>

              {/* Files List */}
              <div className="space-y-1 overflow-y-auto max-h-[420px] pr-1">
                {filteredFiles.map((file) => {
                  const isSelected = activeFile?.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => {
                        sound.playSoftTick();
                        setSelectedFilePath(file.path);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-code flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#DCCFF5] text-[#493B55] font-bold border border-[#493B55]'
                          : 'text-[#493B55]/85 hover:bg-[#FFF9F2]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileCode className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{file.path}</span>
                      </div>
                      <span className="text-[10px] text-[#493B55]/60 tabular-nums">
                        {file.lines}l
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom summary */}
            <div className="pt-3 border-t border-[#493B55]/10 text-[11px] text-[#493B55]/70 flex items-center justify-between">
              <span>{activeProject.files.length} Files</span>
              <span>·</span>
              <span>{activeProject.dependencies.length} Packages</span>
              <span>·</span>
              <span className="font-bold text-emerald-600">0 Cycles</span>
            </div>
          </div>

          {/* Right Column: File Content & AST Inspector */}
          <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 h-[620px] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#493B55]/15 mb-4">
                <div className="flex items-center gap-2 font-code">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A8E6CF]" />
                  <span className="font-bold text-xs sm:text-sm text-[#493B55]">
                    {activeFile?.path || 'Select a file'}
                  </span>
                  <span className="text-[11px] bg-[#FFF9F2] text-[#493B55] px-2 py-0.5 rounded border border-[#493B55]/20">
                    {activeFile?.language}
                  </span>
                </div>

                {activeFile && (
                  <button
                    onClick={() => {
                      sound.playBloomChime(659.25);
                      onOpenFileInEditor(activeFile);
                    }}
                    className="bg-[#493B55] text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#3A2D44] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Open in Editor</span>
                  </button>
                )}
              </div>

              {/* Code Preview */}
              {activeFile ? (
                <div className="rounded-2xl bg-[#251E2B] text-[#FFF9F2] p-4 font-code text-xs leading-6 overflow-auto h-[400px]">
                  <pre>{activeFile.content}</pre>
                </div>
              ) : (
                <div className="py-20 text-center text-xs text-[#493B55]/60">
                  Select a file from the repository sidebar to view contents and AST metrics.
                </div>
              )}
            </div>

            {/* Extracted Symbols Pill Bar */}
            {activeFile && (
              <div className="pt-3 border-t border-[#493B55]/10 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[#493B55]">Extracted Symbols:</span>
                {activeFile.functions.length > 0 ? (
                  activeFile.functions.map((fn, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#FFF9F2] border border-[#493B55]/20 font-code text-[11px] text-[#493B55]"
                    >
                      {fn}()
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#493B55]/60 italic">No top-level functions defined</span>
                )}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-[#493B55] p-12 text-center space-y-3">
          <FolderGit2 className="w-12 h-12 mx-auto text-[#493B55]/50" />
          <h3 className="font-pixel text-lg text-[#493B55]">NO REPOSITORIES CONNECTED</h3>
          <p className="text-xs text-[#493B55]/70 max-w-md mx-auto">
            Upload a ZIP file or connect a public GitHub repo to explore architecture and onboarding guides.
          </p>
        </div>
      )}

    </div>
  );
};
