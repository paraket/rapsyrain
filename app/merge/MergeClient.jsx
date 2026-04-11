'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

const MergeTool = dynamic(() => import('../../src/tools/MergeTool'), { ssr: false });

export default function MergeClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <MergeTool onBack={handleBack} />
    </Layout>
  );
}
