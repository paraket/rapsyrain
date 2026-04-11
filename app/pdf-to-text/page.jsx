import PdfToTextClient from './PdfToTextClient';

export const metadata = {
  title: 'PDF to Text Converter - Securely Extract Text from PDF | myPDF',
  description: 'Extract raw text from your PDF files smoothly. Fast and reliable no-upload PDF to text conversion that runs entirely in your browser.',
  keywords: 'pdf to text, extract text from pdf, pdf to txt, myPDF, no-upload pdf to text',
  alternates: {
    canonical: 'https://mypdf.qpkendra.com/pdf-to-text',
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
    title: 'PDF to Text Converter - Securely Extract Text from PDF | myPDF',
    description: 'Extract raw text from your PDF files smoothly. Fast and reliable no-upload PDF to text conversion that runs entirely in your browser.',
  },
};

export default function PdfToTextPage() {
  return <PdfToTextClient />;
}
