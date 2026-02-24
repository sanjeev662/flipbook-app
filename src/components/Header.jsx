import React from "react";
import {
  BookOpen,
  LayoutGrid,
  Share2,
  Download,
  Printer,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Loader2,
} from "lucide-react";

export default function Header({
  title = "Gold Silver News January 2026",
  onThumbnail,
  onShare,
  onDownload,
  onPrint,
  isDownloading = false,
  isPrinting = false,
  hasPages = true,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  soundEnabled = true,
  onSoundToggle,
  zoomLevel = 1,
  zoomMin = 1,
  zoomMax = 3,
  onFullscreen,
  isFullscreen,
}) {
  // Desktop button — sharp corners (box-style), minimal border
  const iconBtnDesktop =
    "w-8 h-8 flex items-center justify-center rounded-none text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer touch-manipulation min-w-[32px] min-h-[32px] border border-gray-200/60";

  // Compact button (mobile/tablet)
  const iconBtnCompact =
    "w-7 h-7 flex items-center justify-center rounded-none text-gray-600 hover:bg-gray-100 active:scale-95 transition-all cursor-pointer touch-manipulation min-w-[28px] min-h-[28px] border border-gray-200/60";

  return (
    <header
      className="
        relative z-30 shrink-0 border-b
        px-2 sm:px-4 lg:px-6
        py-1 sm:py-1 lg:py-1.5
        min-h-[32px] sm:min-h-[40px] lg:min-h-[44px]
      "
      style={{
        background: "rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="flex flex-col gap-1 lg:hidden">
        <div className="flex items-center gap-2 min-w-0 w-full">
          {/* Left: Book + Title */}
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen
              className="w-5 h-5 text-gray-600 shrink-0"
              strokeWidth={2}
            />

            <h1 className="text-base sm:text-base font-bold text-gray-600 truncate leading-tight max-w-[65vw]">
              {title}
            </h1>
          </div>

          {/* Right: Powered By */}
          <div className="flex items-center gap-1 select-none shrink-0 ml-auto">
            {/* <span className="text-[9px] sm:text-[10px] tracking-widest text-gray-500 uppercase font-medium">
              POWERED BY
            </span>
            <span
              className="font-bold tracking-tight text-xs sm:text-sm"
              style={{ color: "#1e3a5f" }}
            >
              Flipbook
            </span> */}
          </div>
        </div>
        <div className="w-full flex justify-center">
          <div className="flex flex-nowrap items-center justify-center gap-0.2 sm:gap-0.5 overflow-hidden">
            <button
              type="button"
              onClick={onThumbnail}
              className={iconBtnCompact}
              aria-label="Table of contents"
              title="Table of contents"
            >
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={onShare}
              className={iconBtnCompact}
              aria-label="Share"
              title="Share"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            </button>

            <button
              type="button"
              onClick={onDownload}
              disabled={isDownloading || !hasPages}
              className={`${iconBtnCompact} disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Download PDF"
              title="Download PDF"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin pdf-btn-spinner" strokeWidth={2} />
              ) : (
                <Download className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              )}
            </button>

            {onSoundToggle && (
              <button
                type="button"
                onClick={onSoundToggle}
                className={`${iconBtnCompact} ${!soundEnabled ? 'opacity-50' : ''}`}
                aria-label={soundEnabled ? 'Page flip sound on' : 'Page flip sound off'}
                title={soundEnabled ? 'Page flip sound on (click to turn off)' : 'Page flip sound off (click to turn on)'}
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                ) : (
                  <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onPrint}
              disabled={isPrinting || !hasPages}
              className={`${iconBtnCompact} disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label="Print"
              title="Print"
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin pdf-btn-spinner" strokeWidth={2} />
              ) : (
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              )}
            </button>

            <div className="w-px h-4 bg-gray-200 mx-0.5 hidden sm:block" />

            <button
              type="button"
              onClick={onZoomOut}
              disabled={zoomLevel <= zoomMin}
              className={
                iconBtnCompact +
                " disabled:opacity-30 disabled:cursor-not-allowed"
              }
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            </button>

            <span className="text-[10px] sm:text-xs text-gray-600 min-w-[34px] sm:min-w-[40px] text-center font-medium select-none tabular-nums">
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              type="button"
              onClick={onZoomIn}
              disabled={zoomLevel >= zoomMax}
              className={
                iconBtnCompact +
                " disabled:opacity-30 disabled:cursor-not-allowed"
              }
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
            </button>

            {onResetZoom && (
              <button
                type="button"
                onClick={onResetZoom}
                className={iconBtnCompact}
                aria-label="Reset zoom"
                title="Reset zoom to 100%"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              </button>
            )}

            <div className="w-px h-4 bg-gray-200 mx-0.5 hidden sm:block" />

            <button
              type="button"
              onClick={onFullscreen}
              className={iconBtnCompact + " hidden sm:flex"}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              ) : (
                <Maximize className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
        {/* Left: Title */}
        <div className="flex items-center gap-2 justify-self-start min-w-0">
          <BookOpen
            className="w-7 h-7 text-gray-600 shrink-0"
            strokeWidth={2}
          />
          <h1 className="text-base font-bold text-gray-600 truncate leading-tight">
            {title}
          </h1>
        </div>

        {/* Center: Toolbar */}
        <div className="flex items-center gap-0.2 justify-self-center">
          <button
            type="button"
            onClick={onThumbnail}
            className={iconBtnDesktop}
            aria-label="Table of contents"
            title="Table of contents"
          >
            <LayoutGrid className="w-5 h-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onShare}
            className={iconBtnDesktop}
            aria-label="Share"
            title="Share"
          >
            <Share2 className="w-5 h-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={isDownloading || !hasPages}
            className={`${iconBtnDesktop} disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Download PDF"
            title="Download PDF"
          >
            {isDownloading ? (
              <Loader2 className="w-5 h-5 animate-spin pdf-btn-spinner" strokeWidth={2} />
            ) : (
              <Download className="w-5 h-5" strokeWidth={2} />
            )}
          </button>
          {onSoundToggle && (
            <button
              type="button"
              onClick={onSoundToggle}
              className={`${iconBtnDesktop} ${!soundEnabled ? 'opacity-50' : ''}`}
              aria-label={soundEnabled ? 'Page flip sound on' : 'Page flip sound off'}
              title={soundEnabled ? 'Page flip sound on (click to turn off)' : 'Page flip sound off (click to turn on)'}
            >
              {soundEnabled ? (
                <Volume2 className="w-5 h-5" strokeWidth={2} />
              ) : (
                <VolumeX className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onPrint}
            disabled={isPrinting || !hasPages}
            className={`${iconBtnDesktop} disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label="Print"
            title="Print"
          >
            {isPrinting ? (
              <Loader2 className="w-5 h-5 animate-spin pdf-btn-spinner" strokeWidth={2} />
            ) : (
              <Printer className="w-5 h-5" strokeWidth={2} />
            )}
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            type="button"
            onClick={onZoomOut}
            disabled={zoomLevel <= zoomMin}
            className={
              iconBtnDesktop +
              " disabled:opacity-30 disabled:cursor-not-allowed"
            }
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut className="w-5 h-5" strokeWidth={2} />
          </button>

          <span className="text-xs text-gray-600 min-w-[40px] text-center font-medium select-none tabular-nums">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            type="button"
            onClick={onZoomIn}
            disabled={zoomLevel >= zoomMax}
            className={
              iconBtnDesktop +
              " disabled:opacity-30 disabled:cursor-not-allowed"
            }
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn className="w-5 h-5" strokeWidth={2} />
          </button>

          {onResetZoom && (
            <button
              type="button"
              onClick={onResetZoom}
              className={iconBtnDesktop}
              aria-label="Reset zoom"
              title="Reset zoom to 100%"
            >
              <RotateCcw className="w-5 h-5" strokeWidth={2} />
            </button>
          )}

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            type="button"
            onClick={onFullscreen}
            className={iconBtnDesktop}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" strokeWidth={2} />
            ) : (
              <Maximize className="w-5 h-5" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Right: Branding */}
        <div className="flex items-center gap-1 justify-self-end select-none shrink-0">
          {/* <span className="text-[10px] tracking-widest text-gray-500 uppercase font-medium">
            POWERED BY
          </span>
          <span
            className="font-bold tracking-tight text-base"
            style={{ color: "#1e3a5f" }}
          >
            Flipbook
          </span> */}
        </div>
      </div>
    </header>
  );
}
