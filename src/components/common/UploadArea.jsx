import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const UploadArea = ({ onFilesSelected, accept = { 'application/pdf': ['.pdf'] }, multiple = true, title = "Upload PDF", description = "Drag & drop files here, or click to select" }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (onFilesSelected) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-6 md:p-8 text-center overflow-hidden",
        isDragActive 
          ? "border-primary bg-primary/5 scale-[1.01]" 
          : "border-muted-foreground/20 bg-muted/5 hover:border-primary/50 hover:bg-primary/5"
      )}
    >
      <input {...getInputProps()} />
      
      <div className={cn(
        "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300",
        isDragActive ? "bg-primary text-white scale-110" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
      )}>
        <Upload size={24} />
      </div>

      <h3 className="text-lg md:text-xl font-bold mb-1">{isDragActive ? "Drop files here" : title}</h3>
      <p className="text-[13px] text-muted-foreground mb-6 max-w-xs mx-auto leading-tight">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-muted-foreground">
        <span className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-muted/50 text-[10px]">
          <File size={12} /> PDF
        </span>
        <span className="text-xs text-muted-foreground/60">•</span>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
          Free & Fast
        </span>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <div className="w-24 h-24 bg-primary rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default UploadArea;
