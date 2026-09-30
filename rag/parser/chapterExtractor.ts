import { PDFPage } from "./pdfParser";

export function extractChapter(
  pages: PDFPage[],
  startPage: number,
  endPage: number
): PDFPage[] {
  const result: PDFPage[] = [];

  for (const page of pages) {
    if (
      page.pageNumber >= startPage &&
      page.pageNumber <= endPage
    ) {
      result.push(page);
    }
  }

  return result;
}