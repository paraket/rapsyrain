import PrivacyClient from './PrivacyClient';

export const metadata = {
  title: 'Privacy Policy - Your Files Never Leave Your Window | myPDF',
  description: 'Read our privacy policy. myPDF is built as a secure browser-based tool. We never see, store, or upload your sensitive documents.',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy - Your Files Never Leave Your Window | myPDF',
    description: 'Read our privacy policy. myPDF is built as a secure browser-based tool.',
    url: 'https://mypdf.qpkendra.com/privacy',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'Privacy Policy - Your Files Never Leave Your Window | myPDF',
    description: 'Read our privacy policy. myPDF is built as a secure browser-based tool.',
  },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}
