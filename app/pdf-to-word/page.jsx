import PdfToWordClient from './PdfToWordClient';

export const metadata = {
  title: 'PDF to Word Converter - Securely Convert PDF to DOCX | myPDF',
  description: 'Convert your PDF documents to editable Word files. Accurate and private no-upload PDF to DOCX conversion processed entirely in your browser. 100% private and secure.',
  keywords: 'pdf to word, pdf to docx, convert pdf to word, myPDF, no-upload pdf to word, love pdf',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/pdf-to-word',
  },
  openGraph: {
    title: 'PDF to Word Converter - Securely Convert PDF to DOCX | myPDF',
    description: 'Convert your PDF documents to editable Word files. Accurate and private no-upload PDF to DOCX conversion processed entirely in your browser.',
    url: 'https://mypdf.qpkendra.com/pdf-to-word',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'PDF to Word Converter - Securely Convert PDF to DOCX | myPDF',
    description: 'Convert your PDF documents to editable Word files. Accurate and private no-upload PDF to DOCX conversion processed entirely in your browser.',
  },
};

export default function PdfToWordPage() {
  return <PdfToWordClient />;
}
