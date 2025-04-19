import supabase from "../utils/supabaseClient.js";

export async function createResult(req, res) {
  const { childId, difficulty, level, score, totalRounds } = req.body;

  if (!childId || score == null || level == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from("symbol_sequence_results")
    .insert([
      {
        child_id: childId,
        difficulty,
        level,
        score,
        total_rounds: totalRounds,
      },
    ])
    .select();

  const { error: updateError } = await supabase.rpc("increment_tests_taken", {
    child_id_param: childId,
  });
  if (updateError) throw updateError;
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ data });
}

export async function getResultsByChild(req, res) {
  const { childId } = req.params;

  if (!childId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const { data, error } = await supabase
    .from("symbol_sequence_results")
    .select("*")
    .eq("child_id", childId);

  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ tests: data });
}
