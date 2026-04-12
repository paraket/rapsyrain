import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Tool Settings - Customize Your myPDF Experience | myPDF',
  description: 'Configure and customize your myPDF experience. Manage theme settings and local preferences.',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/settings',
  },
  openGraph: {
    title: 'Tool Settings - Customize Your myPDF Experience | myPDF',
    description: 'Configure and customize your myPDF experience. Manage theme settings and local preferences.',
    url: 'https://mypdf.qpkendra.com/settings',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'Tool Settings - Customize Your myPDF Experience | myPDF',
    description: 'Configure and customize your myPDF experience. Manage theme settings and local preferences.',
  },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
