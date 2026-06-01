"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Upload, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import UploadZone from "@/components/scan/UploadZone";
import TextInput from "@/components/scan/TextInput";
import ScanAnimation from "@/components/scan/ScanAnimation";
import ExtractionResult from "@/components/scan/ExtractionResult";
import NoticePreview from "@/components/scan/NoticePreview";
import RecentScans from "@/components/scan/RecentScans";
import { useScanLogic } from "./useScanLogic";

export default function ScanPage() {
  const {
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
  } = useScanLogic();

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
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              AI Notice Scanner
            </h1>
            <p className="text-sm text-slate-400">
              Upload any PDF, screenshot, or text to extract deadlines, tasks,
              and fee details
            </p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ============================================================ */}
        {/*  IDLE / UPLOAD STATE                                         */}
        {/* ============================================================ */}
        {scanState === "idle" && (
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
                  onClick={() => setActiveTab("upload")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
                    activeTab === "upload"
                      ? "bg-white/[0.08] text-slate-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-300",
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab("text")}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300",
                    activeTab === "text"
                      ? "bg-white/[0.08] text-slate-100 shadow-sm"
                      : "text-slate-400 hover:text-slate-300",
                  )}
                >
                  <Type className="w-4 h-4" />
                  Paste Text
                </button>
              </div>

              {/* Upload/Text inputs */}
              <AnimatePresence mode="wait">
                {activeTab === "upload" ? (
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
            <RecentScans
              recentNotices={recentNotices}
              onSelectNotice={handleSelectRecentNotice}
              onDeleteNotice={handleDeleteNotice}
            />
          </motion.div>
        )}

        {/* ============================================================ */}
        {/*  SCANNING STATE                                              */}
        {/* ============================================================ */}
        {scanState === "scanning" && (
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
        {scanState === "result" && extractedData && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col lg:flex-row gap-6 w-full items-start"
          >
            {/* Left Column: Source Notice Previewer */}
            <NoticePreview
              source={sourceFile?.type || "text"}
              imageData={
                sourceFile?.type === "image" ? sourceFile.data : undefined
              }
              fileName={sourceFile?.name}
              rawText={
                sourceFile?.type === "text"
                  ? sourceFile.text
                  : extractedData?.rawText
              }
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
