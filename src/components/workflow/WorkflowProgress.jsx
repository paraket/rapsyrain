'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Layers, Merge, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

const WorkflowProgress = ({ steps, currentStepIndex }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'split': return Scissors;
      case 'reorder': return Layers;
      case 'merge': return Merge;
      default: return CheckCircle2;
    }
  };

  const getColorClass = (type) => {
    switch (type) {
      case 'split': return 'text-orange-500';
      case 'reorder': return 'text-indigo-500';
      case 'merge': return 'text-blue-600';
      default: return 'text-primary';
    }
  };

  return (
    <div className="w-full overflow-hidden py-4">
      <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar px-4">
        {steps.map((step, idx) => {
          const Icon = getIcon(step.type);
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <React.Fragment key={step.id}>
              <motion.div
                initial={false}
                animate={{
                  opacity: isActive ? 1 : 0.6,
                  scale: isActive ? 1.05 : 1,
                }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all shrink-0",
                  isActive ? "bg-primary/10 border-primary" : "bg-muted/30 border-transparent",
                  isCompleted ? "bg-emerald-500/10 border-emerald-500/20" : ""
                )}
              >
                <div className={cn(
                   "w-6 h-6 rounded-lg flex items-center justify-center",
                   isCompleted ? "bg-emerald-500 text-white" : isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <CheckCircle2 size={14} />
                  ) : isActive ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Icon size={14} />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest leading-none mb-0.5",
                    isActive ? "text-primary" : "text-muted-foreground",
                    isCompleted ? "text-emerald-600" : ""
                  )}>
                    Step {idx + 1}
                  </span>
                  <span className="text-xs font-bold truncate max-w-[80px]">{step.label}</span>
                </div>
              </motion.div>
              {idx < steps.length - 1 && (
                <ChevronRight size={16} className="text-muted-foreground/30 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowProgress;
