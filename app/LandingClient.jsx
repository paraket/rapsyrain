'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ToolCard from '../src/components/ToolCard';
import Layout from '../src/components/common/Layout';
import { purgeSession } from '../src/hooks/useSessionGuard';


import {
  Merge as MergeIcon,
  Zap,
  RotateCw,
  Scissors,
  FileImage,
  FileType,
  FileText,
  Trash2,
  ShieldCheck,
  Layers
} from 'lucide-react';

const tools = [
  {
    id: 'merge',
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one single document in seconds.',
    icon: MergeIcon,
    color: 'bg-blue-600'
  },
  {
    id: 'split',
    title: 'Split PDF',
    description: 'Separate one PDF into multiple files or extract specific pages.',
    icon: Scissors,
    color: 'bg-orange-500'
  },
  {
    id: 'compress',
    title: 'Compress PDF',
    description: 'Reduce the file size of your PDF while maintaining quality.',
    icon: Zap,
    color: 'bg-red-500'
  },
  {
    id: 'pdf-to-img',
    title: 'PDF to Image',
    description: 'Convert each PDF page into a high-quality JPG or PNG image.',
    icon: FileImage,
    color: 'bg-emerald-500'
  },
  {
    id: 'pdf-to-text',
    title: 'PDF to Text',
    description: 'Extract text content from your PDF to a plain text file.',
    icon: FileType,
    color: 'bg-purple-600'
  },
  {
    id: 'img-to-pdf',
    title: 'Image to PDF',
    description: 'Convert images (JPG, PNG) into a professional PDF document.',
    icon: FileType,
    color: 'bg-indigo-600'
  },
  {
    id: 'rotate',
    title: 'Rotate PDF',
    description: 'Rotate your PDF pages to the correct orientation easily.',
    icon: RotateCw,
    color: 'bg-indigo-500'
  },
  {
    id: 'reorder',
    title: 'Reorder Pages',
    description: 'Quickly rearrange your PDF document by dragging pages to their new positions.',
    icon: Layers,
    color: 'bg-indigo-600'
  },
  {
    id: 'remove-pages',
    title: 'Remove Pages',
    description: 'Delete unwanted pages from your PDF document with one click.',
    icon: Trash2,
    color: 'bg-rose-500'
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF documents to editable Microsoft Word files.',
    icon: FileText,
    color: 'bg-blue-600'
  },
  {
    id: 'safepdf',
    title: 'myPDF (Sanitizer)',
    description: 'Remove scripts and active content.',
    icon: ShieldCheck,
    color: 'bg-emerald-600'
  },
];

export default function LandingClient() {
  const router = useRouter();

  return (
    <Layout hideTopAd={true}>
      <motion.div
        key="landing"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-transparent text-center">
          <div className="container max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-2 text-foreground">
              Secure & Private <br />
              <span className="text-primary">PDF Tools</span>
            </h1>
            <p className="text-sm font-bold text-primary tracking-widest uppercase mb-6">
              By QPKendra
            </p>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Fast, secure, and runs entirely in your browser. Your files never leave your window and are wiped clean as soon as you close it.
            </p>
          </div>
        </section>

        <section id="tools" className="py-4 md:py-8 px-3 md:px-3 container max-w-7xl mx-auto">


          <h2 className="text-2xl md:text-3xl font-black mb-8 md:mb-12 text-center md:text-left">
            Choose a <span className="text-primary italic">PDF Utility</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 text-left">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                {...tool}
                onClick={() => router.push(`/${tool.id}`)}
              />
            ))}
          </div>
        </section>
      </motion.div>
    </Layout>
  );
}
