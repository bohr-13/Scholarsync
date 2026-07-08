'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface GlassButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-blue)] text-white hover:brightness-110 active:brightness-95 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] border border-transparent',
  secondary:
    'bg-[var(--glass-surface)] text-[var(--text-secondary)] border border-[var(--glass-border)] hover:bg-[var(--glass-surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--glass-surface)] hover:text-[var(--text-primary)] border border-transparent',
  danger:
    'bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:bg-rose-500/25 hover:border-rose-500/40 shadow-[var(--shadow-sm)]',
  icon:
    'bg-[var(--glass-surface)] text-[var(--text-secondary)] border border-[var(--glass-border)] hover:bg-[var(--glass-surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
};

export function GlassButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-[350ms] ease-glass outline-none focus-visible:shadow-[0_0_0_4px_rgba(59,130,246,0.15)] focus-visible:border-[var(--accent-blue)]',
        variantStyles[variant],
        sizeStyles[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
}
