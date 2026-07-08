'use client';

import { motion } from 'framer-motion';

const blobs = [
  { cx: '15%', cy: '20%', r: 300, color: 'var(--blob-1)', duration: 25 },
  { cx: '80%', cy: '30%', r: 250, color: 'var(--blob-2)', duration: 30 },
  { cx: '50%', cy: '70%', r: 350, color: 'var(--blob-3)', duration: 35 },
  { cx: '20%', cy: '80%', r: 200, color: 'var(--blob-4)', duration: 28 },
  { cx: '70%', cy: '60%', r: 280, color: 'var(--blob-5)', duration: 32 },
];

export default function FloatingBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {blobs.map((blob, i) => (
          <motion.circle
            key={i}
            cx={blob.cx}
            cy={blob.cy}
            r={blob.r}
            fill={blob.color}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: [0.8, 1.2, 0.9, 1.1, 0.8],
              cx: [`${parseFloat(blob.cx)}%`, `${parseFloat(blob.cx) + 5}%`, `${parseFloat(blob.cx) - 3}%`, `${parseFloat(blob.cx) + 2}%`, `${parseFloat(blob.cx)}%`],
              cy: [`${parseFloat(blob.cy)}%`, `${parseFloat(blob.cy) - 4}%`, `${parseFloat(blob.cy) + 3}%`, `${parseFloat(blob.cy) - 2}%`, `${parseFloat(blob.cy)}%`],
              opacity: [0.6, 1, 0.7, 0.9, 0.6],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            filter="url(#blur)"
          />
        ))}
        <defs>
          <filter id="blur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="80" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
