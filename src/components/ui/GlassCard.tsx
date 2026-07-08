'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type GlassIntensity = 'light' | 'default' | 'heavy';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  intensity?: GlassIntensity;
  onClick?: () => void;
}

const intensityStyles: Record<GlassIntensity, string> = {
  light: 'glass-light rounded-2xl',
  default: 'glass rounded-2xl',
  heavy: 'glass-heavy rounded-2xl',
};

export function GlassCard({
  children,
  className,
  hover = true,
  intensity = 'default',
  onClick,
}: GlassCardProps) {
  const base = intensityStyles[intensity];
  const interactive = hover || onClick;

  return (
    <motion.div
      className={cn(base, interactive && 'cursor-pointer transition-all duration-[350ms] ease-glass hover:bg-[var(--glass-surface-hover)] hover:border-[var(--glass-border-hover)] hover:shadow-[var(--shadow-lg)] hover:-translate-y-[1px]', className)}
      whileHover={interactive ? { y: -1 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
