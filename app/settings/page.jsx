import SettingsClient from './SettingsClient';

export const metadata = {
  title: 'Tool Settings - Customize Your myPDF Experience | myPDF',
  description: 'Configure and customize your myPDF experience. Manage theme settings and local preferences.',
  alternates: {
    canonical: 'https://myPDF.qpkendra.com/settings',
  },
};

export default function SettingsPage() {
  return <SettingsClient />;
}
