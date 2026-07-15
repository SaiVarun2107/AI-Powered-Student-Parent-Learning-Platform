import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function structureTextbook(text: string) {

    const prompt = `
You are an expert curriculum parser.

Convert the textbook into structured JSON.

Rules

- Preserve chapter
- Preserve section numbers
- Preserve section titles
- Preserve definitions
- Preserve examples
- Preserve activities
- Preserve exercises

Return JSON only.

Example

[
{
"chapter":"Probability",
"section":"13.1",
"title":"Random Experiments",
"type":"Definition",
"content":"..."
}
]

Textbook

${text}
`;

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
    });

    return response.text;
}