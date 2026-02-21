/**
 * Flipbook configuration - customize for your publication
 */
export const PUBLICATION_TITLE = 'Gold Silver News January 2026';
export const PDF_URL = '/assets/pdf/sample.pdf';

const getBase = () => {
  const b = import.meta.env.BASE_URL || '/';
  return b.endsWith('/') ? b : `${b}/`;
};

/** Get current page from URL path (e.g. /page/5 or /flipbook/page/5) */
export function getPageFromUrl() {
  const match = window.location.pathname.match(/\/page\/(\d+)/);
  return match ? Math.max(1, parseInt(match[1], 10)) : 1;
}

/** Update URL to reflect current page (Publuu-style: /page/32) */
export function updateUrlForPage(page, totalPages = 1, push = false) {
  const base = getBase();
  const safePage = Math.max(1, Math.min(page, totalPages));
  const basePath = base === '/' ? '' : base.replace(/\/$/, '');
  const path = safePage === 1 ? basePath || '/' : `${basePath}/page/${safePage}`;
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${window.location.origin}${fullPath}`;
  if (window.location.href !== url) {
    if (push) {
      window.history.pushState({ page: safePage }, '', fullPath);
    } else {
      window.history.replaceState({ page: safePage }, '', fullPath);
    }
  }
}
