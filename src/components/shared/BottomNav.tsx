'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, ScanLine, ListChecks, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Scan Notice', href: '/scan', icon: ScanLine },
  { label: 'TODO', href: '/todo', icon: ListChecks },
  { label: 'Profile', href: '/settings', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-40 glass-heavy rounded-2xl h-16 shadow-[var(--shadow-lg)] border border-[var(--glass-border-light)] flex items-center justify-around px-2 md:hidden">
      {/* Background overlay for depth */}
      <div className="absolute inset-0 bg-[var(--glass-bg-heavy)]/40 rounded-2xl pointer-events-none" />

      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link key={item.href} href={item.href} className="relative flex flex-col items-center justify-center flex-1 h-full py-1">
            <motion.div
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-colors duration-300 relative z-10",
                isActive ? "text-[var(--accent-blue)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl bg-[var(--glass-surface-active)] border border-[var(--glass-border-accent)]"
                  layoutId="bottom-nav-active"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              <span className="text-[10px] font-medium relative z-10 tracking-tight leading-none">
                {item.label}
              </span>
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
