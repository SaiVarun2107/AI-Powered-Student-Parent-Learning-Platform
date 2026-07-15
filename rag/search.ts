import { supabase } from "./db";
import { generateEmbedding } from "./embedding";

export async function searchKnowledge(
  query: string,
  board: string,
  classNumber: number,
  subject: string,
  chapter: string,
  limit = 5
) {

  console.log("Generating query embedding...");

  const embedding = await generateEmbedding(query);

  console.log("Searching knowledge base...");
  console.log("RPC PARAMETERS");
  console.log({
    board,
    classNumber,
    subject,
    chapter,
  });

  const { data, error } = await supabase.rpc(
    "match_knowledge_embeddings",
    {
      query_embedding: embedding,
      match_count: limit,
      filter_board: board,
      filter_class: classNumber,
      filter_subject: subject,
      filter_chapter: chapter,
    }
  );

  console.log("RPC Error:", error);
  console.log("RPC Data:", data);

  if (error) {
    throw error;
  } 

  return data;
}