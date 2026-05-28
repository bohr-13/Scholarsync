export const APP_NAME = 'ScholarSync';
export const APP_TAGLINE = 'Your academic survival system.';
export const APP_DESCRIPTION =
  'ScholarSync transforms chaotic notices, deadlines, and academic pressure into one intelligent student workspace.';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Scan Notice', href: '/scan', icon: 'ScanLine' },
  { label: 'Attendance', href: '/attendance', icon: 'CalendarCheck' },
  { label: 'GPA Predictor', href: '/gpa', icon: 'Calculator' },
  { label: 'Scholarships', href: '/scholarships', icon: 'GraduationCap' },
  { label: 'Settings', href: '/settings', icon: 'Settings' },
] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const CATEGORY_LABELS: Record<string, string> = {
  exam: 'Exam',
  assignment: 'Assignment',
  fee: 'Fee Payment',
  event: 'Event',
  scholarship: 'Scholarship',
  placement: 'Placement',
  sports: 'Sports',
  cultural: 'Cultural',
  administrative: 'Admin',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<string, string> = {
  exam: 'FileText',
  assignment: 'ClipboardList',
  fee: 'CreditCard',
  event: 'Calendar',
  scholarship: 'GraduationCap',
  placement: 'Briefcase',
  sports: 'Trophy',
  cultural: 'Music',
  administrative: 'Building2',
  other: 'MoreHorizontal',
};

export const INDIAN_STATES = [
  'All India',
  'Andhra Pradesh',
  'Bihar',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
  'Chhattisgarh',
];

export const COURSES = [
  'B.Tech',
  'B.E',
  'BCA',
  'B.Sc',
  'B.Com',
  'BA',
  'MCA',
  'M.Tech',
  'MBA',
  'MBBS',
];

export const INCOME_RANGES = [
  'Below ₹1,00,000',
  '₹1,00,000 – ₹2,50,000',
  '₹2,50,000 – ₹4,50,000',
  '₹4,50,000 – ₹8,00,000',
  'Above ₹8,00,000',
];

export const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'Minority'];
export const GENDERS = ['All', 'Male', 'Female', 'Other'];
