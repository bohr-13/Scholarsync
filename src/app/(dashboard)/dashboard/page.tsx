'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  ClipboardList,
  CheckCircle,
  Calendar,
  Percent,
  AlertOctagon,
} from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEmergencyMode } from '@/components/providers/EmergencyProvider';
import { useTasks } from '@/hooks/useTasks';
import { useAttendance } from '@/hooks/useAttendance';
import UrgentDeadlines from '@/components/dashboard/UrgentDeadlines';
import TodayPriorities from '@/components/dashboard/TodayPriorities';
import AttendanceWidget from '@/components/dashboard/AttendanceWidget';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import ScholarshipReminders from '@/components/dashboard/ScholarshipReminders';
import RecentUploads from '@/components/dashboard/RecentUploads';
import AIInsights from '@/components/dashboard/AIInsights';
import TiltCard from '@/components/shared/TiltCard';

export default function Dashboard() {
  const { user } = useAuth();
  const { emergency } = useEmergencyMode();
  const { tasks, isLoading: tasksLoading } = useTasks();
  const { averageAttendance, isLoading: attendanceLoading } = useAttendance();

  const statsLoading = tasksLoading || attendanceLoading;

  // Get Greeting based on current time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const widgetVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  // Micro statistics row
  const stats = [
    { label: 'Total Tasks', value: statsLoading ? '—' : String(tasks.length), icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: statsLoading ? '—' : String(tasks.filter(t => t.status === 'completed').length), icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Upcoming', value: statsLoading ? '—' : String(tasks.filter(t => t.status !== 'completed').length), icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'Avg Attendance', value: statsLoading ? '—' : `${averageAttendance}%`, icon: Percent, color: 'text-teal-400', bg: 'bg-teal-500/10' },
    { label: 'Critical Tasks', value: statsLoading ? '—' : String(tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length), icon: AlertOctagon, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Greeting Header */}
      <motion.div variants={widgetVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold dark:text-white text-slate-900 tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {user?.displayName?.split(' ')[0] || 'Student'}</span>
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {emergency.isActive
              ? 'Focus mode activated — low-priority information is hidden.'
              : 'Here is what needs your attention today.'}
          </p>
        </div>
      </motion.div>

      {/* Stats Row (Hidden/Simplified in Emergency focus mode to minimize clutter) */}
      {!emergency.isActive && (
        <motion.div
          variants={widgetVariants}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <TiltCard key={i} className="p-4 flex items-center gap-4 dark:bg-white/[0.02]" intensity={2}>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold dark:text-white text-slate-800 mt-0.5 leading-none">
                    {stat.value}
                  </p>
                </div>
              </TiltCard>
            );
          })}
        </motion.div>
      )}

      {/* Spatial Grid Widget Layout */}
      <motion.div variants={widgetVariants}>
        {emergency.isActive ? (
          /* Focus Mode: Simplified Layout with only critical deadlines and priorities */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto py-4">
            <div className="space-y-4 text-center md:col-span-2 mb-2">
              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                Focus Mode Engaged
              </span>
              <h3 className="text-lg font-bold dark:text-slate-300 text-slate-700 mt-2">
                &ldquo;Breathe. Focus on one small thing at a time.&rdquo;
              </h3>
            </div>
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              <UrgentDeadlines />
            </motion.div>
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            >
              <TodayPriorities />
            </motion.div>
          </div>
        ) : (
          /* Regular Smart Grid Dashboard Layout */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top row */}
            <div className="md:col-span-2">
              <UrgentDeadlines />
            </div>
            <div>
              <TodayPriorities />
            </div>

            {/* Middle row */}
            <div>
              <AttendanceWidget />
            </div>
            <div>
              <UpcomingTasks />
            </div>
            <div>
              <ScholarshipReminders />
            </div>

            {/* Bottom row */}
            <div>
              <RecentUploads />
            </div>
            <div className="md:col-span-2">
              <AIInsights />
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
