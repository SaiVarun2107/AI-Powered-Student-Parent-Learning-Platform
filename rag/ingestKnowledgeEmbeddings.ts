import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import { supabase } from "./db";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

import {
  BOARD,
  CLASS,
  SUBJECT,
  CHAPTER
} from "./config";
// =====================================

async function ingestKnowledgeEmbeddings() {

  const { data: knowledgeList, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("board", BOARD)
    .eq("class", CLASS)
    .eq("subject", SUBJECT)
    .eq("chapter", CHAPTER)
    .order("topic")
    .order("concept");

  if (error) throw error;

  console.log(`Found ${knowledgeList?.length ?? 0} concepts`);

  if (!knowledgeList || knowledgeList.length === 0) {
    console.log("No concepts found.");
    return;
  }

  for (const knowledge of knowledgeList) {

    console.log("---------------------------------------");
    console.log(`Embedding: ${knowledge.concept}`);
    console.log("---------------------------------------");

    const embeddingText = `
Board: ${knowledge.board}

Class: ${knowledge.class}

Subject: ${knowledge.subject}

Chapter: ${knowledge.chapter}

Topic: ${knowledge.topic}

Concept: ${knowledge.concept}

Description:
${knowledge.concept_description}

Mathematical Formula(s):
${knowledge.formulas.join("\n")}

Skill:
${knowledge.skill}

Difficulty:
${knowledge.difficulty}

Possible Question Contexts:
${knowledge.question_patterns.join(", ")}
`;

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: embeddingText,
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding) {
      throw new Error(`Embedding failed for ${knowledge.concept}`);
    }

    const { error: dbError } = await supabase
      .from("knowledge_embeddings")
      .upsert(
        {
          knowledge_id: knowledge.id,
          content: embeddingText,
          embedding: embedding
        },
        {
          onConflict: "knowledge_id"
        }
      );

    if (dbError) {
      console.error(dbError);
    } else {
      console.log(
        `✅ Stored embedding (${embedding.length} dimensions)`
      );
    }
  }

  console.log("");
  console.log(`🎉 ${CHAPTER} embeddings generated successfully.`);
}

ingestKnowledgeEmbeddings().catch(console.error);