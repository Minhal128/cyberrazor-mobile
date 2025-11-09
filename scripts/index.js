import { GoogleGenAI } from "@google/genai";

// Put your API key in quotes
const ai = new GoogleGenAI({
  apiKey: "AIzaSyCMZnDBCGvjDcuOcXEvM1uMjFrZrd87nPU"
});

// Wrap the await in an async function
async function run() {
  const result = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: "What is the meaning of life?",
    config: { outputDimensionality: 10 }
  });

  console.log(result.embeddings);
}

run();