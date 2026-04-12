import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import FileList from '../components/common/FileList';
import ToolHeader from '../components/common/ToolHeader';
import DocumentCard from '../components/common/DocumentCard';
import ActionButton from '../components/common/ActionButton';
import ToolGuide from '../components/common/ToolGuide';
import DownloadButton from '../components/common/DownloadButton';
import { rotatePdfPages, downloadFile } from '../utils/pdf-utils';
import { RotateCw, RefreshCw, Undo, Redo, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
const pdfWorkerUrl = '/pdf.worker.min.mjs';
import Skeleton, { ToolGridSkeleton } from '../components/common/Skeleton';
import { generateId } from '../utils/security';
import AdUnit from '../components/common/AdUnit';


// Configure PDF.js worker using static asset path
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const RotateTool = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [rendering, setRendering] = useState(false);
  const [totalPageCount, setTotalPageCount] = useState(0);

  // Task Handles for Cancellation
  const loadingTaskRef = useRef(null);
  const renderTaskRef = useRef(null);
  const isAbortedRef = useRef(false);

  const abortCurrentTasks = async () => {
    isAbortedRef.current = true;
    
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) {}
      renderTaskRef.current = null;
    }

    if (loadingTaskRef.current) {
      try {
        await loadingTaskRef.current.destroy();
      } catch (e) {}
      loadingTaskRef.current = null;
    }
  };

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      abortCurrentTasks();
      setFile({
        id: generateId(),
        file: files[0]
      });
      setResult(null);
      setPages([]);
      setTotalPageCount(0);
    }
  };

  useEffect(() => {
    if (!file) return;

    const renderThumbnails = async () => {
      setRendering(true);
      isAbortedRef.current = false;

      try {
        const arrayBuffer = await file.file.arrayBuffer();
        
        const loadingTask = pdfjsLib.getDocument({ 
          data: arrayBuffer,
          stopAtErrors: false 
        });
        loadingTaskRef.current = loadingTask;

        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        setTotalPageCount(numPages);
        
        const tempPages = [];

        for (let i = 1; i <= numPages; i++) {
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
              rotation: 0
            };
            
            tempPages.push(newPage);
          } catch (renderError) {
            if (renderError.name === 'RenderingCancelledException' || isAbortedRef.current) {
              break;
            }
            throw renderError;
          }
        }

        if (!isAbortedRef.current) {
          setPages(tempPages);
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

  const rotatePage = (id, direction) => {
    setPages(prev => prev.map(page => {
      if (page.id === id) {
        const delta = direction === 'right' ? 90 : -90;
        return { ...page, rotation: (page.rotation + delta + 360) % 360 };
      }
      return page;
    }));
    setResult(null);
  };

  const rotateAll = (direction) => {
    setPages(prev => prev.map(page => {
      const delta = direction === 'right' ? 90 : -90;
      return { ...page, rotation: (page.rotation + delta + 360) % 360 };
    }));
    setResult(null);
  };

  const processRotation = async () => {
    if (!file || pages.length === 0) return;

    setProcessing(true);
    try {
      const rotationsArray = pages.map(p => p.rotation);
      const data = await rotatePdfPages(file.file, rotationsArray);
      setResult(data);
    } catch (error) {
      console.error("Rotation failed:", error);
      alert("An error occurred while rotating the PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadFile(result, `rotated_${file.file.name}`);
    }
  };

  const handleReset = () => {
    abortCurrentTasks();
    setFile(null);
    setPages([]);
    setTotalPageCount(0);
    setResult(null);
  };

  const isChanged = pages.some(p => p.rotation !== 0);
  const rotatedCount = pages.filter(p => p.rotation !== 0).length;

  return (
    <ToolLayout
      title="Rotate PDF"
      description="Select and rotate individual pages or your entire document to the perfect orientation."
      icon={RotateCw}
      color="bg-indigo-600"
      onBack={onBack}
    >
      <div className="space-y-8">
        {!file ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <ToolGuide items={[
              "Rotate pages individually for precise control or use 'Rotate All' for bulk orientation.",
              "The 'Virtual Lightbox' shows exactly how your document will look after the transformation.",
              "Click the Page Number tag in the gallery to quickly identify the page you're editing.",
              "Speed: Our rendering engine is optimized for quick feedback on high-resolution pages."
            ]} />
            <UploadArea 
              onFilesSelected={handleFileSelected} 
              multiple={false}
              description="Upload a PDF to rotate specific pages."
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ToolHeader title="Virtual Lightbox" onReset={handleReset} />
            <DocumentCard file={file} onReset={handleReset} pageCount={totalPageCount} />
            
            <ToolGuide items={[
              "Rotate pages individually for precise control or use 'Rotate All' for bulk orientation.",
              "The 'Virtual Lightbox' shows exactly how your document will look after the transformation.",
              "Click the Page Number tag in the gallery to quickly identify the page you're editing.",
              "Speed: Our rendering engine is optimized for quick feedback on high-resolution pages."
            ]} />

            {rendering && pages.length === 0 ? (
              <div className="space-y-6">
                <ToolGridSkeleton />
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
                <div className="flex flex-col sm:flex-row items-center justify-between bg-card p-3 sm:p-4 rounded-[2rem] border shadow-sm gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest px-2 sm:px-3 border-r hidden xs:inline">Document Tools</span>
                    <div className="flex sm:flex-col">
                      <p className="text-xs font-bold px-1 sm:px-2">{pages.length} Pages Loaded</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => rotateAll('left')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 hover:bg-muted rounded-xl transition-all text-[10px] sm:text-xs font-bold border"
                    >
                      <RotateCcw size={14} /> All Left
                    </button>
                    <button 
                      onClick={() => rotateAll('right')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-xl transition-all text-[10px] sm:text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105"
                    >
                      <RotateCw size={14} /> All Right
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
                  {pages.map((page) => (
                    <motion.div 
                      key={page.id}
                      layout
                      className="group relative flex flex-col gap-3 p-1 bg-card border rounded-2xl hover:border-primary/50 hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted/20 border-2 border-transparent group-hover:border-primary/20 transition-colors">
                        <motion.img 
                          animate={{ rotate: page.rotation }}
                          transition={{ type: "spring", stiffness: 200, damping: 20 }}
                          src={page.thumbnail} 
                          alt={`Page ${page.id}`}
                          className="w-full h-full object-contain p-0"
                        />
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg">
                          {page.id}
                        </div>
                        {page.rotation !== 0 && (
                          <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg">
                            {page.rotation}°
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => rotatePage(page.id, 'left')}
                          className="flex-1 p-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl transition-all duration-300 flex items-center justify-center hover:shadow-lg hover:shadow-primary/20 group/btn"
                          title="Rotate Left"
                        >
                          <Undo size={18} className="transition-transform group-hover/btn:-rotate-45" />
                        </button>
                        <button 
                          onClick={() => rotatePage(page.id, 'right')}
                          className="flex-1 p-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-2xl transition-all duration-300 flex items-center justify-center hover:shadow-lg hover:shadow-primary/20 group/btn"
                          title="Rotate Right"
                        >
                          <Redo size={18} className="transition-transform group-hover/btn:rotate-45" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex justify-center py-4">
                  <AdUnit format="horizontal" />
                </div>

                <div className="flex flex-col items-center pt-8 border-t">

                  {!result ? (
                    <ActionButton 
                      onClick={processRotation} 
                      loading={processing}
                      disabled={!isChanged}
                      className="w-full max-w-sm"
                    >
                      <RotateCw size={20} />
                      {isChanged ? `Export ${rotatedCount} Rotated Pages` : 'Rotate Pages to Export'}
                    </ActionButton>
                  ) : (
                    <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in-95 duration-300">
                      <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-500 rounded-3xl flex items-center gap-3 w-full max-w-lg mb-6 shadow-lg shadow-emerald-500/10">
                        <div className="bg-emerald-600 text-white p-2 rounded-2xl shrink-0">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Transformation Complete!</p>
                          <p className="text-xs text-emerald-800/70 dark:text-emerald-200/50">All pages have been oriented to your precise specifications.</p>
                        </div>
                      </div>
                      <DownloadButton onClick={handleDownload} fileName={`rotated_${file.file.name}`} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default RotateTool;
