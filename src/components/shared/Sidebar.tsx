'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ScanLine,
  CalendarCheck,
  Settings,
  Sparkles,
  LogOut,
  Calculator,
  ListChecks,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/AuthProvider';
import { useLayout } from '@/components/providers/LayoutProvider';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Scan Notice', href: '/scan', icon: ScanLine },
  { label: 'TODO', href: '/todo', icon: ListChecks },
  { label: 'Attendance', href: '/attendance', icon: CalendarCheck },
  { label: 'GPA Predictor', href: '/gpa', icon: Calculator },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const { isSidebarCollapsed, setSidebarCollapsed } = useLayout();

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 z-30 flex flex-col p-3 transition-all duration-300 ease-glass",
      // Hide completely on mobile, show as flex on larger viewports
      "hidden md:flex",
      // Width changes depending on collapse state
      isSidebarCollapsed ? "w-[80px]" : "w-[260px]"
    )}>
      {/* Floating glass panel */}
      <div className="relative flex flex-col h-full w-full glass-heavy rounded-2xl overflow-hidden">
        {/* Extra backdrop layer inside for depth */}
        <div className="absolute inset-0 bg-[var(--glass-bg-heavy)]/40" />

        {/* Content */}
        <div className={cn(
          "relative flex flex-col h-full px-3 py-5 transition-all duration-300",
          isSidebarCollapsed ? "items-center" : ""
        )}>
          {/* Logo */}
          <Link href="/" className={cn(
            "flex items-center mb-7 shrink-0",
            isSidebarCollapsed ? "justify-center px-0 w-full" : "gap-3 px-3"
          )}>
            <img src="/logo.png" alt="ScholarSync" className="w-9 h-9 rounded-xl shadow-[var(--shadow-sm)] shrink-0 object-cover" />
            <AnimatePresence initial={false}>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0, x: -10 }}
                  animate={{ opacity: 1, width: 'auto', x: 0 }}
                  exit={{ opacity: 0, width: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  <h1 className="text-base font-bold text-[var(--text-primary)] tracking-tight">
                    ScholarSync
                  </h1>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium tracking-wider uppercase">
                    Student OS
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} className="block w-full">
                  <motion.div
                    className={cn(
                      'relative flex items-center rounded-xl text-sm font-medium transition-all duration-[350ms] ease-glass cursor-pointer',
                      isActive
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                      isSidebarCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5 gap-3'
                    )}
                    whileHover={isSidebarCollapsed ? {} : { x: 2 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-xl bg-[var(--glass-surface-active)] border border-[var(--glass-border-accent)]"
                        layoutId="sidebar-active"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon className="w-[18px] h-[18px] relative z-10 shrink-0" />
                    <AnimatePresence initial={false}>
                      {!isSidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0, x: -10 }}
                          animate={{ opacity: 1, width: 'auto', x: 0 }}
                          exit={{ opacity: 0, width: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="relative z-10 overflow-hidden whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && (
                      <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-[var(--accent-blue)]"
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
          <div className="mt-auto pt-4 border-t border-[var(--glass-border)] space-y-3 w-full">
            <button
              onClick={() => {
                signOut();
                router.push('/login');
              }}
              className={cn(
                "w-full flex items-center rounded-xl text-sm font-medium text-[var(--error)] hover:bg-rose-500/10 hover:text-[var(--error)] transition-all duration-[350ms] ease-glass cursor-pointer text-left",
                isSidebarCollapsed ? "justify-center p-2.5" : "px-3 py-2 gap-3"
              )}
            >
              <LogOut className="w-[18px] h-[18px] shrink-0" />
              <AnimatePresence initial={false}>
                {!isSidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, x: -10 }}
                    animate={{ opacity: 1, width: 'auto', x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    Sign Out
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <AnimatePresence initial={false}>
              {!isSidebarCollapsed && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[11px] text-[var(--text-muted)] px-3 overflow-hidden whitespace-nowrap"
                >
                  ScholarSync v1.0 — Built for students
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Collapse toggle button - only visible on tablet (md to lg) */}
      <button
        onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute top-6 -right-3 w-6 h-6 rounded-full bg-[var(--glass-bg-heavy)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-md hover:bg-[var(--glass-surface-hover)] transition-all z-40 hidden md:flex lg:hidden cursor-pointer"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform duration-300", isSidebarCollapsed && "rotate-180")} />
      </button>
    </aside>
  );
}

