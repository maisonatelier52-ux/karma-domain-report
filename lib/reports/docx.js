import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Footer,
  Header,
  Packer,
  PageNumber,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { buildRows, reportStats, formatReportDate } from '@/lib/fields';

// Landscape A4 with 0.5" margins -> content width 15398 DXA.
const CONTENT_W = 15398;
const LABEL_W = 3600;
const VALUE_W = CONTENT_W - LABEL_W;

const COLORS = {
  navy: '1F2A44',
  dark: '111827',
  gray: '6B7280',
  light: '9CA3AF',
  border: 'D1D5DB',
  green: '15803D',
  red: 'B91C1C',
  amber: 'B45309',
  link: '1D4ED8',
  cardBg: 'F3F4F6',
  cream: 'FBF8EF',
};

const border = { style: BorderStyle.SINGLE, size: 4, color: COLORS.border };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 70, bottom: 70, left: 110, right: 110 };

function run(text, opts = {}) {
  return new TextRun({ text, font: 'Arial', size: 16, ...opts });
}

function valueParagraphs(row) {
  return row.values.map((v, i) => {
    let child;
    if (row.kind === 'status') {
      child = run(v, { bold: true, color: row.live ? COLORS.green : COLORS.red });
    } else if (row.kind === 'links' && /^https?:\/\//i.test(v)) {
      child = new ExternalHyperlink({
        link: v,
        children: [run(v, { color: COLORS.link, underline: {} })],
      });
    } else {
      child = run(v);
    }
    return new Paragraph({ spacing: { after: i === row.values.length - 1 ? 0 : 60 }, children: [child] });
  });
}

function headerRow() {
  const mk = (text, w) =>
    new TableCell({
      width: { size: w, type: WidthType.DXA },
      borders,
      margins: cellMargins,
      shading: { type: ShadingType.CLEAR, color: 'auto', fill: COLORS.dark },
      children: [new Paragraph({ children: [run(text, { bold: true, color: 'FFFFFF' })] })],
    });
  return new TableRow({ tableHeader: true, cantSplit: true, children: [mk('Field', LABEL_W), mk('Details', VALUE_W)] });
}

function domainTable(domain, fields) {
  const rows = buildRows(domain, fields).map(
    (row, i) =>
      new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: LABEL_W, type: WidthType.DXA },
            borders,
            margins: cellMargins,
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: i % 2 ? COLORS.cream : 'FFFFFF' },
            children: [new Paragraph({ children: [run(row.label, { bold: true })] })],
          }),
          new TableCell({
            width: { size: VALUE_W, type: WidthType.DXA },
            borders,
            margins: cellMargins,
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: i % 2 ? COLORS.cream : 'FFFFFF' },
            children: valueParagraphs(row),
          }),
        ],
      })
  );
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [LABEL_W, VALUE_W],
    rows: [headerRow(), ...rows],
  });
}

function statsTable(stats) {
  const cards = [
    { n: stats.total, label: 'TOTAL DOMAINS', color: COLORS.dark },
    { n: stats.live, label: 'DOMAINS LIVE', color: COLORS.green },
    { n: stats.notLive, label: 'NOT LIVE', color: COLORS.red },
    { n: stats.articles, label: 'CLIENT ARTICLES', color: COLORS.amber },
  ];
  const widths = [3850, 3850, 3849, 3849];
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        children: cards.map(
          (c, i) =>
            new TableCell({
              width: { size: widths[i], type: WidthType.DXA },
              borders,
              margins: { top: 120, bottom: 120, left: 180, right: 180 },
              shading: { type: ShadingType.CLEAR, color: 'auto', fill: COLORS.cardBg },
              children: [
                new Paragraph({ children: [new TextRun({ text: String(c.n), font: 'Arial', size: 48, bold: true, color: c.color })] }),
                new Paragraph({ children: [new TextRun({ text: c.label, font: 'Arial', size: 13, bold: true, color: COLORS.gray })] }),
              ],
            })
        ),
      }),
    ],
  });
}

export async function buildDocx({ domains, fields, title = 'DOMAIN REPORT' }) {
  const stats = reportStats(domains);
  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 80 },
      children: [new TextRun({ text: title, font: 'Arial', size: 44, bold: true, color: COLORS.navy })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 280 },
      children: [
        new TextRun({
          text: `Date: ${formatReportDate()} | ${stats.total} domain${stats.total === 1 ? '' : 's'}`,
          font: 'Arial',
          size: 14,
          color: COLORS.gray,
        }),
      ],
    }),
    statsTable(stats),
    new Paragraph({
      spacing: { before: 360, after: 40 },
      children: [new TextRun({ text: 'Domain details', font: 'Arial', size: 26, bold: true })],
    }),
    new Paragraph({
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: 'Each domain lists its link, owner, live status and client articles.',
          font: 'Arial',
          size: 14,
          italics: true,
          color: COLORS.gray,
        }),
      ],
    }),
  ];

  domains.forEach((d) => {
    children.push(
      new Paragraph({
        keepNext: true,
        spacing: { before: 240, after: 100 },
        children: [new TextRun({ text: d.domainName, font: 'Arial', size: 24, bold: true })],
      })
    );
    children.push(domainTable(d, fields));
  });
  children.push(new Paragraph({ children: [] }));

  const doc = new Document({
    creator: 'Domain Report Manager',
    title: 'Domain Report',
    styles: { default: { document: { run: { font: 'Arial', size: 16 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({ children: [new TextRun({ text: 'Domain Report', font: 'Arial', size: 14, color: COLORS.gray })] })],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', font: 'Arial', size: 14, color: COLORS.light }),
                  new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 14, color: COLORS.light }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
