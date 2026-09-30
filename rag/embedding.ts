import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";

// Ensure vector strictly matches Supabase vector(3072) column definition
function ensure3072(vec: number[]): number[] {
  if (vec.length === 3072) return vec;
  if (vec.length < 3072) {
    const padded = [...vec, ...new Array(3072 - vec.length).fill(0)];
    return padded;
  }
  return vec.slice(0, 3072);
}

// Deterministic 3072-dimension unit vector fallback for offline/development mode
function generateFallbackEmbedding(text: string): number[] {
  const dim = 3072;
  const vector = new Array(dim).fill(0.001);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) & 0xffffffff;
    const index = Math.abs((hash ^ (i * 17))) % dim;
    vector[index] += 1.0;
  }
  // Normalize vector to unit length
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm) || 1.0;
  return vector.map(v => v / norm);
}

export async function generateEmbedding(
  text: string
): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === "YOUR_GEMINI_API_KEY" || apiKey.trim() === "") {
    return generateFallbackEmbedding(text);
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
    });

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
    });

    const embedding = response.embeddings?.[0]?.values;

    if (!embedding) {
      return generateFallbackEmbedding(text);
    }

    return ensure3072(embedding);
  } catch (err: any) {
    return generateFallbackEmbedding(text);
  }
}