import ReorderClient from './ReorderClient';

export const metadata = {
  title: 'Reorder PDF Pages Online - Organize PDF Layout | myPDF',
  description: 'Easily rearrange and sort PDF pages with our secure, browser-based organizing tool. Simply drag and drop pages into your desired order. 100% private.',
  keywords: 'reorder pdf, sort pdf pages, organize pdf, rearrange pdf, move pdf pages, myPDF organize',
  alternates: {
    canonical: 'https://mypdf.qpkendra.com/reorder',
  },
  openGraph: {
    title: 'Reorder PDF Pages Online - Organize PDF Layout | myPDF',
    description: 'Easily rearrange and sort PDF pages with our secure, browser-based organizing tool. Simply drag and drop pages into your desired order. 100% private.',
    url: 'https://mypdf.qpkendra.com/reorder',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reorder PDF Pages Online - Organize PDF Layout | myPDF',
    description: 'Easily rearrange and sort PDF pages with our secure, browser-based organizing tool. Simply drag and drop pages into your desired order. 100% private.',
  },
};

export default function ReorderPage() {
  return <ReorderClient />;
}
