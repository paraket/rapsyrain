import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import FileList from '../components/common/FileList';
import ToolHeader from '../components/common/ToolHeader';
import DocumentCard from '../components/common/DocumentCard';
import ActionButton from '../components/common/ActionButton';
import ToolGuide from '../components/common/ToolGuide';
import { FileText, RefreshCw, Download, FileCode, CheckCircle2, ChevronDown } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
const pdfWorkerUrl = '/pdf.worker.min.mjs';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import { cn } from '../utils/cn';
import { escapeHtml, sanitizeFilename, generateId } from '../utils/security';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const PdfToWordTool = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null); // { text: string, pages: Array<string> }
  const [showFormats, setShowFormats] = useState(false);

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      setFile({
        id: generateId(),
        file: files[0]
      });
      setExtractedData(null);
      setShowFormats(false);
    }
  };

  const processConvert = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const structuredPages = [];
      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Map raw items to rich objects with coords and styles
        const items = textContent.items.map(item => ({
          text: item.str,
          x: item.transform[4],
          y: item.transform[5],
          height: item.height || item.transform[0], // Often scaleX/Y
          fontName: item.fontName,
          // Heuristic for style detection from fontFamily metadata if available
          bold: /bold|heavy|black/i.test(textContent.styles[item.fontName]?.fontFamily || ""),
          italic: /italic|oblique/i.test(textContent.styles[item.fontName]?.fontFamily || "")
        }));

        // Sort by Y (top to bottom), then X (left to right)
        items.sort((a, b) => b.y - a.y || a.x - b.x);

        // Group into lines based on Y coordinate tolerance
        const lines = [];
        let currentLine = [];
        let lastY = null;

        items.forEach(item => {
          if (lastY === null || Math.abs(item.y - lastY) < 5) {
            currentLine.push(item);
          } else {
            lines.push([...currentLine]);
            currentLine = [item];
          }
          lastY = item.y;
        });
        if (currentLine.length > 0) lines.push(currentLine);

        structuredPages.push({ lines });
        fullText += lines.map(l => l.map(i => i.text).join(' ')).join('\n') + "\n\n";
      }

      setExtractedData({ structuredPages, text: fullText });
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("An error occurred during high-fidelity extraction.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!extractedData) return;

    try {
      const doc = new Document({
        sections: [{
          properties: {},
          children: extractedData.structuredPages.flatMap(page =>
            page.lines.map(line =>
              new Paragraph({
                children: line.map(item =>
                  new TextRun({
                    text: item.text + " ",
                    bold: item.bold,
                    italics: item.italic,
                    size: Math.round(item.height * 2), // PDF points to half-points
                  })
                ),
              })
            )
          ),
        }],
      });

      const blob = await Packer.toBlob(doc);
      const safeName = sanitizeFilename(file.file.name).replace(/\.pdf$/i, '');
      saveAs(blob, `${safeName}.docx`);
    } catch (error) {
      console.error("Docx generation failed:", error);
      alert("Failed to generate styled Word document.");
    }
  };

  const handleDownloadHtml = () => {
    if (!extractedData) return;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Converted PDF Content</title>
        <style>
          body { font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; color: #333; }
          .page { background: white; margin-bottom: 40px; padding: 40px; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
          .page-num { font-size: 10px; font-weight: bold; color: #999; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          p { margin: 12px 0; }
          .bold { font-weight: bold; }
          .italic { font-style: italic; }
        </style>
      </head>
      <body>
        ${extractedData.structuredPages.map((page, i) => `
          <div class="page">
            <div class="page-num">Page ${i + 1}</div>
            ${page.lines.map(line => `
              <p>
                ${line.map(item => `
                  <span class="${item.bold ? 'bold' : ''} ${item.italic ? 'italic' : ''}" style="font-size: ${item.height}px;">
                    ${escapeHtml(item.text)}
                  </span>
                `).join(' ')}
              </p>
            `).join('')}
          </div>
        `).join('')}
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const safeName = sanitizeFilename(file.file.name).replace(/\.pdf$/i, '');
    saveAs(blob, `${safeName}.html`);
  };

  const handleDownloadTxt = () => {
    if (!extractedData) return;
    const blob = new Blob([extractedData.text], { type: 'text/plain' });
    const safeName = sanitizeFilename(file.file.name).replace(/\.pdf$/i, '');
    saveAs(blob, `${safeName}.txt`);
  };

  const handleReset = () => {
    setFile(null);
    setExtractedData(null);
    setShowFormats(false);
  };

  return (
    <ToolLayout
      title="PDF to Word"
      description="Convert PDF documents to editable Microsoft Word (.docx) files."
      icon={FileText}
      color="bg-primary"
      onBack={onBack}
    >
      <div className="space-y-8">
        {!file ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <ToolGuide items={[
              "Reconstructs your PDF into a Word document with preserved paragraphs and headers.",
              "Best for text-centric documents; complex layouts may require minor formatting adjustments.",
              "Check the progress bar for real-time status on large document conversions.",
              "Privacy: All text extraction and Word generation are done safely in your browser."
            ]} />
            <UploadArea
              onFilesSelected={handleFileSelected}
              multiple={false}
              description="Upload a PDF to convert to Word."
            />
          </div>
        ) : (
          <div className="space-y-6">
            <ToolHeader title="Document Parser" onReset={handleReset} />
            <DocumentCard file={file} onReset={handleReset} />

            <ToolGuide items={[
              "Reconstructs your PDF into a Word document with preserved paragraphs and headers.",
              "Best for text-centric documents; complex layouts may require minor formatting adjustments.",
              "Check the progress bar for real-time status on large document conversions.",
              "Privacy: All text extraction and Word generation are done safely in your browser."
            ]} />

            <div className="flex flex-col items-center pt-8 border-t">
              {!extractedData ? (
                <ActionButton
                  onClick={processConvert}
                  loading={processing}
                  className="w-full max-w-sm"
                >
                  <FileText size={20} />
                  Analyze and Convert
                </ActionButton>
              ) : (
                <div className="space-y-8 w-full">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-3xl flex items-center gap-3 w-full max-w-xl mx-auto"
                  >
                    <div className="bg-primary text-white p-2 rounded-2xl shrink-0 shadow-lg shadow-primary/20">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">Document Processed</p>
                      <p className="text-xs text-primary/70">Text has been successfully mapped to document structures.</p>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {/* Main Action */}
                    <button
                      onClick={handleDownloadDocx}
                      className="group flex flex-col items-center gap-4 p-8 bg-primary text-white rounded-[40px] shadow-2xl shadow-primary/20 hover:scale-105 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="p-4 bg-white/20 rounded-2xl">
                        <FileText size={48} />
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black">Download Word</p>
                        <p className="text-sm text-blue-100/70 font-bold uppercase tracking-widest mt-1">.docx Format</p>
                      </div>
                    </button>

                    {/* Format Selector */}
                    <div className="relative">
                      <button
                        onClick={() => setShowFormats(!showFormats)}
                        className="w-full h-full flex flex-col items-center gap-4 p-8 bg-card border-2 border-dashed border-muted-foreground/20 rounded-[40px] hover:border-primary/50 transition-all duration-300 group"
                      >
                        <div className="p-4 bg-muted/50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                          <FileCode size={48} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-black">Other Formats</p>
                          <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mt-1 flex items-center gap-1 justify-center">
                            Secondary Export <ChevronDown size={14} />
                          </p>
                        </div>
                      </button>

                      <AnimatePresence>
                        {showFormats && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute mt-4 top-full left-0 right-0 bg-card border rounded-3xl shadow-2xl z-50 p-3 flex flex-col gap-2"
                          >
                            <button
                              onClick={handleDownloadHtml}
                              className="w-full p-4 hover:bg-muted rounded-2xl text-left flex items-center justify-between group"
                            >
                              <div>
                                <p className="font-bold">Web Document</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">.html</p>
                              </div>
                              <Download size={18} className="text-muted-foreground group-hover:text-foreground" />
                            </button>
                            <div className="h-px bg-muted mx-4" />
                            <button
                              onClick={handleDownloadTxt}
                              className="w-full p-4 hover:bg-muted rounded-2xl text-left flex items-center justify-between group"
                            >
                              <div>
                                <p className="font-bold">Plain Text</p>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">.txt</p>
                              </div>
                              <Download size={18} className="text-muted-foreground group-hover:text-foreground" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <p className="text-center text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                    This tool processes files directly on your device. <br /> Complex table structures and layered graphics may vary from the original source.

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

export default PdfToWordTool;
