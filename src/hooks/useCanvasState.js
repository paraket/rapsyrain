'use client';

import { useState, useCallback, useMemo } from 'react';
import { generateId } from '../utils/security';
import { executeWorkflow } from '../utils/workflow-executor';
import { simulatePipeline } from '../utils/workflow-simulator';

export function useCanvasState() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1.0);
  const [processing, setProcessing] = useState(false);
  const [runProgress, setRunProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [pageMetadata, setPageMetadata] = useState({}); // { fileId: pageCount }

  // Pool simulation for UI feedback
  // In V2, edges define the order. We need to build an ordered list of nodes for the simulator.
  const orderedNodes = useMemo(() => {
    const topoSort = [];
    const visited = new Set();
    const temp = new Set();

    const visit = (nodeId) => {
      if (temp.has(nodeId)) return; // Cycle detected
      if (!visited.has(nodeId)) {
        temp.add(nodeId);
        const outboundEdges = edges.filter(e => e.fromNodeId === nodeId);
        outboundEdges.forEach(e => visit(e.toNodeId));
        temp.delete(nodeId);
        visited.add(nodeId);
        topoSort.unshift(nodeId);
      }
    };

    const sourceNodes = nodes.filter(n => !edges.find(e => e.toNodeId === n.id));
    sourceNodes.forEach(n => visit(n.id));

    return topoSort.map(id => nodes.find(n => n.id === id)).filter(Boolean);
  }, [nodes, edges]);

  const pools = useMemo(() => simulatePipeline(uploadedFiles, orderedNodes), [uploadedFiles, orderedNodes]);

  const addFile = useCallback((files) => {
    const newFiles = Array.from(files).map(file => ({
      id: generateId(),
      file,
      name: file.name,
      size: file.size
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const addNode = useCallback((type, position) => {
    const newNode = {
      id: generateId(),
      type,
      position,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      config: { perFile: {} },
      assignedFileIds: []
    };
    setNodes(prev => [...prev, newNode]);
    return newNode.id;
  }, []);

  const updateNode = useCallback((id, partial) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...partial } : n));
  }, []);

  const removeNode = useCallback((id) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.fromNodeId !== id && e.toNodeId !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  }, [selectedNodeId]);

  const addEdge = useCallback((fromNodeId, toNodeId) => {
    // Prevent self-connections
    if (fromNodeId === toNodeId) return;
    // Prevent duplicate edges
    if (edges.find(e => e.fromNodeId === fromNodeId && e.toNodeId === toNodeId)) return;
    
    const newEdge = {
      id: generateId(),
      fromNodeId,
      toNodeId
    };
    setEdges(prev => [...prev, newEdge]);
  }, [edges]);

  const removeEdge = useCallback((id) => {
    setEdges(prev => prev.filter(e => e.id !== id));
  }, []);

  const runWorkflow = async () => {
    if (uploadedFiles.length === 0) {
      setError("Please upload at least one PDF.");
      return;
    }
    if (orderedNodes.length === 0) {
      setError("Please add and connect nodes to your pipeline.");
      return;
    }

    setProcessing(true);
    setRunProgress({ step: 0, nodeId: orderedNodes[0].id, label: orderedNodes[0].label });
    setError(null);

    try {
      // In V2, we only process files that are assigned to at least one node
      // Or we can just process all uploaded files. Let's process all for simplicity.
      const finalFiles = await executeWorkflow(uploadedFiles, orderedNodes, (progress) => {
        setRunProgress(progress);
      });
      setResults(finalFiles);
    } catch (err) {
      console.error("V2 Workflow failed:", err);
      setError("Workflow execution failed. Check your canvas connections.");
    } finally {
      setProcessing(false);
      setRunProgress(null);
    }
  };

  const resetAll = useCallback(() => {
    setUploadedFiles([]);
    setNodes([]);
    setEdges([]);
    setResults(null);
    setRunProgress(null);
    setError(null);
    setSelectedNodeId(null);
    setPageMetadata({});
  }, []);

  return {
    uploadedFiles,
    nodes,
    edges,
    selectedNodeId,
    panOffset,
    zoom,
    processing,
    runProgress,
    results,
    error,
    pools,
    orderedNodes,
    pageMetadata,
    setPageMetadata,
    setSelectedNodeId,
    setPanOffset,
    setZoom,
    addFile,
    removeFile,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    runWorkflow,
    resetAll,
    setError
  };
}
