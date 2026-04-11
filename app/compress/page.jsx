import CompressClient from './CompressClient';

export const metadata = {
  title: 'Compress PDF Online - Securely Reduce PDF File Size | myPDF',
  description: 'Reduce the file size of your PDFs while maintaining quality. Fast, secure, and no-upload PDF compressor that works entirely in your browser.',
  keywords: 'compress pdf, reduce pdf size, shrink pdf, small pdf, myPDF, no-upload pdf compress',
  alternates: {
    canonical: 'https://mypdf.qpkendra.com/compress',
  },
  openGraph: {
    title: 'Compress PDF Online - Securely Reduce PDF File Size | myPDF',
    description: 'Reduce the file size of your PDFs while maintaining quality. Fast, secure, and no-upload PDF compressor that works entirely in your browser.',
    url: 'https://mypdf.qpkendra.com/compress',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compress PDF Online - Securely Reduce PDF File Size | myPDF',
    description: 'Reduce the file size of your PDFs while maintaining quality. Fast, secure, and no-upload PDF compressor that works entirely in your browser.',
  },
};

export default function CompressPage() {
  return <CompressClient />;
}
