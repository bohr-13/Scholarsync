'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, CreditCard, FileUp, UserCheck, BookOpen, ShieldCheck } from 'lucide-react';
import { cn, formatRelativeDate } from '@/lib/utils';
import type { TaskCard } from '@/types';

interface DeadlineTimelineProps {
  deadline: string | null;
  taskCards: TaskCard[];
}

const TYPE_CONFIG: Record<
  TaskCard['type'],
  { color: string; bg: string; border: string; dot: string; Icon: typeof Clock }
> = {
  payment: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400',
    Icon: CreditCard,
  },
  submission: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    dot: 'bg-blue-400',
    Icon: FileUp,
  },
  registration: {
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    dot: 'bg-violet-400',
    Icon: UserCheck,
  },
  preparation: {
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400',
    Icon: BookOpen,
  },
  verification: {
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    dot: 'bg-slate-400',
    Icon: ShieldCheck,
  },
};

function useCountdown(dateStr: string | null): { label: string; days: number } {
  return useMemo(() => {
    if (!dateStr) return { label: 'No date', days: Infinity };
    const now = new Date();
    const target = new Date(dateStr);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return { label: 'Overdue', days: -1 };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return { label: `${days}d ${hours}h remaining`, days };
    return { label: `${hours}h remaining`, days: 0 };
  }, [dateStr]);
}

function getDeadlineDotColor(days: number): { dot: string; glow: string; text: string } {
  if (days < 0) return { dot: 'bg-rose-400', glow: 'shadow-rose-500/40', text: 'text-rose-400' };
  if (days < 3) return { dot: 'bg-rose-400', glow: 'shadow-rose-500/40', text: 'text-rose-400' };
  if (days < 7) return { dot: 'bg-amber-400', glow: 'shadow-amber-500/40', text: 'text-amber-400' };
  return { dot: 'bg-blue-400', glow: 'shadow-blue-500/40', text: 'text-blue-400' };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const nodeVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

export default function DeadlineTimeline({ deadline, taskCards }: DeadlineTimelineProps) {
  const { label: deadlineLabel, days: deadlineDays } = useCountdown(deadline);

  // Don't render if there's nothing to show
  if (!deadline && taskCards.length === 0) return null;

  const deadlineColors = getDeadlineDotColor(deadlineDays);
  const totalNodes = (deadline ? 1 : 0) + taskCards.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative pl-8"
    >
      {/* Animated connecting line */}
      <motion.div
        className="absolute left-[11px] top-2 bottom-2 w-[2px] rounded-full"
        style={{
          background: 'linear-gradient(to bottom, rgba(59,130,246,0.5), rgba(99,102,241,0.5))',
        }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{
          duration: 0.6 + totalNodes * 0.15,
          ease: [0.22, 1, 0.36, 1],
          delay: 0.15,
        }}
        style-origin="top"
      />

      {/* Main deadline node */}
      {deadline && (
        <motion.div variants={nodeVariants} className="relative flex items-start gap-4 pb-6">
          {/* Dot */}
          <div className="absolute -left-8 top-1 flex items-center justify-center">
            <motion.div
              className={cn('w-6 h-6 rounded-full flex items-center justify-center', deadlineColors.dot)}
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                boxShadow: `0 0 12px 2px`,
              }}
            >
              <Calendar className="w-3 h-3 text-white" />
            </motion.div>
          </div>

          {/* Card */}
          <div
            className={cn(
              'flex-1 rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-4',
              'shadow-lg'
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Main Deadline
              </span>
            </div>
            <p className={cn('text-sm font-semibold', deadlineColors.text)}>
              {formatRelativeDate(deadline)}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Clock className="w-3 h-3 text-slate-500" />
              <p className="text-xs text-slate-400">{deadlineLabel}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Task card nodes */}
      {taskCards.map((task, i) => {
        const config = TYPE_CONFIG[task.type] ?? TYPE_CONFIG.verification;

        return (
          <motion.div
            key={`${task.title}-${i}`}
            variants={nodeVariants}
            className="relative flex items-start gap-4 pb-5 last:pb-0"
          >
            {/* Dot */}
            <div className="absolute -left-8 top-1.5 flex items-center justify-center">
              <motion.div
                className={cn('w-5 h-5 rounded-full flex items-center justify-center', config.bg, 'border', config.border)}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
              >
                <div className={cn('w-2 h-2 rounded-full', config.dot)} />
              </motion.div>
            </div>

            {/* Card */}
            <motion.div
              className={cn(
                'flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4',
                'hover:bg-white/[0.04] transition-colors duration-200'
              )}
              whileHover={{ x: 2 }}
            >
              {/* Type badge */}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
                    config.bg,
                    config.border,
                    config.color
                  )}
                >
                  <config.Icon className="w-3 h-3" />
                  {task.type}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-200 mb-1">{task.title}</p>

              {task.description && (
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-2">
                  {task.description}
                </p>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <p className="text-[11px] text-slate-500">
                    {formatRelativeDate(task.dueDate)}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
