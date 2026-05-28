'use client';

import { motion } from 'framer-motion';

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <SkeletonPulse className="h-4 w-3/4 rounded-lg" />
          <SkeletonPulse className="h-3 w-1/2 rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonPulse className="h-3 w-full rounded-lg" />
        <SkeletonPulse className="h-3 w-5/6 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonPulse({ className }: { className?: string }) {
  return (
    <motion.div
      className={`bg-white/[0.06] ${className}`}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
