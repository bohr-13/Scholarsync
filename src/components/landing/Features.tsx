'use client';

import { motion } from 'framer-motion';
import { ScanLine, LayoutDashboard, CalendarCheck, Heart, GraduationCap, Zap } from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';

const features = [
  {
    icon: ScanLine,
    title: 'AI Notice Scanner',
    description: 'Hero Feature. Drag & drop any messy college circular, circular image, or WhatsApp screenshot. The AI extracts dates, events, fees, and actionable lists instantly.',
    color: 'from-blue-500/20 to-cyan-500/10',
    iconColor: 'text-blue-400',
    glow: 'rgba(59,130,246,0.08)',
  },
  {
    icon: LayoutDashboard,
    title: 'Smart Dashboard',
    description: 'An elegant, spatial desk displaying today\'s critical deadlines, active attendance health status, scholarship trackers, and instant academic priority insights.',
    color: 'from-indigo-500/20 to-purple-500/10',
    iconColor: 'text-indigo-400',
    glow: 'rgba(99,102,241,0.08)',
  },
  {
    icon: CalendarCheck,
    title: 'Attendance Predictor',
    description: 'A beautiful visual calculator to input attended classes. System gives safe bunk notifications, warning notifications, and condonation guidelines.',
    color: 'from-emerald-500/20 to-teal-500/10',
    iconColor: 'text-emerald-400',
    glow: 'rgba(16,185,129,0.08)',
  },
  {
    icon: Heart,
    title: 'Emergency Focus Mode',
    description: 'Emotionally reassuring trigger. Hide low-priority widgets, blur background noises, highlight only crucial tasks, and show gentle reassuring support phrases.',
    color: 'from-rose-500/20 to-red-500/10',
    iconColor: 'text-rose-400',
    glow: 'rgba(244,63,94,0.08)',
  },
  {
    icon: GraduationCap,
    title: 'Scholarship Matcher',
    description: 'An intelligent matcher form using state, course, income limit, and category details. Instantly filters government and private Indian scholarships with required documents checklist.',
    color: 'from-amber-500/20 to-orange-500/10',
    iconColor: 'text-amber-400',
    glow: 'rgba(245,158,11,0.08)',
  },
  {
    icon: Zap,
    title: 'AI Priority Engine',
    description: 'Automatically calculates weights based on days remaining, attendance warning states, and custom priority levels. Autonomously reorders elements.',
    color: 'from-violet-500/20 to-fuchsia-500/10',
    iconColor: 'text-violet-400',
    glow: 'rgba(139,92,246,0.08)',
  },
];

export default function Features() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  };

  return (
    <section className="relative py-24 px-4 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">
            Core capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mt-4 mb-5">
            A survival pack for <br className="hidden sm:inline" />
            overwhelmed college students.
          </h2>
          <p className="text-[var(--text-secondary)]">
            Every feature is meticulously crafted to feel immersive, useful, and emotionally reassuring.
          </p>
        </div>

        {/* Feature Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div key={i} variants={cardVariants}>
                <TiltCard className="p-6 h-full flex flex-col items-start border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-blue)]/30" glowColor={feat.glow} intensity={4}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 border border-[var(--glass-border)]`}>
                    <Icon className={`w-5 h-5 ${feat.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)]">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1">
                    {feat.description}
                  </p>
                </TiltCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
