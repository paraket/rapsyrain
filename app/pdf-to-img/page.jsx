import PdfToImageClient from './PdfToImageClient';

export const metadata = {
  title: 'PDF to Image Converter - Securely Export PDF Pages as Images | myPDF',
  description: 'Convert PDF pages into high-quality JPG or PNG images. Fast and secure no-upload PDF to image conversion right in your browser.',
  keywords: 'pdf to jpg, pdf to png, convert pdf to image, myPDF, no-upload pdf to image',
  alternates: {
    canonical: 'https://mypdf.qpkendra.com/pdf-to-img',
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
    title: 'PDF to Image Converter - Securely Export PDF Pages as Images | myPDF',
    description: 'Convert PDF pages into high-quality JPG or PNG images. Fast and secure no-upload PDF to image conversion right in your browser.',
  },
};

export default function PdfToImagePage() {
  return <PdfToImageClient />;
}
