import MergeClient from './MergeClient';

export const metadata = {
  title: 'Merge PDF Online - Securely Combine PDF Files | myPDF',
  description: 'Merge multiple PDF files into one easily and for free. Securely combine PDFs in your browser without uploading to any server. 100% private and secure.',
  keywords: 'merge pdf, combine pdf, join pdf, free online pdf merger, myPDF, no-upload pdf merge, love pdf',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/merge',
  },
  openGraph: {
    title: 'Merge PDF Online - Securely Combine PDF Files | myPDF',
    description: 'Merge multiple PDF files into one easily and for free. Securely combine PDFs in your browser without uploading to any server.',
    url: 'https://mypdf.qpkendra.com/merge',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'Merge PDF Online - Securely Combine PDF Files | myPDF',
    description: 'Merge multiple PDF files into one easily and for free. Securely combine PDFs in your browser without uploading to any server.',
  },
};

export default function MergePage() {
  return <MergeClient />;
}
