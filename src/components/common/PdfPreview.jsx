import React, { useEffect, useState } from 'react';
import { X, FileText, ExternalLink, Loader2, Zap, Files } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractPages } from '../../utils/pdf-utils';
import { PDFDocument } from 'pdf-lib';
import { useSettings } from '../../context/SettingsContext';

const PREVIEW_LIMIT = 5 * 1024 * 1024; // 5MB

const PdfPreview = ({ file, onClose, forceFull = false }) => {
  const { 
    showPageNumbers, 
    optimizeSplitPreview, 
    splitPreviewCount 
  } = useSettings();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOptimized, setIsOptimized] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    if (!file) return;

    let blobUrl = null;
    const loadPreview = async () => {
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setPageCount(count);

        const shouldOptimize = forceFull 
          ? optimizeSplitPreview 
          : (file.size > PREVIEW_LIMIT);

        if (shouldOptimize) {
          setIsOptimized(true);
          const countToExtract = splitPreviewCount || 1;
          const optimizedBlob = await extractPages(file, countToExtract);
          blobUrl = URL.createObjectURL(optimizedBlob);
        } else {
          setIsOptimized(false);
          blobUrl = URL.createObjectURL(file);
        }
        setUrl(blobUrl);
      } catch (error) {
        console.error('Preview error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreview();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [file, optimizeSplitPreview, splitPreviewCount, forceFull]);

  if (!file) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col h-[calc(100vh-12rem)] min-h-[400px] bg-card border rounded-3xl overflow-hidden shadow-2xl relative sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="bg-primary/10 p-2 rounded-lg text-primary shrink-0">
            <FileText size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate pr-2 text-foreground">{file.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-[10px] text-foreground/70 uppercase tracking-widest font-extrabold">Native Preview</p>

              {pageCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-full font-bold border border-border">
                  <Files size={10} /> {pageCount} Pages
                </span>
              )}

              {isOptimized && (
                <span className="flex items-center gap-1 text-[9px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-md font-bold border border-orange-500/30 animate-pulse">
                  <Zap size={10} /> 
                  {splitPreviewCount > 1 ? `Pages 1-${splitPreviewCount}` : 'Page 1'} of {pageCount} (Optimized)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary"
            title="Open Fullscreen"
          >
            <ExternalLink size={16} />
          </a>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-destructive"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-grow relative bg-background">
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-background/80 backdrop-blur-md"
            >
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Optimizing View...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {url && (
          <iframe
            src={showPageNumbers ? url : `${url}#toolbar=0&navpanes=0`}
            className="w-full h-full border-none"
            title="PDF Preview"
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-muted/20 border-t text-center">
        <p className="text-[10px] text-muted-foreground italic font-medium">
          {showPageNumbers
            ? "Advanced Indicators Enabled: Use the browser scrollbar to see page numbers."
            : "Option A (Lightweight): Clean preview mode active. Enable page numbers in Settings."}
        </p>
      </div>
    </motion.div>
  );
};

export default PdfPreview;
