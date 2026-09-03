/**
 * Minimal dependency-free PDF writer for booking documents.
 *
 * Renders plain text lines with three styles using the built-in Helvetica
 * fonts. Text is reduced to Latin-1-safe ASCII so byte offsets in the xref
 * table match string indexes (the rupee sign becomes "Rs.").
 *
 * Supports optional JPEG image embedding (e.g. company logo) via
 * addImageObject().
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

const escapePdf = (value: string) => value.replace(/([\\\(\)])/g, "\\$1");

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

function paginate(lines: PdfLine[], startY: number): Placed[][] {
  const pages: Placed[][] = [];
  let page: Placed[] = [];
  let y = startY;

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

function contentStream(placed: Placed[], logoOp?: string): string {
  const parts: string[] = [];
  if (logoOp) parts.push(logoOp);
  parts.push("BT");
  for (const item of placed) {
    const font = item.style === "title" || item.style === "heading" ? "/F2" : "/F1";
    parts.push(`1 0 0 1 ${MARGIN.toFixed(2)} ${item.y.toFixed(2)} Tm`);
    parts.push(`${font} ${FONT_SIZES[item.style]} Tf`);
    parts.push(`(${escapePdf(item.text)}) Tj`);
  }
  parts.push("ET");
  return parts.join("\n");
}

/**
 * Converts a PNG/JPEG URL to a JPEG Data URL using a canvas element.
 * Returns null if canvas is not available (SSR) or conversion fails.
 */
export async function logoToJpegDataUrl(
  imgUrl: string,
  targetWidth = 160,
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (typeof document === "undefined") return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const ratio = img.naturalHeight / img.naturalWidth;
        const w = targetWidth;
        const h = Math.round(w * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        resolve({ dataUrl, width: w, height: h });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = imgUrl;
  });
}

/** 
 * Decode a base64 JPEG data URL into raw bytes (Latin-1 string for PDF embed).
 */
function decodeJpegDataUrl(dataUrl: string): string | null {
  try {
    const base64 = dataUrl.split(",")[1];
    if (!base64) return null;
    return atob(base64);
  } catch {
    return null;
  }
}

/** Builds a single-file PDF and returns it as a Blob. */
export function buildPdf(
  lines: PdfLine[],
  title: string,
  logoJpeg?: { dataUrl: string; width: number; height: number } | null,
): Blob {
  // --- Logo image setup ---
  const LOGO_W_PT = 120; // width in PDF points on page
  let logoH_pt = 0;
  let jpegBytes: string | null = null;
  let hasLogo = false;

  if (logoJpeg?.dataUrl) {
    jpegBytes = decodeJpegDataUrl(logoJpeg.dataUrl);
    if (jpegBytes) {
      logoH_pt = Math.round(LOGO_W_PT * (logoJpeg.height / logoJpeg.width));
      hasLogo = true;
    }
  }

  // Reserve space at top of first page for logo + gap
  const LOGO_TOP_MARGIN = hasLogo ? logoH_pt + 12 : 0;
  const firstPageStartY = PAGE_H - MARGIN - LOGO_TOP_MARGIN;

  const pages = paginate(lines, firstPageStartY);
  const objects: string[] = [];

  // PDF object numbering:
  // 1 = catalog, 2 = pages, 3 = Helvetica (F1), 4 = Helvetica-Bold (F2)
  // 5 = XObject image (only if logo), then page objs
  const catalogId = 1;
  const pagesId = 2;
  const f1Id = 3;
  const f2Id = 4;
  const imgObjId = hasLogo ? 5 : null;
  const pageObjStart = hasLogo ? 6 : 5;

  const pageIds = pages.map((_, i) => pageObjStart + i * 2);

  // 1: Catalog
  objects.push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  // 2: Pages tree
  objects.push(
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`,
  );
  // 3: Helvetica regular
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`);
  // 4: Helvetica Bold
  objects.push(
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,
  );

  // 5: JPEG Image XObject (only if logo available)
  if (hasLogo && imgObjId && jpegBytes) {
    const imgStream = jpegBytes;
    objects.push(
      `<< /Type /XObject /Subtype /Image /Width ${logoJpeg!.width} /Height ${logoJpeg!.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgStream.length} >>\nstream\n${imgStream}\nendstream`,
    );
  }

  // Page objects
  pages.forEach((placed, i) => {
    const contentId = pageIds[i] + 1;
    const xObjRef = hasLogo && imgObjId ? `/XObject << /Logo ${imgObjId} 0 R >>` : "";
    objects.push(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${f1Id} 0 R /F2 ${f2Id} 0 R >> ${xObjRef} >> /Contents ${contentId} 0 R >>`,
    );

    // For first page only, draw logo at top-left
    let logoOp: string | undefined;
    if (i === 0 && hasLogo && imgObjId) {
      const x = MARGIN;
      const y = PAGE_H - MARGIN - logoH_pt;
      logoOp = `q ${LOGO_W_PT} 0 0 ${logoH_pt} ${x.toFixed(2)} ${y.toFixed(2)} cm /Logo Do Q`;
    }

    const stream = contentStream(placed, logoOp);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  const infoId = objects.length + 1;
  objects.push(`<< /Title (${escapePdf(toAscii(title))}) /Producer (South Zoom Tourism) >>`);

  // --- Build raw PDF bytes ---
  let body = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(body.length);
    body += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = body.length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const pdf = body + xref + trailer;
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return new Blob([bytes], { type: "application/pdf" });
}

export function downloadPdf(lines: PdfLine[], filename: string, title: string, logo?: { dataUrl: string; width: number; height: number } | null) {
  const blob = buildPdf(lines, title, logo);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
