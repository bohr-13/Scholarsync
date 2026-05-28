'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Award, Sparkles, TrendingUp, Info, AlertCircle, CheckCircle } from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';
import { useGpa } from '@/hooks/useGpa';
import type { GpaSubject } from '@/types';

const GRADE_POINTS: Record<string, number> = {
  S: 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0,
};

const DEFAULT_SUBJECTS: GpaSubject[] = [
  { id: '1', name: 'Mathematics', credits: 4, grade: 'A' },
  { id: '2', name: 'Computer Networks', credits: 3, grade: 'B' },
  { id: '3', name: 'Software Engineering', credits: 3, grade: 'S' },
  { id: '4', name: 'Database Lab', credits: 2, grade: 'A' },
];

export default function GpaCalculator() {
  const { gpaState, isLoading, updateGpaState } = useGpa();

  const subjects = gpaState?.subjects || DEFAULT_SUBJECTS;
  const currentCgpa = gpaState?.currentCgpa || '';
  const completedSemesters = gpaState?.completedSemesters || 0;
  const targetCgpa = gpaState?.targetCgpa || '';
  const totalSemesters = gpaState?.totalSemesters || 8;

  // Add Subject Row
  const addSubject = () => {
    const newId = (Math.max(0, ...subjects.map(s => parseInt(s.id) || 0)) + 1).toString();
    updateGpaState({
      subjects: [
        ...subjects,
        { id: newId, name: `Subject ${newId}`, credits: 3, grade: 'A' }
      ]
    });
  };

  // Remove Subject Row
  const removeSubject = (id: string) => {
    if (subjects.length <= 1) return;
    updateGpaState({
      subjects: subjects.filter((s) => s.id !== id)
    });
  };

  // Update Field
  const updateSubject = (id: string, field: keyof GpaSubject, value: any) => {
    updateGpaState({
      subjects: subjects.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    });
  };

  // Compute SGPA
  const sgpaResult = useMemo(() => {
    let totalCredits = 0;
    let weightedPoints = 0;

    subjects.forEach((s) => {
      const gp = GRADE_POINTS[s.grade] ?? 0;
      totalCredits += s.credits;
      weightedPoints += s.credits * gp;
    });

    if (totalCredits === 0) return 0;
    return parseFloat((weightedPoints / totalCredits).toFixed(2));
  }, [subjects]);

  // Compute CGPA target predictions
  const targetPrediction = useMemo(() => {
    const current = parseFloat(currentCgpa);
    const target = parseFloat(targetCgpa);

    if (
      isNaN(current) ||
      isNaN(target) ||
      completedSemesters <= 0 ||
      completedSemesters >= totalSemesters
    ) {
      return null;
    }

    const remainingSemesters = totalSemesters - completedSemesters;
    const currentTotalPoints = current * completedSemesters;
    const targetTotalPoints = target * totalSemesters;
    const neededPoints = targetTotalPoints - currentTotalPoints;
    const neededAverageSgpa = parseFloat((neededPoints / remainingSemesters).toFixed(2));

    let feasibility: 'achievable' | 'demanding' | 'impossible' = 'achievable';
    let message = '';

    if (neededAverageSgpa > 10) {
      feasibility = 'impossible';
      message = 'This target is mathematically impossible because the required average SGPA exceeds a perfect 10.0.';
    } else if (neededAverageSgpa > 9.0) {
      feasibility = 'demanding';
      message = 'Highly demanding! You will need nearly perfect grades (mostly S and A) to hit this target.';
    } else if (neededAverageSgpa < 5.0) {
      feasibility = 'achievable';
      message = 'Very comfortable! You are in an excellent position to achieve this target.';
    } else {
      feasibility = 'achievable';
      message = 'Achievable with consistent preparation. Focus on high-credit courses.';
    }

    return {
      neededSgpa: neededAverageSgpa,
      remaining: remainingSemesters,
      feasibility,
      message,
    };
  }, [currentCgpa, completedSemesters, targetCgpa, totalSemesters]);

  // Gauge calculation
  const gaugePercent = (sgpaResult / 10) * 100;
  const strokeDashoffset = 440 - (440 * (gaugePercent > 100 ? 100 : gaugePercent)) / 100;

  const getGaugeColor = (val: number) => {
    if (val >= 9) return 'stroke-emerald-500';
    if (val >= 7.5) return 'stroke-blue-500';
    if (val >= 6) return 'stroke-amber-500';
    return 'stroke-rose-500';
  };

  const getFeasibilityStyles = (type: string) => {
    switch (type) {
      case 'impossible':
        return {
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-300',
          icon: AlertCircle,
          badge: 'bg-rose-500/20 border border-rose-500/40 text-rose-400',
          label: 'Impossible',
        };
      case 'demanding':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
          icon: Info,
          badge: 'bg-amber-500/20 border border-amber-500/40 text-amber-400',
          label: 'Highly Demanding',
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
          icon: CheckCircle,
          badge: 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400',
          label: 'Achievable',
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Intro */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight">GPA Predictor</h1>
        <p className="text-sm dark:text-slate-400 text-slate-500">
          Calculate your semester SGPA and forecast your targets to stay ahead of academic requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GPA Input Panel */}
        <div className="lg:col-span-2 space-y-6">
          <TiltCard className="p-5 lg:p-6" intensity={2}>
            <div className="flex items-center justify-between mb-5 border-b border-white/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-200">Semester SGPA Calculator</h3>
              </div>
              <button
                onClick={addSubject}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-slate-200 transition duration-200 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Course
              </button>
            </div>

            {/* Subjects Table/Grid */}
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                <div className="col-span-6 md:col-span-7">Course / Subject Name</div>
                <div className="col-span-3 md:col-span-2 text-center">Credits</div>
                <div className="col-span-3 md:col-span-2 text-center">Expected Grade</div>
                <div className="hidden md:block md:col-span-1 text-center">Delete</div>
              </div>

              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {subjects.map((sub) => (
                  <motion.div
                    key={sub.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="grid grid-cols-12 gap-3 items-center p-2 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                  >
                    {/* Name */}
                    <div className="col-span-6 md:col-span-7">
                      <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => updateSubject(sub.id, 'name', e.target.value)}
                        className="w-full text-xs bg-transparent border-0 border-b border-transparent focus:border-blue-500/50 text-slate-200 p-1 focus:outline-none transition"
                        placeholder="e.g. Physics"
                      />
                    </div>

                    {/* Credits */}
                    <div className="col-span-3 md:col-span-2 flex items-center justify-center">
                      <select
                        value={sub.credits}
                        onChange={(e) => updateSubject(sub.id, 'credits', parseInt(e.target.value) || 3)}
                        className="bg-slate-900 border border-white/[0.08] rounded-lg text-xs text-center text-slate-300 p-1.5 focus:outline-none focus:border-blue-500 w-16"
                      >
                        {[1, 2, 3, 4, 5, 6].map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Grade */}
                    <div className="col-span-3 md:col-span-2 flex items-center justify-center">
                      <select
                        value={sub.grade}
                        onChange={(e) => updateSubject(sub.id, 'grade', e.target.value)}
                        className="bg-slate-900 border border-white/[0.08] rounded-lg text-xs text-center text-slate-300 p-1.5 focus:outline-none focus:border-blue-500 w-16 font-semibold"
                      >
                        {Object.keys(GRADE_POINTS).map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    {/* Delete Icon (Mobile handles swipe or tap, desktop has col) */}
                    <div className="col-span-12 md:col-span-1 flex items-center justify-center mt-2 md:mt-0">
                      <button
                        onClick={() => removeSubject(sub.id)}
                        disabled={subjects.length <= 1}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </TiltCard>

          {/* CGPA Forecast Panel */}
          <TiltCard className="p-5 lg:p-6" intensity={2}>
            <div className="flex items-center gap-2 mb-5 border-b border-white/[0.06] pb-3">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-200">CGPA Forecast &amp; Predictor</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">
                  Current CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={currentCgpa}
                  onChange={(e) => updateGpaState({ currentCgpa: e.target.value })}
                  className="w-full bg-slate-900 border border-white/[0.08] focus:border-indigo-500 rounded-xl text-xs text-slate-200 p-2.5 focus:outline-none"
                  placeholder="e.g. 7.84"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">
                  Completed Sems
                </label>
                <select
                  value={completedSemesters}
                  onChange={(e) => updateGpaState({ completedSemesters: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-white/[0.08] focus:border-indigo-500 rounded-xl text-xs text-slate-200 p-2.5 focus:outline-none"
                >
                  <option value="0">None (Freshman)</option>
                  {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">
                  Target CGPA
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={targetCgpa}
                  onChange={(e) => updateGpaState({ targetCgpa: e.target.value })}
                  className="w-full bg-slate-900 border border-white/[0.08] focus:border-indigo-500 rounded-xl text-xs text-slate-200 p-2.5 focus:outline-none"
                  placeholder="e.g. 8.50"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2 block">
                  Total Curriculum Sems
                </label>
                <select
                  value={totalSemesters}
                  onChange={(e) => updateGpaState({ totalSemesters: parseInt(e.target.value) || 8 })}
                  className="w-full bg-slate-900 border border-white/[0.08] focus:border-indigo-500 rounded-xl text-xs text-slate-200 p-2.5 focus:outline-none"
                >
                  {[4, 6, 8, 10].map((ts) => (
                    <option key={ts} value={ts}>{ts} Semesters</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Results */}
            <AnimatePresence>
              {targetPrediction && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 pt-4 border-t border-white/[0.06]"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-1 rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Needed Average SGPA
                      </p>
                      <h4 className="text-xl font-extrabold text-indigo-400">
                        {targetPrediction.neededSgpa > 0 ? targetPrediction.neededSgpa : '0.00'}
                      </h4>
                      <p className="text-[9px] text-slate-400 mt-1">
                        Across remaining {targetPrediction.remaining} Semesters
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      {(() => {
                        const styles = getFeasibilityStyles(targetPrediction.feasibility);
                        const Icon = styles.icon;
                        return (
                          <div className={`p-3.5 rounded-xl border flex items-start gap-3 ${styles.bg}`}>
                            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
                                  {styles.label}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-slate-300">
                                {targetPrediction.message}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TiltCard>
        </div>

        {/* Results Dial Gauge */}
        <div className="space-y-6">
          <TiltCard className="p-5 lg:p-6 flex flex-col items-center justify-center text-center h-full min-h-[300px]" intensity={3}>
            <div className="w-full flex items-center justify-center gap-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">Estimated SGPA</h3>
            </div>

            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer Glow */}
              <div className="absolute inset-2 rounded-full bg-slate-900 border border-white/[0.04] shadow-inner" />
              
              {/* Gauge Circle SVG */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  className={getGaugeColor(sgpaResult)}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="440"
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>

              {/* Centered Values */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                <h2 className="text-3xl font-black text-slate-100">{sgpaResult.toFixed(2)}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estimated SGPA</p>
              </div>
            </div>

            {/* Performance Level */}
            <div className="mt-6">
              {sgpaResult >= 9.0 ? (
                <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  Outstanding performance! 🚀
                </div>
              ) : sgpaResult >= 7.5 ? (
                <div className="px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                  First Class Distinction ⭐
                </div>
              ) : sgpaResult >= 5.0 ? (
                <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  Passing Grades (Averages) 👍
                </div>
              ) : (
                <div className="px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  Underperformance warnings ⚠️
                </div>
              )}
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}
