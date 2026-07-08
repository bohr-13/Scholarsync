'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TextInputProps {
  onSubmit: (text: string) => void;
}

export default function TextInput({ onSubmit }: TextInputProps) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = () => {
    if (text.trim().length > 0) {
      onSubmit(text.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={cn(
          'relative rounded-2xl transition-all duration-[350ms] ease-glass overflow-hidden',
          'glass',
          isFocused
            ? 'border-[var(--glass-border-accent)] shadow-[var(--shadow-md)]'
            : ''
        )}
      >
        <div className="absolute top-4 left-4 pointer-events-none">
          <Type className={cn(
            'w-4 h-4 transition-colors duration-300',
            isFocused ? 'text-[var(--accent-blue)]' : 'text-[var(--text-secondary)]'
          )} />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your notice, circular, or announcement text here..."
          rows={10}
          className={cn(
            'w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50',
            'p-4 pl-10 resize-none outline-none',
            'leading-relaxed'
          )}
        />

        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--glass-border)]">
          <p className="text-xs text-[var(--text-secondary)]">
            Ctrl + Enter to analyze
          </p>
          <p className={cn(
            'text-xs tabular-nums transition-colors duration-200',
            text.length > 5000 ? 'text-amber-400' : 'text-[var(--text-secondary)]'
          )}>
            {text.length.toLocaleString()} characters
          </p>
        </div>
      </div>

      <motion.button
        onClick={handleSubmit}
        disabled={text.trim().length === 0}
        className={cn(
          'w-full py-3.5 px-6 rounded-xl font-medium text-sm',
          'flex items-center justify-center gap-2',
          'transition-all duration-[350ms] ease-glass',
          text.trim().length > 0
            ? 'bg-[var(--accent-blue)] text-white hover:brightness-110 shadow-[var(--shadow-md)]'
            : 'bg-[var(--glass-surface)] text-[var(--text-secondary)] cursor-not-allowed border border-[var(--glass-border)]'
        )}
        whileHover={text.trim().length > 0 ? { scale: 1.01 } : {}}
        whileTap={text.trim().length > 0 ? { scale: 0.99 } : {}}
      >
        <Sparkles className="w-4 h-4" />
        Analyze Text
      </motion.button>
    </div>
  );
}
