'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scissors, Layers, Merge, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const NodeTypeMenu = ({ onAdd, onClose }) => {
  const options = [
    {
      type: 'split',
      title: 'Split PDF',
      description: 'Divide into parts',
      icon: Scissors,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50/50 dark:bg-orange-900/10'
    },
    {
      type: 'reorder',
      title: 'Reorder Pages',
      description: 'Rearrange pages',
      icon: Layers,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/50 dark:bg-indigo-900/10'
    },
    {
      type: 'merge',
      title: 'Merge PDF',
      description: 'Combine into one',
      icon: Merge,
      color: 'bg-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50/50 dark:bg-blue-900/10'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="relative w-full max-w-sm sm:max-w-xl bg-card border rounded-[2rem] shadow-2xl overflow-hidden p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black tracking-tight">Add Workflow Step</h3>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Select an operation</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {options.map((opt) => (
            <button
              key={opt.type}
              onClick={() => {
                onAdd(opt.type);
                onClose();
              }}
              className={cn(
                "group flex flex-col items-center text-center p-6 rounded-3xl border-2 border-transparent transition-all duration-300",
                opt.bgColor,
                "hover:border-primary/50 hover:bg-card hover:shadow-xl hover:-translate-y-1"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110",
                opt.color
              )}>
                <opt.icon size={24} />
              </div>
              <h4 className="font-black text-sm mb-1">{opt.title}</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{opt.description}</p>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NodeTypeMenu;
