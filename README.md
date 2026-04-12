# 🛡️ myPDF Lite: The Master Manual

Welcome to the **Master Project Manual** for **myPDF Lite**. This document serves as the absolute "Source of Truth" for the application. Any developer or AI agent working on this codebase **MUST** read this manual in its entirety before making any modifications.

---

## 1. Executive Summary
**myPDF Lite** is a premium, privacy-first, client-side PDF utility suite. 

- **Vision**: To provide enterprise-grade PDF manipulation (Merge, Split, Compress, Convert) without ever compromising user privacy.
- **Privacy Promise (Zero-Trace)**: Files **NEVER** leave the user's browser. There are no backend APIs handling file data. All processing happens locally via WebAssembly and JavaScript engines.
- **Tech Stack**:
  - **Framework**: Next.js (App Router)
  - **Styling**: Tailwind CSS + Glassmorphism
  - **Animations**: Framer Motion
  - **PDF Engines**: `pdf-lib` (Manipulation) and `pdfjs-dist` (Rendering/Text Extraction)
  - **Icons**: Lucide React

---

## 2. Security Blueprint: The "Safe" in myPDF
Security is not an afterthought; it is built into the utility layer.

### 🛠️ `src/utils/security.js`
This file is the central nervous system for security. **MANDATORY** imports required for:
1.  **`sanitizeFilename(filename)`**: Strips directory traversal characters, null bytes, and illegal OS characters. **MUST** be used in every `saveAs()` call.
2.  **`escapeHtml(unsafe)`**: Converts sensitive characters into HTML entities. **MUST** be used when building manual HTML templates (e.g., PDF-to-Word exports).
3.  **`generateId()`**: Safe ID generation using `crypto.randomUUID()` with fallback. **MUST** be used for all dynamic React keys to prevent hydration mismatches or crashes in non-secure contexts.

### 🚫 Banned Techniques
- **NO** usage of `dangerouslySetInnerHTML` or `.innerHTML` for rendering user-provided or PDF-extracted text.
- **NO** raw file uploads to any external endpoint.

---

## 3. The "Truth of Implementation"

### 🚄 Preview Engine & "Secure Scanner"
Located in `src/components/common/PdfPreview.jsx`, the previewer handles real-time rendering of processed files.
- **Progressive Loading**: Large PDFs use a tiered rendering approach to prevent browser freezes.
- **Secure Scanner UI**: A custom loading state that provides visual confirmation of local processing.
- **ForceFull**: Logic to ensure complex PDFs are fully rasterized when high-fidelity is required.

### 🧹 Console Protocol (`components/Providers.jsx`)
To ensure a professional production environment:
- **Production**: All `console.log`, `console.warn`, and `console.error` are silenced globally.
- **Development**: Only specific noisy warnings (like PDF.js `TT: undefined function`) are suppressed to keep the DX clean.

### 🕒 Privacy Purge (`src/hooks/useSessionGuard.js`)
- **Timeout Purge**: Automatically clears `localStorage` and `sessionStorage` after 20 minutes of inactivity to prevent data lingering on shared devices.
- **Navigation Purge**: Returning to the home screen wipes temporary state while whitelisting essential user preferences (theme, settings).

---

## 4. Monetization & Analytics
We maintain a zero-secrets policy for CI/CD by using hardcoded production fallbacks in `src/utils/config.js`.

- **AdSense**: Integrated via `next/script` in `layout.jsx`. Uses `CONFIG.ADSENSE_ID` and `CONFIG.ADSENSE_SLOT_ID`.
- **Google Analytics**: Standard `gtag` integration for tracking tool usage without collecting PII (Personally Identifiable Information).

---

## 5. 🤖 AI Agent Operating Rules (MANDATORY)
If you are an AI assistant helping with this project, you **MUST** follow these rules:

1.  **Top-Bottom Import Audit**: Before every save, verify all used components (Lucide icons, Framer Motion elements) are imported. Missing imports are the #1 cause of "Blank Screen" regressions.
2.  **Terminology**: Always use private-first language. Use **"On your device"** or **"Local Processing"** instead of "Upload" or "Server".
3.  **Vite/Next Worker Resolution**: `pdfjs-dist` version 5+ requires native `.mjs` module loading. 
    ```javascript
    import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
    ```
    This MUST be set locally inside every tool component that uses PDF.js.
4.  **Component Whitelist**: Do not introduce arbitrary CSS or third-party UI libraries. Use the existing Tailwind theme tokens.
5.  **Post-Mortem Lessons**: 
    - Never assume a component is globally imported.
    - Check conditional blocks (`{isDone && ...}`) for "hibernating" reference errors.
    - React Router components (`useNavigate`) MUST be imported in `App.jsx` or relevant layout files.

---
**Status**: Consistently Hardened. 🚀