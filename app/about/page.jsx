import AboutClient from './AboutClient';

export const metadata = {
  title: 'About myPDF - Privacy-First PDF Utility Suite | myPDF',
  description: 'Learn more about myPDF, the 100% private PDF utility suite. Our mission is to provide powerful PDF tools without compromising your privacy by processing everything on your device.',
  metadataBase: new URL('https://mypdf.qpkendra.com'),
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About myPDF - Privacy-First PDF Utility Suite | myPDF',
    description: 'Learn more about myPDF, the 100% private PDF utility suite. Everything is processed locally on your device.',
    url: 'https://mypdf.qpkendra.com/about',
    siteName: 'myPDF',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@qpkendra_',
    creator: '@qpkendra_',
    title: 'About myPDF - Privacy-First PDF Utility Suite | myPDF',
    description: 'Learn more about myPDF, the 100% private PDF utility suite.',
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
