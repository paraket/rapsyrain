import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [optimizeSplitPreview, setOptimizeSplitPreview] = useState(false);
  const [splitPreviewCount, setSplitPreviewCount] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedPN = localStorage.getItem('pdf_show_page_numbers');
    if (savedPN !== null) setShowPageNumbers(savedPN === 'true');

    const savedOSP = localStorage.getItem('pdf_optimize_split_preview');
    if (savedOSP !== null) setOptimizeSplitPreview(savedOSP === 'true');

    const savedSPC = localStorage.getItem('pdf_split_preview_count');
    if (savedSPC !== null) setSplitPreviewCount(parseInt(savedSPC));
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem('pdf_show_page_numbers', showPageNumbers);
  }, [showPageNumbers, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem('pdf_optimize_split_preview', optimizeSplitPreview);
  }, [optimizeSplitPreview, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem('pdf_split_preview_count', splitPreviewCount);
  }, [splitPreviewCount, mounted]);

  return (
    <SettingsContext.Provider value={{ 
      showPageNumbers, 
      setShowPageNumbers,
      optimizeSplitPreview,
      setOptimizeSplitPreview,
      splitPreviewCount,
      setSplitPreviewCount
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
