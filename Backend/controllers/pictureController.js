import supabase from "../utils/supabaseClient.js";

export async function addPicture(req, res) {
  const { child_id, score } = req.body;
  try {
    const { data, error } = await supabase
      .from("picture_test_results")
      .insert([{ child_id, score, test_name: "Picture Recognition Test" }])
      .select("*");
    if (error) throw error;

    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: child_id,
    });
    if (updateError) throw updateError;
    res
      .status(201)
      .json({ message: "Picture Test added successfully", test: data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
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
