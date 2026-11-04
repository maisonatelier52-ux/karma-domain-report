import ExcelJS from 'exceljs';
import { REPORT_FIELDS, reportStats, formatReportDate } from '@/lib/fields';

const DARK = 'FF111827';
const GREEN = 'FF15803D';
const RED = 'FFB91C1C';
const LINK = 'FF1D4ED8';
const BORDER = { style: 'thin', color: { argb: 'FFD1D5DB' } };
const ALL_BORDERS = { top: BORDER, left: BORDER, bottom: BORDER, right: BORDER };

export async function buildXlsx({ domains, fields, title = 'DOMAIN REPORT' }) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Domain Report Manager';

  // ---- Summary sheet ----
  const s = wb.addWorksheet('Summary');
  s.columns = [{ width: 28 }, { width: 40 }];
  s.mergeCells('A1:B1');
  s.getCell('A1').value = title;
  s.getCell('A1').font = { name: 'Arial', size: 18, bold: true, color: { argb: 'FF1F2A44' } };
  s.getCell('A1').alignment = { horizontal: 'center' };
  s.mergeCells('A2:B2');
  s.getCell('A2').value = `Date: ${formatReportDate()}`;
  s.getCell('A2').font = { name: 'Arial', size: 9, color: { argb: 'FF6B7280' } };
  s.getCell('A2').alignment = { horizontal: 'center' };

  const stats = reportStats(domains);
  const rows = [
    ['Total domains', stats.total, 'FF111827'],
    ['Domains live', stats.live, GREEN],
    ['Not live', stats.notLive, RED],
    ['Client articles', stats.articles, 'FFB45309'],
  ];
  rows.forEach(([label, n, color], i) => {
    const r = 4 + i;
    s.getCell(`A${r}`).value = label;
    s.getCell(`A${r}`).font = { name: 'Arial', bold: true, size: 10 };
    s.getCell(`B${r}`).value = n;
    s.getCell(`B${r}`).font = { name: 'Arial', bold: true, size: 12, color: { argb: color } };
    s.getCell(`B${r}`).alignment = { horizontal: 'left' };
    s.getCell(`A${r}`).fill = s.getCell(`B${r}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F4F6' } };
    s.getCell(`A${r}`).border = s.getCell(`B${r}`).border = ALL_BORDERS;
  });

  // ---- Domains sheet ----
  const ws = wb.addWorksheet('Domains', { views: [{ state: 'frozen', ySplit: 1 }] });
  const chosen = REPORT_FIELDS.filter((f) => fields.includes(f.key));
  const widthFor = { domainLink: 34, doneBy: 18, domainLive: 16, clientArticles: 70, vercelLink: 40, githubLink: 40, searchConsoleLink: 44 };
  ws.columns = [
    { header: 'Domain', key: 'domainName', width: 28 },
    ...chosen.map((f) => ({ header: f.label, key: f.key, width: widthFor[f.key] || 30 })),
  ];

  const head = ws.getRow(1);
  head.height = 22;
  head.eachCell((c) => {
    c.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' }, size: 10 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DARK } };
    c.alignment = { vertical: 'middle' };
    c.border = ALL_BORDERS;
  });

  domains.forEach((d, idx) => {
    const row = ws.addRow({});
    row.getCell('domainName').value = d.domainName;
    row.getCell('domainName').font = { name: 'Arial', bold: true, size: 10 };

    chosen.forEach((f) => {
      const cell = row.getCell(f.key);
      const v = d[f.key];
      if (f.key === 'domainLive') {
        cell.value = v ? 'Live' : 'Not live';
        cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: v ? GREEN : RED } };
      } else if (f.key === 'clientArticles') {
        const list = v || [];
        cell.value = list.length ? list.join('\n') : '-';
        cell.font = { name: 'Arial', size: 10, color: { argb: list.length ? LINK : 'FF111827' } };
      } else if (f.key === 'doneBy') {
        cell.value = v || '-';
        cell.font = { name: 'Arial', size: 10 };
      } else if (v) {
        cell.value = { text: v, hyperlink: v };
        cell.font = { name: 'Arial', size: 10, color: { argb: LINK }, underline: true };
      } else {
        cell.value = '-';
        cell.font = { name: 'Arial', size: 10 };
      }
    });

    row.eachCell({ includeEmpty: true }, (c) => {
      c.alignment = { vertical: 'top', wrapText: true };
      c.border = ALL_BORDERS;
      if (idx % 2) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFBF8EF' } };
    });
    const lines = Math.max(1, (d.clientArticles || []).length);
    row.height = Math.max(18, lines * 15);
  });

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
