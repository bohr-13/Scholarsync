'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  onNotificationsSnapshot,
  markNotificationRead as fsMarkRead,
  markAllNotificationsRead as fsMarkAllRead,
} from '@/lib/firestore';
import type { AppNotification } from '@/types';

interface UseNotificationsReturn {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onNotificationsSnapshot(
      user.uid,
      (data) => {
        setNotifications(data);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Notifications listener error:', err);
        setError('Failed to load notifications');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!user?.uid) return;
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      try {
        await fsMarkRead(user.uid, notificationId);
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    [user?.uid]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.uid) return;
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
    try {
      await fsMarkAllRead(user.uid);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, [user?.uid]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
