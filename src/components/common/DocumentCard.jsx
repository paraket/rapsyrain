import React from 'react';
import { File, RefreshCw } from 'lucide-react';

const DocumentCard = ({ file, onReset, className = "" }) => {
  if (!file) return null;

  const fileName = file.file?.name || file.name || "Unknown Document";
  const fileSize = file.file?.size || file.size || 0;
  const formattedSize = (fileSize / (1024 * 1024)).toFixed(2) + " MB";

  return (
    <div className={`flex flex-wrap items-center justify-between bg-muted/30 p-2 sm:p-3 rounded-[1.5rem] border border-dashed border-primary/20 gap-4 w-full mt-1 group/doc animate-in fade-in zoom-in-95 duration-300 ease-out ${className}`}>
      <div className="flex items-center gap-3 min-w-0 px-1">
        <div className="bg-primary/10 p-2.5 rounded-2xl text-primary shrink-0 shadow-inner group-hover/doc:bg-primary/20 transition-colors">
          <File size={20} />
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-sm font-bold truncate tracking-tight text-foreground/80">{fileName}</p>
          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest truncate">
            {formattedSize} • Active Document
          </p>
        </div>
      </div>
      {onReset && (
        <button 
          onClick={onReset}
          className="px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-destructive/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2 border border-destructive/10 bg-card shadow-sm"
        >
          <RefreshCw size={12} /> Change
        </button>
      )}
    </div>
  );
};

export default DocumentCard;
