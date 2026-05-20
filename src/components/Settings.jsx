import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { Settings as SettingsIcon, ChevronLeft, Eye, EyeOff, LayoutPanelLeft, Zap, Palette, Check, Workflow } from 'lucide-react';
 
const Settings = ({ onBack }) => {
  const { 
    showPageNumbers, 
    setShowPageNumbers,
    optimizeSplitPreview,
    setOptimizeSplitPreview,
    splitPreviewCount,
    setSplitPreviewCount,
    maxPageCap,
    setMaxPageCap,
    progressiveLoading,
    setProgressiveLoading,
    setPrimaryColor,
    primaryColor,
    workflowStudioEnabled,
    setWorkflowStudioEnabled,
    THEME_COLORS
  } = useSettings();
 
  const options = [1, 2, 3];
  const capOptions = [100, 500, 1000, 2000, 5000];

  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-3xl mx-auto py-2 md:py-12 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 md:space-y-8"
        >
          {/* Brand Theme */}
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1 text-primary">Brand Theme</h2>
            <div className="p-4 md:p-6 rounded-3xl border bg-card/50 backdrop-blur-sm shadow-sm space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 text-primary rounded-xl">
                  <Palette size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Accent Color</h3>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Personalize your suite experience</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPrimaryColor(color.value)}
                    className="relative group focus:outline-none"
                    title={color.name}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-2xl shadow-lg cursor-pointer transition-all border-2 flex items-center justify-center overflow-hidden"
                      style={{ 
                        backgroundColor: `hsl(${color.value})`,
                        borderColor: primaryColor === color.value ? 'white' : 'transparent'
                      }}
                    >
                      {primaryColor === color.value && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <Check size={18} className="text-white drop-shadow-md" />
                        </motion.div>
                      )}
                    </motion.div>
                  </button>
                ))}
              </div>
            </div>
          </div>

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
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1 text-primary">Split Optimization</h2>
            
            <div className="space-y-2">
              <div 
                onClick={() => setOptimizeSplitPreview(!optimizeSplitPreview)}
                className="p-3 md:p-6 rounded-2xl border bg-card hover:bg-muted/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-xl transition-colors shrink-0 ${optimizeSplitPreview ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Zap size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-foreground truncate">Optimize Split Preview</h3>
                      <p className="text-[11px] text-muted-foreground font-medium leading-tight line-clamp-2">
                        Limit large files to a few starting pages in the Split Tool.
                      </p>
                    </div>
                  </div>
                  
                  <div className={`shrink-0 w-12 h-7 rounded-full border-2 p-1 transition-colors duration-300 ${optimizeSplitPreview ? 'bg-primary border-primary' : 'bg-muted border-border'}`}>
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
                    <div className="p-3 md:p-6 rounded-2xl border bg-primary/5 dark:bg-primary/10 border-primary/20 space-y-3">
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
                                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/25 ring-2 ring-primary/10 dark:ring-primary/20' 
                                : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
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

                      <div className="p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-primary/20 flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-2 rounded-xl">
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

          {/* Workflow Studio */}
          <div className="space-y-1">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1 text-primary">Advanced Features</h2>
            
            <div 
              onClick={() => setWorkflowStudioEnabled(!workflowStudioEnabled)}
              className="p-3 md:p-6 rounded-2xl border bg-card hover:bg-muted/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-xl transition-colors shrink-0 ${workflowStudioEnabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Workflow size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-foreground truncate">Workflow Studio</h3>
                    <p className="text-[11px] text-muted-foreground font-medium leading-tight">
                      Enable or disable Workflow Studio for custom multi-step PDF pipelines.
                    </p>
                  </div>
                </div>
                
                <div className={`shrink-0 w-12 h-7 rounded-full border-2 p-1 transition-colors duration-300 ${workflowStudioEnabled ? 'bg-primary border-primary' : 'bg-muted border-border'}`}>
                  <motion.div 
                    animate={{ x: workflowStudioEnabled ? 20 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Engine Performance */}
          <div className="space-y-3">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1 text-primary">Engine Performance</h2>
            
            <div className="space-y-2">
              <div 
                onClick={() => setProgressiveLoading(!progressiveLoading)}
                className="p-3 md:p-6 rounded-2xl border bg-card hover:bg-muted/30 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-xl transition-colors shrink-0 ${progressiveLoading ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Zap size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-foreground truncate">Progressive Loading</h3>
                      <p className="text-[11px] text-muted-foreground font-medium leading-tight">
                        Display pages instantly in batches as they process.
                      </p>
                    </div>
                  </div>
                  
                  <div className={`shrink-0 w-12 h-7 rounded-full border-2 p-1 transition-colors duration-300 ${progressiveLoading ? 'bg-primary border-primary' : 'bg-muted border-border'}`}>
                    <motion.div 
                      animate={{ x: progressiveLoading ? 20 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 md:p-6 rounded-2xl border bg-card space-y-4">
                <div className="flex flex-col gap-1.5 pl-1">
                  <h3 className="font-bold text-base text-foreground">Max Page Render Limit</h3>
                  <p className="text-[11px] text-muted-foreground font-medium leading-tight mb-2">
                    Enforce a maximum page count for stability.
                  </p>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {capOptions.map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setMaxPageCap(cap)}
                      className={`py-2 px-1 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 group relative overflow-hidden ${
                         maxPageCap === cap 
                          ? 'bg-primary border-primary text-white shadow-lg' 
                          : 'bg-card border-border text-muted-foreground hover:bg-muted hover:border-primary/50'
                      }`}
                    >
                      <span className="text-xs font-black">{cap}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/10 rounded-2xl border border-blue-200/50 dark:border-blue-900/30">
                  <p className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 leading-relaxed italic">
                    Note: Higher limits allow larger documents but may cause browser crashes or lag on mobile devices and low-memory systems.
                  </p>
                </div>
              </div>
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
