import { useCallback, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker for Vite - use ?url for reliable bundling
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
}

/**
 * Custom hook for PDF rendering logic.
 * Handles loading, rendering pages to canvas, and cleanup.
 * Lazy loads pages - only renders current, previous, and next pages.
 */
export function usePdfRenderer() {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const renderedPagesRef = useRef(new Map());
  const canvasRefsRef = useRef(new Map());

  /**
   * Load PDF from URL
   * @param {string} url - Path to PDF file
   */
  const loadPdf = useCallback(async (url) => {
    setIsLoading(true);
    setError(null);
    try {
      const loadingTask = pdfjsLib.getDocument({ url });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      return pdf;
    } catch (err) {
      console.error('PDF load error:', err);
      setError(err.message || 'Failed to load PDF');
      setPdfDoc(null);
      setTotalPages(0);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Render a single page to canvas and return as image data URL
   * @param {number} pageNumber - 1-indexed page number
   * @param {number} scale - Render scale for quality
   * @returns {Promise<string>} - Data URL of rendered page
   */
  const renderPage = useCallback(
    async (pageNumber, scale = 2) => {
      if (!pdfDoc) return null;

      const cacheKey = `${pageNumber}-${scale}`;
      if (renderedPagesRef.current.has(cacheKey)) {
        return renderedPagesRef.current.get(cacheKey);
      }

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        renderedPagesRef.current.set(cacheKey, dataUrl);
        return dataUrl;
      } catch (err) {
        console.error(`Error rendering page ${pageNumber}:`, err);
        return null;
      }
    },
    [pdfDoc]
  );

  /**
   * Get total page count
   */
  const getTotalPages = useCallback(() => totalPages, [totalPages]);

  /**
   * Cleanup: destroy PDF and clear caches
   */
  const cleanup = useCallback(() => {
    if (pdfDoc) {
      pdfDoc.destroy?.();
    }
    renderedPagesRef.current.clear();
    canvasRefsRef.current.clear();
    setPdfDoc(null);
    setTotalPages(0);
  }, [pdfDoc]);

  return {
    loadPdf,
    renderPage,
    getTotalPages: () => totalPages,
    totalPages,
    pdfDoc,
    error,
    isLoading,
    cleanup,
  };
}
