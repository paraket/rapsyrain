import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import FileList from '../components/common/FileList';
import ToolHeader from '../components/common/ToolHeader';
import DocumentCard from '../components/common/DocumentCard';
import ActionButton from '../components/common/ActionButton';
import ToolGuide from '../components/common/ToolGuide';
import { FileImage, RefreshCw, Download, Archive, CheckCircle2, X } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '../utils/cn';
import { sanitizeFilename } from '../utils/security';

// Static worker path for Next.js SSG
const pdfWorkerUrl = '/pdf.worker.min.mjs';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PdfToImageTool = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [images, setImages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]); // Track page indices
  const [isZipping, setIsZipping] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      setFile(files[0]);
      setImages([]);
      setSelectedPages([]);
      setPreviewItem(null);
    }
  };

  const processConvert = async () => {
    if (!file) return;

    setProcessing(true);
    setImages([]);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const resultImages = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // High quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        resultImages.push({
          page: i,
          url: dataUrl
        });

        // Free canvas memory
        canvas.width = 0;
        canvas.height = 0;

        // Yield to main thread to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      setImages(resultImages);
      if (resultImages.length > 0) setPreviewItem(resultImages[0]);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("An error occurred during conversion. Check console for details.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (url, index) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `page_${index + 1}.png`;
    link.click();
  };

  const handleReset = () => {
    setFile(null);
    setImages([]);
    setSelectedPages([]);
    setPreviewItem(null);
  };

  const togglePageSelection = (index) => {
    setSelectedPages(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
    setPreviewItem(images[index]);
  };

  const selectAll = () => setSelectedPages(images.map((_, i) => i));
  const deselectAll = () => setSelectedPages([]);

  const downloadZip = async (specificIndices = null) => {
    const indicesToZip = specificIndices || (selectedPages.length > 0 ? selectedPages : images.map((_, i) => i));

    if (indicesToZip.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const safeName = sanitizeFilename(file.name).replace(/\.pdf$/i, '');
      const folderName = safeName + '_pages';
      const imgFolder = zip.folder(folderName);

      for (const index of indicesToZip) {
        const img = images[index];
        const base64Data = img.url.replace(/^data:image\/(png|jpg);base64,/, "");
        imgFolder.file(`page_${index + 1}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
    } catch (error) {
      console.error("Zipping failed:", error);
      alert("Failed to create ZIP archive.");
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <ToolLayout
      title="PDF to Image"
      description="Convert every page of your PDF into high-quality PNG images."
      icon={FileImage}
      color="bg-emerald-500"
      onBack={onBack}
    >
      <div className={`transition-all duration-300 ease-out gap-8 ${previewItem ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr,500px]' : 'flex flex-col'
        }`}>
        <div className="space-y-8 w-full">
          {!file ? (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              <ToolGuide items={[
                "Convert every page into high-quality JPEG images instantly.",
                "Original document structure is preserved; each page becomes a standalone image.",
                "Perfect for extracting visual content or preparing files for social media.",
                "Secure: No images are uploaded. The conversion happens entirely on your machine."
              ]} />
              <UploadArea
                onFilesSelected={handleFileSelected}
                multiple={false}
                description="Upload a PDF to extract its pages as images."
              />
            </div>
          ) : (
            <div className="space-y-6">
              <ToolHeader title="Conversion Hub" onReset={handleReset} />
              <DocumentCard file={file} onReset={handleReset} />

              <ToolGuide items={[
                "Convert every page into high-quality JPEG images instantly.",
                "Original document structure is preserved; each page becomes a standalone image.",
                "Perfect for extracting visual content or preparing files for social media.",
                "Secure: No images are uploaded. The conversion happens entirely on your machine."
              ]} />

              <div className="flex flex-col items-center pt-8 border-t">
                {images.length === 0 ? (
                  <ActionButton
                    onClick={processConvert}
                    loading={processing}
                    className="w-full max-w-sm"
                  >
                    <FileImage size={20} />
                    Convert to Images
                  </ActionButton>
                ) : (
                  <div className="space-y-6 w-full">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-6 bg-card border rounded-3xl">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                              {selectedPages.length} Selected
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={selectAll}
                              className="text-xs font-bold text-primary hover:underline"
                            >
                              Select All
                            </button>
                            <span className="text-muted-foreground/30">•</span>
                            <button
                              onClick={deselectAll}
                              className="text-xs font-bold text-muted-foreground hover:text-foreground"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => downloadZip()}
                            disabled={isZipping}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                          >
                            {isZipping ? (
                              <RefreshCw size={18} className="animate-spin" />
                            ) : (
                              <Archive size={18} />
                            )}
                            {selectedPages.length > 0 ? 'Download Selected (ZIP)' : 'Download All (ZIP)'}
                          </button>
                        </div>
                      </div>

                      <div className={`grid gap-4 ${previewItem ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                        {images.map((img, idx) => {
                          const isSelected = selectedPages.includes(idx);
                          const isActive = previewItem?.page === img.page;
                          return (
                            <motion.div
                              key={idx}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: idx * 0.02 }}
                              onClick={() => togglePageSelection(idx)}
                              className={cn(
                                "group relative border rounded-2xl overflow-hidden bg-card aspect-[3/4] flex flex-col cursor-pointer transition-all duration-200",
                                isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/40",
                                isActive && "border-primary bg-primary/5"
                              )}
                            >
                              <AnimatePresence>
                                {isSelected && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-primary text-white shadow-lg"
                                  >
                                    <CheckCircle2 size={14} />
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <img src={img.url} alt={`Page ${img.page}`} className="w-full h-full object-contain p-2" />

                              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />

                              <div className={cn(
                                "py-1.5 px-3 text-[10px] font-bold text-center uppercase tracking-widest border-t transition-colors",
                                isSelected ? "bg-primary text-white" : "bg-muted/30 text-muted-foreground"
                              )}>
                                Page {img.page}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {previewItem && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="sticky top-24 h-[600px] w-full bg-muted/20 border-2 border-dashed rounded-3xl overflow-hidden flex flex-col group shadow-2xl"
            >
              <div className="p-4 border-b flex items-center justify-between bg-background/50 backdrop-blur-sm">
                <div className="min-w-0">
                  <p className="font-bold text-sm">Generated Page {previewItem.page}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">High-Res Image</p>
                </div>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow p-8 flex items-center justify-center overflow-auto">
                <motion.img
                  key={previewItem.page}
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  src={previewItem.url}
                  className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  alt={`Preview Page ${previewItem.page}`}
                />
              </div>

              <div className="p-4 bg-background/50 backdrop-blur-sm border-t flex justify-center">
                <button
                  onClick={() => handleDownload(previewItem.url, previewItem.page - 1)}
                  className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-xs hover:opacity-90 transition-all"
                >
                  <Download size={14} /> Download This Page
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default PdfToImageTool;
