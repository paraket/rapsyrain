import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [showPageNumbers, setShowPageNumbers] = useState(false);
  const [optimizeSplitPreview, setOptimizeSplitPreview] = useState(true);
  const [splitPreviewCount, setSplitPreviewCount] = useState(1);
  const [maxPageCap, setMaxPageCap] = useState(1000);
  const [progressiveLoading, setProgressiveLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState('221.2 83.2% 53.3%'); // Default Royal Blue
  const [workflowStudioEnabled, setWorkflowStudioEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [previewCache, setPreviewCache] = useState({});

  const THEME_COLORS = [
    { name: 'Royal Blue', value: '221.2 83.2% 53.3%' },
    { name: 'Emerald Green', value: '160 84% 39%' },
    { name: 'Electric Purple', value: '271 91% 65%' },
    { name: 'Rose Delight', value: '346 87% 62%' },
    { name: 'Sunset Orange', value: '24 94% 53%' },
    { name: 'Celestial Indigo', value: '239 84% 67%' },
    { name: 'Caribbean Teal', value: '189 94% 43%' },
  ];

  const addToCache = (key, data) => {
    setPreviewCache(prev => ({ ...prev, [key]: data }));
  };

  const getFromCache = (key) => {
    return previewCache[key] || null;
  };

  const clearPreviewCache = () => {
    setPreviewCache({});
  };

  // Apply theme color globally
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', primaryColor);
    root.style.setProperty('--ring', primaryColor);
    if (mounted) localStorage.setItem('pdf_primary_color', primaryColor);
  }, [primaryColor, mounted]);

  useEffect(() => {
    const savedPN = localStorage.getItem('pdf_show_page_numbers');
    if (savedPN !== null) setShowPageNumbers(savedPN === 'true');

    const savedOSP = localStorage.getItem('pdf_optimize_split_preview');
    if (savedOSP !== null) setOptimizeSplitPreview(savedOSP === 'true');

    const savedSPC = localStorage.getItem('pdf_split_preview_count');
    if (savedSPC !== null) setSplitPreviewCount(parseInt(savedSPC));

    const savedMPC = localStorage.getItem('pdf_max_page_cap');
    if (savedMPC !== null) setMaxPageCap(parseInt(savedMPC));

    const savedPL = localStorage.getItem('pdf_progressive_loading');
    if (savedPL !== null) setProgressiveLoading(savedPL === 'true');

    const savedColor = localStorage.getItem('pdf_primary_color');
    if (savedColor !== null) setPrimaryColor(savedColor);

    const savedWSE = localStorage.getItem('pdf_workflow_studio_enabled');
    if (savedWSE !== null) setWorkflowStudioEnabled(savedWSE === 'true');

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

  useEffect(() => {
    if (mounted) localStorage.setItem('pdf_max_page_cap', maxPageCap);
  }, [maxPageCap, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem('pdf_progressive_loading', progressiveLoading);
  }, [progressiveLoading, mounted]);

  useEffect(() => {
    if (mounted) localStorage.setItem('pdf_workflow_studio_enabled', workflowStudioEnabled);
  }, [workflowStudioEnabled, mounted]);

  return (
    <SettingsContext.Provider value={{
      showPageNumbers,
      setShowPageNumbers,
      optimizeSplitPreview,
      setOptimizeSplitPreview,
      splitPreviewCount,
      setSplitPreviewCount,
      maxPageCap,
      setMaxPageCap,
      progressiveLoading,
      setProgressiveLoading,
      primaryColor,
      setPrimaryColor,
      workflowStudioEnabled,
      setWorkflowStudioEnabled,
      previewCache,
      addToCache,
      getFromCache,
      clearPreviewCache,
      THEME_COLORS
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
