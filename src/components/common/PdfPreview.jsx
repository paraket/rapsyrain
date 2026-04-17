import React, { useEffect, useState, useRef } from 'react';
import { X, FileText, ExternalLink, Loader2, Zap, Files, Eye, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { renderPagesToImages, extractPages } from '../../utils/pdf-utils';
import { PDFDocument } from 'pdf-lib';
import { useSettings } from '../../context/SettingsContext';
import AdUnit from './AdUnit';
import { cn } from '../../utils/cn';


const PREVIEW_LIMIT = 5 * 1024 * 1024; // 5MB

const PdfPreview = ({ file, onClose, forceFull = false, selectedRanges = null }) => {
  const {
    showPageNumbers,
    optimizeSplitPreview,
    setOptimizeSplitPreview,
    splitPreviewCount,
    addToCache,
    getFromCache
  } = useSettings();
  const abortControllerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, step: 'initializing' });
  const [pageImages, setPageImages] = useState([]);
  const [fullPdfUrl, setFullPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOptimized, setIsOptimized] = useState(false);
  const [pageCount, setPageCount] = useState(0);

  // Scroll to top when optimization changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [optimizeSplitPreview]);

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
      // Fingerprint file for caching - include optimization status and ranges to ensure correct retrieval
      const rangeKey = selectedRanges ? JSON.stringify(selectedRanges) : 'none';
      const fileKey = `${file.name}-${file.size}-${file.lastModified}-${optimizeSplitPreview ? 'opt' : 'full'}-${rangeKey}`;

      try {
        const arrayBuffer = await file.arrayBuffer();
        if (signal.aborted) return;

        const { PDFDocument } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalCount = pdfDoc.getPageCount();
        setPageCount(totalCount);

        const cachedData = getFromCache(fileKey);
        if (cachedData) {
          const shouldOptimize = forceFull ? optimizeSplitPreview : (file.size > PREVIEW_LIMIT);
          setIsOptimized(shouldOptimize);
          setPageImages(cachedData);
          setLoading(false);
          setProgress({ current: cachedData.length, total: cachedData.length, step: 'idle' });

          blobUrl = URL.createObjectURL(file);
          setFullPdfUrl(blobUrl);
          return;
        }

        setProgress({ current: 0, total: 0, step: 'decoding' });

        const shouldOptimize = forceFull
          ? optimizeSplitPreview
          : (file.size > PREVIEW_LIMIT);

        let pageSelection = null;
        if (shouldOptimize) {
          const limit = splitPreviewCount || 1;
          if (selectedRanges && selectedRanges.length > 0) {
            const indices = new Set();
            selectedRanges.forEach(r => {
              const start = parseInt(r.start);
              const end = parseInt(r.end);
              if (!isNaN(start) && !isNaN(end)) {
                for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                  if (i > 0 && i <= totalCount) indices.add(i);
                }
              }
            });
            // Limit to target count from settings
            pageSelection = Array.from(indices).sort((a, b) => a - b).slice(0, limit);
            if (pageSelection.length === 0) {
              pageSelection = Array.from({ length: limit }, (_, i) => i + 1);
            }
          } else {
            pageSelection = limit;
          }
        }

        setIsOptimized(shouldOptimize);

        // Progressive Rendering
        const renderedImages = await renderPagesToImages(
          file,
          pageSelection,
          (current, total) => {
            setProgress({ current, total, step: 'rendering' });
          },
          signal,
          (dataUrl, pageNo) => {
            setPageImages(prev => [...prev, { src: dataUrl, pageNumber: pageNo }]);
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
      case 'rendering': return `Painting Local Preview (${progress.current} of ${progress.total})`;
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
      className="flex flex-col h-full min-h-[400px] bg-card border rounded-3xl overflow-hidden shadow-2xl relative"
    >
      {/* Header - Divine Zero-Overlap HUD */}
      <div className="flex items-center justify-between px-7 min-h-[96px] border-b bg-muted/5 backdrop-blur-2xl sticky top-0 z-30">
        {/* Pillar A: Identity Stack */}
        <div className="flex items-center gap-5 min-w-0 flex-1">
          <div className="relative group/icon shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl group-hover/icon:bg-primary/40 transition-all duration-700" />
            <div className="relative bg-card border border-primary/20 p-3.5 rounded-2xl text-primary shadow-2xl flex items-center justify-center overflow-hidden">
              <Eye size={24} className="relative z-10" />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-primary/15 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
          
          <div className="flex flex-col min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-3">
              <h3 className="text-[18px] font-bold truncate text-foreground leading-tight tracking-tight">
                {file.name}
              </h3>
              {pageCount > 0 && (
                <span className="shrink-0 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-lg border border-primary/20 shadow-sm flex items-center gap-1.5 transition-all hover:bg-primary/20">
                  <Files size={10} className="fill-primary/10" /> {pageCount} Pages
                </span>
              )}
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-muted-foreground/50 font-black text-[10px] uppercase tracking-[0.25em] whitespace-nowrap overflow-hidden">
              <span className="selection:bg-primary/20">Advanced Preview Engine</span>
            </div>
          </div>
        </div>

        {/* Pillar B: Divine Control HUD */}
        <div className="flex flex-col items-end gap-2.5 shrink-0">
          <div className="flex items-center gap-3 pl-1.5 pr-2 py-1.5 bg-muted/20 rounded-[22px] border border-white/10 shadow-inner backdrop-blur-md">
            {/* Optimization Toggle HUD */}
            <div className="relative group/hud">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-[18px] border shadow-sm transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <button
                  onClick={() => setOptimizeSplitPreview(!optimizeSplitPreview)}
                  className={cn(
                    "relative w-9 h-5 rounded-full transition-all duration-500 outline-none shrink-0 border-2",
                    optimizeSplitPreview ? "bg-primary border-primary shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-muted-foreground/20 border-transparent"
                  )}
                  aria-label={optimizeSplitPreview ? "Disable optimization" : "Enable optimization"}
                >
                  <motion.div
                    animate={{ x: optimizeSplitPreview ? 16 : 2 }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow-md"
                  />
                </button>
                <Zap
                  size={14}
                  className={cn(
                    "transition-all duration-500",
                    optimizeSplitPreview ? "text-amber-500 fill-amber-500/20 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "text-muted-foreground/20"
                  )}
                />

                {/* HUD Tooltip */}
                <div className="absolute top-full right-[-20px] mt-5 w-68 p-4 bg-card/95 border border-primary/20 text-foreground text-[11px] rounded-2xl shadow-2xl opacity-0 group-hover/hud:opacity-100 transition-all pointer-events-none z-50 font-bold translate-y-3 group-hover/hud:translate-y-0 backdrop-blur-2xl border-l-[4px] border-l-primary/60">
                  <div className="flex items-center gap-2.5 mb-2.5 text-primary">
                    <Zap size={15} className="fill-primary/20" />
                    <span className="uppercase tracking-[0.2em]">Intelligent Performance engine</span>
                  </div>
                  Dynamic resource allocation ensures smooth previews for massive documents by focusing rendering power on visible pages.
                </div>
              </div>

              {/* HUD Status Text - Absolute HUD Subtitle */}
              <AnimatePresence>
                {isOptimized && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute top-full mt-2.5 right-1 flex items-center gap-2 whitespace-nowrap"
                  >
                    <span className="text-[10px] font-black text-amber-600/60 dark:text-amber-400/60 uppercase tracking-tight">
                      Showing Optimised <span className="text-amber-500">{pageImages.length}</span> of {pageCount}
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-white/10 mx-1" />

            {/* Tactical Actions */}
            <div className="flex items-center gap-1.5">
              {fullPdfUrl && (
                <a
                  href={fullPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 hover:bg-primary/10 rounded-xl transition-all text-muted-foreground/60 hover:text-primary group/action"
                  title="Open Original"
                >
                  <ExternalLink size={21} className="group-hover/action:scale-110 group-hover/action:-translate-y-0.5 transition-all duration-300" />
                </a>
              )}
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-destructive/10 rounded-xl transition-all text-muted-foreground/60 hover:text-destructive group/close"
                title="Close Preview"
              >
                <X size={21} className="group-hover/close:rotate-90 group-hover/close:scale-110 transition-all duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Viewer Area */}
      <div
        ref={scrollContainerRef}
        className="flex-grow relative bg-muted/5 overflow-y-auto px-6 py-8 custom-scrollbar scroll-smooth"
      >
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

              {pageImages.map((item, index) => (
                <React.Fragment key={index}>
                  <div className="relative group">
                    <div className="absolute top-2 left-2 z-10 bg-black/50 text-white text-[10px] px-2 py-1 rounded-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity backdrop-blur-sm flex items-center gap-2">
                      <span className="font-bold">Page {item.pageNumber}</span>
                      {isOptimized && <span className="text-[8px] opacity-70 border-l pl-2">Optimized View</span>}
                    </div>
                    <img
                      src={item.src}
                      alt={`Page ${item.pageNumber}`}
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
                    Preview limited to {pageImages.length} optimized pages for performance.
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
          myPDF | QPkendra
        </p>
      </div>
    </motion.div>
  );
};

export default PdfPreview;
