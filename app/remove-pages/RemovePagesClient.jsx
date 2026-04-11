'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

const RemovePagesTool = dynamic(() => import('../../src/tools/RemovePagesTool'), { ssr: false });

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
