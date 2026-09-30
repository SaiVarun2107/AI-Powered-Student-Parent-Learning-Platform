import { GoogleGenAI, Type } from "@google/genai";

export interface KnowledgeObject {
  chapter: string;
  topic: string;
  concept: string;
  concept_description: string;
  formulas: string[];
  skill: string;
  difficulty: string;
  question_patterns: string[];
}

const KNOWLEDGE_EXTRACTION_PROMPT = `
You are an expert Mathematics Curriculum Knowledge Extraction System.

Your job is to convert textbook content into structured educational knowledge.

You are NOT a teacher.
You are NOT a summarizer.
You are NOT a question generator.
You are an information extraction engine.

----------------------------------------------------
GOAL
----------------------------------------------------

Extract educational knowledge from the textbook that can later be used to generate completely ORIGINAL assessment questions.

The output will be stored in a Knowledge Base.

----------------------------------------------------
STRICT RULES
----------------------------------------------------

1. NEVER copy textbook sentences.
2. NEVER copy textbook definitions word-for-word.
3. NEVER copy exercise questions.
4. NEVER copy solved examples.
5. NEVER copy paragraph wording.
6. NEVER include people's names.
7. NEVER include numbers used in textbook exercises unless they are part of a mathematical formula or mathematical law.
8. NEVER mention page numbers.
9. NEVER mention exercise numbers.
10. NEVER return markdown.
11. Return ONLY valid JSON.

----------------------------------------------------
TASK
----------------------------------------------------

Read the COMPLETE chapter carefully.
The chapter may contain repeated explanations.

Identify EVERY UNIQUE mathematical concept.

Merge repeated concepts into ONE knowledge object.

Do not create duplicate concepts.

Understand the mathematical knowledge behind it.

Extract the following fields.

----------------------------------------------------
chapter
----------------------------------------------------

Return the chapter name.

----------------------------------------------------
topic
----------------------------------------------------

Return the topic or subtopic.

----------------------------------------------------
concept
----------------------------------------------------

Return ONLY the name of the mathematical concept.

Maximum 5 words.

Examples:

Experimental Probability

Theoretical Probability

Linear Equations

Mean

Median

Mode

Histogram

Surface Area

Circle

Pythagoras Theorem

DO NOT explain the concept.

DO NOT write complete sentences.

----------------------------------------------------
concept_description
----------------------------------------------------

Explain the concept clearly in 2 to 4 sentences.

The explanation must:

• Be written completely in your own words.
• Never copy textbook wording.
• Never copy definitions.
• Never include solved examples.
• Never include exercise questions.
• Focus only on the mathematical idea.

This description will later be used by another AI system to generate original questions.

----------------------------------------------------
formulas
----------------------------------------------------

Extract every mathematical formula, identity, theorem or equation related to this concept.

Return an array.

Examples:

[
"P(E)=n(E)/n(S)"
]

If no formula exists return:

[]

----------------------------------------------------
skill
----------------------------------------------------

Describe the mathematical skill being learned.

Maximum 15 words.

Examples:

Solve linear equations

Calculate experimental probability

Find arithmetic mean

Construct histograms

Apply Pythagoras theorem

----------------------------------------------------
difficulty
----------------------------------------------------

Estimate the difficulty.

Allowed values:

Easy

Medium

Hard

----------------------------------------------------
question_patterns
----------------------------------------------------

Return ONLY general real-world contexts where this concept can be tested.

These are NOT textbook questions.

Examples include:

Shopping

Geometry

Money

Age

Distance

Time

Clock

Calendar

Temperature

Sports

Games

Dice

Coins

Cards

Spinner

Marbles

Daily Life

Measurement

Construction

Agriculture

Business

Population

Travel

Statistics

Graphs

Shapes

Area

Volume

Coordinate Plane

Fractions

Percentages

Ratios

Algebra

Equations

Expressions

Functions

Sequences

Patterns

Triangles

Circles

Polygons

Probability

Data

Tables

Charts

Return only contexts that naturally fit the textbook content.

----------------------------------------------------
OUTPUT FORMAT
----------------------------------------------------

Return ONLY valid JSON.

Each object must represent ONE UNIQUE mathematical concept.

Example:

[
  {
    "chapter": "",
    "topic": "",
    "concept": "",
    "concept_description": "",
    "formulas": [],
    "skill": "",
    "difficulty": "",
    "question_patterns": []
  }
]
`;

export async function extractKnowledge(
    ai: GoogleGenAI,
    chapterText: string
): Promise<KnowledgeObject[]> {

  const response = await ai.models.generateContent({

    model: process.env.GEMINI_MODEL || "gemini-3.8-flash",

    contents: `
${KNOWLEDGE_EXTRACTION_PROMPT}

COMPLETE CHAPTER

${chapterText}
`,

    config: {

  temperature: 0,

  responseMimeType: "application/json",

  responseSchema: {

    type: Type.ARRAY,

    items: {

      type: Type.OBJECT,

      propertyOrdering: [
        "chapter",
        "topic",
        "concept",
        "concept_description",
        "formulas",
        "skill",
        "difficulty",
        "question_patterns"
      ],

      properties: {

        chapter: {
          type: Type.STRING
        },

        topic: {
          type: Type.STRING
        },

        concept: {
          type: Type.STRING
        },

        concept_description: {
          type: Type.STRING
        },

        formulas: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },

        skill: {
          type: Type.STRING
        },

        difficulty: {
          type: Type.STRING
        },

        question_patterns: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }

      },

      required: [
        "chapter",
        "topic",
        "concept",
        "concept_description",
        "formulas",
        "skill",
        "difficulty",
        "question_patterns"
      ]

    }

  }

}

});

if (!response.text) {
  throw new Error("Gemini returned empty response.");
}

return JSON.parse(response.text) as KnowledgeObject[];
}

