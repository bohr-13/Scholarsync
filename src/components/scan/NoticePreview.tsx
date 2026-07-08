'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, FileText, Image, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoticePreviewProps {
  source: 'pdf' | 'image' | 'text';
  imageData?: string;
  fileName?: string;
  rawText?: string;
  extractedEntities?: {
    deadlines: string[];
    fees: string[];
    actions: string[];
  };
}

const SOURCE_LABELS: Record<string, { label: string; Icon: typeof FileText }> = {
  pdf: { label: 'PDF Document', Icon: FileText },
  image: { label: 'Image', Icon: Image },
  text: { label: 'Text Input', Icon: Type },
};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

function highlightEntities(
  text: string,
  entities: NonNullable<NoticePreviewProps['extractedEntities']>
) {
  type Span = { start: number; end: number; color: string };
  const spans: Span[] = [];

  const addSpans = (terms: string[], color: string) => {
    for (const term of terms) {
      if (!term) continue;
      const lowerText = text.toLowerCase();
      const lowerTerm = term.toLowerCase();
      let idx = 0;
      while ((idx = lowerText.indexOf(lowerTerm, idx)) !== -1) {
        spans.push({ start: idx, end: idx + term.length, color });
        idx += term.length;
      }
    }
  };

  addSpans(entities.deadlines, 'bg-blue-500/20 text-blue-300 rounded px-0.5');
  addSpans(entities.fees, 'bg-emerald-500/20 text-emerald-300 rounded px-0.5');
  addSpans(entities.actions, 'bg-amber-500/20 text-amber-300 rounded px-0.5');

  // Sort and de-duplicate overlapping spans
  spans.sort((a, b) => a.start - b.start);
  const merged: Span[] = [];
  for (const span of spans) {
    const last = merged[merged.length - 1];
    if (last && span.start < last.end) continue; // skip overlap
    merged.push(span);
  }

  if (merged.length === 0) {
    return <span>{text}</span>;
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < merged.length; i++) {
    const { start, end, color } = merged[i];
    if (cursor < start) {
      parts.push(<span key={`t-${i}`}>{text.slice(cursor, start)}</span>);
    }
    parts.push(
      <mark key={`m-${i}`} className={cn('bg-transparent', color)}>
        {text.slice(start, end)}
      </mark>
    );
    cursor = end;
  }
  if (cursor < text.length) {
    parts.push(<span key="tail">{text.slice(cursor)}</span>);
  }

  return <>{parts}</>;
}

export default function NoticePreview({
  source,
  imageData,
  fileName,
  rawText,
  extractedEntities,
}: NoticePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [fitToWidth, setFitToWidth] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + ZOOM_STEP, MAX_ZOOM)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - ZOOM_STEP, MIN_ZOOM)), []);
  const toggleFit = useCallback(() => {
    setFitToWidth((f) => !f);
    setZoom(1);
  }, []);

  const { label: sourceLabel, Icon: SourceIcon } = SOURCE_LABELS[source] ?? SOURCE_LABELS.text;

  const highlightedText = useMemo(() => {
    if (!rawText) return null;
    if (extractedEntities) return highlightEntities(rawText, extractedEntities);
    return <span>{rawText}</span>;
  }, [rawText, extractedEntities]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={cn(
        'relative flex flex-col rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--blur-xl)] overflow-hidden',
        'w-full lg:w-[40%] lg:flex-shrink-0',
        'h-[50vh] lg:h-[70vh]'
      )}
    >
      {/* Content area */}
      <div ref={containerRef} className="flex-1 overflow-auto relative">
        {/* ── Image mode ── */}
        {source === 'image' && imageData && (
          <div className="flex items-center justify-center min-h-full p-4">
            <motion.img
              src={imageData}
              alt={fileName ?? 'Notice preview'}
              className={cn(
                'rounded-xl border border-[var(--glass-border)] shadow-lg',
                'transition-transform duration-200 origin-center',
                fitToWidth ? 'w-full h-auto' : 'max-w-none'
              )}
              style={{ transform: fitToWidth ? undefined : `scale(${zoom})` }}
              draggable={false}
            />
          </div>
        )}

        {/* ── PDF mode ── */}
        {source === 'pdf' && (
          <div className="flex items-center justify-center min-h-full p-8">
            <motion.div
              className="flex flex-col items-center gap-4"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
            >
              {/* Animated gradient background */}
              <div className="relative">
                <motion.div
                  className="absolute -inset-6 rounded-3xl opacity-30"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15), rgba(59,130,246,0.15))',
                    backgroundSize: '200% 200%',
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-rose-400" />
                </div>
              </div>
              {fileName && (
                <p className="text-sm font-medium text-[var(--text-primary)] text-center max-w-[200px] truncate">
                  {fileName}
                </p>
              )}
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)]">
                PDF Document
              </span>
            </motion.div>
          </div>
        )}

        {/* ── Text mode ── */}
        {source === 'text' && rawText && (
          <div className="p-5">
            <pre className="text-sm text-[var(--text-primary)]/90 leading-relaxed whitespace-pre-wrap font-mono break-words">
              {highlightedText}
            </pre>
          </div>
        )}

        {/* ── Empty fallback ── */}
        {source === 'image' && !imageData && (
          <div className="flex items-center justify-center min-h-full p-8">
            <p className="text-sm text-[var(--text-secondary)]">No image data available</p>
          </div>
        )}
        {source === 'text' && !rawText && (
          <div className="flex items-center justify-center min-h-full p-8">
            <p className="text-sm text-[var(--text-secondary)]">No text content available</p>
          </div>
        )}
      </div>

      {/* Floating control bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          'absolute bottom-3 left-3 right-3',
          'flex items-center justify-between',
          'rounded-xl border border-[var(--glass-border)] bg-[#0B0F19]/80 backdrop-blur-[var(--blur-xl)]',
          'px-3 py-2'
        )}
      >
        {/* Source type badge */}
        <div className="flex items-center gap-1.5">
          <SourceIcon className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)] font-medium">
            {sourceLabel}
          </span>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1">
          {source === 'image' && (
            <>
              <button
                onClick={zoomOut}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface)] transition-colors"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium tabular-nums min-w-[32px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface)] transition-colors"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-[#1F2937] mx-1" />
              <button
                onClick={toggleFit}
                className={cn(
                  'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                  fitToWidth
                    ? 'text-[#3B82F6] bg-[#3B82F6]/10'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-surface)]'
                )}
                aria-label="Fit to width"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
