// ─── Notice & Extraction ───────────────────────────────────────────
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type NoticeRiskLevel = 'critical' | 'high' | 'moderate' | 'low';
export type EmotionalContext = 'stressful' | 'neutral' | 'positive';
export type NoticeCategory =
  | 'exam'
  | 'assignment'
  | 'fee'
  | 'event'
  | 'scholarship'
  | 'placement'
  | 'sports'
  | 'cultural'
  | 'administrative'
  | 'other';

export interface FeeDetail {
  label: string;
  amount: string;
  type: 'mandatory' | 'optional' | 'fine' | 'refundable';
}

export interface TaskCard {
  title: string;
  description: string;
  dueDate: string | null;
  type: 'payment' | 'submission' | 'registration' | 'preparation' | 'verification';
}

export interface ExtractionResult {
  id: string;
  title: string;
  summary: string;
  studentFriendlyExplanation?: string;
  deadline: string | null;
  feeAmount: string | null;
  fees?: FeeDetail[];
  requiredDocuments: string[];
  priority: Priority;
  category: NoticeCategory;
  importantActions: string[];
  eventType: string | null;
  noticeType?: string | null;
  department?: string | null;
  issuingAuthority?: string | null;
  riskLevel?: NoticeRiskLevel;
  taskCards?: TaskCard[];
  recommendations?: string[];
  attendanceImpact?: string | null;
  emotionalContext?: EmotionalContext | null;
  rawText: string;
  extractedAt: string;
  source: 'pdf' | 'image' | 'text';
}

// ─── Tasks ──────────────────────────────────────────────────────────
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: Priority;
  category: NoticeCategory;
  status: TaskStatus;
  source?: string;
  createdAt: string;
  completedAt?: string;
}

// ─── Attendance ─────────────────────────────────────────────────────
export type RiskLevel = 'safe' | 'warning' | 'danger';

export interface SubjectAttendance {
  id: string;
  name: string;
  code: string;
  attended: number;
  total: number;
  percentage: number;
  safeBunks: number;
  riskLevel: RiskLevel;
}

// ─── Scholarships ───────────────────────────────────────────────────
export interface Scholarship {
  id: string;
  name: string;
  title?: string;
  provider: string;
  amount: string;
  deadline: string;
  eligibility: {
    states: string[];
    courses: string[];
    incomeLimit: string;
    categories: string[];
    gender: 'all' | 'male' | 'female' | 'other';
  };
  requiredDocuments: string[];
  applicationLink: string;
  applyLink?: string;
  description?: string;
  tags?: string[];
  featured?: boolean;
  state?: string;
  course?: string;
  category?: string;
  gender?: string;
  matchPercentage?: number;
}

export interface ScholarshipFilters {
  state: string;
  course: string;
  incomeRange: string;
  category: string;
  gender: string;
}

// ─── User ───────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  college?: string;
  course?: string;
  year?: number;
  state?: string;
  createdAt: string;
}

// ─── Dashboard ──────────────────────────────────────────────────────
export interface AIInsight {
  id: string;
  type: 'tip' | 'warning' | 'info';
  title: string;
  message: string;
  icon: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  upcomingDeadlines: number;
  averageAttendance: number;
  criticalItems: number;
}

// ─── Study Planner ──────────────────────────────────────────────────
export interface StudyPlanDay {
  day: number;
  focus: string;
  tasks: string[];
  tips: string[];
}

export interface StudyPlan {
  title: string;
  durationDays: number;
  days: StudyPlanDay[];
}

// ─── GPA Predictor ──────────────────────────────────────────────────
export interface GpaSubject {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export interface GpaState {
  subjects: GpaSubject[];
  currentCgpa: string;
  completedSemesters: number;
  targetCgpa: string;
  totalSemesters: number;
}

// ─── Notifications ───────────────────────────────────────────────────
export type NotificationType =
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'reminder'
  | 'ai_generated'
  | 'scholarship'
  | 'attendance'
  | 'todo'
  | 'scan_notice';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// ─── AI Generated TODO System ───────────────────────────────────────
export interface TodoTask {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TodoList {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'ai-plan' | 'custom';
  sourceNoticeId?: string;
  linkedNoticeId?: string;
  isManual?: boolean;
  sourceType?: 'ai-plan' | 'custom';
  createdAt: string;
  updatedAt: string;
  tasks: TodoTask[];
}



