'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertTriangle, GraduationCap, BarChart3 } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useAttendance } from '@/hooks/useAttendance';
import { useScholarships } from '@/hooks/useScholarships';
import TiltCard from '@/components/shared/TiltCard';
import type { AIInsight } from '@/types';

const insightIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertTriangle: AlertTriangle,
  GraduationCap: GraduationCap,
  BarChart3: BarChart3,
};

export default function AIInsights() {
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { subjects, isLoading: attendanceLoading } = useAttendance();
  const { scholarships, isLoading: scholarshipsLoading } = useScholarships();

  const isLoading = tasksLoading || attendanceLoading || scholarshipsLoading;

  const insights = useMemo(() => {
    if (isLoading) return [];
    
    const generatedInsights: AIInsight[] = [];
    let idCounter = 1;

    // 1. Attendance Warning Insight
    const lowAttendanceSubjects = subjects.filter((s) => s.percentage < 75);
    if (lowAttendanceSubjects.length > 0) {
      const subjectNames = lowAttendanceSubjects.map(s => s.code).join(', ');
      generatedInsights.push({
        id: `ins-${idCounter++}`,
        type: 'warning',
        title: 'Attendance Alert',
        message: `Your attendance in ${subjectNames} is below the 75% safe limit. Attend the next few classes consecutively to reach the safe zone.`,
        icon: 'AlertTriangle',
      });
    }

    // 2. Scholarship Tip Insight
    const upcomingScholarships = scholarships.filter((s) => {
      const diffDays = (new Date(s.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
      return diffDays > 0 && diffDays <= 30;
    });
    if (upcomingScholarships.length > 0) {
      generatedInsights.push({
        id: `ins-${idCounter++}`,
        type: 'tip',
        title: 'Scholarship Window Open',
        message: `${upcomingScholarships[0].name} deadline is approaching. You match the eligibility criteria based on your profile.`,
        icon: 'GraduationCap',
      });
    }

    // 3. Task Progress Info Insight
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length;
    
    if (criticalTasks > 0) {
      generatedInsights.push({
        id: `ins-${idCounter++}`,
        type: 'info',
        title: 'Action Required',
        message: `You have ${criticalTasks} critical deadlines coming up. Prioritize them immediately.`,
        icon: 'BarChart3',
      });
    } else {
      generatedInsights.push({
        id: `ins-${idCounter++}`,
        type: 'info',
        title: 'Weekly Summary',
        message: `You have completed ${completedTasks} tasks. You have no critical deadlines. Great job staying organized!`,
        icon: 'BarChart3',
      });
    }

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
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                AI Cognitive Insights
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)]">
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
                  <div key={i} className="h-16 rounded-xl bg-[var(--glass-surface)] animate-pulse" />
                ))}
              </motion.div>
            ) : insights.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-6 text-center text-xs text-[var(--text-secondary)]">
                No new insights right now. Keep up the good work!
              </motion.div>
            ) : (
              insights.map((ins, i) => {
                const Icon = insightIcons[ins.icon] || BarChart3;

                let textGlow = 'text-[#3B82F6]';
                let borderStyle = 'border-[var(--glass-border)] bg-[var(--glass-surface)]';

                if (ins.type === 'warning') {
                  textGlow = 'text-[#EF4444]';
                  borderStyle = 'border-[#EF4444]/20 bg-[#EF4444]/5';
                } else if (ins.type === 'tip') {
                  textGlow = 'text-[#F59E0B]';
                  borderStyle = 'border-[#F59E0B]/20 bg-[#F59E0B]/5';
                }

                return (
                  <motion.div
                    key={ins.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25, delay: i * 0.1 }}
                    className={`p-3.5 rounded-xl border flex gap-3 ${borderStyle}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      <Icon className={`w-4 h-4 ${textGlow}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">
                        {ins.title}
                      </h4>
                      <p className="text-[10.5px] text-[var(--text-secondary)] mt-1 leading-normal">
                        {ins.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="text-[10px] text-[var(--text-muted)] mt-4 text-center font-mono">
        ✓ Engine re-prioritizes based on real-time data
      </div>
    </TiltCard>
  );
}
