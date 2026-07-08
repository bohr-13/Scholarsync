'use client';

import { motion } from 'framer-motion';
import { UploadCloud, FileText, Image as ImageIcon, AlignLeft, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import TiltCard from '@/components/shared/TiltCard';
import { useScannedNotices } from '@/hooks/useScannedNotices';
import { formatRelativeDate } from '@/lib/utils';

const sourceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  image: ImageIcon,
  text: AlignLeft,
};

export default function RecentUploads() {
  const { notices, isLoading } = useScannedNotices();
  const recentNotices = notices.slice(0, 3);

  return (
    <TiltCard className="p-6 h-full flex flex-col justify-between" intensity={3}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <UploadCloud className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Recent AI Scans
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Uploaded notices processed
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3.5">
            {[1,2,3].map(i => <div key={i} className="h-14 rounded-xl bg-[var(--glass-surface)] animate-pulse" />)}
          </div>
        ) : recentNotices.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-xs text-[var(--text-secondary)]">No scanned notices yet. Try scanning one! 📄</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {recentNotices.map((notice, i) => {
              const Icon = sourceIcons[notice.source] || FileText;

              return (
                <motion.div
                  key={notice.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-surface)] hover:bg-[var(--glass-bg)] transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-[var(--glass-border)] shrink-0">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">
                      {notice.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1 text-[9px] text-[var(--text-secondary)]">
                      <span className="capitalize">{notice.source}</span>
                      <span>{notice.extractedAt ? formatRelativeDate(notice.extractedAt) : ''}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-[var(--glass-border)] flex justify-between items-center text-xs">
        <span className="flex items-center gap-1 text-[10px] text-[var(--success)] font-semibold font-mono">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Gemini extraction active</span>
        </span>
        <Link
          href="/scan"
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
        >
          <span>Scan Notice</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </TiltCard>
  );
}
