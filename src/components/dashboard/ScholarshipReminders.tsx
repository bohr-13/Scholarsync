'use client';

import { motion } from 'framer-motion';
import { GraduationCap, ArrowRight, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useScholarships } from '@/hooks/useScholarships';
import { formatRelativeDate } from '@/lib/utils';
import TiltCard from '@/components/shared/TiltCard';

export default function ScholarshipReminders() {
  const { scholarships, isLoading } = useScholarships();

  // Show top 3 by nearest deadline
  const activeScholarships = scholarships.slice(0, 3);

  return (
    <TiltCard className="p-6 h-full flex flex-col justify-between" intensity={2}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
                Scholarships
              </h3>
              <p className="text-[10px] dark:text-slate-500 text-slate-400">
                Matching your profile
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-200/50 dark:bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : activeScholarships.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">No matching scholarships found right now.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {activeScholarships.map((sch, i) => (
              <motion.div
                key={sch.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start justify-between p-3 rounded-xl border border-white/[0.04] dark:bg-white/[0.01] bg-slate-50 gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold dark:text-slate-200 text-slate-800 truncate">
                    {sch.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{sch.provider}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[9px] dark:text-slate-400 text-slate-500 font-medium">
                    <span className="text-amber-400 font-semibold">{formatRelativeDate(sch.deadline)}</span>
                    <span>•</span>
                    <span>{sch.requiredDocuments.length} docs required</span>
                  </div>
                </div>

                {/* Amount badge */}
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg shrink-0">
                  <Wallet className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400 font-mono">
                    {sch.amount.split('/')[0]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/[0.05] flex justify-end">
        <Link
          href="/scholarships"
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
        >
          <span>Match Profile Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </TiltCard>
  );
}
