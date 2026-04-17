'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Workflow, Plus, Play, RefreshCw, 
  FileText, X, AlertCircle, Info, 
  Settings, HelpCircle, Archive, ArrowRight, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import ToolLayout from '../components/ToolLayout';
import ToolHeader from '../components/common/ToolHeader';
import UploadArea from '../components/common/UploadArea';
import ActionButton from '../components/common/ActionButton';
import ToolGuide from '../components/common/ToolGuide';
import NodeTypeMenu from '../components/workflow/NodeTypeMenu';
import WorkflowNode from '../components/workflow/WorkflowNode';
import WorkflowProgress from '../components/workflow/WorkflowProgress';
import WorkflowResults from '../components/workflow/WorkflowResults';
import { executeWorkflow } from '../utils/workflow-executor';
import { simulatePipeline } from '../utils/workflow-simulator';
import { generateId } from '../utils/security';
import { cn } from '../utils/cn';
import AdUnit from '../components/common/AdUnit';
import { getPdfLib } from '../utils/pdf-utils';

const WorkflowTool = ({ onBack }) => {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [runProgress, setRunProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [pageMetadata, setPageMetadata] = useState({}); // { workflowId: pageCount }

  // Simulate pipeline to get the input pool for each node
  const pools = useMemo(() => simulatePipeline(uploadedFiles, nodes), [uploadedFiles, nodes]);

  // Load metadata for newly discovered items in pools
  useEffect(() => {
    const loadMissingMetadata = async () => {
        const missingIds = [];
        pools.flat().forEach(file => {
            if (!pageMetadata[file.id]) missingIds.push(file);
        });

        if (missingIds.length === 0) return;

        const { PDFDocument } = await getPdfLib();
        const newMetadata = { ...pageMetadata };
        
        for (const vf of missingIds) {
            try {
                // Find the source file
                const source = uploadedFiles.find(f => f.id === vf.sourceId);
                if (source) {
                    const arrayBuffer = await source.file.arrayBuffer();
                    const pdfDoc = await PDFDocument.load(arrayBuffer);
                    newMetadata[vf.id] = pdfDoc.getPageCount();
                } else if (vf.id.includes('merged')) {
                    // Merged files are complex to metadata-check without running, 
                    // we'll estimate or wait for execution. For now, assume sum of inputs.
                    newMetadata[vf.id] = 0; // Will be updated if we implement a better heuristic
                }
            } catch (err) {
                console.warn(`Could not load metadata for ${vf.id}`, err);
            }
        }
        setPageMetadata(newMetadata);
    };

    loadMissingMetadata();
  }, [pools, uploadedFiles]);

  const handleFilesSelected = (files) => {
    const newFiles = files.map(file => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const addNode = (type) => {
    const newNode = {
      id: generateId(),
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Step ${nodes.length + 1}`,
      expanded: true,
      config: {
        perFile: {} 
      }
    };
    
    setNodes(prev => [...prev, newNode]);
    setResults(null);
  };

  const updateNodeConfig = (id, fileId, fileConfig) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          config: {
            ...n.config,
            perFile: {
              ...n.config.perFile,
              [fileId]: fileConfig
            }
          }
        };
      }
      return n;
    }));
    setResults(null);
  };

  const syncNodeConfig = (id, configToSync) => {
    const nodeIndex = nodes.findIndex(n => n.id === id);
    if (nodeIndex === -1) return;
    
    const currentPool = pools[nodeIndex];
    const newPerFile = {};
    currentPool.forEach(file => {
      newPerFile[file.id] = { ...configToSync };
    });

    setNodes(prev => prev.map(n => n.id === id ? { ...n, config: { perFile: newPerFile } } : n));
  };

  const toggleNodeExpand = (id) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, expanded: !n.expanded } : n));
  };

  const removeNode = (id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setResults(null);
  };

  const handleRun = async () => {
    if (uploadedFiles.length === 0) return alert("Please upload at least one PDF first.");
    if (nodes.length === 0) return alert("Please add at least one operation to your workflow.");

    setProcessing(true);
    setRunProgress({ step: 0, nodeId: nodes[0].id, label: nodes[0].label });
    setError(null);

    try {
      const finalFiles = await executeWorkflow(uploadedFiles, nodes, (progress) => {
        setRunProgress(progress);
      });
      setResults(finalFiles);
    } catch (err) {
      console.error("Workflow failed:", err);
      setError("Workflow execution failed. Please check your settings.");
    } finally {
      setProcessing(false);
      setRunProgress(null);
    }
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setNodes([]);
    setResults(null);
    setRunProgress(null);
    setError(null);
    setPageMetadata({});
  };

  return (
    <ToolLayout
      title="Workflow Studio"
      description="Chain multiple PDF operations together in a visual pipeline."
      icon={Workflow}
      color="bg-violet-600"
      onBack={onBack}
    >
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <ToolHeader title="Pipeline Design" onReset={handleReset} />
          <div className="flex items-center gap-2">
             <button 
                onClick={() => router.push('/workflow/v2')}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-500/10 text-violet-500 border border-violet-500/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-500 hover:text-white transition-all transition-all shadow-lg shadow-violet-500/10"
             >
                <Sparkles size={16} /> V2 Designer
             </button>
             <button 
                onClick={() => setShowNodeMenu(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
             >
               <Plus size={16} /> Add Step
             </button>
          </div>
        </div>

        {/* Upload Management */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-2">Initial Uploads</p>
          <div className="flex flex-wrap gap-3 p-6 bg-muted/20 border border-dashed rounded-[2rem] min-h-[140px] items-center justify-center">
            {uploadedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4">
                 <button 
                    onClick={() => document.getElementById('workflow-upload').click()}
                    className="flex flex-col items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                 >
                    <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                       <Plus size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">Select Source PDFs</span>
                 </button>
                 <input 
                    id="workflow-upload" 
                    type="file" 
                    multiple 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={(e) => handleFilesSelected(Array.from(e.target.files))}
                 />
              </div>
            ) : (
              <AnimatePresence>
                {uploadedFiles.map((f) => (
                  <motion.div
                    key={f.id}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-2 px-4 py-2 bg-card border rounded-xl shadow-sm"
                  >
                    <FileText size={14} className="text-primary" />
                    <span className="text-xs font-bold truncate max-w-[120px]">{f.name}</span>
                    <button onClick={() => removeFile(f.id)} className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                       <X size={12} />
                    </button>
                  </motion.div>
                ))}
                <button 
                  key="add-more-workflow-btn"
                  onClick={() => document.getElementById('workflow-upload-more').click()}
                  className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-dashed border-primary/30 hover:bg-primary hover:text-white transition-all"
                >
                   <Plus size={16} />
                </button>
                <input 
                    key="add-more-workflow-input"
                    id="workflow-upload-more" 
                    type="file" 
                    multiple 
                    accept="application/pdf" 
                    className="hidden" 
                    onChange={(e) => handleFilesSelected(Array.from(e.target.files))}
                 />
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Pipeline Builder */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-2 pl-2">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Workflow Pipeline</p>
             {nodes.length > 0 && <span className="text-[10px] font-black text-muted-foreground/30 italic">Drag nodes to reorder</span>}
          </div>

          {nodes.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed rounded-[3rem] bg-muted/5 opacity-60">
                <Workflow size={48} className="text-muted-foreground/30 mb-4" />
                <p className="text-sm font-bold text-muted-foreground text-center px-12">
                  Your pipeline is empty.<br />Add a Split, Reorder, or Merge step to begin.
                </p>
                <button 
                    onClick={() => setShowNodeMenu(true)}
                    className="mt-8 flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                    <Plus size={18} /> Build First Step
                </button>
            </div>
          ) : (
            <div className="relative space-y-0">
               {/* Visual Connector Line */}
               {nodes.length > 1 && (
                  <div className="absolute left-[31px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-muted-foreground/20 z-0" />
               )}

               <Reorder.Group axis="y" values={nodes} onReorder={setNodes} className="space-y-8 relative z-10">
                  {nodes.map((node, index) => (
                    <Reorder.Item key={node.id} value={node} className="relative">
                       <WorkflowNode 
                          node={node}
                          index={index}
                          inputPool={pools[index]}
                          poolPageCounts={pageMetadata}
                          uploadedFiles={uploadedFiles}
                          onRemove={() => removeNode(node.id)}
                          onUpdateConfig={(fileId, conf) => updateNodeConfig(node.id, fileId, conf)}
                          onSyncAll={(conf) => syncNodeConfig(node.id, conf)}
                          onToggleExpand={() => toggleNodeExpand(node.id)}
                       />
                       {index < nodes.length - 1 && (
                         <div className="h-8 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-background border-2 border-muted-foreground/20 flex items-center justify-center text-muted-foreground/30 animate-pulse">
                               <ArrowRight size={12} className="rotate-90" />
                            </div>
                         </div>
                       )}
                    </Reorder.Item>
                  ))}
               </Reorder.Group>

               <div className="pt-8 flex justify-center">
                  <button 
                    onClick={() => setShowNodeMenu(true)}
                    className="group flex flex-col items-center gap-3 transition-all"
                  >
                     <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground/50 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
                        <Plus size={24} />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">Add Step</span>
                  </button>
               </div>
            </div>
          )}
        </div>

        <div className="flex justify-center py-4">
          <AdUnit format="horizontal" />
        </div>

        {/* Execution Area */}
        <div className="flex flex-col items-center pt-10 border-t">
          <AnimatePresence mode="wait">
            {!results ? (
              <div key="workflow-config-view" className="w-full flex flex-col items-center gap-6">
                {processing && <WorkflowProgress steps={nodes} currentStepIndex={runProgress?.step || 0} />}
                
                <ActionButton 
                  onClick={handleRun} 
                  loading={processing}
                  disabled={uploadedFiles.length === 0 || nodes.length === 0}
                  className="w-full max-w-sm"
                >
                  <Play size={20} />
                  Run Workflow
                </ActionButton>
                
                {error && (
                  <div className="flex items-center gap-2 text-destructive font-black text-xs bg-destructive/10 px-6 py-3 rounded-2xl border border-destructive/20 animate-in shake">
                     <AlertCircle size={16} /> {error}
                  </div>
                )}
                
                <ToolGuide items={[
                   "Analyze and configure each file independently in your pipeline.",
                  "Supported: Custom Ranges, Fixed Intervals, and Page Extraction.",
                  "Reorder nodes by dragging them to redirect the pipeline flow.",
                  "Live Preview: Toggle the eye icon in Split settings to see your pages."
                ]} />
              </div>
            ) : (
              <WorkflowResults key="workflow-results-view" results={results} onReset={() => setResults(null)} />
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showNodeMenu && (
          <NodeTypeMenu 
            onAdd={addNode} 
            onClose={() => setShowNodeMenu(false)} 
          />
        )}
      </AnimatePresence>
    </ToolLayout>
  );
};

export default WorkflowTool;
