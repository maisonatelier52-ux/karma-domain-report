import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { buildRows, reportStats, formatReportDate } from '@/lib/fields';

// Landscape A4, laid out like the "Day 1 Report" design:
// navy title, stat cards, dark-header tables, green/red status text, "Page N" footer.
const W = 841.89;
const H = 595.28;
const M = 40;
const LABEL_W = 200;
const FONT = 8;
const LINE = 10.5;
const PAD = 5;

const hex = (h) => {
  const n = parseInt(h.replace('#', ''), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const C = {
  navy: hex('1F2A44'),
  dark: hex('111827'),
  gray: hex('6B7280'),
  lightGray: hex('9CA3AF'),
  border: hex('D1D5DB'),
  text: hex('111827'),
  green: hex('15803D'),
  red: hex('B91C1C'),
  amber: hex('B45309'),
  link: hex('1D4ED8'),
  cardBg: hex('F3F4F6'),
  cream: hex('FBF8EF'),
  white: rgb(1, 1, 1),
};

function clean(t) {
  return String(t ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, '?');
}

function wrap(text, font, size, maxW) {
  const out = [];
  for (const para of clean(text).split('\n')) {
    const words = para.split(' ');
    let line = '';
    const pushLong = (word) => {
      let chunk = '';
      for (const ch of word) {
        if (font.widthOfTextAtSize(chunk + ch, size) > maxW) {
          out.push(chunk);
          chunk = ch;
        } else chunk += ch;
      }
      return chunk;
    };
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(test, size) <= maxW) {
        line = test;
      } else {
        if (line) out.push(line);
        line = font.widthOfTextAtSize(w, size) > maxW ? pushLong(w) : w;
      }
    }
    out.push(line);
  }
  return out;
}

export async function buildPdf({ domains, fields, title = 'DOMAIN REPORT' }) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const valueW = W - 2 * M - LABEL_W - 2 * PAD;
  let page;
  let y;

  const newPage = () => {
    page = pdf.addPage([W, H]);
    page.drawText('Domain Report', { x: M, y: H - 28, size: 7, font, color: C.gray });
    y = H - 46;
  };

  const drawTableHeader = () => {
    const h = 16;
    page.drawRectangle({ x: M, y: y - h, width: W - 2 * M, height: h, color: C.dark });
    page.drawText('Field', { x: M + PAD, y: y - 11, size: FONT, font: bold, color: C.white });
    page.drawText('Details', { x: M + LABEL_W + PAD, y: y - 11, size: FONT, font: bold, color: C.white });
    y -= h;
  };

  const measureRow = (row) => {
    let lines = 0;
    row.valueLines = row.values.map((v) => wrap(v, font, FONT, valueW));
    row.valueLines.forEach((l) => (lines += l.length));
    row.height = Math.max(lines * LINE + 2 * PAD - 1 + (row.values.length - 1) * 2, 20);
  };

  const drawRow = (row, idx) => {
    const h = row.height;
    page.drawRectangle({
      x: M,
      y: y - h,
      width: W - 2 * M,
      height: h,
      color: idx % 2 ? C.cream : C.white,
      borderColor: C.border,
      borderWidth: 0.5,
    });
    page.drawLine({ start: { x: M + LABEL_W, y }, end: { x: M + LABEL_W, y: y - h }, thickness: 0.5, color: C.border });
    page.drawText(clean(row.label), { x: M + PAD, y: y - PAD - 7, size: FONT, font: bold, color: C.text });

    let ty = y - PAD - 7;
    row.valueLines.forEach((lines) => {
      lines.forEach((ln) => {
        let f = font;
        let color = C.text;
        if (row.kind === 'status') {
          f = bold;
          color = row.live ? C.green : C.red;
        } else if (row.kind === 'links') {
          color = C.link;
        }
        page.drawText(ln, { x: M + LABEL_W + PAD, y: ty, size: FONT, font: f, color });
        ty -= LINE;
      });
      ty -= 2;
    });
    y -= h;
  };

  // ---------- Cover block ----------
  newPage();
  const titleSize = 22;
  const tw = bold.widthOfTextAtSize(title, titleSize);
  page.drawText(title, { x: (W - tw) / 2, y: y - 18, size: titleSize, font: bold, color: C.navy });
  const stats = reportStats(domains);
  const sub = clean(`Date: ${formatReportDate()} | ${stats.total} domain${stats.total === 1 ? '' : 's'}`);
  const sw = font.widthOfTextAtSize(sub, 7);
  page.drawText(sub, { x: (W - sw) / 2, y: y - 36, size: 7, font, color: C.gray });
  y -= 54;

  // Stat cards
  const cards = [
    { n: stats.total, label: 'TOTAL DOMAINS', color: C.text },
    { n: stats.live, label: 'DOMAINS LIVE', color: C.green },
    { n: stats.notLive, label: 'NOT LIVE', color: C.red },
    { n: stats.articles, label: 'CLIENT ARTICLES', color: C.amber },
  ];
  const cardW = (W - 2 * M) / 4;
  const cardH = 52;
  page.drawRectangle({ x: M, y: y - cardH, width: W - 2 * M, height: cardH, color: C.cardBg, borderColor: C.border, borderWidth: 0.7 });
  cards.forEach((c, i) => {
    const x = M + i * cardW;
    if (i > 0) page.drawLine({ start: { x, y }, end: { x, y: y - cardH }, thickness: 0.7, color: C.border });
    page.drawText(String(c.n), { x: x + 12, y: y - 30, size: 22, font: bold, color: c.color });
    page.drawText(c.label, { x: x + 12, y: y - 44, size: 6.5, font: bold, color: C.gray });
  });
  y -= cardH + 22;

  page.drawText('Domain details', { x: M, y, size: 13, font: bold, color: C.text });
  page.drawText('Each domain lists its link, owner, live status and client articles.', {
    x: M,
    y: y - 12,
    size: 7,
    font: italic,
    color: C.gray,
  });
  y -= 28;

  // ---------- Domains ----------
  domains.forEach((d) => {
    const rows = buildRows(d, fields);
    rows.forEach(measureRow);
    // Keep a domain's table together on one page whenever it fits on a single page.
    const tableH = 22 + 16 + rows.reduce((n, r) => n + r.height, 0);
    const pageH = H - 46 - 46;
    const need = tableH <= pageH ? tableH : 22 + 16 + (rows[0]?.height || 20);
    if (y - need < 46) newPage();

    page.drawText(clean(d.domainName), { x: M, y: y - 12, size: 12, font: bold, color: C.text });
    y -= 20;
    drawTableHeader();

    if (!rows.length) {
      page.drawText('No fields selected.', { x: M + PAD, y: y - 14, size: FONT, font: italic, color: C.gray });
      y -= 24;
    }
    rows.forEach((row, i) => {
      if (y - row.height < 46) {
        newPage();
        drawTableHeader();
      }
      drawRow(row, i);
    });
    y -= 22;
  });

  // Footers
  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    const t = `Page ${i + 1}`;
    p.drawText(t, { x: (W - font.widthOfTextAtSize(t, 7)) / 2, y: 22, size: 7, font, color: C.lightGray });
  });

  return pdf.save();
}
