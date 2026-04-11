import { useEffect } from 'react';

const SESSION_KEY = 'safepdf_session_start';
const LIMIT_MS = 20 * 60 * 1000; // 20 minutes

/**
 * Perform a "Nuclear Clear" or a "Soft Clear" of stored data for privacy.
 * @param {Object} options - { soft: boolean } 
 * If soft is true, we keep user settings and session meta.
 */
export const purgeSession = ({ soft = false } = {}) => {
  if (soft) {
    console.log('🔄 Privacy Purge (Soft): Clearing files but keeping settings...');
    const keysToKeep = [
      'theme',
      'pdf_show_page_numbers',
      'pdf_optimize_split_preview',
      'pdf_split_preview_count',
      SESSION_KEY
    ];
    
    // Safely remove only what is not in the whitelist
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Session storage is usually transient files anyway, so we clear it entirely
    sessionStorage.clear();
  } else {
    console.log('☢️ Privacy Purge (Total): Nuclear clearing all data...');
    localStorage.clear();
    sessionStorage.clear();
    // Initialize a new session token immediately after clearing
    localStorage.setItem(SESSION_KEY, Date.now().toString());
  }
};

export const useSessionGuard = () => {
  useEffect(() => {
    const checkSession = () => {
      const startTime = localStorage.getItem(SESSION_KEY);
      const now = Date.now();

      if (!startTime) {
        // First launch: initialize session
        localStorage.setItem(SESSION_KEY, now.toString());
        return;
      }

      const elapsed = now - parseInt(startTime, 10);

      if (elapsed > LIMIT_MS) {
        console.log('Absolute 20-minute session limit reached. Purging storage for privacy.');
        
        purgeSession();
        
        // Force reload to clean in-memory state and reset session
        window.location.reload();
      }
    };

    // Run on mount
    checkSession();

    // Background monitor - check every 30 seconds
    const interval = setInterval(checkSession, 30000);

    return () => clearInterval(interval);
  }, []);
};
