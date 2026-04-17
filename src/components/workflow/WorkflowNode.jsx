'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, Layers, Merge, 
  ChevronDown, ChevronUp, Trash2, 
  GripVertical, Plus, AlertCircle,
  ChevronLeft, ChevronRight, Maximize2,
  FileText, Copy, Eye, EyeOff, Hash, MousePointer2, Archive
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useReorderThumbnails } from '../../hooks/useReorderThumbnails';
import PdfPreview from '../common/PdfPreview';

const WorkflowNode = ({ 
  node, 
  index, 
  inputPool,
  poolPageCounts,
  onRemove, 
  onUpdateConfig, 
  onSyncAll,
  onToggleExpand,
  uploadedFiles 
}) => {
  const [selectedFileId, setSelectedFileId] = useState(inputPool?.[0]?.id || null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!selectedFileId && inputPool?.length > 0) {
      setSelectedFileId(inputPool[0].id);
    }
  }, [inputPool]);

  // Close preview when switching files to save resources
  useEffect(() => {
    setShowPreview(false);
  }, [selectedFileId]);

  const isSplit = node.type === 'split';
  const isReorder = node.type === 'reorder';
  const isMerge = node.type === 'merge';

  const getTypeInfo = () => {
    if (isSplit) return { icon: Scissors, color: 'text-orange-500', bgColor: 'bg-orange-500/10', label: 'Split' };
    if (isReorder) return { icon: Layers, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', label: 'Reorder' };
    if (isMerge) return { icon: Merge, color: 'text-blue-600', bgColor: 'bg-blue-600/10', label: 'Merge' };
    return {};
  };

  const typeInfo = getTypeInfo();

  // Current Config for selected file
  const currentFileConfig = useMemo(() => {
    const defaultConf = isSplit 
      ? { mode: 'custom', ranges: [{ start: '1', end: '1', error: null }], fixedInterval: '1' }
      : isReorder 
      ? { pageOrder: [] }
      : {};
    
    return node.config.perFile[selectedFileId] || defaultConf;
  }, [node.config.perFile, selectedFileId, isSplit, isReorder]);

  const pageCountForSelected = poolPageCounts[selectedFileId] || 0;

  // Split Logic: Validation and Updates
  const validateAndNotify = (newConf) => {
    if (isSplit && newConf.mode === 'custom') {
        newConf.ranges.forEach(r => {
            const start = parseInt(r.start);
            const end = parseInt(r.end);
            r.error = null;
            if (isNaN(start) || start < 1 || (pageCountForSelected > 0 && start > pageCountForSelected)) {
                r.error = `Start page must be 1-${pageCountForSelected || '?'}`;
            } else if (isNaN(end) || end < 1 || (pageCountForSelected > 0 && end > pageCountForSelected)) {
                r.error = `End page must be 1-${pageCountForSelected || '?'}`;
            } else if (start > end) {
                r.error = "Start page must be ≤ End page";
            }
        });
    }
    onUpdateConfig(selectedFileId, newConf);
  };

  const handleUpdateMode = (mode) => {
    const newConf = { ...currentFileConfig, mode };
    if (mode === 'custom' && (!newConf.ranges || newConf.ranges.length === 0)) {
        newConf.ranges = [{ start: '1', end: (pageCountForSelected || '1').toString() }];
    }
    validateAndNotify(newConf);
  };

  const handleUpdateRange = (rangeIndex, field, value) => {
    const newRanges = [...(currentFileConfig.ranges || [])];
    newRanges[rangeIndex] = { ...newRanges[rangeIndex], [field]: value };
    validateAndNotify({ ...currentFileConfig, ranges: newRanges });
  };

  const handleAddRange = () => {
    const newRange = { start: '1', end: (pageCountForSelected || '1').toString() };
    const newRanges = [...(currentFileConfig.ranges || []), newRange];
    validateAndNotify({ ...currentFileConfig, ranges: newRanges });
  };

  const handleRemoveRange = (rangeIndex) => {
    const newRanges = currentFileConfig.ranges.filter((_, i) => i !== rangeIndex);
    validateAndNotify({ ...currentFileConfig, ranges: newRanges });
  };

  // Reorder Logic
  const virtualFile = inputPool.find(f => f.id === selectedFileId);
  const sourceFileObject = useMemo(() => {
    if (!virtualFile) return null;
    return uploadedFiles.find(f => f.id === virtualFile.sourceId)?.file;
  }, [virtualFile, uploadedFiles]);

  const { 
    pages, 
    setPages, 
    rendering, 
    renderProgress 
  } = useReorderThumbnails(sourceFileObject);

  useEffect(() => {
    if (isReorder && pages.length > 0 && (!currentFileConfig.pageOrder || currentFileConfig.pageOrder.length === 0)) {
        onUpdateConfig(selectedFileId, { 
            ...currentFileConfig, 
            pageOrder: pages.map(p => p.id - 1) 
        });
    }
  }, [pages, isReorder, selectedFileId]);

  const movePage = (pageIndex, direction) => {
    const newIndex = pageIndex + direction;
    if (newIndex < 0 || newIndex >= pages.length) return;
    const newPages = [...pages];
    [newPages[pageIndex], newPages[newIndex]] = [newPages[newIndex], newPages[pageIndex]];
    setPages(newPages);
    onUpdateConfig(selectedFileId, { ...currentFileConfig, pageOrder: newPages.map(p => p.id - 1) });
  };

  const jumpToPage = (currentIndex, targetIndex) => {
    if (targetIndex < 0 || targetIndex >= pages.length || currentIndex === targetIndex) return;
    const newPages = [...pages];
    const [movedPage] = newPages.splice(currentIndex, 1);
    newPages.splice(targetIndex, 0, movedPage);
    setPages(newPages);
    onUpdateConfig(selectedFileId, { ...currentFileConfig, pageOrder: newPages.map(p => p.id - 1) });
  };

  return (
    <div className={cn(
      "group relative bg-card border rounded-3xl overflow-hidden transition-all duration-300",
      node.expanded ? "shadow-xl border-primary/20 ring-1 ring-primary/5" : "hover:border-primary/30"
    )}>
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 transition-colors",
        isSplit ? "bg-orange-500" : isReorder ? "bg-indigo-500" : "bg-blue-600"
      )} />

      <div className="flex items-center gap-4 p-4 pl-6">
        <div className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground/30 hover:text-muted-foreground transition-colors shrink-0">
          <GripVertical size={20} />
        </div>

        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          typeInfo.bgColor,
          typeInfo.color
        )}>
          <typeInfo.icon size={20} />
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-black text-sm">{node.label}</h4>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 bg-muted/30 px-2 py-0.5 rounded-full">
              {typeInfo.label}
            </span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight truncate">
            {isMerge ? `Merge ${inputPool.length} files` : `Configuring ${inputPool.length} individual items`}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onToggleExpand}
            className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
          >
            {node.expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-destructive/10 rounded-xl transition-colors text-destructive"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {node.expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t"
          >
            <div className="flex flex-col sm:flex-row min-h-[450px]">
              {!isMerge && (
                <>
                  {/* File sidebar */}
                  <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r bg-muted/5 flex flex-col p-4 space-y-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Input Flow</p>
                    <div className="flex flex-row sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible no-scrollbar">
                      {inputPool.map(file => (
                        <button
                          key={file.id}
                          onClick={() => setSelectedFileId(file.id)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all border shrink-0 sm:shrink",
                            selectedFileId === file.id 
                              ? "bg-card border-primary shadow-sm ring-1 ring-primary/10" 
                              : "bg-transparent border-transparent text-muted-foreground hover:bg-muted/30"
                          )}
                        >
                          <FileText size={16} className={selectedFileId === file.id ? "text-primary" : "text-muted-foreground/30"} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-black truncate max-w-[100px]">{file.name}</span>
                            <span className="text-[8px] font-bold uppercase opacity-50">{poolPageCounts[file.id] || '?'} Pages</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    <div className="mt-auto hidden sm:block pt-4 border-t">
                      <button 
                        onClick={() => onSyncAll(currentFileConfig)}
                        className="w-full py-3 px-4 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-primary/20"
                      >
                        <Copy size={14} /> Sync to All
                      </button>
                    </div>
                  </div>

                  {/* Settings Panel */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-6 space-y-6 flex-grow">
                      {isSplit && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                             <div className="space-y-1">
                                <h5 className="text-[11px] font-black uppercase tracking-widest">Configuration: <span className="text-primary">{virtualFile?.name}</span></h5>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Select split strategy</p>
                             </div>
                             <button
                                onClick={() => setShowPreview(!showPreview)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border",
                                    showPreview ? "bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-500/20" : "bg-muted/50 text-muted-foreground border-transparent hover:border-border"
                                )}
                             >
                                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showPreview ? "Hide Preview" : "Show Preview"}
                             </button>
                          </div>

                          {/* Split Mode Selector */}
                          <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-2xl border border-muted-foreground/5">
                             {[
                                { id: 'custom', label: 'Custom ranges', icon: MousePointer2 },
                                { id: 'fixed', label: 'Fixed interval', icon: Hash },
                                { id: 'extract', label: 'Extract all pages', icon: Archive }
                             ].map(mode => (
                               <button
                                 key={mode.id}
                                 onClick={() => handleUpdateMode(mode.id)}
                                 className={cn(
                                   "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all",
                                   currentFileConfig.mode === mode.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-muted/50"
                                 )}
                               >
                                 <mode.icon size={14} />
                                 <span className="hidden xs:inline">{mode.label}</span>
                               </button>
                             ))}
                          </div>

                          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                             {currentFileConfig.mode === 'custom' && (
                               <div className="grid gap-3">
                                  {(currentFileConfig.ranges || []).map((range, ridx) => (
                                    <div key={ridx} className={cn(
                                        "flex flex-col gap-3 p-4 bg-muted/20 border rounded-2xl transition-all",
                                        range.error ? "border-destructive/30 bg-destructive/5" : "border-muted-foreground/5 shadow-sm"
                                    )}>
                                      <div className="flex items-center gap-3">
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black uppercase tracking-tight text-muted-foreground ml-1">From Page</label>
                                            <input 
                                              type="number" 
                                              value={range.start}
                                              onChange={(e) => handleUpdateRange(ridx, 'start', e.target.value)}
                                              className="w-full px-3 py-2 rounded-xl border bg-background text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                             <label className="text-[9px] font-black uppercase tracking-tight text-muted-foreground ml-1">To Page</label>
                                             <input 
                                               type="number" 
                                               value={range.end}
                                               onChange={(e) => handleUpdateRange(ridx, 'end', e.target.value)}
                                               className="w-full px-3 py-2 rounded-xl border bg-background text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                             />
                                          </div>
                                        </div>
                                        {currentFileConfig.ranges?.length > 1 && (
                                          <button 
                                            onClick={() => handleRemoveRange(ridx)}
                                            className="p-2 mt-4 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        )}
                                      </div>
                                      {range.error && (
                                        <div className="flex items-center gap-1.5 text-destructive text-[9px] font-bold px-2 py-1 bg-destructive/5 rounded-lg border border-destructive/10">
                                            <AlertCircle size={12} /> {range.error}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                  <button 
                                    onClick={handleAddRange}
                                    className="w-full py-3 border-2 border-dashed border-primary/20 text-primary hover:border-primary/40 hover:bg-primary/5 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest"
                                  >
                                    <Plus size={14} /> Add Another Range
                                  </button>
                               </div>
                             )}

                             {currentFileConfig.mode === 'fixed' && (
                               <div className="p-8 bg-muted/20 border-2 border-dashed rounded-[2rem] flex flex-col items-center">
                                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4">Every N Pages</label>
                                  <div className="flex items-center gap-4">
                                     <button 
                                        onClick={() => validateAndNotify({ ...currentFileConfig, fixedInterval: Math.max(1, (parseInt(currentFileConfig.fixedInterval) || 1) - 1).toString() })}
                                        className="w-10 h-10 rounded-full bg-card border flex items-center justify-center hover:bg-muted transition-colors"
                                     >-</button>
                                     <input 
                                        type="number"
                                        value={currentFileConfig.fixedInterval || '1'}
                                        onChange={(e) => validateAndNotify({ ...currentFileConfig, fixedInterval: e.target.value })}
                                        className="w-20 text-center text-3xl font-black bg-transparent outline-none"
                                     />
                                     <button 
                                        onClick={() => validateAndNotify({ ...currentFileConfig, fixedInterval: ((parseInt(currentFileConfig.fixedInterval) || 1) + 1).toString() })}
                                        className="w-10 h-10 rounded-full bg-card border flex items-center justify-center hover:bg-muted transition-colors"
                                     >+</button>
                                  </div>
                                  <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                                    Document will be split into segments of {currentFileConfig.fixedInterval} pages each.
                                  </p>
                               </div>
                             )}

                             {currentFileConfig.mode === 'extract' && (
                                <div className="p-12 bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-[2rem] flex flex-col items-center">
                                   <Archive size={32} className="text-orange-500 mb-4" />
                                   <h6 className="text-sm font-black uppercase tracking-tight">Full Extraction</h6>
                                   <p className="text-center text-[11px] font-bold text-orange-900 dark:text-orange-100 mt-2">
                                     Every page in <span className="underline">{virtualFile?.name}</span> will become its own separate file. Total files expected: {pageCountForSelected || '?'}
                                   </p>
                                </div>
                             )}
                          </div>
                        </div>
                      )}

                      {isReorder && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h5 className="text-[11px] font-black uppercase tracking-widest">Reorder: <span className="text-primary">{virtualFile?.name}</span></h5>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Drag thumbnails or use arrows</p>
                            </div>
                          </div>

                          {rendering && pages.length === 0 ? (
                            <div className="flex flex-col items-center py-12 space-y-4">
                              <div className="w-16 h-16 rounded-full border-4 border-muted border-t-indigo-500 animate-spin" />
                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse font-mono">
                                Rendering... {renderProgress}%
                              </p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                              {pages.map((page, pidx) => (
                                <div key={page.id} className="group/page relative aspect-[3/4] bg-muted/20 border rounded-xl overflow-hidden flex flex-col hover:border-primary/50 transition-colors shadow-sm">
                                  <img src={page.thumbnail} className="w-full h-full object-contain pointer-events-none" alt="" />
                                  <div className="absolute top-1.5 left-1.5 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                    {page.id}
                                  </div>
                                  
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/page:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                     <div className="flex items-center gap-1">
                                       <button 
                                        onClick={() => movePage(pidx, -1)}
                                        disabled={pidx === 0}
                                        className="p-1.5 bg-white text-black rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-20"
                                       >
                                        <ChevronLeft size={14} />
                                       </button>
                                       <button 
                                        onClick={() => movePage(pidx, 1)}
                                        disabled={pidx === pages.length - 1}
                                        className="p-1.5 bg-white text-black rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-20"
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
                      )}
                    </div>
                  </div>

                  {/* PDF Preview Sidebar Overlay */}
                  <AnimatePresence>
                    {showPreview && isSplit && sourceFileObject && (
                      <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute right-0 top-0 bottom-0 w-full sm:w-[400px] md:w-[500px] z-50 bg-background border-l shadow-2xl overflow-hidden"
                      >
                         <PdfPreview 
                           file={sourceFileObject}
                           onClose={() => setShowPreview(false)}
                           forceFull={true}
                           selectedRanges={currentFileConfig.mode === 'custom' ? currentFileConfig.ranges : []}
                         />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {isMerge && (
                <div className="p-12 w-full">
                   <div className="flex flex-col items-center justify-center py-20 bg-blue-50/50 dark:bg-blue-900/10 rounded-[4rem] border border-blue-200 dark:border-blue-900/30">
                    <Merge size={48} className="text-blue-600 mb-6 opacity-50" />
                    <h5 className="text-xl font-black mb-2 tracking-tight uppercase tracking-widest">Merge Convergence</h5>
                    <p className="text-sm font-bold text-blue-900/60 dark:text-blue-100/60 text-center px-12 max-w-lg leading-relaxed">
                      All files flowing into this step will be merged into a single document.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-2xl px-8">
                       {inputPool.map((f, fi) => (
                         <div key={fi} className="px-3 py-1.5 bg-white dark:bg-black/40 border rounded-xl text-[9px] font-black uppercase tracking-tight shadow-sm whitespace-nowrap group">
                            <span className="text-muted-foreground mr-2">{fi + 1}.</span> {f.name}
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowNode;
