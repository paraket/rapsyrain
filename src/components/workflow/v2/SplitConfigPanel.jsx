'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, MousePointer2, Hash, Archive, 
  Plus, Trash2, AlertCircle, Eye, EyeOff 
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import PdfPreview from '../../common/PdfPreview';

const SplitConfigPanel = ({ node, onUpdate, uploadedFiles, poolPageCounts }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  // Use the first assigned file for the preview, or fallback to 'common' for storage
  const activeFileId = node.assignedFileIds?.[0];
  const activeFile = uploadedFiles.find(f => f.id === activeFileId);
  const pageCount = poolPageCounts[activeFileId] || 0;

  // The V2 node config follows the V1 schema, but we add 'common' to store defaults
  const commonConfig = node.config.common || node.config.perFile[activeFileId] || { 
    mode: 'custom', 
    ranges: [{ start: '1', end: '1' }],
    fixedInterval: '1'
  };

  const updateCommonConfig = (partial) => {
    const newConfig = { ...commonConfig, ...partial };
    
    // 1. Update the 'common' block
    const updatedNodeConfig = { 
      ...node.config, 
      common: newConfig,
      perFile: { ...node.config.perFile } 
    };

    // 2. Synchronize to all assigned files for execution compatibility
    if (node.assignedFileIds) {
      node.assignedFileIds.forEach(id => {
        updatedNodeConfig.perFile[id] = newConfig;
      });
    }

    onUpdate({ config: updatedNodeConfig });
  };

  const handleAddRange = () => {
    const newRanges = [...(commonConfig.ranges || []), { start: '1', end: '1' }];
    updateCommonConfig({ ranges: newRanges });
  };

  const handleUpdateRange = (idx, field, val) => {
    const newRanges = [...(commonConfig.ranges || [])];
    newRanges[idx] = { ...newRanges[idx], [field]: val };
    updateCommonConfig({ ranges: newRanges });
  };

  const handleRemoveRange = (idx) => {
    const newRanges = commonConfig.ranges.filter((_, i) => i !== idx);
    updateCommonConfig({ ranges: newRanges });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mode</h5>
         {activeFile && (
           <button 
             onClick={() => setShowPreview(!showPreview)}
             className={cn(
               "flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border",
               showPreview ? "bg-orange-600 text-white border-orange-700 shadow-lg shadow-orange-600/20" : "bg-muted/50 text-muted-foreground border-transparent hover:border-border"
             )}
           >
             {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
             {showPreview ? "Hide Preview" : "Show Preview"}
           </button>
         )}
      </div>

      <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-2xl border">
         {[
           { id: 'custom', label: 'Ranges', icon: MousePointer2 },
           { id: 'fixed', label: 'Fixed', icon: Hash },
           { id: 'extract', label: 'All', icon: Archive }
         ].map(m => (
           <button
             key={m.id}
             onClick={() => updateCommonConfig({ mode: m.id })}
             className={cn(
               "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all",
               commonConfig.mode === m.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:bg-muted/50"
             )}
           >
             <m.icon size={14} />
             <span>{m.label}</span>
           </button>
         ))}
      </div>

      <div className="pt-2">
        {commonConfig.mode === 'custom' && (
          <div className="space-y-3">
             {commonConfig.ranges?.map((range, idx) => (
               <div key={idx} className="flex flex-col gap-3 p-4 bg-muted/20 border rounded-2xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">From</label>
                      <input 
                        type="number" 
                        value={range.start}
                        onChange={(e) => handleUpdateRange(idx, 'start', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border bg-background text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground ml-1">To</label>
                      <input 
                        type="number" 
                        value={range.end}
                        onChange={(e) => handleUpdateRange(idx, 'end', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border bg-background text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                  {commonConfig.ranges.length > 1 && (
                    <button 
                      onClick={() => handleRemoveRange(idx)}
                      className="text-[9px] font-black uppercase text-destructive flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                    >
                      <Trash2 size={12} /> Remove Range
                    </button>
                  )}
               </div>
             ))}
             <button 
               onClick={handleAddRange}
               className="w-full py-3 border-2 border-dashed border-primary/20 text-primary hover:border-primary/50 hover:bg-primary/5 rounded-2xl transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase"
             >
               <Plus size={14} /> Add Range
             </button>
          </div>
        )}

        {commonConfig.mode === 'fixed' && (
           <div className="p-8 bg-muted/20 border-2 border-dashed rounded-[2rem] flex flex-col items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Every N Pages</label>
              <div className="flex items-center gap-4">
                 <button 
                    onClick={() => updateCommonConfig({ fixedInterval: Math.max(1, (parseInt(commonConfig.fixedInterval) || 1) - 1).toString() })}
                    className="w-10 h-10 rounded-full bg-card border flex items-center justify-center hover:bg-muted font-bold"
                 >-</button>
                 <span className="text-3xl font-black">{commonConfig.fixedInterval || '1'}</span>
                 <button 
                    onClick={() => updateCommonConfig({ fixedInterval: ((parseInt(commonConfig.fixedInterval) || 1) + 1).toString() })}
                    className="w-10 h-10 rounded-full bg-card border flex items-center justify-center hover:bg-muted font-bold"
                 >+</button>
              </div>
           </div>
        )}

        {commonConfig.mode === 'extract' && (
           <div className="p-10 bg-orange-500/5 border border-orange-500/10 rounded-[2rem] flex flex-col items-center text-center">
              <Archive size={32} className="text-orange-500 mb-4" />
              <p className="text-[10px] font-bold text-orange-900/60 dark:text-orange-100/60 uppercase tracking-widest leading-relaxed">
                Full Extraction Mode: Every page will be converted into a separate PDF file.
              </p>
           </div>
        )}
      </div>

      <AnimatePresence>
        {showPreview && activeFile && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
             <div className="h-[400px] border rounded-3xl overflow-hidden mt-6 bg-card">
               <PdfPreview 
                 file={activeFile.file}
                 onClose={() => setShowPreview(false)}
                 forceFull={true}
                 selectedRanges={commonConfig.mode === 'custom' ? commonConfig.ranges : []}
               />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!activeFile && (
        <div className="flex items-center gap-3 p-4 bg-muted/30 border border-dashed rounded-2xl">
           <AlertCircle size={18} className="text-muted-foreground" />
           <p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed">
             Assign at least one file in the "Files" tab to see previews.
           </p>
        </div>
      )}
    </div>
  );
};

export default SplitConfigPanel;
