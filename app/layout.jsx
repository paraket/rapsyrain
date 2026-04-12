import './globals.css';
import { Providers } from '../components/Providers';
import Script from 'next/script';
import { CONFIG } from '../src/utils/config';



export const metadata = {
  title: 'myPDF Lite - Secure & Private PDF Tools',
  description: 'Secure PDF tools that work entirely in your browser window. Merge, Split, and Compress PDFs with 100% privacy and no file uploads.',
  keywords: 'PDF tools, Merge PDF, Split PDF, Compress PDF, love PDF,pdflove,pdf2go,pdf24,pdf2pdf,pdf2doc,pdf2word,pdf2ppt,pdf2jpg,pdf2png,pdf2jpeg,pdf2html,pdf2txt,pdf2excel,pdf2ppt, PDF to Image, Privacy, Private processing',

  authors: [{ name: 'QPKendra' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        {/* Google Analytics */}
        {CONFIG.GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${CONFIG.GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${CONFIG.GA_ID}');
              `}
            </Script>
          </>
        )}

        {/* Google AdSense */}
        {CONFIG.ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CONFIG.ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="lazyOnload"
          />
        )}


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

        {/* Service Worker Registration */}
        <Script id="sw-registration" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
