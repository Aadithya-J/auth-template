import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import supabase from "../utils/supabaseClient.js";
import { readFile } from "fs/promises";
const data = await readFile("./Data/testMetaData.json", "utf-8");
const testMetaData = JSON.parse(data);

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generateInference", async (req, res) => {
  const { tests, childId } = req.body;

  if (!tests || !Array.isArray(tests)) {
    return res.status(400).json({ error: "Invalid or missing test data" });
  }

  try {
    const { data: childData, error: childError } = await supabase
      .from("children")
      .select("age")
      .eq("id", childId)
      .single();

    if (childError || !childData) {
      return res.status(404).json({ error: "Child not found" });
    }

    const age = childData.age;
    console.log("Child age:", age);
    const prompt = `
Analyze these test results for a ${age}-year-old child and provide a CONCISE clinical assessment.

### Test Results:
${tests
  .map((test) => {
    const meta = testMetaData[test.test_name];
    const score = test.score;
    const detailStr = test.details
      ? JSON.stringify(test.details).replace(/[{}"]/g, "")
      : "None";

    let performanceMessage = "Performance unclear due to missing data.";

    if (score !== null && score !== undefined && meta) {
      const { strong, difficulty } = meta.scoreRange;
      if (score >= strong[0] && score <= strong[1]) {
        performanceMessage = meta.strongMessage;
      } else if (score >= difficulty[0] && score <= difficulty[1]) {
        performanceMessage = meta.description;
      } else {
        performanceMessage = "Score outside typical ranges.";
      }
    }

    return `- ${test.test_name}: Score ${
      score ?? "N/A"
    }, ${performanceMessage}`;
  })
  .join("\n")}

### Instructions:
Write ONE PARAGRAPH (5-6 lines maximum) that:
1. Integrates all test results into a cohesive clinical assessment
2. Highlights key strengths and potential concerns based on age-appropriate norms
3. Uses professional clinical language while remaining concise
4. Provides actionable insights for next steps or focus areas

Do NOT use bullet points. Maintain a professional clinical tone throughout.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    const inference = result.response.text();
    res.status(200).json({ inference });
  } catch (error) {
    console.error("Error generating inference:", error);
    res.status(500).json({ error: "Failed to generate inference" });
  }
});

export default router;
