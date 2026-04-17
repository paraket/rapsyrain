'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Settings, FileText, 
  CheckCircle2, AlertCircle, Copy,
  Eye, Scissors, Layers, Merge
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import SplitConfigPanel from './SplitConfigPanel';
import ReorderConfigPanel from './ReorderConfigPanel';
import FilePoolPanel from './FilePoolPanel';

const NodeConfigPanel = ({ 
  node, 
  onUpdate, 
  uploadedFiles, 
  onClose,
  poolPageCounts 
}) => {
  const [activeTab, setActiveTab] = useState('config'); // 'config' | 'files'

  if (!node) return null;

  const isSplit = node.type === 'split';
  const isReorder = node.type === 'reorder';
  const isMerge = node.type === 'merge';

  const getTypeIcon = () => {
    if (isSplit) return Scissors;
    if (isReorder) return Layers;
    if (isMerge) return Merge;
    return Settings;
  };

  const Icon = getTypeIcon();

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 w-[400px] bg-card border-l shadow-2xl z-[60] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between bg-muted/5">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Icon size={18} />
           </div>
           <div>
              <h3 className="text-sm font-black uppercase tracking-widest">{node.label}</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Node Configuration</p>
           </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button 
          onClick={() => setActiveTab('config')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
            activeTab === 'config' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:bg-muted/50"
          )}
        >
          Settings
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
            activeTab === 'files' ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:bg-muted/50"
          )}
        >
          Assigned Files
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'config' ? (
            <motion.div 
              key="config-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-6"
            >
              {isSplit && (
                <SplitConfigPanel 
                  node={node}
                  onUpdate={onUpdate}
                  uploadedFiles={uploadedFiles}
                  poolPageCounts={poolPageCounts}
                />
              )}
              {isReorder && (
                <ReorderConfigPanel 
                  node={node}
                  onUpdate={onUpdate}
                  uploadedFiles={uploadedFiles}
                />
              )}
              {isMerge && (
                <div className="flex flex-col items-center justify-center py-20 bg-blue-500/5 rounded-3xl border border-dashed border-blue-500/20 text-center px-8">
                   <Merge size={32} className="text-blue-500 mb-4" />
                   <p className="text-xs font-bold text-blue-900/60 dark:text-blue-100/60 leading-relaxed uppercase tracking-tight">
                     All files entering this node will be merged into a single PDF document.
                   </p>
                   <div className="mt-4 flex flex-wrap justify-center gap-1.5 opacity-40">
                      {node.assignedFileIds?.map((id, i) => (
                        <div key={id} className="text-[10px] font-black">{i + 1}</div>
                      ))}
                   </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="files-tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="p-6"
            >
              <FilePoolPanel 
                node={node}
                uploadedFiles={uploadedFiles}
                onUpdate={onUpdate}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 border-t bg-muted/5">
         <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed opacity-60">
           Configure your PDF logic here. Changes are saved automatically within the session.
         </p>
      </div>
    </motion.aside>
  );
};

export default NodeConfigPanel;
