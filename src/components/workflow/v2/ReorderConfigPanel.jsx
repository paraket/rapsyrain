'use client';

import React, { useEffect, useMemo, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, 
  RefreshCw, Layers, AlertCircle 
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import { useReorderThumbnails } from '../../../hooks/useReorderThumbnails';

const ReorderPanelCard = React.memo(({ page, idx, totalPages, movePage }) => {
  const isMoved = page.id - 1 !== idx;

  return (
    <div className={`group/page relative flex flex-col gap-2 p-1 bg-card border rounded-2xl transition-all duration-300 ${
      isMoved 
        ? 'border-primary shadow-md shadow-primary/5 ring-1 ring-primary/10' 
        : 'hover:border-indigo-500/50 hover:shadow-sm'
    }`}>
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted/20 border border-transparent group-hover/page:border-indigo-500/20 transition-colors">
        <img
          src={page.thumbnail}
          alt={`Page ${page.id}`}
          className="w-full h-full object-contain p-0 pointer-events-none"
        />

        <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center gap-1">
          {page.id}
          {isMoved && (
            <span className="w-1 h-1 bg-primary rounded-full animate-pulse" />
          )}
        </div>

        {isMoved && (
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary text-[8px] font-black text-white rounded-md shadow-lg shadow-primary/20 uppercase tracking-tighter z-10 animate-in fade-in zoom-in-95 duration-200">
            Moved
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-1 p-0.5 bg-muted/30 md:bg-transparent rounded-xl md:opacity-0 md:translate-y-1 group-hover/page:opacity-100 group-hover/page:translate-y-0 transition-all duration-300 ease-out">
        <button
          onClick={() => movePage(idx, -1)}
          disabled={idx === 0}
          className="flex-1 p-1 bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-10"
          aria-label="Move page left"
          title="Move Left"
        >
          <ChevronLeft size={12} aria-hidden="true" />
        </button>

        <button
          onClick={() => movePage(idx, 1)}
          disabled={idx === totalPages - 1}
          className="flex-1 p-1 bg-indigo-50 hover:bg-indigo-500 text-indigo-600 hover:text-white rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-10"
          aria-label="Move page right"
          title="Move Right"
        >
          <ChevronRight size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
});
ReorderPanelCard.displayName = 'ReorderPanelCard';

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

  const updatePageOrder = useCallback((newPages) => {
    setPages(newPages);
    const newOrder = newPages.map(p => p.id - 1);
    const newPerFile = { ...node.config.perFile };
    node.assignedFileIds.forEach(id => {
       newPerFile[id] = { pageOrder: newOrder };
     });
    onUpdate({ config: { ...node.config, perFile: newPerFile } });
  }, [node.config, node.assignedFileIds, onUpdate, setPages]);

  const movePage = useCallback((idx, delta) => {
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= pages.length) return;
    const newPages = [...pages];
    [newPages[idx], newPages[newIdx]] = [newPages[newIdx], newPages[idx]];
    updatePageOrder(newPages);
  }, [pages, updatePageOrder]);

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
            <ReorderPanelCard
              key={page.id}
              page={page}
              idx={idx}
              totalPages={pages.length}
              movePage={movePage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReorderConfigPanel;
