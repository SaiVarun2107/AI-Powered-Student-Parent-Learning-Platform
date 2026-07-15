import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
console.log("URL:", process.env.VITE_SUPABASE_URL);
console.log("SERVICE:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Loaded" : "Missing");

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getCurriculum(
  grade: number,
  subject: string,
  chapter: string
) {
  const { data, error } = await supabase
    .from("curriculum")
    .select("*")
    .eq("class", grade)
    .eq("subject", subject)
    .eq("chapter", chapter);

  if (error) {
    throw error;
  }

  return data;
}