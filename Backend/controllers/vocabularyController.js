// import supabase from "../utils/supabaseClient.js";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Ensure GEMINI_API_KEY is loaded from environment variables
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const vocabularyWords = [
//   { word: "house", level: "Base", ta: "வீடு", hi: "घर" },
//   { word: "box", level: "Base", ta: "பெட்டி", hi: "डिब्बा" },
//   { word: "book", level: "Base", ta: "புத்தகம்", hi: "किताब" },
//   { word: "ball", level: "Base", ta: "பந்து", hi: "गेंद" },
//   { word: "cat", level: "Base", ta: "பூனை", hi: "बिल्ली" },
//   { word: "tree", level: "Base", ta: "மரம்", hi: "पेड़" },
//   { word: "orange", level: "Base", ta: "ஆரஞ்சு", hi: "संतरा" },
//   { word: "school", level: "Base", ta: "பள்ளி", hi: "स्कूल" },
//   { word: "fish", level: "Base", ta: "மீன்", hi: "मछली" },
//   { word: "green", level: "5/6", ta: "பச்சை", hi: "हरा" },
//   { word: "spade", level: "5/6", ta: "மண்வாரி", hi: "फावड़ा" },
//   { word: "rescue", level: "7", ta: "மீட்பு", hi: "बचाव" },
//   { word: "battle", level: "7", ta: "போர்", hi: "युद्ध" },
//   { word: "brave", level: "8", ta: "தைரியமான", hi: "बहादुर" },
//   { word: "reply", level: "8", ta: "பதில்", hi: "जवाब" },
//   { word: "nonsense", level: "9", ta: "அர்த்தமில்லாத", hi: "बकवास" },
//   { word: "lecture", level: "9", ta: "விரிவுரை", hi: "व्याख्यान" },
//   { word: "connect", level: "10", ta: "இணை", hi: "जोड़ना" },
//   { word: "skill", level: "10", ta: "திறமை", hi: "कौशल" },
//   { word: "malaria", level: "10", ta: "மலேரியா", hi: "मलेरिया" },
//   { word: "microscope", level: "11", ta: "நுண்ணோக்கி", hi: "सूक्ष्मदर्शी" },
//   { word: "haste", level: "12", ta: "விரைவு", hi: "जल्दी" },
//   { word: "elevate", level: "12", ta: "உயர்த்து", hi: "उन्नत करना" },
//   { word: "liberty", level: "13", ta: "சுதந்திரம்", hi: "स्वतंत्रता" },
//   { word: "priceless", level: "13", ta: "விலைமதிப்பற்ற", hi: "अनमोल" },
//   { word: "espionage", level: "14", ta: "உளவு", hi: "जासूसी" },
// ];

// // Function to evaluate the child's definition using Gemini
// // Function to evaluate the child's definition using Gemini
// const evaluateDefinition = async (word, definition, language = "en") => {
//   // Use the gemini-1.5-flash model
//   const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//   if (!definition || definition.trim() === "") {
//     return { score: 0, feedback: "No definition provided" };
//   }

//   // Language-specific prompts
//   const prompts = {
//     ta: `
//       Word: "${word}"
//       Child's Tamil Definition: "${definition}"

//       Task: Evaluate if the child's Tamil definition indicates an understanding of the word's nature or use.
//       Consider synonyms, general classification, major use, definitive examples, or description of a definitive feature.
//       Do not be too strict on the definition as it is just a child.
//       Respond ONLY with:
//       "1|Acceptable" if the definition is adequate in Tamil.
//       "0|Unacceptable" if the definition is inadequate or incorrect in Tamil.
//       Provide a brief justification after the pipe symbol in English.
//     `,
//     en: `
//       Word: "${word}"
//       Child's Definition: "${definition}"

//       Task: Evaluate if the child's definition indicates an understanding of the word's nature or use.
//       Consider synonyms, general classification, major use, definitive examples, or description of a definitive feature.
//       Do not be too strict on the definition as it is just a child.
//       Based on the definition provided, is it acceptable? Respond ONLY with:
//       "1|Acceptable" if the definition is adequate.
//       "0|Unacceptable" if the definition is inadequate or incorrect.
//       Provide a brief justification after the pipe symbol.
//     `,
//   };

//   // Get the appropriate prompt based on language, default to English
//   const prompt = prompts[language] || prompts.en;

//   try {
//     const result = await model.generateContent(prompt);
//     const responseText = result.response.text();

//     // Parse the response which should be in the format "1|Acceptable" or "0|Unacceptable"
//     const parts = responseText.trim().split("|");
//     const score = parseInt(parts[0], 10);
//     const feedback = parts.length > 1 ? parts.slice(1).join("|") : "";

//     // Validate score - it should be 0 or 1
//     if (isNaN(score) || (score !== 0 && score !== 1)) {
//       console.warn(`Invalid score for word "${word}": ${responseText}`);
//       return { score: 0, feedback: "Unable to evaluate definition properly." };
//     }

//     return { score, feedback };
//   } catch (err) {
//     console.error(`Gemini error evaluating "${word}":`, err);
//     return { score: 0, feedback: "Evaluation error occurred." };
//   }
// };

// // Controller function to process test results and store them
// export async function evaluateVocabularyAndStore(req, res) {
//   const { child_id, responses, language } = req.body; // responses = [{ word: "house", definition: "where you live" }, ...]

//   if (!child_id || !Array.isArray(responses)) {
//     return res
//       .status(400)
//       .json({ error: "Missing child_id or responses array" });
//   }

//   try {
//     const processedResponses = [];
//     let totalScore = 0;

//     for (const item of responses) {
//       const { word, definition } = item;
//       // Find the word details (like level) - might be useful later
//       const wordDetail = vocabularyWords.find((w) => w.word === word);

//       const { score, feedback } = await evaluateDefinition(
//         word,
//         definition,
//         language
//       );

//       totalScore += score;

//       processedResponses.push({
//         word: word,
//         level: wordDetail ? wordDetail.level : "Unknown", // Store level if found
//         definition: definition,
//         score: score,
//         feedback: feedback,
//       });
//     }

//     // console.log("Vocabulary Test Score for child", child_id, ":", totalScore);

//     const { data, error } = await supabase
//       .from("vocabulary_test_results") // Ensure this table exists in Supabase
//       .insert([
//         {
//           child_id,
//           responses: processedResponses,
//           score: totalScore,
//           test_name: "Vocabulary Scale", // Consistent test name
//         },
//       ])
//       .select()
//       .single();

//     if (error) {
//       console.error("Supabase insert error:", error);
//       throw error; // Re-throw to be caught by the outer catch block
//     }

//     // Increment tests_taken count for the child
//     const { error: updateError } = await supabase.rpc("increment_tests_taken", {
//       child_id_param: child_id,
//     });

//     if (updateError) {
//       console.error("Supabase increment_tests_taken error:", updateError);
//       // Decide if this should prevent success response. Maybe log and continue.
//       // For now, we'll let the main result return but log the error.
//     }

//     return res.status(201).json({
//       id: data.id,
//       message: "Vocabulary test results stored successfully",
//       score: totalScore,
//     });
//   } catch (err) {
//     console.error("Error processing vocabulary test:", err);
//     // Provide a more specific error message if possible
//     const errorMessage = err.message || "Internal Server Error";
//     const errorCode = err.code || 500; // Use Supabase error code if available
//     return res
//       .status(errorCode === 404 ? 404 : 500)
//       .json({ error: errorMessage }); // Handle 'table not found' specifically if needed
//   }
// }

// // Function to get vocabulary test results by result ID
// export async function getVocabularyTestResultById(req, res) {
//   try {
//     const { id } = req.params;
//     const { data, error } = await supabase
//       .from("vocabulary_test_results") // Ensure this table exists
//       .select("*")
//       .eq("id", id)
//       .single();

//     if (error) throw error;
//     if (!data)
//       return res
//         .status(404)
//         .json({ error: "Vocabulary test results not found" });

//     return res.status(200).json(data);
//   } catch (err) {
//     console.error("Error fetching vocabulary test results:", err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// }

// // Function to get all vocabulary test results for a specific child
// export async function getVocabularyTestsByChild(req, res) {
//   const { childId } = req.params;
//   try {
//     const { data: tests, error } = await supabase
//       .from("vocabulary_test_results") // Ensure this table exists
//       .select("*")
//       .eq("child_id", childId);

//     if (error) throw error;

//     // Add test_name for consistency if needed, though it's already stored
//     const testsWithNames = tests.map((test) => ({
//       ...test,
//       test_name: test.test_name || "Vocabulary Scale", // Use stored name or default
//     }));

//     res.status(200).json({ tests: testsWithNames });
//   } catch (error) {
//     console.error("Error fetching child's vocabulary tests:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// }

// // Function to get the list of words for the test
// export function getVocabularyWords(req, res) {
//   try {
//     // Optionally filter or modify the list before sending
//     res.status(200).json({ words: vocabularyWords });
//   } catch (error) {
//     console.error("Error fetching vocabulary words:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// }

import supabase from "../utils/supabaseClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure GEMINI_API_KEY is loaded from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const vocabularyWords = [
  { word: "house", level: "Base", ta: "வீடு", hi: "घर" },
  { word: "box", level: "Base", ta: "பெட்டி", hi: "डिब्बा" },
  { word: "book", level: "Base", ta: "புத்தகம்", hi: "किताब" },
  { word: "ball", level: "Base", ta: "பந்து", hi: "गेंद" },
  { word: "cat", level: "Base", ta: "பூனை", hi: "बिल्ली" },
  { word: "tree", level: "Base", ta: "மரம்", hi: "पेड़" },
  { word: "orange", level: "Base", ta: "ஆரஞ்சு", hi: "संतरा" },
  { word: "school", level: "Base", ta: "பள்ளி", hi: "स्कूल" },
  { word: "fish", level: "Base", ta: "மீன்", hi: "मछली" },
  { word: "green", level: "5/6", ta: "पच्चै", hi: "हरा" },
  { word: "spade", level: "5/6", ta: "मண்வாரி", hi: "फावड़ा" },
  { word: "rescue", level: "7", ta: "மீட்பு", hi: "बचाव" },
  { word: "battle", level: "7", ta: "போர்", hi: "युद्ध" },
  { word: "brave", level: "8", ta: "தைரியமான", hi: "बहादुर" },
  { word: "reply", level: "8", ta: "பதில்", hi: "जवाब" },
  { word: "nonsense", level: "9", ta: "அர்த்தமில்லாத", hi: "बकवास" },
  { word: "lecture", level: "9", ta: "விரிவுரை", hi: "व्याख्यान" },
  { word: "connect", level: "10", ta: "இணை", hi: "जोड़ना" },
  { word: "skill", level: "10", ta: "திறமை", hi: "कौशल" },
  { word: "malaria", level: "10", ta: "மலேரியா", hi: "मलेरिया" },
  { word: "microscope", level: "11", ta: "நுண்ணோக்கி", hi: "सूक्ष्मदर्शी" },
  { word: "haste", level: "12", ta: "விரைவு", hi: "जल्दी" },
  { word: "elevate", level: "12", ta: "உயர்த்து", hi: "उन्नत करना" },
  { word: "liberty", level: "13", ta: "சுதந்திரம்", hi: "स्वतंत्रता" },
  { word: "priceless", level: "13", ta: "விலைமதிப்பற்ற", hi: "अनमोल" },
  { word: "espionage", level: "14", ta: "உளவு", hi: "जासूसी" },
];

// Function to evaluate the child's definition using Gemini
const evaluateDefinition = async (word, definition, language = "en") => {
  // Use the gemini-1.5-flash model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  if (!definition || definition.trim() === "") {
    return { score: 0, feedback: "No definition provided" };
  }

  // Language-specific prompts
  const prompts = {
    ta: `
      Word: "${word}"
      Child's Tamil Definition: "${definition}"

      Task: Evaluate if the child's Tamil definition indicates an understanding of the word's nature or use.
      Consider synonyms, general classification, major use, definitive examples, or description of a definitive feature.
      Do not be too strict on the definition as it is just a child.
      Respond ONLY with:
      "1|Acceptable" if the definition is adequate in Tamil.
      "0|Unacceptable" if the definition is inadequate or incorrect in Tamil.
      Provide a brief justification after the pipe symbol in English.
    `,
    hi: `
      Word: "${word}"
      Child's Hindi Definition: "${definition}"

      Task: Evaluate if the child's Hindi definition indicates an understanding of the word's nature or use.
      Consider synonyms, general classification, major use, definitive examples, or description of a definitive feature.
      Do not be too strict on the definition as it is just a child.
      Respond ONLY with:
      "1|Acceptable" if the definition is adequate in Hindi.
      "0|Unacceptable" if the definition is inadequate or incorrect in Hindi.
      Provide a brief justification after the pipe symbol in English.
    `,
    en: `
      Word: "${word}"
      Child's Definition: "${definition}"

      Task: Evaluate if the child's definition indicates an understanding of the word's nature or use.
      Consider synonyms, general classification, major use, definitive examples, or description of a definitive feature.
      Do not be too strict on the definition as it is just a child.
      Based on the definition provided, is it acceptable? Respond ONLY with:
      "1|Acceptable" if the definition is adequate.
      "0|Unacceptable" if the definition is inadequate or incorrect.
      Provide a brief justification after the pipe symbol.
    `,
  };

  // Get the appropriate prompt based on language, default to English
  const prompt = prompts[language] || prompts.en;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse the response which should be in the format "1|Acceptable" or "0|Unacceptable"
    const parts = responseText.trim().split("|");
    const score = parseInt(parts[0], 10);
    const feedback = parts.length > 1 ? parts.slice(1).join("|") : "";

    // Validate score - it should be 0 or 1
    if (isNaN(score) || (score !== 0 && score !== 1)) {
      console.warn(`Invalid score for word "${word}": ${responseText}`);
      return { score: 0, feedback: "Unable to evaluate definition properly." };
    }

    return { score, feedback };
  } catch (err) {
    console.error(`Gemini error evaluating "${word}":`, err);
    return { score: 0, feedback: "Evaluation error occurred." };
  }
};

// Controller function to process test results and store them
export async function evaluateVocabularyAndStore(req, res) {
  const { child_id, responses, language } = req.body; // responses = [{ word: "house", definition: "where you live" }, ...]

  if (!child_id || !Array.isArray(responses)) {
    return res
      .status(400)
      .json({ error: "Missing child_id or responses array" });
  }

  try {
    const processedResponses = [];
    let totalScore = 0;

    for (const item of responses) {
      const { word, definition } = item;
      // Find the word details (like level) - might be useful later
      const wordDetail = vocabularyWords.find((w) => w.word === word);

      const { score, feedback } = await evaluateDefinition(
        word,
        definition,
        language
      );

      totalScore += score;

      processedResponses.push({
        word: word,
        level: wordDetail ? wordDetail.level : "Unknown", // Store level if found
        definition: definition,
        score: score,
        feedback: feedback,
        translation: wordDetail ? wordDetail[language] || wordDetail.en : word, // Include translation if available
      });
    }

    const { data, error } = await supabase
      .from("vocabulary_test_results")
      .insert([
        {
          child_id,
          responses: processedResponses,
          score: totalScore,
          test_name: "Vocabulary Scale",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    // Increment tests_taken count for the child
    const { error: updateError } = await supabase.rpc("increment_tests_taken", {
      child_id_param: child_id,
    });

    if (updateError) {
      console.error("Supabase increment_tests_taken error:", updateError);
    }

    return res.status(201).json({
      id: data.id,
      message: "Vocabulary test results stored successfully",
      score: totalScore,
      language: language || "en",
    });
  } catch (err) {
    console.error("Error processing vocabulary test:", err);
    const errorMessage = err.message || "Internal Server Error";
    const errorCode = err.code || 500;
    return res
      .status(errorCode === 404 ? 404 : 500)
      .json({ error: errorMessage });
  }
}

// Function to get vocabulary test results by result ID
export async function getVocabularyTestResultById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("vocabulary_test_results")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data)
      return res
        .status(404)
        .json({ error: "Vocabulary test results not found" });

    return res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching vocabulary test results:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Function to get all vocabulary test results for a specific child
export async function getVocabularyTestsByChild(req, res) {
  const { childId } = req.params;
  try {
    const { data: tests, error } = await supabase
      .from("vocabulary_test_results")
      .select("*")
      .eq("child_id", childId);

    if (error) throw error;

    const testsWithNames = tests.map((test) => ({
      ...test,
      test_name: test.test_name || "Vocabulary Scale",
    }));

    res.status(200).json({ tests: testsWithNames });
  } catch (error) {
    console.error("Error fetching child's vocabulary tests:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}

// Function to get the list of words for the test
export function getVocabularyWords(req, res) {
  try {
    // Optionally filter by language if needed
    const { language } = req.query;
    let wordsToSend = vocabularyWords;

    if (language) {
      wordsToSend = vocabularyWords.map((wordObj) => ({
        word: wordObj.word,
        level: wordObj.level,
        translation: wordObj[language] || wordObj.en, // Fallback to English if translation not available
      }));
    }

    res.status(200).json({ words: wordsToSend });
  } catch (error) {
    console.error("Error fetching vocabulary words:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
