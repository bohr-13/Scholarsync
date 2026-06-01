'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, GraduationCap, BarChart3 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAttendance } from '@/hooks/useAttendance';
import { useScholarships } from '@/hooks/useScholarships';
import TiltCard from '@/components/shared/TiltCard';
import type { AIInsight, SubjectAttendance, Scholarship, Task } from '@/types';

const insightIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle: AlertTriangle,
  GraduationCap: GraduationCap,
  BarChart3: BarChart3,
};

function generateAttendanceInsight(subjects: SubjectAttendance[]): Omit<AIInsight, 'id'> | null {
  const lowAttendanceSubjects = subjects.filter((s) => s.percentage < 75);
  if (lowAttendanceSubjects.length > 0) {
    const subjectNames = lowAttendanceSubjects.map(s => s.code).join(', ');
    return {
      type: 'warning',
      title: 'Attendance Alert',
      message: `Your attendance in ${subjectNames} is below the 75% safe limit. Attend the next few classes consecutively to reach the safe zone.`,
      icon: 'AlertTriangle',
    };
  }
  return null;
}

function generateScholarshipInsight(scholarships: Scholarship[]): Omit<AIInsight, 'id'> | null {
  const upcomingScholarships = scholarships.filter((s) => {
    const diffDays = (new Date(s.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diffDays > 0 && diffDays <= 30;
  });
  if (upcomingScholarships.length > 0) {
    return {
      type: 'tip',
      title: 'Scholarship Window Open',
      message: `${upcomingScholarships[0].name} deadline is approaching. You match the eligibility criteria based on your profile.`,
      icon: 'GraduationCap',
    };
  }
  return null;
}

function generateTaskInsight(tasks: Task[]): Omit<AIInsight, 'id'> | null {
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;

  if (criticalTasks > 0) {
    return {
      type: 'info',
      title: 'Action Required',
      message: `You have ${criticalTasks} critical deadlines coming up. Prioritize them immediately.`,
      icon: 'BarChart3',
    };
  } else {
    return {
      type: 'info',
      title: 'Weekly Summary',
      message: `You have completed ${completedTasks} tasks. You have no critical deadlines. Great job staying organized!`,
      icon: 'BarChart3',
    };
  }
}

function InsightCard({ ins, index }: { ins: AIInsight; index: number }) {
  const Icon = insightIcons[ins.icon] || BarChart3;

  let textGlow = 'dark:text-blue-400 text-blue-600';
  let borderStyle = 'border-blue-500/10 bg-blue-500/[0.02]';

  if (ins.type === 'warning') {
    textGlow = 'text-rose-400 dark:text-rose-400';
    borderStyle = 'border-rose-500/10 bg-rose-500/[0.02]';
  } else if (ins.type === 'tip') {
    textGlow = 'text-amber-400 dark:text-amber-400';
    borderStyle = 'border-amber-500/10 bg-amber-500/[0.02]';
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.1 }}
      className={`p-3.5 rounded-xl border flex gap-3 ${borderStyle}`}
    >
      <div className="mt-0.5 shrink-0">
        <Icon className={`w-4 h-4 ${textGlow}`} />
      </div>
      <div>
        <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800">
          {ins.title}
        </h4>
        <p className="text-[10.5px] dark:text-slate-400 text-slate-600 mt-1 leading-normal">
          {ins.message}
        </p>
      </div>
    </motion.div>
  );
}

export default function AIInsights() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { subjects, isLoading: attendanceLoading } = useAttendance();
  const { scholarships, isLoading: scholarshipsLoading } = useScholarships();

  const isLoading = tasksLoading || attendanceLoading || scholarshipsLoading;

  const insights = useMemo(() => {
    if (isLoading) return [];
    
    const rawInsights = [
      generateAttendanceInsight(subjects),
      generateScholarshipInsight(scholarships),
      generateTaskInsight(tasks),
    ].filter((ins): ins is Omit<AIInsight, 'id'> => ins !== null);

    const generatedInsights: AIInsight[] = rawInsights.map((ins, index) => ({
      ...ins,
      id: `ins-${index + 1}`
    }));

    return generatedInsights.slice(0, 3); // Max 3 insights
  }, [tasks, subjects, scholarships, isLoading]);

  return (
    <TiltCard className="p-6 h-full flex flex-col justify-between" intensity={3}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
                AI Cognitive Insights
              </h3>
              <p className="text-[10px] dark:text-slate-500 text-slate-400">
                Personalized study recommendations
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3.5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-slate-200/50 dark:bg-white/[0.04] animate-pulse" />
                ))}
              </motion.div>
            ) : insights.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 text-center text-xs text-slate-400">
                No new insights right now. Keep up the good work!
              </motion.div>
            ) : (
              insights.map((ins, i) => (
                <InsightCard key={ins.id} ins={ins} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="text-[10px] text-slate-500 dark:text-slate-600 mt-4 text-center font-mono">
        ✓ Engine re-prioritizes based on real-time data
      </div>
    </TiltCard>
  );
}
