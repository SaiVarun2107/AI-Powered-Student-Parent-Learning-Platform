import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { buildPrompt } from "./rag/prompt";
import { getCurriculum } from "./services/curriculumService";
import { searchKnowledge } from "./rag/search";

const result = dotenv.config();

console.log(result);
console.log("API KEY =", process.env.GEMINI_API_KEY);
console.log("SUPABASE URL =", process.env.VITE_SUPABASE_URL);
console.log("SERVICE ROLE =", process.env.SUPABASE_SERVICE_ROLE_KEY);

// Initialize Express
const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gemini SDK
// Lazy initialization or fallback in case GEMINI_API_KEY is not defined yet
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Using mock fallbacks.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};
async function generateWithRetry(
  ai: GoogleGenAI,
  prompt: string,
  config: any
) {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Gemini Attempt ${attempt}/${MAX_RETRIES}`);

      return await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config,
      });

    } catch (err: any) {

      if (err.status === 503 && attempt < MAX_RETRIES) {
        console.log("⏳ Gemini busy. Retrying in 5 seconds...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        continue;
      }

      throw err;
    }
  }

  throw new Error("Gemini failed after multiple retries.");
}
// API Endpoint to Generate 10 Questions based on Board, Class, Subject, Chapter, Topics, and Difficulty
app.post("/api/assessment/generate", async (req, res) => {
  const { board, grade, subject, chapter, topics, difficulty } = req.body;
  

  if (!board || !grade || !subject || !chapter) {
    return res.status(400).json({ error: "Missing required fields (board, grade, subject, chapter)" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Return high-fidelity fallback Mock Questions if API Key is not set yet
    return res.json({
      questions: getFallbackQuestions(subject, chapter, difficulty)
    });
  }

  try {
    const gradeNumber = parseInt(String(grade).replace(/\D/g, ""));
    console.log("Original Grade:", grade);
    console.log("Parsed Grade:", gradeNumber);
    
    const normalizedBoard =
      board === "State Board" ? "TS SSC" : board;

    console.log("Original Board:", board);
    console.log("Normalized Board:", normalizedBoard);
    const knowledgeContext = await searchKnowledge(
      
      `${chapter} ${topics || ""}`,
      normalizedBoard,
      gradeNumber,
      subject,
      chapter,
      5
    );
    
    console.log("==================================");
    console.log("KNOWLEDGE");
    console.log("==================================");
    console.log(knowledgeContext);
  

    const knowledgeText = buildPrompt(
      `${topics || ""} ${difficulty || "Medium"}`,
      knowledgeContext
    );

    console.log("==================================");
    console.log("KNOWLEDGE CONTEXT");
    console.log("==================================");
    console.log(knowledgeText);

  
    const prompt = knowledgeText;
    console.log("Prompt Length:", prompt.length);
    console.log("🚀 Sending request to Gemini...");
    

    const response = await generateWithRetry(
      ai,
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              type: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              correctAnswer: { type: Type.STRING }
            },
            required: ["id", "question", "type", "correctAnswer"]
          }
        }
      }
      
    );
    console.log("✅ Gemini responded.");

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini API");
    }

    const parsedQuestions = JSON.parse(text.trim());
    console.log("======================================");
    console.log("GENERATED QUESTIONS JSON");
    console.log("======================================");
    console.log(JSON.stringify(parsedQuestions, null, 2));
    return res.json({ questions: parsedQuestions });

  } catch (error: any) {
    console.error("Assessment Generation Error:");
    console.error(error);
    // Return high-quality fallbacks on failure
    return res.json({
      error: error.message,
      questions: getFallbackQuestions(subject, chapter, difficulty)
    });
  }
});

// API Endpoint to Evaluate Assessment Answers using Gemini AI
app.post("/api/assessment/evaluate", async (req, res) => {
  const { grade, subject, chapter, questions, answers } = req.body;

  if (!questions || !answers) {
    return res.status(400).json({ error: "Missing questions or answers for evaluation" });
  }

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      evaluation: getFallbackEvaluation(questions, answers, subject)
    });
  }

  try {
    const questionsAndAnswers = questions.map((q: any, idx: number) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      correctAnswer: q.correctAnswer,
      studentAnswer: answers[idx] || "(No Answer Provided)"
    }));

    const prompt = `You are an expert AI tutor evaluating a student's completed academic assessment.
Below are the details of the assessment:
- Grade/Class Level: ${grade || "Class 10"}
- Subject: ${subject || "General"}
- Chapter/Topic: ${chapter || "General Concepts"}

Questions and Answers:
${JSON.stringify(questionsAndAnswers, null, 2)}

Please evaluate the student's responses carefully.
Consider correctness, conceptual understanding, explanation depth, and grade level.
Assess how well they understand the core concept behind each question.
Provide encouragement and clear suggestions.

You MUST return valid JSON only. Do not add markdown, code fences, or any explanation outside the JSON.
Return a JSON object with exactly these keys:
{
  "score": number,
  "total": number,
  "percentage": number,
  "overallPerformance": "Excellent|Very Good|Good|Needs Improvement",
  "summary": "A concise but meaningful explanation of the student's current mastery and learning profile.",
  "strengths": ["Strength 1", "Strength 2"],
  "learningGaps": ["Gap 1", "Gap 2"],
  "mistakes": [{"question": 2, "reason": "Short explanation of the mistake"}],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "confidence": "High|Medium|Low",
  "evaluationTimestamp": "ISO date string"
}

The score must be the number of correctly answered questions, total must be the full number of questions, and percentage must be computed from those values.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            total: { type: Type.INTEGER },
            percentage: { type: Type.INTEGER },
            overallPerformance: { type: Type.STRING },
            summary: { type: Type.STRING },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            learningGaps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            mistakes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.INTEGER },
                  reason: { type: Type.STRING }
                },
                required: ["question", "reason"]
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            confidence: { type: Type.STRING },
            evaluationTimestamp: { type: Type.STRING }
          },
          required: ["score", "total", "percentage", "overallPerformance", "summary", "strengths", "learningGaps", "mistakes", "recommendations", "confidence", "evaluationTimestamp"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No evaluation response text received from Gemini API");
    }

    const evaluation = parseAndNormalizeEvaluation(text, questions, answers, subject);
    return res.json({ evaluation });

  } catch (error: any) {
    console.error("Gemini Evaluation Error:", error);
    return res.json({
      error: error.message,
      evaluation: getFallbackEvaluation(questions, answers, subject)
    });
  }
});

function parseAndNormalizeEvaluation(raw: string, questions: any[], answers: any, subject: string) {
  let payload: any = null;

  try {
    payload = JSON.parse(raw.trim());
  } catch {
    return getFallbackEvaluation(questions, answers, subject);
  }

  if (!payload || typeof payload !== "object") {
    return getFallbackEvaluation(questions, answers, subject);
  }

  const total = Number(payload.total ?? questions.length ?? 10);
  const score = Number(payload.score ?? 0);
  const percentage = Number(payload.percentage ?? (total > 0 ? Math.round((score / total) * 100) : 0));
  const strengths = Array.isArray(payload.strengths) ? payload.strengths.filter((item: any) => typeof item === "string") : [];
  const learningGaps = Array.isArray(payload.learningGaps) ? payload.learningGaps.filter((item: any) => typeof item === "string") : [];
  const recommendations = Array.isArray(payload.recommendations) ? payload.recommendations.filter((item: any) => typeof item === "string") : [];
  const mistakes = Array.isArray(payload.mistakes)
    ? payload.mistakes.filter((item: any) => item && typeof item === "object" && typeof item.reason === "string")
        .map((item: any) => ({ question: Number(item.question ?? 0), reason: item.reason }))
    : [];

  return {
    score: Number.isFinite(score) ? score : 0,
    total: Number.isFinite(total) && total > 0 ? total : questions.length || 10,
    percentage: Number.isFinite(percentage) ? percentage : 0,
    overallPerformance: typeof payload.overallPerformance === "string" && payload.overallPerformance.trim()
      ? payload.overallPerformance.trim()
      : getPerformanceLabel(percentage),
    summary: typeof payload.summary === "string" && payload.summary.trim()
      ? payload.summary.trim()
      : `The student showed ${percentage >= 75 ? "solid" : "developing"} understanding in ${subject || "this topic"}.`,
    strengths: strengths.length > 0 ? strengths : getFallbackStrengths(percentage),
    learningGaps: learningGaps.length > 0 ? learningGaps : getFallbackGaps(percentage),
    mistakes,
    recommendations: recommendations.length > 0 ? recommendations : getFallbackRecommendations(percentage),
    confidence: typeof payload.confidence === "string" && payload.confidence.trim() ? payload.confidence.trim() : "Medium",
    evaluationTimestamp: typeof payload.evaluationTimestamp === "string" && payload.evaluationTimestamp.trim()
      ? payload.evaluationTimestamp.trim()
      : new Date().toISOString(),
    feedback: typeof payload.summary === "string" ? payload.summary : undefined,
    weakConcepts: learningGaps.length > 0 ? learningGaps : getFallbackGaps(percentage),
    recommendationsDetail: {
      topicsToRevise: learningGaps.slice(0, 3),
      practiceQuestions: recommendations.slice(0, 3),
      revisionPlan: `Focus on ${learningGaps[0] || "the core concept"} and review one related worksheet today.`,
      dailyGoals: `Spend 15 minutes revisiting ${learningGaps[0] || "the weak concept"} and one practice set.`
    }
  };
}

function getPerformanceLabel(percentage: number) {
  if (percentage >= 90) return "Excellent";
  if (percentage >= 75) return "Very Good";
  if (percentage >= 60) return "Good";
  return "Needs Improvement";
}

function getFallbackStrengths(percentage: number) {
  if (percentage >= 85) return ["Strong conceptual understanding", "Reliable recall of core methods"];
  if (percentage >= 70) return ["Steady topic engagement", "Good effort with structured practice"];
  return ["Willingness to attempt new tasks", "Improving problem-solving approach"];
}

function getFallbackGaps(percentage: number) {
  if (percentage >= 85) return ["Precision under time pressure"];
  if (percentage >= 70) return ["Detailed explanation habits", "Complex application practice"];
  return ["Core concept review", "Confidence with multi-step questions"];
}

function getFallbackRecommendations(percentage: number) {
  if (percentage >= 85) return ["Continue mixed practice sessions", "Review one challenging concept weekly"];
  if (percentage >= 70) return ["Practice two short revision sets", "Revisit the weak concept with guided notes"];
  return ["Focus on revision of the weakest concept", "Attempt a small set of scaffolded practice questions"];
}


// High-Fidelity Fallback generators when API keys are not ready or if rate-limited
function getFallbackQuestions(subject: string, chapter: string, difficulty: string) {
  const normSubject = (subject || "").toLowerCase();
  
  if (normSubject.includes("math") || normSubject.includes("algebra")) {
    return [
      {
        id: 1,
        question: `Find the value of x that satisfies x² - 5x + 6 = 0 for the chapter: ${chapter}.`,
        type: "mcq",
        options: ["x = 2, 3", "x = -2, -3", "x = 1, 5", "x = 0, 6"],
        correctAnswer: "x = 2, 3"
      },
      {
        id: 2,
        question: "An Arithmetic Sequence has first term a = 3 and common difference d = 2. What is the 5th term?",
        type: "mcq",
        options: ["9", "11", "13", "15"],
        correctAnswer: "11"
      },
      {
        id: 3,
        question: "Find the slope of a line perpendicular to y = 2x + 7.",
        type: "mcq",
        options: ["-1/2", "2", "-2", "1/2"],
        correctAnswer: "-1/2"
      },
      {
        id: 4,
        question: "A quadratic equation always has exactly two real distinct roots.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: "False"
      },
      {
        id: 5,
        question: "State the quadratic formula used to solve any equation ax² + bx + c = 0.",
        type: "short_answer",
        correctAnswer: "x = (-b ± √(b² - 4ac)) / 2a"
      },
      {
        id: 6,
        question: "Explain conceptually why a vertical line has an undefined slope.",
        type: "conceptual",
        correctAnswer: "Slope is rise over run. A vertical line has zero run (no horizontal change), meaning you divide by zero, which is mathematically undefined."
      },
      {
        id: 7,
        question: "Solve the linear system of equations: x + y = 5, x - y = 1. What is x?",
        type: "mcq",
        options: ["x = 3", "x = 2", "x = 4", "x = 1"],
        correctAnswer: "x = 3"
      },
      {
        id: 8,
        question: "The sum of the angles in any planar triangle is always 180 degrees.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: "True"
      },
      {
        id: 9,
        question: "What is the common ratio in the geometric sequence: 2, 6, 18, 54...?",
        type: "mcq",
        options: ["2", "3", "4", "6"],
        correctAnswer: "3"
      },
      {
        id: 10,
        question: "Describe what a function's domain represents in a coordinate plane.",
        type: "conceptual",
        correctAnswer: "The domain represents the complete set of all possible input values (usually x-values) for which the function is defined and produces real numbers."
      }
    ];
  } else if (normSubject.includes("science") || normSubject.includes("biological")) {
    return [
      {
        id: 1,
        question: `Which of the following cellular organelle is known as the powerhouse of the cell for ${chapter}?`,
        type: "mcq",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Lysosome"],
        correctAnswer: "Mitochondria"
      },
      {
        id: 2,
        question: "What is the main chemical product of photosynthesis that plants use for food?",
        type: "mcq",
        options: ["Oxygen", "Glucose", "Carbon Dioxide", "Water"],
        correctAnswer: "Glucose"
      },
      {
        id: 3,
        question: "Plant cells contain a rigid cell wall, whereas animal cells do not.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: "True"
      },
      {
        id: 4,
        question: "State Newton's Second Law of Motion in terms of Force, Mass, and Acceleration.",
        type: "short_answer",
        correctAnswer: "Force equals mass times acceleration (F = ma)."
      },
      {
        id: 5,
        question: "Explain the difference between a physical change and a chemical change.",
        type: "conceptual",
        correctAnswer: "A physical change alters the state or appearance without changing chemical identity (like ice melting). A chemical change forms entirely new chemical substances with new bonds (like wood burning)."
      },
      {
        id: 6,
        question: "What is the pH level of pure distilled water at room temperature?",
        type: "mcq",
        options: ["5.0", "7.0", "9.0", "14.0"],
        correctAnswer: "7.0"
      },
      {
        id: 7,
        question: "Sound waves travel faster in a vacuum than they do in solid iron bars.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: "False"
      },
      {
        id: 8,
        question: "Which blood cells are primarily responsible for fighting infections and pathogens?",
        type: "mcq",
        options: ["Red Blood Cells", "White Blood Cells", "Platelets", "Plasma Cells"],
        correctAnswer: "White Blood Cells"
      },
      {
        id: 9,
        question: "Define the term 'Genotype' in modern genetic biology.",
        type: "short_answer",
        correctAnswer: "The genotype is the unique genetic constitution or allele makeup of an individual organism."
      },
      {
        id: 10,
        question: "Describe conceptually why oil floats on water instead of mixing with it.",
        type: "conceptual",
        correctAnswer: "Oil floats because it is less dense than water. It does not mix because oil is nonpolar (hydrophobic), while water is a highly polar solvent, meaning they cannot form stable intermolecular bonds."
      }
    ];
  } else {
    // General high-quality humanities/default fallback
    return [
      {
        id: 1,
        question: `Who is the protagonist in the classic novel or literature unit: ${chapter}?`,
        type: "mcq",
        options: ["The Antagonist", "The Narrator", "The Lead Hero/Protagonist", "The Focal Character"],
        correctAnswer: "The Lead Hero/Protagonist"
      },
      {
        id: 2,
        question: "A metaphor is a direct comparison using the terms 'like' or 'as'.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: "False"
      },
      {
        id: 3,
        question: "What is the primary theme or moral conflict highlighted in this literary chapter?",
        type: "short_answer",
        correctAnswer: "The central conflict pits individual morality against societal pressure."
      },
      {
        id: 4,
        question: "Describe what 'alliteration' is and provide a simple example.",
        type: "conceptual",
        correctAnswer: "Alliteration is the repetition of the same consonant sounds at the beginning of adjacent or closely connected words. Example: 'Peter Piper picked a peck...'"
      },
      {
        id: 5,
        question: "Who wrote the historical tragedy 'Romeo and Juliet'?",
        type: "mcq",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: "William Shakespeare"
      },
      {
        id: 6,
        question: "The Industrial Revolution first began in the United States in the late 17th century.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: "False"
      },
      {
        id: 7,
        question: "Which rhetorical appeal relies on establishing the character and credibility of the speaker?",
        type: "mcq",
        options: ["Pathos", "Logos", "Ethos", "Kairos"],
        correctAnswer: "Ethos"
      },
      {
        id: 8,
        question: "Define 'onomatopoeia' in poetic literature analysis.",
        type: "short_answer",
        correctAnswer: "It is a word that phonetically mimics or resembles the sound it describes, like 'buzz', 'sizzle', or 'bang'."
      },
      {
        id: 9,
        question: "Describe conceptually how setting can influence a story's character development.",
        type: "conceptual",
        correctAnswer: "Setting shapes a character's values, obstacles, and opportunities. A harsh winter landscape can force a character to discover inner resilience or make difficult sacrifices."
      },
      {
        id: 10,
        question: "A sonnet is a traditional lyric poem composed of exactly 14 rhyming lines.",
        type: "true_false",
        options: ["True", "False"],
        correctAnswer: "True"
      }
    ];
  }
}

function getFallbackEvaluation(questions: any[], answers: any, subject: string) {
  let correctCount = 0;
  questions.forEach((q, idx) => {
    const studentAns = (answers[idx] || "").trim().toLowerCase();
    const correctAns = q.correctAnswer.trim().toLowerCase();
    
    if (q.type === 'mcq' || q.type === 'true_false') {
      if (studentAns === correctAns) {
        correctCount++;
      }
    } else if (studentAns.length > 5) {
      correctCount++;
    }
  });

  const total = questions.length || 10;
  const percentage = Math.round((correctCount / total) * 100);
  const overallPerformance = getPerformanceLabel(percentage);

  let learningGaps = ["Core concept review"];
  if (percentage < 70) {
    learningGaps = [
      "Conceptual explanation clarity",
      "Advanced applications of rules",
      "Detail tracking in complex terms"
    ];
  } else if (percentage < 90) {
    learningGaps = ["Boundary conditions", "Finer technical terminology"];
  }

  return {
    score: correctCount,
    total,
    percentage,
    overallPerformance,
    summary: `The student demonstrated ${overallPerformance.toLowerCase()} understanding in ${subject || "this topic"}. The response indicates a clear path for guided revision.`,
    strengths: ["Steady effort", "Good topic engagement"],
    learningGaps,
    mistakes: [],
    recommendations: ["Revise weak concepts with short practice sets", "Review one worksheet from this topic"],
    confidence: percentage >= 80 ? "High" : percentage >= 60 ? "Medium" : "Low",
    evaluationTimestamp: new Date().toISOString(),
    feedback: `Great attempt! The student answered ${correctCount} questions correctly.`,
    weakConcepts: learningGaps,
    recommendationsDetail: {
      topicsToRevise: learningGaps,
      practiceQuestions: ["Solve 3 practice questions on this topic", "Review key definitions"],
      revisionPlan: "Spend 20 minutes reviewing the weakest concept and complete one practice set.",
      dailyGoals: "Invest 15 minutes each day on active recall and short revision drills."
    }
  };
}


// Start Vite development server or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static build
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
