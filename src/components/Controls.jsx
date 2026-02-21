import { motion } from 'framer-motion';
import { getThemeById } from '../themes/themes';

/**
 * Floating bottom control bar with navigation, zoom, fullscreen.
 * Glassmorphism design with premium animations.
 */
export default function Controls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onZoomIn,
  onZoomOut,
  onFullscreen,
  isFullscreen,
  themeId,
  zoomLevel = 1,
}) {
  const theme = getThemeById(themeId);
  const styles = theme?.styles || {};

  const buttonClass =
    'p-2.5 rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed';
  const iconClass = 'w-5 h-5';

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-3 rounded-[20px] flex items-center gap-2 sm:gap-4"
      style={{
        background: styles.controlsBg || 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${styles.controlsBorder || 'rgba(148,163,184,0.3)'}`,
        boxShadow: styles.shadow || '0 4px 6px -1px rgba(0,0,0,0.1)',
      }}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: 0.2 }}
    >
      {/* Previous */}
      <motion.button
        onClick={onPrev}
        disabled={currentPage <= 1}
        className={buttonClass}
        style={{ color: styles.primary || '#2563eb' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Previous page"
      >
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </motion.button>

      {/* Page indicator */}
      <div
        className="px-4 py-1.5 rounded-lg text-sm font-medium min-w-[100px] text-center"
        style={{ color: styles.text || '#1e293b' }}
      >
        Page {currentPage} of {totalPages}
      </div>

      {/* Next */}
      <motion.button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        className={buttonClass}
        style={{ color: styles.primary || '#2563eb' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Next page"
      >
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </motion.button>

      <div className="w-px h-6 bg-gray-300/50" />

      {/* Zoom out */}
      <motion.button
        onClick={onZoomOut}
        disabled={zoomLevel <= 1}
        className={buttonClass}
        style={{ color: styles.primary || '#2563eb' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Zoom out"
      >
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </motion.button>

      {/* Zoom level display */}
      <span
        className="text-xs font-medium min-w-[36px] text-center"
        style={{ color: styles.textMuted || '#64748b' }}
      >
        {Math.round(zoomLevel * 100)}%
      </span>

      {/* Zoom in */}
      <motion.button
        onClick={onZoomIn}
        disabled={zoomLevel >= 2.5}
        className={buttonClass}
        style={{ color: styles.primary || '#2563eb' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Zoom in"
      >
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </motion.button>

      <div className="w-px h-6 bg-gray-300/50" />

      {/* Fullscreen */}
      <motion.button
        onClick={onFullscreen}
        className={buttonClass}
        style={{ color: styles.primary || '#2563eb' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        )}
      </motion.button>
    </motion.div>
  );
}
