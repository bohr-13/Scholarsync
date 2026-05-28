'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Upload, Type, Clock, Trash2, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import UploadZone from '@/components/scan/UploadZone';
import TextInput from '@/components/scan/TextInput';
import ScanAnimation from '@/components/scan/ScanAnimation';
import ExtractionResult from '@/components/scan/ExtractionResult';
import NoticePreview from '@/components/scan/NoticePreview';
import { useScannedNotices } from '@/hooks/useScannedNotices';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/components/providers/AuthProvider';

type ScanState = 'idle' | 'scanning' | 'result';
type TabType = 'upload' | 'text';

interface SourceFile {
  type: 'pdf' | 'image' | 'text';
  data?: string;
  name?: string;
  text?: string;
}

export default function ScanPage() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [sourceFile, setSourceFile] = useState<SourceFile | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  const { notices, addNotice } = useScannedNotices();
  const { addTask } = useTasks();
  const { user } = useAuth();

  // Keep scanning screen active until both animation and API fetch conclude
  useEffect(() => {
    if (animationDone && extractedData) {
      setScanState('result');
    }
  }, [animationDone, extractedData]);

  // Handle Pasted Text Submission
  const handleTextSubmit = useCallback(async (text: string) => {
    setSourceFile({ type: 'text', text });
    setScanState('scanning');
    setAnimationDone(false);
    setExtractedData(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'text', text }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setExtractedData(result.data);
      } else {
        throw new Error(result.error || 'Failed to extract text data');
      }
    } catch (err) {
      console.error('Scan text failed:', err);
      // Minimal recovery result
      setExtractedData({
        id: `ext-${Date.now()}`,
        title: 'Notice: Academic Announcement',
        summary: 'Notice uploaded but AI extraction encountered an error.',
        rawText: text,
        extractedAt: new Date().toISOString(),
        source: 'text',
        priority: 'medium',
        category: 'other',
        requiredDocuments: [],
        importantActions: [],
        deadline: null,
        feeAmount: null,
        eventType: null,
        taskCards: [],
        fees: [],
      });
    }
  }, []);

  // Handle Drag-and-Dropped or Browsed Files
  const handleFileSelect = useCallback(async (file: File) => {
    setScanState('scanning');
    setAnimationDone(false);
    setExtractedData(null);

    const reader = new FileReader();
    
    if (file.type.startsWith('image/')) {
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          setSourceFile({ type: 'image', data: base64Data, name: file.name });
          
          const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'image', image: base64Data }),
          });
          const result = await response.json();
          if (result.success && result.data) {
            setExtractedData(result.data);
          } else {
            throw new Error(result.error || 'Failed to extract image data');
          }
        } catch (err) {
          console.error('Failed processing image:', err);
          handleFallbackFile(file);
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          setSourceFile({ type: 'pdf', data: base64Data, name: file.name });
          
          const response = await fetch('/api/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'pdf', pdf: base64Data }),
          });
          const result = await response.json();
          if (result.success && result.data) {
            setExtractedData(result.data);
          } else {
            throw new Error(result.error || 'Failed to extract PDF data');
          }
        } catch (err) {
          console.error('Failed processing PDF:', err);
          handleFallbackFile(file);
        }
      };
      reader.readAsDataURL(file);
    } else {
      handleFallbackFile(file);
    }
  }, []);

  const handleFallbackFile = (file: File) => {
    setSourceFile({
      type: file.type === 'application/pdf' ? 'pdf' : 'image',
      name: file.name,
    });
    setExtractedData({
      id: `ext-${Date.now()}`,
      title: `Notice: ${file.name.replace(/\.[^/.]+$/, '')}`,
      summary: 'File uploaded but AI extraction was unavailable or failed.',
      extractedAt: new Date().toISOString(),
      source: file.type === 'application/pdf' ? 'pdf' : 'image',
      priority: 'medium',
      category: 'other',
      requiredDocuments: [],
      importantActions: [],
      deadline: null,
      feeAmount: null,
      eventType: null,
      rawText: '',
      taskCards: [],
      fees: [],
    });
  };

  const handleScanComplete = useCallback(() => {
    setAnimationDone(true);
  }, []);

  const handleScanAnother = useCallback(() => {
    setScanState('idle');
    setExtractedData(null);
    setSourceFile(null);
    setAnimationDone(false);
  }, []);

  // Save Scanned Notice to Firestore & batch-create Tasks
  const handleAddToDashboard = useCallback(async () => {
    if (!extractedData) return;

    // Save the scanned notice to Firestore
    const { id, ...noticeData } = extractedData;
    await addNotice(noticeData);

    // Batch create all tasks from the extracted task cards
    if (user?.uid && extractedData.taskCards && extractedData.taskCards.length > 0) {
      try {
        const { addTasksFromScan } = await import('@/lib/firestore');
        await addTasksFromScan(
          user.uid,
          extractedData.taskCards,
          extractedData.priority,
          extractedData.category,
          extractedData.title
        );
      } catch (err) {
        console.error('Batch task creation failed:', err);
      }
    } else if (extractedData.deadline || extractedData.title) {
      // Fallback: create single task if no task cards exist
      await addTask({
        title: extractedData.title || 'Scanned Notice',
        description: extractedData.summary || '',
        deadline: extractedData.deadline || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        priority: extractedData.priority || 'medium',
        category: extractedData.category || 'other',
        status: 'pending',
        source: extractedData.title || 'AI Scanner',
        createdAt: new Date().toISOString(),
      });
    }

    handleScanAnother();
  }, [extractedData, addNotice, addTask, handleScanAnother, user?.uid]);

  // Load a historical scan from the recent uploads widget
  const handleSelectRecentNotice = (notice: any) => {
    setExtractedData(notice);
    setSourceFile({
      type: notice.source || 'text',
      name: notice.source !== 'text' ? notice.title : undefined,
      text: notice.source === 'text' ? notice.rawText : undefined,
    });
    setScanState('result');
  };

  // Delete a historical scanned notice
  const handleDeleteNotice = async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;
    try {
      const { deleteScannedNotice } = await import('@/lib/firestore');
      await deleteScannedNotice(user.uid, noticeId);
    } catch (err) {
      console.error('Delete notice failed:', err);
    }
  };

  // Computed Entities for Syntax Highlighting in NoticePreview
  const extractedEntities = useMemo(() => {
    if (!extractedData) return undefined;
    return {
      deadlines: extractedData.deadline ? [extractedData.deadline] : [],
      fees: extractedData.fees?.map((f: any) => f.amount).filter(Boolean) || (extractedData.feeAmount ? [extractedData.feeAmount] : []),
      actions: extractedData.importantActions || [],
    };
  }, [extractedData]);

  // Get user's last 3 uploaded notices
  const recentNotices = useMemo(() => {
    return notices
      .sort((a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime())
      .slice(0, 3);
  }, [notices]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
            <ScanLine className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">AI Notice Scanner</h1>
            <p className="text-sm text-slate-400">
              Upload any PDF, screenshot, or text to extract deadlines, tasks, and fee details
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ============================================================ */}
        {/*  IDLE / UPLOAD STATE                                         */}
        {/* ============================================================ */}
        {scanState === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            <div className="space-y-5">
              {/* Tab Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300',
                    activeTab === 'upload'
                      ? 'bg-white/[0.08] text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-300'
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('text')}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300',
                    activeTab === 'text'
                      ? 'bg-white/[0.08] text-slate-100 shadow-sm'
                      : 'text-slate-400 hover:text-slate-300'
                  )}
                >
                  <Type className="w-4 h-4" />
                  Paste Text
                </button>
              </div>

              {/* Upload/Text inputs */}
              <AnimatePresence mode="wait">
                {activeTab === 'upload' ? (
                  <motion.div
                    key="upload-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <UploadZone onFileSelect={handleFileSelect} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="text-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <TextInput onSubmit={handleTextSubmit} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Recent Scans History Widget ── */}
            {recentNotices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4 pt-4"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <h3 className="text-xs uppercase tracking-wider font-bold">Recent Notice Scans</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {recentNotices.map((notice) => (
                    <motion.div
                      key={notice.id}
                      onClick={() => handleSelectRecentNotice(notice)}
                      className={cn(
                        'group relative cursor-pointer p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]',
                        'hover:bg-white/[0.04] hover:border-blue-500/20 hover:shadow-lg hover:shadow-blue-500/[0.02]',
                        'transition-all duration-300 flex flex-col justify-between h-32'
                      )}
                      whileHover={{ y: -2 }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={cn(
                            'text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border',
                            notice.priority === 'critical' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' :
                            notice.priority === 'high' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
                            'text-blue-400 bg-blue-500/10 border-blue-500/20'
                          )}>
                            {notice.priority}
                          </span>
                          <button
                            onClick={(e) => handleDeleteNotice(notice.id, e)}
                            className="text-slate-600 hover:text-rose-400 p-1 rounded-md hover:bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-all duration-200"
                            aria-label="Delete scan record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-200 line-clamp-1 group-hover:text-blue-300 transition-colors">
                          {notice.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {notice.summary}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-2 border-t border-white/[0.04] mt-2">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-500" />
                          {notice.source.toUpperCase()}
                        </span>
                        <span>
                          {new Date(notice.extractedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  SCANNING STATE                                              */}
        {/* ============================================================ */}
        {scanState === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <ScanAnimation onComplete={handleScanComplete} />
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  SPLIT-SCREEN INTELLIGENCE DASHBOARD                         */}
        {/* ============================================================ */}
        {scanState === 'result' && extractedData && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col lg:flex-row gap-6 w-full items-start"
          >
            {/* Left Column: Source Notice Previewer */}
            <NoticePreview
              source={sourceFile?.type || 'text'}
              imageData={sourceFile?.type === 'image' ? sourceFile.data : undefined}
              fileName={sourceFile?.name}
              rawText={sourceFile?.type === 'text' ? sourceFile.text : extractedData?.rawText}
              extractedEntities={extractedEntities}
            />

            {/* Right Column: AI Extraction Intelligence Cards */}
            <div className="flex-1 w-full lg:h-[70vh] lg:overflow-y-auto lg:pr-2 space-y-6">
              <ExtractionResult
                result={extractedData}
                onScanAnother={handleScanAnother}
                onAddToDashboard={handleAddToDashboard}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
