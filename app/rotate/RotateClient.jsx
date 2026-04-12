'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

import ToolSkeleton from '../../src/components/common/ToolSkeleton';

const RotateTool = dynamic(() => import('../../src/tools/RotateTool'), { 
  ssr: false,
  loading: () => <ToolSkeleton title="Rotate PDF" />
});

export default function RotateClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <RotateTool onBack={handleBack} />
    </Layout>
  );
}
