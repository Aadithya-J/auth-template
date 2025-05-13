import supabase from "../utils/supabaseClient.js";

export async function addTest6(req, res) {
  try {
    let { childId, spokenWords, language } = req.body;

    if (!language || (language !== "en" && language !== "ta")) {
      return res
        .status(400)
        .json({ message: "Invalid or missing language. Use 'en' or 'ta'." });
    }

    if (!childId || childId.trim() === "" || childId === "undefined") {
      childId = Math.floor(100000 + Math.random() * 900000).toString();
      console.log(`Generated random childId: ${childId}`);
    }

    if (!spokenWords || typeof spokenWords !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid or missing spokenWords" });
    }

    spokenWords = spokenWords.replace(/,/g, "").trim();

    const correctWordsListRaw = {
      en: `tree       little       milk       egg         book
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
rescind    metamorphosis somnambulist bibliography idiosyncrasy`,

      ta: `மரம்       சிறியது        பால்         மூடு
பள்ளி      உட்காரு        தவளை        விளையாடு
மலர்       சாலை          கோடை        ரயில்
படம்       நினை          பிஸ்கட்       மக்கள்
கனவு       தாழ்த்திடம்     படகுப்பயணம்  மேய்ப்பவன்
கூட்டம்     சாண்ட்விச்சு   பாடல்        அஞ்சல்
தட்டம்      தேவதை         அகற்றல்      விழி
கிளி       அழகான         பதிவு        தோற்றம்
புகை       இசைக்குழு      அறிவு        நம்பிக்கை
பேச்சு      பிரச்சாரம்      வழித்தடம்    அழிவுபெறு
கேப்டன்     பிரச்சினை      படைப்பாளர்  வாலிபன்
நிகழ்ச்சி   தனிப்பாடகர்    பொதி         செயலாக்கம்
அறிவு      நிறுவனம்       கட்டுப்பாடு   நம்பகமுள்ள
நினைவு     முதன்மை        முயற்சி      பாதுகாப்பு
துவக்கம்    விழிப்புணர்வு   நகைச்சுவை    பகிர்வு
அறிகுறி    போர்வீரன்      தற்செயல்      போதுமான
சிலப்பம்    முடக்கிக் கொள்  முடிவு       வெளிச்சம்
புகழ்      நீதிநிலை       விருப்பம்     உலகின்`,
    };

    const correctWordsList = correctWordsListRaw[language]
      .split(/\s+/)
      .map((word) => word.toLowerCase());

    const spokenArray = spokenWords.split(/\s+/).map((word, index) => ({
      word: word.toLowerCase(),
      position: index + 1,
    }));

    let correctGroups = [];
    let errorWords = [];
    let currentCorrectGroup = [];

    spokenArray.forEach(({ word, position }, idx) => {
      if (correctWordsList.includes(word)) {
        currentCorrectGroup.push({ word, position });
      } else {
        if (currentCorrectGroup.length > 0) {
          correctGroups.push(currentCorrectGroup);
          currentCorrectGroup = [];
        }
        errorWords.push({ word, position });
      }

      if (idx === spokenArray.length - 1 && currentCorrectGroup.length > 0) {
        correctGroups.push(currentCorrectGroup);
      }
    });

    const formattedCorrectGroups = correctGroups.map((group) =>
      group.map(({ word, position }) => `${word}(${position})`).join(" ")
    );

    const formattedErrorWords = errorWords.map(
      ({ word, position }) => `${word}(${position})`
    );

    const totalCorrectWords = correctGroups.reduce(
      (acc, group) => acc + group.length,
      0
    );
    const score = (totalCorrectWords / correctWordsList.length) * 100;

    const { error } = await supabase.from("schonell_test_results").insert([
      {
        child_id: childId,
        spoken_words: spokenWords,
        correct_words: JSON.stringify(formattedCorrectGroups),
        incorrect_words: JSON.stringify(errorWords),
        score: score.toFixed(2),
        test_name:
          language === "en" ? "Schonell English Test" : "Schonell Tamil Test",
      },
    ]);

    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: childId,
    });

    if (error || updateError) {
      throw error || updateError;
    }

    res.status(201).json({
      message: "Test processed successfully",
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
          test_name: "Sound Discrimination Test",
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
          test_name: "Auditory Sequential Memory Test",
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
