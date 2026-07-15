import { searchKnowledge } from "../rag/search";

async function main() {

  const results = await searchKnowledge(
    "What is probability?",
    "TS SSC",
    10,
    "Mathematics",
    "Probability"
  );

  console.log(results);

}

main().catch(console.error);