import React, { useState, useEffect } from 'react';
import { File as FileIcon, Trash2, GripVertical, CheckCircle2, ChevronUp, ChevronDown, FileImage } from 'lucide-react';
import { useDragControls, motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/cn';

const FileCard = ({ 
  file: rawFile, 
  onRemove, 
  onMoveUp, 
  onMoveDown, 
  onSelect,
  isActive = false,
  index, 
  showReorder = false,
  isFirst = false,
  isLast = false
}) => {
  const fileArray = rawFile || {};
  const file = fileArray instanceof File || fileArray instanceof Blob ? fileArray : fileArray.file;
  const dragControls = useDragControls();
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    // Aggressive validation to prevent createObjectURL crashes
    const isValidBlob = file instanceof Blob || file instanceof File;
    if (isValidBlob && (file.type?.startsWith('image/') || file.name?.match(/\.(jpg|jpeg|png)$/i))) {
      try {
        const url = URL.createObjectURL(file);
        setThumbnail(url);
        return () => URL.revokeObjectURL(url);
      } catch (e) {
        console.error("Thumbnail generation skipped:", e);
      }
    }
    setThumbnail(null); // Reset if not a valid image
  }, [file]);

  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    if (isNaN(i) || i < 0) return bytes + ' Bytes';
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <motion.div 
      layout
      transition={{ 
        type: "tween", 
        ease: "anticipate",
        duration: 0.2
      }}
      whileHover={{ scale: 1.005, translateY: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect && onSelect(index)}
      className={cn(
        "group relative flex items-center gap-4 p-4 rounded-2xl border bg-card transition-all duration-300 cursor-pointer overflow-hidden",
        isActive 
          ? "border-primary ring-2 ring-primary/20 shadow-xl" 
          : "hover:border-primary/50 hover:shadow-lg"
      )}
    >
      {isActive && (
        <motion.div 
          layoutId="activeIndicator"
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary" 
        />
      )}
      {showReorder && (
        <div className="flex flex-col gap-0.5 mr-1">
          <button
            onClick={(e) => { e.stopPropagation(); !isFirst && onMoveUp(index); }}
            disabled={isFirst}
            className={cn(
              "p-0.5 rounded hover:bg-muted transition-colors",
              isFirst ? "opacity-10 cursor-not-allowed" : "text-muted-foreground hover:text-primary"
            )}
            title="Move Up"
          >
            <ChevronUp size={16} />
          </button>
          
          <div 
            className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors flex justify-center py-1"
            onPointerDown={(e) => dragControls.start(e)}
          >
            <GripVertical size={18} />
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); !isLast && onMoveDown(index); }}
            disabled={isLast}
            className={cn(
              "p-0.5 rounded hover:bg-muted transition-colors",
              isLast ? "opacity-10 cursor-not-allowed" : "text-muted-foreground hover:text-primary"
            )}
            title="Move Down"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      )}
      
      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt="thumb" className="w-full h-full object-cover" />
        ) : (
          <FileIcon size={20} />
        )}
      </div>

      <div className="flex-grow min-w-0">
        <h4 className="text-sm font-semibold truncate pr-2">{file?.name || 'File loading...'}</h4>
        <p className="text-xs text-muted-foreground">{file ? formatSize(file?.size) : 'Calculating...'}</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center">
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(index); }}
            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="group-hover:hidden transition-all duration-200">
          <CheckCircle2 size={18} className="text-green-500" />
        </div>
      </div>
    </motion.div>
  );
};

export default FileCard;
