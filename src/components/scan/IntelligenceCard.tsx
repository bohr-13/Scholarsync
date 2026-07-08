'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IntelligenceCardProps {
  icon: React.ReactNode;
  title: string;
  accentColor: string;
  children: React.ReactNode;
  delay?: number;
  className?: string;
  glowIntensity?: 'low' | 'medium' | 'high';
}

const accentColorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  blue: {
    border: 'from-blue-400 to-blue-600',
    bg: 'bg-blue-500/10 border-blue-500/20',
    text: 'text-blue-400',
    glow: 'rgba(59, 130, 246, VAR)',
  },
  rose: {
    border: 'from-rose-400 to-rose-600',
    bg: 'bg-rose-500/10 border-rose-500/20',
    text: 'text-rose-400',
    glow: 'rgba(244, 63, 94, VAR)',
  },
  emerald: {
    border: 'from-emerald-400 to-emerald-600',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-400',
    glow: 'rgba(16, 185, 129, VAR)',
  },
  amber: {
    border: 'from-amber-400 to-amber-600',
    bg: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-400',
    glow: 'rgba(245, 158, 11, VAR)',
  },
  violet: {
    border: 'from-violet-400 to-violet-600',
    bg: 'bg-violet-500/10 border-violet-500/20',
    text: 'text-violet-400',
    glow: 'rgba(139, 92, 246, VAR)',
  },
  indigo: {
    border: 'from-indigo-400 to-indigo-600',
    bg: 'bg-indigo-500/10 border-indigo-500/20',
    text: 'text-indigo-400',
    glow: 'rgba(99, 102, 241, VAR)',
  },
};

const glowOpacityMap: Record<string, string> = {
  low: '0.06',
  medium: '0.12',
  high: '0.22',
};

export default function IntelligenceCard({
  icon,
  title,
  accentColor,
  children,
  delay = 0,
  className,
  glowIntensity = 'low',
}: IntelligenceCardProps) {
  const colors = accentColorMap[accentColor] ?? accentColorMap.blue;
  const glowAlpha = glowOpacityMap[glowIntensity];
  const glowValue = colors.glow.replace('VAR', glowAlpha);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 24,
        delay,
      }}
      whileHover={{
        y: -2,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      className={cn(
        'relative rounded-2xl glass overflow-hidden',
        'transition-all duration-[350ms] ease-glass',
        className
      )}
      style={{
        boxShadow: `var(--shadow-md), 0 0 0 1px var(--glass-border)`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `var(--shadow-lg), 0 0 0 1px var(--glass-border-hover)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = `var(--shadow-md), 0 0 0 1px var(--glass-border)`;
      }}
    >
      {/* Accent left border stripe */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl',
          'bg-gradient-to-b',
          colors.border
        )}
      />

      <div className="pl-5 pr-5 py-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center border flex-shrink-0',
              colors.bg
            )}
          >
            <span className={cn('w-4 h-4', colors.text)}>{icon}</span>
          </div>
          <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-semibold">
            {title}
          </p>
        </div>

        {/* Content */}
        <div>{children}</div>
      </div>
    </motion.div>
  );
}
