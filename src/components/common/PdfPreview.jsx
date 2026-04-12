import React, { useEffect, useState, useRef } from 'react';
import { X, FileText, ExternalLink, Loader2, Zap, Files, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderPagesToImages, extractPages } from '../../utils/pdf-utils';
import { PDFDocument } from 'pdf-lib';
import { useSettings } from '../../context/SettingsContext';
import AdUnit from './AdUnit';


const PREVIEW_LIMIT = 5 * 1024 * 1024; // 5MB

const PdfPreview = ({ file, onClose, forceFull = false }) => {
  const { 
    showPageNumbers, 
    optimizeSplitPreview, 
    splitPreviewCount,
    addToCache,
    getFromCache
  } = useSettings();
  const abortControllerRef = useRef(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, step: 'initializing' });
  const [pageImages, setPageImages] = useState([]);
  const [fullPdfUrl, setFullPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOptimized, setIsOptimized] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    if (!file) return;

    // Reset state for new file
    setPageImages([]);
    setLoading(true);
    
    // Abort previous tasks
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    let blobUrl = null;
    const loadPreview = async () => {
      // Fingerprint file for caching
      const fileKey = `${file.name}-${file.size}-${file.lastModified}`;
      const cachedData = getFromCache(fileKey);

      if (cachedData) {
        setPageImages(cachedData);
        setPageCount(cachedData.length);
        setLoading(false);
        setProgress({ current: cachedData.length, total: cachedData.length, step: 'idle' });
        
        // Still create blobUrl for fullscreen/download
        blobUrl = URL.createObjectURL(file);
        setFullPdfUrl(blobUrl);
        return;
      }

      setProgress({ current: 0, total: 0, step: 'decoding' });
      try {
        const arrayBuffer = await file.arrayBuffer();
        if (signal.aborted) return;

        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        setPageCount(count);

        const shouldOptimize = forceFull 
          ? optimizeSplitPreview 
          : (file.size > PREVIEW_LIMIT);

        const limit = shouldOptimize ? (splitPreviewCount || 1) : null;
        setIsOptimized(shouldOptimize);

        // Progressive Rendering
        const renderedImages = await renderPagesToImages(
          file, 
          limit, 
          (current, total) => {
            setProgress({ current, total, step: 'rendering' });
          },
          signal,
          (newImage) => {
            setPageImages(prev => [...prev, newImage]);
            setLoading(false); // Hide global loader after first page
          }
        );
        
        if (!signal.aborted && renderedImages) {
          addToCache(fileKey, renderedImages);
        }
        
        setProgress(prev => ({ ...prev, step: 'finalizing' }));

        // Keep original blob for fullscreen/download
        if (!signal.aborted) {
          blobUrl = URL.createObjectURL(file);
          setFullPdfUrl(blobUrl);
        }
      } catch (error) {
        if (error.message !== 'AbortError') {
          console.error('Preview error:', error);
        }
      } finally {
        if (!signal.aborted) {
          setLoading(false);
          setProgress(prev => ({ ...prev, step: 'idle', current: 0, total: 0 }));
        }
      }
    };

    loadPreview();

    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [file, optimizeSplitPreview, splitPreviewCount, forceFull]);

  if (!file) return null;

  const getStepText = () => {
    switch (progress.step) {
      case 'decoding': return 'Initializing Secure Engine...';
      case 'rendering': return `Painting Local Preview (Page ${progress.current} of ${progress.total})`;
      case 'finalizing': return 'Finalizing Visuals...';
      default: return 'Preparing Sandbox...';
    }
  };

  const percent = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

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
              className="absolute inset-0 flex flex-col items-center justify-center p-8 z-10 bg-background/95 backdrop-blur-sm"
            >
              <div className="relative w-32 h-32 flex items-center justify-center mb-8">
                {/* 1. Pulsing Shield (Idea #2) */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                />
                
                <div className="relative z-10 p-6 bg-card border shadow-xl rounded-[2rem] flex items-center justify-center overflow-hidden">
                  <FileText size={48} className="text-primary/40" />
                  
                  {/* 2. Magic Scan Line (Idea #4) */}
                  <motion.div
                    animate={{ top: ['-10%', '110%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(var(--primary),0.5)] z-20"
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap size={24} className="text-primary animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="w-full max-w-[280px] space-y-4">
                {/* 3. Sequential Task Text (Idea #3) */}
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] animate-pulse">
                    {getStepText()}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 font-bold uppercase italic">
                    100% Secure (On your device)
                  </p>

                </div>

                {/* 4. Quantitative Progress Bar (Idea #5) */}
                <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden border shadow-inner">
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  />
                </div>
                
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-black text-primary uppercase">{percent}%</span>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Secure</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-4 max-w-2xl mx-auto"
            >

              {pageImages.map((src, index) => (
                <React.Fragment key={index}>
                  <div className="relative group">
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
                  {/* Minimal Ad every 4 pages */}
                  {(index + 1) % 4 === 0 && (
                    <AdUnit slotId="9788893186" format="horizontal" className="my-2" />
                  )}
                </React.Fragment>
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
