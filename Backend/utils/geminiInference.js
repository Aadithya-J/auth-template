import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/generateInference", async (req, res) => {
  const { tests } = req.body;

  if (!tests || !Array.isArray(tests)) {
    return res.status(400).json({ error: "Invalid or missing test data" });
  }

  const prompt = `Analyze these recent test results and provide a concise 4-5 line overall inference in paragraph form. Focus on key findings, avoid bullet points, and maintain a professional clinical tone. Include any notable patterns or concerns while acknowledging test limitations. Results:\n\n${tests
    .map(
      (test) =>
        `Test: ${test.test_name}, Score: ${test.score || "N/A"}, Details: ${
          JSON.stringify(test.details || {}).replace(/[{}"]/g, "") || "None"
        }`
    )
    .join(" | ")}`;

  try {
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
