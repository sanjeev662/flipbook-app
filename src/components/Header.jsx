/** Publuu-style icons — stroke-based, black; Share uses #3461c9 */
const IconThumbnails = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 462.4 463" fill="none" stroke="currentColor" strokeWidth="13">
    <rect x="20.3" y="8.6" width="174.3" height="186.9" rx="2" />
    <rect x="20.1" y="254.9" width="174.3" height="186.9" rx="2" />
    <rect x="266.5" y="254.9" width="174.3" height="186.9" rx="2" />
    <rect x="266.6" y="8.8" width="174.3" height="186.9" rx="2" />
  </svg>
);

const IconShare = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 462.4 463" fill="none" stroke="var(--flipbook-accent)" strokeWidth="40" strokeMiterlimit="10">
    <ellipse cx="379" cy="379.7" rx="61.7" ry="61.7" transform="rotate(-45 379 379.7)" />
    <circle cx="82.8" cy="231.5" r="61.7" />
    <ellipse cx="379" cy="83.4" rx="61.7" ry="61.7" transform="rotate(45 379 83.4)" />
    <line x1="138.1" y1="202" x2="327.4" y2="107.4" />
    <line x1="327.4" y1="355.6" x2="138.1" y2="261.1" />
  </svg>
);

const IconDownload = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 461.1 460.8" fill="none" stroke="currentColor" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20.8,341.8 20.8,440.1 440.4,440.1 440.4,341.8" />
    <line x1="230.6" y1="325.8" x2="230.6" y2="20.5" />
    <line x1="230.6" y1="325.8" x2="174.9" y2="270.1" />
    <line x1="230.6" y1="325.8" x2="286.3" y2="270.1" />
  </svg>
);

const IconPrint = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 58.9 64.1" fill="currentColor">
    <path d="M56.1,13.3H53.4V2.7A2.57,2.57,0,0,0,50.7,0H8.1A2.57,2.57,0,0,0,5.4,2.7V13.4H2.7A2.57,2.57,0,0,0,0,16.1V37.4a2.57,2.57,0,0,0,2.7,2.7H5.4V61.4a2.57,2.57,0,0,0,2.7,2.7H50.8a2.57,2.57,0,0,0,2.7-2.7V40h2.7a2.57,2.57,0,0,0,2.7-2.7V16A2.77,2.77,0,0,0,56.1,13.3Z" />
    <path d="M18.7,48H40a2.7,2.7,0,1,0,0-5.4H18.7A2.57,2.57,0,0,0,16,45.3,2.63,2.63,0,0,0,18.7,48Z" />
    <path d="M18.7,56H40a2.7,2.7,0,1,0,0-5.4H18.7A2.57,2.57,0,0,0,16,53.3,2.63,2.63,0,0,0,18.7,56Z" />
  </svg>
);

const IconZoom = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M62.6,52.1L47.9,37.3c-1.9-1.9-5.1-1.9-7,0l-2.4-2.4c6.4-8.3,5.9-20.6-1.9-28.3-4-4.3-9.4-6.4-15.2-6.4-5.6,0-11,2.1-15.2,6.4-8.3,8.3-8.3,21.9,0,30.2,4.3,4,9.6,6.1,15.2,6.1,4.8,0,9.4-1.6,13.1-4.5l2.4,2.4c-1.9,1.9-1.9,5.1,0,7l14.7,14.7c1.1,1.1,2.1,1.3,3.5,1.3s2.7-0.5,3.5-1.3l3.7-3.7C64.5,57.1,64.5,53.9,62.6,52.1Z" />
    <path d="M26.8,18.9h-2.7v-2.7c0-1.6-1.1-2.7-2.7-2.7-1.6,0-2.7,1.1-2.7,2.7v2.7h-2.7c-1.6,0-2.7,1.1-2.7,2.7s1.1,2.7,2.7,2.7h2.7v2.7c0,1.6,1.1,2.7,2.7,2.7s2.7-1.1,2.7-2.7v-2.7h2.7c1.6,0,2.7-1.1,2.7-2.7C29.5,20,28.4,18.9,26.8,18.9Z" />
  </svg>
);

const IconFullscreen = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M61.3,21.3c1.6,0,2.7-1.1,2.7-2.7v-16C64,1.1,62.9,0,61.3,0h-16c-1.6,0-2.7,1.1-2.7,2.7s1.1,2.7,2.7,2.7h9.6L32,28.3L9.1,5.3h9.6c1.6,0,2.7-1.1,2.7-2.7S20.3,0,18.7,0h-16C2.4,0,1.9,0,1.6,0.3C1.1,0.5,0.5,1.1,0.3,1.6C0,1.9,0,2.4,0,2.7v16c0,1.6,1.1,2.7,2.7,2.7s2.7-1.1,2.7-2.7V9.1L28.3,32L5.3,54.9v-9.6c0-1.6-1.1-2.7-2.7-2.7S0,43.7,0,45.3v16C0,62.9,1.1,64,2.7,64h16c1.6,0,2.7-1.1,2.7-2.7c0-1.6-1.1-2.7-2.7-2.7H9.1L32,35.7l22.9,22.9h-9.6c-1.6,0-2.7,1.1-2.7,2.7c0,1.6,1.1,2.7,2.7,2.7h16c1.6,0,2.7-1.1,2.7-2.7v-16c0-1.6-1.1-2.7-2.7-2.7c-1.6,0-2.7,1.1-2.7,2.7v9.6L35.7,32L58.7,9.1v9.6C58.7,20.3,59.7,21.3,61.3,21.3z" />
  </svg>
);

export default function Header({
  title = 'SpringBoot Interview Questions',
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
    'flex items-center justify-center rounded-md hover:opacity-80 active:scale-95 transition-all cursor-pointer touch-manipulation w-7 h-7 min-w-[28px] min-h-[28px] [color:var(--flipbook-icon-color)] [opacity:var(--flipbook-icon-opacity)] hover:opacity-100';

  return (
    <header id="header" className="flipbook-header flex items-center justify-between z-30 relative shrink-0">
      <div className="header__left">
        <h1 className="header__book-name" aria-label="Title" title="Title">
          {title}
        </h1>
      </div>

      <div className="header__center">
        <div className="header__icons">
        <button type="button" onClick={onThumbnail} className={iconBtn} aria-label="Thumbnails" title="Thumbnails">
          <IconThumbnails className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
        <button type="button" onClick={onShare} className={iconBtn + ' hidden md:flex'} aria-label="Share" title="Share">
          <IconShare className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
        <button type="button" onClick={onDownload} className={iconBtn + ' hidden md:flex'} aria-label="Download PDF" title="Download PDF">
          <IconDownload className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
        <button type="button" onClick={onPrint} className={iconBtn + ' hidden md:flex'} aria-label="Print" title="Print">
          <IconPrint className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>

        <div className="w-px h-4 md:h-5 mx-0.5 md:mx-1 hidden sm:block [background:var(--flipbook-text)] [opacity:0.15]" />

        <button
          type="button"
          onClick={onZoomOut}
          disabled={zoomLevel <= zoomMin}
          className={iconBtn + ' disabled:opacity-30 disabled:cursor-not-allowed'}
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 64 64">
            <path d="M62.6,52.1L47.9,37.3c-1.9-1.9-5.1-1.9-7,0l-2.4-2.4c6.4-8.3,5.9-20.6-1.9-28.3-4-4.3-9.4-6.4-15.2-6.4-5.6,0-11,2.1-15.2,6.4-8.3,8.3-8.3,21.9,0,30.2,4.3,4,9.6,6.1,15.2,6.1,4.8,0,9.4-1.6,13.1-4.5l2.4,2.4c-1.9,1.9-1.9,5.1,0,7l14.7,14.7c1.1,1.1,2.1,1.3,3.5,1.3s2.7-0.5,3.5-1.3l3.7-3.7C64.5,57.1,64.5,53.9,62.6,52.1Z" />
            <path d="M26.8,18.9H16.1c-1.6,0-2.7,1.1-2.7,2.7c0,1.6,1.1,2.7,2.7,2.7h10.7c1.6,0,2.7-1.1,2.7-2.7C29.4,20,28.4,18.9,26.8,18.9Z" />
          </svg>
        </button>
        <span className="text-[10px] sm:text-xs min-w-[28px] sm:min-w-[34px] text-center font-medium select-none tabular-nums [color:var(--flipbook-text-muted)]">
          {Math.round(zoomLevel * 100)}%
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          disabled={zoomLevel >= zoomMax}
          className={iconBtn + ' disabled:opacity-30 disabled:cursor-not-allowed'}
          aria-label="Zoom in"
          title="Zoom in"
        >
          <IconZoom className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>

        <div className="w-px h-4 md:h-5 mx-0.5 md:mx-1 [background:var(--flipbook-text)] [opacity:0.15]" />

        <button type="button" onClick={onFullscreen} className={iconBtn} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
          <IconFullscreen className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        </button>
        </div>
      </div>

      <div className="header__right absolute">
        <span className="text-[10px] sm:text-xs tracking-wide uppercase hidden sm:inline [color:var(--flipbook-text-muted)]">powered by</span>
        <span className="font-bold text-xs sm:text-sm [color:var(--flipbook-text)] ml-1">Flipbook</span>
      </div>

      <div className="header__border" aria-hidden="true" />
    </header>
  );
}
