import ReorderClient from './ReorderClient';

export const metadata = {
  title: 'Reorder PDF Pages Online - Organize PDF Layout | myPDF',
  description: 'Easily rearrange and sort PDF pages with our secure, browser-based organizing tool. Simply drag and drop pages into your desired order. 100% private and secure.',
  keywords: 'reorder pdf, sort pdf pages, organize pdf, rearrange pdf, move pdf pages, myPDF organize, love pdf',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/reorder',
  },
  openGraph: {
    title: 'Reorder PDF Pages Online - Organize PDF Layout | myPDF',
    description: 'Easily rearrange and sort PDF pages with our secure, browser-based organizing tool. Simply drag and drop pages into your desired order.',
    url: 'https://mypdf.qpkendra.com/reorder',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'Reorder PDF Pages Online - Organize PDF Layout | myPDF',
    description: 'Easily rearrange and sort PDF pages with our secure, browser-based organizing tool. Simply drag and drop pages into your desired order.',
  },
};

export default function ReorderPage() {
  return <ReorderClient />;
}
