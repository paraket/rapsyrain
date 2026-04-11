'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import About from '../../src/components/About';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

export default function AboutClient() {
  const router = useRouter();
  const handleBack = () => { purgeSession({ soft: true }); router.push('/'); };
  return (<Layout><About onBack={handleBack} /></Layout>);
}
