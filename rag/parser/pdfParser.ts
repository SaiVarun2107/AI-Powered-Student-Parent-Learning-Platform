import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export interface PDFPage {
  pageNumber: number;
  text: string;
}

export async function extractPDFText(
  source: string | Uint8Array,
  startPage?: number,
  endPage?: number
): Promise<PDFPage[]> {
  // Read the PDF into memory
  const data = typeof source === "string" ? new Uint8Array(fs.readFileSync(source)) : source;

  // Load the PDF
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  const pages: PDFPage[] = [];
  const start = startPage && startPage >= 1 ? Math.min(startPage, pdf.numPages) : 1;
  const end = endPage && endPage >= start ? Math.min(endPage, pdf.numPages) : pdf.numPages;

  console.log(`[PDF Parser] Document loaded (${pdf.numPages} total pages). Extracting pages ${start} to ${end}...`);

  for (let pageNum = start; pageNum <= end; pageNum++) {
    const page = await pdf.getPage(pageNum);

    const textContent = await page.getTextContent();

    const text = textContent.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");

    pages.push({
      pageNumber: pageNum,
      text,
    });
  }

  return pages;
}