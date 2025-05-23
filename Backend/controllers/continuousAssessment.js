import supabase from "../utils/supabaseClient.js";

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

    // Validate results format
    const validResults = results.every(result =>
      typeof result.name === 'string' &&
      typeof result.score === 'number' &&
      result.score >= 0 &&
      result.score <= 10 // Assuming max score is 10
    );

    if (!validResults) {
      return res.status(400).json({
        success: false,
        message: "Invalid results format. Each result must have name (string) and score (number 0-10)"
      });
    }

    // Prepare the test_results array to be embedded
    // No assessment_id is needed here if it's part of the same record
    const formattedTestResults = results.map(result => ({
      test_name: result.name,
      score: result.score,
      // You might want a timestamp for each individual test result if needed
      // submitted_at: new Date().toISOString() 
    }));

    // Insert main assessment record with embedded test results
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('continuous_assessments')
      .insert({
        child_id: child_id,
        total_score: total_score,
        created_at: new Date().toISOString(),
        test_results: formattedTestResults // Store the array directly
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
        submitted_at: assessmentData.created_at
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