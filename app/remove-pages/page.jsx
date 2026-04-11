import RemovePagesClient from './RemovePagesClient';

export const metadata = {
  title: 'Remove PDF Pages Online - Securely Delete Pages from PDF | myPDF',
  description: 'Delete pages from your PDF file securely. Select and remove unwanted pages from your document with our no-upload browser-based PDF editor.',
  keywords: 'remove pdf pages, delete pages from pdf, edit pdf, myPDF, no-upload pdf editor',
  alternates: {
    canonical: 'https://mypdf.qpkendra.com/remove-pages',
  },
  openGraph: {
    title: 'Remove PDF Pages Online - Securely Delete Pages from PDF | myPDF',
    description: 'Delete pages from your PDF file securely. Select and remove unwanted pages from your document with our no-upload browser-based PDF editor.',
    url: 'https://mypdf.qpkendra.com/remove-pages',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remove PDF Pages Online - Securely Delete Pages from PDF | myPDF',
    description: 'Delete pages from your PDF file securely. Select and remove unwanted pages from your document with our no-upload browser-based PDF editor.',
  },
};

export default function RemovePagesPage() {
  return <RemovePagesClient />;
}
