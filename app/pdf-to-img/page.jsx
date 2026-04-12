import PdfToImageClient from './PdfToImageClient';

export const metadata = {
  title: 'PDF to Image Converter - Securely Export PDF Pages as Images | myPDF',
  description: 'Convert PDF pages into high-quality JPG or PNG images. Fast and secure no-upload PDF to image conversion right in your browser. 100% private and secure.',
  keywords: 'pdf to jpg, pdf to png, convert pdf to image, myPDF, no-upload pdf to image, love pdf',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/pdf-to-img',
  },
  openGraph: {
    title: 'PDF to Image Converter - Securely Export PDF Pages as Images | myPDF',
    description: 'Convert PDF pages into high-quality JPG or PNG images. Fast and secure no-upload PDF to image conversion right in your browser.',
    url: 'https://mypdf.qpkendra.com/pdf-to-img',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'PDF to Image Converter - Securely Export PDF Pages as Images | myPDF',
    description: 'Convert PDF pages into high-quality JPG or PNG images. Fast and secure no-upload PDF to image conversion right in your browser.',
  },
};

export default function PdfToImagePage() {
  return <PdfToImageClient />;
}
