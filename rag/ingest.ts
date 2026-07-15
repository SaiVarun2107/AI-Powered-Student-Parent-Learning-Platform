import { extractPDFText } from "./parser/pdfParser";
import { extractChapter } from "./parser/chapterExtractor";
import { createChunks } from "./chunks/chunker";
import { generateEmbedding } from "./embedding";
import { insertChunk } from "./insertChunk";

import {
  BOARD,
  CLASS,
  SUBJECT,
  CHAPTER,
  START_PAGE,
  END_PAGE
} from "./config";

export async function ingestChunks() {

  const pages = await extractPDFText(
    "./rag/textbooks/9th Mathematics.pdf"
  );
  for (const page of pages) {
  console.log(`PDF Page: ${page.pageNumber}`);
  console.log(page.text.substring(0, 80));
  break;
  }

  const chapterPages = extractChapter(
    pages,
    START_PAGE,
    END_PAGE
  );
  console.log("First page:", chapterPages[0].pageNumber);
  console.log(
    chapterPages[0].text.substring(0, 300)
  );

  console.log("Last page:", chapterPages[chapterPages.length - 1].pageNumber);
  console.log(
    chapterPages[chapterPages.length - 1].text.substring(0, 300)
  );  

  const chunks = createChunks(
    chapterPages,
    BOARD,
    CLASS,
    SUBJECT,
    CHAPTER
  );

  console.log("================================");
  console.log(`Chapter: ${CHAPTER}`);
  console.log(`Pages: ${chapterPages.length}`);
  console.log(`Chunks: ${chunks.length}`);
  console.log("================================");

  for (const chunk of chunks) {

    console.log(`Generating embedding for Chunk ${chunk.chunkIndex}...`);

    const embedding = await generateEmbedding(chunk.content);

    await insertChunk(chunk, embedding);

    console.log(`✅ Stored Chunk ${chunk.chunkIndex}`);
  }

  console.log(`🎉 ${CHAPTER} ingestion completed.`);
}

ingestChunks().catch(console.error);