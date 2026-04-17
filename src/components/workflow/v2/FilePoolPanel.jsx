'use client';

import React from 'react';
import { FileText, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';

const FilePoolPanel = ({ node, uploadedFiles, onUpdate }) => {
  const toggleFile = (fileId) => {
    const isAssigned = node.assignedFileIds?.includes(fileId);
    let newIds = [];
    if (isAssigned) {
      newIds = node.assignedFileIds.filter(id => id !== fileId);
    } else {
      newIds = [...(node.assignedFileIds || []), fileId];
    }
    onUpdate({ assignedFileIds: newIds });
  };

  const selectAll = () => {
    onUpdate({ assignedFileIds: uploadedFiles.map(f => f.id) });
  };

  const deselectAll = () => {
    onUpdate({ assignedFileIds: [] });
  };

  if (uploadedFiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
         <AlertCircle size={32} className="text-muted-foreground opacity-30" />
         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-10">
           The pool is empty. Upload PDFs using the left toolbar first.
         </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Files</h5>
         <div className="flex gap-2">
            <button 
              onClick={selectAll}
              className="text-[9px] font-black uppercase text-primary hover:underline"
            >
              All
            </button>
            <span className="text-muted-foreground opacity-20">/</span>
            <button 
              onClick={deselectAll}
              className="text-[9px] font-black uppercase text-muted-foreground hover:underline"
            >
              None
            </button>
         </div>
      </div>

      <div className="space-y-2">
        {uploadedFiles.map((file) => {
          const isSelected = node.assignedFileIds?.includes(file.id);
          return (
            <button
              key={file.id}
              onClick={() => toggleFile(file.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                isSelected 
                  ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/10" 
                  : "bg-transparent border-muted-foreground/10 hover:border-muted-foreground/30"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className={isSelected ? "text-primary" : "text-muted-foreground"} />
                <div className="flex flex-col text-left min-w-0">
                  <span className={cn("text-xs font-bold truncate", isSelected ? "text-primary" : "text-foreground")}>
                    {file.name}
                  </span>
                  <span className="text-[8px] font-black uppercase text-muted-foreground opacity-50">
                    {(file.size / 1024).toFixed(1)} KB • Source File
                  </span>
                </div>
              </div>
              
              {isSelected ? (
                <div className="bg-primary text-white rounded-full p-0.5">
                   <CheckCircle2 size={14} />
                </div>
              ) : (
                <Circle size={14} className="text-muted-foreground/20" />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-muted/20 border border-dashed rounded-2xl">
         <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed text-center">
           Selected files will flow into this node for processing.
         </p>
      </div>
    </div>
  );
};

export default FilePoolPanel;
