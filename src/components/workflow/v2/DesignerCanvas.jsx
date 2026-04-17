'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import CanvasNode from './CanvasNode';
import ConnectionLine from './ConnectionLine';

const DesignerCanvas = ({ 
  nodes, 
  edges, 
  panOffset, 
  setPanOffset, 
  zoom, 
  onAddNode, 
  onUpdateNode, 
  onRemoveNode, 
  onAddEdge, 
  onRemoveEdge,
  selectedNodeId,
  onSelectNode
}) => {
  const containerRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [draggingEdge, setDraggingEdge] = useState(null); // { fromNodeId, startPos }
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handlePointerDown = (e) => {
    if (e.target === containerRef.current || e.target.classList.contains('canvas-bg')) {
      setIsPanning(true);
      onSelectNode(null);
    }
  };

  const handlePointerMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    // With originX/Y: 0, the math is simply:
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;
    setMousePos({ x, y });

    if (isPanning) {
      setPanOffset(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  };

  const handlePointerUp = () => {
    // If we're dragging an edge, check if we're hovered over a valid target
    if (draggingEdge && hoveredNodeId && draggingEdge.fromNodeId !== hoveredNodeId) {
       onAddEdge(draggingEdge.fromNodeId, hoveredNodeId);
    }
    setIsPanning(false);
    setDraggingEdge(null);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('node-type');
    if (!type || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - panOffset.x) / zoom;
    const y = (e.clientY - rect.top - panOffset.y) / zoom;

    onAddNode(type, { x: x - 80, y: y - 40 }); // Center the node card roughly
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  // Node Port Connection Logic
  const handleStartEdge = (nodeId, portPos) => {
    setDraggingEdge({ fromNodeId: nodeId, startPos: portPos });
  };

  const handleEndEdge = (nodeId) => {
    // This is now handled by pointer-up on the canvas together with hoveredNodeId
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-background cursor-grab active:cursor-grabbing shadow-inner"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      {/* Dynamic Theme-Aware Grid */}
      <div 
        className="canvas-bg absolute inset-0 opacity-[0.2] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.15) 1px, transparent 0)`,
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
        }}
      />

      {/* Origin Marker */}
      <div 
        className="absolute w-4 h-4 rounded-full border border-white/10 pointer-events-none"
        style={{
          left: panOffset.x,
          top: panOffset.y,
        }}
      />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ 
          x: panOffset.x, 
          y: panOffset.y, 
          scale: zoom,
          originX: 0,
          originY: 0
        }}
      >
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none text-primary">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
            </marker>
          </defs>
          
          {/* Permanent Edges */}
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.fromNodeId);
            const toNode = nodes.find(n => n.id === edge.toNodeId);
            if (!fromNode || !toNode) return null;

            return (
              <ConnectionLine 
                key={edge.id}
                fromPos={{ x: fromNode.position.x + 192, y: fromNode.position.y + 60 }}
                toPos={{ x: toNode.position.x, y: toNode.position.y + 60 }}
                onRemove={() => onRemoveEdge(edge.id)}
              />
            );
          })}

          {/* Temporary line while dragging */}
          {draggingEdge && (
            <ConnectionLine 
              fromPos={draggingEdge.startPos}
              toPos={mousePos}
              isTemp={true}
            />
          )}
        </svg>

        {/* Nodes layer */}
        <div className="absolute inset-0 pointer-events-auto">
          {nodes.map(node => (
            <CanvasNode 
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              zoom={zoom}
              onSelect={() => onSelectNode(node.id)}
              onUpdatePosition={(pos) => onUpdateNode(node.id, { position: pos })}
              onRemove={() => onRemoveNode(node.id)}
              onConnectStart={(portPos) => handleStartEdge(node.id, portPos)}
              onConnectEnd={(targetId) => {
                const sourceId = draggingEdge?.fromNodeId;
                if (sourceId && sourceId !== targetId) {
                  onAddEdge(sourceId, targetId);
                }
                setDraggingEdge(null);
              }}
              onHoverChange={setHoveredNodeId}
            />
          ))}
        </div>
      </motion.div>

      {/* Zoom / Info Overlay */}
      <div className="absolute top-6 right-6 flex flex-col items-end gap-2 pointer-events-none opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">V2 Designer Canvas</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">{nodes.length} Nodes • {edges.length} Connections</p>
      </div>
    </div>
  );
};

export default DesignerCanvas;
