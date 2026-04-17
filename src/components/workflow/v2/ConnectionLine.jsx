'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ConnectionLine = ({ fromPos, toPos, onRemove, isTemp }) => {
  const [isHovered, setIsHovered] = useState(false);

  // God-tier Bezier path calculation with higher tension
  const dx = Math.abs(toPos.x - fromPos.x);
  const dy = Math.abs(toPos.y - fromPos.y);
  
  // Tension increases slightly with distance to keep the 'S' shape elegant
  const horizontalOffset = Math.max(dx * 0.45, 60);
  
  const p1x = fromPos.x + horizontalOffset;
  const p1y = fromPos.y;
  const p2x = toPos.x - horizontalOffset;
  const p2y = toPos.y;

  const pathData = `M ${fromPos.x} ${fromPos.y} C ${p1x} ${p1y}, ${p2x} ${p2y}, ${toPos.x} ${toPos.y}`;

  return (
    <g 
      className="pointer-events-auto cursor-pointer group"
      onMouseEnter={() => !isTemp && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={!isTemp ? (e) => {
        e.stopPropagation();
        onRemove();
      } : undefined}
    >
      {/* Invisible thicker path for hit area expansion */}
      {!isTemp && (
        <path 
          d={pathData} 
          fill="none" 
          stroke="transparent" 
          strokeWidth="24" 
        />
      )}
      
      {/* Main Connection Path */}
      <motion.path 
        d={pathData} 
        fill="none" 
        stroke={isTemp ? "currentColor" : isHovered ? "hsl(var(--destructive))" : "currentColor"}
        strokeWidth={isTemp ? "3" : isHovered ? "4" : "3"}
        strokeOpacity={isTemp ? "0.4" : "1"}
        strokeDasharray={isTemp ? "8 6" : "none"}
        className="transition-colors duration-200"
        markerEnd={isTemp ? "" : "url(#arrowhead)"}
        initial={isTemp ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
      </motion.path>

      {/* Delete Hub */}
      {isHovered && !isTemp && (
        <foreignObject x={(fromPos.x + toPos.x) / 2 - 12} y={(fromPos.y + toPos.y) / 2 - 12} width="24" height="24">
          <div className="w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-2xl scale-125 border-2 border-background animate-in zoom-in-50 duration-200">
            <span className="text-[16px] font-black leading-none mt-[-1px]">×</span>
          </div>
        </foreignObject>
      )}
    </g>
  );
};

export default ConnectionLine;
