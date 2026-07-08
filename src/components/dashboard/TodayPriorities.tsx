'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ClipboardList } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { priorityScore, formatRelativeDate, getUrgencyColor } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/constants';
import TiltCard from '@/components/shared/TiltCard';

export default function TodayPriorities() {
  const { tasks: allTasks, isLoading, toggleTaskComplete } = useTasks();

  // Sort non-completed tasks by AI priority score
  const tasks = useMemo(
    () => [...allTasks]
      .filter((t) => t.status !== 'completed')
      .sort((a, b) => priorityScore(b) - priorityScore(a)),
    [allTasks]
  );

  const toggleTask = async (id: string) => {
    await toggleTaskComplete(id);
  };

  return (
    <TiltCard className="p-6 h-full flex flex-col justify-between" intensity={3}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <ClipboardList className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Today&apos;s Priorities
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Sorted by AI Priority Engine
              </p>
            </div>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-[var(--text-secondary)]">All caught up! You are doing great. 💙</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            <AnimatePresence initial={false}>
              {tasks.slice(0, 4).map((task) => {
                const isCompleted = task.status === 'completed';

                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`flex items-start gap-3 p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-surface)] transition-all ${
                      isCompleted ? 'opacity-40 line-through' : ''
                    }`}
                  >
                    {/* Checkbox Trigger */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`mt-0.5 w-4.5 h-4.5 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                        isCompleted
                          ? 'bg-[var(--accent-blue)] border-[#3B82F6] text-white'
                          : 'border-[var(--glass-border)] hover:border-[#3B82F6] bg-[var(--glass-surface)]'
                      }`}
                    >
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </motion.div>
                      )}
                    </button>

                    {/* Task details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[9px] font-semibold uppercase tracking-wider ${getUrgencyColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-[8px] text-[var(--text-secondary)] font-mono bg-[var(--glass-surface)] px-1.5 py-0.5 rounded border border-[var(--glass-border)]">
                          {CATEGORY_LABELS[task.category]}
                        </span>
                        <span className="text-[9px] text-[var(--text-secondary)] font-medium ml-auto">
                          {formatRelativeDate(task.deadline)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="text-[10px] text-[var(--text-muted)] mt-4 text-center font-mono">
        ★ Priority calculations re-evaluate autonomously
      </div>
    </TiltCard>
  );
}
