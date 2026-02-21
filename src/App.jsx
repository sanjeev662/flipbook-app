import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import FlipBook from './components/FlipBook';
import Header from './components/Header';
import Footer from './components/Footer';
import ThumbnailModal from './components/ThumbnailModal';
import Loader from './components/Loader';
import { PUBLICATION_TITLE, PDF_URL, getPageFromUrl, updateUrlForPage } from './config';

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
      try { fn(); } catch (_) {}
    } else {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
  }, []);

  const handleNext = useCallback(() => {
    const fn = flipNextRef.current;
    if (fn) {
      try { fn(); } catch (_) {}
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
    try {
      const a = document.createElement('a');
      a.href = PDF_URL;
      a.download = 'flipbook.pdf';
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('Download started');
    } catch {
      window.open(PDF_URL, '_blank');
    }
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
      else if (e.key === 'Escape') setShowThumbnails(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrev, handleNext]);

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
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#2d2d2d' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Loader isLoading={isLoading} />

      {toast && (
        <div className="fixed bottom-16 sm:bottom-20 left-1/2 z-[100] px-3 py-2 xs:px-4 xs:py-2.5 bg-gray-900 text-white text-xs sm:text-sm rounded-lg shadow-xl animate-fade-in max-w-[90vw]" style={{ transform: 'translateX(-50%)' }}>
          {toast}
        </div>
      )}

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

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden min-h-0 min-w-0">
        <div className="w-full h-full flex items-center justify-center relative px-8 xs:px-10 sm:px-12 md:px-14 lg:px-16">
          {/* Left nav arrow */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage <= 1}
            className="absolute left-1 xs:left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer touch-manipulation backdrop-blur-sm min-w-[44px] min-h-[44px]"
            aria-label="Previous page"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
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

          {/* Right nav arrow */}
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="absolute right-1 xs:right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer touch-manipulation backdrop-blur-sm min-w-[44px] min-h-[44px]"
            aria-label="Next page"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
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
