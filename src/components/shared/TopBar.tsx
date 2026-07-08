'use client';

import { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, BellRing } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import { useAuth } from '@/components/providers/AuthProvider';
import { useNotifications } from '@/hooks/useNotifications';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/scan': 'AI Notice Scanner',
  '/attendance': 'Attendance Tracker',
  '/settings': 'Settings',
};

export default function TopBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);

  const title = pageTitles[pathname] || 'ScholarSync';

  const toggleNotif = useCallback(() => {
    setNotifOpen((prev) => !prev);
  }, []);

  const closeNotif = useCallback(() => {
    setNotifOpen(false);
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good morning';
    if (hours < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.header
      className="sticky top-0 z-20 mx-3 md:mx-4 mt-2.5 md:mt-3 mb-0 rounded-2xl bg-[var(--glass-bg-heavy)] backdrop-blur-[var(--blur-2xl)] border border-[var(--glass-border-light)] shadow-[var(--shadow-lg)] flex items-center justify-between px-4 md:px-6 py-2.5 md:py-3.5"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Left section: Greeting on mobile, Page Title on Desktop/Tablet */}
      <div>
        {/* Mobile Header (Hidden on md and above) */}
        <div className="flex flex-col md:hidden">
          <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-none">
            {getGreeting()}
          </span>
          <span className="text-sm font-bold text-[var(--text-primary)] mt-1.5 leading-none">
            {user?.displayName?.split(' ')[0] || 'Student'}!
          </span>
        </div>

        {/* Desktop/Tablet Header (Hidden on mobile) */}
        <div className="hidden md:block">
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={toggleNotif}
            className="relative p-2 md:p-2.5 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:bg-[var(--glass-surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--glass-border-hover)] transition-all duration-[350ms] ease-glass cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {unreadCount > 0 ? (
              <BellRing className="w-4 h-4" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full bg-[var(--error)] text-white text-[9px] font-bold leading-none shadow-[var(--shadow-sm)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>

          <NotificationDropdown isOpen={notifOpen} onClose={closeNotif} />
        </div>

        {/* Theme Toggle - Desktop/Tablet Only */}
        <div className="hidden md:block">
          <ThemeToggle />
        </div>

        {/* User Avatar: links to Settings (Profile) on Mobile, status info on Desktop/Tablet */}
        <div className="flex items-center gap-3 pl-2 md:pl-3 ml-1 border-l border-[var(--glass-border)]">
          {/* Mobile Profile Link */}
          <Link href="/settings" className="block md:hidden">
            <motion.div
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold shadow-[var(--shadow-sm)] cursor-pointer"
              whileTap={{ scale: 0.95 }}
            >
              {user?.displayName?.charAt(0) || 'U'}
            </motion.div>
          </Link>

          {/* Desktop/Tablet Info */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[#2563EB] flex items-center justify-center text-white text-xs font-bold shadow-[var(--shadow-sm)]">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[var(--text-primary)] leading-none">
                {user?.displayName || 'Student'}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {user?.email || 'student@uni.ac.in'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
