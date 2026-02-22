import { motion, AnimatePresence } from 'framer-motion';

/**
 * Publuu-style thumbnail grid modal for page navigation
 */
export default function ThumbnailModal({ isOpen, onClose, imageUrls = [], currentPage, onPageSelect }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm cursor-pointer"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 z-[70] flex flex-col rounded-xl shadow-2xl overflow-hidden"
            style={{ background: 'var(--flipbook-bg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 [border-color:rgba(0,0,0,0.1)]">
              <h2 className="text-lg font-semibold [color:var(--flipbook-text)]">Thumbnails</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:opacity-80 active:scale-95 transition-all [color:var(--flipbook-text-muted)]"
                aria-label="Close"
              >
                <svg className="w-5 h-5" viewBox="12.5 12.5 60.1 60.1" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.3,21.3C9.5,33,9.5,52,21.3,63.8s30.8,11.7,42.5,0s11.7-30.8,0-42.5S33,9.5,21.3,21.3z M56.6,28.4c1,1,1,2.6,0,3.6L46.1,42.5L56.6,53c1,1,1,2.6,0,3.6l0,0c-1,1-2.6,1-3.6,0L42.5,46.1L32,56.6c-1,1-2.6,1-3.6,0l0,0c-1-1-1-2.6,0-3.6l10.5-10.5L28.4,32c-1-1-1-2.6,0-3.6l0,0c1-1,2.6-1,3.6,0l10.5,10.5L53,28.4C54,27.4,55.6,27.4,56.6,28.4L56.6,28.4z" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 min-h-0">
              {!imageUrls.length ? (
                <div className="flex flex-col items-center justify-center py-16 [color:var(--flipbook-text-muted)]">
                  <div className="w-12 h-12 border-4 rounded-full animate-spin mb-4 [border-color:rgba(0,0,0,0.1)] [border-top-color:var(--flipbook-accent)]" />
                  <p>Loading pages...</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {imageUrls.map((url, i) => {
                    const pageNum = i + 1;
                    const isActive = currentPage === pageNum;
                    return (
                      <button
                        type="button"
                        key={i}
                        onClick={() => {
                          onPageSelect?.(pageNum);
                          onClose?.();
                        }}
                        className={`relative rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--flipbook-accent)] focus:ring-offset-2 ${
                          isActive ? '[border-color:var(--flipbook-text)] shadow-lg ring-2 ring-[var(--flipbook-accent)] ring-offset-2' : '[border-color:rgba(0,0,0,0.15)] hover:[border-color:var(--flipbook-text-muted)]'
                        }`}
                      >
                        <img src={url} alt={`Page ${pageNum}`} className="w-full aspect-[612/792] object-cover pointer-events-none" />
                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center font-medium">
                          {pageNum}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
