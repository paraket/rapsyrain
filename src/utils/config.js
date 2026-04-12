/**
 * myPDF Lite - Central Configuration
 * Handles environment detection and production fallbacks for GA/AdSense.
 */

const isProd = process.env.NODE_ENV === 'production';

export const CONFIG = {
  // Google Analytics ID
  GA_ID: process.env.NEXT_PUBLIC_GA_ID || (isProd ? 'G-FRNZ891ZRH' : null),
  
  // AdSense Publisher ID
  ADSENSE_ID: process.env.NEXT_PUBLIC_ADSENSE_ID || (isProd ? 'ca-pub-2147271038808510' : null),
  
  // Default AdSense Slot ID
  ADSENSE_SLOT_ID: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ID || (isProd ? '9788893186' : null),
  
  // Environment identifier
  IS_PROD: isProd
};

export default CONFIG;
