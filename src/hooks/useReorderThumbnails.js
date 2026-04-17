'use client';

import { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker for browser environments
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

export function useReorderThumbnails(file, maxPageCap = 50) {
  const [pages, setPages] = useState([]);
  const [originalPages, setOriginalPages] = useState([]);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [isAborted, setIsAborted] = useState(false);

  const loadingTaskRef = useRef(null);
  const renderTaskRef = useRef(null);
  const isAbortedRef = useRef(false);

  const abortCurrentTasks = async () => {
    isAbortedRef.current = true;
    setIsAborted(true);

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch (e) { }
      renderTaskRef.current = null;
    }

    if (loadingTaskRef.current) {
      try {
        await loadingTaskRef.current.destroy();
      } catch (e) { }
      loadingTaskRef.current = null;
    }
  };

  useEffect(() => {
    if (!file) {
      setPages([]);
      setOriginalPages([]);
      return;
    }

    const renderThumbnails = async () => {
      setRendering(true);
      setRenderProgress(0);
      isAbortedRef.current = false;
      setIsAborted(false);
      setPages([]);
      setOriginalPages([]);

      try {
        const arrayBuffer = await file.arrayBuffer();

        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          stopAtErrors: false
        });
        loadingTaskRef.current = loadingTask;

        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const pagesToRender = Math.min(numPages, maxPageCap);

        const tempPages = [];
        for (let i = 1; i <= pagesToRender; i++) {
          if (isAbortedRef.current) break;

          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 }); // Smaller scale for workflow previews
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderTask = page.render({ canvasContext: context, viewport });
          renderTaskRef.current = renderTask;

          try {
            await renderTask.promise;
            if (isAbortedRef.current) break;

            const newPage = {
              id: i,
              thumbnail: canvas.toDataURL(),
            };

            tempPages.push(newPage);
            setPages([...tempPages]); // Progressive update
            setRenderProgress(Math.round((i / pagesToRender) * 100));
          } catch (renderError) {
            if (renderError.name === 'RenderingCancelledException' || isAbortedRef.current) {
              break;
            }
            throw renderError;
          }
        }

        if (!isAbortedRef.current) {
          setPages([...tempPages]);
          setOriginalPages([...tempPages]);
        }
      } catch (error) {
        if (!isAbortedRef.current) {
          console.error("Rendering failed:", error);
        }
      } finally {
        if (!isAbortedRef.current) {
          setRendering(false);
          loadingTaskRef.current = null;
          renderTaskRef.current = null;
        }
      }
    };

    renderThumbnails();

    return () => {
      abortCurrentTasks();
    };
  }, [file, maxPageCap]);

  return {
    pages,
    setPages,
    originalPages,
    rendering,
    renderProgress,
    abortRender: abortCurrentTasks,
    isAborted
  };
}
