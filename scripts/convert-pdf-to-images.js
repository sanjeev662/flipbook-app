/**
 * Converts PDF pages to PNG images at build time.
 * Skips conversion if images already exist and PDF hasn't changed.
 * Run: node scripts/convert-pdf-to-images.js [--force]
 * Output: public/assets/pdf/pages/page-1.png, page-2.png, ...
 *         public/assets/pdf/manifest.json
 */
import { writeFileSync, mkdirSync, existsSync, statSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pdf } from 'pdf-to-img';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PDF_PATH = join(__dirname, '../public/assets/pdf/sample.pdf');
const OUTPUT_DIR = join(__dirname, '../public/assets/pdf/pages');
const MANIFEST_PATH = join(__dirname, '../public/assets/pdf/manifest.json');
const SCALE = 3; // Higher scale = better quality on retina/high-DPI displays

const forceFlag = process.argv.includes('--force');

function shouldSkipConversion() {
  if (forceFlag) return false;
  if (!existsSync(MANIFEST_PATH)) return false;

  try {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    const pages = manifest.pages || [];
    if (pages.length === 0) return false;

    const pdfMtime = statSync(PDF_PATH).mtimeMs;
    let newestImageMtime = 0;

    for (const filename of pages) {
      const filepath = join(OUTPUT_DIR, filename);
      if (!existsSync(filepath)) return false;
      newestImageMtime = Math.max(newestImageMtime, statSync(filepath).mtimeMs);
    }

    // Skip if PDF is older than or same as newest image (no changes)
    if (pdfMtime <= newestImageMtime) {
      console.log('Page images already exist and PDF unchanged. Skipping conversion.');
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

async function convertPdfToImages() {
  if (!existsSync(PDF_PATH)) {
    console.error(`PDF not found at ${PDF_PATH}`);
    console.log('Run "npm run generate-pdf" first to create sample.pdf');
    process.exit(1);
  }

  if (shouldSkipConversion()) process.exit(0);

  mkdirSync(OUTPUT_DIR, { recursive: true });

  const document = await pdf(PDF_PATH, { scale: SCALE });
  const pages = [];
  let counter = 1;

  for await (const image of document) {
    const filename = `page-${counter}.png`;
    const filepath = join(OUTPUT_DIR, filename);
    writeFileSync(filepath, image);
    pages.push(filename);
    console.log(`  ✓ ${filename}`);
    counter++;
  }

  const manifest = { pageCount: pages.length, pages };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

  console.log(`\nConverted ${pages.length} pages to ${OUTPUT_DIR}`);
  console.log(`Manifest written to ${MANIFEST_PATH}`);
}

convertPdfToImages().catch((err) => {
  console.error('Conversion failed:', err);
  process.exit(1);
});
