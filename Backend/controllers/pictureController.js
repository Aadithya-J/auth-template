import supabase from "../utils/supabaseClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const evaluateResponse = async (userInput, correctAnswer, language = "en") => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  if (!userInput) {
    return { score: 0, feedback: "No description provided" };
  }

  // Language-specific prompts including Hindi
  const prompts = {
    en: `Evaluate if this description is correct for an image of '${correctAnswer}': ${userInput}. Respond with either "1|Correct" or "0|Incorrect".`,
    ta: `மதிப்பீடு செய்யுங்கள்: '${correctAnswer}' படத்திற்கான இந்த விளக்கம் சரியானதா? ${userInput}. "1|சரி" அல்லது "0|தவறு" என பதிலளிக்கவும்.`,
    hi: `इस चित्र '${correctAnswer}' के लिए दिया गया वर्णन सही है या नहीं मूल्यांकन करें: ${userInput}. कृपया "1|सही" या "0|गलत" में उत्तर दें।`,
  };

  const prompt = prompts[language] || prompts.en; // Fallback to English

  try {
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });

    const textResponse = result.response.text().trim();
    const [score, feedback] = textResponse.split("|");

    if (score !== undefined && feedback !== undefined) {
      return {
        score: parseInt(score),
        feedback: feedback.trim(),
      };
    } else {
      console.error("Unexpected response format:", textResponse);
      return { score: 0, feedback: "Invalid response format" };
    }
  } catch (err) {
    console.error("Gemini error:", err);
    return { score: 0, feedback: "Evaluation error" };
  }
};

export async function evaluateDescriptionAndStore(req, res) {
  const { child_id, answers } = req.body;
  try {
    const processedResponses = [];
    let totalScore = 0;

    for (const item of answers) {
      const isCorrect =
        item.userAnswer.trim().toLowerCase() ===
        item.correctAnswer.trim().toLowerCase();
      const answerScore = isCorrect ? 1 : 0;

      const { score: descriptionScore, feedback } = await evaluateResponse(
        item.description,
        item.correctAnswer,
        item.language // Pass the language to the evaluation function
      );

      const imageTotal = answerScore + descriptionScore;
      totalScore += imageTotal;

      processedResponses.push({
        image: item.image,
        userAnswer: item.userAnswer,
        correctAnswer: item.correctAnswer,
        description: item.description,
        language: item.language,
        answerScore,
        descriptionScore,
        totalForThisImage: imageTotal,
        feedback,
      });
    }

    totalScore = Number((totalScore / 2).toFixed(2)); // Assuming max score per image is 2

    const { data, error } = await supabase
      .from("picture_test_results")
      .insert({
        child_id,
        responses: processedResponses,
        score: totalScore,
        test_name: "Picture Recognition Test",
      })
      .select()
      .single();

    if (error) throw error;

    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: child_id,
    });

    if (updateError) throw updateError;

    return res
      .status(201)
      .json({ id: data.id, message: "Test stored successfully", totalScore });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getPictureTestResults(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("picture_test_results")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: "Test results not found" });

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching test results:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getPictureByChild(req, res) {
  const { childId } = req.params;
  try {
    const { data: tests, error } = await supabase
      .from("picture_test_results")
      .select("*")
      .eq("child_id", childId);
    if (error) throw error;
    const testsWithNames = tests.map((test) => ({
      ...test,
      test_name: "Picture Recognition Test",
    }));
    res.status(200).json({ tests: testsWithNames });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
