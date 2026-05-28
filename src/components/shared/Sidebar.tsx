'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  ScanLine,
  CalendarCheck,
  GraduationCap,
  Settings,
  Sparkles,
  LogOut,
  Calculator,
  ListChecks,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';


const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Scan Notice', href: '/scan', icon: ScanLine },
  { label: 'TODO', href: '/todo', icon: ListChecks },
  { label: 'Attendance', href: '/attendance', icon: CalendarCheck },
  { label: 'GPA Predictor', href: '/gpa', icon: Calculator },
  { label: 'Scholarships', href: '/scholarships', icon: GraduationCap },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[260px] z-30 flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950/80 dark:bg-slate-950/80 bg-white/80 backdrop-blur-2xl border-r border-white/[0.06] dark:border-white/[0.06] border-slate-200/60" />

      {/* Content */}
      <div className="relative flex flex-col h-full px-4 py-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 px-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold dark:text-white text-slate-900 tracking-tight">
              ScholarSync
            </h1>
            <p className="text-[10px] dark:text-slate-500 text-slate-400 font-medium tracking-wider uppercase">
              Student OS
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'dark:text-white text-slate-900'
                      : 'dark:text-slate-400 text-slate-500 dark:hover:text-slate-200 hover:text-slate-700'
                  )}
                  whileHover={{ x: 2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-xl bg-white/[0.06] dark:bg-white/[0.06] bg-slate-100 border border-white/[0.08] dark:border-white/[0.08] border-slate-200/60"
                      layoutId="sidebar-active"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon className="w-[18px] h-[18px] relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-blue-500"
                      layoutId="sidebar-indicator"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t dark:border-white/[0.06] border-slate-200/60 space-y-3">
          <button
            onClick={() => {
              signOut();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors duration-200 cursor-pointer text-left"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span>Sign Out</span>
          </button>
          <p className="text-[11px] dark:text-slate-600 text-slate-400 px-3">
            ScholarSync v1.0 — Built for students
          </p>
        </div>
      </div>
    </aside>
  );
}
