'use client';

import { motion } from 'framer-motion';
import { Eye, Bell, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';

export default function DemoPreview() {
  return (
    <section className="relative py-24 px-4 bg-[var(--bg)]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            Live Preview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mt-4 mb-5">
            Interface like a premium operating system.
          </h2>
          <p className="text-[var(--text-secondary)]">
            Take a glance at how your new workspace aggregates notice details, urgency, tasks, and attendance levels with absolute visual elegance.
          </p>
        </div>

        {/* Spatial Preview Deck */}
        <motion.div
          className="relative max-w-4xl mx-auto rounded-[16px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 glow-blue overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Decorative Window Controls */}
          <div className="flex justify-between items-center pb-4 border-b border-[var(--glass-border)] mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-[var(--text-muted)] font-mono ml-3">scholarsync.os/demo-preview</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <Eye className="w-3.5 h-3.5" />
              <span>Interactive Preview</span>
            </div>
          </div>

          {/* Grid Layout inside Desktop Mock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Urgent Notifications */}
            <div className="md:col-span-2 space-y-6">
              <div className="p-5 rounded-2xl border border-rose-500/20 bg-[var(--error)]/5 glow-rose">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-rose-400 animate-bounce" />
                    <h3 className="text-sm font-bold text-[var(--error)]">Urgent Deadline Action Needed</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded">
                    48h remaining
                  </span>
                </div>
                <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">Semester IA-2 Internal Assessment Form Submission</h4>
                <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
                  Fill and submit the handwritten IA-2 assessment form with signatures from subject heads to room 203. No email registrations accepted.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[10px] font-medium text-[var(--text-primary)] bg-[var(--glass-surface)] border border-[var(--glass-border)] px-2 py-1 rounded-lg">
                    ✓ Required: signed physical slip
                  </span>
                  <span className="text-[10px] font-medium text-[var(--text-primary)] bg-[var(--glass-surface)] border border-[var(--glass-border)] px-2 py-1 rounded-lg">
                    ✓ Required: attendance record &gt; 75%
                  </span>
                </div>
              </div>

              {/* Task priorities */}
              <div className="p-5 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-surface)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Priority Sorting Agenda</h3>
                <div className="space-y-3">
                  {[
                    { title: 'Upload Internship Completion Slip', category: 'placement', priority: 'high', date: 'Due in 5 days' },
                    { title: 'Return library books: Clean Architecture', category: 'admin', priority: 'medium', date: 'Due in 2 days' },
                  ].map((task, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-[var(--glass-surface)] transition-colors">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-slate-500" />
                        <div>
                          <p className="text-xs font-bold text-[var(--text-primary)]">{task.title}</p>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{task.date}</p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        task.priority === 'high' ? 'text-amber-400 bg-amber-400/10' : 'text-blue-400 bg-blue-400/10'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side: AI Assistant Tips */}
            <div className="space-y-6">
              <TiltCard className="p-5" intensity={4}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">AI Priority Insights</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-indigo-500/[0.04] border border-indigo-500/20">
                    <p className="text-xs font-bold text-[var(--accent-blue)] mb-1">Emergency Warning active</p>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Operating Systems (CS-303) attendance is at 70.6% (critical limit is 75%). Bunking next class is NOT recommended.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[var(--success)]/5 border border-[var(--success)]/20">
                    <p className="text-xs font-bold text-[var(--success)] mb-1">Scholarship opportunity</p>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Matches AICTE Pragati scholarship parameters perfectly. You qualify for ₹50,000/year reward.
                    </p>
                  </div>
                </div>
              </TiltCard>

              {/* Overwhelmed Trigger Visualizer */}
              <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 text-center">
                <Shield className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-indigo-300 mb-1">Experiencing stress?</h4>
                <p className="text-[10px] text-[var(--text-secondary)] mb-3">
                  Activate &quot;I&apos;m overwhelmed&quot; Focus Mode in one click to clear workspace distractions.
                </p>
                <div className="inline-block px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-[10px] text-indigo-300 font-semibold">
                  🆘 Trigger Overwhelm Mode
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
