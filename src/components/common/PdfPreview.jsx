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

        // Throttled progressive rendering queue
        let pendingImages = [];
        let lastUpdateTime = Date.now();
        let updateTimeout = null;

        const flushImages = () => {
          if (pendingImages.length > 0) {
            setPageImages(prev => [...prev, ...pendingImages]);
            pendingImages = [];
          }
          lastUpdateTime = Date.now();
        };

        const renderedImages = await renderPagesToImages(
          file,
          pageSelection,
          (current, total) => {
            setProgress({ current, total, step: 'rendering' });
          },
          signal,
          (dataUrl, pageNo) => {
            pendingImages.push({ src: dataUrl, pageNumber: pageNo });
            setLoading(false); // Hide global loader after first page

            const now = Date.now();
            if (now - lastUpdateTime > 200) {
              flushImages();
            } else {
              if (updateTimeout) clearTimeout(updateTimeout);
              updateTimeout = setTimeout(() => {
                if (!signal.aborted) flushImages();
              }, 200);
            }
          }
        );

        if (updateTimeout) clearTimeout(updateTimeout);
        flushImages();

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
      {/* Header - Compact Responsive Premium Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 h-[72px] border-b bg-background/85 dark:bg-background/50 backdrop-blur-md sticky top-0 z-30 shrink-0">
        {/* Pillar A: Identity Stack */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="hidden sm:block relative group/icon shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover/icon:bg-primary/30 transition-all duration-700" />
            <div className="relative bg-card border border-primary/20 p-2 rounded-xl text-primary shadow-sm flex items-center justify-center overflow-hidden">
              <Eye size={18} className="relative z-10" />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
          
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold truncate text-foreground leading-tight tracking-tight max-w-[110px] min-[400px]:max-w-[160px] sm:max-w-xs" title={file.name}>
                {file.name}
              </h3>
              {pageCount > 0 && (
                <span className="shrink-0 px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] sm:text-[10px] font-semibold rounded-md border border-primary/20 shadow-sm flex items-center gap-1">
                  <Files size={9} className="fill-primary/10" /> {pageCount} Pages
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-muted-foreground/60 font-medium text-[9px] sm:text-[10px] uppercase tracking-wider">
              <span className="hidden min-[400px]:inline selection:bg-primary/20">Preview Engine</span>
              {isOptimized && (
                <>
                  <span className="hidden min-[400px]:inline text-muted-foreground/30">•</span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-sm">
                    <Zap size={8} className="fill-amber-500 text-amber-500" />
                    Optimised {pageImages.length}/{pageCount}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Pillar B: Control HUD */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 dark:bg-muted/10 rounded-xl border border-border shadow-sm backdrop-blur-md">
            {/* Optimization Toggle HUD */}
            <div className="relative group/hud">
              <button
                onClick={() => setOptimizeSplitPreview(!optimizeSplitPreview)}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] sm:text-xs font-semibold transition-all duration-200 outline-none shadow-sm cursor-pointer",
                  optimizeSplitPreview
                    ? "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                    : "bg-background hover:bg-muted border-border text-muted-foreground hover:text-foreground"
                )}
                aria-label={optimizeSplitPreview ? "Disable optimization" : "Enable optimization"}
              >
                <Zap
                  size={12}
                  className={cn(
                    "transition-all duration-200",
                    optimizeSplitPreview ? "text-amber-500 fill-amber-500/20" : "text-muted-foreground/60"
                  )}
                />
                <span className="hidden sm:inline">Optimize</span>
                {/* Small switch indicator inside button */}
                <div
                  className={cn(
                    "relative w-6 h-3.5 rounded-full transition-colors duration-200 shrink-0",
                    optimizeSplitPreview ? "bg-amber-500" : "bg-muted-foreground/30"
                  )}
                >
                  <motion.div
                    animate={{ x: optimizeSplitPreview ? 10 : 2 }}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm"
                  />
                </div>
              </button>

              {/* HUD Tooltip */}
              <div className="absolute top-full right-0 mt-3 w-64 p-3.5 bg-card border border-border text-foreground text-[11px] rounded-xl shadow-xl opacity-0 group-hover/hud:opacity-100 transition-all pointer-events-none z-50 font-medium translate-y-2 group-hover/hud:translate-y-0 backdrop-blur-xl border-l-[3px] border-l-primary">
                <div className="flex items-center gap-2 mb-1.5 text-primary font-bold">
                  <Zap size={14} className="fill-primary/20" />
                  <span className="uppercase tracking-[0.1em] text-[10px]">Performance Engine</span>
                </div>
                <p className="text-muted-foreground leading-normal">
                  Dynamic resource allocation ensures smooth previews for massive documents by focusing rendering power on visible pages.
                </p>
              </div>
            </div>

            <div className="w-px h-3.5 bg-border mx-0.5" />

            {/* Tactical Actions */}
            <div className="flex items-center gap-0.5">
              {fullPdfUrl && (
                <a
                  href={fullPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 hover:bg-muted rounded-md transition-all text-muted-foreground hover:text-foreground group/action"
                  title="Open Original"
                >
                  <ExternalLink size={16} className="group-hover/action:scale-110 transition-all duration-200" />
                </a>
              )}
              <button
                onClick={onClose}
                className="p-1 hover:bg-destructive/10 rounded-md transition-all text-muted-foreground hover:text-destructive group/close"
                title="Close Preview"
              >
                <X size={16} className="group-hover/close:rotate-90 transition-all duration-200" />
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
