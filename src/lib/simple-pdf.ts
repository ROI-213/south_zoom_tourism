/**
 * Minimal dependency-free PDF writer for booking documents.
 *
 * Renders plain text lines with three styles using the built-in Helvetica
 * fonts. Text is reduced to Latin-1-safe ASCII so byte offsets in the xref
 * table match string indexes (the rupee sign becomes "Rs.").
 */

export type PdfLine = {
  text: string;
  style?: "title" | "heading" | "body" | "small";
  gapBefore?: number;
};

const FONT_SIZES = { title: 18, heading: 12, body: 10, small: 8 } as const;
const LINE_GAP = { title: 26, heading: 20, body: 15, small: 12 } as const;

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 48;
const MAX_CHARS = 92;

const toAscii = (value: string) =>
  value
    .replace(/\u20b9/g, "Rs. ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00d7/g, "x")
    .replace(/\u2192/g, "->")
    // eslint-disable-next-line no-control-regex
    .replace(/[^\x20-\x7e]/g, "");

const escapePdf = (value: string) => value.replace(/([\\()])/g, "\\$1");

function wrap(text: string, limit: number): string[] {
  if (text.length <= limit) return [text];
  const words = text.split(" ");
  const out: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line.length) line = word;
    else if (`${line} ${word}`.length <= limit) line += ` ${word}`;
    else {
      out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  return out;
}

type Placed = { text: string; style: keyof typeof FONT_SIZES; y: number };

function paginate(lines: PdfLine[]): Placed[][] {
  const pages: Placed[][] = [];
  let page: Placed[] = [];
  let y = PAGE_H - MARGIN;

  for (const line of lines) {
    const style = line.style ?? "body";
    const chars = style === "small" ? MAX_CHARS + 12 : style === "title" ? 48 : MAX_CHARS;
    const parts = wrap(toAscii(line.text), chars);
    parts.forEach((part, i) => {
      const gap = LINE_GAP[style] + (i === 0 ? (line.gapBefore ?? 0) : 0);
      y -= gap;
      if (y < MARGIN) {
        pages.push(page);
        page = [];
        y = PAGE_H - MARGIN - gap;
      }
      page.push({ text: part, style, y });
    });
  }
  pages.push(page);
  return pages;
}

function contentStream(placed: Placed[]): string {
  const parts = ["BT"];
  for (const item of placed) {
    const font = item.style === "title" || item.style === "heading" ? "/F2" : "/F1";
    parts.push(`1 0 0 1 ${MARGIN.toFixed(2)} ${item.y.toFixed(2)} Tm`);
    parts.push(`${font} ${FONT_SIZES[item.style]} Tf`);
    parts.push(`(${escapePdf(item.text)}) Tj`);
  }
  parts.push("ET");
  return parts.join("\n");
}

/** Builds a single-file PDF and returns it as a Blob. */
export function buildPdf(lines: PdfLine[], title: string): Blob {
  const pages = paginate(lines);
  const objects: string[] = [];
  const pageObjStart = 5; // 1 catalog, 2 pages, 3 F1, 4 F2

  const pageIds = pages.map((_, i) => pageObjStart + i * 2);
  objects.push(`<< /Type /Catalog /Pages 2 0 R >>`);
  objects.push(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  );
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
  objects.push(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
  );

  pages.forEach((placed, i) => {
    const contentId = pageIds[i] + 1;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    const stream = contentStream(placed);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  const infoId = objects.length + 1;
  objects.push(`<< /Title (${escapePdf(toAscii(title))}) /Producer (South Zoom Tourism) >>`);

  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = body.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const pdf = body + xref + trailer;
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: "application/pdf" });
}

export function downloadPdf(lines: PdfLine[], filename: string, title: string) {
  const blob = buildPdf(lines, title);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
