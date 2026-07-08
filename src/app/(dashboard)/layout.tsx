'use client';

import { ThemeProvider } from 'next-themes';
import Sidebar from '@/components/shared/Sidebar';
import TopBar from '@/components/shared/TopBar';
import FloatingBackground from '@/components/shared/FloatingBackground';
import BottomNav from '@/components/shared/BottomNav';
import { useAuth } from '@/components/providers/AuthProvider';
import { LayoutProvider, useLayout } from '@/components/providers/LayoutProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { isSidebarCollapsed } = useLayout();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[var(--bg)] relative overflow-hidden">
        <FloatingBackground />
        <div className="text-center space-y-6 relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center mx-auto shadow-2xl border border-[var(--glass-border)]"
          >
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-wide uppercase">ScholarSync</h2>
            <p className="text-xs text-[var(--text-secondary)]">Restoring academic calm...</p>
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
      <FloatingBackground />
      
      {/* Sidebar - only displayed on Tablet & Desktop */}
      <Sidebar />
      
      {/* Main content container with responsive layout shell margins */}
      <div className={cn(
        "min-h-screen flex flex-col bg-[var(--bg)] transition-all duration-300",
        // Mobile layout: no margin, add padding at bottom for BottomNav
        "ml-0 pb-24 md:pb-0",
        // Tablet layout: adapts based on sidebar collapse state
        isSidebarCollapsed ? "md:ml-[80px]" : "md:ml-[260px]",
        // Desktop layout: always expanded
        "lg:ml-[260px]"
      )}>
        <TopBar />
        <main className="flex-1 px-4 py-6 md:px-5 lg:px-6 max-w-[1280px] mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Floating Bottom Nav - visible only on mobile */}
      <BottomNav />
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
      <LayoutProvider>
        <DashboardContent>{children}</DashboardContent>
      </LayoutProvider>
    </ThemeProvider>
  );
}

