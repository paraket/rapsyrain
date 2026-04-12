'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

import ToolSkeleton from '../../src/components/common/ToolSkeleton';

const PdfToWordTool = dynamic(() => import('../../src/tools/PdfToWordTool'), { 
  ssr: false,
  loading: () => <ToolSkeleton title="PDF to Word" />
});

export default function PdfToWordClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <PdfToWordTool onBack={handleBack} />
    </Layout>
  );
}
