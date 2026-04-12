import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PDFDocument, PDFDict, PDFName } from 'pdf-lib';
import { ShieldCheck, RefreshCw, FileCheck, CheckCircle2, Download, AlertCircle } from 'lucide-react';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import FileList from '../components/common/FileList';
import ToolHeader from '../components/common/ToolHeader';
import DocumentCard from '../components/common/DocumentCard';
import ToolGuide from '../components/common/ToolGuide';
import ActionButton from '../components/common/ActionButton';
import { generateId } from '../utils/security';

const SafePdfTool = ({ onBack }) => {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState(null);

  const handleFilesSelected = (files) => {
    if (files.length > 0) {
      setFile({
        id: generateId(),
        file: files[0]
      });
      setError(null);
      setIsDone(false);
    }
  };

  const sanitizePdf = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // 1. Flatten Forms (Removes interactive fields while keeping visuals)
      const form = pdfDoc.getForm();
      try {
        form.flatten();
      } catch (e) {
        // No detectable forms to flatten or flattening skipped.
      }


      // 2. Recursive Sanitization function
      const jsKeys = ['JS', 'JavaScript', 'OpenAction', 'AA', 'A'];
      
      const sanitizeObject = (obj) => {
        if (!obj || !(obj instanceof PDFDict)) return;
        
        jsKeys.forEach(key => {
          const name = PDFName.of(key);
          if (obj.has(name)) {
            obj.delete(name);
          }
        });

        // Recursively traverse
        obj.values().forEach(val => {
          if (val instanceof PDFDict) {
            sanitizeObject(val);
          }
        });
      };

      // Sanitize the catalog (root of the PDF tree)
      sanitizeObject(pdfDoc.catalog);

      // 3. Scrub Metadata
      pdfDoc.setTitle('');
      pdfDoc.setAuthor('myPDF Sanitized');
      pdfDoc.setSubject('');
      pdfDoc.setCreator('myPDF Lite (mypdf.qpkendra.com)');
      pdfDoc.setProducer('myPDF Sanitization Engine');
      pdfDoc.setCreationDate(new Date());
      pdfDoc.setModificationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sanitized_${file.file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsDone(true);
    } catch (err) {
      console.error(err);
      setError('An error occurred during sanitization. The file might be corrupted or protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIsDone(false);
    setError(null);
  };

  return (
    <ToolLayout
      title="myPDF (PDF Sanitizer)"
      description="Clean your PDF of JavaScript, interactive forms, and sensitive tracking metadata. Perfect for job portals."
      icon={ShieldCheck}
      color="bg-emerald-600"
      onBack={onBack}
    >
      <div className="space-y-8">
        {!file ? (
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <ToolGuide items={[
              "Removes hidden metadata, form data, and embedded scripts instantly.",
              "Perfect for sanitizing documents before public sharing or legal submission.",
              "Rest assured: Your document layout and content remain 100% identical.",
              "Privacy: We strip sensitive tracking tags without touching your files' pixels."
            ]} />
            <UploadArea 
              onFilesSelected={handleFilesSelected} 
              multiple={false}
              description="Upload a PDF to remove metadata and scripts."
            />
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
            <ToolHeader title="Sanitization Ready" onReset={handleReset} />
            <DocumentCard file={file} onReset={handleReset} />

            <ToolGuide items={[
              "Removes hidden metadata, form data, and embedded scripts instantly.",
              "Perfect for sanitizing documents before public sharing or legal submission.",
              "Rest assured: Your document layout and content remain 100% identical.",
              "Privacy: We strip sensitive tracking tags without touching your files' pixels."
            ]} />

            {error && (
              <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center gap-3 font-medium border border-destructive/20 mt-4">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4 pt-6">
              <ActionButton
                onClick={sanitizePdf}
                loading={isProcessing}
                className="w-full"
              >
                <ShieldCheck size={24} />
                Sanitize & Make Job-Ready
              </ActionButton>
              
              <p className="text-[11px] text-center text-muted-foreground px-4 leading-relaxed font-medium">
                Professional mode active: interactive content and tracking metadata will be permanently removed. 
                Text selectability remains ATS-compatible.
              </p>
            </div>
          </div>
        )}

        {isDone && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 flex items-center gap-4 shadow-xl shadow-emerald-500/10"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="font-black text-lg">Sanitization Complete!</p>
              <p className="text-sm font-medium opacity-80 leading-snug">
                Your file is now clean and ready for security portals. 
                Check your downloads folder.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
};

export default SafePdfTool;
