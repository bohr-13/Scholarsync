'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, Bell, Calendar, Percent } from 'lucide-react';
import TiltCard from '@/components/shared/TiltCard';

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100, damping: 15 } },
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden px-4">
      {/* Premium Background elements */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[350px] h-[350px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      <motion.div
        className="max-w-4xl text-center relative z-10 flex flex-col items-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Sparkles tag */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full dark:bg-white/[0.04] bg-slate-100 dark:border-white/[0.08] border border-slate-200/60 backdrop-blur-xl text-xs font-semibold dark:text-blue-400 text-blue-600 mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Academic Survival System</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight dark:text-white text-slate-900 leading-[1.1] mb-6 max-w-3xl"
        >
          Your academic <br className="hidden sm:inline" />
          <span className="gradient-text">survival system.</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl dark:text-slate-400 text-slate-600 max-w-2xl leading-relaxed mb-10"
        >
          ScholarSync transforms chaotic notices, PDFs, circulars, and academic pressure into one clean, intelligent, and calm student workspace.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 mb-16 w-full sm:w-auto"
        >
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Get Started — It&apos;s Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl dark:text-slate-300 text-slate-700 font-semibold dark:bg-white/[0.03] dark:border-white/[0.06] bg-slate-100 border border-slate-200 dark:hover:bg-white/[0.06] hover:bg-slate-200/60 transition-all cursor-pointer"
          >
            <span>See How It Works</span>
          </a>
        </motion.div>
      </motion.div>

      {/* Floating Spatial Widgets Mock */}
      <div className="relative w-full max-w-5xl h-[320px] md:h-[420px] hidden md:block select-none pointer-events-none">
        <LeftNoticeWidget />
        <CenterDashboardPreview />
        <RightAttendanceWidget />
      </div>
    </section>
  );
}

function LeftNoticeWidget() {
  return (
    <motion.div
      className="absolute left-4 top-10 w-[280px] z-10"
      initial={{ opacity: 0, x: -50, rotate: -6 }}
      animate={{ opacity: 1, x: 0, rotate: -4 }}
      transition={{ type: 'spring' as const, stiffness: 60, damping: 20, delay: 0.6 }}
      style={{ transformPerspective: 1200 }}
    >
      <TiltCard className="p-5" intensity={4}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
            <Bell className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <p className="text-xs dark:text-rose-400 text-rose-600 font-semibold uppercase tracking-wider">Exam Alert</p>
            <p className="text-[10px] dark:text-slate-500 text-slate-400">Extracted from circular</p>
          </div>
        </div>
        <h4 className="text-sm font-bold mb-1.5 dark:text-slate-200 text-slate-800">End Sem Exam Fee</h4>
        <p className="text-[11px] dark:text-slate-400 text-slate-600 line-clamp-2 mb-3">
          ₹2,500 must be paid before June 1st to ensure hall ticket collection.
        </p>
        <div className="flex justify-between items-center text-[10px] dark:text-slate-500 text-slate-400">
          <span>Deadline: 4 days left</span>
          <span className="font-semibold text-rose-400">₹2,500</span>
        </div>
      </TiltCard>
    </motion.div>
  );
}

function CenterDashboardPreview() {
  return (
    <motion.div
      className="absolute left-1/2 top-4 -translate-x-1/2 w-[540px] z-0"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring' as const, stiffness: 50, damping: 18, delay: 0.4 }}
    >
      <div className="rounded-2xl border border-white/[0.08] dark:bg-slate-950/80 bg-white/80 backdrop-blur-2xl p-6 glow-blue h-[360px] relative overflow-hidden">
        {/* Fake Dashboard Header */}
        <div className="flex justify-between items-center pb-4 border-b border-white/[0.06] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-[11px] dark:text-slate-500 text-slate-400 ml-2 font-mono">scholarsync.os/dashboard</span>
          </div>
          <div className="w-20 h-2 bg-white/[0.08] rounded-full" />
        </div>

        {/* Fake Dashboard Layout */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] h-[240px]">
            <h5 className="text-[12px] font-bold text-slate-400 mb-3 uppercase tracking-wider">Today&apos;s Priorities</h5>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded border border-white/10 flex items-center justify-center bg-white/[0.02]" />
                  <div className="flex-1 space-y-1.5">
                    <div className={`h-2.5 rounded-full bg-white/${i === 1 ? '10' : '05'}`} style={{ width: i === 1 ? '75%' : i === 2 ? '50%' : '60%' }} />
                    <div className="h-1.5 rounded-full bg-white/5 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500">Avg Attendance</p>
                <p className="text-xl font-bold dark:text-emerald-400 text-emerald-600 mt-1">79.6%</p>
              </div>
              <Percent className="w-8 h-8 dark:text-emerald-500/20 text-emerald-500/10" />
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">AI Priority Engine</p>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">3 Critical Items Organized</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function RightAttendanceWidget() {
  return (
    <motion.div
      className="absolute right-4 top-20 w-[240px] z-10"
      initial={{ opacity: 0, x: 50, rotate: 6 }}
      animate={{ opacity: 1, x: 0, rotate: 4 }}
      transition={{ type: 'spring' as const, stiffness: 60, damping: 20, delay: 0.8 }}
    >
      <TiltCard className="p-5" intensity={4}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs dark:text-emerald-400 text-emerald-600 font-semibold">Attendance Safe</p>
            <p className="text-[10px] dark:text-slate-500 text-slate-400">OS CS-303</p>
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-2xl font-bold dark:text-white text-slate-800">82.4%</span>
          <span className="text-[10px] dark:text-slate-500 text-slate-400">Total: 34 classes</span>
        </div>
        <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-2 overflow-hidden">
          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '82.4%' }} />
        </div>
        <p className="text-[10px] dark:text-emerald-400 text-emerald-600">✓ Safe bunk list available: 3 classes</p>
      </TiltCard>
    </motion.div>
  );
}
