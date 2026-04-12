import SafePdfClient from './SafePdfClient';

export const metadata = {
  title: 'PDF Sanitizer - Securely Remove Metadata from PDF | myPDF',
  description: 'Sanitize your PDFs by removing sensitive metadata and private info. Secure your documents before sharing with this no-upload browser-based tool. 100% private and secure.',
  keywords: 'sanitize pdf, remove pdf metadata, hide private data pdf, myPDF, no-upload pdf sanitizer, love pdf',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/safepdf',
  },
  openGraph: {
    title: 'PDF Sanitizer - Securely Remove Metadata from PDF | myPDF',
    description: 'Sanitize your PDFs by removing sensitive metadata and private info. Secure your documents before sharing with this no-upload browser-based tool.',
    url: 'https://mypdf.qpkendra.com/safepdf',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'PDF Sanitizer - Securely Remove Metadata from PDF | myPDF',
    description: 'Sanitize your PDFs by removing sensitive metadata and private info. Secure your documents before sharing with this no-upload browser-based tool.',
  },
};

export default function SafePdfPage() {
  return <SafePdfClient />;
}
