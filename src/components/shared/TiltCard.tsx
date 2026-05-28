'use client';

import { motion } from 'framer-motion';
import { useTilt } from '@/hooks/useTilt';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  intensity?: number;
}

export default function TiltCard({
  children,
  className,
  glowColor,
  intensity = 6,
}: TiltCardProps) {
  const { ref, tilt, handleMouseMove, handleMouseLeave } = useTilt(intensity);

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl',
        'transition-shadow duration-300',
        'dark:bg-white/[0.03] dark:border-white/[0.06]',
        'bg-white border-slate-200/60',
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: glowColor
          ? `0 8px 32px -8px ${glowColor}, 0 0 0 1px rgba(255,255,255,0.05)`
          : '0 8px 32px -8px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.05)',
      }}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        scale: tilt.scale,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{
        y: -4,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
    >
      {children}
    </motion.div>
  );
}
