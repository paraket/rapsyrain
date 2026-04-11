'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Privacy from '../../src/components/Privacy';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

export default function PrivacyClient() {
  const router = useRouter();
  const handleBack = () => { purgeSession({ soft: true }); router.push('/'); };
  return (<Layout><Privacy onBack={handleBack} /></Layout>);
}
