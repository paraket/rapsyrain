import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import ToolHeader from '../components/common/ToolHeader';
import DocumentCard from '../components/common/DocumentCard';
import ActionButton from '../components/common/ActionButton';
import ToolGuide from '../components/common/ToolGuide';
import DownloadButton from '../components/common/DownloadButton';
import { reorderPdfPages, downloadFile } from '../utils/pdf-utils';
import {
  Layers, RefreshCw, CheckCircle2,
  Maximize2, X, ZoomIn, ZoomOut, RotateCcw,
  ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
const pdfWorkerUrl = '/pdf.worker.min.mjs';
import { generateId } from '../utils/security';
import { useSettings } from '../context/SettingsContext';
import AdUnit from '../components/common/AdUnit';
import { AlertCircle } from 'lucide-react';
import Skeleton, { ToolGridSkeleton, LoadingCard } from '../components/common/Skeleton';
import { getAdIntervals } from '../utils/pdf-utils';

// Configure PDF.js worker using static asset path
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const ReorderPagesTool = ({ onBack }) => {
  const { maxPageCap, progressiveLoading } = useSettings();
  const [file, setFile] = useState(null);
  const [useLocalBatching, setUseLocalBatching] = useState(progressiveLoading);
  const [pages, setPages] = useState([]);
  const [originalPages, setOriginalPages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [result, setResult] = useState(null);
  const [previewPage, setPreviewPage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isCapped, setIsCapped] = useState(false);

  // Task Handles for Cancellation
  const loadingTaskRef = useRef(null);
  const renderTaskRef = useRef(null);
  const isAbortedRef = useRef(false);

  const adIntervals = React.useMemo(() => getAdIntervals(totalPageCount), [totalPageCount]);

  const abortCurrentTasks = async () => {
    isAbortedRef.current = true;

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) { }
      renderTaskRef.current = null;
    }

    if (loadingTaskRef.current) {
      try {
        await loadingTaskRef.current.destroy();
      } catch (e) { }
      loadingTaskRef.current = null;
    }
  };

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      setFile({
        id: generateId(),
        file: files[0]
      });
      setResult(null);
      setPages([]);
      setOriginalPages([]);
      setTotalPageCount(0);
      setRenderProgress(0);
      setIsCapped(false);
    }
  };

  useEffect(() => {
    if (!file) return;

    const renderThumbnails = async () => {
      setRendering(true);
      setRenderProgress(0);
      isAbortedRef.current = false;

      try {
        const arrayBuffer = await file.file.arrayBuffer();

        // Document Loading Task
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          stopAtErrors: false
        });
        loadingTaskRef.current = loadingTask;

        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        setTotalPageCount(numPages);

        if (numPages <= 10) {
          setUseLocalBatching(false);
        } else {
          setUseLocalBatching(progressiveLoading);
        }

        if (numPages > maxPageCap) setIsCapped(true);
        const pagesToRender = Math.min(numPages, maxPageCap);

        const tempPages = [];
        let batch = [];
        for (let i = 1; i <= pagesToRender; i++) {
          if (isAbortedRef.current) break;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderTask = page.render({ canvasContext: context, viewport });
          renderTaskRef.current = renderTask;

          try {
            await renderTask.promise;
            if (isAbortedRef.current) break;

            const newPage = {
              id: i,
              thumbnail: canvas.toDataURL(),
            };

            tempPages.push(newPage);
            batch.push(newPage);
            setRenderProgress(Math.round((i / pagesToRender) * 100));

            if (useLocalBatching && (batch.length >= 10 || i === pagesToRender)) {
              setPages(prev => [...prev, ...batch]);
              batch = [];
            }
          } catch (renderError) {
            if (renderError.name === 'RenderingCancelledException' || isAbortedRef.current) {
              break;
            }
            throw renderError;
          }
        }

        if (!isAbortedRef.current) {
          setPages([...tempPages]);
          setOriginalPages([...tempPages]);
        }
      } catch (error) {
        if (!isAbortedRef.current) {
          console.error("Rendering failed:", error);
        }
      } finally {
        if (!isAbortedRef.current) {
          setRendering(false);
          loadingTaskRef.current = null;
          renderTaskRef.current = null;
        }
      }
    };

    renderThumbnails();

    return () => {
      abortCurrentTasks();
    };
  }, [file]);

  const movePage = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pages.length) return;

    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[newIndex];
    newPages[newIndex] = temp;
    setPages(newPages);
    setResult(null);
  };

  const jumpToPage = (currentIndex, targetIndex) => {
    if (targetIndex < 0 || targetIndex >= pages.length || currentIndex === targetIndex) return;
    
    const newPages = [...pages];
    const [movedPage] = newPages.splice(currentIndex, 1);
    newPages.splice(targetIndex, 0, movedPage);
    setPages(newPages);
    setResult(null);
  };

  const handleProcess = async () => {
    if (!file || pages.length === 0) return;

    setProcessing(true);
    try {
      const indices = pages.map(p => p.id - 1);
      const data = await reorderPdfPages(file.file, indices);
      setResult(data);
    } catch (error) {
      console.error("Reorder failed:", error);
      alert("An error occurred while reordering pages.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadFile(result, `reordered_${file.file.name}`);
    }
  };

  const handleReset = () => {
    abortCurrentTasks();
    setFile(null);
    setPages([]);
    setOriginalPages([]);
    setTotalPageCount(0);
    setRenderProgress(0);
    setIsCapped(false);
    setResult(null);
    setPreviewPage(null);
  };

  const isChanged = pages.some((p, i) => p.id - 1 !== i);

  return (
    <ToolLayout
      title="Reorder Pages"
      description="Quickly rearrange your PDF document by shifting pages to their new positions."
      icon={Layers}
      color="bg-primary"
      onBack={onBack}
    >
      <div className="space-y-8">
        {!file ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <ToolGuide items={[
              "Rearrange your PDF pages with high-precision 'Move' controls.",
              "The Gallery View shows exactly where each page originated (original ID).",
              "Look for the 'Primary Highlight' to identify pages that have been shifted.",
              "Pro Tip: Our engine rebuilds the PDF structure without re-encoding, preserving quality."
            ]} />

            {isCapped && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-2xl flex items-center gap-3 text-orange-800 animate-in slide-in-from-top-2 duration-300">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-bold leading-tight">
                  Document limited to the first <span className="underline decoration-2">{maxPageCap} pages</span> for performance.
                  You can increase this in the <button onClick={onBack} className="underline hover:text-orange-950 px-1 border-b-2 border-orange-500">Settings</button>.
                </p>
              </div>
            )}

            <UploadArea
              onFilesSelected={handleFileSelected}
              multiple={false}
              description="Upload a PDF to rearrange its pages."
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ToolHeader title="Document Gallery" onReset={handleReset} />
            <DocumentCard file={file} onReset={handleReset} pageCount={totalPageCount} />

            <ToolGuide items={[
              "Rearrange your PDF pages with high-precision 'Move' controls.",
              "The Gallery View shows exactly where each page originated (original ID).",
              "Look for the 'Primary Highlight' to identify pages that have been shifted.",
              "Pro Tip: Our engine rebuilds the PDF structure without re-encoding, preserving quality."
            ]} />

            {rendering && pages.length === 0 ? (
              <div className="space-y-6">
                <ToolGridSkeleton progress={renderProgress} />
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                <div className="flex flex-col sm:flex-row items-center justify-between bg-card p-3 sm:p-4 rounded-[2rem] border shadow-sm gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest px-2 sm:px-3 border-r hidden xs:inline">Order Controls</span>
                    <div className="flex sm:flex-col">
                      <p className="text-xs font-bold px-1 sm:px-2">{pages.length} / {totalPageCount} Pages Loaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {totalPageCount > 10 && (
                      <button
                        onClick={() => setUseLocalBatching(!useLocalBatching)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border shadow-sm ${useLocalBatching ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-muted/50 border-transparent text-muted-foreground'}`}
                      >
                        <Zap size={14} className={useLocalBatching ? 'animate-pulse' : ''} />
                        {useLocalBatching ? 'Progressive ON' : 'Progressive OFF'}
                      </button>
                    )}
                    {isChanged && (
                      <button
                        onClick={() => setPages([...originalPages])}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-xl transition-all text-xs font-bold border shadow-sm animate-in fade-in slide-in-from-right-4"
                      >
                        <RefreshCw size={14} /> Reset Order
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 overflow-hidden p-2">
                  <AnimatePresence mode="popLayout">
                    {pages.map((page, index) => {
                      const isMoved = page.id - 1 !== index;
                      return (
                        <React.Fragment key={page.id}>
                          <motion.div
                            layout
                            key={page.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                              mass: 0.8
                            }}
                            className={`group relative flex flex-col gap-3 p-1 bg-card border rounded-2xl transition-all duration-300 ${isMoved
                                ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20'
                                : 'hover:border-primary/50'
                              }`}
                          >
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted/20 border-2 border-transparent group-hover:border-primary/20 transition-colors">
                              <img
                                src={page.thumbnail}
                                alt={`Page ${page.id}`}
                                className="w-full h-full object-contain p-0 pointer-events-none"
                              />

                              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1.5">
                                {page.id}
                                {isMoved && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"
                                  />
                                )}
                              </div>

                              {isMoved && (
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary text-[8px] font-black text-white rounded-md shadow-lg uppercase tracking-tighter">
                                  Moved
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1 sm:gap-1.5 p-1.5 bg-muted/30 md:bg-transparent rounded-2xl md:opacity-0 md:translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
                              <button
                                onClick={() => movePage(index, -1)}
                                disabled={index === 0}
                                className="shrink-0 p-1.5 sm:p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-10 group/btn"
                                aria-label="Move page left"
                                title="Move Left"
                              >
                                <ChevronLeft size={14} className="sm:w-4 sm:h-4 transition-transform group-hover/btn:-translate-x-0.5" aria-hidden="true" />
                              </button>

                              <div className="relative flex-1 min-w-0 group/input">
                                <input
                                  type="number"
                                  min="1"
                                  max={pages.length}
                                  defaultValue={index + 1}
                                  key={`input-${index}-${pages[index].id}`}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = parseInt(e.target.value);
                                      if (!isNaN(val)) {
                                        jumpToPage(index, val - 1);
                                      }
                                      e.target.blur();
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val !== index + 1) {
                                      jumpToPage(index, val - 1);
                                    } else {
                                      e.target.value = index + 1;
                                    }
                                  }}
                                  className="w-full py-1.5 sm:py-2 px-0.5 text-center bg-background/50 backdrop-blur-sm border border-transparent focus:border-primary/30 focus:bg-background rounded-xl text-[10px] sm:text-xs font-black transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner"
                                  title="Enter target position"
                                />
                              </div>
                              
                              <button
                                onClick={() => setPreviewPage(page)}
                                className="shrink-0 p-1.5 sm:p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center group/btn"
                                aria-label="Preview page"
                                title="Preview"
                              >
                                <Maximize2 size={14} className="sm:w-4 sm:h-4 transition-transform group-hover/btn:scale-110" aria-hidden="true" />
                              </button>

                              <button
                                onClick={() => movePage(index, 1)}
                                disabled={index === pages.length - 1}
                                className="shrink-0 p-1.5 sm:p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-10 group/btn"
                                aria-label="Move page right"
                                title="Move Right"
                              >
                                <ChevronRight size={14} className="sm:w-4 sm:h-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
                              </button>
                            </div>
                          </motion.div>
                          {adIntervals.includes(index) && (
                            <AdUnit key={`ad-${index}`} className="col-span-full" />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </AnimatePresence>
                  {rendering && pages.length < Math.min(totalPageCount, maxPageCap) && (
                    <LoadingCard progress={renderProgress} />
                  )}
                </div>

                <div className="flex justify-center py-4">
                  <AdUnit format="horizontal" />
                </div>

                <div className="flex flex-col items-center pt-8 border-t">
                  {!result ? (
                    <ActionButton
                      onClick={handleProcess}
                      loading={processing}
                      disabled={pages.length === 0 || !isChanged}
                      className="w-full max-w-sm"
                    >
                      <Layers size={20} />
                      Export Reordered PDF
                    </ActionButton>
                  ) : (
                    <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in-95 duration-300">
                      <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-500 rounded-3xl flex items-center gap-3 w-full max-w-lg mb-6 shadow-lg shadow-emerald-500/10">
                        <div className="bg-emerald-600 text-white p-2 rounded-2xl shrink-0">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Ordering Successful!</p>
                          <p className="text-xs text-emerald-800/70 dark:text-emerald-200/50">Your document has been re-arranged exactly as you specified.</p>
                        </div>
                      </div>
                      <DownloadButton onClick={handleDownload} fileName={`reordered_${file.file.name}`} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {previewPage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card w-full max-w-3xl max-h-full rounded-[32px] overflow-hidden flex flex-col shadow-2xl relative border"
            >
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary font-black text-xs">
                    PAGE {previewPage.id}
                  </div>
                  <h3 className="font-bold">Full Preview</h3>
                </div>
                <button
                  onClick={() => setPreviewPage(null)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label="Close preview"
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              <div className="flex-grow overflow-auto p-8 bg-muted/20 flex items-center justify-center relative group/modal">
                <motion.img
                  animate={{ scale: zoomLevel }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  src={previewPage.thumbnail}
                  alt="Full preview"
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-xl origin-center"
                />
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl opacity-0 group-hover/modal:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                    className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"
                    aria-label="Zoom out"
                  >
                    <ZoomOut size={18} aria-hidden="true" />
                  </button>
                  <div className="px-3 min-w-[60px] text-center text-xs font-black text-white border-x border-white/10">
                    {Math.round(zoomLevel * 100)}%
                  </div>
                  <button
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                    className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"
                    aria-label="Zoom in"
                  >
                    <ZoomIn size={18} aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors ml-1"
                    aria-label="Reset zoom"
                    title="Reset Zoom"
                  >
                    <RotateCcw size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="p-6 border-t bg-muted/10 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPreviewPage(null)}
                  className="w-full py-4 px-6 border rounded-2xl font-bold hover:bg-card transition-all"
                >
                  Close Preview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolLayout>
  );
};

export default ReorderPagesTool;
