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
          'relative rounded-2xl transition-all duration-300 overflow-hidden',
          'border bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-xl',
          isFocused
            ? 'border-blue-500/30 shadow-[0_0_30px_-5px_rgba(59,130,246,0.15)]'
            : 'border-white/[0.06] dark:border-white/[0.06]'
        )}
      >
        <div className="absolute top-4 left-4 pointer-events-none">
          <Type className={cn(
            'w-4 h-4 transition-colors duration-300',
            isFocused ? 'text-blue-400' : 'text-slate-500'
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
            'w-full bg-transparent text-sm text-slate-200 dark:text-slate-200 placeholder-slate-500',
            'p-4 pl-10 resize-none outline-none',
            'leading-relaxed'
          )}
        />

        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.04]">
          <p className="text-xs text-slate-500">
            Ctrl + Enter to analyze
          </p>
          <p className={cn(
            'text-xs tabular-nums transition-colors duration-200',
            text.length > 5000 ? 'text-amber-400' : 'text-slate-500'
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
          'transition-all duration-300',
          text.trim().length > 0
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/20'
            : 'bg-white/[0.04] text-slate-500 cursor-not-allowed border border-white/[0.06]'
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
