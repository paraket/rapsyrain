'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSettings } from '../../context/SettingsContext';
import { useRouter } from 'next/navigation';
import { Workflow, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '../common/Layout';
import { purgeSession } from '../../hooks/useSessionGuard';

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
  const { workflowStudioEnabled } = useSettings();
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  if (!workflowStudioEnabled) {
    return (
      <Layout hideTopAd={true}>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full p-6 md:p-8 rounded-3xl border bg-card/50 backdrop-blur-sm shadow-xl space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Workflow size={32} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">Workflow Studio</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Workflow Studio is currently disabled. You can enable it in the application settings to design custom multi-step PDF pipelines.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-4 rounded-xl border border-border bg-background hover:bg-muted text-sm font-bold transition-all"
              >
                Back to Home
              </button>
              <button
                onClick={() => router.push('/settings')}
                className="flex-1 py-3 px-4 rounded-xl bg-primary text-white hover:bg-primary/95 text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all"
              >
                <SettingsIcon size={16} />
                Open Settings
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <WorkflowTool onBack={handleBack} />
    </Layout>
  );
}
