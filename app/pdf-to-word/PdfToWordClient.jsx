'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

const PdfToWordTool = dynamic(() => import('../../src/tools/PdfToWordTool'), { ssr: false });

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
