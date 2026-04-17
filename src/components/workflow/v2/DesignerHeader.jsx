'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, ZoomIn, ZoomOut, Maximize, 
  RefreshCw, Play, Sparkles 
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const DesignerHeader = ({ zoom, setZoom, onRun, onReset }) => {
  const router = useRouter();

  const handleZoom = (delta) => {
    setZoom(prev => Math.min(2.0, Math.max(0.3, prev + delta)));
  };

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-md flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => router.push('/workflow')}
          className="p-2 hover:bg-muted rounded-xl transition-colors text-muted-foreground"
          title="Back to Classic View"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-black text-sm tracking-tight">Designer Mode</h1>
            <span className="bg-violet-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest">v2 Beta</span>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Visual PDF Pipeline</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-2xl border">
          <button 
            onClick={() => handleZoom(-0.1)}
            className="p-2 hover:bg-card rounded-xl transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-[10px] font-black w-12 text-center select-none uppercase tracking-widest">
            {Math.round(zoom * 100)}%
          </span>
          <button 
            onClick={() => handleZoom(0.1)}
            className="p-2 hover:bg-card rounded-xl transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <div className="w-px h-4 bg-muted-foreground/20 mx-1" />
          <button 
            onClick={() => setZoom(1.0)}
            className="p-2 hover:bg-card rounded-xl transition-colors"
            title="Reset Zoom"
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-xl text-xs font-black uppercase tracking-widest transition-all"
        >
          <RefreshCw size={16} /> Reset
        </button>
        <button 
          onClick={onRun}
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-700 transition-all shadow-lg shadow-violet-600/20"
        >
          <Play size={16} fill="currentColor" /> Run Designer
        </button>
      </div>
    </header>
  );
};

export default DesignerHeader;
