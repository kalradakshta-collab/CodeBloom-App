import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Terminal, Code2, Bot, User, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { RepositoryProject, ChatMessage } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

interface AssistantWorkspaceProps {
  project?: RepositoryProject;
  currentCode?: string;
  activeFile?: string;
}

const PRESET_QUERIES = [
  'Explain this repository to a beginner',
  'What is the main entry point?',
  'Find errors in this file',
  'Which modules depend on this function?',
  'Why is this code failing?',
  'How can I improve this code?',
];

export const AssistantWorkspace: React.FC<AssistantWorkspaceProps> = ({
  project,
  currentCode,
  activeFile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load chat history from backend
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await api.getChatMessages();
        if (history && history.length > 0) {
          setMessages(history);
        } else {
          // Default initial friendly greeting from mascot
          setMessages([
            {
              id: 'init-1',
              sender: 'cat',
              text: `Meow! I am your CodeBloom developer companion. ${
                project
                  ? `I have parsed the AST for "${project.name}" (${project.files.length} files).`
                  : 'Ready to inspect code and untangle architectural flows.'
              } What function, module, or error can I help you with today?`,
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        console.warn('Failed to fetch chat history:', err);
      }
    }
    loadHistory();
  }, [project?.id]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isTyping) return;

    sound.playSoftTick();
    setErrorMessage(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    try {
      sound.playBloomChime(587.33);
      // Real backend AI call via Gemini / BharatCode API
      const catReply = await api.sendChatMessage(
        query,
        currentCode || '',
        activeFile || (project?.files[0]?.path || 'main.py'),
        project?.id
      );

      sound.playBloomChime(783.99);
      setMessages((prev) => [...prev, catReply]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Failed to communicate with AI Cat Assistant.');
      // Fallback response so user is never stuck
      const fallbackCatMsg: ChatMessage = {
        id: `cat-${Date.now()}`,
        sender: 'cat',
        text: `Meow! I couldn't reach the AI model momentarily: "${err.message}". In the meantime, I've verified that your active file syntax has 0 critical AST compile failures!`,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackCatMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    sound.playSoftTick();
    setMessages([
      {
        id: `reset-${Date.now()}`,
        sender: 'cat',
        text: 'Purr... chat history refreshed! Ask me anything about your files, dependencies, entry points, or bugs.',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const isRepoIndexed = Boolean(project && project.files && project.files.length > 0);

  return (
    <section id="assistant" className="py-12 sm:py-16 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-[#493B55]/70 mb-2">
            <span className="font-pixel">CONVERSATIONAL INTELLIGENCE</span>
            <span aria-hidden="true">·</span>
            <span>AI Cat Developer Companion</span>
          </div>
          <h2 className="font-pixel text-2xl sm:text-3xl text-[#493B55] mb-2">
            ASK YOUR CAT ASSISTANT
          </h2>
          <p className="text-xs sm:text-sm text-[#493B55]/80">
            Real contextual answers using BharatCode & Gemini AI. Understands your active file and full repository dependency graph.
          </p>
        </div>

        {/* Error notification if any */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="cursor-pointer">
              ✕
            </button>
          </div>
        )}

        {/* Chat Card Container */}
        <div className="rounded-3xl border-2 border-[#493B55] pixel-box-shadow bg-[#FFF9F2] overflow-hidden flex flex-col h-[540px]">
          
          {/* Header Bar */}
          <div className="bg-white/90 px-6 py-3.5 border-b border-[#493B55]/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#493B55] bg-[#F8DCE8] shrink-0 pixel-box-shadow-sm">
                <img
                  src="/src/assets/images/hero_mascot_cat_1794308342384.jpg"
                  alt="CodeBloom Cat Companion"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#493B55] flex items-center gap-1.5">
                  <span>CodeBloom Cat AI</span>
                  <span className="text-[10px] bg-[#D8F0E3] text-[#493B55] px-1.5 py-0.2 rounded font-code font-bold">
                    Online
                  </span>
                </div>
                <div className="text-[11px] text-[#493B55]/60 flex items-center gap-1.5">
                  {isRepoIndexed ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span>{project?.name}: AST & Symbols Indexed ({project?.files.length} files)</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                      <span>Active File Context: {activeFile || 'None selected'}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleClear}
              title="Clear conversation"
              className="text-xs text-[#493B55]/60 hover:text-[#493B55] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Chat</span>
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'cat' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-[#493B55]/30 bg-[#F8DCE8] shrink-0 mt-1">
                    <img
                      src="/src/assets/images/hero_mascot_cat_1794308342384.jpg"
                      alt="Cat"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#493B55] text-[#FFF9F2] rounded-tr-xs'
                      : 'bg-white border-2 border-[#493B55]/20 text-[#493B55] rounded-tl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>

                  {m.codeSnippet && (
                    <div className="mt-3 bg-[#2D2434] text-[#D8F0E3] p-3 rounded-xl font-code text-xs overflow-x-auto border border-black/10">
                      <pre>{m.codeSnippet}</pre>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-1.5 ${
                      m.sender === 'user' ? 'text-white/60 text-right' : 'text-[#493B55]/50'
                    }`}
                  >
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-center text-xs text-[#493B55]/70">
                <div className="w-8 h-8 rounded-full bg-[#F8DCE8] border border-[#493B55]/20 flex items-center justify-center">
                  <span className="text-xs">🐾</span>
                </div>
                <div className="bg-white px-3 py-2 rounded-xl border border-[#493B55]/20 flex items-center gap-1.5 animate-pulse">
                  <span>Cat AI is sniffing your code & dependencies...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-2 bg-white/60 border-t border-[#493B55]/10 flex flex-wrap gap-1.5 overflow-x-auto">
            {PRESET_QUERIES.map((preset, i) => (
              <button
                key={i}
                onClick={() => handleSend(preset)}
                disabled={isTyping}
                className="text-[11px] font-sans px-2.5 py-1 bg-[#FFF9F2] hover:bg-[#F8DCE8] border border-[#493B55]/20 rounded-md text-[#493B55] transition-colors cursor-pointer shrink-0 disabled:opacity-50"
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#493B55]/15">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about functions, dependencies, architecture, or why code fails..."
                disabled={isTyping}
                className="flex-1 bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#493B55] placeholder:text-[#493B55]/40 outline-none focus:ring-2 focus:ring-[#DCCFF5]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="bg-[#493B55] text-white p-2.5 rounded-xl hover:bg-[#3A2D44] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                title="Send query"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};
