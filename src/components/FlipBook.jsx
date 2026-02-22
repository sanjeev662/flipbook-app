import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageFlip } from 'page-flip';

const getBasePath = () => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};
const MANIFEST_URL = `${getBasePath()}assets/pdf/manifest.json`;
const PAGES_BASE_URL = `${getBasePath()}assets/pdf/pages`;

const DEBUG = false;
const log = (...args) => DEBUG && console.log('[FlipBook]', ...args);
const logErr = (...args) => console.error('[FlipBook]', ...args);

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 560;
const MAX_STACK_PX = 8; // max visible thickness of page stack (px)

export default function FlipBook({
  currentPage,
  onPageChange,
  zoomLevel = 1,
  onFlipbookReady,
  onLoadStateChange,
  onStateChange,
  onPrevRef,
  onNextRef,
}) {
  const containerRef = useRef(null);
  const measureRef = useRef(null);
  const wrapperRef = useRef(null);
  const pageFlipRef = useRef(null);
  const isFlippingRef = useRef(false);
  const lastReportedPageRef = useRef(currentPage);

  const [dimensions, setDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    totalWidth: DEFAULT_WIDTH * 2,
    isWide: true,
  });
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  // ── Derived book-state for physical decoration ──
  const totalPagesCount = imageUrls.length;
  const pageProgress = totalPagesCount > 1 ? (currentPage - 1) / (totalPagesCount - 1) : 0;
  const isCover = currentPage <= 1 && totalPagesCount > 0;
  const rightStackPx = Math.max(4, Math.round((1 - pageProgress) * MAX_STACK_PX));
  const leftStackPx = Math.round(pageProgress * MAX_STACK_PX);

  const updateDimensions = useCallback(() => {
    const el = measureRef.current || containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const isMobile = window.innerWidth < 1024;
    const hPad = isMobile ? 40 : 64;
    const vPad = isMobile ? 96 : 120;
    let containerWidth = rect.width || Math.max(200, window.innerWidth - hPad);
    let containerHeight = rect.height || Math.max(280, window.innerHeight - vPad);

    if (containerWidth < 100 || containerHeight < 100) {
      containerWidth = Math.max(260, window.innerWidth - hPad);
      containerHeight = Math.max(340, window.innerHeight - vPad);
    }

    const wide = containerWidth >= 1024;
    const aspectRatio = 612 / 792;
    const maxPageHeight = containerHeight - (isMobile ? 4 : 8);
    const maxPageWidthFromHeight = Math.floor(maxPageHeight * aspectRatio);
    const maxPageWidthFromContainer = wide
      ? Math.floor(containerWidth / 2) - 4
      : containerWidth - (isMobile ? 12 : 16);
    const pageWidth = Math.min(maxPageWidthFromHeight, maxPageWidthFromContainer);
    const pageHeight = Math.min(maxPageHeight, Math.floor(pageWidth / aspectRatio));
    const totalWidth = wide ? pageWidth * 2 : pageWidth;

    setDimensions({
      width: Math.max(200, pageWidth),
      height: Math.max(300, pageHeight),
      totalWidth,
      isWide: wide,
    });
  }, []);

  useEffect(() => {
    updateDimensions();
    const ro = new ResizeObserver(() => updateDimensions());
    const el = measureRef.current || containerRef.current;
    if (el) ro.observe(el);
    return () => ro.disconnect();
  }, [updateDimensions]);

  useEffect(() => {
    let timeout;
    const handler = () => {
      clearTimeout(timeout);
      timeout = setTimeout(updateDimensions, 150);
    };
    window.addEventListener('resize', handler);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handler);
    };
  }, [updateDimensions]);

  const onLoadStateChangeRef = useRef(onLoadStateChange);
  onLoadStateChangeRef.current = onLoadStateChange;

  useEffect(() => {
    let cancelled = false;
    async function loadManifest() {
      try {
        const res = await fetch(MANIFEST_URL);
        if (!res.ok) throw new Error(`Manifest not found (${res.status})`);
        const data = await res.json();
        const pages = data?.pages;
        if (!pages?.length) throw new Error('No pages in manifest');

        const origin = window.location.origin;
        const basePath = PAGES_BASE_URL.startsWith('/') ? PAGES_BASE_URL : `/${PAGES_BASE_URL}`;
        const urls = pages.map((f) => {
          const path = `${basePath}/${f.replace(/^\//, '')}`;
          return path.startsWith('http') ? path : `${origin}${path}`;
        });

        if (!cancelled) setImageUrls(urls);
      } catch (err) {
        logErr('Manifest load error:', err);
        if (!cancelled) {
          setInitError(err.message || 'Failed to load flipbook pages');
          onLoadStateChangeRef.current?.({ isLoading: false, error: err.message, isReady: false });
        }
      }
    }
    loadManifest();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!imageUrls.length) return;

    let cancelled = false;

    function init() {
      const el = containerRef.current;
      const measureEl = measureRef.current || el;
      if (!el) {
        logErr('PageFlip init: container element is null');
        return;
      }

      const rect = measureEl?.getBoundingClientRect() || {};
      const isMobile = window.innerWidth < 1024;
      const hPad = isMobile ? 40 : 64;
      const vPad = isMobile ? 96 : 120;
      let cw = rect.width || Math.max(200, window.innerWidth - hPad);
      let ch = rect.height || Math.max(280, window.innerHeight - vPad);
      if (cw < 100) cw = Math.max(260, window.innerWidth - hPad);
      if (ch < 100) ch = Math.max(340, window.innerHeight - vPad);

      const isWide = cw >= 1024;
      const aspectRatio = 612 / 792;
      const availHeight = ch - (isMobile ? 4 : 8);
      const maxWidthFromH = Math.floor(availHeight * aspectRatio);
      const maxWidthFromW = isWide ? Math.floor(cw / 2) - 4 : cw - (isMobile ? 12 : 16);
      const width = Math.max(200, Math.min(maxWidthFromH, maxWidthFromW));
      const height = Math.max(300, Math.min(availHeight, Math.floor((width * 792) / 612)));

      log('PageFlip init:', { width, height, isWide, imageCount: imageUrls.length });

      try {
        const pageFlip = new PageFlip(el, {
          width,
          height,
          size: 'fixed',
          drawShadow: true,
          flippingTime: 700,
          usePortrait: !isWide,
          startPage: Math.max(0, Math.min(currentPage - 1, imageUrls.length - 1)),
          maxShadowOpacity: 0.6,
          showCover: true,
          mobileScrollSupport: true,
          swipeDistance: 25,
          autoSize: false,
          clickEventForward: true,
          useMouseEvents: true,
        });

        pageFlip.on('flip', (e) => {
          isFlippingRef.current = false;
          const idx = typeof e.data === 'number' ? e.data : 0;
          const page = idx + 1;
          lastReportedPageRef.current = page;
          onPageChange?.(page);
          log('flip event → page', page);
        });

        pageFlip.on('changeState', (e) => {
          isFlippingRef.current = e.data === 'flipping';
        });

        pageFlip.on('init', () => {
          log('PageFlip init event - ready');
          if (!cancelled) {
            setIsReady(true);
            onFlipbookReady?.(pageFlip);
            if (onPrevRef) onPrevRef.current = () => { isFlippingRef.current = true; pageFlip.flipPrev('bottom'); };
            if (onNextRef) onNextRef.current = () => { isFlippingRef.current = true; pageFlip.flipNext('bottom'); };
            requestAnimationFrame(() => {
              pageFlip.getRender()?.update?.();
            });
          }
        });

        pageFlip.loadFromImages(imageUrls);

        const ui = pageFlip.getUI?.();
        if (ui?.resizeCanvas && ui?.getCanvas) {
          const originalResize = ui.resizeCanvas.bind(ui);
          ui.resizeCanvas = function () {
            originalResize();
            const canvas = ui.getCanvas();
            const dpr = Math.min(window.devicePixelRatio || 1, 3);
            if (dpr <= 1 || !canvas) return;
            const rect = canvas.getBoundingClientRect();
            const w = rect.width;
            const h = rect.height;
            if (w <= 0 || h <= 0) return;
            canvas.width = Math.floor(w * dpr);
            canvas.height = Math.floor(h * dpr);
            canvas.style.width = w + 'px';
            canvas.style.height = h + 'px';
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          };
          ui.resizeCanvas();
        }

        pageFlipRef.current = pageFlip;

      } catch (err) {
        logErr('PageFlip init error:', err);
        if (!cancelled) {
          const errMsg = err?.message || 'Failed to initialize flipbook';
          setInitError(errMsg);
          onLoadStateChangeRef.current?.({ isLoading: false, error: errMsg, isReady: false });
        }
      }
    }

    const timer = setTimeout(init, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (onPrevRef) onPrevRef.current = null;
      if (onNextRef) onNextRef.current = null;
      if (pageFlipRef.current) {
        try { pageFlipRef.current.destroy?.(); } catch (_) {}
        pageFlipRef.current = null;
      }
      setIsReady(false);
    };
  }, [imageUrls]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pageFlipRef.current && isReady) {
      requestAnimationFrame(() => {
        pageFlipRef.current?.getRender()?.update?.();
      });
    }
  }, [dimensions, isReady]);

  useEffect(() => {
    const pf = pageFlipRef.current;
    const total = imageUrls.length;
    if (!pf || !isReady || currentPage < 1 || currentPage > total) return;
    if (lastReportedPageRef.current === currentPage) return;
    if (isFlippingRef.current) return;

    const targetIndex = currentPage - 1;
    const currentIndex = pf.getCurrentPageIndex?.() ?? -1;
    if (currentIndex !== targetIndex) {
      log('sync turnToPage', targetIndex, '(was', currentIndex, ')');
      lastReportedPageRef.current = currentPage;
      try {
        pf.turnToPage(targetIndex);
        pf.getRender()?.update?.();
      } catch (_) {}
    }
  }, [currentPage, imageUrls.length, isReady]);

  useEffect(() => {
    onStateChange?.({ imageUrls, isWide: dimensions.isWide });
  }, [imageUrls, dimensions.isWide, onStateChange]);

  useEffect(() => {
    const hasContent = imageUrls.length > 0;
    onLoadStateChangeRef.current?.({ isLoading: !hasContent && !initError, error: initError, isReady, hasContent });
  }, [isReady, initError, imageUrls.length]);

  useEffect(() => {
    return () => {
      if (pageFlipRef.current) {
        try { pageFlipRef.current.destroy?.(); } catch (_) {}
        pageFlipRef.current = null;
      }
    };
  }, []);

  // ── Error states ──
  if (initError && !imageUrls.length) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center p-8 rounded-2xl text-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-lg font-medium mb-2 text-gray-800">Failed to load flipbook</p>
        <p className="text-sm opacity-80">{initError}</p>
        <p className="text-xs mt-4 opacity-70">
          Run &quot;npm run convert-pdf&quot; to generate page images from sample.pdf
        </p>
      </motion.div>
    );
  }

  if (initError && imageUrls.length > 0) {
    return (
      <div className="w-full h-full flex flex-col items-center overflow-auto p-4">
        <p className="text-sm text-amber-700 mb-4">Using simple view (flip animation unavailable)</p>
        <div className="flex flex-col gap-4 max-w-2xl w-full">
          {imageUrls.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Page ${i + 1}`}
              className="w-full shadow-lg rounded"
              onError={(e) => logErr('Fallback img failed:', url, e)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={measureRef}
      className="w-full h-full flex items-center justify-center relative"
      style={{ minHeight: 0 }}
    >
      <motion.div
          ref={wrapperRef}
          className="book-wrapper"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease-in-out',
            height: dimensions.height,
            width: dimensions.totalWidth,
            position: 'relative',
            zIndex: 1,
            flexShrink: 0,
          }}
        >
          {/* ── Left page stack (pages already read) ── */}
          {dimensions.isWide && leftStackPx > 1 && (
            <div
              className="book-page-stack book-page-stack--left"
              style={{ height: dimensions.height - 6, width: leftStackPx }}
            />
          )}

          {/* ── Right page stack (pages remaining) ── */}
          {rightStackPx > 1 && (
            <div
              className="book-page-stack book-page-stack--right"
              style={{ height: dimensions.height - 6, width: rightStackPx }}
            />
          )}

          {/* ── Actual page-flip canvas ── */}
          <div
            ref={containerRef}
            className="stf__container"
            style={{
              width: dimensions.totalWidth,
              height: dimensions.height,
              minWidth: dimensions.width,
              minHeight: dimensions.height,
              flexShrink: 0,
              position: 'relative',
              overflow: 'visible',
              display: 'block',
              backgroundColor: 'transparent',
            }}
          />

          {/* ── Spine shadow overlay (center divider when book is open) ── */}
          {dimensions.isWide && !isCover && isReady && totalPagesCount > 0 && (
            <div
              className="book-spine-overlay"
              style={{ left: dimensions.width }}
            />
          )}

          {/* ── Bottom floor shadow ── */}
          <div className="book-floor-shadow" />
        </motion.div>

      {/* Loading overlay */}
      {imageUrls.length > 0 && !isReady && (
        <div
          className="absolute inset-0 flex items-center justify-center z-[2]"
          style={{ background: '#e8e2d8' }}
        >
          <img
            src={imageUrls[Math.max(0, currentPage - 1)] || imageUrls[0]}
            alt={`Page ${currentPage}`}
            className="max-w-full max-h-full object-contain shadow-2xl rounded"
            style={{ maxHeight: '100%', minWidth: 0 }}
            onError={(e) => logErr('Overlay img failed:', e)}
          />
        </div>
      )}
    </div>
  );
}
