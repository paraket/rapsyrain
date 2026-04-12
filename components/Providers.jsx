'use client';

import React, { useEffect } from 'react';
import { ThemeProvider } from '../src/context/ThemeContext';
import { SettingsProvider } from '../src/context/SettingsContext';
import { prefetchAssets } from '../src/utils/browser-cache';

if (typeof window !== 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    // Silence all logs in production for a clean experience
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  } else {
    // In development: Suppress ONLY the noisy PDF.js worker warning
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (
        args[0] && 
        typeof args[0] === 'string' && 
        args[0].includes('TT: undefined function: 32')
      ) {
        return;
      }
      originalWarn(...args);
    };
  }
}


export function Providers({ children }) {
  useEffect(() => {
    // Warm up the cache for heavy assets globally after the page is interactive.
    // This runs regardless of which sitemap page the user hits first.
    const warmUp = async () => {
      // Small delay to ensure initial hydration is smooth
      await new Promise(resolve => setTimeout(resolve, 2000));
      prefetchAssets(['/pdf.worker.min.mjs']);
    };
    
    if (typeof window !== 'undefined') {
      warmUp();
    }
  }, []);

  return (
    <ThemeProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </ThemeProvider>
  );
}
