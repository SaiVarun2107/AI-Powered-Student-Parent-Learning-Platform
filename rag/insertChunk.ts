  import { supabase } from "./db";
  import { Chunk } from "./chunks/chunker";

  export async function insertChunk(
    chunk: Chunk,
    embedding: number[]
  ) {
    const { error } = await supabase
      .from("knowledge_chunks")
      .insert({
        curriculum_id: null,

        board: chunk.board,
        class: chunk.class,
        subject: chunk.subject,
        chapter: chunk.chapter,

        topic: null,

        page_number: chunk.pageStart,

        chunk_title: `Chunk ${chunk.chunkIndex}`,

        content: chunk.content,

        embedding: embedding,

        section: null,

        chunk_type: "Concept",
      });

    if (error) {
      console.error(error);
      throw error;
    }
  }