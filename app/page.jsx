import LandingClient from './LandingClient';

export const metadata = {
  title: 'myPDF - Secure Online PDF Tools | No-Upload PDF Suite',
  description: 'Secure PDF tools that work right in your browser. Merge, Split, and Compress PDFs without uploading files. 100% private and secure.',
  keywords: 'PDF tools, Merge PDF, Split PDF, Compress PDF, Client-side PDF, PDF to Image, Privacy, Private processing, myPDF, QPKendra, love pdf',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  authors: [{ name: 'QPKendra' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'myPDF - Secure Online PDF Tools | No-Upload PDF Suite',
    description: 'Fast, secure, and runs in your browser. No uploads required.',
    url: 'https://mypdf.qpkendra.com',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'myPDF - Secure Online PDF Tools',
    description: 'Fast, secure, and runs entirely in your browser.',
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
