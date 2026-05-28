'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';

const testimonials = [
  {
    quote: 'ScholarSync saved me from missing my exam fee deadline. Our department WhatsApp group has 200+ daily messages, and I completely missed the PDF. The AI notice scanner is genuinely magical.',
    name: 'Priya Nair',
    course: 'B.Tech CSE, 3rd Year',
    avatar: 'P',
    color: 'from-blue-500/10 to-indigo-500/5',
  },
  {
    quote: 'The attendance predictor alone is worth it. Instead of maintaining tedious notes on paper, I just update attended lectures. Knowing exactly how many safe bunks I have left reduces so much guilt.',
    name: 'Rahul Sen',
    course: 'BCA, 2nd Year',
    avatar: 'R',
    color: 'from-emerald-500/10 to-teal-500/5',
  },
  {
    quote: 'Emergency Focus Mode is the feature I never knew I needed. When I had three deadlines due on the same day, pressing that button just calmed my system down. It filters out everything but the critical now.',
    name: 'Ananya Roy',
    course: 'M.Tech, 1st Year',
    avatar: 'A',
    color: 'from-rose-500/10 to-purple-500/5',
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 px-4 overflow-hidden border-t border-white/[0.04] dark:border-white/[0.04]">
      {/* Background highlight */}
      <div className="absolute top-[40%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">
            Student Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 mt-4 mb-5">
            Loved by overwhelmed students.
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Real feedback from students who transformed their stressful university lives into clean workspaces.
          </p>
        </div>

        {/* Testimonials Deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <TiltCard className="p-6 h-full flex flex-col justify-between" intensity={3}>
                <div>
                  <Quote className="w-8 h-8 text-blue-400/20 mb-4" />
                  <p className="text-sm dark:text-slate-300 text-slate-700 leading-relaxed mb-6 italic">
                    &quot;{t.quote}&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-sm font-bold text-blue-400 border border-white/[0.05]`}>
                    {t.avatar}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold dark:text-slate-100 text-slate-900">{t.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{t.course}</p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
