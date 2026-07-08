'use client';

import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type GlassInputAs = 'input' | 'textarea' | 'select';

interface GlassInputProps {
  label?: string;
  error?: string;
  icon?: ReactNode;
  className?: string;
  as?: GlassInputAs;
}

const baseInputStyle =
  'w-full bg-[var(--glass-surface)] backdrop-blur-[var(--blur-sm)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 outline-none transition-all duration-[350ms] ease-glass focus:border-[var(--glass-border-accent)] focus:shadow-[var(--shadow-sm)]';

export function GlassInput({
  label,
  error,
  icon,
  className,
  as = 'input',
  ...props
}: GlassInputProps &
  (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement> | SelectHTMLAttributes<HTMLSelectElement>)) {
  const id = (props as Record<string, unknown>).id as string | undefined || (props as Record<string, unknown>).name as string | undefined;

  const inputElement = () => {
    switch (as) {
      case 'textarea':
        return (
          <textarea
            className={cn(baseInputStyle, 'min-h-[100px] resize-y py-3', icon && 'pl-10', className)}
            id={id}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        );
      case 'select':
        return (
          <select
            className={cn(baseInputStyle, 'appearance-none cursor-pointer', icon && 'pl-10', className)}
            id={id}
            {...(props as SelectHTMLAttributes<HTMLSelectElement>)}
          />
        );
      default:
        return (
          <input
            className={cn(baseInputStyle, icon && 'pl-10', className)}
            id={id}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none">
            {icon}
          </div>
        )}
        {inputElement()}
      </div>
      {error && (
        <p className="text-xs text-rose-400 mt-0.5">{error}</p>
      )}
    </div>
  );
}
