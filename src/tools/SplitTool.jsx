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
import { splitPdf, downloadFile } from '../utils/pdf-utils';
import { Scissors, RefreshCw, Plus, Trash2, CheckCircle2, Archive, Eye, EyeOff } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '../utils/cn';
import { sanitizeFilename, generateId } from '../utils/security';
import AdUnit from '../components/common/AdUnit';


const SplitTool = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [ranges, setRanges] = useState([{ start: 1, end: 1 }]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      setFile({
        id: generateId(),
        file: files[0]
      });
      setResults(null);
      setShowPreview(true); // Auto-show preview on selection
    }
  };

  const handleAddRange = () => {
    setRanges([...ranges, { start: 1, end: 1 }]);
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
    newRanges[index][field] = parseInt(value) || 1;
    setRanges(newRanges);
    setResults(null);
  };

  const handleSplit = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const splitDocs = await splitPdf(file.file, ranges);
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
    setRanges([{ start: 1, end: 1 }]);
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
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <ToolHeader title="Split Settings" onReset={handleReset} />
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-all self-start sm:self-center"
                >
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              </div>
              
              <DocumentCard file={file} onReset={handleReset} />

              <ToolGuide items={[
                "Use ranges like '1-3' for multiple pages or '5' for a single page.",
                "You can add multiple ranges to create several PDFs at once.",
                "Check the preview panel to confirm your selected pages.",
                "Privacy First: Splitting is processed entirely on your device."
              ]} />

              <div className="space-y-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Page Ranges</p>
                {ranges.map((range, index) => (
                  <div key={index} className="flex flex-wrap items-center gap-4 p-4 rounded-2xl border bg-card/50 shadow-sm">
                    <div className="flex-grow flex items-center gap-4">
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">From Page</label>
                        <input 
                          type="number" 
                          min="1"
                          value={range.start}
                          onChange={(e) => handleUpdateRange(index, 'start', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">To Page</label>
                        <input 
                          type="number" 
                          min="1"
                          value={range.end}
                          onChange={(e) => handleUpdateRange(index, 'end', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    {ranges.length > 1 && (
                      <button 
                        onClick={() => handleRemoveRange(index)}
                        className="p-2.5 rounded-xl hover:bg-destructive/10 text-destructive transition-colors mt-5"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                ))}

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
            <div className="h-[700px] sticky top-8">
              <PdfPreview 
                file={file.file} 
                onClose={() => setShowPreview(false)} 
                forceFull={true}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default SplitTool;
