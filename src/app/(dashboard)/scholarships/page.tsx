'use client';

import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

export default function ScholarshipsPage() {
  return (
    <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center mx-auto shadow-[var(--shadow-lg)]">
          <GraduationCap className="w-10 h-10 text-[var(--accent-blue)]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Scholarship Matcher
          </h1>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Coming soon — we&apos;re building an intelligent scholarship matching engine tailored for Indian students. Stay tuned.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
