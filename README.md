# Premium Animated React PDF Flipbook Viewer

A production-ready React.js web app that renders a PDF as a realistic animated flipbook with a clean, professional UI inspired by [Publuu](https://publuu.com/flip-book/992650/2343672/page/32).

**Fast Load**: PDF pages are pre-converted to images at build time for instant display.

## Features

- **Instant Load** - Pre-converted page images load immediately
- **Realistic Page Flip Animation** - Powered by StPageFlip
- **Publuu-style UI** - Header with toolbar, footer with page slider, nav arrows
- **Fully Responsive** - Desktop (2-page spread), tablet & mobile (single page, swipe)
- **Thumbnail / Table of Contents** - Grid view for quick page navigation
- **Full Controls** - Share, Download, Print, Zoom, Fullscreen
- **Keyboard Navigation** - Arrow keys for page navigation

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Generate page images from your PDF (REQUIRED - run once before first use)
npm run convert-pdf

# 3. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Important**: You must run `npm run convert-pdf` before the first run. This converts `public/assets/pdf/sample.pdf` into page images. Without it, the flipbook will not display.

## Installation

```bash
cd flipbook-app
npm install
```

If `public/assets/pdf/sample.pdf` doesn't exist, create it:
```bash
npm run generate-pdf
```

Then convert to images:
```bash
npm run convert-pdf
```

## How to Replace the PDF

1. Replace the file at `public/assets/pdf/sample.pdf` with your own PDF
2. Run `npm run convert-pdf` (or `npm run convert-pdf -- --force` to force)
3. Restart the dev server if needed

## Customization

Edit `src/config.js` to set your **publication title** (shown in the header).

## URL-Based Page Navigation

The current page is reflected in the URL (Publuu-style):
- `/` or `/page/1` – First page
- `/page/5` – Page 5
- `/page/32` – Page 32

Share a link to a specific page and it will open directly on that page. For production deployment, ensure your host serves `index.html` for all routes (standard for SPAs).

## Build & Deployment

```bash
npm run build
```

The build automatically runs `convert-pdf` first. The `dist/` folder is ready for static deployment on Vercel, Netlify, or GitHub Pages.

## Troubleshooting

**Pages not visible?**
- Ensure you ran `npm run convert-pdf` before `npm run dev`
- Check that `public/assets/pdf/manifest.json` and `public/assets/pdf/pages/` exist
- Replace `public/assets/pdf/sample.pdf` and run `npm run convert-pdf -- --force`

**Debug console** – Open DevTools (F12 or Cmd+Option+I) → Console tab. Look for `[FlipBook]` logs:
- `Fetching manifest` – confirms manifest URL
- `Manifest loaded` – page count and filenames
- `Image URLs built` – first few URLs being used
- `First image preload OK/FAILED` – whether images are reachable
- `Overlay img (page 1) loaded OK/FAILED` – loading state
- `PageFlip init` – flipbook initialization
- `PageFlip init event fired` – flipbook ready
- Any `[FlipBook]` error line shows the exact issue

**Blank screen?**
- Open browser DevTools Console for errors
- Verify the manifest loads at `/assets/pdf/manifest.json`

## Project Structure

```
public/assets/pdf/
  sample.pdf        # Source PDF
  manifest.json     # Page list (auto-generated)
  pages/            # Pre-converted images (page-1.png, page-2.png, ...)
scripts/
  generate-sample-pdf.js   # Creates sample.pdf
  convert-pdf-to-images.js # Converts PDF → images
src/
  components/
    FlipBook.jsx
    Controls.jsx
    ThemeSelector.jsx
    Loader.jsx
  themes/themes.js
  App.jsx
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Convert PDF + production build |
| `npm run convert-pdf` | Convert sample.pdf to page images |
| `npm run convert-pdf -- --force` | Force reconversion |
| `npm run generate-pdf` | Generate sample PDF |
