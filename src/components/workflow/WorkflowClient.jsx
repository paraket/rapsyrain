'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const WorkflowTool = dynamic(() => import('../../tools/WorkflowTool'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 rounded-3xl border-4 border-muted border-t-primary animate-spin mb-4" />
      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest animate-pulse">
        Initializing Studio...
      </p>
    </div>
  )
});

export default function WorkflowClient() {
  return <WorkflowTool />;
}
