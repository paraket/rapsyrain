'use client';

import React, { useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, 
  RefreshCw, Layers, AlertCircle 
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useReorderThumbnails } from '../../../hooks/useReorderThumbnails';

const ReorderConfigPanel = ({ node, onUpdate, uploadedFiles }) => {
  const activeFileId = node.assignedFileIds?.[0];
  const activeFile = uploadedFiles.find(f => f.id === activeFileId);
  
  // Settings schema: { perFile: { [id]: { pageOrder } } }
  const currentConfig = node.config.perFile[activeFileId] || { pageOrder: [] };

  const { 
    pages, 
    setPages, 
    rendering, 
    renderProgress 
  } = useReorderThumbnails(activeFile?.file);

  // Initialize pageOrder if empty
  useEffect(() => {
    if (pages.length > 0 && (!currentConfig.pageOrder || currentConfig.pageOrder.length === 0)) {
       const initialOrder = pages.map(p => p.id - 1);
       const newPerFile = { ...node.config.perFile };
       node.assignedFileIds.forEach(id => {
         newPerFile[id] = { pageOrder: initialOrder };
       });
       onUpdate({ config: { ...node.config, perFile: newPerFile } });
    }
  }, [pages, activeFileId]);

  const updatePageOrder = (newPages) => {
    setPages(newPages);
    const newOrder = newPages.map(p => p.id - 1);
    const newPerFile = { ...node.config.perFile };
    node.assignedFileIds.forEach(id => {
       newPerFile[id] = { pageOrder: newOrder };
    });
    onUpdate({ config: { ...node.config, perFile: newPerFile } });
  };

  const movePage = (idx, delta) => {
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= pages.length) return;
    const newPages = [...pages];
    [newPages[idx], newPages[newIdx]] = [newPages[newIdx], newPages[idx]];
    updatePageOrder(newPages);
  };

  if (!activeFile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
         <AlertCircle size={32} className="text-muted-foreground opacity-30" />
         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-10">
           Select a file in the "Assigned Files" tab to start reordering pages.
         </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Thumbnails</h5>
         {rendering && (
           <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">
             Rendering... {renderProgress}%
           </span>
         )}
      </div>

      {rendering && pages.length === 0 ? (
        <div className="flex flex-col items-center py-20 space-y-4">
           <div className="w-12 h-12 rounded-full border-4 border-muted border-t-indigo-500 animate-spin" />
           <p className="text-[10px] font-black text-muted-foreground uppercase">Preparing Pages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {pages.map((page, idx) => (
            <div 
              key={page.id} 
              className="group relative aspect-[3/4] bg-muted/20 border rounded-xl overflow-hidden hover:border-indigo-500/50 transition-all shadow-sm"
            >
               <img src={page.thumbnail} className="w-full h-full object-contain" alt="" />
               <div className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                  {page.id}
               </div>
               
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                  <div className="flex items-center gap-1">
                     <button 
                        onClick={() => movePage(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 px-1.5 bg-white text-black rounded-lg hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-20"
                     >
                        <ChevronLeft size={14} />
                     </button>
                     <button 
                        onClick={() => movePage(idx, 1)}
                        disabled={idx === pages.length - 1}
                        className="p-1 px-1.5 bg-white text-black rounded-lg hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-20"
                     >
                        <ChevronRight size={14} />
                     </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReorderConfigPanel;
