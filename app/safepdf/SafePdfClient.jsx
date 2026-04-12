'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

import ToolSkeleton from '../../src/components/common/ToolSkeleton';

const SafePdfTool = dynamic(() => import('../../src/tools/SafePdfTool'), { 
  ssr: false,
  loading: () => <ToolSkeleton title="Sanitize PDF" />
});

export default function SafePdfClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <SafePdfTool onBack={handleBack} />
    </Layout>
  );
}
