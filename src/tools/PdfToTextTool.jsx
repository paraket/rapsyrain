import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import FileList from '../components/common/FileList';
import ToolHeader from '../components/common/ToolHeader';
import DocumentCard from '../components/common/DocumentCard';
import ActionButton from '../components/common/ActionButton';
import ToolGuide from '../components/common/ToolGuide';
import { FileType, RefreshCw, FileText, Download, CheckCircle2 } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
const pdfWorkerUrl = '/pdf.worker.min.mjs';
import { sanitizeFilename, generateId } from '../utils/security';

// Configure worker using static asset path
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PdfToTextTool = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      setFile({
        id: generateId(),
        file: files[0]
      });
      setExtractedText("");
    }
  };

  const processConvert = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n\n${pageText}\n\n`;
      }

      setExtractedText(fullText);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("An error occurred during text extraction.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = sanitizeFilename(file.file.name).replace(/\.pdf$/i, '');
      link.download = `${safeName}.txt`;
      link.click();
    }
  };

  const handleReset = () => {
    setFile(null);
    setExtractedText("");
  };

  return (
    <ToolLayout
      title="PDF to Text"
      description="Extract text content from your PDF and save it as a high-quality text file."
      icon={FileType}
      color="bg-purple-600"
      onBack={onBack}
    >
      <div className="space-y-8">
        {!file ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <ToolGuide items={[
              "Quickly extract raw text content from any PDF document for editing or repurposing.",
              "The live preview area allows you to copy text chunks directly without downloading.",
              "Perfect for research: Turn static PDFs into searchable, workable text files locally.",
              "Note: Table structures and complex visual layouts are simplified for readability."
            ]} />
            <UploadArea 
              onFilesSelected={handleFileSelected} 
              multiple={false}
              description="Upload a PDF to extract text."
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ToolHeader title="Text Extraction" onReset={handleReset} />
            <DocumentCard file={file} onReset={handleReset} />

            <ToolGuide items={[
              "Quickly extract raw text content from any PDF document for editing or repurposing.",
              "The live preview area allows you to copy text chunks directly without downloading.",
              "Perfect for research: Turn static PDFs into searchable, workable text files locally.",
              "Note: Table structures and complex visual layouts are simplified for readability."
            ]} />

            <div className="flex flex-col items-center pt-8 border-t">
              {!extractedText ? (
                <ActionButton 
                  onClick={processConvert} 
                  loading={processing}
                  className="w-full max-w-sm"
                >
                  <FileText size={20} />
                  Extract Text
                </ActionButton>
              ) : (
                <div className="space-y-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-500 rounded-2xl flex items-center gap-3 w-full mb-6">
                      <div className="bg-emerald-600 text-white p-1.5 rounded-full shrink-0 shadow-sm">
                        <CheckCircle2 size={16} />
                      </div>
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 text-center">
                        Text successfully extracted! High-quality text data is ready.
                      </p>
                    </div>
                  </motion.div>

                  <div className="w-full h-64 bg-muted/30 border rounded-xl p-4 overflow-y-auto font-mono text-sm whitespace-pre-wrap">
                    {extractedText}
                  </div>

                  <div className="flex justify-center">
                    <ActionButton onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                      <Download size={20} />
                      Download as TXT
                    </ActionButton>
                  </div>
                  
                  <p className="text-center text-xs text-muted-foreground">
                    Note: This extracts plain text only. Formatting and images are not preserved.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
};

export default PdfToTextTool;
