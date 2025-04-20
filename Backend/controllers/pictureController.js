import supabase from "../utils/supabaseClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const evaluateResponse = async (userInput, correctAnswer) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  if(!userInput) {
    return { score: 0, feedback: "No description provided" };
  }
  const prompt = `Evaluate if this description is correct for an image of '${correctAnswer}': ${userInput}. Respond with either "1|Correct" or "0|Incorrect".`;
  try {
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
    });
    const textResponse = result.response.text();
    const [score, feedback] = textResponse.split("|");
    return { score: parseInt(score), feedback };
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
        item.correctAnswer
      );

      const imageTotal = answerScore + descriptionScore;
      totalScore += imageTotal;

      processedResponses.push({
        image: item.image,
        userAnswer: item.userAnswer,
        correctAnswer: item.correctAnswer,
        description: item.description,
        answerScore,
        descriptionScore,
        totalForThisImage: imageTotal,
        feedback,
      });
    }

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
