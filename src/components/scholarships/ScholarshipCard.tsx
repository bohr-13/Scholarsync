'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  ExternalLink,
  FileText,
  Award,
  Building2,
  Bookmark,
} from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';
import { cn } from '@/lib/utils';
import { formatRelativeDate, formatDate } from '@/lib/utils';
import type { Scholarship } from '@/types';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  index?: number;
  isSaved?: boolean;
  onToggleSave?: () => void;
  showSaveButton?: boolean;
}

export default function ScholarshipCard({
  scholarship,
  index = 0,
  isSaved = false,
  onToggleSave,
  showSaveButton = true,
}: ScholarshipCardProps) {
  const daysLeft = useMemo(() => {
    const now = new Date();
    const deadline = new Date(scholarship.deadline);
    const diff = deadline.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [scholarship.deadline]);

  const urgency =
    daysLeft <= 7 ? 'critical' : daysLeft <= 15 ? 'soon' : 'comfortable';

  const urgencyConfig = {
    critical: { color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20 shadow-[var(--shadow-md)]' },
    soon: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    comfortable: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="h-full"
    >
      <TiltCard className="p-5 h-full flex flex-col justify-between border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl hover:bg-[var(--glass-bg)]/80 transition-all duration-300 relative group overflow-hidden" intensity={4}>
        {/* Subtle hover glow effect */}
        <div className="absolute -inset-px bg-gradient-to-r from-[#3B82F6]/10 to-violet-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug mb-1.5 line-clamp-2 group-hover:text-[#3B82F6] transition-colors">
                {scholarship.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Building2 className="w-3 h-3 flex-shrink-0 text-violet-400" />
                <span className="truncate">{scholarship.provider}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {/* Amount badge */}
              <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-black bg-[var(--accent-blue)]/10 border border-[#3B82F6]/30 text-[#3B82F6]">
                {scholarship.amount}
              </span>

              {/* Bookmark Button */}
              {showSaveButton && onToggleSave && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleSave();
                  }}
                  className={cn(
                    "p-1.5 rounded-lg border text-[var(--text-secondary)] transition-all duration-300",
                    isSaved
                      ? "bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-[var(--shadow-md)]"
                      : "bg-[var(--glass-surface)] border border-[var(--glass-border)] hover:border-[#3B82F6]/30 hover:text-[var(--text-primary)]"
                  )}
                  title={isSaved ? "Unsave Scholarship" : "Save Scholarship"}
                >
                  <Bookmark className={cn("w-3.5 h-3.5", isSaved && "fill-current")} />
                </button>
              )}
            </div>
          </div>

          {/* Urgency / Deadline Badge */}
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border mb-4 relative z-10 transition-all duration-300',
            urgencyConfig[urgency].bg
          )}>
            <Clock className={cn('w-3.5 h-3.5 animate-pulse', urgencyConfig[urgency].color)} />
            <span className={cn('text-xs font-semibold', urgencyConfig[urgency].color)}>
              {formatRelativeDate(scholarship.deadline)}
            </span>
            <span className="text-xs text-[var(--text-secondary)] ml-auto">
              {formatDate(scholarship.deadline)}
            </span>
          </div>

          {/* Description */}
          {scholarship.description && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-3 relative z-10">
              {scholarship.description}
            </p>
          )}

          {/* Tags */}
          {scholarship.tags && scholarship.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
              {scholarship.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-[var(--accent-blue)]/10 border border-[#3B82F6]/20 text-[10px] font-medium text-[#3B82F6] hover:bg-[var(--accent-blue)]/20 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Eligibility summary */}
          <div className="space-y-2 mb-4 relative z-10">
            <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Eligibility</p>
            <div className="flex flex-wrap gap-1.5">
              {scholarship.eligibility.categories.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-[10px] font-medium text-violet-300"
                >
                  {cat}
                </span>
              ))}
              {scholarship.eligibility.gender !== 'all' && (
                <span className="px-2 py-0.5 rounded-md bg-pink-500/10 border border-pink-500/20 text-[10px] font-medium text-pink-300 capitalize">
                  {scholarship.eligibility.gender}
                </span>
              )}
              {scholarship.eligibility.states.map((state) => (
                <span
                  key={state}
                  className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-medium text-cyan-300"
                >
                  {state}
                </span>
              ))}
            </div>
            {scholarship.eligibility.incomeLimit && (
              <p className="text-[11px] text-[var(--text-secondary)]">
                Income Limit: <span className="text-[var(--text-primary)]/90 font-medium">{scholarship.eligibility.incomeLimit}</span>
              </p>
            )}
          </div>

          {/* Required Documents */}
          {scholarship.requiredDocuments && scholarship.requiredDocuments.length > 0 && (
            <div className="mb-5 relative z-10">
              <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold mb-2">Documents</p>
              <div className="flex flex-wrap gap-1.5">
                {scholarship.requiredDocuments.slice(0, 3).map((doc) => (
                  <span
                    key={doc}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[10px] text-[var(--text-secondary)]"
                  >
                    <FileText className="w-2.5 h-2.5 text-[var(--text-secondary)]/60" />
                    <span className="truncate max-w-[120px]">{doc}</span>
                  </span>
                ))}
                {scholarship.requiredDocuments.length > 3 && (
                  <span className="px-2 py-0.5 rounded-md bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[10px] text-[var(--text-secondary)]/60 font-medium">
                    +{scholarship.requiredDocuments.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Match percentage */}
          {scholarship.matchPercentage !== undefined && (
            <div className="mb-5 relative z-10 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Eligibility Match</p>
                <p className="text-xs font-black text-emerald-400">{scholarship.matchPercentage}%</p>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${scholarship.matchPercentage}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Apply button */}
        <a
          href={scholarship.applicationLink || scholarship.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'w-full py-2.5 px-4 rounded-xl text-sm font-semibold relative z-10',
            'flex items-center justify-center gap-2',
            'bg-[var(--accent-blue)] text-white',
            'hover:brightness-110',
            'shadow-[var(--shadow-md)]',
            'active:scale-95',
            'transition-all duration-300'
          )}
        >
          <Award className="w-4 h-4" />
          Apply Now
          <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-70" />
        </a>
      </TiltCard>
    </motion.div>
  );
}
