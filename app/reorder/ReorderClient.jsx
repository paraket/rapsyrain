'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

import ToolSkeleton from '../../src/components/common/ToolSkeleton';

const ReorderPagesTool = dynamic(() => import('../../src/tools/ReorderPagesTool'), { 
  ssr: false,
  loading: () => <ToolSkeleton title="Reorder Pages" />
});

export default function ReorderClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <ReorderPagesTool onBack={handleBack} />
    </Layout>
  );
}
