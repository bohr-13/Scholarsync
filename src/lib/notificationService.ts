import { addNotification } from '@/lib/firestore';
import type { AppNotification, NotificationType } from '@/types';

type NotificationInput = Omit<AppNotification, 'id' | 'createdAt' | 'userId'>;

async function create(
  userId: string,
  input: NotificationInput
): Promise<string | null> {
  try {
    return await addNotification(userId, {
      userId,
      ...input,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
}

// ─── TODO Notifications ─────────────────────────────────────────

export function notifyTodoListCreated(userId: string, title: string) {
  return create(userId, {
    type: 'todo',
    title: 'Workspace Created',
    message: `New workspace "${title}" has been created.`,
    isRead: false,
    actionUrl: '/todo',
  });
}

export function notifyTaskCompleted(userId: string, taskText: string) {
  return create(userId, {
    type: 'todo',
    title: 'Task Completed',
    message: `You completed: "${taskText}"`,
    isRead: false,
    actionUrl: '/todo',
  });
}

export function notifyAiStudyPlanGenerated(
  userId: string,
  planTitle: string
) {
  return create(userId, {
    type: 'ai_generated',
    title: 'AI Study Plan Ready',
    message: `Your AI study plan "${planTitle}" has been generated and added to TODO.`,
    isRead: false,
    actionUrl: '/todo',
  });
}

// ─── Attendance Notifications ───────────────────────────────────

export function notifyAttendanceUpdated(userId: string, subjectName: string) {
  return create(userId, {
    type: 'attendance',
    title: 'Attendance Updated',
    message: `Attendance for "${subjectName}" has been updated.`,
    isRead: false,
    actionUrl: '/attendance',
  });
}

export function notifyAttendanceBelowThreshold(
  userId: string,
  subjectName: string,
  percentage: number
) {
  return create(userId, {
    type: 'warning',
    title: 'Low Attendance Warning',
    message: `Your attendance in "${subjectName}" is at ${percentage}%. Consider attending more classes.`,
    isRead: false,
    actionUrl: '/attendance',
  });
}

// ─── Scan Notice Notifications ──────────────────────────────────

export function notifyNoticeScanned(
  userId: string,
  noticeTitle: string
) {
  return create(userId, {
    type: 'scan_notice',
    title: 'Notice Scanned',
    message: `"${noticeTitle}" has been successfully scanned and processed.`,
    isRead: false,
    actionUrl: '/scan',
  });
}

export function notifyScanFailed(userId: string, errorMessage?: string) {
  return create(userId, {
    type: 'error',
    title: 'Scan Failed',
    message: errorMessage
      ? `Notice scan failed: ${errorMessage}`
      : 'Failed to scan the notice. Please try again.',
    isRead: false,
  });
}

export function notifyAiTasksExtracted(
  userId: string,
  noticeTitle: string,
  taskCount: number
) {
  return create(userId, {
    type: 'ai_generated',
    title: 'Tasks Extracted',
    message: `${taskCount} task${taskCount !== 1 ? 's' : ''} extracted from "${noticeTitle}" and added to your dashboard.`,
    isRead: false,
    actionUrl: '/todo',
  });
}

// ─── Scholarship Notifications ──────────────────────────────────

export function notifyScholarshipSaved(
  userId: string,
  scholarshipName: string
) {
  return create(userId, {
    type: 'scholarship',
    title: 'Scholarship Saved',
    message: `"${scholarshipName}" has been added to your saved scholarships.`,
    isRead: false,
    actionUrl: '/scholarships',
  });
}

export function notifyScholarshipUnsaved(
  userId: string,
  scholarshipName: string
) {
  return create(userId, {
    type: 'info',
    title: 'Scholarship Removed',
    message: `"${scholarshipName}" has been removed from your saved scholarships.`,
    isRead: false,
    actionUrl: '/scholarships',
  });
}

// ─── System Notifications ───────────────────────────────────────

export function notifyWelcome(userId: string, displayName: string) {
  return create(userId, {
    type: 'success',
    title: 'Welcome to ScholarSync!',
    message: `Hey ${displayName}! Start by scanning your first notice or setting up your attendance tracker.`,
    isRead: false,
    actionUrl: '/dashboard',
  });
}

export function notifyProfileUpdated(userId: string) {
  return create(userId, {
    type: 'info',
    title: 'Profile Updated',
    message: 'Your profile has been updated successfully.',
    isRead: false,
    actionUrl: '/settings',
  });
}
