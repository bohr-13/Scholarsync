'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, GraduationCap, X, Check, AlertTriangle, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRiskColor } from '@/lib/utils';
import { useAttendance } from '@/hooks/useAttendance';
import type { SubjectAttendance } from '@/types';

function CircularProgress({
  percentage,
  riskLevel,
  size = 48,
  strokeWidth = 3.5,
}: {
  percentage: number;
  riskLevel: string;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColorMap: Record<string, string> = {
    safe: '#10b981',
    warning: '#f59e0b',
    danger: '#f43f5e',
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColorMap[riskLevel] || '#64748b'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn('text-[11px] font-bold tabular-nums', getRiskColor(riskLevel))}>
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function RiskBadge({ riskLevel }: { riskLevel: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    safe: {
      label: 'Safe',
      className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      icon: <Shield className="w-3 h-3" />,
    },
    warning: {
      label: 'Warning',
      className: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
    danger: {
      label: 'Danger',
      className: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      icon: <AlertTriangle className="w-3 h-3" />,
    },
  };

  const c = config[riskLevel] || config.safe;

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border', c.className)}>
      {c.icon}
      {c.label}
    </span>
  );
}

export default function AttendanceCalculator() {
  const { subjects, updateSubject, addSubject, removeSubject, averageAttendance, atRiskCount } =
    useAttendance();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newAttended, setNewAttended] = useState(0);
  const [newTotal, setNewTotal] = useState(0);

  const totalSafeBunks = subjects.reduce((sum, s) => sum + s.safeBunks, 0);

  const handleAdd = () => {
    if (newName.trim() && newCode.trim() && newTotal > 0) {
      addSubject(newName.trim(), newCode.trim(), newAttended, newTotal);
      setNewName('');
      setNewCode('');
      setNewAttended(0);
      setNewTotal(0);
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-sm p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">Average</p>
          <p className={cn('text-2xl font-bold tabular-nums', averageAttendance >= 75 ? 'text-emerald-400' : 'text-[#EF4444]')}>
            {averageAttendance}%
          </p>
        </motion.div>
        <motion.div
          className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-sm p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">At Risk</p>
          <p className={cn('text-2xl font-bold tabular-nums', atRiskCount > 0 ? 'text-amber-400' : 'text-emerald-400')}>
            {atRiskCount}
          </p>
        </motion.div>
        <motion.div
          className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-sm p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] mb-1">Safe Bunks</p>
          <p className="text-2xl font-bold tabular-nums text-[#3B82F6]">{totalSafeBunks}</p>
        </motion.div>
      </div>

      {/* Subject List */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {subjects.map((subject, idx) => (
            <motion.div
              key={subject.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-surface)] backdrop-blur-sm p-4"
            >
              <div className="flex items-center gap-4">
                <CircularProgress
                  percentage={subject.percentage}
                  riskLevel={subject.riskLevel}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate">{subject.name}</h3>
                    <RiskBadge riskLevel={subject.riskLevel} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{subject.code}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Attended control */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Present</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateSubject(subject.id, Math.max(0, subject.attended - 1), subject.total)
                        }
                        className="w-6 h-6 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-[var(--glass-surface)] transition-colors"
                      >
                        <Minus className="w-3 h-3 text-[var(--text-secondary)]" />
                      </button>
                      <span className="text-sm font-semibold text-[var(--text-primary)] w-6 text-center tabular-nums">
                        {subject.attended}
                      </span>
                      <button
                        onClick={() =>
                          updateSubject(subject.id, Math.min(subject.total, subject.attended + 1), subject.total)
                        }
                        className="w-6 h-6 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-[var(--glass-surface)] transition-colors"
                      >
                        <Plus className="w-3 h-3 text-[var(--text-secondary)]" />
                      </button>
                    </div>
                  </div>

                  {/* Total control */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Total</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateSubject(
                            subject.id,
                            Math.min(subject.attended, Math.max(1, subject.total - 1)),
                            Math.max(1, subject.total - 1)
                          )
                        }
                        className="w-6 h-6 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-[var(--glass-surface)] transition-colors"
                      >
                        <Minus className="w-3 h-3 text-[var(--text-secondary)]" />
                      </button>
                      <span className="text-sm font-semibold text-[var(--text-primary)] w-6 text-center tabular-nums">
                        {subject.total}
                      </span>
                      <button
                        onClick={() => updateSubject(subject.id, subject.attended, subject.total + 1)}
                        className="w-6 h-6 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center hover:bg-[var(--glass-surface)] transition-colors"
                      >
                        <Plus className="w-3 h-3 text-[var(--text-secondary)]" />
                      </button>
                    </div>
                  </div>

                  {/* Safe bunks */}
                  <div className="flex flex-col items-center gap-1 min-w-[50px]">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Bunks</span>
                    <span className={cn('text-sm font-bold tabular-nums', subject.safeBunks > 0 ? 'text-emerald-400' : 'text-[#EF4444]')}>
                      {subject.safeBunks}
                    </span>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeSubject(subject.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all duration-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Subject */}
      <AnimatePresence>
        {showAddForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-[#3B82F6]/20 bg-[var(--accent-blue)]/5 backdrop-blur-sm p-4 overflow-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Subject name"
                className="col-span-2 md:col-span-1 bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[#9CA3AF]/50 outline-none focus:border-[#3B82F6]/50"
              />
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="Code"
                className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[#9CA3AF]/50 outline-none focus:border-[#3B82F6]/50"
              />
              <input
                type="number"
                value={newAttended || ''}
                onChange={(e) => setNewAttended(Number(e.target.value))}
                placeholder="Attended"
                min={0}
                className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[#9CA3AF]/50 outline-none focus:border-[#3B82F6]/50"
              />
              <input
                type="number"
                value={newTotal || ''}
                onChange={(e) => setNewTotal(Number(e.target.value))}
                placeholder="Total"
                min={1}
                className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[#9CA3AF]/50 outline-none focus:border-[#3B82F6]/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-blue)] text-white text-sm font-medium hover:brightness-110 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] text-sm hover:bg-[var(--glass-surface)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowAddForm(true)}
            className={cn(
              'w-full py-3 px-4 rounded-xl text-sm font-medium',
              'flex items-center justify-center gap-2',
              'border border-dashed border-[var(--glass-border)] text-[var(--text-secondary)]',
              'hover:border-[#3B82F6]/30 hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)]/30',
              'transition-all duration-300'
            )}
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
