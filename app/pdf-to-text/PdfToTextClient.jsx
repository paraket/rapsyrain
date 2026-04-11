'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

const PdfToTextTool = dynamic(() => import('../../src/tools/PdfToTextTool'), { ssr: false });

export default function PdfToTextClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <PdfToTextTool onBack={handleBack} />
    </Layout>
  );
}
