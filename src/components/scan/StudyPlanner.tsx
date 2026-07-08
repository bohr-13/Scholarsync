'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, CheckCircle2, ChevronRight, Calendar, Brain, ListChecks } from 'lucide-react';
import type { StudyPlan } from '@/types';

interface StudyPlannerProps {
  title: string;
  summary: string;
  deadline: string | null;
  onPlanChange?: (plan: StudyPlan | null) => void;
}

export default function StudyPlanner({ title, summary, deadline, onPlanChange }: StudyPlannerProps) {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [activeDay, setActiveDay] = useState<number>(1);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, summary, deadline }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setPlan(resData.data);
        onPlanChange?.(resData.data);
      }
    } catch (err) {
      console.error('Failed to generate study plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (day: number, taskIdx: number) => {
    const key = `${day}-${taskIdx}`;
    setCompletedTasks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--blur-xl)] p-5 lg:p-6 mt-6">
      <AnimatePresence mode="wait">
        {!plan && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center py-6 space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-lg">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Prepare Strategically</h4>
              <p className="text-xs text-[var(--text-secondary)]">
                Let Gemini AI analyze this notice&apos;s context and generate a personalized 5-day study plan leading up to the deadline.
              </p>
            </div>
            <motion.button
              onClick={generatePlan}
              className="py-2.5 px-6 rounded-xl font-medium text-xs bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 transition-all duration-300 cursor-pointer inline-flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Brain className="w-3.5 h-3.5" />
              Generate 5-Day Study Plan
            </motion.button>
          </motion.div>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 space-y-4"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/10" />
              <div className="absolute inset-0 rounded-full border-2 border-t-indigo-400 border-r-transparent animate-spin" />
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-semibold text-[var(--text-primary)]">Crafting study roadmap...</p>
              <p className="text-[10px] text-[var(--text-secondary)] animate-pulse">Mapping daily focus &amp; active recall checks</p>
            </div>
          </motion.div>
        )}

        {plan && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--glass-border)] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">{plan.title}</h4>
                  <p className="text-[10px] text-[var(--text-secondary)]">AI Study Strategist • 5 Days structured prep</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {plan.days.map((d) => (
                  <button
                    key={d.day}
                    onClick={() => setActiveDay(d.day)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      activeDay === d.day
                        ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shadow-md'
                        : 'hover:bg-[var(--glass-surface)] border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    D{d.day}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily content layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Daily focus banner */}
              <div className="md:col-span-1 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] p-4 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                    Day {activeDay} Focus
                  </div>
                  <h5 className="text-sm font-semibold text-[var(--text-primary)] mb-2 leading-snug">
                    {plan.days[activeDay - 1].focus}
                  </h5>
                </div>
                
                {plan.days[activeDay - 1].tips.map((tip, idx) => (
                  <div key={idx} className="mt-4 p-3 rounded-lg bg-indigo-500/[0.02] border border-indigo-500/[0.08] flex gap-2">
                    <Brain className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] leading-relaxed text-indigo-300/80 font-medium">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tasks Checklist */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-1 px-1 font-medium">
                  <ListChecks className="w-3.5 h-3.5" />
                  <span>Action Items</span>
                </div>

                <div className="space-y-2">
                  {plan.days[activeDay - 1].tasks.map((task, idx) => {
                    const isDone = !!completedTasks[`${activeDay}-${idx}`];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleTask(activeDay, idx)}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                          isDone
                            ? 'bg-emerald-500/[0.01] border-emerald-500/10 opacity-70'
                            : 'bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:bg-[var(--glass-bg)] hover:border-[#3B82F6]/30'
                        }`}
                      >
                        <button
                          className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all ${
                            isDone ? 'bg-emerald-500/15 border-emerald-500/30' : 'border-[var(--glass-border)]'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </button>
                        <p className={`text-xs leading-relaxed transition-all ${isDone ? 'line-through text-[var(--text-secondary)]/60' : 'text-[var(--text-primary)]'}`}>
                          {task}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
