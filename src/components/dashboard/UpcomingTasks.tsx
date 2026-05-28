'use client';

import { motion } from 'framer-motion';
import { Calendar, FileText, ClipboardList, CreditCard, Award, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTasks } from '@/hooks/useTasks';
import { formatRelativeDate, getUrgencyColor } from '@/lib/utils';
import { CATEGORY_LABELS } from '@/lib/constants';
import TiltCard from '@/components/shared/TiltCard';

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  exam: FileText,
  assignment: ClipboardList,
  fee: CreditCard,
  scholarship: Award,
  event: Calendar,
};

export default function UpcomingTasks() {
  const { tasks, isLoading } = useTasks();
  const sortedTasks = [...tasks]
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  return (
    <TiltCard className="p-6 h-full flex flex-col justify-between" intensity={3}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
                Upcoming Roadmap
              </h3>
              <p className="text-[10px] dark:text-slate-500 text-slate-400">
                Timeline order calendar
              </p>
            </div>
          </div>
        </div>

        {sortedTasks.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">No tasks on the horizon. Relax! 🍃</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-5 border-l border-slate-200 dark:border-white/[0.06]">
            {sortedTasks.map((task, index) => {
              const IconComponent = categoryIcons[task.category] || ClipboardList;
              let dotColor = 'bg-blue-400';
              if (task.priority === 'critical') dotColor = 'bg-rose-400';
              else if (task.priority === 'high') dotColor = 'bg-amber-400';

              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Timeline Dot Indicator */}
                  <span className={`absolute -left-[30px] top-1.5 w-2 h-2 rounded-full border border-slate-900 ${dotColor}`} />

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800 leading-snug group-hover:text-blue-400 transition-colors">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px]">
                        <span className={`font-semibold ${getUrgencyColor(task.priority)}`}>
                          {formatRelativeDate(task.deadline)}
                        </span>
                        <span className="dark:text-slate-500 text-slate-400">•</span>
                        <span className="dark:text-slate-500 text-slate-400">
                          {CATEGORY_LABELS[task.category]}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/[0.05] flex justify-end">
        <Link
          href="/scan"
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
        >
          <span>Scan Notice to Append</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </TiltCard>
  );
}
