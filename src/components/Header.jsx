/**
 * Publuu-style header: title left, icon toolbar center, branding right
 */
export default function Header({
  title = 'Flipbook',
  onThumbnail,
  onShare,
  onDownload,
  onPrint,
  onZoomIn,
  onZoomOut,
  zoomLevel = 1,
  zoomMin = 1,
  zoomMax = 2.5,
  onFullscreen,
  isFullscreen,
}) {
  const iconBtn =
    'w-8 h-8 xs:w-9 xs:h-9 flex items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-800 active:scale-95 transition-all cursor-pointer touch-manipulation min-w-[36px] min-h-[36px]';

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-1 sm:gap-2 px-3 xs:px-4 sm:px-6 py-2 sm:py-2.5 border-b border-gray-200 bg-white min-h-[44px] sm:min-h-[50px] z-30 relative">
      {/* Title left */}
      <h1 className="text-[11px] xs:text-xs sm:text-sm font-medium text-gray-700 truncate justify-self-start leading-tight max-w-[120px] xs:max-w-[160px] sm:max-w-none">
        {title}
      </h1>

      {/* Icon toolbar center */}
      <div className="flex items-center gap-0.5 justify-self-center">
        {/* Thumbnails / grid */}
        <button type="button" onClick={onThumbnail} className={iconBtn} aria-label="Table of contents" title="Table of contents">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>

        {/* Share */}
        <button type="button" onClick={onShare} className={iconBtn} aria-label="Share" title="Share">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        {/* Download */}
        <button type="button" onClick={onDownload} className={iconBtn} aria-label="Download PDF" title="Download PDF">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>

        {/* Audio / Sound */}
        <button type="button" className={iconBtn} aria-label="Audio" title="Audio" onClick={() => {}}>
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9.172 9.172a4 4 0 000 5.656" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H2v6h4l5 4V5z" />
          </svg>
        </button>

        {/* Print */}
        <button type="button" onClick={onPrint} className={iconBtn} aria-label="Print" title="Print">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Zoom out */}
        <button
          type="button"
          onClick={onZoomOut}
          disabled={zoomLevel <= zoomMin}
          className={iconBtn + ' disabled:opacity-30 disabled:cursor-not-allowed'}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
          </svg>
        </button>

        {/* Zoom % */}
        <span className="text-xs text-gray-400 min-w-[34px] text-center font-medium select-none tabular-nums">
          {Math.round(zoomLevel * 100)}%
        </span>

        {/* Zoom in */}
        <button
          type="button"
          onClick={onZoomIn}
          disabled={zoomLevel >= zoomMax}
          className={iconBtn + ' disabled:opacity-30 disabled:cursor-not-allowed'}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-200 mx-1" />

        {/* Fullscreen */}
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

      {/* Branding right — "POWERED BY publuu" */}
      <div className="flex items-center gap-1 sm:gap-1.5 justify-self-end select-none shrink-0">
        <span className="text-[9px] xs:text-[10px] tracking-widest text-gray-400 uppercase font-medium hidden sm:inline">
          POWERED BY
        </span>
        <span
          className="font-bold text-gray-800 tracking-tight"
          style={{ fontFamily: "'Georgia', serif", fontSize: '13px', letterSpacing: '-0.5px' }}
        >
          pub<span style={{ color: '#e05c1a' }}>l</span>uu
        </span>
      </div>
    </header>
  );
}
