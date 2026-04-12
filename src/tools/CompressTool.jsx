import React, { useState } from 'react';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import FileList from '../components/common/FileList';
import ToolHeader from '../components/common/ToolHeader';
import DocumentCard from '../components/common/DocumentCard';
import ActionButton from '../components/common/ActionButton';
import ToolGuide from '../components/common/ToolGuide';
import DownloadButton from '../components/common/DownloadButton';
import { compressPdfRaster, compressPdfStandard, downloadFile } from '../utils/pdf-utils';
import { Zap, RefreshCw, AlertTriangle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import PdfPreview from '../components/common/PdfPreview';
import { motion, AnimatePresence } from 'framer-motion';
import { generateId } from '../utils/security';

const CompressTool = ({ onBack }) => {
  const { isDarkMode } = useTheme();
  const [file, setFile] = useState(null);
  const [preserveText, setPreserveText] = useState(true);
  const [compressionValue, setCompressionValue] = useState(35);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelected = (files) => {
    if (files.length > 0) {
      setFile({
        id: generateId(),
        file: files[0]
      });
      setResult(null);
      setShowPreview(true); // Auto-show preview on selection
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    try {
      const data = preserveText 
        ? await compressPdfStandard(file.file)
        : await compressPdfRaster(file.file, compressionValue);
      setResult(data);
    } catch (error) {
      console.error("Compression failed:", error);
      alert("An error occurred during compression.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadFile(result, `compressed_${file.file.name}`);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setShowPreview(false);
  };

  return (
    <ToolLayout
      title="Compress PDF"
      description="Reduce the file size of your PDF while optimizing for web viewing."
      icon={Zap}
      color="bg-red-500"
      onBack={onBack}
    >
      <div className={`transition-all duration-500 gap-8 ${
        showPreview && file ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr,500px]' : 'flex flex-col'
      }`}>
        <div className="space-y-8 w-full">
          {!file ? (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              <ToolGuide items={[
                "Lossless: Perfect for email. Strips hidden clutter without touching document pixels.",
                "Max Compression: Renders pages as images to achieve the smallest possible file size.",
                "Balance: Use the slider to find the sweet spot between file size and text clarity.",
                "Safety First: No data is uploaded; your sensitive documents stay on your machine."
              ]} />
              <UploadArea 
                onFilesSelected={handleFileSelected} 
                multiple={false}
                description="Upload a PDF to reduce its file size."
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <ToolHeader title="Density Control" onReset={handleReset} />
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
                "Lossless: Perfect for email. Strips hidden clutter without touching document pixels.",
                "Max Compression: Renders pages as images to achieve the smallest possible file size.",
                "Balance: Use the slider to find the sweet spot between file size and text clarity.",
                "Safety First: No data is uploaded; your sensitive documents stay on your machine."
              ]} />

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-2xl border">
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-2">
                      <CheckCircle2 className="text-emerald-500" size={18} />
                      Preserve Selectable Text
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep text searchable but results in lower compression.
                    </p>
                  </div>
                  <button
                    onClick={() => setPreserveText(!preserveText)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      preserveText ? 'bg-primary' : 'bg-muted-foreground/30'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      preserveText ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {!preserveText ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
                    <label className="block text-sm font-bold text-muted-foreground uppercase">
                      Compression Level
                    </label>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Original-ish</span>
                        <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full font-mono">
                          {compressionValue}
                        </span>
                        <span className="text-sm font-medium">Extreme</span>
                      </div>
                      
                      <input 
                        type="range" 
                        min="0" 
                        max="70" 
                        value={compressionValue} 
                        onChange={(e) => setCompressionValue(parseInt(e.target.value))}
                        className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      
                      <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest px-1">
                        <span>0</span>
                        <span>14</span>
                        <span>28</span>
                        <span>42</span>
                        <span>56</span>
                        <span>70</span>
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl flex gap-3 ${
                      isDarkMode ? 'bg-amber-900/30 border border-amber-800' : 'bg-amber-100/50 border border-amber-300'
                    }`}>
                      <AlertTriangle className={isDarkMode ? 'text-amber-500 shrink-0' : 'text-amber-700 shrink-0'} size={20} />
                      <div className={`text-xs space-y-1 ${isDarkMode ? 'text-amber-100' : 'text-foreground'}`}>
                        <p className="font-bold">Max Compression (Quality Loss):</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Renders pages into optimized JPEG images.</li>
                          <li>Reduces resolution & color depth (Slider 0-70).</li>
                          <li>Best for scanned documents or image-heavy PDFs.</li>
                          <li className={`font-bold underline decoration-amber-500/50 ${isDarkMode ? 'text-amber-300' : 'text-foreground/90'}`}>
                            Note: Text becomes non-selectable.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl flex gap-3 animate-in fade-in slide-in-from-bottom-2 ${
                    isDarkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-100/50 border border-blue-300'
                  }`}>
                    <CheckCircle2 className={isDarkMode ? 'text-blue-400 shrink-0' : 'text-blue-700 shrink-0'} size={20} />
                    <div className={`text-xs space-y-1 ${isDarkMode ? 'text-blue-100' : 'text-foreground'}`}>
                      <p className="font-bold">Lossless Compression (No Quality Loss):</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        <li>Removes duplicate objects & "dead" data.</li>
                        <li>Strips hidden metadata (XMP/XML).</li>
                        <li>Optimizes internal Flate/Deflate streams.</li>
                        <li className={`font-bold ${isDarkMode ? 'text-blue-300' : 'text-foreground/90'}`}>
                          Note: All text and image quality preserved.
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center pt-8 border-t">
                {!result ? (
                  <ActionButton 
                    onClick={handleProcess} 
                    loading={processing}
                    className="w-full max-w-sm"
                  >
                    <Zap size={20} />
                    Compress PDF
                  </ActionButton>
                ) : (
                  <div className="flex flex-col items-center gap-6 w-full">
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-500 rounded-2xl flex items-center justify-center w-full"
                    >
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        Optimization complete! Your file is ready.
                      </p>
                    </motion.div>
                    <DownloadButton onClick={handleDownload} fileName={`compressed_${file.file.name}`} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showPreview && file && (
            <div className="h-[700px] sticky top-24">
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

export default CompressTool;
