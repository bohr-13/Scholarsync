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
        'relative rounded-[16px] glass',
        'transition-all duration-[350ms] ease-glass',
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: glowColor
          ? `var(--shadow-md), 0 0 40px ${glowColor}`
          : 'var(--shadow-md)',
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
        y: -3,
        boxShadow: glowColor
          ? 'var(--shadow-lg), 0 0 60px ' + (glowColor || 'rgba(59,130,246,0.1)')
          : 'var(--shadow-lg)',
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
    >
      {children}
    </motion.div>
  );
}
