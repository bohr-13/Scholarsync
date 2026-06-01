import { useState, useCallback, useEffect, useMemo } from 'react';
import { useScannedNotices } from '@/hooks/useScannedNotices';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/components/providers/AuthProvider';

export type ScanState = 'idle' | 'scanning' | 'result';
export type TabType = 'upload' | 'text';

export interface SourceFile {
  type: 'pdf' | 'image' | 'text';
  data?: string;
  name?: string;
  text?: string;
}

export function useScanLogic() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  const [extractedData, setExtractedData] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [sourceFile, setSourceFile] = useState<SourceFile | null>(null);
  const [animationDone, setAnimationDone] = useState(false);

  const { notices, addNotice } = useScannedNotices();
  const { addTask } = useTasks();
  const { user } = useAuth();

  // Keep scanning screen active until both animation and API fetch conclude
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (animationDone && extractedData) {
      timeout = setTimeout(() => setScanState('result'), 0);
    }
    return () => clearTimeout(timeout);
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

  const handleFallbackFile = useCallback((file: File) => {
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
  }, [handleFallbackFile]);

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
    const { id, ...noticeData } = extractedData; // eslint-disable-line @typescript-eslint/no-unused-vars
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
  }, [extractedData, addNotice, addTask, handleScanAnother, user]);

  // Load a historical scan from the recent uploads widget
  const handleSelectRecentNotice = useCallback((notice: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    setExtractedData(notice);
    setSourceFile({
      type: notice.source || 'text',
      name: notice.source !== 'text' ? notice.title : undefined,
      text: notice.source === 'text' ? notice.rawText : undefined,
    });
    setScanState('result');
  }, []);

  // Delete a historical scanned notice
  const handleDeleteNotice = useCallback(async (noticeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.uid) return;
    try {
      const { deleteScannedNotice } = await import('@/lib/firestore');
      await deleteScannedNotice(user.uid, noticeId);
    } catch (err) {
      console.error('Delete notice failed:', err);
    }
  }, [user]);

  // Computed Entities for Syntax Highlighting in NoticePreview
  const extractedEntities = useMemo(() => {
    if (!extractedData) return undefined;
    return {
      deadlines: extractedData.deadline ? [extractedData.deadline] : [],
      fees: extractedData.fees?.map((f: any) => f.amount).filter(Boolean) || (extractedData.feeAmount ? [extractedData.feeAmount] : []), // eslint-disable-line @typescript-eslint/no-explicit-any
      actions: extractedData.importantActions || [],
    };
  }, [extractedData]);

  // Get user's last 3 uploaded notices
  const recentNotices = useMemo(() => {
    return notices
      .sort((a, b) => new Date(b.extractedAt).getTime() - new Date(a.extractedAt).getTime())
      .slice(0, 3);
  }, [notices]);

  return {
    scanState,
    activeTab,
    setActiveTab,
    extractedData,
    sourceFile,
    recentNotices,
    extractedEntities,
    handleTextSubmit,
    handleFileSelect,
    handleScanComplete,
    handleScanAnother,
    handleAddToDashboard,
    handleSelectRecentNotice,
    handleDeleteNotice,
  };
}
