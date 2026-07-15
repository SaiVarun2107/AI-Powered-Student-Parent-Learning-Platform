import { PDFPage } from "../parser/pdfParser";

export interface Chunk {
  board: string;
  class: number;
  subject: string;
  chapter: string;
  chunkIndex: number;
  content: string;
  pageStart: number;
  pageEnd: number;
}

const MAX_WORDS = 800;

export function createChunks(
  pages: PDFPage[],
  board: string,
  classNumber: number,
  subject: string,
  chapter: string
): Chunk[] {

  const chunks: Chunk[] = [];

  let chunkIndex = 1;

  let currentContent = "";
  let currentWordCount = 0;

  let startPage = pages[0].pageNumber;

  for (const page of pages) {

    const words = page.text.split(/\s+/);

    if (
      currentWordCount + words.length > MAX_WORDS &&
      currentContent.length > 0
    ) {

      chunks.push({
        board,
        class: classNumber,
        subject,
        chapter,
        chunkIndex,
        content: currentContent.trim(),
        pageStart: startPage,
        pageEnd: page.pageNumber - 1
      });

      chunkIndex++;

      currentContent = "";
      currentWordCount = 0;

      startPage = page.pageNumber;
    }

    const cleanedText = page.text
      .replace(/Government's Gift for Students' Progress/g, "")
      .replace(/\s+/g, " ")
      .trim();

    currentContent += cleanedText + "\n";

    currentWordCount += words.length;
  }

  if (currentContent.length > 0) {

    chunks.push({
      board,
      class: classNumber,
      subject,
      chapter,
      chunkIndex,
      content: currentContent.trim(),
      pageStart: startPage,
      pageEnd: pages[pages.length - 1].pageNumber
    });

  }

  return chunks;
}