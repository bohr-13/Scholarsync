'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTasks } from '@/hooks/useTasks';
import { formatRelativeDate, getUrgencyColor, getUrgencyBg } from '@/lib/utils';
import { useEmergencyMode } from '@/components/providers/EmergencyProvider';
import TiltCard from '@/components/shared/TiltCard';

export default function UrgentDeadlines() {
  const { emergency } = useEmergencyMode();
  const { tasks, isLoading } = useTasks();

  // Filter tasks based on whether focus mode is active
  const filteredTasks = tasks.filter((task) => {
    if (task.status === 'completed') return false;

    if (emergency.isActive) {
      // In Focus Mode, show all Critical and High priority tasks to keep the focus narrow
      return task.priority === 'critical' || task.priority === 'high';
    } else {
      // Normally, show tasks due in the next 48 hours (or overdue)
      const now = new Date();
      const deadline = new Date(task.deadline);
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2;
    }
  });

  const listVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  };

  return (
    <TiltCard
      className="p-6 h-full flex flex-col justify-between overflow-hidden"
      glowColor="rgba(244,63,94,0.15)"
      intensity={3}
    >
      <div>
        {isLoading ? (
          <div className="space-y-3 py-4">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-white/[0.04] animate-pulse" />)}
          </div>
        ) : (<>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
                {emergency.isActive ? 'Critical Deadlines Only' : 'Urgent Actions'}
              </h3>
              <p className="text-[10px] dark:text-slate-500 text-slate-400">
                {emergency.isActive ? 'Calm workspace active' : 'Due within 48 hours'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'Alert' : 'Alerts'}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">No urgent deadlines! Keep it up. ✨</p>
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredTasks.slice(0, 3).map((task) => (
              <motion.div
                key={task.id}
                variants={itemVariants}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${getUrgencyBg(task.priority)}`}
              >
                <div className="mt-0.5">
                  <Calendar className={`w-3.5 h-3.5 ${getUrgencyColor(task.priority)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800 truncate">
                    {task.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className={`font-semibold ${getUrgencyColor(task.priority)}`}>
                      {formatRelativeDate(task.deadline)}
                    </span>
                    <span className="dark:text-slate-500 text-slate-400 font-medium">
                      {task.source || 'Scanned Notice'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </>)}
      </div>

      <div className="pt-4 mt-4 border-t border-white/[0.05] dark:border-white/[0.05] border-slate-200/60 flex justify-between items-center text-xs">
        <span className="text-slate-400 dark:text-slate-500">
          {filteredTasks.length > 3 ? `+${filteredTasks.length - 3} more priority actions` : 'Everything is organized'}
        </span>
        <Link
          href="/scan"
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
        >
          <span>Quick Scan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </TiltCard>
  );
}
