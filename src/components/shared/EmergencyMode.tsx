'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Shield } from 'lucide-react';
import { useEmergencyMode } from '@/components/providers/EmergencyProvider';

export default function EmergencyMode() {
  const { emergency, toggleEmergency } = useEmergencyMode();

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={toggleEmergency}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl font-medium text-sm transition-all duration-300 cursor-pointer ${
          emergency.isActive
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-xl'
            : 'bg-slate-800/80 text-slate-300 border border-white/10 backdrop-blur-xl hover:bg-slate-700/80 hover:border-white/20'
        }`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {emergency.isActive ? (
          <>
            <Shield className="w-4 h-4" />
            <span>Exit Focus Mode</span>
          </>
        ) : (
          <>
            <Heart className="w-4 h-4" />
            <span>I&apos;m overwhelmed</span>
          </>
        )}
      </motion.button>

      {/* Emergency Mode Overlay */}
      <AnimatePresence>
        {emergency.isActive && (
          <motion.div
            className="fixed inset-0 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Calming overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-transparent to-indigo-950/10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reassurance Banner */}
      <AnimatePresence>
        {emergency.isActive && (
          <motion.div
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">
                Focus Mode Active — Only critical items are visible. You&apos;ve got this. 💙
              </span>
              <button
                onClick={toggleEmergency}
                className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
