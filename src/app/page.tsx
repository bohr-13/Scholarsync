'use client';

import Link from 'next/link';
import { LogIn } from 'lucide-react';
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
    <div className="dark relative min-h-screen overflow-x-hidden bg-[#0B0F19]">
      {/* Interactive premium ambient background */}
      <FloatingBackground />

      {/* Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 bg-[rgba(11,15,25,0.75)] backdrop-blur-xl border-b border-[#1F2937] transition-all">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="ScholarSync" className="w-8 h-8 rounded-lg shadow-md object-cover" />
          <div>
            <h1 className="text-sm font-bold text-[#E5E7EB] tracking-tight">
              ScholarSync
            </h1>
            <p className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-wider leading-none mt-0.5">
              Student OS
            </p>
          </div>
        </Link>

        {/* Action button */}
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#E5E7EB] bg-[#0F172A] border border-[#1F2937] hover:bg-[#111827] hover:border-[#3B82F6]/50 transition-all cursor-pointer"
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
      <footer className="relative z-10 border-t border-[#1F2937] py-12 px-6 text-center bg-[#111827]/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ScholarSync" className="w-6 h-6 rounded-md object-cover" />
            <span className="text-xs font-bold text-[#E5E7EB]">ScholarSync</span>
          </div>
          <p className="text-xs text-[#9CA3AF]">
            © {new Date().getFullYear()} ScholarSync (Student OS). Designed to organize academic chaos. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
