import ImageToPdfClient from './ImageToPdfClient';

export const metadata = {
  title: 'Image to PDF Converter - Securely Create PDF from Images | myPDF',
  description: 'Convert JPG, PNG, and other images to PDF files easily. Create a PDF from your images securely in your browser with no uploads required. 100% private and secure.',
  keywords: 'jpg to pdf, png to pdf, convert image to pdf, myPDF, no-upload image to pdf, love pdf',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/img-to-pdf',
  },
  openGraph: {
    title: 'Image to PDF Converter - Securely Create PDF from Images | myPDF',
    description: 'Convert JPG, PNG, and other images to PDF files easily. Create a PDF from your images securely in your browser with no uploads required.',
    url: 'https://mypdf.qpkendra.com/img-to-pdf',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'Image to PDF Converter - Securely Create PDF from Images | myPDF',
    description: 'Convert JPG, PNG, and other images to PDF files easily. Create a PDF from your images securely in your browser with no uploads required.',
  },
};

export default function ImageToPdfPage() {
  return <ImageToPdfClient />;
}
