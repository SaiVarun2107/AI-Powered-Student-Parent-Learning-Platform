import { askGemini } from "../rag/gemini";

async function main() {
  const response = await askGemini(
    "Say only: Gemini connection successful."
  );

  console.log(response);
}

main();