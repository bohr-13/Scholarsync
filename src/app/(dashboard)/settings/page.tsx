'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Bell,
  Palette,
  Info,
  Save,
  Moon,
  Sun,
  Mail,
  Building2,
  GraduationCap,
  MapPin,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import { INDIAN_STATES, COURSES } from '@/lib/constants';
import { useAuth } from '@/components/providers/AuthProvider';
import { useUserProfile } from '@/hooks/useUserProfile';

interface ProfileData {
  name: string;
  email: string;
  college: string;
  course: string;
  year: number;
  state: string;
}

interface Preferences {
  darkMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  deadlineReminders: boolean;
  weeklyDigest: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

function GlassInput({
  label,
  icon: Icon,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  icon: React.ElementType;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 font-semibold">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-xl',
            'pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)]',
            'outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]',
            'transition-all duration-300 placeholder-[#6B7280]'
          )}
        />
      </div>
    </div>
  );
}

function GlassSelect({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-1.5 font-semibold">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-xl',
            'pl-10 pr-10 py-2.5 text-sm text-[var(--text-primary)]',
            'outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]',
            'transition-all duration-300 cursor-pointer'
          )}
        >
          <option value="" className="bg-[var(--glass-bg)]">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-[var(--glass-bg)]">{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ToggleSwitch({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onToggle}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-300 cursor-pointer',
          enabled ? 'bg-[var(--accent-blue)]' : 'bg-[#1F2937]'
        )}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ left: enabled ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUserProfile: updateAuthProfile } = useAuth();

  // Import Firestore-backed profile hook
  const { profile: firestoreProfile, isLoading: profileLoading, updateProfile: updateFirestoreProfile } = useUserProfile();

  const [profile, setProfile] = useState<ProfileData>({
    name: user?.displayName || '',
    email: user?.email || '',
    college: '',
    course: '',
    year: 1,
    state: '',
  });

  // Sync profile from Firestore when it loads
  useEffect(() => {
    if (firestoreProfile) {
      setProfile((prev) => ({
        ...prev,
        name: firestoreProfile.displayName || user?.displayName || '',
        email: firestoreProfile.email || user?.email || '',
        college: firestoreProfile.college || '',
        course: firestoreProfile.course || '',
        year: firestoreProfile.year || 1,
        state: firestoreProfile.state || '',
      }));
    }
  }, [firestoreProfile, user]);

  const [preferences, setPreferences] = useState<Preferences>({
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false,
    deadlineReminders: true,
    weeklyDigest: true,
  });

  // Load preferences from Firestore profile
  useEffect(() => {
    if (firestoreProfile?.preferences) {
      setPreferences((prev) => ({
        ...prev,
        ...firestoreProfile.preferences,
      }));
    }
  }, [firestoreProfile]);

  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    // Update Firebase Auth profile (name/email)
    updateAuthProfile({
      displayName: profile.name,
      email: profile.email,
    });

    // Persist ALL profile fields + preferences to Firestore
    await updateFirestoreProfile({
      displayName: profile.name,
      email: profile.email,
      college: profile.college,
      course: profile.course,
      year: profile.year,
      state: profile.state,
      preferences,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateProfile = (key: keyof ProfileData, value: string | number) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const togglePref = (key: keyof Preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-[#3B82F6]">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
            <p className="text-sm text-[var(--text-secondary)]">Manage your profile and preferences</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Profile Section */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 lg:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
        >
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-[#3B82F6]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Profile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GlassInput
              label="Full Name"
              icon={User}
              value={profile.name}
              onChange={(v) => updateProfile('name', v)}
            />
            <GlassInput
              label="Email"
              icon={Mail}
              value={profile.email}
              onChange={(v) => updateProfile('email', v)}
              type="email"
            />
            <GlassInput
              label="College"
              icon={Building2}
              value={profile.college}
              onChange={(v) => updateProfile('college', v)}
            />
            <GlassSelect
              label="Course"
              icon={GraduationCap}
              value={profile.course}
              options={COURSES}
              onChange={(v) => updateProfile('course', v)}
            />
            <GlassInput
              label="Year"
              icon={Calendar}
              value={profile.year}
              onChange={(v) => updateProfile('year', v)}
              type="number"
            />
            <GlassSelect
              label="State"
              icon={MapPin}
              value={profile.state}
              options={INDIAN_STATES}
              onChange={(v) => updateProfile('state', v)}
            />
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 lg:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Appearance</h2>
          </div>

          <ToggleSwitch
            label="Dark Mode"
            description="Use dark theme across the app"
            enabled={preferences.darkMode}
            onToggle={() => togglePref('darkMode')}
          />
        </motion.div>

        {/* Notifications Section */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 lg:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-[#F59E0B]" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Notifications</h2>
          </div>

          <div className="divide-y divide-[#1F2937]">
            <ToggleSwitch
              label="Email Notifications"
              description="Receive important updates via email"
              enabled={preferences.emailNotifications}
              onToggle={() => togglePref('emailNotifications')}
            />
            <ToggleSwitch
              label="Push Notifications"
              description="Browser push notifications for deadlines"
              enabled={preferences.pushNotifications}
              onToggle={() => togglePref('pushNotifications')}
            />
            <ToggleSwitch
              label="Deadline Reminders"
              description="Get reminded 24h before deadlines"
              enabled={preferences.deadlineReminders}
              onToggle={() => togglePref('deadlineReminders')}
            />
            <ToggleSwitch
              label="Weekly Digest"
              description="Summary of your week every Sunday"
              enabled={preferences.weeklyDigest}
              onToggle={() => togglePref('weeklyDigest')}
            />
          </div>
        </motion.div>

        {/* App Info */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 lg:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">About</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">App</span>
              <span className="text-sm text-[var(--text-primary)] font-medium">{APP_NAME}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Version</span>
              <span className="text-sm text-[var(--text-primary)] font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Built with</span>
              <span className="text-sm text-[var(--text-primary)] font-medium">
                Next.js 16 · Gemini AI
              </span>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={itemVariants}>
          <motion.button
            onClick={handleSave}
            className={cn(
              'w-full py-3.5 px-6 rounded-xl font-semibold text-sm cursor-pointer',
              'flex items-center justify-center gap-2',
              'transition-all duration-300',
              saved
                ? 'bg-[#10B981] text-white'
                : 'bg-[var(--accent-blue)] hover:brightness-110 text-white shadow-lg'
            )}
            whileHover={!saved ? { scale: 1.01 } : {}}
            whileTap={!saved ? { scale: 0.99 } : {}}
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved Successfully
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
