import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export interface PDFPage {
  pageNumber: number;
  text: string;
}

export async function extractPDFText(filePath: string): Promise<PDFPage[]> {
  // Read the PDF into memory
  const data = new Uint8Array(fs.readFileSync(filePath));

  // Load the PDF
  const loadingTask = getDocument({ data });
  const pdf = await loadingTask.promise;

  const pages: PDFPage[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
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