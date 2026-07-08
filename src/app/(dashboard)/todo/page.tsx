'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ListChecks,
  Plus,
  Search,
  Trash2,
  Edit2,
  Check,
  X,
  GripVertical,
  Sparkles,
  Calendar,
  ChevronRight,
  ClipboardList,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { useTodos } from '@/hooks/useTodos';
import { cn } from '@/lib/utils';
import TiltCard from '@/components/shared/TiltCard';

type FilterType = 'all' | 'active' | 'completed';

export default function TodoPage() {
  const {
    todoLists,
    isLoading,
    createList,
    updateList,
    deleteList,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    reorderTasks,
  } = useTodos();

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // New List Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  // Inline editing task state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState('');

  // New Task Input state
  const [newTaskText, setNewTaskText] = useState('');

  // Automatically select the first list when lists are loaded
  useEffect(() => {
    if (todoLists.length > 0 && !selectedListId) {
      setSelectedListId(todoLists[0].id);
    }
  }, [todoLists, selectedListId]);

  // Selected List Object
  const selectedList = useMemo(() => {
    return todoLists.find((list) => list.id === selectedListId) || null;
  }, [todoLists, selectedListId]);

  // Search filter lists
  const filteredLists = useMemo(() => {
    return todoLists.filter(
      (list) =>
        list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (list.description &&
          list.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [todoLists, searchQuery]);

  // Filter tasks in detail panel
  const filteredTasks = useMemo(() => {
    if (!selectedList) return [];
    const tasks = selectedList.tasks || [];
    if (activeFilter === 'active') return tasks.filter((t) => !t.completed);
    if (activeFilter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [selectedList, activeFilter]);

  // Calculations for selected list progress
  const listStats = useMemo(() => {
    if (!selectedList || !selectedList.tasks || selectedList.tasks.length === 0) {
      return { total: 0, completed: 0, percentage: 0 };
    }
    const total = selectedList.tasks.length;
    const completed = selectedList.tasks.filter((t) => t.completed).length;
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, percentage };
  }, [selectedList]);

  // Handles adding new list
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    const id = await createList(newListTitle, newListDesc, 'custom', []);
    if (id) {
      setSelectedListId(id);
      setNewListTitle('');
      setNewListDesc('');
      setIsModalOpen(false);
    }
  };

  // Handles manual task creation inside selected list
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListId || !newTaskText.trim()) return;

    await addTask(selectedListId, newTaskText.trim());
    setNewTaskText('');
  };

  // Trigger inline task editing
  const startEditing = (taskId: string, currentText: string) => {
    setEditingTaskId(taskId);
    setEditingTaskText(currentText);
  };

  // Save edited task
  const saveTaskEdit = async (taskId: string) => {
    if (!selectedListId || !editingTaskText.trim()) return;
    await updateTask(selectedListId, taskId, { text: editingTaskText.trim() });
    setEditingTaskId(null);
  };

  // Handle Drag Reordering (Optimistic local update then save)
  const handleReorder = async (reorderedTasks: typeof filteredTasks) => {
    if (!selectedListId || !selectedList) return;
    
    // Merge filtered tasks back to maintain relative ordering of other non-visible tasks if filtered
    let fullTasks = [...selectedList.tasks];
    
    if (activeFilter === 'all') {
      fullTasks = reorderedTasks;
    } else {
      // If a filter is applied, map ordered items back matching their orders
      let filterIdx = 0;
      fullTasks = fullTasks.map((task) => {
        const isMatch = activeFilter === 'active' ? !task.completed : task.completed;
        if (isMatch && filterIdx < reorderedTasks.length) {
          return reorderedTasks[filterIdx++];
        }
        return task;
      });
    }

    await reorderTasks(selectedListId, fullTasks);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4">
      {/* ── Heading Row ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
            <ListChecks className="w-5 h-5 text-[#3B82F6]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">AI & Custom Workspaces</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Instant roadmap trackers, checklist pipelines, and automated TODO milestones
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setIsModalOpen(true)}
          className={cn(
            'py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2',
            'bg-[#3B82F6] text-white',
            'hover:brightness-110 shadow-[var(--shadow-md)] transition-all duration-[350ms] ease-glass'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          New List
        </motion.button>
      </motion.div>

      {/* ── Main Workspace Split-Screen ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start h-[calc(100vh-180px)]">
        
        {/* ============================================================ */}
        {/*  LEFT PANEL: TODO LISTS OVERVIEW                           */}
        {/* ============================================================ */}
        <div className="w-full lg:w-[35%] flex flex-col h-full glass rounded-2xl overflow-hidden">
          
          {/* Search bar */}
          <div className="p-4 border-b border-[var(--glass-border)] bg-[var(--glass-surface)]">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search plan roadmaps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 outline-none transition-all duration-[350ms] ease-glass focus:border-[var(--glass-border-accent)] focus:shadow-[var(--shadow-sm)]"
              />
            </div>
          </div>

          {/* List content lists */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full py-10 space-y-2">
                <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold animate-pulse">
                  Syncing Workspaces...
                </span>
              </div>
            ) : filteredLists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
                <ClipboardList className="w-10 h-10 text-[var(--text-secondary)]/60 animate-bounce" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-[var(--text-primary)]">No checklists found</p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed max-w-[200px]">
                    Create a custom list or scan a notice to generate an AI plan roadmap.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="py-2 px-4 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] text-xs font-medium hover:bg-[#3B82F6]/20 transition-all duration-300"
                >
                  Create Custom Checklist
                </button>
              </div>
            ) : (
              filteredLists.map((list) => {
                const totalTasks = list.tasks?.length || 0;
                const completedTasks = list.tasks?.filter((t) => t.completed).length || 0;
                const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
                const isSelected = list.id === selectedListId;

                return (
                  <motion.div
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={cn(
                      'relative cursor-pointer p-4 rounded-xl border transition-all duration-300 select-none group',
                      isSelected
                        ? 'bg-[var(--accent-blue)]/10 border-[var(--glass-border-accent)] shadow-[var(--shadow-xs)]'
                        : 'bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:bg-[var(--glass-surface-hover)] hover:border-[var(--glass-border-accent)]'
                    )}
                    whileHover={{ scale: 1.01 }}
                  >
                    {/* List Type Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border',
                          list.type === 'ai-plan'
                            ? 'bg-purple-500/15 border-purple-500/25 text-purple-400'
                            : 'bg-blue-500/15 border-blue-500/25 text-blue-400'
                        )}
                      >
                        {list.type === 'ai-plan' && <Sparkles className="w-2.5 h-2.5" />}
                        {list.type === 'ai-plan' ? 'AI Study Plan' : 'Custom'}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (list.id === selectedListId) setSelectedListId(null);
                          deleteList(list.id);
                        }}
                        className="text-[var(--text-secondary)]/60 hover:text-rose-400 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-[#0B0F19] transition-all duration-200"
                        title="Delete list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-white truncate">
                      {list.title}
                    </h4>

                    {list.description && (
                      <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-1">
                        {list.description}
                      </p>
                    )}

                    {/* Progress tracking */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-semibold">
                        <span>
                          {completedTasks} / {totalTasks} Tasks
                        </span>
                        <span>{progress}%</span>
                      </div>
                      
                      {/* Bar indicator */}
                      <div className="w-full h-1 bg-[#1F2937] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#3B82F6] to-indigo-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/*  RIGHT PANEL: SELECTED TODO LIST DETAIL VIEW               */}
        {/* ============================================================ */}
        <div className="flex-1 w-full lg:w-[65%] h-full flex flex-col glass rounded-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {!selectedList ? (
              <motion.div
                key="no-selected"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4"
              >
                <ClipboardList className="w-12 h-12 text-[#1F2937] animate-pulse" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">No Checklist Selected</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Select a checklist from the left sidebar panel to begin your work.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={selectedList.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Header widget */}
                <div className="p-5 border-b border-[var(--glass-border)] bg-[var(--glass-surface)] space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-[var(--text-primary)]">{selectedList.title}</h2>
                      {selectedList.description && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                          {selectedList.description}
                        </p>
                      )}
                    </div>

                    {/* Compact list badge stats */}
                    <div className="flex items-center gap-3 bg-[var(--glass-surface)]/50 border border-[var(--glass-border)] p-3 rounded-xl">
                      <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-[#1F2937]"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <motion.path
                            className="text-indigo-400"
                            strokeWidth="3"
                            strokeDasharray={`${listStats.percentage}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            initial={{ strokeDasharray: '0, 100' }}
                            animate={{ strokeDasharray: `${listStats.percentage}, 100` }}
                            transition={{ duration: 0.5 }}
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <span className="absolute text-[10px] font-bold text-indigo-300 font-mono">
                          {listStats.percentage}%
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                          Workspace Progress
                        </p>
                        <p className="text-xs font-bold text-[var(--text-primary)]/90">
                          {listStats.completed} / {listStats.total} Milestones Done
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Filters and Search Bar Container */}
                  <div className="flex items-center justify-between border-t border-[var(--glass-border)] pt-4">
                    {/* Tabs */}
                    <div className="flex items-center p-0.5 rounded-lg bg-[var(--glass-surface)]/50 border border-[var(--glass-border)] w-fit">
                      {(['all', 'active', 'completed'] as FilterType[]).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveFilter(tab)}
                          className={cn(
                            'px-4 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 capitalize',
                            activeFilter === tab
                              ? 'bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6]'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* List Tasks Checklist */}
                <div className="flex-1 overflow-y-auto p-5">
                  {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-10">
                      <ClipboardList className="w-10 h-10 text-[#1F2937] animate-pulse" />
                      <p className="text-xs text-[var(--text-secondary)]">
                        {activeFilter === 'all'
                          ? 'No milestones in this workspace yet'
                          : `No ${activeFilter} milestones found`}
                      </p>
                    </div>
                  ) : (
                    <Reorder.Group
                      axis="y"
                      values={filteredTasks}
                      onReorder={handleReorder}
                      className="space-y-3"
                    >
                      <AnimatePresence>
                        {filteredTasks.map((task) => {
                          const isEditing = editingTaskId === task.id;

                          return (
                            <Reorder.Item
                              key={task.id}
                              value={task}
                              className={cn(
                                'relative flex items-center gap-3 p-4 pl-5 rounded-xl border transition-all duration-200 group',
                                task.completed
                                  ? 'bg-[var(--glass-surface)]/50 border-emerald-500/10 opacity-60'
                                  : 'bg-[var(--glass-surface)] border-[var(--glass-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-lg)] hover:border-[var(--glass-border-accent)] hover:-translate-y-0.5'
                              )}
                            >
                              {/* Left gradient accent bar */}
                              <div className={cn(
                                'absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full transition-all duration-300',
                                task.completed
                                  ? 'bg-emerald-500/30'
                                  : 'bg-gradient-to-b from-[#3B82F6] to-indigo-500 group-hover:from-indigo-400 group-hover:to-[#3B82F6]'
                              )} />

                              {/* Drag Handle */}
                              <div className="cursor-grab active:cursor-grabbing text-[var(--text-secondary)]/40 hover:text-[var(--text-secondary)] p-1 flex-shrink-0 transition-colors">
                                <GripVertical className="w-4 h-4" />
                              </div>

                              {/* Checkbox button */}
                              <button
                                onClick={() => toggleTaskComplete(selectedList.id, task.id)}
                                className={cn(
                                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200',
                                  task.completed
                                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-400'
                                    : 'border-[var(--glass-border)] hover:border-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/5'
                                )}
                              >
                                {task.completed && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                                  >
                                    <Check className="w-3 h-3" />
                                  </motion.div>
                                )}
                              </button>

                              {/* Task Text View / Edit */}
                              <div className="flex-1 min-w-0 pr-12">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editingTaskText}
                                    onChange={(e) => setEditingTaskText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveTaskEdit(task.id);
                                      if (e.key === 'Escape') setEditingTaskId(null);
                                    }}
                                    autoFocus
                                    className="w-full bg-[var(--glass-surface)] border border-[var(--glass-border-accent)] rounded-lg px-2.5 py-1 text-sm text-[var(--text-primary)] outline-none transition-all duration-[350ms] ease-glass"
                                  />
                                ) : (
                                  <p
                                    className={cn(
                                      'text-sm leading-relaxed transition-all duration-300',
                                      task.completed
                                        ? 'line-through text-[var(--text-secondary)]/60 italic'
                                        : 'text-[var(--text-primary)] font-semibold'
                                    )}
                                    onDoubleClick={() => startEditing(task.id, task.text)}
                                  >
                                    {task.text}
                                  </p>
                                )}
                              </div>

                              {/* Floating Actions overlay */}
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={() => saveTaskEdit(task.id)}
                                      className="p-1 rounded bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30 hover:bg-[#3B82F6]/30"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingTaskId(null)}
                                      className="p-1 rounded bg-[var(--glass-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface-hover)] transition-colors"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditing(task.id, task.text)}
                                      className="p-1.5 rounded-lg hover:bg-[var(--glass-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                      title="Edit milestone"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => deleteTask(selectedList.id, task.id)}
                                      className="p-1.5 rounded-lg hover:bg-[#EF4444]/10 text-[var(--text-secondary)] hover:text-[#EF4444] transition-colors"
                                      title="Delete milestone"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </Reorder.Item>
                          );
                        })}
                      </AnimatePresence>
                    </Reorder.Group>
                  )}
                </div>

                {/* Bottom Add Task input */}
                <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--glass-surface)]">
                  <form onSubmit={handleAddTask} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add manual milestone to this plan..."
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      className="flex-1 bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-primary)] rounded-xl px-4 py-2.5 text-xs placeholder-[var(--text-secondary)]/50 outline-none transition-all duration-[350ms] ease-glass focus:border-[var(--glass-border-accent)] focus:shadow-[var(--shadow-sm)]"
                    />
                    <motion.button
                      type="submit"
                      disabled={!newTaskText.trim()}
                      className="px-4 py-2.5 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/30 text-[#3B82F6] text-xs font-semibold hover:bg-[#3B82F6]/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center gap-1.5"
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  MODAL OVERLAY: CREATE NEW CUSTOM TODO LIST                  */}
      {/* ============================================================ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Modal content body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md glass-heavy rounded-2xl p-6 shadow-[var(--shadow-2xl)] flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-3">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-[#3B82F6]" />
                  <h3 className="text-base font-bold text-[var(--text-primary)]">Create Custom Checklist</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateList} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                    Checklist Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3rd Sem Exams Preparation"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    required
                    className="w-full bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 outline-none transition-all duration-[350ms] ease-glass focus:border-[var(--glass-border-accent)] focus:shadow-[var(--shadow-sm)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe milestones, phases, or references..."
                    value={newListDesc}
                    onChange={(e) => setNewListDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 outline-none transition-all duration-[350ms] ease-glass focus:border-[var(--glass-border-accent)] focus:shadow-[var(--shadow-sm)] resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-[var(--text-secondary)] border border-[var(--glass-border)] bg-[var(--glass-surface)]/50 hover:bg-[var(--glass-surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)] transition-all duration-[350ms] ease-glass"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[var(--accent-blue)] text-white hover:brightness-110 shadow-[var(--shadow-sm)] transition-all duration-[350ms] ease-glass"
                    whileTap={{ scale: 0.98 }}
                  >
                    Create List
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
