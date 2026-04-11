import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ToolLayout from '../components/ToolLayout';
import UploadArea from '../components/common/UploadArea';
import ToolHeader from '../components/common/ToolHeader';
import FileList from '../components/common/FileList';
import ActionButton from '../components/common/ActionButton';
import ToolGuide from '../components/common/ToolGuide';
import DownloadButton from '../components/common/DownloadButton';
import { PDFDocument } from 'pdf-lib';
import { downloadFile } from '../utils/pdf-utils';
import { FileType, RefreshCw, X } from 'lucide-react';
import { generateId } from '../utils/security';

const ImageToPdfTool = ({ onBack }) => {
  const [images, setImages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (previewItem && (previewItem.file instanceof Blob || previewItem.file instanceof File)) {
      try {
        const url = URL.createObjectURL(previewItem.file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Preview generation failed:", e);
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
    }
  }, [previewItem]);

  const handleFilesSelected = (newFiles) => {
    const imagesWithIds = newFiles.map(file => ({
      id: generateId(),
      file: file
    }));
    setImages([...images, ...imagesWithIds]);
    setResult(null);
    if (!previewItem && imagesWithIds.length > 0) {
      setPreviewItem(imagesWithIds[0]);
    }
  };

  const handleRemoveImage = (index) => {
    const itemToRemove = images[index];
    if (previewItem && itemToRemove.id === previewItem.id) {
      setPreviewItem(null);
    }
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    setResult(null);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    setImages(newImages);
    setResult(null);
  };

  const handleMoveDown = (index) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    setImages(newImages);
    setResult(null);
  };

  const processConvert = async () => {
    if (images.length === 0) return;

    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const item of images) {
        const file = item.file;
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else {
          console.warn(`Unsupported image type: ${file.type}`);
          continue;
        }

        const { width, height } = image.scale(1);
        const page = pdfDoc.addPage([width, height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: width,
          height: height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      setResult(pdfBytes);
    } catch (error) {
      console.error("Conversion failed:", error);
      alert("An error occurred during conversion.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      downloadFile(result, "converted_images.pdf");
    }
  };

  const handleReset = () => {
    setImages([]);
    setResult(null);
    setPreviewItem(null);
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert your JPG or PNG images into a high-quality PDF document."
      icon={FileType}
      color="bg-purple-600"
      onBack={onBack}
    >
      <div className={`transition-all duration-300 ease-out gap-8 ${
        previewItem ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-[1fr,500px]' : 'flex flex-col'
      }`}>
        <div className="space-y-8 w-full min-w-0">
          {images.length === 0 ? (
            <div className="max-w-2xl mx-auto w-full space-y-6">
              <ToolGuide items={[
                "Drag and drop images to set the page order in your final PDF.",
                "Accepted formats: JPG, PNG, WebP, and more. All are converted locally.",
                "Missed an image? Add more anytime before clicking 'Convert to PDF'.",
                "Efficiency: Your images are automatically optimized for the best PDF size-to-quality ratio."
              ]} />
              <UploadArea 
                onFilesSelected={handleFilesSelected} 
                accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
                description="Upload JPG or PNG files to convert them to PDF."
              />
            </div>
          ) : (
            <div className="space-y-6">
              <ToolHeader title="Image Selection" onReset={handleReset} />
              
              <ToolGuide items={[
                "Drag and drop images to set the page order in your final PDF.",
                "Accepted formats: JPG, PNG, WebP, and more. All are converted locally.",
                "Missed an image? Add more anytime before clicking 'Convert to PDF'.",
                "Efficiency: Your images are automatically optimized for the best PDF size-to-quality ratio."
              ]} />

              <div className="bg-muted/30 p-4 rounded-[2rem] border border-dashed border-primary/20 animate-in fade-in zoom-in-95 duration-500 mb-8">
                <div className="flex items-center gap-3 px-2 mb-4">
                  <div className="bg-primary/20 p-2 rounded-xl text-primary text-xs font-black uppercase tracking-widest">
                    {images.length} Sources
                  </div>
                </div>
                <FileList 
                  files={images} 
                  onRemove={handleRemoveImage}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onSelect={setPreviewItem}
                  activeId={previewItem?.id}
                  showReorder={true}
                  onReorder={setImages}
                />
              </div>

              <div className="flex flex-col items-center gap-4 pt-4 border-t">
                <UploadArea 
                  onFilesSelected={handleFilesSelected} 
                  accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }}
                  title="Add more images"
                  description=""
                  className="p-6 h-auto"
                />

                {!result ? (
                  <ActionButton 
                    onClick={processConvert} 
                    loading={processing}
                    className="w-full max-w-sm mt-8"
                  >
                    <FileType size={20} />
                    Convert to PDF
                  </ActionButton>
                ) : (
                  <div className="flex flex-col items-center gap-6 w-full pt-8">
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-emerald-100 dark:bg-emerald-900/40 border border-emerald-500 rounded-2xl flex items-center justify-center w-full mb-6"
                    >
                      <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100 text-center">
                        Images successfully converted to a professional PDF!
                      </p>
                    </motion.div>
                    <DownloadButton onClick={handleDownload} fileName="images_to_pdf.pdf" />
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
                  <p className="font-bold text-sm truncate">{previewItem.file.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Image Preview</p>
                </div>
                <button 
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-grow p-8 flex items-center justify-center">
                {previewUrl && (
                  <motion.img 
                    key={previewItem.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    src={previewUrl} 
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                    alt="Preview"
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default ImageToPdfTool;
