import { sanitizeFilename } from './security';

// Static worker path for Next.js SSG
const pdfWorkerUrl = '/pdf.worker.min.mjs';

/**
 * Helper to load pdf-lib dynamically
 */
const getPdfLib = async () => {
  return await import('pdf-lib');
};

/**
 * Helper to load pdfjs-dist dynamically
 */
const getPdfJs = async () => {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  return pdfjs;
};

/**
 * Helper to load file-saver dynamically
 */
const getFileSaver = async () => {
  return await import('file-saver');
};

/**
 * Merges multiple PDF files into one.
 * @param {Array<File>} files - The PDF files to merge.
 * @returns {Promise<Uint8Array>} The merged PDF as a byte array.
 */
export const mergePdfs = async (files) => {
  const { PDFDocument } = await getPdfLib();
  const mergedPdf = await PDFDocument.create();
  
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  
  return await mergedPdf.save();
};

/**
 * Splits a PDF file into multiple files based on ranges.
 * @param {File} file - The PDF file to split.
 * @param {Array<{start: number, end: number}>} ranges - The page ranges to extract.
 * @returns {Promise<Array<Uint8Array>>} Array of split PDF byte arrays.
 */
export const splitPdf = async (file, ranges) => {
  const { PDFDocument } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const results = [];

  for (const range of ranges) {
    const newPdf = await PDFDocument.create();
    // Ranges are 1-indexed for users, convert to 0-indexed for pdf-lib
    const start = Math.max(0, range.start - 1);
    const end = Math.min(srcPdf.getPageCount() - 1, range.end - 1);
    
    const indices = [];
    for (let i = start; i <= end; i++) {
      indices.push(i);
    }

    const copiedPages = await newPdf.copyPages(srcPdf, indices);
    copiedPages.forEach((page) => newPdf.addPage(page));
    
    results.push(await newPdf.save());
  }

  return results;
};

/**
 * Rotates specific pages in a PDF.
 * @param {File} file - The PDF file.
 * @param {number|Array<number>} rotationData - Degrees to rotate (90, 180, 270) or array of absolute degrees per page.
 * @param {Array<number>} pageIndices - Indices of pages to rotate (0-indexed) if rotationData is a number.
 * @returns {Promise<Uint8Array>} The modified PDF.
 */
export const rotatePdfPages = async (file, rotationData, pageIndices = null) => {
  const { PDFDocument, degrees } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  if (Array.isArray(rotationData)) {
    // rotationData is an array of absolute degrees [0, 90, 180, ...]
    rotationData.forEach((deg, index) => {
      if (index < pages.length) {
        pages[index].setRotation(degrees(deg % 360));
      }
    });
  } else {
    // rotationData is a single number (relative rotation for specific indices)
    const indices = pageIndices || pages.map((_, i) => i);
    indices.forEach((index) => {
      const page = pages[index];
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationData) % 360));
    });
  }

  return await pdfDoc.save();
};

/**
 * Removes specific pages from a PDF.
 * @param {File} file - The PDF file.
 * @param {Array<number>} indicesToRemove - Indices of pages to remove (0-indexed).
 * @returns {Promise<Uint8Array>} The modified PDF.
 */
export const removePages = async (file, indicesToRemove) => {
  const { PDFDocument } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  // Sort indices in descending order to avoid shift issues during removal
  const sortedIndices = [...indicesToRemove].sort((a, b) => b - a);
  
  sortedIndices.forEach((index) => {
    pdfDoc.removePage(index);
  });

  return await pdfDoc.save();
};

/**
 * Reorders pages in a PDF document.
 * @param {File} file - The PDF file.
 * @param {Array<number>} indices - Array of 0-based indices in the desired order.
 * @returns {Promise<Uint8Array>} The modified PDF.
 */
export const reorderPdfPages = async (file, indices) => {
  const { PDFDocument } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const pdfDoc = await PDFDocument.create();
  
  const copiedPages = await pdfDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => pdfDoc.addPage(page));

  return await pdfDoc.save();
};


/**
 * Compresses a PDF using a rasterization strategy.
 * @param {File} file - The PDF file.
 * @param {number} compressionValue - 0 to 70.
 * @returns {Promise<Uint8Array>} The compressed PDF.
 */
export const compressPdfRaster = async (file, compressionValue) => {
  const [{ PDFDocument }, pdfjs] = await Promise.all([getPdfLib(), getPdfJs()]);
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer, stopAtErrors: false });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const compressedPdf = await PDFDocument.create();

  // Dynamically calculate scale and quality based on 0-70 range
  // 0  -> Scale: 2.5, Quality: 0.95
  // 70 -> Scale: 0.7, Quality: 0.3
  const percentage = compressionValue / 70;
  const scale = 2.5 - (percentage * 1.8); // 2.5 to 0.7
  const quality = 0.95 - (percentage * 0.65); // 0.95 to 0.3

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    
    // Convert to JPEG with quality setting
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    const imageBytes = await fetch(dataUrl).then(res => res.arrayBuffer());
    const image = await compressedPdf.embedJpg(imageBytes);

    const { width, height } = image.scale(1);
    const pdfPage = compressedPdf.addPage([width, height]);
    pdfPage.drawImage(image, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });

    // Cleanup to prevent memory issues
    canvas.width = 0;
    canvas.height = 0;
  }

  return await compressedPdf.save();
};

/**
 * Advanced lossless compression. Performs a clean structural rebuild (Object Removal & Subset Optimization)
 * and strips metadata while preserving all selectable text and original image quality.
 * @param {File} file - The PDF file.
 * @returns {Promise<Uint8Array>} The rebuilt PDF.
 */
export const compressPdfStandard = async (file) => {
  const { PDFDocument } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const pdfDoc = await PDFDocument.create();
  
  // Copy pages to a new document to remove redundant/unused objects (Subset Optimization)
  const pageCount = srcDoc.getPageCount();
  const indices = Array.from({ length: pageCount }, (_, i) => i);
  const copiedPages = await pdfDoc.copyPages(srcDoc, indices);
  copiedPages.forEach((page) => pdfDoc.addPage(page));

  // Strip metadata (Metadata Stripping / Privacy)
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setCreator('');
  pdfDoc.setProducer('');
  
  // Save with Object Streams (Flate/Deflate compression for the catalog)
  return await pdfDoc.save({ 
    useObjectStreams: true,
    addDefaultPage: false
  });
};

/**
 * Parses a page range string (e.g., "1, 2, 5-10") into an array of 0-based indices.
 */
export const parsePageRange = (rangeText, totalPages) => {
  const pages = new Set();
  const parts = rangeText.split(',').map(p => p.trim());
  
  parts.forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(n => parseInt(n));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
          if (i > 0 && i <= totalPages) pages.add(i - 1);
        }
      }
    } else {
      const page = parseInt(part);
      if (!isNaN(page) && page > 0 && page <= totalPages) {
        pages.add(page - 1);
      }
    }
  });
  
  return Array.from(pages).sort((a, b) => a - b);
};

/**
 * Extracts specific pages from a PDF for preview optimization.
 */
export const extractPages = async (file, range = "1") => {
  const { PDFDocument } = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(arrayBuffer);
  const pdfDoc = await PDFDocument.create();
  const totalPages = srcDoc.getPageCount();
  
  let indices = [];
  if (typeof range === 'string') {
    indices = parsePageRange(range, totalPages);
  } else {
    // Fallback for simple count
    indices = Array.from({ length: Math.min(range, totalPages) }, (_, i) => i);
  }
  
  if (indices.length > 0) {
    const pages = await pdfDoc.copyPages(srcDoc, indices);
    pages.forEach(page => pdfDoc.addPage(page));
  }
  
  const bytes = await pdfDoc.save();
  return new Blob([bytes], { type: 'application/pdf' });
};

/**
 * Renders PDF pages to an array of image data URLs.
 */
export const renderPagesToImages = async (file, maxPages = null, onProgress = null) => {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer, stopAtErrors: false });
  const pdf = await loadingTask.promise;
  const numPages = maxPages ? Math.min(maxPages, pdf.numPages) : pdf.numPages;
  const imageUrls = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 }); // High-quality scale
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;
    imageUrls.push(canvas.toDataURL('image/jpeg', 0.85));

    if (onProgress) {
      onProgress(i, numPages);
    }

    // Free memory
    canvas.width = 0;
    canvas.height = 0;
  }

  return imageUrls;
};

/**
 * Triggers a file download.
 */
export const downloadFile = async (data, fileName, type = 'application/pdf') => {
  const { saveAs } = await getFileSaver();
  const blob = new Blob([data], { type });
  const safeName = sanitizeFilename(fileName, 'document.pdf');
  saveAs(blob, safeName);
};
