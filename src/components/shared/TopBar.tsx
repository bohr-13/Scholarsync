'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '@/components/providers/AuthProvider';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/scan': 'AI Notice Scanner',
  '/attendance': 'Attendance Tracker',
  '/scholarships': 'Scholarship Matcher',
  '/settings': 'Settings',
};

export default function TopBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const title = pageTitles[pathname] || 'ScholarSync';

  return (
    <motion.header
      className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 border-b dark:border-white/[0.06] border-slate-200/60 dark:bg-slate-950/60 bg-white/60 backdrop-blur-2xl"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left */}
      <div>
        <h2 className="text-xl font-bold dark:text-white text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="text-xs dark:text-slate-500 text-slate-400 mt-0.5">
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <motion.button
          className="p-2.5 rounded-xl dark:bg-white/[0.04] bg-slate-100 dark:border-white/[0.08] border border-slate-200/60 dark:hover:bg-white/[0.08] hover:bg-slate-200/60 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search className="w-4 h-4 dark:text-slate-400 text-slate-500" />
        </motion.button>

        {/* Notifications */}
        <motion.button
          className="relative p-2.5 rounded-xl dark:bg-white/[0.04] bg-slate-100 dark:border-white/[0.08] border border-slate-200/60 dark:hover:bg-white/[0.08] hover:bg-slate-200/60 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="w-4 h-4 dark:text-slate-400 text-slate-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
        </motion.button>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Avatar */}
        <motion.div
          className="flex items-center gap-3 pl-3 ml-1 dark:border-l dark:border-white/[0.08] border-l border-slate-200/60"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
            {user?.displayName?.charAt(0) || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium dark:text-white text-slate-900 leading-none">
              {user?.displayName || 'Student'}
            </p>
            <p className="text-[11px] dark:text-slate-500 text-slate-400 mt-0.5">
              {user?.email || 'student@uni.ac.in'}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.header>
  );
}
