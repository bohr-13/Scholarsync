'use client';

import { motion } from 'framer-motion';
import { UploadCloud, ShieldAlert, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: UploadCloud,
    number: '01',
    title: 'Upload or Paste',
    description: 'Drop in a WhatsApp screenshot, a cluttered notice PDF, or paste raw circular text from your college portal.',
  },
  {
    icon: ShieldAlert,
    number: '02',
    title: 'AI Notice Extraction',
    description: 'Our fine-tuned Gemini model parses the document in milliseconds, isolating titles, dates, mandatory documents, and fee structures.',
  },
  {
    icon: CheckCircle2,
    number: '03',
    title: 'Calm Organization',
    description: 'Extracted results are instantly converted into priorities on your personal dashboard, with attendance risk guidelines updated.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 px-4 overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[30%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
            The Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mt-4 mb-5">
            How ScholarSync works.
          </h2>
          <p className="text-[var(--text-secondary)]">
            Three simple, automated steps that completely shield you from academic chaos.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Only visible on large screens) */}
          <div className="hidden lg:block absolute top-[28%] left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-emerald-500/30 -z-10" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                className="flex flex-col items-center text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 80, damping: 15, delay: i * 0.2 }}
              >
                {/* Icon Container with glowing background */}
                <div className="relative w-16 h-16 rounded-2xl bg-[var(--glass-surface)] border border-[var(--glass-border)] flex items-center justify-center mb-6 shadow-xl group">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <Icon className="w-6 h-6 text-[var(--accent-blue)] relative z-10" />
                  <span className="absolute -top-3.5 -right-3.5 w-7 h-7 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center text-xs font-mono font-bold text-[var(--text-primary)]">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-3 text-[var(--text-primary)]">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
