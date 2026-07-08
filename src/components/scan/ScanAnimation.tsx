'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Brain,
  Calendar,
  DollarSign,
  ListChecks,
  LayoutGrid,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Stage definitions                                                  */
/* ------------------------------------------------------------------ */

const STAGES = [
  { label: 'Reading content...', Icon: Brain },
  { label: 'Extracting deadlines...', Icon: Calendar },
  { label: 'Detecting financial details...', Icon: DollarSign },
  { label: 'Identifying required actions...', Icon: ListChecks },
  { label: 'Generating task cards...', Icon: LayoutGrid },
  { label: 'Organizing intelligence...', Icon: Sparkles },
] as const;

const STAGE_INTERVAL = 650; // ms between stage activations
const COMPLETE_DELAY = 450; // ms after activation to mark complete
const BUFFER = 600; // ms after last stage before onComplete

/* ------------------------------------------------------------------ */
/*  Deterministic particle seeds (avoid hydration mismatch)            */
/* ------------------------------------------------------------------ */

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

interface Particle {
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  driftX: number;
  driftY: number;
  color: string;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const r = seededRandom;
    return {
      x: r(i * 3 + 1) * 100,
      y: r(i * 3 + 2) * 100,
      size: 1 + r(i * 3 + 3),
      opacity: 0.1 + r(i * 7) * 0.4,
      duration: 3 + r(i * 11) * 3,
      driftX: (r(i * 13) - 0.5) * 30,
      driftY: (r(i * 17) - 0.5) * 24,
      color: r(i * 19) > 0.5 ? 'bg-blue-400' : 'bg-indigo-400',
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ScanAnimationProps {
  onComplete?: () => void;
}

export default function ScanAnimation({ onComplete }: ScanAnimationProps) {
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [activeStage, setActiveStage] = useState(0);

  const particles = useMemo(() => generateParticles(25), []);

  /* ---- timers ---------------------------------------------------- */
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STAGES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveStage(i);
        }, i * STAGE_INTERVAL),
      );

      timers.push(
        setTimeout(() => {
          setCompletedStages((prev) => [...prev, i]);
        }, i * STAGE_INTERVAL + COMPLETE_DELAY),
      );
    });

    timers.push(
      setTimeout(() => {
        onComplete?.();
      }, STAGES.length * STAGE_INTERVAL + BUFFER),
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  /* ---- render ---------------------------------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      className="w-full rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--blur-xl)] overflow-hidden"
    >
      {/* ============================================================ */}
      {/*  Scanning visual area                                        */}
      {/* ============================================================ */}
      <div className="relative h-56 overflow-hidden">
        {/* Subtle radial gradient background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(23,37,84,0.30) 0%, transparent 70%)',
          }}
        />

        {/* ---- Floating particles ---------------------------------- */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((p, i) => (
            <motion.div
              key={i}
              className={cn('absolute rounded-full', p.color)}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
              }}
              animate={{
                x: [0, p.driftX, -p.driftX * 0.6, 0],
                y: [0, p.driftY, -p.driftY * 0.4, 0],
                opacity: [p.opacity, p.opacity * 1.6, p.opacity * 0.7, p.opacity],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* ---- Concentric pulse rings ------------------------------ */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border border-[#3B82F6]/20"
              style={{ width: 80, height: 80 }}
              animate={{
                scale: [1, 2.5],
                opacity: [0.4, 0],
              }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: ring * 0.8,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* ---- Scanning beam --------------------------------------- */}
        <motion.div
          className="absolute left-0 right-0 h-[1.5px]"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.15) 15%, rgba(59,130,246,0.6) 50%, rgba(99,102,241,0.15) 85%, transparent 100%)',
            boxShadow: '0 0 24px 6px rgba(59,130,246,0.18)',
          }}
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* ---- Center brain icon ----------------------------------- */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 0px rgba(59,130,246,0), 0 0 0px rgba(99,102,241,0)',
                '0 0 36px rgba(59,130,246,0.25), 0 0 60px rgba(99,102,241,0.10)',
                '0 0 0px rgba(59,130,246,0), 0 0 0px rgba(99,102,241,0)',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            >
              <Brain className="w-9 h-9 text-[#3B82F6]" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Status / stages area                                        */}
      {/* ============================================================ */}
      <div className="px-8 py-6 border-t border-[var(--glass-border)]">
        {/* Header text */}
        <motion.p
          className="text-center text-sm font-medium text-[var(--text-primary)] mb-6 select-none"
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          AI is analyzing your notice
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ...
          </motion.span>
        </motion.p>

        {/* Stage list */}
        <div className="space-y-2.5 max-w-sm mx-auto">
          <AnimatePresence>
            {STAGES.map((stage, i) => {
              const isCompleted = completedStages.includes(i);
              const isActive = activeStage >= i;
              const StageIcon = stage.Icon;

              return (
                <motion.div
                  key={stage.label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={
                    isActive
                      ? { opacity: 1, x: 0 }
                      : { opacity: 0, x: -16 }
                  }
                  transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-center gap-3"
                >
                  {/* Checkbox / indicator */}
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300',
                      isCompleted
                        ? 'bg-emerald-500/20 border border-emerald-500/40'
                        : 'bg-[#3B82F6]/10 border border-[#3B82F6]/20',
                    )}
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: 'spring',
                          stiffness: 420,
                          damping: 14,
                        }}
                      >
                        <Check className="w-3 h-3 text-emerald-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]"
                        animate={{ scale: [1, 1.6, 1], opacity: [1, 0.6, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Stage icon */}
                  <StageIcon
                    className={cn(
                      'w-3.5 h-3.5 flex-shrink-0 transition-colors duration-300',
                      isCompleted ? 'text-emerald-400/70' : 'text-[var(--text-secondary)]',
                    )}
                  />

                  {/* Stage label */}
                  <span
                    className={cn(
                      'text-sm transition-colors duration-300',
                      isCompleted ? 'text-emerald-300' : 'text-[var(--text-secondary)]',
                    )}
                  >
                    {stage.label}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
