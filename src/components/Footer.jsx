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
    'w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded text-white/60 hover:text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer touch-manipulation min-w-[44px] min-h-[44px]';

  return (
    <footer
      className="flex items-center justify-between px-3 xs:px-4 sm:px-6 py-2 sm:py-2.5 min-h-[44px] sm:min-h-[48px] gap-2 sm:gap-3 z-30 relative"
      style={{ background: '#1e1e1e', borderTop: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Page range left */}
      <div
        className="text-[11px] xs:text-xs font-medium shrink-0 tabular-nums"
        style={{ color: 'rgba(255,255,255,0.75)', minWidth: '64px' }}
      >
        {pageRangeText}
      </div>

      {/* Slider center - onInput for immediate feedback during drag */}
      <div className="flex-1 min-w-0 max-w-md sm:max-w-lg mx-1 sm:mx-2">
        <input
          type="range"
          min={1}
          max={Math.max(1, totalPages)}
          value={currentPage}
          onChange={handleSliderChange}
          disabled={!totalPages || totalPages <= 1}
          className="w-full dark-slider"
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
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0v4m0-4h4M15 9l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4M15 15l5 5m0 0v-4m0 4h-4" />
            </svg>
          ) : (
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          )}
        </button>
      </div>
    </footer>
  );
}
