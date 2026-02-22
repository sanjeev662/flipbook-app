/**
 * Publuu-style footer: page range left, slider center, icons right — dark theme
 */
export default function Footer({
  currentPage,
  totalPages,
  onPageChange,
  onThumbnail,
  onFullscreen,
  isFullscreen,
  isTwoPageSpread = true,
}) {
  const startPage = isTwoPageSpread
    ? Math.max(1, Math.floor((currentPage - 1) / 2) * 2 + 1)
    : currentPage;
  const endPage = isTwoPageSpread ? Math.min(totalPages, startPage + 1) : currentPage;
  const pageRangeText =
    totalPages <= 1
      ? `1 / 1`
      : isTwoPageSpread && startPage !== endPage
        ? `${startPage}-${endPage} / ${totalPages}`
        : `${currentPage} / ${totalPages}`;

  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    const page = Math.max(1, Math.min(totalPages || 1, Math.round(value)));
    onPageChange?.(page);
  };

  const iconBtn =
    'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center rounded text-gray-600 hover:text-gray-800 hover:bg-black/5 active:scale-95 transition-all cursor-pointer touch-manipulation min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px]';

  return (
    <footer
      className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 min-h-[40px] sm:min-h-[44px] md:min-h-[48px] gap-1.5 sm:gap-2 md:gap-3 z-30 relative shrink-0"
      style={{
        background: isFullscreen ? 'transparent' : 'rgba(255, 255, 255, 0.55)',
        backdropFilter: isFullscreen ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: isFullscreen ? 'none' : 'blur(12px)',
        borderTop: isFullscreen ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
        paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0.375rem))',
      }}
    >
      {/* Page range left */}
      <div
        className="text-[10px] xs:text-[11px] sm:text-xs font-medium shrink-0 tabular-nums text-gray-700"
        style={{ minWidth: '52px' }}
      >
        {pageRangeText}
      </div>

      {/* Slider center */}
      <div className="flex-1 min-w-0 max-w-xs sm:max-w-md md:max-w-lg mx-1 sm:mx-2">
        <input
          type="range"
          min={1}
          max={Math.max(1, totalPages)}
          value={currentPage}
          onChange={handleSliderChange}
          disabled={!totalPages || totalPages <= 1}
          className="w-full light-slider"
          aria-label="Page slider"
        />
      </div>

      {/* Icons right */}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={onThumbnail}
          className={iconBtn}
          aria-label="Table of contents"
          title="Table of contents"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" viewBox="0 0 24 24">
            <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onFullscreen}
          className={iconBtn}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" viewBox="0 0 24 24">
              <path d="M9 9L4 4m0 0v4m0-4h4M15 9l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4M15 15l5 5m0 0v-4m0 4h-4" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" viewBox="0 0 24 24">
              <path d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>
    </footer>
  );
}
