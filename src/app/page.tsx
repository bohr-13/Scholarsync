'use client';

import Link from 'next/link';
import { Sparkles, LogIn } from 'lucide-react';
import Hero from '@/components/landing/Hero';
import ProblemStatement from '@/components/landing/ProblemStatement';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import DemoPreview from '@/components/landing/DemoPreview';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import FloatingBackground from '@/components/shared/FloatingBackground';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden dark:bg-slate-950 bg-slate-50 transition-colors duration-300">
      {/* Interactive premium ambient background */}
      <FloatingBackground />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/[0.04] transition-all">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold dark:text-white text-slate-900 tracking-tight">
              ScholarSync
            </h1>
            <p className="text-[9px] dark:text-slate-500 text-slate-400 font-bold uppercase tracking-wider leading-none mt-0.5">
              Student OS
            </p>
          </div>
        </Link>

        {/* Action button */}
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold dark:text-slate-200 text-slate-800 dark:bg-white/[0.03] dark:border-white/[0.06] bg-slate-100 border border-slate-200 dark:hover:bg-white/[0.06] hover:bg-slate-200/80 transition-all cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Launch App</span>
        </Link>
      </header>

      {/* Main Sections */}
      <main className="relative z-10 pt-6">
        <Hero />
        <ProblemStatement />
        <Features />
        <HowItWorks />
        <DemoPreview />
        <Testimonials />
        <CTA />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/60 dark:border-white/[0.05] py-12 px-6 text-center dark:bg-slate-950/20 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-xs font-bold dark:text-white text-slate-800">ScholarSync</span>
          </div>
          <p className="text-xs dark:text-slate-500 text-slate-400">
            © {new Date().getFullYear()} ScholarSync (Student OS). Designed to organize academic chaos. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
