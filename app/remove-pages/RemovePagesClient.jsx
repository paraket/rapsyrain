'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

import ToolSkeleton from '../../src/components/common/ToolSkeleton';

const RemovePagesTool = dynamic(() => import('../../src/tools/RemovePagesTool'), { 
  ssr: false,
  loading: () => <ToolSkeleton title="Remove Pages" />
});

export default function RemovePagesClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <RemovePagesTool onBack={handleBack} />
    </Layout>
  );
}
