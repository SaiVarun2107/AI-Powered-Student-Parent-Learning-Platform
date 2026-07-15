import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import { supabase } from "./db";
import { extractKnowledge } from "./knowledgeExtractor";

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

async function ingestKnowledge() {

  const { data: chunks, error } = await supabase
    .from("knowledge_chunks")
    .select("*")
    .eq("board", BOARD)
    .eq("class", CLASS)
    .eq("subject", SUBJECT)
    .eq("chapter", CHAPTER)
    .order("page_number");

  if (error) throw error;

  console.log(`Found ${chunks?.length ?? 0} chunks`);

  if (!chunks || chunks.length === 0) {
    console.log("No chunks found.");
    return;
  }

  const chapterText = chunks
    .map(chunk => chunk.content)
    .join("\n\n");

  const chapterPages = [...new Set(chunks.map(c => c.page_number))];

  console.log(`Chapter: ${CHAPTER}`);
  console.log(`Chapter Length: ${chapterText.length}`);

  const knowledgeList = await extractKnowledge(ai, chapterText);

  console.log("==============================");
  console.log("KNOWLEDGE OBJECTS");
  console.log("==============================");
  console.log(knowledgeList);

  for (const knowledge of knowledgeList) {

    const { data: existing, error: findError } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("board", BOARD)
      .eq("class", CLASS)
      .eq("subject", SUBJECT)
      .eq("chapter", CHAPTER)
      .eq("concept", knowledge.concept)
      .maybeSingle();

    if (findError) throw findError;

    if (!existing) {

      const { error: insertError } = await supabase
        .from("knowledge_base")
        .insert({
          board: BOARD,
          class: CLASS,
          subject: SUBJECT,

          chapter: CHAPTER,
          topic: knowledge.topic,
          concept: knowledge.concept,

          concept_description: knowledge.concept_description,

          formulas: knowledge.formulas,

          skill: knowledge.skill,

          difficulty: knowledge.difficulty,

          question_patterns: knowledge.question_patterns,

          source_pages: chapterPages,

          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`❌ Failed to insert ${knowledge.concept}`);
        console.error(insertError);
      } else {
        console.log(`✅ Inserted: ${knowledge.concept}`);
      }

    } else {

      const mergedFormulas = [
        ...new Set([
          ...(existing.formulas ?? []),
          ...knowledge.formulas
        ])
      ];

      const mergedPatterns = [
        ...new Set([
          ...(existing.question_patterns ?? []),
          ...knowledge.question_patterns
        ])
      ];

      const mergedPages = [
        ...new Set([
          ...(existing.source_pages ?? []),
          ...chapterPages
        ])
      ];

      const { error: updateError } = await supabase
        .from("knowledge_base")
        .update({
          topic: knowledge.topic,
          concept_description: knowledge.concept_description,
          formulas: mergedFormulas,
          skill: knowledge.skill,
          difficulty: knowledge.difficulty,
          question_patterns: mergedPatterns,
          source_pages: mergedPages
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error(`❌ Failed to update ${knowledge.concept}`);
        console.error(updateError);
      } else {
        console.log(
          `🔄 Updated: ${knowledge.concept} | formulas=${mergedFormulas.length} | patterns=${mergedPatterns.length} | pages=${mergedPages.length}`
        );
      }
    }
  }

  console.log(`🎉 ${CHAPTER} knowledge ingestion completed.`);
}

ingestKnowledge().catch(console.error);