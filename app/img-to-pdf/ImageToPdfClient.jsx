'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

const ImageToPdfTool = dynamic(() => import('../../src/tools/ImageToPdfTool'), { ssr: false });

export default function ImageToPdfClient() {
  const router = useRouter();

  const handleBack = () => {
    purgeSession({ soft: true });
    router.push('/');
  };

  return (
    <Layout>
      <ImageToPdfTool onBack={handleBack} />
    </Layout>
  );
}
