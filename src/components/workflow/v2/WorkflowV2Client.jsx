'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const WorkflowToolV2 = dynamic(() => import('../../../tools/WorkflowToolV2'), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 rounded-3xl border-4 border-muted border-t-violet-500 animate-spin mb-4" />
      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest animate-pulse">
        Initializing Designer...
      </p>
    </div>
  )
});

export default function WorkflowV2Client() {
  return <WorkflowToolV2 />;
}
