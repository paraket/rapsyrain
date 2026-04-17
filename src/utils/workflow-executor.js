import { splitPdf, reorderPdfPages, mergePdfs } from './pdf-utils';

/**
 * Orchestrates a series of PDF operations in a single pipeline.
 * @param {Array<{id: string, file: File}>} uploadedFiles - User's initial uploads.
 * @param {Array} nodes - Ordered list of workflow nodes.
 * @param {Function} onStep - Progress callback.
 * @returns {Promise<Array<File>>} Final processed files.
 */
export async function executeWorkflow(uploadedFiles, nodes, onStep) {
  // Each file in the pool needs a stable ID.
  let pool = uploadedFiles.map(f => {
    f.file.workflowId = f.id;
    return f.file;
  });

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (onStep) {
      onStep({ step: i, nodeId: node.id, label: node.label });
    }

    // Yield to keep UI responsive
    await new Promise(resolve => setTimeout(resolve, 50));

    const newPool = [];

    switch (node.type) {
      case 'split': {
        for (const file of pool) {
          const fileConfig = node.config?.perFile?.[file.workflowId] || node.config;
          const mode = fileConfig?.mode || 'custom';
          
          let numericRanges = [];

          if (mode === 'fixed') {
            const interval = parseInt(fileConfig.fixedInterval) || 1;
            // We need the page count. We can load it quickly.
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const pageCount = pdfDoc.getPageCount();
            
            for (let start = 1; start <= pageCount; start += interval) {
                numericRanges.push({
                    start,
                    end: Math.min(start + interval - 1, pageCount)
                });
            }
          } else if (mode === 'extract') {
            const { PDFDocument } = await import('pdf-lib');
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
            const pageCount = pdfDoc.getPageCount();
            for (let p = 1; p <= pageCount; p++) {
                numericRanges.push({ start: p, end: p });
            }
          } else {
            // custom mode
            numericRanges = fileConfig?.ranges?.map(r => ({
                start: parseInt(r.start),
                end: parseInt(r.end)
            })).filter(r => !isNaN(r.start) && !isNaN(r.end)) || [];
          }

          if (numericRanges.length === 0) {
            newPool.push(file);
            continue;
          }

          const blobs = await splitPdf(file, numericRanges);
          blobs.forEach((b, idx) => {
            const newFile = new File([b], `split_${i + 1}_part${idx + 1}_${file.name}`, { type: 'application/pdf' });
            newFile.workflowId = `node_${i}_split_${idx}_${file.workflowId}`;
            newPool.push(newFile);
          });
        }
        pool = newPool;
        break;
      }

      case 'reorder': {
        for (const file of pool) {
          const fileConfig = node.config?.perFile?.[file.workflowId] || node.config;
          const indices = fileConfig?.pageOrder;
          
          if (!indices || indices.length === 0) {
            newPool.push(file);
            continue;
          }
          
          const bytes = await reorderPdfPages(file, indices);
          const newFile = new File([bytes], `reordered_${i + 1}_${file.name}`, { type: 'application/pdf' });
          newFile.workflowId = `node_${i}_reorder_${file.workflowId}`;
          newPool.push(newFile);
        }
        pool = newPool;
        break;
      }

      case 'merge': {
        if (pool.length === 0) break;
        if (pool.length === 1) {
           const cloned = new File([await pool[0].arrayBuffer()], `merged_${i + 1}_${pool[0].name}`, { type: 'application/pdf' });
           cloned.workflowId = `node_${i}_merged`;
           pool = [cloned];
           break;
        }
        const bytes = await mergePdfs(pool);
        const mergedFile = new File([bytes], `merged_workflow_${i + 1}.pdf`, { type: 'application/pdf' });
        mergedFile.workflowId = `node_${i}_merged`;
        pool = [mergedFile];
        break;
      }
      default:
        break;
    }
  }

  return pool;
}
