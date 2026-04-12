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
import { mergePdfs, downloadFile } from '../utils/pdf-utils';
import { Merge, RefreshCw, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { generateId } from '../utils/security';
import { cn } from '../utils/cn';
import AdUnit from '../components/common/AdUnit';


const MergeTool = ({ onBack }) => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [mergedPdf, setMergedPdf] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const handleFilesSelected = (newFiles) => {
    const filesWithIds = newFiles.map(file => ({
      id: generateId(),
      file: file
    }));
    setFiles([...files, ...filesWithIds]);
    setMergedPdf(null);
  };

  const handleRemoveFile = (index) => {
    const removedFile = files[index];
    if (previewFile && removedFile.id === previewFile.id) {
      setPreviewFile(null);
    }
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setMergedPdf(null);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newFiles = [...files];
    [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
    setFiles(newFiles);
    setMergedPdf(null);
  };

  const handleMoveDown = (index) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
    setFiles(newFiles);
    setMergedPdf(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Please upload at least 2 files to merge.");
      return;
    }

    setProcessing(true);
    try {
      const rawFiles = files.map(f => f.file);
      const result = await mergePdfs(rawFiles);
      setMergedPdf(result);
    } catch (error) {
      console.error("Merge failed:", error);
      alert("An error occurred while merging PDFs. Please check your files.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (mergedPdf) {
      downloadFile(mergedPdf, "merged_document.pdf");
    }
  };

  const handleReset = () => {
    setFiles([]);
    setMergedPdf(null);
    setPreviewFile(null);
  };

  return (
    <ToolLayout
      title="Merge PDF"
      description="Combine two or more PDF documents into a single file while maintaining the original quality."
      icon={Merge}
      color="bg-primary"
      onBack={onBack}
    >
      <div className={`transition-all duration-300 ease-out gap-8 ${
        previewFile ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr,500px]' : 'flex flex-col'
      }`}>
        <div className="space-y-8 w-full min-w-0">
          {files.length === 0 ? (
            <div className="max-w-2xl mx-auto w-full">
              <UploadArea 
                onFilesSelected={handleFilesSelected} 
                description="Upload multiple PDFs to merge them into one."
              />
            </div>
          ) : (
            <div className={cn(
              "space-y-6",
              previewFile ? "w-full" : "max-w-2xl mx-auto w-full"
            )}>
              <ToolHeader title="Combine Files" onReset={handleReset} />
              
              <ToolGuide items={[
                "Drag and drop files to rearrange the merge order.",
                "Missed a file? Use the 'Add more' area to inject more PDFs anytime.",
                "Click any file card to preview its content instantly on the right.",
                "Safe & Secure: Merging happens 100% locally in your browser."
              ]} />

              <div className="bg-muted/30 p-3 sm:p-4 rounded-[2rem] border border-dashed border-primary/20 animate-in fade-in zoom-in-95 duration-200 ease-out mb-8 overflow-hidden min-w-0">
                  <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="bg-primary/20 p-2 rounded-xl text-primary">
                      <Merge size={18} />
                    </div>
                    <p className="text-sm font-bold">{files.length} Files Selected</p>
                  </div>
                  <FileList 
                    files={files} 
                    onRemove={handleRemoveFile}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                    onSelect={setPreviewFile}
                    activeId={previewFile?.id}
                    showReorder={true} 
                    onReorder={setFiles}
                  />
                </div>
                
                <div className="flex justify-center">
                  <AdUnit format="horizontal" />
                </div>
                
                <div className="flex flex-col items-center gap-4 pt-8">

                  <UploadArea 
                    onFilesSelected={handleFilesSelected} 
                    title="Add more files"
                    description=""
                    className="p-6 h-auto"
                  />
                  
                  {!mergedPdf ? (
                    <ActionButton 
                      onClick={handleMerge} 
                      loading={processing}
                      disabled={files.length < 2}
                      className="w-full max-w-sm mt-8"
                    >
                      <Merge size={20} />
                      Merge PDFs
                    </ActionButton>
                  ) : (
                    <div className="flex flex-col items-center gap-4 w-full pt-8 border-t">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 text-foreground dark:text-emerald-300 p-4 rounded-2xl flex items-center gap-3 mb-4 w-full border border-emerald-400 dark:border-emerald-800">
                        <div className="bg-emerald-600 text-white p-1.5 rounded-full shrink-0 shadow-sm">
                          <CheckCircle2 size={16} />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-foreground dark:text-emerald-300">
                          PDFs successfully merged! Your file is ready.
                        </span>
                      </div>
                      <DownloadButton onClick={handleDownload} fileName="merged_document.pdf" />
                    </div>
                  )}
                </div>
              </div>
          )}
        </div>

        <AnimatePresence>
          {previewFile && (
            <div className="h-[500px] lg:h-[calc(100vh-8rem)] sticky top-24">
              <PdfPreview 
                file={previewFile.file} 
                onClose={() => setPreviewFile(null)} 
                forceFull={true}
              />
            </div>

          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default MergeTool;
