import supabase from "../utils/supabaseClient.js";

export async function submitResults(req, res) {
  try {
    const { childId, totalScore, responses, normalized_score } = req.body;

    const { data, error } = await supabase
      .from("sound_blending_results")
      .insert([
        {
          child_id: childId,
          total_score: totalScore,
          responses: responses,
          score: normalized_score,
          test_name: "Sound Blending Test",
        },
      ])
      .select();
    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: childId,
    });
    if (updateError) throw updateError;
    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getSoundBlendingByChild(req, res) {
  try {
    const { childId } = req.params;

    const { data, error } = await supabase
      .from("sound_blending_results")
      .select("*")
      .eq("child_id", childId);

    if (error) return res.status(400).json({ error: error.message });
    res.status(200).json({ tests: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
