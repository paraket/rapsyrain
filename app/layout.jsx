import './globals.css';
import { Providers } from '../components/Providers';

export const metadata = {
  title: 'myPDF Lite - Secure & Private PDF Tools',
  description: 'Secure PDF tools that work entirely in your browser window. Merge, Split, and Compress PDFs with 100% privacy and no file uploads.',
  keywords: 'PDF tools, Merge PDF, Split PDF, Compress PDF, love PDF,pdflove,pdf2go,pdf24,pdf2pdf,pdf2doc,pdf2word,pdf2ppt,pdf2jpg,pdf2png,pdf2jpeg,pdf2html,pdf2txt,pdf2excel,pdf2ppt, PDF to Image, Privacy, Client-side PDF',
  authors: [{ name: 'QPKendra' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              'name': 'myPDF Lite',
              'operatingSystem': 'Any',
              'applicationCategory': 'MultimediaApplication',
              'offers': {
                '@type': 'Offer',
                'price': '0',
                'priceCurrency': 'USD',
              },
              'description': 'Secure PDF tools that work entirely in your browser window. Merge, Split, and Compress PDFs without uploading files.',
              'publisher': {
                '@type': 'Organization',
                'name': 'QPKendra',
              },
            }),
          }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
