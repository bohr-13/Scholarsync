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
import { useTasks } from '@/hooks/useTasks';
import { useAttendance } from '@/hooks/useAttendance';
import UrgentDeadlines from '@/components/dashboard/UrgentDeadlines';
import TodayPriorities from '@/components/dashboard/TodayPriorities';
import AttendanceWidget from '@/components/dashboard/AttendanceWidget';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import RecentUploads from '@/components/dashboard/RecentUploads';
import AIInsights from '@/components/dashboard/AIInsights';
import TiltCard from '@/components/shared/TiltCard';
import QuickActions from '@/components/dashboard/QuickActions';

export default function Dashboard() {
  const { user } = useAuth();
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
      className="space-y-4 md:space-y-6 max-w-[1400px] mx-auto"
    >
      {/* Greeting Header */}
      <motion.div variants={widgetVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E5E7EB] tracking-tight flex items-center gap-2">
            <span>{getGreeting()}, {user?.displayName?.split(' ')[0] || 'Student'}</span>
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </h2>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Here is what needs your attention today.
          </p>
        </div>
      </motion.div>

      {/* Quick Actions (Mobile Only) */}
      <motion.div variants={widgetVariants} className="block md:hidden">
        <QuickActions />
      </motion.div>

      {/* Stats Row */}
      <motion.div
        variants={widgetVariants}
        className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4"
      >
        {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <TiltCard key={i} className="p-3 md:p-4 flex items-center gap-3 md:gap-4 bg-[#111827] border border-[#1F2937] shadow-[0_8px_30px_rgba(0,0,0,0.25)] rounded-[16px]" intensity={2}>
                <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 md:w-5 md:h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] text-[#9CA3AF] uppercase tracking-wider font-semibold">
                    {stat.label}
                  </p>
                  <p className="text-base md:text-lg font-bold text-[#E5E7EB] mt-0.5 leading-none">
                    {stat.value}
                  </p>
                </div>
              </TiltCard>
            );
          })}
        </motion.div>

      {/* Spatial Grid Widget Layout */}
      <motion.div variants={widgetVariants}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
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

          {/* Bottom row */}
          <div>
            <RecentUploads />
          </div>
          <div className="md:col-span-2">
            <AIInsights />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
