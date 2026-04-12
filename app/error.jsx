'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Layout from '../src/components/common/Layout';
import Link from 'next/link';
import { purgeSession } from '../src/hooks/useSessionGuard';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an analytics service or console
    console.error('Application Crash:', error);
  }, [error]);

  const handleHardReset = () => {
    purgeSession({ soft: false });
    window.location.href = '/';
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <motion.div
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           className="bg-destructive/10 p-6 rounded-full mb-8"
        >
          <AlertTriangle size={64} className="text-destructive" />
        </motion.div>

        <motion.h1 
          className="text-3xl font-black mb-4 pr-1"
        >
          Something Went <span className="text-destructive uppercase">Wrong</span>
        </motion.h1>

        <p className="text-muted-foreground max-w-sm mb-12 font-medium">
          A client-side error occurred in the toolkit. Your document is safe, but we need to restart the engine.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
          >
            <RotateCcw size={20} />
            Try Again
          </button>
          <button
            onClick={handleHardReset}
            className="flex-1 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-8 py-4 rounded-2xl font-bold transition-all"
          >
            <Home size={20} />
            Clear & Home
          </button>
        </div>

        <div className="mt-12 p-4 bg-muted/30 rounded-2xl border max-w-lg overflow-hidden">
           <p className="text-[10px] font-mono text-muted-foreground text-left break-all opacity-50">
             {error?.message || 'Unknown Runtime Error'}
           </p>
        </div>
      </div>
    </Layout>
  );
}
