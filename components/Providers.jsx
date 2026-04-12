'use client';

import React from 'react';
import { ThemeProvider } from '../src/context/ThemeContext';
import { SettingsProvider } from '../src/context/SettingsContext';

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

  return (
    <ThemeProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </ThemeProvider>
  );
}
