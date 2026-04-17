import React, { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import FileList from '../components/common/FileList';
import ToolHeader from '../components/common/ToolHeader';
import DocumentCard from '../components/common/DocumentCard';
import ToolGuide from '../components/common/ToolGuide';
import ActionButton from '../components/common/ActionButton';
import DownloadButton from '../components/common/DownloadButton';
import PdfPreview from '../components/common/PdfPreview';
import { splitPdf, downloadFile, getPdfLib } from '../utils/pdf-utils';
import { Scissors, RefreshCw, Plus, Trash2, CheckCircle2, Archive, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '../utils/cn';
import { sanitizeFilename, generateId } from '../utils/security';
import AdUnit from '../components/common/AdUnit';
import { useSettings } from '../context/SettingsContext';

const SplitTool = ({ onBack }) => {
  const { optimizeSplitPreview, setOptimizeSplitPreview } = useSettings();
  const [file, setFile] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState([{ start: '1', end: '1', startError: false, endError: false, error: null }]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleFileSelected = async (files) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setProcessing(true);
      try {
        const { PDFDocument } = await getPdfLib();
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const count = pdfDoc.getPageCount();
        
        setPageCount(count);
        setFile({
          id: generateId(),
          file: selectedFile
        });
        // Set default range to full document
        setRanges([{ start: '1', end: count.toString(), startError: false, endError: false, error: null }]);
        setResults(null);
        setShowPreview(true);
      } catch (error) {
        console.error("Failed to load PDF metadata:", error);
        alert("Could not read PDF metadata. Please try again.");
      } finally {
        setProcessing(false);
      }
    }
  };

  const handleAddRange = () => {
    setRanges([...ranges, { start: '1', end: pageCount.toString(), startError: false, endError: false, error: null }]);
    setResults(null);
  };

  const handleRemoveRange = (index) => {
    const newRanges = [...ranges];
    newRanges.splice(index, 1);
    setRanges(newRanges);
    setResults(null);
  };

  const handleUpdateRange = (index, field, value) => {
    const newRanges = [...ranges];
    // Allow any value while typing for better UX
    newRanges[index][field] = value;
    
    // Clear previous error when typing
    newRanges[index].error = null;
    newRanges[index].startError = false;
    newRanges[index].endError = false;
    
    setRanges(newRanges);
    setResults(null);
  };

  const validateRanges = () => {
    let isValid = true;
    const newRanges = [...ranges];

    newRanges.forEach((range, index) => {
      const start = parseInt(range.start);
      const end = parseInt(range.end);
      const errors = [];

      range.startError = false;
      range.endError = false;

      // Independent start check
      if (isNaN(start) || start < 1 || start > pageCount) {
        range.startError = true;
        errors.push(isNaN(start) ? "valid start page" : `start page between 1-${pageCount}`);
        isValid = false;
      }

      // Independent end check
      if (isNaN(end) || end < 1 || end > pageCount) {
        range.endError = true;
        errors.push(isNaN(end) ? "valid end page" : `end page between 1-${pageCount}`);
        isValid = false;
      }

      // Range consistency check (only if individual values are semi-valid)
      if (!range.startError && !range.endError && start > end) {
        range.startError = true;
        range.endError = true;
        errors.push("start page ≤ end page");
        isValid = false;
      }

      if (errors.length > 0) {
        if (range.startError && range.endError && errors.length > 1 && !errors[0].includes('≤')) {
            range.error = `Pages must be between 1 and ${pageCount}`;
        } else {
            range.error = `Please enter ${errors.join(" and ")}`;
        }
      } else {
        range.error = null;
      }
    });

    setRanges(newRanges);
    return isValid;
  };

  const handleSplit = async () => {
    if (!file) return;
    if (!validateRanges()) return;

    setProcessing(true);
    try {
      // Convert string ranges back to numbers for the utility
      const numericRanges = ranges.map(r => ({
        start: parseInt(r.start),
        end: parseInt(r.end)
      }));
      const splitDocs = await splitPdf(file.file, numericRanges);
      setResults(splitDocs);
    } catch (error) {
      console.error("Split failed:", error);
      alert("An error occurred while splitting the PDF.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (data, index) => {
    downloadFile(data, `split_part_${index + 1}.pdf`);
  };

  const downloadZip = async () => {
    if (!results || results.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      const safeName = sanitizeFilename(file.file.name).replace(/\.pdf$/i, '');
      const folderName = safeName + '_split';
      const pdfFolder = zip.folder(folderName);

      results.forEach((data, index) => {
        pdfFolder.file(`part_${index + 1}.pdf`, data);
      });

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
    } catch (error) {
      console.error("Zipping failed:", error);
      alert("Failed to create ZIP archive.");
    } finally {
      setIsZipping(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPageCount(0);
    setRanges([{ start: '1', end: '1', startError: false, endError: false, error: null }]);
    setResults(null);
    setShowPreview(false);
  };

  return (
    <ToolLayout
      title="Split PDF"
      description="Extract specific page ranges into separate PDF documents."
      icon={Scissors}
      color="bg-orange-500"
      onBack={onBack}
    >
      <div className={`transition-all duration-300 ease-out gap-8 ${
        showPreview && file ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr,500px]' : 'flex flex-col'
      }`}>
        <div className="space-y-8 w-full min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
          {!file ? (
            <div className="max-w-2xl mx-auto w-full">
              <UploadArea 
                onFilesSelected={handleFileSelected} 
                multiple={false}
                description="Upload a single PDF to split it into multiple files."
                processing={processing}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <ToolHeader title="Split Settings" onReset={handleReset}>
                </ToolHeader>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all self-start sm:self-center"
                  aria-label={showPreview ? "Hide PDF preview" : "Show PDF preview"}
                  title={showPreview ? "Hide Preview" : "Show Preview"}
                >
                  {showPreview ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              </div>
              
              <DocumentCard file={file} onReset={handleReset} pageCount={pageCount} />

              <ToolGuide items={[
                "Use ranges like '1-3' for multiple pages or '5' for a single page.",
                "You can add multiple ranges to create several PDFs at once.",
                "Check the preview panel to confirm your selected pages.",
                "Privacy First: Splitting is processed entirely on your device."
              ]} />

              <div className="space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Page Ranges</p>
                <div className="grid gap-4">
                  {ranges.map((range, index) => (
                    <motion.div 
                      key={index} 
                      animate={range.error ? { x: [0, -10, 10, -10, 10, 0] } : { x: 0 }}
                      transition={{ duration: 0.4 }}
                      className={cn(
                        "flex flex-col gap-4 p-5 rounded-2xl border bg-card/50 shadow-sm transition-colors",
                        range.error ? "border-destructive/30 bg-destructive/5" : "border-border"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-grow flex items-center gap-4">
                          <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">From Page</label>
                            <input 
                              type="number" 
                              min="1"
                              max={pageCount}
                              value={range.start}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleUpdateRange(index, 'start', e.target.value)}
                              className={cn(
                                "w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 outline-none transition-all font-bold text-sm",
                                range.startError 
                                  ? "border-destructive focus:ring-destructive/20" 
                                  : "border-border focus:ring-primary"
                              )}
                              placeholder="1"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5 flex-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">To Page</label>
                            <input 
                              type="number" 
                              min="1"
                              max={pageCount}
                              value={range.end}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => handleUpdateRange(index, 'end', e.target.value)}
                              className={cn(
                                "w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 outline-none transition-all font-bold text-sm",
                                range.endError 
                                  ? "border-destructive focus:ring-destructive/20" 
                                  : "border-border focus:ring-primary"
                              )}
                              placeholder={pageCount}
                            />
                          </div>
                        </div>
                        
                        {ranges.length > 1 && (
                          <button 
                            onClick={() => handleRemoveRange(index)}
                            className="p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors mt-5 self-center"
                            aria-label={`Remove range ${index + 1}`}
                            title="Remove range"
                          >
                            <Trash2 size={20} aria-hidden="true" />
                          </button>
                        )}
                      </div>

                      {range.error && (
                        <div className="flex items-center gap-2 text-destructive text-[11px] font-bold bg-destructive/10 p-2 rounded-lg animate-in fade-in slide-in-from-top-1">
                          <AlertCircle size={14} />
                          {range.error}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <button 
                  onClick={handleAddRange}
                  className="w-full py-4 border-2 border-dashed border-primary/20 text-primary hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-sm"
                >
                  <Plus size={18} /> Add Another Range
                </button>
              </div>

              <div className="flex justify-center py-4">
                <AdUnit format="horizontal" />
              </div>

              <div className="flex flex-col items-center pt-10 border-t mt-10">

                {!results ? (
                  <ActionButton 
                    onClick={handleSplit} 
                    loading={processing}
                    className="w-full max-w-sm"
                  >
                    <Scissors size={20} />
                    Split PDF
                  </ActionButton>
                ) : (
                    <div className="grid gap-4 w-full">
                      {results.length > 1 && (
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-foreground dark:text-emerald-300 p-4 rounded-2xl flex items-center justify-between mb-4 border border-emerald-400 dark:border-emerald-800">
                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-600 text-white p-1.5 rounded-full shrink-0">
                              <CheckCircle2 size={16} />
                            </div>
                            <span className="font-bold text-sm">Successfully split into {results.length} files!</span>
                          </div>
                          
                          <button
                            onClick={downloadZip}
                            disabled={isZipping}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                          >
                            {isZipping ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <Archive size={14} />
                            )}
                            Download All (ZIP)
                          </button>
                        </div>
                      )}
                    {results.map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-5 border rounded-2xl bg-card/30 hover:bg-card/50 transition-colors">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm text-foreground">Part {index + 1}</span>
                          <span className="text-xs text-muted-foreground">Pages {ranges[index].start}-{ranges[index].end}</span>
                        </div>
                        <button 
                          onClick={() => handleDownload(data, index)}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showPreview && file && (
            <div className="h-[500px] lg:h-[calc(100vh-8rem)] sticky top-24">
              <PdfPreview 
                file={file.file} 
                onClose={() => setShowPreview(false)} 
                forceFull={true}
                selectedRanges={ranges}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default SplitTool;
