import { LayoutGrid, Maximize, Minimize } from "lucide-react";

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
    'w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded text-gray-600 hover:text-gray-800 hover:bg-black/5 active:scale-95 transition-all cursor-pointer touch-manipulation min-w-[28px] min-h-[28px] sm:min-w-[32px] sm:min-h-[32px]';

  return (
    <footer
      className="flex items-center justify-between px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 lg:py-1 min-h-[28px] sm:min-h-[36px] lg:min-h-[40px] gap-1 sm:gap-1.5 lg:gap-2 z-30 relative shrink-0"
      style={{
        background: isFullscreen ? 'transparent' : 'rgba(255, 255, 255, 0.55)',
        backdropFilter: isFullscreen ? 'none' : 'blur(12px)',
        WebkitBackdropFilter: isFullscreen ? 'none' : 'blur(12px)',
        borderTop: isFullscreen ? 'none' : '1px solid rgba(0, 0, 0, 0.06)',
        paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom, 0.25rem))',
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
      <div className="flex-1 min-w-0 max-w-xs sm:max-w-md lg:max-w-lg mx-1 sm:mx-2">
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
          <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={onFullscreen}
          className={iconBtn}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          ) : (
            <Maximize className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
          )}
        </button>
      </div>
    </footer>
  );
}
