import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { Settings as SettingsIcon, ChevronLeft, Eye, EyeOff, LayoutPanelLeft, Zap } from 'lucide-react';

const Settings = ({ onBack }) => {
  const { 
    showPageNumbers, 
    setShowPageNumbers,
    optimizeSplitPreview,
    setOptimizeSplitPreview,
    splitPreviewCount,
    setSplitPreviewCount
  } = useSettings();

  const options = [1, 2, 3];

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-3xl mx-auto py-2 md:py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 md:space-y-8"
        >
          {/* General Viewer */}
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Viewer Preferences</h2>
            
            <div 
              onClick={() => setShowPageNumbers(!showPageNumbers)}
              className="p-3 md:p-6 rounded-2xl border bg-card hover:bg-muted/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-xl transition-colors shrink-0 ${showPageNumbers ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {showPageNumbers ? <Eye size={20} /> : <EyeOff size={20} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-foreground truncate">Professional Page Numbers</h3>
                    <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                      Show native page indicators and scrollbar hints during preview.
                    </p>
                  </div>
                </div>
                
                <div className={`shrink-0 w-12 h-7 rounded-full border-2 p-1 transition-colors duration-300 ${showPageNumbers ? 'bg-primary border-primary' : 'bg-muted border-border'}`}>
                  <motion.div 
                    animate={{ x: showPageNumbers ? 20 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Split Tool Specific */}
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1 text-orange-600">Split Optimization</h2>
            
            <div className="space-y-2">
              <div 
                onClick={() => setOptimizeSplitPreview(!optimizeSplitPreview)}
                className="p-3 md:p-6 rounded-2xl border bg-card hover:bg-muted/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-xl transition-colors shrink-0 ${optimizeSplitPreview ? 'bg-orange-100 text-orange-600' : 'bg-muted text-muted-foreground'}`}>
                      <Zap size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-foreground truncate">Optimize Split Preview</h3>
                      <p className="text-[11px] text-muted-foreground font-medium leading-tight line-clamp-2">
                        Limit large files to a few starting pages in the Split Tool.
                      </p>
                    </div>
                  </div>
                  
                  <div className={`shrink-0 w-12 h-7 rounded-full border-2 p-1 transition-colors duration-300 ${optimizeSplitPreview ? 'bg-orange-500 border-orange-500' : 'bg-muted border-border'}`}>
                    <motion.div 
                      animate={{ x: optimizeSplitPreview ? 20 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </div>

              {/* 3-Option Discrete Selector */}
              <AnimatePresence mode="wait">
                {optimizeSplitPreview && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-3 md:p-6 rounded-2xl border bg-orange-50/30 dark:bg-orange-950/10 border-orange-200/50 dark:border-orange-900/30 space-y-3">
                      <div className="flex items-center justify-between pl-1">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground">Optimization Depth</p>
                          <p className="text-xs text-muted-foreground">Select how many pages to render for large files.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {options.map((count) => (
                          <button
                            key={count}
                            onClick={() => setSplitPreviewCount(count)}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group relative overflow-hidden ${
                              splitPreviewCount === count 
                                ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-100 dark:ring-orange-950/50' 
                                : 'bg-card border-border text-muted-foreground hover:border-orange-200 hover:text-foreground'
                            }`}
                          >
                            <span className={`text-2xl font-black font-mono transition-transform duration-300 ${splitPreviewCount === count ? 'scale-110' : 'group-hover:scale-105'}`}>
                              {count}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-tighter">
                              {count === 1 ? 'Page' : 'Pages'}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-orange-200 dark:border-orange-900/40 flex items-center gap-3">
                        <div className="bg-orange-500/10 text-orange-500 p-2 rounded-xl">
                          <Zap size={16} />
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                          Currently showing the first <span className="text-foreground font-bold">{splitPreviewCount} {splitPreviewCount === 1 ? 'page' : 'pages'}</span> in the preview.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground italic font-medium">
              All settings are saved locally. No data ever leaves your device.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Settings;
