'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  AlertTriangle,
  FileCheck,
  Plus,
  RefreshCw,
  Clock,
  CheckSquare,
  Sparkles,
  Smile,
  Heart,
  CheckCircle2,
} from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';
import { cn, getUrgencyColor } from '@/lib/utils';
import { PRIORITY_LABELS } from '@/lib/constants';
import type { ExtractionResult as ExtractionResultType, StudyPlan } from '@/types';
import StudyPlanner from '@/components/scan/StudyPlanner';
import IntelligenceCard from '@/components/scan/IntelligenceCard';
import DeadlineTimeline from '@/components/scan/DeadlineTimeline';
import { useEmergencyMode } from '@/components/providers/EmergencyProvider';
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
  const { emergency, toggleEmergency } = useEmergencyMode();

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

  // Schedule Overload and Conflict Detection (Multi-notice Intelligence)
  const overloadInfo = useMemo(() => {
    if (!result.deadline) return null;
    
    const newDeadline = new Date(result.deadline);
    const timeWindow = 3 * 24 * 60 * 60 * 1000; // 3 days overlap window
    
    // Find conflicting tasks due around the same time
    const conflictingTasks = tasks.filter(task => {
      if (task.status === 'completed') return false;
      const taskDeadline = new Date(task.deadline);
      return Math.abs(taskDeadline.getTime() - newDeadline.getTime()) <= timeWindow;
    });

    // Find total urgent tasks due in the next 5 days
    const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const urgentTasksCount = tasks.filter(task => {
      if (task.status === 'completed') return false;
      const taskDeadline = new Date(task.deadline);
      return taskDeadline > new Date() && taskDeadline <= fiveDaysFromNow;
    }).length;

    const isOverloaded = urgentTasksCount >= 3;
    const hasConflict = conflictingTasks.length > 0;

    return {
      isOverloaded,
      hasConflict,
      conflictingTasks,
      urgentTasksCount,
    };
  }, [result.deadline, tasks]);

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
          className="p-4.5 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-blue-500/10 border border-blue-500/20 backdrop-blur-xl flex items-center justify-between gap-4 shadow-lg shadow-blue-500/5"
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

      {/* ── Schedule Conflict & Overload (Emergency Mode) alert ── */}
      {overloadInfo && (overloadInfo.isOverloaded || overloadInfo.hasConflict) && (
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl relative overflow-hidden shadow-lg shadow-indigo-500/5"
        >
          {/* Animated gradient light in card background */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl animate-pulse pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <h4 className="text-sm font-bold text-indigo-300">
                  {overloadInfo.isOverloaded 
                    ? `Schedule Overload: ${overloadInfo.urgentTasksCount} Urgent Deadlines Detected`
                    : 'Schedule Conflict Identified'}
                </h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                {overloadInfo.isOverloaded 
                  ? "You have multiple deadlines clustered within the next 5 days. ScholarSync can temporarily hide non-essential workspace widgets to help you focus."
                  : `This notice's deadline overlaps with other active assignments due near the same date (${overloadInfo.conflictingTasks.map(t => t.title).join(', ')}).`}
              </p>
            </div>
            
            <motion.button
              onClick={toggleEmergency}
              className={cn(
                'py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-300 cursor-pointer self-start md:self-auto border',
                emergency.isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30'
                  : 'bg-indigo-600 text-white border-transparent hover:bg-indigo-500 shadow-md shadow-indigo-500/10'
              )}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              {emergency.isActive ? 'Exit Focus Mode' : 'Activate Focus Mode'}
            </motion.button>
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
          <div className="absolute right-0 top-0 w-36 h-36 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          
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
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06]">
                    {result.department}
                  </span>
                )}
                {result.noticeType && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06] capitalize">
                    {result.noticeType}
                  </span>
                )}
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-slate-100 mb-2.5 tracking-tight">{result.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">{result.summary}</p>
              
              {result.issuingAuthority && (
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-4">
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
            icon={<Sparkles className="w-4.5 h-4.5 text-blue-400 animate-pulse" />}
            title="Explain Simply"
            accentColor="blue"
            glowIntensity="medium"
          >
            <div className="relative">
              <p className="text-sm text-slate-200 leading-relaxed font-medium italic pl-3 border-l-2 border-blue-500/30">
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
            icon={<DollarSign className="w-4.5 h-4.5 text-emerald-400" />}
            title="Fee Breakdown"
            accentColor="emerald"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.fees.map((fee, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all duration-300"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-200">{fee.label}</p>
                    <span className={cn(
                      'text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block',
                      fee.type === 'mandatory' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                      fee.type === 'fine' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                      fee.type === 'refundable' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
                      'text-slate-400 bg-white/[0.06] border-white/[0.1]'
                    )}>
                      {fee.type}
                    </span>
                  </div>
                  <span className="text-base font-bold text-emerald-400 font-mono">{fee.amount}</span>
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
                    className="text-white/[0.04]"
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
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold">
                    Done
                  </span>
                </div>
              </div>

              {/* Document list */}
              <div className="flex-1 w-full space-y-2">
                {result.requiredDocuments.map((doc, i) => (
                  <motion.label
                    key={i}
                    className="flex items-center gap-3 group cursor-pointer p-2 rounded-lg hover:bg-white/[0.02] border border-transparent hover:border-white/[0.04] transition-all duration-200"
                    whileHover={{ x: 2 }}
                  >
                    <button
                      onClick={() => toggleDoc(i)}
                      className={cn(
                        'w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200',
                        checkedDocs.has(i)
                          ? 'bg-violet-500/20 border-violet-500/40 text-violet-400'
                          : 'border-white/[0.1] group-hover:border-white/[0.2]'
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
                          ? 'text-slate-500 line-through'
                          : 'text-slate-300 group-hover:text-slate-200'
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
                  <p className="text-sm text-slate-300 leading-relaxed pt-0.5 font-medium">{rec}</p>
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
            'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
            'hover:from-blue-500 hover:to-indigo-500',
            'shadow-lg shadow-blue-500/20',
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
              'hover:bg-indigo-600/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] hover:border-indigo-500/50',
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
            'bg-white/[0.04] border border-white/[0.08] text-slate-300',
            'hover:bg-white/[0.06] hover:border-white/[0.12]',
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
