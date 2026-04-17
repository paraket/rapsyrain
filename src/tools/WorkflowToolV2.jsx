'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useCanvasState } from '../hooks/useCanvasState';
import DesignerHeader from '../components/workflow/v2/DesignerHeader';
import NodeToolbar from '../components/workflow/v2/NodeToolbar';
import DesignerCanvas from '../components/workflow/v2/DesignerCanvas';
import NodeConfigPanel from '../components/workflow/v2/NodeConfigPanel';
import DesignerRunPanel from '../components/workflow/v2/DesignerRunPanel';
import WorkflowResults from '../components/workflow/WorkflowResults';
import { getPdfLib } from '../utils/pdf-utils';

const WorkflowToolV2 = () => {
  const canvas = useCanvasState();

  // Load metadata for pool files
  React.useEffect(() => {
    const loadMissingMetadata = async () => {
      const missingFiles = canvas.uploadedFiles.filter(f => !canvas.pageMetadata[f.id]);
      if (missingFiles.length === 0) return;

      const { PDFDocument } = await getPdfLib();
      const newMetadata = { ...canvas.pageMetadata };
      
      for (const f of missingFiles) {
        try {
          const arrayBuffer = await f.file.arrayBuffer();
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          newMetadata[f.id] = pdfDoc.getPageCount();
        } catch (err) {
          console.warn(`Could not load metadata for ${f.id}`, err);
        }
      }
      canvas.setPageMetadata(newMetadata);
    };

    loadMissingMetadata();
  }, [canvas.uploadedFiles, canvas.pageMetadata]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background select-none font-sans text-foreground">
      {/* Header */}
      <DesignerHeader 
        zoom={canvas.zoom} 
        setZoom={canvas.setZoom} 
        onRun={canvas.runWorkflow}
        onReset={canvas.resetAll}
      />

      <div className="flex flex-1 relative overflow-hidden">
        {/* Left Sidebar: Toolbar & File Pool */}
        <NodeToolbar 
          addFile={canvas.addFile}
          uploadedFiles={canvas.uploadedFiles}
          removeFile={canvas.removeFile}
        />

        {/* Main Workspace: Infinite Canvas */}
        <DesignerCanvas 
          nodes={canvas.nodes}
          edges={canvas.edges}
          panOffset={canvas.panOffset}
          setPanOffset={canvas.setPanOffset}
          zoom={canvas.zoom}
          onAddNode={canvas.addNode}
          onUpdateNode={canvas.updateNode}
          onRemoveNode={canvas.removeNode}
          onAddEdge={canvas.addEdge}
          onRemoveEdge={canvas.removeEdge}
          selectedNodeId={canvas.selectedNodeId}
          onSelectNode={canvas.setSelectedNodeId}
        />

        {/* Right Drawer: Config Panel */}
        <AnimatePresence>
          {canvas.selectedNodeId && (
            <NodeConfigPanel 
              node={canvas.nodes.find(n => n.id === canvas.selectedNodeId)}
              onUpdate={(partial) => canvas.updateNode(canvas.selectedNodeId, partial)}
              uploadedFiles={canvas.uploadedFiles}
              onClose={() => canvas.setSelectedNodeId(null)}
              poolPageCounts={canvas.pageMetadata}
            />
          )}
        </AnimatePresence>

        {/* Floating Run Controls */}
        <DesignerRunPanel 
          processing={canvas.processing}
          onRun={canvas.runWorkflow}
          onReset={canvas.resetAll}
          error={canvas.error}
          nodes={canvas.nodes}
          orderedNodes={canvas.orderedNodes}
          edges={canvas.edges}
          progress={canvas.runProgress}
        />
      </div>

      {/* Full Screen Results Modal */}
      <AnimatePresence>
        {canvas.results && (
          <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl overflow-y-auto">
             <div className="min-h-screen py-20 px-4">
                <WorkflowResults 
                  results={canvas.results} 
                  onReset={() => {
                    canvas.resetAll();
                  }} 
                />
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkflowToolV2;
