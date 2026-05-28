'use client';

import { motion } from 'framer-motion';
import { CalendarCheck, TrendingUp, AlertTriangle, Sofa } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAttendance } from '@/hooks/useAttendance';
import AttendanceCalculator from '@/components/attendance/AttendanceCalculator';
import AttendanceChart from '@/components/attendance/AttendanceChart';

export default function AttendancePage() {
  const { subjects, averageAttendance, atRiskCount } = useAttendance();

  const totalSafeBunks = subjects.reduce((sum, s) => sum + s.safeBunks, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center">
            <CalendarCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Attendance Tracker</h1>
            <p className="text-sm text-slate-400">
              Stay on top of your attendance. Know exactly where you stand.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 lg:p-6"
      >
        <AttendanceCalculator />
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-5 lg:p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <h2 className="text-sm font-semibold text-slate-200">Attendance Overview</h2>
        </div>
        <AttendanceChart subjects={subjects} />
      </motion.div>
    </div>
  );
}
