'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

const SplitTool = dynamic(() => import('../../src/tools/SplitTool'), { ssr: false });

export default function SplitClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <SplitTool onBack={handleBack} />
    </Layout>
  );
}
