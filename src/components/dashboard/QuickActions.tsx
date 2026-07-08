'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Camera, ListChecks, CalendarRange, GraduationCap, Calculator } from 'lucide-react';

const actions = [
  { label: 'AI Scanner', href: '/scan', icon: Camera, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { label: 'Check TODO', href: '/todo', icon: ListChecks, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Attendance', href: '/attendance', icon: CalendarRange, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
  { label: 'Scholarships', href: '/scholarships', icon: GraduationCap, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  { label: 'GPA Predictor', href: '/gpa', icon: Calculator, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

export default function QuickActions() {
  return (
    <div className="w-full">
      <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 px-1">
        Quick Actions
      </h3>
      {/* Horizontally scrollable container with overflow-x-auto */}
      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} href={action.href} className="snap-start shrink-0">
              <motion.div
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[var(--glass-surface)] border border-[var(--glass-border)] shadow-[var(--shadow-sm)] hover:bg-[var(--glass-surface-hover)] transition-all duration-[300ms]"
                whileTap={{ scale: 0.96 }}
              >
                <div className={`w-8 h-8 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${action.color}`} />
                </div>
                <span className="text-xs font-semibold text-[var(--text-primary)] pr-1">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
