import React, { useEffect, useState } from 'react';
import { X, FileText, ExternalLink, Loader2, Zap, Files, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderPagesToImages, extractPages } from '../../utils/pdf-utils';
import { PDFDocument } from 'pdf-lib';
import { useSettings } from '../../context/SettingsContext';

const PREVIEW_LIMIT = 5 * 1024 * 1024; // 5MB

const PdfPreview = ({ file, onClose, forceFull = false }) => {
  const { 
    showPageNumbers, 
    optimizeSplitPreview, 
    splitPreviewCount 
  } = useSettings();
  const [pageImages, setPageImages] = useState([]);
  const [fullPdfUrl, setFullPdfUrl] = useState(null);
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

        const limit = shouldOptimize ? (splitPreviewCount || 1) : null;
        setIsOptimized(shouldOptimize);

        // Render pages as images for robust mobile support
        const images = await renderPagesToImages(file, limit);
        setPageImages(images);

        // Keep original blob for fullscreen/download
        blobUrl = URL.createObjectURL(file);
        setFullPdfUrl(blobUrl);
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
            <Eye size={18} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold truncate pr-2 text-foreground">{file.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-[10px] text-foreground/70 uppercase tracking-widest font-extrabold">Advanced Preview</p>

              {pageCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] bg-secondary/80 text-secondary-foreground px-2 py-0.5 rounded-full font-bold border border-border">
                  <Files size={10} /> {pageCount} Pages
                </span>
              )}

              {isOptimized && (
                <span className="flex items-center gap-1 text-[9px] bg-orange-500/10 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-md font-bold border border-orange-500/30">
                  <Zap size={10} /> 
                  Showing {pageImages.length} of {pageCount}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {fullPdfUrl && (
            <a
              href={fullPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-primary"
              title="Open Original"
            >
              <ExternalLink size={16} />
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-destructive"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-grow relative bg-muted/20 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 bg-background/80 backdrop-blur-md"
            >
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rendering Pages...</p>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4 max-w-2xl mx-auto"
            >
              {pageImages.map((src, index) => (
                <div key={index} className="relative group">
                  <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-[10px] px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    Page {index + 1}
                  </div>
                  <img 
                    src={src} 
                    alt={`Page ${index + 1}`}
                    className="w-full h-auto rounded-lg shadow-lg border border-border bg-white"
                    loading="lazy"
                  />
                </div>
              ))}
              
              {isOptimized && pageImages.length < pageCount && (
                <div className="text-center p-8 bg-background/50 rounded-2xl border-2 border-dashed border-border mt-4">
                  <p className="text-xs text-muted-foreground font-medium">
                    Preview limited to first {pageImages.length} pages for performance.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-muted/20 border-t text-center">
        <p className="text-[10px] text-muted-foreground italic font-medium">
          Powered by PDF.js Engine • High-fidelity compatible rendering mode active.
        </p>
      </div>
    </motion.div>
  );
};

export default PdfPreview;
