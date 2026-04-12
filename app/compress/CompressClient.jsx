'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

import ToolSkeleton from '../../src/components/common/ToolSkeleton';

const CompressTool = dynamic(() => import('../../src/tools/CompressTool'), { 
  ssr: false,
  loading: () => <ToolSkeleton title="Compress PDF" />
});

export default function CompressClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <CompressTool onBack={handleBack} />
    </Layout>
  );
}
