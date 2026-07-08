'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BellRing,
  CheckCircle2,
  Info,
  AlertTriangle,
  XCircle,
  Clock,
  Sparkles,
  GraduationCap,
  ClipboardCheck,
  ListChecks,
  ScanLine,
  Check,
  ChevronRight,
  Inbox,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<NotificationType, typeof Bell> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  reminder: Clock,
  ai_generated: Sparkles,
  scholarship: GraduationCap,
  attendance: ClipboardCheck,
  todo: ListChecks,
  scan_notice: ScanLine,
};

const iconColors: Record<NotificationType, string> = {
  success: 'text-emerald-400',
  info: 'text-[#3B82F6]',
  warning: 'text-amber-400',
  error: 'text-rose-400',
  reminder: 'text-violet-400',
  ai_generated: 'text-purple-400',
  scholarship: 'text-amber-400',
  attendance: 'text-indigo-400',
  todo: 'text-sky-400',
  scan_notice: 'text-[#3B82F6]',
};

const iconBgColors: Record<NotificationType, string> = {
  success: 'bg-emerald-500/10',
  info: 'bg-[#3B82F6]/10',
  warning: 'bg-amber-500/10',
  error: 'bg-rose-500/10',
  reminder: 'bg-violet-500/10',
  ai_generated: 'bg-purple-500/10',
  scholarship: 'bg-amber-500/10',
  attendance: 'bg-indigo-500/10',
  todo: 'bg-sky-500/10',
  scan_notice: 'bg-[#3B82F6]/10',
};

function relativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMins = Math.floor(diffMs / (1000 * 60));
        return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
      }
      return `${diffHours}h ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export default function NotificationDropdown({ isOpen, onClose }: Props) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const handleNotificationClick = async (
    notificationId: string,
    actionUrl?: string
  ) => {
    await markAsRead(notificationId);
    if (actionUrl) {
      router.push(actionUrl);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-[var(--bg)]/70 backdrop-blur-md md:hidden"
            onClick={onClose}
          />

          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'fixed md:absolute z-40',
              'top-16 md:top-full left-4 md:left-auto right-4 md:right-0 md:mt-2',
              'w-auto md:w-[420px] max-h-[500px] md:max-h-[540px]',
              'glass-heavy rounded-2xl shadow-[var(--shadow-xl)]',
              'flex flex-col overflow-hidden'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)] bg-[var(--glass-surface)] flex-shrink-0">
              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <BellRing className="w-4 h-4 text-[var(--accent-blue)]" />
                ) : (
                  <Bell className="w-4 h-4 text-[var(--text-secondary)]" />
                )}
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[var(--accent-blue)]/15 border border-[var(--glass-border-accent)] text-[10px] font-bold text-[var(--accent-blue)] uppercase tracking-wider">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={markAllAsRead}
                    className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent-blue)] hover:text-[var(--accent-blue)]/80 transition-colors px-2 py-1 rounded-lg hover:bg-[var(--accent-blue)]/10"
                    whileTap={{ scale: 0.95 }}
                  >
                    Mark all read
                  </motion.button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] flex items-center justify-center">
                    <Inbox className="w-6 h-6 text-[var(--text-secondary)]" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      You&apos;re all caught up!
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      New notifications will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[var(--glass-border)]">
                  {notifications.map((notification) => {
                    const Icon = iconMap[notification.type] || Info;
                    const isUnread = !notification.isRead;

                    return (
                      <motion.button
                        key={notification.id}
                        onClick={() =>
                          handleNotificationClick(
                            notification.id,
                            notification.actionUrl
                          )
                        }
                        className={cn(
                          'w-full text-left px-5 py-4 transition-all duration-200 group',
                          'hover:bg-[var(--glass-surface)]',
                          isUnread
                            ? 'bg-[var(--glass-surface)]/50'
                            : 'bg-transparent'
                        )}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={cn(
                              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                              iconBgColors[notification.type] || 'bg-[var(--glass-surface)]',
                              iconColors[notification.type] || 'text-[var(--text-secondary)]'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={cn(
                                  'text-sm leading-snug',
                                  isUnread
                                    ? 'font-semibold text-[var(--text-primary)]'
                                    : 'font-medium text-[var(--text-secondary)]'
                                )}
                              >
                                {notification.title}
                              </p>
                              <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap flex-shrink-0 mt-0.5">
                                {relativeTime(notification.createdAt)}
                              </span>
                            </div>
                            <p
                              className={cn(
                                'text-xs leading-relaxed mt-0.5 line-clamp-2',
                                isUnread
                                  ? 'text-[var(--text-primary)]/80'
                                  : 'text-[var(--text-muted)]'
                              )}
                            >
                              {notification.message}
                            </p>
                          </div>

                          {/* Unread dot + chevron */}
                          <div className="flex items-center gap-1.5 flex-shrink-0 mt-1">
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-[var(--accent-blue)]" />
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-[var(--glass-border)] group-hover:text-[var(--text-secondary)] transition-colors" />
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
