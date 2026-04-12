import PdfToTextClient from './PdfToTextClient';

export const metadata = {
  title: 'PDF to Text Converter - Securely Extract Text from PDF | myPDF',
  description: 'Extract raw text from your PDF files smoothly. Fast and reliable no-upload PDF to text conversion that runs entirely in your browser. 100% private and secure.',
  keywords: 'pdf to text, extract text from pdf, pdf to txt, myPDF, no-upload pdf to text, love pdf',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/pdf-to-text',
  },
  openGraph: {
    title: 'PDF to Text Converter - Securely Extract Text from PDF | myPDF',
    description: 'Extract raw text from your PDF files smoothly. Fast and reliable no-upload PDF to text conversion that runs entirely in your browser.',
    url: 'https://mypdf.qpkendra.com/pdf-to-text',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'PDF to Text Converter - Securely Extract Text from PDF | myPDF',
    description: 'Extract raw text from your PDF files smoothly. Fast and reliable no-upload PDF to text conversion that runs entirely in your browser.',
  },
};

export default function PdfToTextPage() {
  return <PdfToTextClient />;
}
