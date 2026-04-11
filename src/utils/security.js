/**
 * Security Utilities
 * Centralized functions for XSS prevention and input sanitization.
 */

/**
 * Escapes HTML characters to prevent Cross-Site Scripting (XSS)
 * when rendering dynamic text inside HTML templates.
 * 
 * @param {string} unsafe - The raw string to escape.
 * @returns {string} The HTML-escaped string.
 */
export const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Sanitizes filenames to prevent path traversal and remove illegal characters.
 * 
 * @param {string} filename - The original filename.
 * @param {string} fallback - A fallback name if the original is empty after sanitization.
 * @returns {string} The sanitized filename.
 */
export const sanitizeFilename = (filename, fallback = 'document') => {
  if (typeof filename !== 'string') return fallback;
  
  // Remove path traversal and illegal filesystem characters
  const sanitized = filename
    .replace(/[\/\?<>\\:\*\|":\x00-\x1F\x80-\x9F]/g, "") // Illegal characters and null bytes
    .replace(/^\.+/, "") // Path traversal at start
    .trim();
    
  return sanitized || fallback;
};

/**
 * Generates a unique ID securely, falling back to a robust pseudo-random 
 * generator if crypto.randomUUID is not available (e.g., in non-HTTPS environments).
 * 
 * @returns {string} A unique ID.
 */
export const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // High-entropy fallback for non-secure contexts
  return (
    Date.now().toString(36) + '-' + 
    Math.random().toString(36).substring(2, 10) + '-' + 
    Math.random().toString(36).substring(2, 10)
  );
};
