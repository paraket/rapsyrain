'use client';

import React, { useState } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { 
  Scissors, Layers, Merge, 
  X, GripHorizontal, FileText, CheckCircle2 
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const CanvasNode = ({ 
  node, 
  isSelected, 
  zoom, 
  onSelect, 
  onUpdatePosition, 
  onRemove,
  onConnectStart,
  onConnectEnd,
  onHoverChange
}) => {
  const dragControls = useDragControls();

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

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onDragEnd={(e, info) => {
        const newX = node.position.x + (info.offset.x / zoom);
        const newY = node.position.y + (info.offset.y / zoom);
        onUpdatePosition({ x: newX, y: newY });
      }}
      initial={false}
      animate={{ x: node.position.x, y: node.position.y }}
      className={cn(
        "absolute w-48 bg-card border rounded-2xl shadow-xl cursor-default pointer-events-auto overflow-hidden transition-shadow select-none",
        isSelected ? "ring-2 ring-primary border-primary z-50 shadow-primary/20" : "hover:shadow-2xl z-20"
      )}
      onPointerDown={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {/* Input Port (Left) - Target Zone */}
      {!isSplit && (
        <div 
          className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border-2 border-muted flex items-center justify-center cursor-crosshair hover:border-primary hover:scale-125 transition-all z-30 group/port shadow-md"
          onPointerEnter={() => onHoverChange(node.id)}
          onPointerLeave={() => onHoverChange(null)}
          onPointerUp={(e) => {
            e.stopPropagation();
            onConnectEnd(node.id);
          }}
        >
          <div className="w-2 h-2 rounded-full bg-muted-foreground group-hover/port:bg-primary shadow-sm" />
        </div>
      )}

      {/* Output Port (Right) - Source Zone */}
      {!isMerge && (
        <div 
          className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border-2 border-muted flex items-center justify-center cursor-crosshair hover:border-primary hover:scale-125 transition-all z-30 group/port shadow-md"
          onPointerDown={(e) => {
            e.stopPropagation();
            onConnectStart(node.id, { x: node.position.x + 192, y: node.position.y + 60 });
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            onConnectEnd(node.id);
          }}
        >
          <div className="w-2 h-2 rounded-full bg-muted-foreground group-hover/port:bg-primary shadow-sm" />
        </div>
      )}

      {/* Node Header - Reused as Drag Handle */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className={cn("p-3 flex items-center justify-between cursor-grab active:cursor-grabbing", typeInfo.bgColor)}
      >
        <div className="flex items-center gap-2">
           <div className={cn("p-1.5 rounded-lg bg-card border shadow-sm", typeInfo.color)}>
              <typeInfo.icon size={12} />
           </div>
           <span className="text-[10px] font-black uppercase tracking-widest">{typeInfo.label}</span>
        </div>
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1 text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
        >
          <X size={12} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* Content Preview */}
        <div className="space-y-2">
           <div className="flex items-center gap-2">
              <FileText size={10} className="text-muted-foreground" />
              <p className="text-[9px] font-bold text-muted-foreground truncate uppercase tracking-[0.05em]">
                {node.assignedFileIds?.length || 0} Files assigned
              </p>
           </div>
           
           <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm" />
              <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Configured</p>
           </div>
        </div>
      </div>

      {/* Footer / Drag handle hint */}
      <div className="h-1.5 bg-muted/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
         <GripHorizontal size={8} className="text-muted-foreground/20" />
      </div>
    </motion.div>
  );
};

export default CanvasNode;
