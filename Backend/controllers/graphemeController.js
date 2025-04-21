import supabase from "../utils/supabaseClient.js";

const confusionPairs = {
  // Lowercase pairs (bidirectional)
  b: ["d"],
  d: ["b"],
  p: ["q"],
  q: ["p"],
  n: ["u"],
  u: ["n"],
  m: ["w"],
  w: ["m"],
  v: ["u"],
  u: ["v"],
  a: ["o"],
  o: ["a"],
  f: ["t"],
  t: ["f"],
  g: ["q"],
  q: ["g"],
  i: ["j", "l"],
  j: ["i", "l"],
  l: ["i", "j"],
  c: ["e"],
  e: ["c"],
  y: ["g"],
  g: ["y"],
  s: ["z"],
  z: ["s"],

  // Uppercase pairs
  B: ["D"],
  D: ["B"],
  P: ["R"],
  R: ["P"],
  M: ["W"],
  W: ["M"],
  N: ["Z"],
  Z: ["N"],
  U: ["V"],
  V: ["U"],
  G: ["C", "O"],
  C: ["G", "O"],
  O: ["G", "C"],
  I: ["J", "L", "T"],
  J: ["I", "L", "T"],
  L: ["I", "J", "T"],
  T: ["I", "J", "L"],
  F: ["E"],
  E: ["F"],
  S: ["Z"],
  Z: ["S"],
  K: ["X"],
  X: ["K"],
  A: ["H"],
  H: ["A"],
};

function evaluateLetter(expected, actual) {
  if (!actual || actual.trim() === "") {
    return "skipped";
  }
  expected = expected.trim();
  actual = actual.trim();
  if (expected === actual) {
    return "correct";
  }
  if (expected.toLowerCase() === actual.toLowerCase()) {
    return "correct";
  }
  const expectedLower = expected.toLowerCase();
  const actualLower = actual.toLowerCase();
  if (
    confusionPairs[expected]?.includes(actual) || // Same case
    confusionPairs[expectedLower]?.includes(actualLower) // Different case
  ) {
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
    const { childId, letters, transcriptions } = req.body;

    const results = letters.map((letter, index) => {
      let spoken = transcriptions[index] || "";
      spoken = spoken.replace(/[^A-Za-z]/g, "").toUpperCase();
      const status = evaluateLetter(letter, spoken);
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
