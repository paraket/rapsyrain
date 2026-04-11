import React from 'react';
import { RefreshCw } from 'lucide-react';

const ToolHeader = ({ title, onReset, actionLabel = "Reset Tool" }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 animate-in fade-in slide-in-from-top-4 duration-200 ease-out">
      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground/90">
        {title}
      </h3>
      {onReset && (
        <button
          onClick={onReset}
          className="text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 px-4 py-2 rounded-2xl border border-destructive/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0 bg-card shadow-sm"
        >
          <RefreshCw size={12} className="text-destructive" /> 
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default ToolHeader;
