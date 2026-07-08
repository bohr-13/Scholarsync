'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants';
import FloatingBackground from '@/components/shared/FloatingBackground';
import { useAuth } from '@/components/providers/AuthProvider';

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signIn, signInWithGoogle, authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error('Sign in failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      console.error('Google Sign in failed:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="dark min-h-screen flex items-center justify-center px-4 py-12 relative bg-[#0B0F19]">
      <FloatingBackground />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md animate-fade-in"
      >
        <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[16px] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.25)]">
          {/* Logo & Tagline */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-14 h-14 rounded-2xl mx-auto mb-4 shadow-lg overflow-hidden"
            >
              <img src="/logo.png" alt="ScholarSync" className="w-full h-full object-cover" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">{APP_NAME}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{APP_TAGLINE}</p>
          </div>

          {/* Auth Error Banner — shows Firebase error messages visibly */}
          <AnimatePresence>
            {authError && (
              <motion.div
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                className="mb-4 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 flex items-start gap-2.5"
              >
                <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-[#EF4444] leading-relaxed">{authError}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-[#EF4444]/60 hover:text-[#EF4444] text-xs shrink-0"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError(); }}
                  placeholder="you@college.edu"
                  required
                  className={cn(
                    'w-full bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-[12px]',
                    'pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[#6B7280]',
                    'outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]',
                    'transition-all duration-[250ms] ease'
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError(); }}
                  placeholder="••••••••"
                  required
                  className={cn(
                    'w-full bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-[12px]',
                    'pl-10 pr-10 py-3 text-sm text-[var(--text-primary)] placeholder-[#6B7280]',
                    'outline-none focus:border-[#3B82F6] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.15)]',
                    'transition-all duration-[250ms] ease'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className={cn(
                'w-full py-3 px-5 rounded-[12px] font-semibold text-sm',
                'flex items-center justify-center gap-2',
                'bg-[var(--accent-blue)] text-white',
                'hover:brightness-110',
                'transition-all duration-[250ms] ease',
                'disabled:opacity-60 disabled:cursor-not-allowed'
              )}
              whileHover={!isLoading ? { y: -1 } : {}}
              whileTap={!isLoading ? { y: 0 } : {}}
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#1F2937]" />
            <span className="text-xs text-[var(--text-muted)]">or</span>
            <div className="flex-1 h-px bg-[#1F2937]" />
          </div>

          {/* Google Sign In */}
          <motion.button
            onClick={handleGoogleSignIn}
            className={cn(
              'w-full py-3 px-5 rounded-[12px] font-semibold text-sm',
              'flex items-center justify-center gap-2',
              'bg-[var(--glass-surface)] border border-[var(--glass-border)] text-[var(--text-primary)]',
              'hover:bg-[var(--glass-bg)] hover:border-[#3B82F6]/50',
              'transition-all duration-[250ms] ease'
            )}
            whileHover={{ y: -1 }}
            whileTap={{ y: 0 }}
          >
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </motion.button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="text-[#3B82F6] hover:text-[#2563EB] font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
