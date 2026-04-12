import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { useTheme } from '../../context/ThemeContext';
import AdUnit from './AdUnit';


const Layout = ({ children }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-screen flex flex-col bg-background font-sans transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <Header />
      <div className="container max-w-7xl mx-auto px-4">
        <AdUnit format="horizontal" />
      </div>
      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
