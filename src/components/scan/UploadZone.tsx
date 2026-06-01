'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, FileText, Image, X, File, Camera, Clipboard, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

const FILE_TYPE_PILLS = [
  { label: 'PDF', icon: File, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/[0.12]' },
  { label: 'PNG', icon: Image, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/[0.12]' },
  { label: 'JPG', icon: Image, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/[0.12]' },
  { label: 'Camera', icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/[0.12]' },
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileTypeBadge = (file: File): string => {
  if (file.type === 'application/pdf') return 'PDF';
  if (file.type === 'image/png') return 'PNG';
  if (file.type === 'image/jpeg') return 'JPG';
  return file.name.split('.').pop()?.toUpperCase() || 'FILE';
};

export default function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showDropBounce, setShowDropBounce] = useState(false);
  const [pasteToast, setPasteToast] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Handle file selection (shared by drop, browse, paste) ──
  const handleFile = useCallback(
    (file: File) => {
      setSelectedFile(file);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      // Trigger drop-bounce micro-animation
      setShowDropBounce(true);
      setTimeout(() => setShowDropBounce(false), 600);

      onFileSelect(file);
    },
    [onFileSelect]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      handleFile(file);
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxFiles: 1,
    multiple: false,
  });

  // ── Clipboard paste support ──
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            handleFile(file);
            setPasteToast(true);
            setTimeout(() => setPasteToast(false), 2500);
          }
          break;
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      // Listen on window so paste works when container is focused
      window.addEventListener('paste', handlePaste);
      return () => window.removeEventListener('paste', handlePaste);
    }
  }, [handleFile]);

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreview(null);
  };

  // ── Floating icon animation values ──

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* ── Paste toast notification ── */}
      <AnimatePresence>
        {pasteToast && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25 backdrop-blur-xl shadow-lg shadow-emerald-500/10"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-300 whitespace-nowrap">
              Pasted from clipboard!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main dropzone ── */}
      <motion.div
        animate={showDropBounce ? { scale: [1, 1.03, 0.98, 1] } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          {...getRootProps()}
          className={cn(
            'relative group cursor-pointer rounded-2xl transition-all duration-300 overflow-hidden',
            'border-2 border-dashed',
            isDragActive
              ? 'border-blue-500/60 bg-blue-500/[0.03] scale-[1.02] shadow-[0_0_40px_-8px_rgba(59,130,246,0.25)]'
              : selectedFile
                ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                : 'border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2] hover:bg-white/[0.04]'
          )}
        >
          {/* ── Shimmer gradient border sweep ── */}
          <div
            className={cn(
              'absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500',
              isDragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
            )}
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.08) 25%, rgba(139,92,246,0.1) 50%, rgba(59,130,246,0.08) 75%, transparent 100%)',
              backgroundSize: '300% 100%',
              animation: 'shimmerSweep 3s ease-in-out infinite',
            }}
          />

          {/* ── Magnetic pulse ring on drag ── */}
          <AnimatePresence>
            {isDragActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.98, 1.01, 0.98] }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-2xl border-2 border-blue-400/30 pointer-events-none"
              />
            )}
          </AnimatePresence>

          <input {...getInputProps()} capture="environment" />

          <div className="p-10 flex flex-col items-center justify-center min-h-[280px]">
            <AnimatePresence mode="wait">
              {/* ═══════ DRAG ACTIVE STATE ═══════ */}
              {isDragActive ? (
                <motion.div
                  key="dragging"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-4"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-18 h-18 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center backdrop-blur-sm"
                  >
                    <CloudUpload className="w-9 h-9 text-blue-400" />
                  </motion.div>
                  <p className="text-lg font-medium text-blue-300">Drop your notice here</p>
                  <div className="w-24 h-1 rounded-full bg-blue-500/20 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500"
                      animate={{ width: ['0%', '100%', '0%'] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </motion.div>

              /* ═══════ FILE SELECTED STATE ═══════ */
              ) : selectedFile ? (
                <motion.div
                  key="selected"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  className="flex flex-col items-center gap-4 w-full max-w-sm"
                >
                  {/* Preview area */}
                  {preview ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="relative w-44 h-44 rounded-xl overflow-hidden border border-white/[0.1] shadow-lg shadow-black/20"
                    >
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute bottom-2 right-2">
                        <span className="px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-medium text-white/80 border border-white/[0.1]">
                          {getFileTypeBadge(selectedFile)}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                      className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center gap-1"
                    >
                      <FileText className="w-8 h-8 text-emerald-400" />
                      <span className="text-[10px] font-semibold text-emerald-400/80 tracking-wider">
                        {getFileTypeBadge(selectedFile)}
                      </span>
                    </motion.div>
                  )}

                  {/* File info */}
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-slate-200 truncate max-w-[260px]">
                      {selectedFile.name}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xs text-slate-400">
                        {formatFileSize(selectedFile.size)}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span className={cn(
                        'text-xs font-medium px-1.5 py-0.5 rounded-md border',
                        selectedFile.type === 'application/pdf'
                          ? 'text-rose-400 bg-rose-500/10 border-rose-500/[0.15]'
                          : 'text-blue-400 bg-blue-500/10 border-blue-500/[0.15]'
                      )}>
                        {getFileTypeBadge(selectedFile)}
                      </span>
                    </div>
                  </div>

                  {/* Remove button */}
                  <motion.button
                    onClick={clearFile}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 bg-white/[0.03] hover:bg-rose-500/[0.06] border border-white/[0.06] hover:border-rose-500/[0.15] transition-all duration-200"
                  >
                    <X className="w-3.5 h-3.5" />
                    Remove file
                  </motion.button>
                </motion.div>

              /* ═══════ DEFAULT / IDLE STATE ═══════ */
              ) : (
                <motion.div
                  key="default"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-5"
                >
                  {/* Floating upload icon */}
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center"
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    whileHover={{ scale: 1.08, borderColor: 'rgba(59,130,246,0.3)' }}
                  >
                    <CloudUpload className="w-8 h-8 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
                  </motion.div>

                  {/* Main text */}
                  <div className="text-center space-y-1.5">
                    <p className="text-base font-medium text-slate-200">
                      Drag & drop your notice
                    </p>
                    <p className="text-sm text-slate-400">or click to browse</p>
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
                      <Clipboard className="w-3 h-3" />
                      or paste a screenshot
                    </p>
                  </div>

                  {/* File type pills */}
                  <div className="flex items-center gap-2 mt-1">
                    {FILE_TYPE_PILLS.map((pill) => (
                      <motion.span
                        key={pill.label}
                        whileHover={{ scale: 1.08, y: -1 }}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium tracking-wide',
                          pill.bg,
                          pill.color
                        )}
                      >
                        <pill.icon className="w-3 h-3" />
                        {pill.label}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Keyframe styles ── */}
      <style jsx>{`
        @keyframes shimmerSweep {
          0% {
            background-position: -300% 0;
          }
          100% {
            background-position: 300% 0;
          }
        }
      `}</style>
    </div>
  );
}
