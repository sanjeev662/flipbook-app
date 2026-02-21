/**
 * Script to generate a sample PDF for the flipbook.
 * Run: node scripts/generate-sample-pdf.js
 */
import { jsPDF } from 'jspdf';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, '../public/assets/pdf/sample.pdf');

// Ensure directory exists
mkdirSync(dirname(outputPath), { recursive: true });

const doc = new jsPDF();
const totalPages = 5;

for (let i = 1; i <= totalPages; i++) {
  if (i > 1) doc.addPage();
  doc.setFontSize(32);
  doc.text(`Sample Page ${i}`, 20, 40);
  doc.setFontSize(14);
  doc.text('Premium PDF Flipbook Viewer', 20, 60);
  doc.text('This is a demo document for testing the flipbook.', 20, 80);
  doc.text(`You are viewing page ${i} of ${totalPages}.`, 20, 100);
  doc.text('Replace this file with your own PDF at /public/assets/pdf/sample.pdf', 20, 130);
}

doc.save(outputPath);
console.log(`Sample PDF created at ${outputPath}`);
