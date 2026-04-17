'use client';

import React from 'react';
import { 
  Scissors, Layers, Merge, 
  FilePlus, FileText, Trash2, 
  Plus, Archive, Info
} from 'lucide-react';
import { cn } from '../../../utils/cn';

const TOOL_TYPES = [
  { id: 'split', label: 'Split', icon: Scissors, color: 'text-orange-500', bgColor: 'bg-orange-500/10', description: 'Break PDF into parts' },
  { id: 'reorder', label: 'Reorder', icon: Layers, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10', description: 'Rearrange or pick pages' },
  { id: 'merge', label: 'Merge', icon: Merge, color: 'text-blue-600', bgColor: 'bg-blue-600/10', description: 'Combine multiple PDFs' }
];

const NodeToolbar = ({ addFile, uploadedFiles, removeFile }) => {
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData('node-type', type);
    // Create a ghost image or just let default handle it
  };

  const onFileChange = (e) => {
    if (e.target.files) {
      addFile(e.target.files);
    }
  };

  return (
    <aside className="w-[100px] border-r bg-card/30 flex flex-col items-center py-6 gap-8 z-40 overflow-y-auto no-scrollbar">
      {/* Operation Chips */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center opacity-50 mb-2">Tools</p>
        {TOOL_TYPES.map((tool) => (
          <div
            key={tool.id}
            draggable
            onDragStart={(e) => handleDragStart(e, tool.id)}
            className="group relative flex flex-col items-center justify-center w-16 h-20 rounded-2xl bg-card border border-muted-foreground/10 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing overflow-hidden"
          >
             <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-1", tool.bgColor, tool.color)}>
                <tool.icon size={20} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-tight text-center">{tool.label}</span>
             
             {/* Tooltip on hover */}
             <div className="absolute left-full ml-4 px-3 py-2 bg-black text-white text-[9px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
               {tool.description}
             </div>
          </div>
        ))}
      </div>

      <div className="w-10 h-px bg-muted-foreground/10" />

      {/* File Management */}
      <div className="flex flex-col items-center gap-4 w-full px-2">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest text-center opacity-50 mb-2">Pool</p>
        
        <button 
          onClick={() => document.getElementById('v2-file-upload').click()}
          className="w-16 h-16 rounded-2xl border-2 border-dashed border-muted-foreground/20 flex items-center justify-center text-muted-foreground hover:bg-primary/5 hover:border-primary/50 hover:text-primary transition-all"
          title="Add Files to Pool"
        >
          <FilePlus size={24} />
        </button>
        <input 
          id="v2-file-upload" 
          type="file" 
          multiple 
          accept="application/pdf" 
          className="hidden" 
          onChange={onFileChange}
        />

        <div className="flex flex-col gap-3 w-full max-h-[300px] overflow-y-auto no-scrollbar pt-2">
           {uploadedFiles.map((file) => (
             <div 
              key={file.id} 
              className="group relative flex items-center justify-center w-16 h-16 bg-card border rounded-2xl shrink-0 hover:border-primary/30 transition-all shadow-sm"
              title={file.name}
             >
               <FileText size={20} className="text-primary/40 group-hover:text-primary transition-colors" />
               <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-lg"
                  >
                    <Trash2 size={10} />
                  </button>
               </div>
               <div className="absolute -bottom-1 left-2 right-2 bg-card border border-muted-foreground/10 rounded-full px-1.5 py-0.5 shadow-sm overflow-hidden">
                  <p className="text-[7px] font-black text-center truncate">{file.name}</p>
               </div>
             </div>
           ))}
        </div>
      </div>
      
      <div className="mt-auto">
         <div className="p-3 rounded-2xl bg-muted/20 text-muted-foreground/40" title="Help">
            <Info size={18} />
         </div>
      </div>
    </aside>
  );
};

export default NodeToolbar;
