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
  const isFlippingRef = useRef(false); // track if a flip animation is in progress
  const lastReportedPageRef = useRef(currentPage); // avoid redundant sync calls

  const [dimensions, setDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    totalWidth: DEFAULT_WIDTH * 2,
    isWide: true,
  });
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);

  const updateDimensions = useCallback(() => {
    const el = measureRef.current || containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    let containerWidth = rect.width || window.innerWidth - 96;
    let containerHeight = rect.height || window.innerHeight - 110;

    if (containerWidth < 100 || containerHeight < 100) {
      containerWidth = Math.max(300, window.innerWidth - 96);
      containerHeight = Math.max(400, window.innerHeight - 110);
    }

    const wide = containerWidth >= 768; // Desktop: 2-page spread. Mobile: 1 page
    const aspectRatio = 612 / 792;
    const maxPageHeight = containerHeight - 8;
    const maxPageWidthFromHeight = Math.floor(maxPageHeight * aspectRatio);
    const maxPageWidthFromContainer = wide
      ? Math.floor(containerWidth / 2) - 4
      : Math.min(containerWidth - 8, 500);
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

  // Keep callback refs to avoid re-fetching on every parent re-render
  const onLoadStateChangeRef = useRef(onLoadStateChange);
  onLoadStateChangeRef.current = onLoadStateChange;

  // Load manifest once on mount (do not re-run when callbacks change)
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

  // Init PageFlip once image URLs are available
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

      // Get real container dimensions at init time
      const rect = measureEl?.getBoundingClientRect() || {};
      let cw = rect.width || window.innerWidth - 96;
      let ch = rect.height || window.innerHeight - 110;
      if (cw < 100) cw = Math.min(500, window.innerWidth - 96);
      if (ch < 100) ch = Math.min(700, window.innerHeight - 110);

      const isWide = cw >= 768; // Desktop: 2-page book spread. Mobile: single page
      const aspectRatio = 612 / 792;
      const availHeight = ch - 8;
      const maxWidthFromH = Math.floor(availHeight * aspectRatio);
      const maxWidthFromW = isWide ? Math.floor(cw / 2) - 4 : Math.min(cw - 8, 500);
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
          usePortrait: !isWide, // false = landscape = 2-page spread; true = portrait = 1 page
          startPage: Math.max(0, Math.min(currentPage - 1, imageUrls.length - 1)),
          maxShadowOpacity: 0.7,
          showCover: false,
          mobileScrollSupport: true,
          swipeDistance: 25,
          autoSize: false,
          clickEventForward: true,
          useMouseEvents: true,
        });

        // ── flip event: user dragged or we called flipNext/flipPrev ──
        pageFlip.on('flip', (e) => {
          isFlippingRef.current = false;
          const idx = typeof e.data === 'number' ? e.data : 0;
          const page = idx + 1;
          lastReportedPageRef.current = page;
          onPageChange?.(page);
          log('flip event → page', page);
        });

        pageFlip.on('changeState', (e) => {
          // 'flipping' state means animation is in progress
          isFlippingRef.current = e.data === 'flipping';
        });

        // ── init event: PageFlip is fully ready ──
        pageFlip.on('init', () => {
          log('PageFlip init event - ready');
          if (!cancelled) {
            setIsReady(true);
            onFlipbookReady?.(pageFlip);
            // Expose prev/next handlers so parent can call them (with correct refs)
            if (onPrevRef) onPrevRef.current = () => { isFlippingRef.current = true; pageFlip.flipPrev('bottom'); };
            if (onNextRef) onNextRef.current = () => { isFlippingRef.current = true; pageFlip.flipNext('bottom'); };
            requestAnimationFrame(() => {
              pageFlip.getRender()?.update?.();
            });
          }
        });

        pageFlip.loadFromImages(imageUrls);
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

    // Wait for DOM layout before initialising
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

  // Re-render canvas when zoom or dimensions change
  useEffect(() => {
    if (pageFlipRef.current && isReady) {
      requestAnimationFrame(() => {
        pageFlipRef.current?.getRender()?.update?.();
      });
    }
  }, [dimensions, isReady]);

  // Sync external currentPage → PageFlip (for slider / thumbnail navigation)
  // Skip if the change came from a flip event (lastReportedPageRef matches)
  useEffect(() => {
    const pf = pageFlipRef.current;
    const total = imageUrls.length;
    if (!pf || !isReady || currentPage < 1 || currentPage > total) return;
    if (lastReportedPageRef.current === currentPage) return; // came from flip event, already synced
    if (isFlippingRef.current) return; // animation in progress, don't interrupt

    const targetIndex = currentPage - 1;
    const currentIndex = pf.getCurrentPageIndex?.() ?? -1;
    if (currentIndex !== targetIndex) {
      log('sync turnToPage', targetIndex, '(was', currentIndex, ')');
      try { pf.turnToPage(targetIndex); } catch (_) {}
    }
  }, [currentPage, imageUrls.length, isReady]);

  // Notify parent of image URLs and spread mode
  useEffect(() => {
    onStateChange?.({ imageUrls, isWide: dimensions.isWide });
  }, [imageUrls, dimensions.isWide, onStateChange]);

  // Notify parent of load state
  useEffect(() => {
    const hasContent = imageUrls.length > 0;
    onLoadStateChangeRef.current?.({ isLoading: !hasContent && !initError, error: initError, isReady, hasContent });
  }, [isReady, initError, imageUrls.length]);

  // Cleanup on unmount
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
        className="flex flex-col items-center justify-center p-8 rounded-2xl text-white/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-lg font-medium mb-2 text-white">Failed to load flipbook</p>
        <p className="text-sm opacity-70">{initError}</p>
        <p className="text-xs mt-4 opacity-50">
          Run &quot;npm run convert-pdf&quot; to generate page images from sample.pdf
        </p>
      </motion.div>
    );
  }

  if (initError && imageUrls.length > 0) {
    return (
      <div className="w-full h-full flex flex-col items-center overflow-auto p-4">
        <p className="text-sm text-amber-400 mb-4">Using simple view (flip animation unavailable)</p>
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
      {/* Flipbook canvas wrapper — needs overflow visible for shadow/animation */}
      <motion.div
        ref={wrapperRef}
        className="flex items-center justify-center"
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
      </motion.div>

      {/* Loading overlay — shows first page image until PageFlip initialises */}
      {imageUrls.length > 0 && !isReady && (
        <div
          className="absolute inset-0 flex items-center justify-center z-[2]"
          style={{ background: '#2d2d2d' }}
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
