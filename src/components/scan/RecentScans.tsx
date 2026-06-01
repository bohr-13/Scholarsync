import { motion } from 'framer-motion';
import { Clock, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentScansProps {
  recentNotices: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  onSelectNotice: (notice: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  onDeleteNotice: (noticeId: string, e: React.MouseEvent) => void;
}

export default function RecentScans({
  recentNotices,
  onSelectNotice,
  onDeleteNotice,
}: RecentScansProps) {
  if (!recentNotices || recentNotices.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4 pt-4"
    >
      <div className="flex items-center gap-2 text-slate-400">
        <Clock className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs uppercase tracking-wider font-bold">Recent Notice Scans</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recentNotices.map((notice) => (
          <motion.div
            key={notice.id}
            onClick={() => onSelectNotice(notice)}
            className={cn(
              'group relative cursor-pointer p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]',
              'hover:bg-white/[0.04] hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/[0.02]',
              'transition-all duration-300 flex flex-col justify-between h-32'
            )}
            whileHover={{ y: -2 }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={cn(
                  'text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border',
                  notice.priority === 'critical' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                  notice.priority === 'high' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                  'text-blue-400 bg-blue-500/10 border-blue-500/20'
                )}>
                  {notice.priority}
                </span>
                <button
                  onClick={(e) => onDeleteNotice(notice.id, e)}
                  className="text-slate-600 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-all duration-200"
                  aria-label="Delete scan record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-blue-300 transition-colors">
                {notice.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                {notice.summary}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-2 border-t border-white/[0.04] mt-2">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" />
                {notice.source.toUpperCase()}
              </span>
              <span>
                {new Date(notice.extractedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
