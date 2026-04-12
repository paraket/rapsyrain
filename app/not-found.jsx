'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileQuestion, Home, ArrowLeft, ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import Layout from '../src/components/common/Layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="relative mb-8"
        >
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
          <div className="relative bg-card border-2 border-primary/20 p-8 rounded-[3rem] shadow-2xl">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <FileQuestion size={80} className="text-primary" />
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="absolute -top-4 -right-4 bg-orange-500 text-white text-xs font-black px-4 py-2 rounded-full shadow-lg border-2 border-background"
          >
            404 ERROR
          </motion.div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-4xl md:text-5xl font-black tracking-tight mb-4"
        >
          Page <span className="text-primary">Out of Bounds</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-muted-foreground text-lg max-w-md mb-10 leading-relaxed font-medium"
        >
          The resource you are looking for has been moved or doesn't exist in our secure sandbox.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 w-full max-w-sm"
        >
          <Link 
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30 text-sm"
          >
            <Home size={18} />
            Back to Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="flex-1 flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-6 py-3 rounded-xl font-bold transition-all text-sm"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2 }}
          className="mt-16 flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-primary" />
            <span>Secure</span>
          </div>
          <div className="w-8 h-[2px] bg-muted-foreground/30" />
          <div className="flex items-center gap-1.5">
            <Lock size={14} className="text-primary" />
            <span>Private</span>
          </div>
          <div className="w-8 h-[2px] bg-muted-foreground/30" />
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-primary" />
            <span>Verified</span>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
