import supabase from "../utils/supabaseClient.js";

export async function addTest6(req, res) {
  try {
    // console.log("Received request body:", req.body);

    let { childId, spokenWords } = req.body;

    // Generate a random 6-digit childId if missing
    if (!childId || childId.trim() === "" || childId === "undefined") {
      childId = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Generated random childId: ${childId}`);
    }

    if (!spokenWords || typeof spokenWords !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing spokenWords" });
    }

    // Ensure spokenWords are properly formatted (remove commas)
    spokenWords = spokenWords.replace(/,/g, "").trim();

    // Define correct words list
    const correctWordsList =
      `tree       little       milk       egg         book
school     sit          frog       playing     bun
flower     road         clock      train       light
picture    think        summer     people      something
dream      downstairs   biscuit    shepherd    thirsty
crowd      sandwich     beginning  postage     island
saucer     angel        sailing    appeared    knife
canary     attractive   imagine    nephew      gradually
smoulder   applaud      disposal   nourished   diseased
university orchestra    knowledge  audience    situated
physics    campaign     choir      intercede   fascinate
forfeit    siege        pavement   plausible   prophecy
colonel    soloist      systematic slovenly    classification
genuine    institution  pivot      conscience  heroic
pneumonia  preliminary  antique    susceptible enigma
oblivion   scintillate  satirical sabre       beguile
terrestrial belligerent adamant   sepulchre   statistics
miscellaneous procrastinate tyrannical evangelical grotesque
ineradicable judicature preferential homonym  fictitious
rescind    metamorphosis somnambulist bibliography idiosyncrasy`
        .split(/\s+/)
        .map((word) => word.toLowerCase());

    // Convert spoken words into an array with positions
    const spokenArray = spokenWords.split(/\s+/).map((word, index) => ({
      word: word.toLowerCase(),
      position: index + 1, // Start numbering from 1
    }));

    let correctGroups = [];
    let errorWords = [];
    let currentCorrectGroup = [];

    // Process spoken words to group continuous correct words
    spokenArray.forEach(({ word, position }, idx) => {
      if (correctWordsList.includes(word)) {
        // Add word to current correct group
        currentCorrectGroup.push({ word, position });
      } else {
        // If an incorrect word is encountered
        if (currentCorrectGroup.length > 0) {
          correctGroups.push(currentCorrectGroup); // Save the correct group
          currentCorrectGroup = []; // Reset for the next correct group
        }
        errorWords.push({ word, position }); // Store error word
      }

      // If last word is correct, add it to the correct groups
      if (idx === spokenArray.length - 1 && currentCorrectGroup.length > 0) {
        correctGroups.push(currentCorrectGroup);
      }
    });

    // Convert correct word groups to readable format
    const formattedCorrectGroups = correctGroups.map((group) =>
      group.map(({ word, position }) => `${word}(${position})`).join(" ")
    );

    // Convert error words to readable format
    const formattedErrorWords = errorWords.map(
      ({ word, position }) => `${word}(${position})`
    );

    // Calculate score (percentage of correct words)
    const totalCorrectWords = correctGroups.reduce(
      (acc, group) => acc + group.length,
      0
    );
    const score = (totalCorrectWords / correctWordsList.length) * 100;

    // Log output in server console
    // console.log("Correct Groups:", formattedCorrectGroups);
    // console.log("Error Words:", formattedErrorWords);
    // console.log(`Score: ${score.toFixed(2)}`);
    // Insert test results
    const { error } = await supabase.from("schonell_test_results").insert([
      {
        child_id: childId,
        spoken_words: spokenWords,
        correct_words: JSON.stringify(formattedCorrectGroups),
        incorrect_words: JSON.stringify(errorWords),
        score: score.toFixed(2),
      },
    ]);

    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: childId,
    });

    if (error || updateError) {
      throw error || updateError;
    }
    // Send response to frontend
    res.status(201).json({
      message: "Test6 processed successfully",
      childId,
      score: score.toFixed(2),
      correctGroups: formattedCorrectGroups,
      errorWords: formattedErrorWords,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Get all tests for a specific child
export async function getTestsByChild(req, res) {
  const { childId } = req.params;

  try {
    // Query the "test_results" table for the given childId
    const { data: tests, error } = await supabase
      .from("schonell_test_results")
      .select("*")
      .eq("child_id", childId); // Assuming "child_id" is the column name in your "test_results" table

    if (error) {
      throw error;
    }

    const testsWithNames = tests.map((test) => ({
      ...test,
      test_name: "Schonell Test",
    }));

    res.status(200).json({ tests: testsWithNames });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

export async function addTest16(req, res) {
  //Sound Discrimination Test
  let { childId, score } = req.body;
  try {
    const { data: tests, error } = await supabase
      .from("sound_discrimination_test_results")
      .insert([
        {
          child_id: childId,
          score: score,
        },
      ]);
    if (error) {
      throw error;
    }
    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: childId,
    });
    if (updateError) {
      throw updateError;
    }
    res
      .status(201)
      .json({ message: "Test16 processed successfully", childId, score });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

export async function getSoundTestByChild(req, res) {
  let { childId } = req.params;
  try {
    const { data: tests, error } = await supabase
      .from("sound_discrimination_test_results")
      .select("*")
      .eq("child_id", childId);

    if (error) {
      throw error;
    }

    const testsWithNames = tests.map((test) => ({
      ...test,
      test_name: "Sound Discrimination Test",
    }));

    res.status(200).json({ tests: testsWithNames });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

export async function addTest13(req, res) {
  let { childId, score, forwardCorrect, reverseCorrect } = req.body;

  try {
    const { data: tests, error } = await supabase
      .from("auditory_memory_test_results")
      .insert([
        {
          child_id: childId,
          score: score,
          forward_correct: forwardCorrect,
          reverse_correct: reverseCorrect,
        },
      ]);
    if (error) {
      console.log(error);
      throw error;
    }
    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: childId,
    });
    if (updateError) {
      console.log(updateError);
      throw updateError;
    }
    res.status(201).json({
      message: "Test13 processed successfully",
      childId,
      score,
      forwardCorrect,
      reverseCorrect,
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

export async function getTest13ByChild(req, res) {
  let { childId } = req.params;
  try {
    const { data: tests, error } = await supabase
      .from("auditory_memory_test_results")
      .select("*")
      .eq("child_id", childId);

    if (error) {
      throw error;
    }

    const testsWithNames = tests.map((test) => ({
      ...test,
      test_name: "Auditory Sequential Memory Test",
    }));

    res.status(200).json({ tests: testsWithNames });
  } catch (error) {
    console.error("Error fetching tests:", error);
    res.status(500).json({ message: "Server error", error });
  }
}
