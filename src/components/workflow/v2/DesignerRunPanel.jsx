'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RefreshCw, AlertCircle, 
  CheckCircle2, Workflow, ArrowRight 
} from 'lucide-react';
import WorkflowProgress from '../WorkflowProgress';

const DesignerRunPanel = ({ 
  processing, 
  onRun, 
  onReset, 
  error, 
  nodes, 
  edges,
  progress 
}) => {
  const isValid = nodes.length > 0 && edges.length >= (nodes.length > 1 ? 1 : 0);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[55] flex flex-col items-center gap-4 w-full max-w-xl px-4 pointer-events-none">
      <AnimatePresence>
        {processing && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="w-full bg-card/90 backdrop-blur-xl border border-primary/20 rounded-[2.5rem] p-6 shadow-2xl pointer-events-auto shadow-primary/10"
          >
             <WorkflowProgress 
               steps={nodes} 
               currentStepIndex={progress?.step || 0} 
             />
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex items-center gap-3 px-6 py-3 bg-destructive text-white rounded-2xl shadow-2xl pointer-events-auto"
          >
             <AlertCircle size={18} />
             <span className="text-xs font-black uppercase tracking-widest">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 bg-card/80 backdrop-blur-xl border p-2 rounded-3xl shadow-2xl pointer-events-auto shadow-black/20">
        <button 
          onClick={onReset}
          className="p-4 hover:bg-muted rounded-[1.25rem] transition-all text-muted-foreground group"
          title="Reset Canvas"
        >
          <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>

        <button 
          onClick={onRun}
          disabled={processing || !isValid}
          className="flex items-center gap-3 px-10 py-4 bg-violet-600 text-white rounded-[1.25rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-violet-700 hover:shadow-xl hover:shadow-violet-600/30 transition-all disabled:opacity-40 disabled:hover:shadow-none"
        >
          {processing ? (
            <RefreshCw size={20} className="animate-spin" />
          ) : (
            <Play size={20} fill="currentColor" />
          )}
          {processing ? "Executing..." : "Run Pipeline"}
        </button>

        <div className="px-4 border-l flex flex-col items-center justify-center opacity-40">
           <p className="text-[10px] font-black">{nodes.length}</p>
           <p className="text-[8px] font-bold uppercase">Steps</p>
        </div>
      </div>
    </div>
  );
};

export default DesignerRunPanel;
