'use client';

import { motion } from 'framer-motion';
import { CalendarCheck, ArrowRight, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAttendance } from '@/hooks/useAttendance';
import TiltCard from '@/components/shared/TiltCard';

export default function AttendanceWidget() {
  const { subjects, averageAttendance, atRiskCount, isLoading } = useAttendance();

  const averagePercentage = averageAttendance;
  const atRiskSubjects = subjects.filter((s) => s.riskLevel !== 'safe');

  // SVG Progress Parameters
  const radius = 34;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (averagePercentage / 100) * circumference;

  let riskColor = 'text-emerald-400';
  let progressStroke = '#10b981'; // emerald-500
  let glowStyle = 'shadow-emerald-500/10';

  if (averagePercentage < 75) {
    riskColor = 'text-rose-400';
    progressStroke = '#f43f5e'; // rose-500
    glowStyle = 'shadow-rose-500/10';
  } else if (averagePercentage < 80) {
    riskColor = 'text-amber-400';
    progressStroke = '#f59e0b'; // amber-500
    glowStyle = 'shadow-amber-500/10';
  }

  return (
    <TiltCard className="p-6 h-full flex flex-col justify-between" intensity={3}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] tracking-tight">
                Attendance Predictor
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)]">
                Minimum required: 75%
              </p>
            </div>
          </div>
        </div>

        {/* Circular Progress Layout */}
        <div className="flex items-center justify-around gap-4 mb-6">
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-[var(--glass-border)]"
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
              <span className="text-[8px] text-[var(--text-secondary)] uppercase tracking-widest font-mono">Average</span>
            </div>
          </div>

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
        </div>

        {/* Subject progress bar micro listings */}
        <div className="space-y-3">
          {subjects.slice(0, 3).map((sub) => {
            let barColor = 'bg-emerald-500';
            if (sub.riskLevel === 'danger') barColor = 'bg-rose-500';
            else if (sub.riskLevel === 'warning') barColor = 'bg-amber-500';

            return (
              <div key={sub.id} className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="font-bold text-[var(--text-primary)] truncate max-w-[160px]">{sub.name}</span>
                  <span className="font-mono text-[var(--text-secondary)]">{sub.percentage}%</span>
                </div>
                <div className="w-full bg-[var(--glass-surface)] h-1 rounded-full overflow-hidden">
                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${sub.percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-[var(--glass-border)] flex justify-end">
        <Link
          href="/attendance"
          className="flex items-center gap-1 text-xs text-[var(--accent-blue)] hover:text-[var(--accent-blue)]/80 font-medium transition-colors cursor-pointer"
        >
          <span>Track & Predict Bunks</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </TiltCard>
  );
}
