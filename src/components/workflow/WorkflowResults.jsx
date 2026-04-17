'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle2, Archive, FileText, ChevronDown, RefreshCw } from 'lucide-react';
import { downloadFile } from '../../utils/pdf-utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '../../utils/cn';

const WorkflowResults = ({ results, onReset }) => {
  const [isZipping, setIsZipping] = useState(false);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadAll = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("workflow_results");
      
      for (const res of results) {
        const arrayBuffer = await res.arrayBuffer();
        folder.file(res.name, arrayBuffer);
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "workflow_results.zip");
    } catch (error) {
      console.error("Zipping failed:", error);
      alert("Failed to create ZIP archive.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto space-y-6 pt-12 border-t mt-12 mb-20"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[2.5rem]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight">Workflow Complete!</h3>
            <p className="text-sm font-bold text-emerald-600/70 uppercase tracking-widest leading-none mt-1">
              {results.length} files processed successfully
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-6 py-3 bg-background border border-border hover:bg-muted rounded-2xl text-sm font-bold transition-all"
          >
            <RefreshCw size={18} />
            New Workflow
          </button>
          
          <button
            onClick={handleDownloadAll}
            disabled={isZipping}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isZipping ? <RefreshCw size={18} className="animate-spin" /> : <Archive size={18} />}
            Download All (ZIP)
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {results.map((file, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex items-center justify-between p-4 bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-card rounded-2xl transition-all"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold truncate pr-4">{file.name}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  {formatSize(file.size)} • PDF DOCUMENT
                </span>
              </div>
            </div>
            
            <button
              onClick={async () => {
                const bytes = new Uint8Array(await file.arrayBuffer());
                downloadFile(bytes, file.name);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all shrink-0"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default WorkflowResults;
