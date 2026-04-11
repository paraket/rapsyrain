import RotateClient from './RotateClient';

export const metadata = {
  title: 'Rotate PDF Online - Securely Rotate PDF Pages | myPDF',
  description: 'Rotate your PDF files permanently for free. Securely rotate individual pages or the entire document right in your browser. No uploads required.',
  keywords: 'rotate pdf, spin pdf, turn pdf, permanent pdf rotation, myPDF, no-upload pdf rotate',
  alternates: {
    canonical: 'https://mypdf.qpkendra.com/rotate',
  },
  openGraph: {
    title: 'Rotate PDF Online - Securely Rotate PDF Pages | myPDF',
    description: 'Rotate your PDF files permanently for free. Securely rotate individual pages or the entire document right in your browser. No uploads required.',
    url: 'https://mypdf.qpkendra.com/rotate',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rotate PDF Online - Securely Rotate PDF Pages | myPDF',
    description: 'Rotate your PDF files permanently for free. Securely rotate individual pages or the entire document right in your browser. No uploads required.',
  },
};

export default function RotatePage() {
  return <RotateClient />;
}
