import supabase from "../utils/supabaseClient.js";
import fs from "fs";
const graphemeLetters = JSON.parse(
 fs.readFileSync(new URL("../Data/graphemeLetters.json", import.meta.url))
);
//import graphemeLetters from "../Data/graphemeLetters.json" assert { type: "json" };


function evaluateLetter(expected, actual, language) {
  if (!actual || actual.trim() === "") {
    return "skipped";
  }

  expected = expected.trim();
  actual = actual.trim();

  // Get confusion pairs based on language
  const langKey =
    language === "ta" ? "tamil" : language === "hi" ? "hindi" : "english";
  const confusionPairs = graphemeLetters[langKey].confusionPairs;

  if (expected === actual) {
    return "correct";
  }

  if (confusionPairs[expected]?.includes(actual)) {
    return "confused";
  }

  return "wrong";
}

function calculateScore(results) {
  let score = 0;
  results.forEach((r) => {
    if (r.status === "correct") score += 1;
    else if (r.status === "confused") score += 0;
  });
  return score;
}

export const evaluateResults = async (req, res) => {
  try {
    const { childId, letters, transcriptions, language } = req.body;

    const results = letters.map((letter, index) => {
      let spoken = transcriptions[index] || "";
      spoken = spoken.replace(/[^A-Za-z\u0B80-\u0BFF\u0900-\u097F]/g, ""); // Allow Tamil and Hindi characters
      const status = evaluateLetter(letter, spoken, language);
      return { letter, spoken, status };
    });

    const score = calculateScore(results);

    const { error } = await supabase.from("phoneme_test_results").insert([
      {
        child_id: childId,
        results,
        score,
        test_name: "Grapheme/Phoneme Correspondence Test",
      },
    ]);

    if (error) return res.status(500).json({ error: error.message });
    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: childId,
    });

    if (updateError) throw updateError;
    res.status(200).json({ results, score });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTestResults = async (req, res) => {
  try {
    const { childId } = req.params;
    const { data, error } = await supabase
      .from("phoneme_test_results")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ tests: data });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
