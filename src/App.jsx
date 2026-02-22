import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import FlipBook from './components/FlipBook';
import Header from './components/Header';
import Footer from './components/Footer';
import ThumbnailModal from './components/ThumbnailModal';
import Loader from './components/Loader';
import { PUBLICATION_TITLE, getPageFromUrl, updateUrlForPage } from './config';

const ZOOM_MIN = 1;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

function App() {
  const [currentPage, setCurrentPage] = useState(() => getPageFromUrl());
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [isTwoPageSpread, setIsTwoPageSpread] = useState(true);
  const [toast, setToast] = useState(null);
  const pageFlipInstanceRef = useRef(null);
  const flipPrevRef = useRef(null);
  const flipNextRef = useRef(null);
  const toastTimerRef = useRef(null);
  const totalPagesRef = useRef(1);
  totalPagesRef.current = totalPages;

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2500);
  }, []);

  const handleFlipbookReady = useCallback((instance) => {
    pageFlipInstanceRef.current = instance;
    if (instance) {
      const count = instance.getPageCount?.() || 0;
      if (count > 1) setTotalPages(count);
    }
  }, []);

  // Used by slider and thumbnail — updates state; FlipBook's sync effect turns the page
  const handlePageChange = useCallback((page) => {
    const total = totalPagesRef.current || 1;
    const p = Math.max(1, Math.min(page, total));
    setCurrentPage(p);
  }, []);

  const handlePrev = useCallback(() => {
    const fn = flipPrevRef.current;
    if (fn) {
      try { fn(); } catch (_) { }
    } else {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
  }, []);

  const handleNext = useCallback(() => {
    const fn = flipNextRef.current;
    if (fn) {
      try { fn(); } catch (_) { }
    } else {
      setCurrentPage((p) => Math.min(totalPagesRef.current, p + 1));
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP));
  }, []);

  const handleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    } catch {
      showToast('Fullscreen not supported');
    }
  }, [showToast]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: PUBLICATION_TITLE,
          url: window.location.href,
          text: 'Check out this flipbook',
        });
        showToast('Shared!');
      } else {
        await navigator.clipboard?.writeText(window.location.href);
        showToast('Link copied to clipboard');
      }
    } catch {
      showToast('Could not share');
    }
  }, [showToast]);

  const handleDownload = useCallback(() => {
    showToast('No PDF available — flipbook uses images from manifest');
  }, [showToast]);

  const handlePrint = useCallback(() => {
    try {
      window.print?.();
    } catch {
      showToast('Print not available');
    }
  }, [showToast]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') {
        setShowThumbnails(false);
        if (document.fullscreenElement) handleFullscreen();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrev, handleNext, handleFullscreen]);

  const handleLoaded = useCallback(() => setIsLoading(false), []);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 15000);
    return () => clearTimeout(timer);
  }, []);

  // Sync URL with current page (Publuu-style: /page/32)
  const isInitialUrlSync = useRef(true);
  useEffect(() => {
    const push = !isInitialUrlSync.current;
    updateUrlForPage(currentPage, totalPages, push);
    isInitialUrlSync.current = false;
  }, [currentPage, totalPages]);

  // Handle browser back/forward
  useEffect(() => {
    const handler = () => {
      const page = getPageFromUrl();
      setCurrentPage(page);
      const pf = pageFlipInstanceRef.current;
      if (pf?.turnToPage) {
        const idx = Math.max(0, Math.min(page - 1, (pf.getPageCount?.() || 1) - 1));
        pf.turnToPage(idx);
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const handleFlipbookState = useCallback(({ imageUrls: urls, isWide }) => {
    setImageUrls(urls || []);
    setIsTwoPageSpread(!!isWide);
    if (urls?.length) setTotalPages(urls.length);
  }, []);

  const handleLoadStateChange = useCallback(({ error, isReady, hasContent }) => {
    if (isReady || error || hasContent) handleLoaded();
  }, [handleLoaded]);

  const handlePageChangeWithUrl = useCallback((page) => {
    setCurrentPage(page);
    updateUrlForPage(page, totalPagesRef.current, true);
  }, []);

  return (
    <motion.div
      className="h-screen flex flex-col overflow-hidden flipbook-app-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Loader isLoading={isLoading} />

      {toast && (
        <div className="fixed bottom-16 sm:bottom-20 left-1/2 z-[100] px-3 py-2 xs:px-4 xs:py-2.5 bg-gray-800/90 text-white text-xs sm:text-sm rounded-lg shadow-xl animate-fade-in max-w-[90vw] backdrop-blur-sm" style={{ transform: 'translateX(-50%)' }}>
          {toast}
        </div>
      )}

      {!isFullscreen && (
        <Header
          title={PUBLICATION_TITLE}
          onThumbnail={() => setShowThumbnails(true)}
          onShare={handleShare}
          onDownload={handleDownload}
          onPrint={handlePrint}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          zoomLevel={zoomLevel}
          zoomMin={ZOOM_MIN}
          zoomMax={ZOOM_MAX}
          onFullscreen={handleFullscreen}
          isFullscreen={isFullscreen}
        />
      )}

      {/* Exit fullscreen button — visible only when fullscreen */}
      {isFullscreen && (
        <button
          type="button"
          onClick={handleFullscreen}
          className="fixed top-2 right-2 z-50 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-700/60 text-white hover:bg-gray-700/80 active:scale-95 transition-all cursor-pointer backdrop-blur-sm"
          style={{ top: 'max(0.5rem, env(safe-area-inset-top))', right: 'max(0.5rem, env(safe-area-inset-right))' }}
          aria-label="Exit fullscreen"
          title="Exit fullscreen"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" viewBox="0 0 24 24">
            <path d="M9 9L4 4m0 0v4m0-4h4M15 9l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4M15 15l5 5m0 0v-4m0 4h-4" />
          </svg>
        </button>
      )}

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-0 min-w-0">
        <div className={`w-full h-full flex items-center justify-center relative ${isFullscreen ? 'px-4 sm:px-8' : 'px-2 xs:px-4 sm:px-8 md:px-12 lg:px-16'}`}>
          {/* Left nav arrow — Previous page, positioned left, points left */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center bg-transparent hover:opacity-70 active:scale-95 disabled:opacity-15 disabled:cursor-not-allowed transition-all cursor-pointer touch-manipulation"
            style={{ width: 52, height: 84 }}
            aria-label="Previous page"
          >
            <svg fill="none" stroke="currentColor" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={15.1181} viewBox="0 0 700 700" style={{ width: 42, height: 68, color: 'var(--flipbook-text)' }}>
              <g transform="translate(-19.843749,257.14192)">
                <path d="M218.5,95.1c63.7,93.1,127.5,186.3,191.2,279.4" />
                <path d="M218.5,95.1l191.2-279.8" />
              </g>
            </svg>
          </button>

          <FlipBook
            currentPage={currentPage}
            onPageChange={handlePageChangeWithUrl}
            zoomLevel={zoomLevel}
            onFlipbookReady={handleFlipbookReady}
            onLoadStateChange={handleLoadStateChange}
            onStateChange={handleFlipbookState}
            onPrevRef={flipPrevRef}
            onNextRef={flipNextRef}
          />

          {/* Right nav arrow — Next page, positioned right, points right */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center bg-transparent hover:opacity-70 active:scale-95 disabled:opacity-15 disabled:cursor-not-allowed transition-all cursor-pointer touch-manipulation"
            style={{ width: 52, height: 84 }}
            aria-label="Next page"
          >
            <svg fill="none" stroke="currentColor" strokeWidth={40} strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit={15.1181} viewBox="0 0 700 700" style={{ transform: 'scaleX(-1)', width: 42, height: 68, color: 'var(--flipbook-text)' }}>
              <g transform="translate(-19.843749,257.14192)">
                <path d="M218.5,95.1c63.7,93.1,127.5,186.3,191.2,279.4" />
                <path d="M218.5,95.1l191.2-279.8" />
              </g>
            </svg>
          </button>
        </div>
      </main>

      <Footer
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChangeWithUrl}
        onThumbnail={() => setShowThumbnails(true)}
        onFullscreen={handleFullscreen}
        isFullscreen={isFullscreen}
        isTwoPageSpread={isTwoPageSpread}
      />

      <ThumbnailModal
        isOpen={showThumbnails}
        onClose={() => setShowThumbnails(false)}
        imageUrls={imageUrls}
        currentPage={currentPage}
        onPageSelect={handlePageChangeWithUrl}
      />
    </motion.div>
  );
}

export default App;
