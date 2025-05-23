import supabase from "../utils/supabaseClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import { readFile } from "fs/promises";

dotenv.config();

// Load test metadata
let testMetaData = {};
try {
  const data = await readFile("./Data/testMetaData.json", "utf-8");
  testMetaData = JSON.parse(data);
} catch (err) {
  console.error("Failed to load testMetaData.json:", err);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Submit continuous assessment results
export async function submitResults(req, res) {
  try {
    const {
      child_id,
      results, // Expected: [{ name: "Test A", score: 7 }, { name: "Test B", score: 9 }]
      total_score,
      total_tests,
    } = req.body;

    // Validate required fields
    if (!child_id || !results || !Array.isArray(results)) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: child_id and results array"
      });
    }

    const formattedTestResults = results.map(result => ({
      test_name: result.name,
      score: result.score,
    }));

    // Generate analysis using Gemini
    let analysis_results = "Analysis not available.";
    try {
      // Get child's age
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("age")
        .eq("id", child_id)
        .single();

      if (!childError && childData) {
        const age = childData.age;
        
        const prompt = `
Analyze these test results for a ${age}-year-old child and provide a CONCISE clinical assessment.

### Test Results:
${formattedTestResults
  .map((test) => {
    const meta = testMetaData[test.test_name];
    const score = test.score;

    let performanceMessage = "Performance unclear due to missing data.";

    if (score !== null && score !== undefined && meta && meta.scoreRange) {
      const { strong, difficulty } = meta.scoreRange;
      if (score >= strong[0] && score <= strong[1]) {
        performanceMessage = meta.strongMessage || "Strong performance.";
      } else if (difficulty && score >= difficulty[0] && score <= difficulty[1]) {
        performanceMessage = meta.description || "Area of difficulty.";
      } else {
        performanceMessage = "Score outside typical ranges.";
      }
    }

    return `- ${test.test_name}: Score ${score ?? "N/A"}, ${performanceMessage}`;
  })
  .join("\n")}

### Instructions:
Write ONE PARAGRAPH (5-6 lines maximum) that:
1. Integrates all test results into a cohesive clinical assessment
2. Highlights key strengths and potential concerns based on age-appropriate norms
3. Uses professional clinical language while remaining concise
4. Provides actionable insights for next steps or focus areas

Do NOT use bullet points. Maintain a professional clinical tone throughout.`;
        // console.log("Prompt for Gemini:", prompt);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent({
          contents: [{ parts: [{ text: prompt }] }],
        });

        analysis_results = result.response.text();
      }
    } catch (inferenceError) {
      console.error('Error generating analysis:', inferenceError);
    }

    const { data: assessmentData, error: assessmentError } = await supabase
      .from('continuous_assessments')
      .insert({
        child_id: child_id,
        total_score: total_score,
        created_at: new Date().toISOString(),
        test_results: formattedTestResults,
        analysis: analysis_results
      })
      .select()
      .single();

    if (assessmentError) {
      console.error('Error inserting assessment:', assessmentError);
      return res.status(500).json({
        success: false,
        message: "Failed to save assessment record",
        error: assessmentError.message
      });
    }

    res.status(201).json({
      success: true,
      message: "Assessment results submitted successfully",
      data: {
        assessment_id: assessmentData.id,
        child_id: child_id,
        total_score: total_score,
        results_count: assessmentData.test_results ? assessmentData.test_results.length : 0,
        submitted_at: assessmentData.created_at,
        analysis_results: analysis_results
      }
    });

  } catch (error) {
    console.error('Error in submitResults:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}

export async function getContinuousAssessmentResultsByChildId(req, res) {
  try {
    const { child_id } = req.params;

    if (!child_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: child_id"
      });
    }

    // Fetch continuous assessment results for the given child_id
    const { data, error } = await supabase
      .from('continuous_assessments')
      .select('*')
      .eq('child_id', child_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assessments:', error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch assessment records",
        error: error.message
      });
    }

    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error in getContinuousAssessmentResultsByChildId:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}