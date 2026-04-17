# myPDF Lite: Repository Analysis & Knowledge Base

> [!IMPORTANT]
> **STRICT COMPLIANCE RULE**: This file is the absolute "Source of Truth". Before making ANY change, analyzing ANY logic, or proposing ANY design, you MUST verify against the rules documented here. NEVER rely on generalized assumptions or external patterns if they contradict this manual.

## 1. Project Identity & Vision
**myPDF Lite** is a premium, privacy-first, client-side PDF utility suite.
- **Privacy Model**: "Zero-Trace". Files never leave the browser.
- **Processing**: Local execution via WebAssembly (Wasm) and JavaScript.
- **Session Security**: 20-minute inactivity timeout triggers a "Nuclear Clear" of `localStorage`/`sessionStorage` and a full page reload to wipe in-memory caches. (See `useSessionGuard.js`).
- **Provider**: QPKendra Ecosystem.

---

## 2. Core Technology Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS 4.0 (Lucide Icons + Glassmorphism)
- **Animation**: Framer Motion
- **PDF Engines**:
  - `pdf-lib`: For manipulation (Merge, Split, Rotate, etc.).
  - `pdfjs-dist`: For high-fidelity rendering and text extraction.
- **Worker Management**: PDF.js version 5+ uses native `.mjs` workers. The worker (`/pdf.worker.min.mjs`) is served via a **Cache-First** strategy in the Service Worker.
- **Theming**: Dynamic CSS variables (`--primary`, `--ring`) managed via React Context and persisted in `localStorage`.

---

## 3. Strict Development Rules (MANDATORY)

### 🛡️ Blank Screen Prevention (Mandatory Audit)
Before saving any file, perform this audit:
1. **Import Audit**: Manually verify ALL JSX tags (especially Lucide icons like `GripHorizontal`, `Zap`, `Info`) are imported.
2. **Dynamic Imports**: Use `dynamic()` with a `loading` fallback (rendering `ToolSkeleton`) for heavy tools.
3. **Safe Defaults**: Initialize state with safe values to prevent undefined errors in render.
4. **Operation Buffering**: Disable action buttons (Process/Export) unless valid input detected.

### 📱 Mobile-First Protocol
1. **Viewport Boundaries**: NEVER use `overflow-hidden` on parent layout components (`ToolLayout.jsx`) that host tooltips or dropdowns. It causes cutting/clipping.
2. **Tooltip Alignment**: Align tooltips with `left-0` or `left-1/2` instead of `right-0`. Use `max-sm:w-40` and `max-sm:-translate-x-1/4` to prevent left-side viewport overflow on narrow screens.
3. **Download Hardening**: In `src/utils/pdf-utils.js`, `downloadFile` MUST include an anchor-link blob URL fallback for mobile browsers where `file-saver` may fail.

### 🍱 User Experience & Validation
1. **Smart Previews**: Previews must be "Focus-Aware". If optimization is ON, prioritize rendering pages currently entered in tool settings (e.g., Split ranges) rather than just Page 1.
2. **Label Accuracy**: Previews MUST display the **Original Document Page Number** (e.g., "Page 50"), not just the index in the current render array.
3. **Input Feedback**: Use Framer Motion `shake` animations and independent field highlighting (e.g., `startError`, `endError`) for multi-field inputs. Red borders (`border-destructive`) and consolidated error messages are mandatory.
4. **Instant Sync**: Toggling "Optimize" or changing ranges must instantly reset scroll position (`scrollTop = 0`) and update the preview cache key to reflect changes.

---

## 4. CSS & Design System Standards
The project uses **Tailwind CSS 4.0** with a centralized HSL variable system.

### 🎨 Styling Constraints
- **Color Variable**: All primary elements MUST use `hsl(var(--primary))`.
- **Accents**: Use `bg-primary/10`, `text-primary`, and `hover:bg-primary/20` for premium interactions.
- **No Hardcoding**: Never hardcode Hex (#) or RGB codes in tool logic. Always use Tailwind utility classes or CSS variables.
- **Borders**: Standard radius is `0.75rem` (`radius-lg`). Use `border-border` and `bg-card` for consistency.

---

## 5. Security & Privacy Blueprint
Centralized in `src/utils/security.js`:
- `sanitizeFilename(filename)`: Must be used in all `saveAs()` calls.
- `generateId()`: Use `crypto.randomUUID()` for React keys.
- **Memory Management**: Every tool (`renderPagesToImages`) MUST explicitly clear canvas memory (`canvas.width = 0; canvas.height = 0`) to prevent mobile crashes.
- **Branding Footer**: PDF Previews must feature the footer: `myPDF | QPkendra`.

---

## 6. Performance Optimization Protocol ("Instant Load")
1. **Zero-Heavy-Entry**: Never import `pdf-lib` or `pdfjs-dist` at the top level. Use `async import()` inside function scopes or through `getPdfLib/getPdfJs` helpers.
2. **Fingerprint Caching**: Preview cache keys MUST include: `filename`, `size`, `lastModified`, `optimizeStatus`, and `rangeSettings`.
3. **Deferred Execution**: Use `useEffect` dependencies strictly to avoid redundant rendering cycles.

---

## 7. Component-Specific Knowledge
### `PdfPreview.jsx`
- Handles tiered progressive rendering. Includes `PREVIEW_LIMIT` (5MB).
- Data structure: `pageImages` array contains objects `{ src: dataUrl, pageNumber: i }`.
- Features "Secure Scanner" UI with Framer Motion transitions.

### `pdf-utils.js`
- `renderPagesToImages`: Supports `pageSelection` as a scalar (limit) or an array of indices.
- `downloadFile`: Features multi-path saving for mobile compatibility.
- `getPdfLib` / `getPdfJs`: Dynamic loaders for heavy engines.

---

## 8. Directory Architecture
- `/app`: Next.js App Router pages.
- `/src/components/common`: Shared UI (`PdfPreview.jsx`, `UploadArea.jsx`, `ToolHeader.jsx`).
- `/src/utils`: Core logic (`pdf-utils.js`, `security.js`).
- `/src/hooks`: Lifecycle hooks (`useSessionGuard.js`).
- `/public`: Static assets (Workers).
