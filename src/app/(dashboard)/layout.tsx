'use client';

import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import FloatingBackground from '@/components/shared/FloatingBackground';
import EmergencyMode from '@/components/shared/EmergencyMode';
import FocusAudio from '@/components/shared/FocusAudio';
import { EmergencyProvider, useEmergencyMode } from '@/components/providers/EmergencyProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { emergency } = useEmergencyMode();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
        <FloatingBackground />
        <div className="text-center space-y-6 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/25 border border-white/[0.08]"
          >
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">ScholarSync</h2>
            <p className="text-xs text-slate-500">Restoring academic calm...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <>
      <FloatingBackground reduced={emergency.isActive} />
      <Sidebar />
      <div className="ml-[260px] min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <EmergencyMode />
      <FocusAudio />
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <EmergencyProvider>
        <DashboardContent>{children}</DashboardContent>
      </EmergencyProvider>
    </ThemeProvider>
  );
}

