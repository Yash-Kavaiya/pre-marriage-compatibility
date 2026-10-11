import jsPDF from 'jspdf';
import { autoTable, CellHookData, RowInput } from 'jspdf-autotable';
import { assessmentCategories, assessmentQuestions, flexibilityLabels, importanceLabels } from '@/data/assessmentQuestions';
import { discussionGuides } from '@/data/discussionGuides';
import {
  CompatibilityReport,
  Status,
  bandMeta,
  buildCompatibilityReport,
  statusMeta,
  statusOrder,
} from '@/lib/compatibility';
import type { PartnerData } from '@/lib/types';
import { generateQualityOfLifeAnalysis, levelLabels } from '@/utils/qualityOfLifeAnalysis';

type RGB = [number, number, number];

const color = {
  plum: [74, 42, 81] as RGB,
  ink: [42, 28, 46] as RGB,
  muted: [112, 102, 114] as RGB,
  gold: [189, 144, 66] as RGB,
  ivory: [248, 245, 239] as RGB,
  paper: [252, 250, 246] as RGB,
  border: [226, 219, 206] as RGB,
  soft: [243, 239, 231] as RGB,
  goldSoft: [247, 240, 226] as RGB,
  partnerA: [94, 54, 102] as RGB,
  partnerB: [182, 134, 53] as RGB,
};

const statusSoft: Record<Status, RGB> = {
  aligned: [228, 239, 231],
  discuss: [248, 238, 214],
  priority: [247, 226, 219],
  confirm: [224, 232, 243],
};

const PAGE_W = 210;
const PAGE_H = 297;
const M = 18;
const CONTENT_W = PAGE_W - M * 2;
const TOP = 26;
const BOTTOM = PAGE_H - 22;
const PT = 0.3528;

interface Ctx {
  pdf: jsPDF;
  y: number;
}

const fill = (pdf: jsPDF, c: RGB) => pdf.setFillColor(c[0], c[1], c[2]);
const stroke = (pdf: jsPDF, c: RGB) => pdf.setDrawColor(c[0], c[1], c[2]);
const ink = (pdf: jsPDF, c: RGB) => pdf.setTextColor(c[0], c[1], c[2]);

const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const safeFileName = (text: string) => text.replace(/[^a-z0-9-]+/gi, '-').replace(/-+/g, '-');

const lastTableY = (ctx: Ctx) =>
  (ctx.pdf as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? ctx.y;

const ensure = (ctx: Ctx, height: number) => {
  if (ctx.y + height > BOTTOM) {
    ctx.pdf.addPage();
    ctx.y = TOP;
  }
};

const eyebrow = (ctx: Ctx, text: string, c: RGB = color.gold, x = M) => {
  const { pdf } = ctx;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setCharSpace(0.6);
  ink(pdf, c);
  pdf.text(text.toUpperCase(), x, ctx.y);
  pdf.setCharSpace(0);
  ctx.y += 6;
};

const heading = (ctx: Ctx, text: string, size = 22, c: RGB = color.plum) => {
  const { pdf } = ctx;
  pdf.setFont('times', 'bold');
  pdf.setFontSize(size);
  ink(pdf, c);
  const lines = pdf.splitTextToSize(text, CONTENT_W) as string[];
  const baseline = ctx.y + size * PT * 0.8;
  pdf.setLineHeightFactor(1.1);
  pdf.text(lines, M, baseline);
  ctx.y = baseline + (lines.length - 1) * size * PT * 1.1 + 5;
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

interface ParaOptions {
  size?: number;
  c?: RGB;
  width?: number;
  x?: number;
  font?: 'helvetica' | 'times';
  style?: 'normal' | 'bold' | 'italic';
  lineHeight?: number;
  gap?: number;
}

const measure = (pdf: jsPDF, text: string, { size = 10, width = CONTENT_W, font = 'helvetica', style = 'normal', lineHeight = 1.45 }: ParaOptions) => {
  pdf.setFont(font, style);
  pdf.setFontSize(size);
  const lines = pdf.splitTextToSize(text, width) as string[];
  return { lines, height: lines.length * size * PT * lineHeight };
};

const para = (ctx: Ctx, text: string, options: ParaOptions = {}) => {
  const { pdf } = ctx;
  const { size = 10, c = color.ink, x = M, lineHeight = 1.45, gap = 3 } = options;
  const { lines, height } = measure(pdf, text, options);
  ensure(ctx, height);
  ink(pdf, c);
  pdf.setLineHeightFactor(lineHeight);
  pdf.text(lines, x, ctx.y + size * PT * 0.75);
  ctx.y += height + gap;
};

const pill = (pdf: jsPDF, x: number, y: number, label: string, background: RGB, text: RGB) => {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  const w = pdf.getTextWidth(label) + 6;
  fill(pdf, background);
  pdf.roundedRect(x, y - 3.6, w, 5.2, 2.6, 2.6, 'F');
  ink(pdf, text);
  pdf.text(label, x + 3, y);
  return w;
};

const chip = (pdf: jsPDF, x: number, y: number, status: Status, short = true) =>
  pill(pdf, x, y, short ? statusMeta[status].short : statusMeta[status].label, statusSoft[status], statusMeta[status].rgb);

const drawRings = (pdf: jsPDF, x: number, y: number, r: number, first: RGB, second: RGB) => {
  pdf.setLineWidth(0.6);
  stroke(pdf, first);
  pdf.circle(x, y, r, 'S');
  stroke(pdf, second);
  pdf.circle(x + r * 1.2, y, r, 'S');
};

const section = (ctx: Ctx, number: string, label: string, title: string, intro?: string) => {
  ctx.pdf.addPage();
  ctx.y = TOP + 6;
  eyebrow(ctx, `${number} / ${label}`);
  heading(ctx, title);
  if (intro) para(ctx, intro, { c: color.muted, size: 10 });
  ctx.y += 4;
};

const decoratePages = (pdf: jsPDF, title: string, subtitle: string) => {
  const total = pdf.getNumberOfPages();
  for (let i = 2; i <= total; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setCharSpace(0.5);
    ink(pdf, color.gold);
    pdf.text('BEFORE YOU SAY YES', M, 13);
    pdf.setCharSpace(0);
    pdf.setFont('helvetica', 'normal');
    ink(pdf, color.muted);
    pdf.text(`${title}  ·  ${subtitle}`, PAGE_W - M, 13, { align: 'right' });
    stroke(pdf, color.border);
    pdf.setLineWidth(0.2);
    pdf.line(M, 16, PAGE_W - M, 16);

    pdf.line(M, PAGE_H - 14, PAGE_W - M, PAGE_H - 14);
    pdf.setFontSize(7);
    pdf.text('A structured conversation tool, not a substitute for professional counseling.', M, PAGE_H - 9);
    pdf.text(`Page ${i} of ${total}`, PAGE_W - M, PAGE_H - 9, { align: 'right' });
  }
};

const baseTable = {
  margin: { left: M, right: M, top: TOP, bottom: 24 },
  theme: 'plain' as const,
  styles: {
    font: 'helvetica',
    fontSize: 8.5,
    textColor: color.ink,
    cellPadding: { top: 2.6, bottom: 2.6, left: 2.5, right: 2.5 },
    lineColor: color.border,
    lineWidth: { bottom: 0.2 },
    valign: 'middle' as const,
  },
  headStyles: {
    fontStyle: 'bold' as const,
    fontSize: 7.5,
    textColor: color.muted,
    fillColor: color.soft,
    lineWidth: 0,
  },
};

const styleStatusCell = (data: CellHookData, column: number) => {
  if (data.section !== 'body' || data.column.index !== column) return;
  const raw = String(data.cell.raw ?? '');
  const status = statusOrder.find((s) => statusMeta[s].short === raw || statusMeta[s].label === raw);
  if (!status) return;
  data.cell.styles.fillColor = statusSoft[status];
  data.cell.styles.textColor = statusMeta[status].rgb;
  data.cell.styles.fontStyle = 'bold';
};

/* ----------------------------- Joint report ----------------------------- */

const jointCover = (ctx: Ctx, report: CompatibilityReport) => {
  const { pdf } = ctx;
  const { partnerA, partnerB, index, band } = report;

  fill(pdf, color.ivory);
  pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');
  fill(pdf, color.plum);
  pdf.rect(0, 0, PAGE_W, 118, 'F');

  drawRings(pdf, M + 4, 26, 4, color.ivory, color.gold);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setCharSpace(0.8);
  ink(pdf, color.ivory);
  pdf.text('BEFORE YOU SAY YES', M + 15, 27.5);
  pdf.setCharSpace(0);

  ctx.y = 62;
  eyebrow(ctx, 'Joint compatibility report');
  pdf.setFont('times', 'bold');
  pdf.setFontSize(36);
  ink(pdf, color.ivory);
  const names = pdf.splitTextToSize(`${partnerA.name} & ${partnerB.name}`, CONTENT_W) as string[];
  pdf.setLineHeightFactor(1.05);
  pdf.text(names, M, ctx.y + 8);
  ctx.y += 8 + names.length * 36 * PT * 1.05;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  ink(pdf, [214, 200, 216]);
  pdf.text(`Prepared ${formatDate(new Date())}`, M, Math.min(ctx.y + 4, 110));

  ctx.y = 140;
  eyebrow(ctx, 'Compatibility Index', color.muted);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(64);
  ink(pdf, color.plum);
  const score = String(Math.round(index));
  pdf.text(score, M, ctx.y + 18);
  const scoreW = pdf.getTextWidth(score);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  ink(pdf, color.muted);
  pdf.text('/ 100', M + scoreW + 2, ctx.y + 18);
  pdf.setFont('times', 'italic');
  pdf.setFontSize(18);
  ink(pdf, color.plum);
  pdf.text(bandMeta[band].label, M + 62, ctx.y + 8);
  const summary = measure(pdf, bandMeta[band].summary, { size: 9.5, width: CONTENT_W - 62 });
  ink(pdf, color.muted);
  pdf.setLineHeightFactor(1.45);
  pdf.text(summary.lines, M + 62, ctx.y + 15);

  const barY = ctx.y + 30;
  fill(pdf, color.border);
  pdf.roundedRect(M, barY, CONTENT_W, 2.4, 1.2, 1.2, 'F');
  fill(pdf, color.plum);
  pdf.roundedRect(M, barY, (CONTENT_W * Math.max(2, index)) / 100, 2.4, 1.2, 1.2, 'F');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  ink(pdf, color.muted);
  [
    [0, '0'],
    [65, '65 Solid'],
    [80, '80 Strong'],
    [100, '100'],
  ].forEach(([value, label]) => {
    const x = M + (CONTENT_W * Number(value)) / 100;
    stroke(pdf, color.muted);
    pdf.setLineWidth(0.2);
    pdf.line(x, barY + 3.4, x, barY + 5);
    pdf.text(String(label), x, barY + 8.5, { align: value === 100 ? 'right' : value === 0 ? 'left' : 'center' });
  });

  ctx.y = 212;
  eyebrow(ctx, 'In this report', color.muted);
  const contents = [
    'Executive summary',
    'Life areas',
    'Conversation guide',
    'Flexibility dynamics',
    'Individual profiles',
    'Methodology',
    'Appendix: every answer side by side',
  ];
  contents.forEach((item, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i < 4 ? i : i - 4;
    const x = M + col * (CONTENT_W / 2);
    const y = ctx.y + row * 8;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(11);
    ink(pdf, color.gold);
    pdf.text(i === 6 ? 'A' : String(i + 1).padStart(2, '0'), x, y);
    pdf.setFont('times', 'normal');
    ink(pdf, color.ink);
    pdf.text(item, x + 9, y);
  });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  ink(pdf, color.muted);
  pdf.text(`Confidential. Prepared for ${partnerA.name} and ${partnerB.name}.`, M, PAGE_H - 16);
};

const executiveSummary = (ctx: Ctx, report: CompatibilityReport) => {
  const { pdf } = ctx;
  section(ctx, '01', 'Executive summary', 'The short version');

  const boxW = 54;
  const narrative = measure(pdf, report.narrative, { size: 11.5, width: CONTENT_W - boxW - 8, font: 'times', lineHeight: 1.4 });
  const boxH = Math.max(52, narrative.height + 6);

  fill(pdf, color.soft);
  pdf.roundedRect(M, ctx.y, boxW, boxH, 2, 2, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7);
  pdf.setCharSpace(0.5);
  ink(pdf, color.muted);
  pdf.text('COMPATIBILITY INDEX', M + boxW / 2, ctx.y + 9, { align: 'center' });
  pdf.setCharSpace(0);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(44);
  ink(pdf, color.plum);
  pdf.text(String(Math.round(report.index)), M + boxW / 2, ctx.y + 28, { align: 'center' });
  pdf.setFont('times', 'italic');
  pdf.setFontSize(10.5);
  const bandLines = pdf.splitTextToSize(bandMeta[report.band].label, boxW - 8) as string[];
  pdf.setLineHeightFactor(1.2);
  pdf.text(bandLines, M + boxW / 2, ctx.y + 36, { align: 'center' });

  pdf.setFont('times', 'normal');
  pdf.setFontSize(11.5);
  ink(pdf, color.ink);
  pdf.setLineHeightFactor(1.4);
  pdf.text(narrative.lines, M + boxW + 8, ctx.y + 5);
  ctx.y += boxH + 8;

  const cardW = (CONTENT_W - 9) / 4;
  statusOrder
    .slice()
    .reverse()
    .forEach((status, i) => {
      const x = M + i * (cardW + 3);
      fill(pdf, statusSoft[status]);
      pdf.roundedRect(x, ctx.y, cardW, 21, 2, 2, 'F');
      pdf.setFont('times', 'bold');
      pdf.setFontSize(20);
      ink(pdf, statusMeta[status].rgb);
      pdf.text(String(report.counts[status]), x + 4, ctx.y + 10);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.text(statusMeta[status].label, x + 4, ctx.y + 16.5);
    });
  ctx.y += 31;

  const colW = (CONTENT_W - 10) / 2;
  const startY = ctx.y;
  const list = (x: number, title: string, titleColor: RGB, items: { title: string; detail: string }[], empty: string) => {
    let y = startY;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setCharSpace(0.5);
    ink(pdf, titleColor);
    pdf.text(title.toUpperCase(), x, y);
    pdf.setCharSpace(0);
    y += 7;
    if (!items.length) {
      const { lines } = measure(pdf, empty, { size: 9.5, width: colW });
      ink(pdf, color.muted);
      pdf.text(lines, x, y);
      return y + lines.length * 5;
    }
    items.forEach((item, i) => {
      pdf.setFont('times', 'bold');
      pdf.setFontSize(14);
      ink(pdf, titleColor);
      pdf.text(String(i + 1), x, y + 1);
      const t = measure(pdf, item.title, { size: 10, width: colW - 8, style: 'bold', lineHeight: 1.3 });
      ink(pdf, color.ink);
      pdf.setLineHeightFactor(1.3);
      pdf.text(t.lines, x + 8, y);
      y += t.height;
      const d = measure(pdf, item.detail, { size: 8.5, width: colW - 8 });
      ink(pdf, color.muted);
      pdf.text(d.lines, x + 8, y + 0.5);
      y += d.height + 4;
    });
    return y;
  };

  const strengthsEnd = list(
    M,
    'Where you stand together',
    statusMeta.aligned.rgb,
    report.strengths.map((s) => ({
      title: s.category,
      detail: `${Math.round(s.score)} / 100 alignment across ${plural(s.items.length, 'question')}`,
    })),
    'No life area reaches strong alignment yet. Start with the conversation guide.',
  );
  const talkEnd = list(
    M + colW + 10,
    'Talk about these first',
    statusMeta.priority.rgb,
    [...report.priorities, ...report.confirmItems].slice(0, 3).map((i) => ({
      title: i.question.question,
      detail: `${i.question.category} · ${statusMeta[i.status].label}`,
    })),
    'No priority conversations. Use the discussion items to deepen what already works.',
  );
  ctx.y = Math.max(strengthsEnd, talkEnd) + 4;
};

const lifeAreas = (ctx: Ctx, report: CompatibilityReport) => {
  const { partnerA, partnerB } = report;
  section(
    ctx,
    '02',
    'Life areas',
    'How your priorities compare',
    'Average importance (1 to 5) for each of you, an alignment score out of 100 for how closely your answers match within the area, and the number of questions in each status. Areas marked * are high-stakes: gaps there are the hardest to compromise on later.',
  );

  autoTable(ctx.pdf, {
    ...baseTable,
    startY: ctx.y,
    head: [['Life area', partnerA.name, partnerB.name, 'Alignment', 'Al.', 'Di.', 'Pr.', 'Co.', 'Status']],
    body: report.categories.map((c) => [
      `${c.category}${c.highStakes ? ' *' : ''}`,
      c.importanceA.toFixed(1),
      c.importanceB.toFixed(1),
      String(Math.round(c.score)),
      String(c.counts.aligned),
      String(c.counts.discuss),
      String(c.counts.priority),
      String(c.counts.confirm),
      statusMeta[c.status].short,
    ]),
    columnStyles: {
      0: { cellWidth: 52, fontStyle: 'bold' },
      1: { halign: 'center', textColor: color.partnerA },
      2: { halign: 'center', textColor: color.partnerB },
      3: { cellWidth: 34 },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center' },
      8: { halign: 'center', cellWidth: 20 },
    },
    didParseCell: (data) => {
      styleStatusCell(data, 8);
      if (data.section === 'body' && data.column.index === 3) data.cell.styles.textColor = [255, 255, 255];
      if (data.section === 'head' && [1, 2, 4, 5, 6, 7, 8].includes(data.column.index)) data.cell.styles.halign = 'center';
    },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 3) return;
      const value = Number(data.cell.raw);
      const { x, y, width, height } = data.cell;
      const barW = width - 14;
      const cy = y + height / 2;
      fill(ctx.pdf, color.border);
      ctx.pdf.roundedRect(x + 2.5, cy - 0.9, barW, 1.8, 0.9, 0.9, 'F');
      const c = report.categories[data.row.index];
      fill(ctx.pdf, statusMeta[c.status].rgb);
      ctx.pdf.roundedRect(x + 2.5, cy - 0.9, Math.max(1.8, (barW * value) / 100), 1.8, 0.9, 0.9, 'F');
      ctx.pdf.setFont('helvetica', 'normal');
      ctx.pdf.setFontSize(8);
      ink(ctx.pdf, color.ink);
      ctx.pdf.text(String(value), x + width - 2.5, cy + 1.2, { align: 'right' });
    },
  });
  ctx.y = lastTableY(ctx) + 6;

  para(ctx, 'Al. Aligned   Di. Worth discussing   Pr. Priority conversation   Co. Confirm your stance', {
    size: 7.5,
    c: color.muted,
  });
};

const conversationGuide = (ctx: Ctx, report: CompatibilityReport) => {
  const { pdf } = ctx;
  const { partnerA, partnerB } = report;
  section(
    ctx,
    '03',
    'Conversation guide',
    'What to talk about, and in what order',
    'Set aside an unhurried hour for each of the first few areas. Take turns answering the prompts. The aim is to understand each other\'s reasons, not to settle everything in one sitting.',
  );

  const groups = report.categories
    .map((c) => ({
      category: c,
      items: c.items
        .filter((i) => i.status === 'priority' || i.status === 'confirm')
        .sort((x, y) => (x.status === y.status ? y.importanceGap - x.importanceGap : x.status === 'priority' ? -1 : 1)),
    }))
    .filter((g) => g.items.length)
    .sort(
      (x, y) =>
        Number(y.category.highStakes) - Number(x.category.highStakes) ||
        y.items.length - x.items.length ||
        x.category.score - y.category.score,
    );

  if (!groups.length) {
    para(ctx, 'No priority conversations stand out. Your answers line up closely; use the "Worth discussing" items in the appendix and the shared priorities below as starting points.', {
      font: 'times',
      size: 12,
    });
  }

  groups.forEach(({ category, items }, i) => {
    ensure(ctx, 50);
    pdf.setFont('times', 'bold');
    pdf.setFontSize(20);
    ink(pdf, color.gold);
    pdf.text(String(i + 1), M, ctx.y + 5);
    pdf.setFontSize(15);
    ink(pdf, color.plum);
    pdf.text(category.category, M + 10, ctx.y + 4.5);
    if (category.highStakes) {
      const titleW = pdf.getTextWidth(category.category);
      pill(pdf, M + 14 + titleW, ctx.y + 4, 'High-stakes area', statusSoft.confirm, statusMeta.confirm.rgb);
    }
    ctx.y += 10;
    const guide = discussionGuides[category.category];
    if (guide) para(ctx, guide.why, { size: 9, c: color.muted, x: M + 10, width: CONTENT_W - 10 });

    autoTable(pdf, {
      ...baseTable,
      startY: ctx.y,
      margin: { ...baseTable.margin, left: M + 10 },
      head: [['Question', partnerA.name, partnerB.name, 'Status']],
      body: items.map((item) => [
        item.question.question,
        `${importanceLabels[item.a.importance - 1]}\n${flexibilityLabels[item.a.flexibility - 1]}`,
        `${importanceLabels[item.b.importance - 1]}\n${flexibilityLabels[item.b.flexibility - 1]}`,
        statusMeta[item.status].short,
      ]),
      columnStyles: {
        0: { cellWidth: 70, fontStyle: 'bold' },
        1: { fontSize: 7.5, textColor: color.partnerA },
        2: { fontSize: 7.5, textColor: color.partnerB },
        3: { cellWidth: 18, halign: 'center' },
      },
      didParseCell: (data) => styleStatusCell(data, 3),
    });
    ctx.y = lastTableY(ctx) + 4;

    if (guide) {
      const prompts = guide.prompts.map((p) => measure(pdf, `"${p}"`, { size: 10.5, width: CONTENT_W - 20, font: 'times', style: 'italic', lineHeight: 1.3 }));
      const boxH = 12 + prompts.reduce((s, p) => s + p.height + 2.5, 0);
      ensure(ctx, boxH + 4);
      fill(pdf, color.goldSoft);
      pdf.roundedRect(M + 10, ctx.y, CONTENT_W - 10, boxH, 2, 2, 'F');
      let y = ctx.y + 7;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setCharSpace(0.5);
      ink(pdf, color.gold);
      pdf.text('PROMPTS TO USE', M + 15, y);
      pdf.setCharSpace(0);
      y += 5;
      prompts.forEach((p) => {
        pdf.setFont('times', 'italic');
        pdf.setFontSize(10.5);
        ink(pdf, color.ink);
        pdf.setLineHeightFactor(1.3);
        pdf.text(p.lines, M + 15, y + 2.5);
        y += p.height + 2.5;
      });
      ctx.y += boxH + 10;
    } else {
      ctx.y += 6;
    }
  });

  if (report.sharedPriorities.length) {
    ensure(ctx, 30);
    eyebrow(ctx, 'Shared priorities to protect', statusMeta.aligned.rgb);
    para(ctx, 'Topics you both rate as very important and see the same way. They are the foundation you are building on.', {
      size: 9,
      c: color.muted,
    });
    report.sharedPriorities.slice(0, 10).forEach((item) => {
      ensure(ctx, 6);
      fill(pdf, statusMeta.aligned.rgb);
      pdf.circle(M + 1.2, ctx.y + 1.6, 0.8, 'F');
      para(ctx, item.question.question, { size: 9.5, x: M + 5, width: CONTENT_W - 5, gap: 1 });
    });
  }
};

const flexibilityDynamics = (ctx: Ctx, report: CompatibilityReport) => {
  const { partnerA, partnerB, flexibility } = report;
  const a = partnerA.name;
  const b = partnerB.name;
  section(
    ctx,
    '04',
    'Flexibility dynamics',
    'Who has room to move, and where',
    'Differences matter less when someone can adapt. Firmness runs from 1 (very flexible) to 5 (non-negotiable).',
  );

  const summary = flexibility.carrier
    ? `${flexibility.carrier === 'A' ? a : b} is the more flexible partner in most life areas. Healthy marriages need compromise to flow both ways, so notice where the other partner can offer some ground too.`
    : `Flexibility is shared: ${a} has more room in ${plural(flexibility.aMoreFlexible, 'area')}, ${b} in ${flexibility.bMoreFlexible}, and ${flexibility.balanced} ${flexibility.balanced === 1 ? 'is' : 'are'} balanced. Neither of you is carrying the compromise alone.`;
  para(ctx, summary, { font: 'times', size: 12.5, lineHeight: 1.4 });
  para(ctx, `Average firmness: ${a} ${flexibility.avgFlexA.toFixed(1)}, ${b} ${flexibility.avgFlexB.toFixed(1)}.`, {
    size: 9,
    c: color.muted,
  });
  ctx.y += 2;

  autoTable(ctx.pdf, {
    ...baseTable,
    startY: ctx.y,
    head: [['Life area', a, b, 'Flexible  to  firm', 'Who adapts']],
    body: report.categories.map((c) => [
      c.category,
      c.flexibilityA.toFixed(1),
      c.flexibilityB.toFixed(1),
      '',
      c.moreFlexible === 'balanced' ? 'Balanced' : c.moreFlexible === 'A' ? a : b,
    ]),
    columnStyles: {
      0: { cellWidth: 52, fontStyle: 'bold' },
      1: { halign: 'center', textColor: color.partnerA, cellWidth: 18 },
      2: { halign: 'center', textColor: color.partnerB, cellWidth: 18 },
      3: { cellWidth: 56 },
      4: {},
    },
    didDrawCell: (data) => {
      if (data.section !== 'body' || data.column.index !== 3) return;
      const c = report.categories[data.row.index];
      const { x, y, width, height } = data.cell;
      const left = x + 4;
      const trackW = width - 8;
      const cy = y + height / 2;
      fill(ctx.pdf, color.border);
      ctx.pdf.roundedRect(left, cy - 0.6, trackW, 1.2, 0.6, 0.6, 'F');
      const dot = (value: number, col: RGB) => {
        fill(ctx.pdf, col);
        stroke(ctx.pdf, [255, 255, 255]);
        ctx.pdf.setLineWidth(0.4);
        ctx.pdf.circle(left + ((value - 1) / 4) * trackW, cy, 1.6, 'FD');
      };
      dot(c.flexibilityA, color.partnerA);
      dot(c.flexibilityB, color.partnerB);
    },
  });
  ctx.y = lastTableY(ctx) + 6;
};

const individualBlock = (ctx: Ctx, partner: PartnerData, accent: RGB, title = partner.name) => {
  const { pdf } = ctx;
  const analysis = generateQualityOfLifeAnalysis(partner.responses);
  const clarity = Math.round(analysis.overallScore * 20);

  ensure(ctx, 60);
  pdf.setFont('times', 'bold');
  pdf.setFontSize(20);
  ink(pdf, color.plum);
  pdf.text(title, M, ctx.y + 6);
  pdf.setFontSize(28);
  ink(pdf, accent);
  pdf.text(String(clarity), PAGE_W - M, ctx.y + 7, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  ink(pdf, color.muted);
  pdf.text('CLARITY SCORE', PAGE_W - M, ctx.y + 11.5, { align: 'right' });
  ctx.y += 16;
  stroke(pdf, color.border);
  pdf.setLineWidth(0.2);
  pdf.line(M, ctx.y, PAGE_W - M, ctx.y);
  ctx.y += 6;

  para(ctx, analysis.profileTitle, { style: 'bold', size: 10, c: color.plum, gap: 1 });
  para(ctx, analysis.personalityProfile, { size: 9.5, c: color.muted });
  para(ctx, analysis.readinessTitle, { style: 'bold', size: 10, c: color.plum, gap: 1 });
  para(ctx, analysis.relationshipReadiness, { size: 9.5, c: color.muted, gap: 5 });

  autoTable(pdf, {
    ...baseTable,
    startY: ctx.y,
    head: [['Life area', 'Clarity', 'Reading', 'Insight', 'Suggestion']],
    body: analysis.categoryInsights.map((c) => [
      c.category,
      String(Math.round(c.score * 20)),
      levelLabels[c.level],
      c.insights.join(' '),
      c.recommendations[0] ?? '',
    ]),
    styles: { ...baseTable.styles, fontSize: 7.5, valign: 'top' },
    columnStyles: {
      0: { cellWidth: 34, fontStyle: 'bold' },
      1: { cellWidth: 14, halign: 'center', textColor: accent, fontStyle: 'bold' },
      2: { cellWidth: 24 },
      3: { cellWidth: 56, textColor: color.muted },
      4: {},
    },
  });
  ctx.y = lastTableY(ctx) + 8;
};

const methodology = (ctx: Ctx) => {
  const { pdf } = ctx;
  section(ctx, '06', 'Methodology', 'How this report is calculated');

  eyebrow(ctx, 'Question status', color.plum);
  statusOrder
    .slice()
    .reverse()
    .forEach((s) => {
      ensure(ctx, 16);
      chip(pdf, M, ctx.y + 3.5, s, false);
      ctx.y += 7;
      para(ctx, statusMeta[s].description, { size: 9.5, c: color.muted, gap: 4 });
    });
  para(
    ctx,
    'Rules: a difference in importance of 0 or 1 is Aligned (or Confirm stance when both rate it 4+ and hold it at 4+ firmness). A difference of 2 is Worth discussing, rising to Priority when the partner who cares more is firm (4+). A difference of 3 or more is Priority, unless both partners are flexible (2 or below).',
    { size: 8.5, c: color.muted, gap: 8 },
  );

  eyebrow(ctx, 'Compatibility Index', color.plum);
  para(
    ctx,
    'Each question scores 100, minus 20 points per step of difference in importance, minus up to 20 more when a gap of 2 or more meets a firm position. Confirm-stance items are capped at 85 until you verify them. Questions are weighted by how important they are to the two of you, so a gap on something you both care about counts more than a gap on something neither of you minds. 80 and above is a strong foundation; 65 to 79 is solid with growth areas; below 65 signals significant differences.',
    { size: 9.5, c: color.muted, gap: 8 },
  );

  eyebrow(ctx, 'Clarity score', color.plum);
  para(
    ctx,
    'The individual clarity score rewards knowing what matters to you while holding it with moderate rather than extreme firmness. It describes self-knowledge, not how good a partner someone is.',
    { size: 9.5, c: color.muted, gap: 8 },
  );

  const note =
    'This report measures how much weight you each give to topics, not the specific positions you hold. It is a structured starting point for conversation, not a prediction of whether your marriage will succeed. For priority areas, and especially high-stakes ones, we strongly recommend working through them with a qualified premarital counselor or a trusted mentor couple.';
  const m = measure(pdf, note, { size: 9.5, width: CONTENT_W - 12 });
  ensure(ctx, m.height + 18);
  fill(pdf, color.goldSoft);
  pdf.roundedRect(M, ctx.y, CONTENT_W, m.height + 16, 2, 2, 'F');
  const boxTop = ctx.y;
  ctx.y += 7;
  eyebrow(ctx, 'An important note', color.gold, M + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  ink(pdf, color.ink);
  pdf.setLineHeightFactor(1.45);
  pdf.text(m.lines, M + 6, ctx.y + 1);
  ctx.y = boxTop + m.height + 22;
};

const answersAppendix = (ctx: Ctx, report: CompatibilityReport) => {
  const { partnerA, partnerB } = report;
  section(
    ctx,
    'Appendix',
    'Side by side',
    'Every answer, next to each other',
    `Importance: 1 ${importanceLabels[0]} to 5 ${importanceLabels[4]}. Flexibility: 1 ${flexibilityLabels[0]} to 5 ${flexibilityLabels[4]}.`,
  );

  const byId = new Map(report.items.map((i) => [i.question.id, i]));
  const body: RowInput[] = [];
  assessmentCategories.forEach((category) => {
    const rows = assessmentQuestions.filter((q) => q.category === category && byId.has(q.id));
    if (!rows.length) return;
    body.push([
      {
        content: category,
        colSpan: 7,
        styles: { fontStyle: 'bold', textColor: color.plum, fillColor: color.paper, fontSize: 8, cellPadding: { top: 4, bottom: 2, left: 2.5, right: 2.5 } },
      },
    ]);
    rows.forEach((q) => {
      const item = byId.get(q.id)!;
      body.push([
        String(q.id),
        q.question,
        String(item.a.importance),
        String(item.a.flexibility),
        String(item.b.importance),
        String(item.b.flexibility),
        statusMeta[item.status].short,
      ]);
    });
  });

  autoTable(ctx.pdf, {
    ...baseTable,
    startY: ctx.y,
    head: [
      [
        { content: '', colSpan: 2 },
        { content: partnerA.name, colSpan: 2, styles: { halign: 'center', textColor: color.partnerA } },
        { content: partnerB.name, colSpan: 2, styles: { halign: 'center', textColor: color.partnerB } },
        '',
      ],
      ['#', 'Question', 'Imp.', 'Flex.', 'Imp.', 'Flex.', 'Status'],
    ],
    body,
    styles: { ...baseTable.styles, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 9, textColor: color.muted },
      1: {},
      2: { cellWidth: 12, halign: 'center', textColor: color.partnerA, fontStyle: 'bold' },
      3: { cellWidth: 12, halign: 'center', textColor: color.partnerA },
      4: { cellWidth: 12, halign: 'center', textColor: color.partnerB, fontStyle: 'bold' },
      5: { cellWidth: 12, halign: 'center', textColor: color.partnerB },
      6: { cellWidth: 20, halign: 'center' },
    },
    didParseCell: (data) => {
      styleStatusCell(data, 6);
      if (data.section === 'head' && data.column.index >= 2) data.cell.styles.halign = 'center';
    },
  });
  ctx.y = lastTableY(ctx) + 6;
};

export const generatePDFReport = (partnerA: PartnerData, partnerB: PartnerData): void => {
  const report = buildCompatibilityReport(partnerA, partnerB);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  pdf.setProperties({
    title: `Joint Compatibility Report - ${partnerA.name} & ${partnerB.name}`,
    subject: 'Premarital compatibility assessment',
    creator: 'Before You Say Yes',
  });
  const ctx: Ctx = { pdf, y: TOP };

  jointCover(ctx, report);
  executiveSummary(ctx, report);
  lifeAreas(ctx, report);
  conversationGuide(ctx, report);
  flexibilityDynamics(ctx, report);

  section(
    ctx,
    '05',
    'Individual profiles',
    'Each of you, on your own terms',
    'How clearly each of you knows your own priorities, and how firmly you tend to hold them.',
  );
  individualBlock(ctx, partnerA, color.partnerA);
  pdf.addPage();
  ctx.y = TOP + 6;
  individualBlock(ctx, partnerB, color.partnerB);

  methodology(ctx);
  answersAppendix(ctx, report);

  decoratePages(pdf, 'Joint compatibility report', `${partnerA.name} & ${partnerB.name}`);
  pdf.save(`Joint-Compatibility-Report-${safeFileName(partnerA.name)}-${safeFileName(partnerB.name)}.pdf`);
};

/* --------------------------- Individual report --------------------------- */

export const generateSinglePartnerPDF = (partner: PartnerData): void => {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  pdf.setProperties({
    title: `Individual Profile - ${partner.name}`,
    subject: 'Premarital compatibility assessment',
    creator: 'Before You Say Yes',
  });
  const ctx: Ctx = { pdf, y: TOP };

  fill(pdf, color.plum);
  pdf.rect(0, 0, PAGE_W, 74, 'F');
  drawRings(pdf, M + 4, 22, 4, color.ivory, color.gold);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setCharSpace(0.8);
  ink(pdf, color.ivory);
  pdf.text('BEFORE YOU SAY YES', M + 15, 23.5);
  pdf.setCharSpace(0);
  ctx.y = 44;
  eyebrow(ctx, 'Individual profile');
  pdf.setFont('times', 'bold');
  pdf.setFontSize(30);
  ink(pdf, color.ivory);
  pdf.text(partner.name, M, ctx.y + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  ink(pdf, [214, 200, 216]);
  pdf.text(`Prepared ${formatDate(new Date())}`, M, ctx.y + 14);

  ctx.y = 86;
  individualBlock(ctx, partner, color.partnerA, 'Your profile at a glance');

  para(
    ctx,
    'This profile reflects only your own answers. Send your partner your invite link so you can both read the joint report, which compares your answers side by side.',
    { size: 9, c: color.muted, gap: 6 },
  );

  pdf.addPage();
  ctx.y = TOP + 6;
  eyebrow(ctx, 'Appendix');
  heading(ctx, 'Your answers');
  const byId = new Map(partner.responses.map((r) => [r.questionId, r]));
  const body: RowInput[] = [];
  assessmentCategories.forEach((category) => {
    const rows = assessmentQuestions.filter((q) => q.category === category && byId.has(q.id));
    if (!rows.length) return;
    body.push([
      {
        content: category,
        colSpan: 4,
        styles: { fontStyle: 'bold', textColor: color.plum, fillColor: color.paper, fontSize: 8, cellPadding: { top: 4, bottom: 2, left: 2.5, right: 2.5 } },
      },
    ]);
    rows.forEach((q) => {
      const r = byId.get(q.id)!;
      body.push([String(q.id), q.question, importanceLabels[r.importance - 1], flexibilityLabels[r.flexibility - 1]]);
    });
  });
  autoTable(pdf, {
    ...baseTable,
    startY: ctx.y,
    head: [['#', 'Question', 'Importance', 'Flexibility']],
    body,
    styles: { ...baseTable.styles, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 9, textColor: color.muted },
      2: { cellWidth: 32, textColor: color.partnerA },
      3: { cellWidth: 32 },
    },
  });

  decoratePages(pdf, 'Individual profile', partner.name);
  pdf.save(`Individual-Profile-${safeFileName(partner.name)}.pdf`);
};
