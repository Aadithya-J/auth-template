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
    const prompt = `The following test results belong to a ${age}-year-old child. Conduct a thorough clinical analysis of these findings and provide a concise yet comprehensive 4-5 line summary in paragraph form. Highlight key observations, clinically significant patterns, and potential areas of concern, while considering age-appropriate norms. Maintain an objective, evidence-based tone, and acknowledge any limitations in interpretation due to insufficient data or confounding factors. Avoid bullet points and focus on delivering a clear, clinically relevant inference.
    
Results:\n\n${tests
      .map((test) => {
        const meta = testMetaData[test.test_name];
        const score = test.score;

        const detailStr = test.details
          ? JSON.stringify(test.details).replace(/[{}"]/g, "")
          : "None";

        if (!meta) {
          return `Test: ${test.test_name}, Score: ${
            score ?? "N/A"
          }, Details: ${detailStr}, Interpretation: Test metadata not found.`;
        }

        let performanceMessage =
          "Performance level cannot be determined due to missing or invalid score.";

        if (score !== null && score !== undefined) {
          const { strong, difficulty } = meta.scoreRange;
          if (score >= strong[0] && score <= strong[1]) {
            performanceMessage = meta.strongMessage;
          } else if (score >= difficulty[0] && score <= difficulty[1]) {
            performanceMessage = meta.description;
          } else {
            performanceMessage =
              "Score is outside typical interpretive ranges.";
          }
        }

        return `Test: ${test.test_name}, Score: ${
          score ?? "N/A"
        }, Details: ${detailStr}, Interpretation: ${performanceMessage}`;
      })
      .join(" | ")}`;

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
