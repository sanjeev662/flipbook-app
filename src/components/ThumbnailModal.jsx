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
            className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 z-[70] flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-semibold text-gray-800">Table of Contents</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 active:scale-95 transition-all"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 min-h-0">
              {!imageUrls.length ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-500 rounded-full animate-spin mb-4" />
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
                        className={`relative rounded-lg overflow-hidden border-2 transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                          isActive ? 'border-gray-700 shadow-lg ring-2 ring-gray-400 ring-offset-2' : 'border-gray-200 hover:border-gray-400'
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
