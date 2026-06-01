'use client';

import { motion } from 'framer-motion';
import { CalendarCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAttendance } from '@/hooks/useAttendance';
import TiltCard from '@/components/shared/TiltCard';
import type { SubjectAttendance } from '@/types';

// Helper for risk styles
function getRiskStyles(averagePercentage: number) {
  let riskColor = 'text-emerald-400 dark:text-emerald-400';
  let progressStroke = '#10b981'; // emerald-500

  if (averagePercentage < 75) {
    riskColor = 'text-rose-400 dark:text-rose-400';
    progressStroke = '#f43f5e'; // rose-500
  } else if (averagePercentage < 80) {
    riskColor = 'text-amber-400 dark:text-amber-400';
    progressStroke = '#f59e0b'; // amber-500
  }

  return { riskColor, progressStroke };
}

function CircularProgress({
  averagePercentage,
  riskColor,
  progressStroke,
}: {
  averagePercentage: number;
  riskColor: string;
  progressStroke: string;
}) {
  const radius = 34;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averagePercentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          className="stroke-slate-200 dark:stroke-white/[0.04]"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Foreground progress */}
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          stroke={progressStroke}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-lg font-extrabold ${riskColor}`}>{averagePercentage}%</span>
        <span className="text-[8px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-mono">Average</span>
      </div>
    </div>
  );
}

function RiskAlert({ atRiskSubjects }: { atRiskSubjects: SubjectAttendance[] }) {
  return (
    <div className="space-y-2.5 max-w-[130px]">
      {atRiskSubjects.length > 0 ? (
        <div className="flex items-start gap-1.5 text-xs text-amber-500">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p className="leading-tight font-medium text-[11px]">
            {atRiskSubjects.length} {atRiskSubjects.length === 1 ? 'subject' : 'subjects'} at attendance risk!
          </p>
        </div>
      ) : (
        <p className="text-[11px] text-emerald-400 font-medium leading-tight">
          ✓ All subjects above safety guidelines. You are doing great.
        </p>
      )}
    </div>
  );
}

function SubjectProgressList({ subjects }: { subjects: SubjectAttendance[] }) {
  return (
    <div className="space-y-3">
      {subjects.slice(0, 3).map((sub) => {
        let barColor = 'bg-emerald-500';
        if (sub.riskLevel === 'danger') barColor = 'bg-rose-500';
        else if (sub.riskLevel === 'warning') barColor = 'bg-amber-500';

        return (
          <div key={sub.id} className="space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="font-bold dark:text-slate-300 text-slate-700 truncate max-w-[160px]">{sub.name}</span>
              <span className="font-mono text-slate-400 dark:text-slate-400">{sub.percentage}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-white/[0.05] h-1 rounded-full overflow-hidden">
              <div className={`h-full ${barColor} rounded-full`} style={{ width: `${sub.percentage}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AttendanceWidget() {
  const { subjects, averageAttendance } = useAttendance();

  const averagePercentage = averageAttendance;
  const atRiskSubjects = subjects.filter((s) => s.riskLevel !== 'safe');

  const { riskColor, progressStroke } = getRiskStyles(averagePercentage);

  return (
    <TiltCard className="p-6 h-full flex flex-col justify-between" intensity={3}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
                Attendance Predictor
              </h3>
              <p className="text-[10px] dark:text-slate-500 text-slate-400">
                Minimum required: 75%
              </p>
            </div>
          </div>
        </div>

        {/* Circular Progress Layout */}
        <div className="flex items-center justify-around gap-4 mb-6">
          <CircularProgress
            averagePercentage={averagePercentage}
            riskColor={riskColor}
            progressStroke={progressStroke}
          />
          <RiskAlert atRiskSubjects={atRiskSubjects} />
        </div>

        {/* Subject progress bar micro listings */}
        <SubjectProgressList subjects={subjects} />
      </div>

      <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/[0.05] flex justify-end">
        <Link
          href="/attendance"
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
        >
          <span>Track & Predict Bunks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </TiltCard>
  );
}
