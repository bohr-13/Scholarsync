'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  DollarSign,
  AlertTriangle,
  Tag,
  Zap,
  FileCheck,
  ListOrdered,
  Plus,
  RefreshCw,
  Clock,
  CheckSquare,
  Sparkles,
  Smile,
  ShieldCheck,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';
import { cn } from '@/lib/utils';
import { formatRelativeDate, getUrgencyColor, getUrgencyBg } from '@/lib/utils';
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/constants';
import type { ExtractionResult as ExtractionResultType, StudyPlan } from '@/types';
import StudyPlanner from '@/components/scan/StudyPlanner';
import IntelligenceCard from '@/components/scan/IntelligenceCard';
import DeadlineTimeline from '@/components/scan/DeadlineTimeline';
import { useTasks } from '@/hooks/useTasks';
import { useTodos } from '@/hooks/useTodos';

interface ExtractionResultProps {
  result: ExtractionResultType;
  onAddToDashboard?: () => void;
  onScanAnother?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ExtractionResult({
  result,
  onAddToDashboard,
  onScanAnother,
}: ExtractionResultProps) {
  const [checkedDocs, setCheckedDocs] = useState<Set<number>>(new Set());
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [todoAdded, setTodoAdded] = useState(false);
  const { createList } = useTodos();
  const { tasks } = useTasks();

  const handleAddToTodo = async () => {
    if (!studyPlan) return;
    
    // Group tasks by day in chronological order for premium presentation
    const initialTasks = studyPlan.days.flatMap((day) => 
      day.tasks.map((taskText) => ({
        text: `Day ${day.day}: ${taskText}`,
        completed: false,
      }))
    );

    const listId = await createList(
      studyPlan.title,
      `AI Generated Study Plan from: ${result.title}`,
      'ai-plan',
      initialTasks,
      result.id
    );

    if (listId) {
      setTodoAdded(true);
      setTimeout(() => setTodoAdded(false), 3000);
    }
  };

  const toggleDoc = (index: number) => {
    setCheckedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Document checklist completion progress
  const completionPercentage = useMemo(() => {
    const total = result.requiredDocuments?.length || 0;
    if (total === 0) return 0;
    return Math.round((checkedDocs.size / total) * 100);
  }, [result.requiredDocuments, checkedDocs]);

  const priorityColorMap: Record<string, string> = {
    critical: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    medium: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    low: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  };

  const glowColorMap: Record<string, string> = {
    critical: 'rgba(244, 63, 94, 0.12)',
    high: 'rgba(245, 158, 11, 0.10)',
    medium: 'rgba(59, 130, 246, 0.10)',
    low: undefined as unknown as string,
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full space-y-6"
    >
      {/* ── Calming emotional banner ── */}
      {result.emotionalContext === 'stressful' && (
        <motion.div
          variants={itemVariants}
          className="p-4.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-500/20 backdrop-blur-[var(--blur-xl)] flex items-center justify-between gap-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
              <Smile className="w-5 h-5 text-blue-400 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-300">Take a breath.</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                ScholarSync automatically parsed and organized this notice to ease your academic load.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Hero Notice Card ── */}
      <motion.div variants={itemVariants}>
        <TiltCard
          className="p-6 lg:p-7 relative overflow-hidden"
          glowColor={glowColorMap[result.priority]}
          intensity={3}
        >
          {/* Subtle glowing radial background */}
          <div className="absolute right-0 top-0 w-36 h-36 rounded-full bg-[#3B82F6]/5 blur-3xl pointer-events-none" />
          
          <div className="flex items-start gap-4">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border', priorityColorMap[result.priority])}>
              <FileCheck className={cn('w-6 h-6', getUrgencyColor(result.priority))} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border',
                  priorityColorMap[result.priority]
                )}>
                  {PRIORITY_LABELS[result.priority]}
                </span>
                {result.department && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-[#9CA3AF] bg-[#0F172A] border border-[#1F2937]">
                    {result.department}
                  </span>
                )}
                {result.noticeType && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-[#9CA3AF] bg-[#0F172A] border border-[#1F2937] capitalize">
                    {result.noticeType}
                  </span>
                )}
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-[#E5E7EB] mb-2.5 tracking-tight">{result.title}</h2>
              <p className="text-sm text-[#9CA3AF] leading-relaxed font-medium">{result.summary}</p>
              
              {result.issuingAuthority && (
                <p className="text-[10px] text-[#9CA3AF]/60 font-semibold uppercase tracking-wider mt-4">
                  Issued by: {result.issuingAuthority}
                </p>
              )}
            </div>
          </div>
        </TiltCard>
      </motion.div>

      {/* ── Centerpiece "Explain Simply" Magic Card ── */}
      {result.studentFriendlyExplanation && (
        <motion.div variants={itemVariants}>
          <IntelligenceCard
            icon={<Sparkles className="w-4.5 h-4.5 text-[#3B82F6] animate-pulse" />}
            title="Explain Simply"
            accentColor="blue"
            glowIntensity="medium"
          >
            <div className="relative">
              <p className="text-sm text-[#E5E7EB] leading-relaxed font-medium italic pl-3 border-l-2 border-[#3B82F6]/30">
                "{result.studentFriendlyExplanation}"
              </p>
            </div>
          </IntelligenceCard>
        </motion.div>
      )}

      {/* ── Attendance Impact Warning ── */}
      {result.attendanceImpact && (
        <motion.div variants={itemVariants}>
          <IntelligenceCard
            icon={<AlertTriangle className="w-4.5 h-4.5 text-rose-400" />}
            title="Attendance Impact"
            accentColor="rose"
            glowIntensity="high"
          >
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-rose-200 leading-relaxed">
                {result.attendanceImpact}
              </p>
            </div>
          </IntelligenceCard>
        </motion.div>
      )}

      {/* ── Main Deadline & Tasks Timeline ── */}
      {(result.deadline || (result.taskCards && result.taskCards.length > 0)) && (
        <motion.div variants={itemVariants}>
          <IntelligenceCard
            icon={<Clock className="w-4.5 h-4.5 text-indigo-400" />}
            title="Deadline Timeline & Tasks"
            accentColor="indigo"
            glowIntensity="medium"
          >
            <div className="py-2 pr-2">
              <DeadlineTimeline
                deadline={result.deadline}
                taskCards={result.taskCards || []}
              />
            </div>
          </IntelligenceCard>
        </motion.div>
      )}

      {/* ── Fee Breakdown ── */}
      {result.fees && result.fees.length > 0 && (
        <motion.div variants={itemVariants}>
          <IntelligenceCard
            icon={<DollarSign className="w-4.5 h-4.5 text-[#10B981]" />}
            title="Fee Breakdown"
            accentColor="emerald"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.fees.map((fee, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#111827] border border-[#1F2937] hover:bg-[#111827]/80 transition-all duration-300"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#E5E7EB]">{fee.label}</p>
                    <span className={cn(
                      'text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block',
                      fee.type === 'mandatory' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                      fee.type === 'fine' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                      fee.type === 'refundable' ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20' :
                      'text-[#9CA3AF] bg-[#0F172A] border border-[#1F2937]'
                    )}>
                      {fee.type}
                    </span>
                  </div>
                  <span className="text-base font-bold text-[#10B981] font-mono">{fee.amount}</span>
                </div>
              ))}
            </div>
          </IntelligenceCard>
        </motion.div>
      )}

      {/* ── Document Checklist ── */}
      {result.requiredDocuments && result.requiredDocuments.length > 0 && (
        <motion.div variants={itemVariants}>
          <IntelligenceCard
            icon={<CheckSquare className="w-4.5 h-4.5 text-violet-400" />}
            title="Required Documents"
            accentColor="violet"
          >
            <div className="flex flex-col md:flex-row items-center gap-6 p-1">
              {/* Circular progress SVG */}
              <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#1F2937]"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    className="text-violet-400"
                    strokeWidth="2.5"
                    strokeDasharray={`${completionPercentage}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    initial={{ strokeDasharray: '0, 100' }}
                    animate={{ strokeDasharray: `${completionPercentage}, 100` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-violet-300 font-mono">
                    {completionPercentage}%
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-[#9CA3AF] font-semibold">
                    Done
                  </span>
                </div>
              </div>

              {/* Document list */}
              <div className="flex-1 w-full space-y-2">
                {result.requiredDocuments.map((doc, i) => (
                  <motion.label
                    key={i}
                    className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-[#0B0F19] border border-transparent hover:border-[#1F2937] transition-all duration-200"
                    whileHover={{ x: 2 }}
                  >
                    <button
                      onClick={() => toggleDoc(i)}
                      className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200',
                        checkedDocs.has(i)
                          ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                          : 'border-[#1F2937] group-hover:border-[#3B82F6]/30'
                      )}
                    >
                      {checkedDocs.has(i) && (
                        <motion.svg
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-3 h-3"
                          viewBox="0 0 12 12"
                        >
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2 6l3 3 5-5"
                          />
                        </motion.svg>
                      )}
                    </button>
                    <span
                      className={cn(
                        'text-sm font-medium transition-all duration-200',
                        checkedDocs.has(i)
                          ? 'text-[#9CA3AF] line-through'
                          : 'text-[#E5E7EB]/90 group-hover:text-[#E5E7EB]'
                      )}
                    >
                      {doc}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>
          </IntelligenceCard>
        </motion.div>
      )}

      {/* ── AI Recommendations ── */}
      {result.recommendations && result.recommendations.length > 0 && (
        <motion.div variants={itemVariants}>
          <IntelligenceCard
            icon={<Sparkles className="w-4.5 h-4.5 text-amber-400" />}
            title="ScholarSync Action Plan"
            accentColor="amber"
          >
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-xl">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-amber-400">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[#E5E7EB]/90 leading-relaxed pt-0.5 font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </IntelligenceCard>
        </motion.div>
      )}

      {/* ── Study Planner ── */}
      <motion.div variants={itemVariants}>
        <StudyPlanner
          title={result.title}
          summary={result.summary}
          deadline={result.deadline}
          onPlanChange={setStudyPlan}
        />
      </motion.div>

      {/* ── Main Actions Buttons ── */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 pt-4">
        <motion.button
          onClick={onAddToDashboard}
          className={cn(
            'flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm',
            'flex items-center justify-center gap-2',
            'bg-[#3B82F6] text-white',
            'hover:bg-[#2563EB]',
            'shadow-lg',
            'transition-all duration-300'
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="w-4 h-4" />
          Add to Dashboard
        </motion.button>

        {/* ── Add to TODO button (enabled only when plan exists) ── */}
        {studyPlan && (
          <motion.button
            onClick={handleAddToTodo}
            className={cn(
              'flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm border',
              'flex items-center justify-center gap-2',
              'bg-indigo-600/10 border-indigo-500/30 text-indigo-300',
              'hover:bg-indigo-600/20 hover:shadow-[var(--shadow-lg)] hover:border-indigo-500/50',
              'transition-all duration-300'
            )}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle2 className={cn("w-4 h-4", todoAdded ? "text-emerald-400" : "text-indigo-400")} />
            {todoAdded ? 'Added to TODO!' : '+ Add to TODO'}
          </motion.button>
        )}

        <motion.button
          onClick={onScanAnother}
          className={cn(
            'py-3.5 px-6 rounded-xl font-semibold text-sm',
            'flex items-center justify-center gap-2',
            'bg-[#111827] border border-[#1F2937] text-[#E5E7EB]',
            'hover:bg-[#111827]/80 hover:border-[#3B82F6]/30',
            'transition-all duration-300'
          )}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <RefreshCw className="w-4 h-4" />
          Scan Another
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
