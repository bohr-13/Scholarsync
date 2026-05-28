'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          className="rounded-3xl border border-white/[0.08] dark:bg-slate-900/60 bg-white p-8 md:p-16 glow-blue relative overflow-hidden flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 pointer-events-none" />

          {/* Sparkle icon */}
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center mb-6 border border-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight dark:text-white text-slate-900 mb-6 max-w-2xl">
            Start organizing your <br className="hidden sm:inline" />
            academic life today.
          </h2>
          <p className="text-base sm:text-lg dark:text-slate-400 text-slate-600 max-w-lg mb-10 leading-relaxed">
            Join thousands of students who stopped drowning in WhatsApp spam and messy PDFs. Get your personal academic assistant.
          </p>

          <Link
            href="/login"
            className="flex items-center gap-2.5 px-8 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Get Started — It&apos;s Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <p className="text-xs dark:text-slate-500 text-slate-400 mt-4 font-medium">
            No credit card required. Works out of the box with custom presets.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
