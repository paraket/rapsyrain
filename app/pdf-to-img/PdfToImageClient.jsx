'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

import ToolSkeleton from '../../src/components/common/ToolSkeleton';

const PdfToImageTool = dynamic(() => import('../../src/tools/PdfToImageTool'), { 
  ssr: false,
  loading: () => <ToolSkeleton title="PDF to Image" />
});

export default function PdfToImageClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <PdfToImageTool onBack={handleBack} />
    </Layout>
  );
}
