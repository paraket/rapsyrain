import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import ToolHeader from '../components/common/ToolHeader';
import DocumentCard from '../components/common/DocumentCard';
import ActionButton from '../components/common/ActionButton';
import ToolGuide from '../components/common/ToolGuide';
import DownloadButton from '../components/common/DownloadButton';
import { removePages, downloadFile, getAdIntervals } from '../utils/pdf-utils';
import {
  Trash2, RefreshCw, CheckCircle2, Loader2,
  Maximize2, X, AlertCircle, Trash, Info, Plus,
  ZoomIn, ZoomOut, RotateCcw, File
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
const pdfWorkerUrl = '/pdf.worker.min.mjs';
import Skeleton, { ToolGridSkeleton, LoadingCard } from '../components/common/Skeleton';
import { generateId } from '../utils/security';
import { useSettings } from '../context/SettingsContext';
import AdUnit from '../components/common/AdUnit';


// Configure PDF.js worker using static asset path
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const RemovePagesTool = ({ onBack }) => {
  const { maxPageCap, progressiveLoading } = useSettings();
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
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

          // Render Task
          const renderTask = page.render({ canvasContext: context, viewport });
          renderTaskRef.current = renderTask;

          try {
            await renderTask.promise;
            if (isAbortedRef.current) break;

            const newPage = {
              id: i,
              thumbnail: canvas.toDataURL(),
              isRemoved: false
            };
            
            tempPages.push(newPage);
            batch.push(newPage);
            setRenderProgress(Math.round((i / pagesToRender) * 100));

            if (progressiveLoading && (batch.length >= 10 || i === pagesToRender)) {
              setPages(prev => [...prev, ...batch]);
              batch = [];
            }
          } catch (renderError) {
            // Silence cancellation errors
            if (renderError.name === 'RenderingCancelledException' || isAbortedRef.current) {
              break;
            }
            throw renderError;
          }
        }

        if (!isAbortedRef.current) {
          if (!progressiveLoading) {
            setPages(tempPages);
          }
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

  const togglePageRemoval = (id) => {
    setPages(prev => prev.map(page =>
      page.id === id ? { ...page, isRemoved: !page.isRemoved } : page
    ));
    setResult(null);
  };

  const handleProcess = async () => {
    if (!file || pages.length === 0) return;

    const indicesToRemove = pages
      .filter(p => p.isRemoved)
      .map(p => p.id - 1);

    if (indicesToRemove.length === 0) {
      alert("Please select at least one page to remove.");
      return;
    }

    if (indicesToRemove.length === pages.length) {
      alert("You cannot remove all pages from the PDF.");
      return;
    }

    setProcessing(true);
    try {
      const data = await removePages(file.file, indicesToRemove);
      setResult(data);
    } catch (error) {
      console.error("Removal failed:", error);
      alert("An error occurred while removing pages.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadFile(result, `modified_${file.file.name}`);
    }
  };

  const handleReset = () => {
    abortCurrentTasks();
    setFile(null);
    setPages([]);
    setTotalPageCount(0);
    setRenderProgress(0);
    setIsCapped(false);
    setResult(null);
    setPreviewPage(null);
  };

  const removedCount = pages.filter(p => p.isRemoved).length;

  return (
    <ToolLayout
      title="Remove Pages"
      description="Visually select and strike out pages you want to delete from your document."
      icon={Trash2}
      color="bg-primary"
      onBack={onBack}
    >
      <div className="space-y-8">
        {!file ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <ToolGuide items={[
              "Click any page thumbnail to mark it for removal (it will strike through).",
              "Click a removed page again to keep it (undo removal).",
              "Use the 'Select all' or 'Clear all' icons for bulk page management.",
              "Safety: Your original PDF is never modified; we create a new, clean version locally."
            ]} />
            <UploadArea
              onFilesSelected={handleFileSelected}
              multiple={false}
              description="Upload a PDF to see all its pages in the lightbox."
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ToolHeader title="Virtual Lightbox" onReset={handleReset} />
            <DocumentCard file={file} onReset={handleReset} pageCount={totalPageCount} />

            <ToolGuide items={[
              "Click any page thumbnail to mark it for removal (it will strike through).",
              "Click a removed page again to keep it (undo removal).",
              "Use the 'Select all' or 'Clear all' icons for bulk page management.",
              "Safety: Your original PDF is never modified; we create a new, clean version locally."
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


            {rendering && pages.length === 0 ? (
               <div className="space-y-6">
                <ToolGridSkeleton progress={renderProgress} />
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out w-full">
                <div className="flex flex-col sm:flex-row items-center justify-between bg-card p-3 sm:p-4 rounded-[2rem] border shadow-sm gap-4 w-full">
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest px-2 sm:px-3 border-r hidden xs:inline">Document Tools</span>
                    <div className="flex sm:flex-col">
                      <p className="text-xs font-bold px-1 sm:px-2">{pages.length} Total Pages</p>
                      <p className={`text-[10px] font-black uppercase tracking-tight px-1 sm:px-2 truncate ${removedCount > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
                        {removedCount} marked for removal
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setPages(pages.map(p => ({ ...p, isRemoved: true })))}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 hover:bg-rose-500/10 rounded-xl transition-all text-[10px] sm:text-xs font-bold text-rose-600 border border-rose-500/10"
                    >
                      <Trash size={12} /> Remove All
                    </button>
                    {removedCount > 0 && (
                      <button
                        onClick={() => setPages(pages.map(p => ({ ...p, isRemoved: false })))}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 hover:bg-muted rounded-xl transition-all text-[10px] sm:text-xs font-bold text-muted-foreground border shadow-sm"
                      >
                        <X size={12} /> Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                  {pages.map((page, index) => (
                    <React.Fragment key={page.id}>
                      <motion.div
                        layout
                        className={`group relative flex flex-col gap-3 p-1 bg-card border rounded-2xl transition-all duration-300 ${page.isRemoved
                          ? 'border-rose-500/50 bg-rose-50/30 dark:bg-rose-950/20'
                          : 'hover:border-primary/50 hover:shadow-xl'
                          }`}
                      >
                        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted/20">
                          <img
                            src={page.thumbnail}
                            alt={`Page ${page.id}`}
                            className={`w-full h-full object-contain p-0 transition-all duration-300 ${page.isRemoved ? 'grayscale opacity-30 scale-95' : ''
                              }`}
                          />

                          {/* Dynamic Status Overlay */}
                          <AnimatePresence>
                            {page.isRemoved && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => togglePageRemoval(page.id)}
                                className="absolute inset-0 z-10 overflow-hidden cursor-pointer"
                              >
                                <div className="absolute inset-0 bg-rose-500/20 backdrop-grayscale backdrop-blur-[2px]" />
                                <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-lg">
                                  <motion.line
                                    x1="0" y1="0" x2="100%" y2="100%"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    className="text-rose-600"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.4, ease: "circOut" }}
                                  />
                                  <motion.line
                                    x1="100%" y1="0" x2="0" y2="100%"
                                    stroke="currentColor"
                                    strokeWidth="12"
                                    className="text-rose-600/50"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.4, delay: 0.1, ease: "circOut" }}
                                  />
                                </svg>

                                <motion.div
                                  initial={{ opacity: 0, scale: 0.5, y: 10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  className="absolute inset-0 flex items-center justify-center p-4"
                                >
                                  <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-2xl ring-4 ring-rose-500/30">
                                    <Trash2 size={28} className="animate-bounce" />
                                  </div>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg">
                            {page.id}
                          </div>

                          <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewPage(page);
                              }}
                              className="p-3 bg-white text-black rounded-2xl hover:scale-110 transition-transform shadow-xl"
                              title="Preview Page"
                            >
                              <Maximize2 size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                togglePageRemoval(page.id);
                              }}
                              className={`p-3 rounded-2xl hover:scale-110 transition-transform shadow-xl ${page.isRemoved ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}
                              title={page.isRemoved ? "Keep Page" : "Delete Page"}
                            >
                              {page.isRemoved ? <Plus size={18} /> : <Trash2 size={18} />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                      {adIntervals.includes(index) && (
                        <AdUnit key={`ad-${index}`} className="col-span-full" />
                      )}
                    </React.Fragment>
                  ))}
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
                      disabled={removedCount === 0 || removedCount === pages.length}
                      className="w-full max-w-sm"
                    >
                      {removedCount === 0 ? (
                        <>
                          <Info size={20} />
                          Select Pages to Remove
                        </>
                      ) : removedCount === pages.length ? (
                        <>
                          <AlertCircle size={20} />
                          Cannot Remove All Pages
                        </>
                      ) : (
                        <>
                          <Trash size={20} />
                          Remove {removedCount} {removedCount === 1 ? 'Page' : 'Pages'}
                        </>
                      )}
                    </ActionButton>
                  ) : (
                    <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in-95 duration-300">
                      <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-500 rounded-3xl flex items-center gap-3 w-full max-w-lg mb-6 shadow-lg shadow-emerald-500/10">
                        <div className="bg-emerald-600 text-white p-2 rounded-2xl shrink-0">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Cleanup Successful!</p>
                          <p className="text-xs text-emerald-800/70 dark:text-emerald-200/50">Your updated document only contains the pages you wanted to keep.</p>
                        </div>
                      </div>
                      <DownloadButton onClick={handleDownload} fileName={`modified_${file.file.name}`} />
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
                >
                  <X size={24} />
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
                  >
                    <ZoomOut size={18} />
                  </button>
                  <div className="px-3 min-w-[60px] text-center text-xs font-black text-white border-x border-white/10">
                    {Math.round(zoomLevel * 100)}%
                  </div>
                  <button
                    onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                    className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    className="p-2 hover:bg-white/20 rounded-xl text-white transition-colors ml-1"
                    title="Reset Zoom"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 border-t bg-muted/10 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPreviewPage(null)}
                  className="flex-1 py-4 px-6 border rounded-2xl font-bold hover:bg-card transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    togglePageRemoval(previewPage.id);
                    setPreviewPage(null);
                  }}
                  className={`flex-2 py-4 px-8 rounded-2xl font-bold text-white transition-all shadow-lg ${previewPage.isRemoved ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-500 shadow-rose-500/20'}`}
                >
                  {previewPage.isRemoved ? "Keep This Page" : "Delete This Page"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolLayout>
  );
};

export default RemovePagesTool;
