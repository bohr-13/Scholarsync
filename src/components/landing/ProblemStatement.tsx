'use client';

import { motion } from 'framer-motion';
import { AlertCircle, FileWarning, HelpCircle, BellOff, MessageSquare } from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';

const problems = [
  {
    icon: MessageSquare,
    title: 'WhatsApp Group Spam',
    description: 'Crucial dates, syllabus updates, and circular links are buried deep in hundreds of chatter messages and memes.',
    tag: 'WhatsApp Chaos',
  },
  {
    icon: FileWarning,
    title: 'Messy Unreadable PDFs',
    description: 'Colleges love scanning poor-quality printed notices with tables that are completely unreadable on mobile.',
    tag: 'PDF Disasters',
  },
  {
    icon: BellOff,
    title: 'Missed Deadlines',
    description: 'You find out that scholarship portal registration or exam fees closed yesterday. The panic is real.',
    tag: 'Deadline Panic',
  },
  {
    icon: HelpCircle,
    title: 'Attendance Risk Mystery',
    description: 'Worrying if skipping today\'s lecture will drop you below 75% and ban you from final examinations.',
    tag: 'Calculations Stress',
  },
];

export default function ProblemStatement() {
  return (
    <section className="relative py-24 border-t border-white/[0.04] dark:border-white/[0.04] border-slate-200 px-4">
      {/* Background radial highlight */}
      <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-rose-500 dark:text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full">
            The Student Chaos
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 mt-4 mb-5">
            College communication is broken. <br className="hidden sm:inline" />
            Overwhelmed is the new normal.
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Between WhatsApp groups, circular PDFs, portal announcements, and complex attendance rules, staying organized shouldn&apos;t require a full-time job.
          </p>
        </div>

        {/* 2x2 Grid of Problems */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {problems.map((prob, i) => {
            const Icon = prob.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ type: 'spring', stiffness: 100, damping: 15, delay: i * 0.1 }}
              >
                <TiltCard className="p-6 h-full flex gap-4 hover:shadow-rose-500/5 hover:border-rose-500/20" glowColor="rgba(244,63,94,0.05)" intensity={4}>
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-semibold dark:text-rose-400 text-rose-600 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10">
                      {prob.tag}
                    </span>
                    <h3 className="text-lg font-bold mt-2.5 mb-1.5 dark:text-slate-200 text-slate-800">
                      {prob.title}
                    </h3>
                    <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
                      {prob.description}
                    </p>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>

        {/* Contrasting Solution Header */}
        <motion.div
          className="rounded-2xl border border-white/[0.06] dark:bg-slate-900/40 bg-slate-50 border-slate-200 p-8 md:p-12 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/5 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <span className="text-[11px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">
                Enter ScholarSync
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold dark:text-white text-slate-900 mt-4 mb-4">
                A serene operating system built to absorb academic chaos.
              </h3>
              <p className="text-sm dark:text-slate-400 text-slate-600 leading-relaxed">
                ScholarSync acts as an emotional buffer. Paste or upload any cluttered document. The system processes it in seconds, matches eligibility, calculates risks, and presents everything in a beautiful, structured workflow.
              </p>
            </div>
            <div className="flex items-center justify-center shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30">
                <AlertCircle className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
