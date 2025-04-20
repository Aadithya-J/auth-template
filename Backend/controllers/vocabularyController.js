import supabase from "../utils/supabaseClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure GEMINI_API_KEY is loaded from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const vocabularyWords = [
  { word: "house", level: "Base" },
  { word: "box", level: "Base" },
  { word: "book", level: "Base" },
  { word: "ball", level: "Base" },
  { word: "cat", level: "Base" },
  { word: "tree", level: "Base" },
  { word: "orange", level: "Base" },
  { word: "school", level: "Base" },
  { word: "fish", level: "Base" },
  { word: "green", level: "5/6" },
  { word: "spade", level: "5/6" },
  { word: "rescue", level: "7" },
  { word: "battle", level: "7" },
  { word: "brave", level: "8" },
  { word: "reply", level: "8" },
  { word: "nonsense", level: "9" },
  { word: "lecture", level: "9" },
  { word: "connect", level: "10" },
  { word: "skill", level: "10" },
  { word: "malaria", level: "10" },
  { word: "microscope", level: "11" },
  { word: "haste", level: "12" },
  { word: "elevate", level: "12" },
  { word: "liberty", level: "13" },
  { word: "priceless", level: "13" },
  { word: "espionage", level: "14" },
];

// Function to evaluate the child's definition using Gemini
const evaluateDefinition = async (word, definition) => {
  // Use the gemini-1.5-flash model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  if (!definition || definition.trim() === "") {
    return { score: 0, feedback: "No definition provided" };
  }

  // More detailed prompt for better evaluation
  const prompt = `
    Word: "${word}"
    Child's Definition: "${definition}"

    Task: Evaluate if the child's definition indicates an understanding of the word's nature or use.
    Consider synonyms, general classification, major use, definitive examples, or description of a definitive feature.
    Do not be too strict on the definition as it is just a child
    Based on the definition provided, is it acceptable? Respond ONLY with:
    "1|Acceptable" if the definition is adequate.
    "0|Unacceptable" if the definition is inadequate or incorrect.
    Provide a brief justification after the pipe symbol. Example: "1|Acceptable - Correctly identifies it as a color." or "0|Unacceptable - Definition is too vague."
  `;

  try {
    const result = await model.generateContent(prompt);
    // Check if response and text() exist before accessing
     if (!result.response || typeof result.response.text !== 'function') {
      console.error("Invalid response structure from Gemini:", result);
      return { score: 0, feedback: "Evaluation error: Invalid response format." };
    }
    const textResponse = result.response.text();
    const parts = textResponse.split("|");
    if (parts.length < 2) {
        console.error("Unexpected response format from Gemini:", textResponse);
        // Attempt to provide a score based on keywords if possible, otherwise default
        const lowerCaseResponse = textResponse.toLowerCase();
        if (lowerCaseResponse.includes("acceptable")) return { score: 1, feedback: textResponse };
        if (lowerCaseResponse.includes("unacceptable")) return { score: 0, feedback: textResponse };
        return { score: 0, feedback: "Evaluation error: Unexpected format." };
    }
    const score = parseInt(parts[0].trim());
    const feedback = parts[1].trim();
    // Validate score
    // console.log(feedback)
    if (isNaN(score) || (score !== 0 && score !== 1)) {
        console.error("Invalid score value from Gemini:", parts[0]);
        return { score: 0, feedback: `Evaluation error: Invalid score (${parts[0]})` };
    }
    return { score, feedback };
  } catch (err) {
    console.error(`Gemini error evaluating "${word}":`, err);
    // Check for specific error types if needed
    if (err.message.includes('SAFETY')) {
        return { score: 0, feedback: "Evaluation blocked due to safety settings." };
    }
    return { score: 0, feedback: "Evaluation error occurred." };
  }
};


// Controller function to process test results and store them
export async function evaluateVocabularyAndStore(req, res) {
  const { child_id, responses } = req.body; // responses = [{ word: "house", definition: "where you live" }, ...]

  if (!child_id || !Array.isArray(responses)) {
    return res.status(400).json({ error: "Missing child_id or responses array" });
  }

  try {
    const processedResponses = [];
    let totalScore = 0;

    for (const item of responses) {
      const { word, definition } = item;
      // Find the word details (like level) - might be useful later
      const wordDetail = vocabularyWords.find(w => w.word === word);

      const { score, feedback } = await evaluateDefinition(word, definition);

      totalScore += score;

      processedResponses.push({
        word: word,
        level: wordDetail ? wordDetail.level : 'Unknown', // Store level if found
        definition: definition,
        score: score,
        feedback: feedback,
      });
    }

    // console.log("Vocabulary Test Score for child", child_id, ":", totalScore);

    const { data, error } = await supabase
      .from("vocabulary_test_results") // Ensure this table exists in Supabase
      .insert([
        {
          child_id,
          responses: processedResponses,
          score: totalScore,
          test_name: "Vocabulary Scale", // Consistent test name
        }
      ])
      .select()
      .single();

    if (error) {
        console.error("Supabase insert error:", error);
        throw error; // Re-throw to be caught by the outer catch block
    }


    // Increment tests_taken count for the child
    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: child_id,
    });

    if (updateError) {
        console.error("Supabase increment_tests_taken error:", updateError);
        // Decide if this should prevent success response. Maybe log and continue.
        // For now, we'll let the main result return but log the error.
    }


    return res
      .status(201)
      .json({ id: data.id, message: "Vocabulary test results stored successfully", score: totalScore });

  } catch (err) {
    console.error("Error processing vocabulary test:", err);
    // Provide a more specific error message if possible
    const errorMessage = err.message || "Internal Server Error";
    const errorCode = err.code || 500; // Use Supabase error code if available
    return res.status(errorCode === 404 ? 404 : 500).json({ error: errorMessage }); // Handle 'table not found' specifically if needed
  }
}

// Function to get vocabulary test results by result ID
export async function getVocabularyTestResultById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("vocabulary_test_results") // Ensure this table exists
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Vocabulary test results not found" });

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching vocabulary test results:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Function to get all vocabulary test results for a specific child
export async function getVocabularyTestsByChild(req, res) {
  const { childId } = req.params;
  try {
    const { data: tests, error } = await supabase
      .from("vocabulary_test_results") // Ensure this table exists
      .select("*")
      .eq("child_id", childId);

    if (error) throw error;

    // Add test_name for consistency if needed, though it's already stored
    const testsWithNames = tests.map((test) => ({
      ...test,
      test_name: test.test_name || "Vocabulary Scale", // Use stored name or default
    }));

    res.status(200).json({ tests: testsWithNames });
  } catch (error) {
    console.error("Error fetching child's vocabulary tests:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Function to get the list of words for the test
export function getVocabularyWords(req, res) {
    try {
        // Optionally filter or modify the list before sending
        res.status(200).json({ words: vocabularyWords });
    } catch (error) {
        console.error("Error fetching vocabulary words:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}
