'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Settings from '../../src/components/Settings';
import Layout from '../../src/components/common/Layout';
import { purgeSession } from '../../src/hooks/useSessionGuard';

export default function SettingsClient() {
  const router = useRouter();
  const handleBack = () => { purgeSession({ soft: true }); router.push('/'); };
  return (<Layout><Settings onBack={handleBack} /></Layout>);
}
