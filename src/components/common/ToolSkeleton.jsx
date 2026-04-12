import React from 'react';
import Skeleton from './Skeleton';
import { Layers } from 'lucide-react';

const ToolSkeleton = ({ title = "Processing PDF" }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Fake Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b">
        <div className="flex items-center gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">{title}</h1>
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-24 rounded-xl" />
      </div>

      <div className="space-y-8">
        <div className="max-w-2xl mx-auto w-full space-y-6">
           {/* Fake Guide */}
           <div className="space-y-3">
             <Skeleton className="h-3 w-full" />
             <Skeleton className="h-3 w-5/6" />
             <Skeleton className="h-3 w-4/6" />
           </div>

           {/* Fake Upload Area */}
           <div className="h-64 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center p-8 bg-muted/20">
             <Skeleton className="w-full h-full rounded-[2rem]" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default ToolSkeleton;
