import React from 'react';
import dynamic from 'next/dynamic';
import Header from './Header';

const Footer = dynamic(() => import('./Footer'), {
  ssr: false,
});
import { useTheme } from '../../context/ThemeContext';
import AdUnit from './AdUnit';


const Layout = ({ children, hideTopAd = false }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col bg-background font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      {!hideTopAd && (
        <div className="container max-w-7xl mx-auto px-4">
          <AdUnit format="horizontal" />
        </div>
      )}
      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
