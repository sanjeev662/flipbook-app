/**
 * Generates a PDF from an array of image URLs.
 * One image per page, correct order, maintains aspect ratio.
 */
import { jsPDF } from 'jspdf';

const MARGIN_PT = 0;

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function loadImageDimensions(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Load an image as base64 data URL and get its dimensions.
 * Falls back to fetch if Image fails (e.g. CORS).
 */
async function loadImageData(url) {
  try {
    const [dataUrl, dims] = await Promise.all([
      fetch(url).then((r) => r.blob()).then(blobToDataUrl),
      loadImageDimensions(url).catch(() => null),
    ]);

    if (!dims) {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });
      return { dataUrl, width: img.naturalWidth, height: img.naturalHeight };
    }
    return { dataUrl, width: dims.width, height: dims.height };
  } catch (err) {
    throw new Error(`Failed to load image: ${url.slice(-40)}`);
  }
}

/**
 * Generate a PDF from image URLs.
 * @param {string[]} imageUrls - Array of image URLs in page order (1, 2, 3...)
 * @param {string} [filename='flipbook-document.pdf'] - Download filename
 * @returns {Promise<Blob>} - PDF blob
 */
export async function generatePdfFromImages(imageUrls, filename = 'flipbook-document.pdf') {
  if (!imageUrls?.length) {
    throw new Error('No pages available');
  }

  const loaded = await Promise.all(
    imageUrls.map((url, i) =>
      loadImageData(url).then((data) => ({ ...data, index: i })).catch((err) => {
        throw new Error(`Page ${i + 1}: ${err.message}`);
      }),
    ),
  );

  const first = loaded[0];
  const format = [first.width + MARGIN_PT * 2, first.height + MARGIN_PT * 2];
  const pdf = new jsPDF({
    orientation: first.width > first.height ? 'landscape' : 'portrait',
    unit: 'px',
    format,
    compress: true,
  });

  const formatStr = loaded.some((p) => p.width !== first.width || p.height !== first.height)
    ? null
    : format;

  const yieldToMain = () =>
    new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  for (let i = 0; i < loaded.length; i++) {
    const { dataUrl, width, height } = loaded[i];
    if (i > 0) {
      pdf.addPage(formatStr || [width + MARGIN_PT * 2, height + MARGIN_PT * 2], formatStr ? undefined : (width > height ? 'landscape' : 'portrait'));
    }
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW - MARGIN_PT * 2;
    const imgH = pageH - MARGIN_PT * 2;
    const scale = Math.min(imgW / width, imgH / height);
    const w = width * scale;
    const h = height * scale;
    const x = MARGIN_PT + (imgW - w) / 2;
    const y = MARGIN_PT + (imgH - h) / 2;

    const fmt = dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG';
    pdf.addImage(dataUrl, fmt, x, y, w, h, undefined, 'FAST');

    await yieldToMain();
  }

  await yieldToMain();
  return pdf.output('blob');
}

/**
 * Trigger download of a PDF blob.
 */
export function downloadPdfBlob(blob, filename = 'flipbook-document.pdf') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Open PDF and trigger print dialog.
 * Uses hidden iframe for reliable cross-browser behavior.
 */
export function printPdfBlob(blob) {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:none;visibility:hidden;';
  document.body.appendChild(iframe);
  iframe.src = url;
  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (_) {
        window.open(url, '_blank')?.print();
      }
      const cleanup = () => {
        document.body.removeChild(iframe);
        URL.revokeObjectURL(url);
      };
      iframe.contentWindow?.addEventListener('afterprint', cleanup, { once: true });
      setTimeout(cleanup, 1000);
    }, 300);
  };
}
