import RemovePagesClient from './RemovePagesClient';

export const metadata = {
  title: 'Remove PDF Pages Online - Securely Delete Pages from PDF | myPDF',
  description: 'Delete pages from your PDF file securely. Select and remove unwanted pages from your document with our no-upload browser-based PDF editor. 100% private and secure.',
  keywords: 'remove pdf pages, delete pages from pdf, edit pdf, myPDF, no-upload pdf editor, love pdf',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/remove-pages',
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
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'Remove PDF Pages Online - Securely Delete Pages from PDF | myPDF',
    description: 'Delete pages from your PDF file securely. Select and remove unwanted pages from your document with our no-upload browser-based PDF editor.',
  },
};

export default function RemovePagesPage() {
  return <RemovePagesClient />;
}
