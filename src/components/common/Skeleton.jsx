import React from 'react';
import { cn } from '../../utils/cn';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent", className)}
      {...props}
    />
  );
};

export default Skeleton;

export const ToolGridSkeleton = ({ progress = 0 }) => (
  <div className="flex flex-col items-center justify-center py-4 gap-4">
    <div className="flex flex-col p-1 rounded-2xl border bg-card/50 aspect-[3/4] w-full max-w-[200px] animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="relative flex-grow rounded-xl overflow-hidden bg-muted/20">
         <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
         <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-black text-primary/40 tracking-tighter animate-pulse">{progress}%</span>
         </div>
      </div>
      <div className="h-8 flex items-center justify-between px-2 gap-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-16" />
      </div>
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
      Scanning Document... {progress}%
    </p>
  </div>
);
