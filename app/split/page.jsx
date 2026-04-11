import SplitClient from './SplitClient';

export const metadata = {
  title: 'Split PDF Online - Securely Extract Pages from PDF | myPDF',
  description: 'Split a PDF file into separate pages or extract specific page ranges securely. No-upload PDF splitter that works entirely in your browser.',
  keywords: 'split pdf, extract pdf pages, cut pdf, separate pdf pages, myPDF, no-upload pdf split',
  alternates: {
    canonical: 'https://mypdf.qpkendra.com/split',
  },
  openGraph: {
    title: 'Split PDF Online - Securely Extract Pages from PDF | myPDF',
    description: 'Split a PDF file into separate pages or extract specific page ranges securely. No-upload PDF splitter that works entirely in your browser.',
    url: 'https://mypdf.qpkendra.com/split',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Split PDF Online - Securely Extract Pages from PDF | myPDF',
    description: 'Split a PDF file into separate pages or extract specific page ranges securely. No-upload PDF splitter that works entirely in your browser.',
  },
};

export default function SplitPage() {
  return <SplitClient />;
}
