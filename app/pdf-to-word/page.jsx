import PdfToWordClient from './PdfToWordClient';

export const metadata = {
  title: 'PDF to Word Converter - Securely Convert PDF to DOCX | myPDF',
  description: 'Convert your PDF documents to editable Word files. Accurate and private no-upload PDF to DOCX conversion processed entirely in your browser.',
  keywords: 'pdf to word, pdf to docx, convert pdf to word, myPDF, no-upload pdf to word',
  alternates: {
    canonical: 'https://mypdf.qpkendra.com/pdf-to-word',
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
    title: 'PDF to Word Converter - Securely Convert PDF to DOCX | myPDF',
    description: 'Convert your PDF documents to editable Word files. Accurate and private no-upload PDF to DOCX conversion processed entirely in your browser.',
  },
};

export default function PdfToWordPage() {
  return <PdfToWordClient />;
}
