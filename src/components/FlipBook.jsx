import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PageFlip } from 'page-flip';

const getBasePath = () => {
  const base = import.meta.env.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
};
const MANIFEST_URL  = `${getBasePath()}assets/pdf/manifest.json`;
const PAGES_BASE_URL = `${getBasePath()}assets/pdf/pages`;

const DEBUG = false; // Set to true to enable debug logs
const log    = (...args) => DEBUG && console.log('[FlipBook]', ...args);
const logErr = (...args) => console.error('[FlipBook]', ...args);

const DEFAULT_WIDTH  = 400;
const DEFAULT_HEIGHT = 560;
const MAX_STACK_PX   = 8; // max page-edge thickness visible (px)

export default function FlipBook({
  currentPage,
  onPageChange,
  zoomLevel = 1,
  onFlipSound,
  onFlipbookReady,
  onLoadStateChange,
  onStateChange,
  onPrevRef,
  onNextRef,
}) {
  const containerRef = useRef(null);
  const measureRef   = useRef(null);
  const wrapperRef   = useRef(null);
  const pageFlipRef  = useRef(null);
  const isFlippingRef        = useRef(false);
  const lastReportedPageRef  = useRef(currentPage);

  const [dimensions, setDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    totalWidth: DEFAULT_WIDTH * 2,
    isWide: true,
  });
  const [isReady,    setIsReady]    = useState(false);
  const [initError,  setInitError]  = useState(null);
  const [imageUrls,  setImageUrls]  = useState([]);
  // Incremented to trigger a full PageFlip re-initialization when dimensions change significantly
  const [reinitKey,  setReinitKey]  = useState(0);

  // Tracks the dimensions PageFlip was last initialized with — used to detect significant changes
  const lastInitDimsRef  = useRef(null);
  // Synchronous flag: true while a reinit is in-flight, prevents cascading reinits during resize
  const isReinitPendingRef = useRef(false);
  // Stable ref to current page so the reinit effect can restore position without a stale closure
  const currentPageRef   = useRef(currentPage);
  currentPageRef.current = currentPage;

  // ── Zoom + pan state (when zoom > 1, user can drag to pan) ─────────────────
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const viewportRef = useRef({ width: 0, height: 0 });

  // Reset pan when zoom returns to 1
  useEffect(() => {
    if (zoomLevel <= 1) setPan({ x: 0, y: 0 });
  }, [zoomLevel]);

  const isZoomed = zoomLevel > 1;

  // ── Book state derived from current page ─────────────────────────────────
  const totalPagesCount = imageUrls.length;
  const pageProgress    = totalPagesCount > 1 ? (currentPage - 1) / (totalPagesCount - 1) : 0;
  const isCover         = currentPage <= 1 && totalPagesCount > 0;
  const rightStackPx    = Math.max(4, Math.round((1 - pageProgress) * MAX_STACK_PX));
  const leftStackPx     = Math.round(pageProgress * MAX_STACK_PX);

  // ── Cover-clip layout ─────────────────────────────────────────────────────
  // In landscape (isWide) mode, page-flip renders the cover in the RIGHT half
  // of a double-wide canvas; the left half is empty.  We expose only the right
  // half by narrowing the outer box and shifting the canvas left by one pageWidth.
  const isWide      = dimensions.isWide;
  const clipWidth   = (isCover && isWide) ? dimensions.width      : dimensions.totalWidth;
  const canvasShift = (isCover && isWide) ? -dimensions.width     : 0;

  // ── Responsive dimension calc ─────────────────────────────────────────────
  const updateDimensions = useCallback(() => {
    const el = measureRef.current || containerRef.current;
    if (!el) {
      log('updateDimensions: no element to measure');
      return;
    }

    const rect       = el.getBoundingClientRect();
    viewportRef.current = { width: rect.width, height: rect.height };
    log('updateDimensions: rect=', rect.width, 'x', rect.height, 'measureEl=', !!measureRef.current);
    const isMobile   = window.innerWidth < 1024;
    const hPad       = isMobile ? 40 : 64;
    const vPad       = isMobile ? 96 : 120;
    let cw = rect.width  || Math.max(200, window.innerWidth  - hPad);
    let ch = rect.height || Math.max(280, window.innerHeight - vPad);
    if (cw < 100 || ch < 100) {
      cw = Math.max(260, window.innerWidth  - hPad);
      ch = Math.max(340, window.innerHeight - vPad);
    }

    const wide               = cw >= 1024;
    const aspectRatio        = 612 / 792;
    const maxPageHeight      = ch - (isMobile ? 4 : 8);
    const maxWidthFromHeight = Math.floor(maxPageHeight * aspectRatio);
    const maxWidthFromCont   = wide
      ? Math.floor(cw / 2) - 4
      : cw - (isMobile ? 12 : 16);
    const pageWidth  = Math.min(maxWidthFromHeight, maxWidthFromCont);
    const pageHeight = Math.min(maxPageHeight, Math.floor(pageWidth / aspectRatio));
    const totalWidth = wide ? pageWidth * 2 : pageWidth;

    setDimensions({
      width:      Math.max(200, pageWidth),
      height:     Math.max(300, pageHeight),
      totalWidth,
      isWide:     wide,
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
    const handler = () => { clearTimeout(timeout); timeout = setTimeout(updateDimensions, 150); };
    // orientationchange fires before the viewport updates — use a slightly longer delay
    const orientationHandler = () => { clearTimeout(timeout); timeout = setTimeout(updateDimensions, 300); };
    window.addEventListener('resize', handler);
    document.addEventListener('fullscreenchange', handler);
    window.addEventListener('orientationchange', orientationHandler);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handler);
      document.removeEventListener('fullscreenchange', handler);
      window.removeEventListener('orientationchange', orientationHandler);
    };
  }, [updateDimensions]);

  // ── Reinit trigger on significant dimension change ────────────────────────
  // Compares current dimensions against what PageFlip was last initialized with.
  // Triggers a full destroy + recreate when layout mode flips (portrait ↔ landscape)
  // or when the canvas needs to grow/shrink by more than a small threshold.
  // isReinitPendingRef prevents cascading: only one reinit can be in-flight at a time.
  useEffect(() => {
    if (!imageUrls.length) return;
    if (isReinitPendingRef.current) return; // Another reinit is already in-flight — skip
    const last = lastInitDimsRef.current;
    if (!last) return; // First init is driven by the imageUrls load, not this effect

    const { width, height, isWide } = dimensions;
    const modeChanged  = isWide !== last.isWide;
    const widthDiff    = Math.abs(width  - last.width);
    const heightDiff   = Math.abs(height - last.height);

    if (modeChanged || widthDiff >= 20 || heightDiff >= 20) {
      log('Reinit triggered — dims changed:', { prev: last, next: { width, height, isWide } });
      isReinitPendingRef.current = true; // Block further reinits synchronously
      setReinitKey(k => k + 1);
    }
  }, [dimensions, imageUrls.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Manifest load ─────────────────────────────────────────────────────────
  const onLoadStateChangeRef = useRef(onLoadStateChange);
  onLoadStateChangeRef.current = onLoadStateChange;
  const onFlipSoundRef = useRef(onFlipSound);
  onFlipSoundRef.current = onFlipSound;

  useEffect(() => {
    let cancelled = false;
    async function loadManifest() {
      try {
        const res  = await fetch(MANIFEST_URL);
        if (!res.ok) throw new Error(`Manifest not found (${res.status})`);
        const data = await res.json();
        const pages = data?.pages;
        if (!pages?.length) throw new Error('No pages in manifest');

        const origin   = window.location.origin;
        const basePath = PAGES_BASE_URL.startsWith('/') ? PAGES_BASE_URL : `/${PAGES_BASE_URL}`;
        const urls     = pages.map((f) => {
          const path = `${basePath}/${f.replace(/^\//, '')}`;
          return path.startsWith('http') ? path : `${origin}${path}`;
        });
        log('Manifest loaded: pages=', pages.length, 'urls[0]=', urls[0]);
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

  // ── PageFlip init ─────────────────────────────────────────────────────────
  // Runs on first load (imageUrls change) and on every reinitKey increment.
  // On reinit it destroys the existing instance, recalculates fresh dimensions
  // from the live DOM, and restores the current page position.
  useEffect(() => {
    log('PageFlip init effect ran: imageUrls=', imageUrls.length, 'reinitKey=', reinitKey);
    if (!imageUrls.length) return;
    let cancelled = false;

    // Destroy any existing instance before (re)initializing
    if (pageFlipRef.current) {
      try { pageFlipRef.current.destroy?.(); } catch (_) {}
      pageFlipRef.current = null;
      setIsReady(false);
    }

    function init() {
      const el        = containerRef.current;
      const measureEl = measureRef.current || el;
      if (!el) { logErr('PageFlip init: container is null'); return; }

      // Remove any DOM residue from the previous PageFlip instance.
      // PageFlip.destroy() doesn't always fully clean up, which can cause
      // duplicate canvases or z-index conflicts on reinit.
      const elRect = el.getBoundingClientRect();
      log('PageFlip init: container el rect=', elRect.width, 'x', elRect.height, 'clearing innerHTML');
      try { el.innerHTML = ''; } catch (_) {}

      // Always recalculate from the live DOM so we use post-resize dimensions
      const rect     = measureEl?.getBoundingClientRect() || {};
      const isMobile = window.innerWidth < 1024;
      const hPad     = isMobile ? 40 : 64;
      const vPad     = isMobile ? 96 : 120;
      let cw = rect.width  || Math.max(200, window.innerWidth  - hPad);
      let ch = rect.height || Math.max(280, window.innerHeight - vPad);
      if (cw < 100) cw = Math.max(260, window.innerWidth  - hPad);
      if (ch < 100) ch = Math.max(340, window.innerHeight - vPad);

      const wide          = cw >= 1024;
      const aspectRatio   = 612 / 792;
      const availH        = ch - (isMobile ? 4 : 8);
      const maxWFromH     = Math.floor(availH * aspectRatio);
      const maxWFromCont  = wide ? Math.floor(cw / 2) - 4 : cw - (isMobile ? 12 : 16);
      const width  = Math.max(200, Math.min(maxWFromH, maxWFromCont));
      const height = Math.max(300, Math.min(availH, Math.floor((width * 792) / 612)));

      // Clamp start page to valid range; use currentPageRef so we restore position on reinit
      const startIdx = Math.max(0, Math.min(currentPageRef.current - 1, imageUrls.length - 1));

      if (width < 50 || height < 50) {
        logErr('PageFlip init ABORT: dimensions too small', { width, height, cw, ch, rect });
      }
      log('PageFlip init:', { width, height, wide, pages: imageUrls.length, startIdx, cw, ch });

      try {
        const pageFlip = new PageFlip(el, {
          width,
          height,
          size:                'fixed',
          drawShadow:          true,
          flippingTime:        700,
          usePortrait:         !wide,
          startPage:           startIdx,
          maxShadowOpacity:    0.6,
          showCover:           true,
          mobileScrollSupport: true,
          swipeDistance:       25,
          autoSize:            false,
          clickEventForward:   true,
          useMouseEvents:      true,
        });

        pageFlip.on('flip', (e) => {
          isFlippingRef.current = false;
          const idx  = typeof e.data === 'number' ? e.data : 0;
          const page = idx + 1;
          lastReportedPageRef.current = page;
          onPageChange?.(page);
          onFlipSoundRef.current?.();
          log('flip →', page);
        });

        pageFlip.on('changeState', (e) => {
          isFlippingRef.current = e.data === 'flipping';
        });

        pageFlip.on('init', () => {
          log('PageFlip on(init) fired — book ready, drawing first frame');
          if (!cancelled) {
            // Record the dimensions this instance was initialized with.
            // Do NOT call setDimensions here — updateDimensions() owns that state;
            // setting it here would overwrite a fresher value from a concurrent resize.
            lastInitDimsRef.current = { width, height, isWide: wide };
            // Unblock the reinit guard now that a fresh instance is live
            isReinitPendingRef.current = false;

            onFlipbookReady?.(pageFlip);
            if (onPrevRef) onPrevRef.current = () => { isFlippingRef.current = true; pageFlip.flipPrev('bottom'); };
            if (onNextRef) onNextRef.current = () => { isFlippingRef.current = true; pageFlip.flipNext('bottom'); };

            // Draw the first frame before removing the loading cover so the canvas
            // is never blank when it becomes visible (prevents blank-page flash).
            requestAnimationFrame(() => {
              if (cancelled || !pageFlipRef.current) {
                log('RAF callback skipped: cancelled=', cancelled, 'pf=', !!pageFlipRef.current);
                return;
              }
              const render = pageFlip.getRender?.();
              log('RAF: calling render.update, render=', !!render);
              render?.update?.();
              setIsReady(true);
              log('RAF: setIsReady(true) — loading cover will hide');
            });
          }
        });

        log('PageFlip loadFromImages called, urlCount=', imageUrls.length);
        pageFlip.loadFromImages(imageUrls);

        // High-DPI canvas sharpness patch
        const ui = pageFlip.getUI?.();
        if (ui?.resizeCanvas && ui?.getCanvas) {
          const orig = ui.resizeCanvas.bind(ui);
          ui.resizeCanvas = function () {
            orig();
            const canvas = ui.getCanvas();
            const dpr    = Math.min(window.devicePixelRatio || 1, 3);
            if (dpr <= 1 || !canvas) return;
            const r = canvas.getBoundingClientRect();
            if (r.width <= 0 || r.height <= 0) return;
            canvas.width  = Math.floor(r.width  * dpr);
            canvas.height = Math.floor(r.height * dpr);
            canvas.style.width  = r.width  + 'px';
            canvas.style.height = r.height + 'px';
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          };
          ui.resizeCanvas();
        }

        pageFlipRef.current = pageFlip;
      } catch (err) {
        logErr('PageFlip init error:', err);
        if (!cancelled) {
          isReinitPendingRef.current = false; // Unblock on error so user can retry
          const msg = err?.message || 'Failed to initialize flipbook';
          setInitError(msg);
          onLoadStateChangeRef.current?.({ isLoading: false, error: msg, isReady: false });
        }
      }
    }

    // Brief delay lets the DOM settle after a resize / fullscreen transition
    const delay = reinitKey > 0 ? 100 : 250;
    const timer = setTimeout(init, delay);
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
  }, [imageUrls, reinitKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (pageFlipRef.current && isReady) {
      requestAnimationFrame(() => pageFlipRef.current?.getRender()?.update?.());
    }
  }, [dimensions, isReady]);

  // Sync external page navigation → PageFlip
  useEffect(() => {
    const pf    = pageFlipRef.current;
    const total = imageUrls.length;
    if (!pf || !isReady || currentPage < 1 || currentPage > total) return;
    if (lastReportedPageRef.current === currentPage) return;
    if (isFlippingRef.current) return;

    const target  = currentPage - 1;
    const current = pf.getCurrentPageIndex?.() ?? -1;
    if (current !== target) {
      log('sync turnToPage', target);
      lastReportedPageRef.current = currentPage;
      try { pf.turnToPage(target); pf.getRender()?.update?.(); } catch (_) {}
    }
  }, [currentPage, imageUrls.length, isReady]);

  useEffect(() => {
    onStateChange?.({ imageUrls, isWide: dimensions.isWide });
  }, [imageUrls, dimensions.isWide, onStateChange]);

  // ── Pan/drag handlers (only active when zoomed) ────────────────────────────
  const getPanBounds = useCallback(() => {
    const vp = viewportRef.current;
    const bookW = clipWidth;
    const bookH = dimensions.height;
    const scaledW = bookW * zoomLevel;
    const scaledH = bookH * zoomLevel;
    const maxX = Math.max(0, (scaledW - vp.width) / 2);
    const maxY = Math.max(0, (scaledH - vp.height) / 2);
    return { maxX, maxY };
  }, [clipWidth, dimensions.height, zoomLevel]);

  const clampPan = useCallback(
    (x, y) => {
      const { maxX, maxY } = getPanBounds();
      return {
        x: Math.max(-maxX, Math.min(maxX, x)),
        y: Math.max(-maxY, Math.min(maxY, y)),
      };
    },
    [getPanBounds],
  );

  const handlePointerDown = useCallback(
    (e) => {
      if (!isZoomed) return;
      e.preventDefault();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      dragStartRef.current = {
        x: clientX,
        y: clientY,
        panX: pan.x,
        panY: pan.y,
      };
      setIsDragging(true);
    },
    [isZoomed, pan.x, pan.y],
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const clientX = e.touches ? (e.touches[0]?.clientX ?? e.changedTouches?.[0]?.clientX) : e.clientX;
      const clientY = e.touches ? (e.touches[0]?.clientY ?? e.changedTouches?.[0]?.clientY) : e.clientY;
      if (clientX == null || clientY == null) return;
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      const next = clampPan(dragStartRef.current.panX + dx, dragStartRef.current.panY + dy);
      setPan(next);
    },
    [isDragging, clampPan],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e) => handlePointerMove(e);
    const up = () => handlePointerUp();
    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', up);
    document.addEventListener('touchcancel', up);
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
      document.removeEventListener('touchcancel', up);
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Clamp pan when zoom or dimensions change (bounds may have shrunk)
  useEffect(() => {
    if (!isZoomed) return;
    setPan((p) => clampPan(p.x, p.y));
  }, [zoomLevel, dimensions.width, dimensions.height, clipWidth, isZoomed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const hasContent = imageUrls.length > 0;
    onLoadStateChangeRef.current?.({ isLoading: !hasContent && !initError, error: initError, isReady, hasContent });
  }, [isReady, initError, imageUrls.length]);

  useEffect(() => () => {
    if (pageFlipRef.current) {
      try { pageFlipRef.current.destroy?.(); } catch (_) {}
      pageFlipRef.current = null;
    }
  }, []);

  // ── Error states ──────────────────────────────────────────────────────────
  if (initError && !imageUrls.length) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center p-8 rounded-2xl text-gray-700"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <p className="text-lg font-medium mb-2 text-gray-800">Failed to load flipbook</p>
        <p className="text-sm opacity-80">{initError}</p>
        <p className="text-xs mt-4 opacity-70">
          Add images to public/assets/pdf/pages/ and update manifest.json
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
            <img key={i} src={url} alt={`Page ${i + 1}`}
              className="w-full shadow-lg rounded"
              onError={(e) => logErr('Fallback img failed:', url, e)}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div
      ref={measureRef}
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ minHeight: 0 }}
    >
      {/*
        zoom-pan-wrapper
        ────────────────
        • Combines translate(pan) + scale(zoom)
        • When zoom > 1: grab cursor, capture pointer for drag (disables page flip)
        • When zoom === 1: normal cursor, events pass through to flip
      */}
      <div
        className="flex items-center justify-center"
        style={{
          transform:       `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition:      isDragging ? 'none' : 'transform 0.2s ease-out',
          cursor:          isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default',
          flexShrink:      0,
          zIndex:          1,
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        {/*
          book-outer
          ──────────
          • Holds page-stack decorations outside the clip wrapper
          • Width equals clipWidth (single page on cover, double on inner pages)
          • CSS transition on width so the book "opens up" after the cover flip
        */}
        <div
          className="book-outer"
          style={{
            position:       'relative',
            width:          clipWidth,
            height:         dimensions.height,
            flexShrink:     0,
            pointerEvents:  isZoomed ? 'none' : 'auto', // When zoomed, wrapper captures all events for pan; flip disabled
          }}
        >
        {/* Left page stack (pages already turned) */}
        {isWide && leftStackPx > 1 && (
          <div
            className="book-page-stack book-page-stack--left"
            style={{ height: dimensions.height - 6, width: leftStackPx }}
          />
        )}

        {/* Right page stack (pages remaining) */}
        {rightStackPx > 1 && (
          <div
            className="book-page-stack book-page-stack--right"
            style={{ height: dimensions.height - 6, width: rightStackPx }}
          />
        )}

        {/* Floor shadow */}
        <div className="book-floor-shadow" />

        {/*
          book-wrapper
          ────────────
          • overflow: hidden clips the empty left half of the canvas on the cover
          • drop-shadow renders outside the clip, giving the book its shadow
        */}
        <motion.div
          ref={wrapperRef}
          className={`book-wrapper${isCover ? ' book-wrapper--cover' : ''}`}
          style={{
            width:    '100%',
            height:   dimensions.height,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/*
            Canvas inner shifter
            ─────────────────────
            Shifts the full-width canvas left by one page-width when on cover,
            so the cover (right half of canvas) fills the wrapper exactly.
            Transitions to 0 when the book opens to inner pages.
          */}
          <div
            className="book-canvas-inner"
            style={{
              position: 'absolute',
              left:     canvasShift,
              width:    dimensions.totalWidth,
              height:   dimensions.height,
            }}
          >
            {/* key={reinitKey} forces React to remount a fresh div on reinit. Without it,
                PageFlip.destroy() can detach the container from the DOM, leaving
                containerRef pointing at a detached node — getBoundingClientRect() returns
                0x0 and the book renders blank. */}
            <div
              key={reinitKey}
              ref={containerRef}
              className="stf__container"
              style={{
                width:           dimensions.totalWidth,
                height:          dimensions.height,
                minWidth:        dimensions.width,
                minHeight:       dimensions.height,
                flexShrink:      0,
                position:        'relative',
                overflow:        'visible',
                display:         'block',
                backgroundColor: 'transparent',
              }}
            />
          </div>

          {/* Spine shadow — center crease when book is open */}
          {isWide && !isCover && isReady && totalPagesCount > 0 && (
            <div
              className="book-spine-overlay"
              style={{ left: dimensions.width }}
            />
          )}

          {/* Cover border frame — visible only on cover page */}
          {isCover && <div className="book-cover-frame" />}
        </motion.div>
      </div>
    </div>

      {/* Loading overlay — single cover image on transparent background */}
      {imageUrls.length > 0 && !isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-[2]">
          <img
            src={imageUrls[0]}
            alt="Cover"
            className="book-loading-cover"
            style={{ width: dimensions.width, height: dimensions.height }}
            onError={(e) => logErr('Cover overlay failed:', e)}
          />
        </div>
      )}
    </div>
  );
}
