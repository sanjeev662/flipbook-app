import { useState, useEffect } from 'react';

/**
 * Publuu-style footer: footer__left (page input), footer__center (Ranger), footer__right (fullscreen)
 * Matches reference: input + "/ 76" left | current [slider] total center | fullscreen right
 */
export default function Footer({
  currentPage,
  totalPages,
  onPageChange,
  onFullscreen,
  isFullscreen,
}) {
  const [inputValue, setInputValue] = useState(String(currentPage));

  useEffect(() => {
    setInputValue(String(currentPage));
  }, [currentPage]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value.replace(/\D/g, ''));
  };

  const handleInputBlur = () => {
    const n = parseInt(inputValue, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= totalPages) {
      onPageChange?.(n);
    } else {
      setInputValue(String(currentPage));
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') handleInputBlur();
  };

  const handleSliderChange = (e) => {
    const page = Math.max(1, Math.min(totalPages || 1, Math.round(Number(e.target.value))));
    onPageChange?.(page);
  };

  const iconBtn =
    'inline path flex items-center justify-center rounded w-7 h-7 min-w-[28px] min-h-[28px] hover:opacity-80 active:scale-95 transition-all cursor-pointer [color:var(--flipbook-icon-color)] [opacity:var(--flipbook-icon-opacity)]';

  const fullscreenSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '100%', height: '100%' }}>
      <path d="M61.3,21.3c1.6,0,2.7-1.1,2.7-2.7v-16C64,1.1,62.9,0,61.3,0h-16c-1.6,0-2.7,1.1-2.7,2.7s1.1,2.7,2.7,2.7h9.6L32,28.3L9.1,5.3h9.6c1.6,0,2.7-1.1,2.7-2.7S20.3,0,18.7,0h-16C2.4,0,1.9,0,1.6,0.3C1.1,0.5,0.5,1.1,0.3,1.6C0,1.9,0,2.4,0,2.7v16c0,1.6,1.1,2.7,2.7,2.7s2.7-1.1,2.7-2.7V9.1L28.3,32L5.3,54.9v-9.6c0-1.6-1.1-2.7-2.7-2.7S0,43.7,0,45.3v16C0,62.9,1.1,64,2.7,64h16c1.6,0,2.7-1.1,2.7-2.7c0-1.6-1.1-2.7-2.7-2.7H9.1L32,35.7l22.9,22.9h-9.6c-1.6,0-2.7,1.1-2.7,2.7c0,1.6,1.1,2.7,2.7,2.7h16c1.6,0,2.7-1.1,2.7-2.7v-16c0-1.6-1.1-2.7-2.7-2.7c-1.6,0-2.7,1.1-2.7,2.7v9.6L35.7,32L58.7,9.1v9.6C58.7,20.3,59.7,21.3,61.3,21.3z" />
    </svg>
  );

  return (
    <footer
      id="footer"
      className="flipbook-footer flex justify-between items-center z-30 relative shrink-0"
      style={{ paddingBottom: 'max(0.375rem, env(safe-area-inset-bottom, 0.375rem))' }}
    >
      <div className="footer__left">
        <div className="footer__page-num" aria-label="Page Number" title="Page Number">
          <input
            type="text"
            className="page-num-input tabular-nums"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            aria-label="Page Number"
            title="Page Number"
          />
          <span>/&nbsp;{totalPages}</span>
        </div>
      </div>

      <div className="footer__center">
        <div className="Ranger__container light">
          <div className="Ranger_page-num current-page-num">{currentPage}</div>
          <div className="Ranger Book__pagesRanger flex-1 min-w-0">
            <input
              type="range"
              id="pageranger"
              aria-label="Page Slider"
              className="slider light light-slider light-slider-publuu w-full"
              min={1}
              max={Math.max(1, totalPages)}
              value={currentPage}
              onChange={handleSliderChange}
              disabled={!totalPages || totalPages <= 1}
              style={{
                '--slider-progress': totalPages > 1
                  ? `${((currentPage - 1) / (totalPages - 1)) * 100}%`
                  : '0%',
              }}
            />
          </div>
          <div className="Ranger_page-num total-pages-num">{totalPages}</div>
        </div>
      </div>

      <div className="footer__right">
        <div className="footer__icons">
          <button
            type="button"
            className={`Book__navFullScreen ${iconBtn}`}
            onClick={onFullscreen}
            name="Fullscreen"
            aria-label="Fullscreen"
            title="Fullscreen"
          >
            {fullscreenSvg}
          </button>
        </div>
      </div>

      <div className="footer__border" aria-hidden="true" />
    </footer>
  );
}
