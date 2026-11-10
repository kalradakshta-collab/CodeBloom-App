import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trophy,
  Sparkles,
  Clock,
  Calendar,
  Trash2,
  Edit3,
  Check,
  X,
  AlertCircle,
  Flag,
  Wand2,
} from 'lucide-react';
import { DevTask } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/sound';

export const TaskManagerSection: React.FC = () => {
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'All' | 'Day 1' | 'Day 2' | 'Day 3' | 'Custom'>('All');
  
  // New task form state
  const [newTaskInput, setNewTaskInput] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState('Core Knowledge');
  const [newDeadline, setNewDeadline] = useState('Today');
  const [showAdvancedAdd, setShowAdvancedAdd] = useState(false);

  // Edit task modal/state
  const [editingTask, setEditingTask] = useState<DevTask | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editDeadline, setEditDeadline] = useState('');

  // Notification / toast
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Fetch tasks on mount
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const data = await api.getTasks();
        setTasks(data);
      } catch (err) {
        console.warn('Failed to load tasks, using local defaults:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, []);

  const toggleTask = async (id: string, currentCompleted: boolean) => {
    sound.playSoftTick();
    const next = !currentCompleted;
    if (next) sound.playBloomChime(783.99);

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: next } : t)));

    try {
      await api.updateTask(id, { completed: next });
    } catch {
      showToast('Failed to update task status');
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;

    sound.playBloomChime(587.33);
    const milestone = activeTab === 'All' ? 'Day 1' : activeTab;

    try {
      const created = await api.createTask({
        title: newTaskInput.trim(),
        category: newCategory,
        priority: newPriority,
        deadline: newDeadline,
        estimatedMins: 20,
        milestone,
      });

      setTasks((prev) => [created, ...prev]);
      setNewTaskInput('');
      setShowAdvancedAdd(false);
      showToast('Task added to sprint!');
    } catch {
      showToast('Failed to save task');
    }
  };

  const handleDeleteTask = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSoftTick();
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await api.deleteTask(id);
      showToast('Task deleted');
    } catch {
      showToast('Failed to delete task');
    }
  };

  const handleStartEdit = (task: DevTask, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playSoftTick();
    setEditingTask(task);
    setEditTitle(task.title);
    setEditPriority(task.priority);
    setEditDeadline(task.deadline || 'This Sprint');
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editTitle.trim()) return;
    sound.playBloomChime(659.25);

    try {
      const updated = await api.updateTask(editingTask.id, {
        title: editTitle.trim(),
        priority: editPriority,
        deadline: editDeadline,
      });

      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingTask(null);
      showToast('Task updated successfully');
    } catch {
      showToast('Failed to update task');
    }
  };

  const handleGenerateTasksFromRepo = async () => {
    sound.playBloomChime(783.99);
    sound.playSuccessHarp();
    showToast('Sniffing codebase AST to generate onboarding tasks...');
    try {
      const generated = await api.generateTasksFromRepo();
      setTasks(generated);
      showToast('✨ Repository onboarding tasks generated and synchronized!');
    } catch {
      showToast('Failed to generate tasks');
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => activeTab === 'All' || t.milestone === activeTab);

  const getPriorityBadge = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <span className="bg-rose-100 text-rose-700 border border-rose-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">High</span>;
      case 'medium':
        return <span className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Medium</span>;
      case 'low':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Low</span>;
    }
  };

  return (
    <section className="py-12 sm:py-16 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider text-[#493B55]/70 mb-2">
            <span className="font-pixel">ONBOARDING VELOCITY</span>
            <span aria-hidden="true">·</span>
            <span>Developer Task Manager</span>
          </div>
          <h2 className="font-pixel text-2xl sm:text-3xl text-[#493B55] mb-2">
            GUIDED CODEBASE ONBOARDING
          </h2>
          <p className="text-xs sm:text-sm text-[#493B55]/80">
            Never wonder what to tackle next. CodeBloom automatically maps tasks from Day 1 to your first shipped contribution.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div className="p-3 bg-[#493B55] text-[#FFF9F2] rounded-2xl text-xs font-semibold border-2 border-[#F8DCE8] pixel-box-shadow flex items-center justify-between animate-fadeIn max-w-md mx-auto">
            <span>{toast}</span>
            <button onClick={() => setToast(null)} className="cursor-pointer ml-2">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Task Manager Card Container */}
        <div className="bg-white/95 rounded-3xl border-2 border-[#493B55] pixel-box-shadow p-6 sm:p-8">
          
          {/* Top Progress & Stats Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#493B55]/15 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-[#493B55]" />
                <span className="font-pixel text-lg font-bold text-[#493B55]">
                  Sprint Progress
                </span>
                <span className="text-xs font-code font-bold bg-[#D8F0E3] text-[#493B55] px-2 py-0.5 rounded">
                  {completedCount} of {tasks.length} Done ({progressPct}%)
                </span>
              </div>
              <p className="text-xs text-[#493B55]/70 font-sans">
                Tasks persist in your database and adapt as you explore repositories.
              </p>
            </div>

            {/* Visual Progress Bar & Auto-Generate button */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={handleGenerateTasksFromRepo}
                className="bg-[#DCCFF5] hover:bg-[#C9B6EB] text-[#493B55] px-3 py-1.5 rounded-xl border border-[#493B55] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                title="Generate suggested tasks from repository analysis"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Generate from Repo</span>
              </button>

              <div className="w-full sm:w-36">
                <div className="w-full bg-[#FFF9F2] rounded-full h-3 border border-[#493B55]/20 overflow-hidden">
                  <div
                    className="bg-[#493B55] h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Milestone Tabs & Add Task */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FFF9F2] rounded-xl border border-[#493B55]/20 overflow-x-auto">
              {(['All', 'Day 1', 'Day 2', 'Day 3', 'Custom'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    sound.playSoftTick();
                    setActiveTab(tab);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-[#493B55] text-white pixel-box-shadow-sm'
                      : 'text-[#493B55]/70 hover:text-[#493B55]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Quick Add Form */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdvancedAdd(!showAdvancedAdd)}
                className="text-xs text-[#493B55]/70 hover:text-[#493B55] px-2 py-1 rounded border border-[#493B55]/20 cursor-pointer"
              >
                {showAdvancedAdd ? 'Simple Add' : '+ Options'}
              </button>

              <form onSubmit={handleAddTask} className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  placeholder="Add custom task..."
                  className="bg-[#FFF9F2] border border-[#493B55]/25 rounded-xl px-3 py-1.5 text-xs text-[#493B55] placeholder:text-[#493B55]/40 outline-none w-full sm:w-56"
                />
                <button
                  type="submit"
                  className="bg-[#493B55] hover:bg-[#382D42] text-[#FFF9F2] border border-[#493B55] p-2 rounded-xl transition-colors cursor-pointer shrink-0"
                  title="Add task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>

          {/* Advanced Add Bar */}
          {showAdvancedAdd && (
            <div className="p-3 bg-[#FFF9F2] rounded-2xl border border-[#493B55]/20 mb-4 flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-[#493B55]/70">Priority:</span>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="bg-white border border-[#493B55]/20 rounded-md px-2 py-1 font-semibold"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#493B55]/70">Category:</span>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="bg-white border border-[#493B55]/20 rounded-md px-2 py-1 font-semibold"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Core Knowledge">Core Knowledge</option>
                  <option value="Code Quality">Code Quality</option>
                  <option value="Auth & Data">Auth & Data</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[#493B55]/70">Deadline:</span>
                <input
                  type="text"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  placeholder="e.g. Sprint Day 2"
                  className="bg-white border border-[#493B55]/20 rounded-md px-2 py-1 outline-none text-xs w-32"
                />
              </div>
            </div>
          )}

          {/* Tasks List */}
          {loading ? (
            <div className="py-12 text-center text-xs text-[#493B55]/60 animate-pulse">
              Loading tasks from database...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#493B55]/60">
              No tasks found in this view. Click "+ Add custom task" or "Auto-Generate from Repo".
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id, task.completed)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    task.completed
                      ? 'bg-[#FFF9F2]/60 border-[#493B55]/10 opacity-70'
                      : 'bg-white hover:bg-[#FFF9F2] border-[#493B55]/20 hover:border-[#493B55]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-[#493B55] shrink-0">
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-[#493B55]/40" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div
                        className={`text-xs sm:text-sm font-medium truncate ${
                          task.completed ? 'line-through text-[#493B55]/50' : 'text-[#493B55]'
                        }`}
                      >
                        {task.title}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#493B55]/60 mt-1">
                        <span>{task.milestone}</span>
                        <span aria-hidden="true">·</span>
                        <span>{task.category}</span>
                        {task.deadline && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="flex items-center gap-1 text-[#493B55]">
                              <Calendar className="w-3 h-3" />
                              {task.deadline}
                            </span>
                          </>
                        )}
                        <span aria-hidden="true">·</span>
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-[11px] font-code text-[#493B55]/60 mr-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.estimatedMins}m</span>
                    </div>

                    <button
                      onClick={(e) => handleStartEdit(task, e)}
                      className="p-1.5 rounded-lg hover:bg-[#FFF9F2] text-[#493B55]/60 hover:text-[#493B55] cursor-pointer"
                      title="Edit task"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteTask(task.id, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500/70 hover:text-rose-600 cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Edit Task Modal */}
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#493B55]/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-[#FFF9F2] rounded-3xl border-2 border-[#493B55] pixel-box-shadow w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#493B55]/15">
                <span className="font-pixel text-sm font-bold text-[#493B55]">EDIT TASK</span>
                <button
                  onClick={() => setEditingTask(null)}
                  className="p-1 rounded-lg border border-[#493B55]/20 hover:bg-[#F8DCE8] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#493B55] block mb-1">Task Title:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-[#493B55]/20 rounded-xl px-3 py-2 text-xs text-[#493B55] outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#493B55] block mb-1">Priority:</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="w-full bg-white border border-[#493B55]/20 rounded-xl px-3 py-2 text-xs text-[#493B55] outline-none font-medium"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#493B55] block mb-1">Deadline:</label>
                  <input
                    type="text"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    placeholder="e.g. Day 2 Sprint"
                    className="w-full bg-white border border-[#493B55]/20 rounded-xl px-3 py-2 text-xs text-[#493B55] outline-none font-medium"
                  >
                  </input>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#493B55]/10">
                <button
                  onClick={() => setEditingTask(null)}
                  className="px-3 py-2 rounded-xl border border-[#493B55]/20 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-[#493B55] text-white rounded-xl text-xs font-bold hover:bg-[#382D42] cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
