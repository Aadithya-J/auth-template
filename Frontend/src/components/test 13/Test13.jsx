import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle,
  HelpCircle,
  Mic,
  MicOff,
  Send,
  Volume2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext";
import test13Translations from "./test13Translations.json";
const DIGIT_DISPLAY_TIME = 1000;
const PAUSE_BETWEEN_DIGITS = 200;
const STARTING_FORWARD_SEQUENCES = [
  [4, 9],
  [3, 8],
  [7, 1, 2],
  [2, 6, 2],
  [6, 3, 5, 1],
  [1, 4, 5, 2],
  [2, 7, 4, 6, 9],
  [2, 4, 7, 1, 6],
  [6, 9, 1, 8, 3, 7],
  [1, 4, 5, 4, 7, 6],
];

const STARTING_REVERSE_SEQUENCES = [
  [7, 5],
  [2, 7],
  [5, 2, 7],
  [0, 1, 9],
  [4, 7, 3, 5],
  [1, 6, 8, 5],
  [1, 7, 5, 0, 4],
  [3, 5, 2, 1, 7],
  [8, 3, 9, 7, 5, 3],
  [1, 4, 0, 4, 7, 2],
];

const MAX_ERRORS = 2;

// --- Helper Functions ---


// --- Component ---
function Test13({ suppressResultPage = false, onComplete }) {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  
  const langData = test13Translations[language] || test13Translations.en;
  const STARTING_FORWARD_SEQUENCES = langData.questions.forward;
  const STARTING_REVERSE_SEQUENCES = langData.questions.reverse;
  const [gameState, setGameState] = useState("instructions"); // instructions, presenting, listening, evaluating, finished
  const [mode, setMode] = useState("forward"); // forward, reverse
  const [sequences, setSequences] = useState(STARTING_FORWARD_SEQUENCES);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [displayedDigit, setDisplayedDigit] = useState(null); // The digit currently shown
  const [digitIndex, setDigitIndex] = useState(0); // Index for presenting digits

  const [forwardScore, setForwardScore] = useState(0);
  const [reverseScore, setReverseScore] = useState(0);
  const [forwardErrors, setForwardErrors] = useState(0);
  const [reverseErrors, setReverseErrors] = useState(0);

  // Add effect to handle test completion
  useEffect(() => {
    if (gameState === "finished" && suppressResultPage && onComplete) {
      // Calculate final score - same formula used in submitResults
      const finalScore = Math.round((forwardScore + reverseScore) / 2);
      onComplete(finalScore);
    }
  }, [gameState, suppressResultPage, onComplete, forwardScore, reverseScore]);

  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null); // 'correct', 'incorrect', null
  const mediaRecorderRef = useRef(null);
  const timeoutRef = useRef(null);
  const presentNextDigitLogicRef = useRef(); // Ref to hold the latest logic

  const speakText = (text, rate = 0.9, pitch = 1.1) => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = rate;
    speech.pitch = pitch;

    // Set language based on current language
    if (language === "ta") {
      speech.lang = "ta-IN"; // Tamil
    } else if (language === "hi") {
      speech.lang = "hi-IN"; // Hindi
    } else {
      speech.lang = "en-US"; // Default to English
    }

    speech.onend = () => {
      console.log("Speech finished");
    };

    window.speechSynthesis.speak(speech);
  } else {
    console.warn("Speech synthesis not supported in this browser.");
  }
};
 
const parseTranscript = (transcriptInput) => {
  const currentLangData = test13Translations[language] || test13Translations.en;
  let digitMap = currentLangData.digitMap || {};

  if (Object.keys(digitMap).length === 0 && language !== "en" && test13Translations.en && test13Translations.en.digitMap) {
    console.warn(`parseTranscript: No digitMap for language "${language}", falling back to English digitMap.`);
    digitMap = test13Translations.en.digitMap;
  }
  
  if (Object.keys(digitMap).length === 0) {
      console.error(`parseTranscript: Critical - No digitMap available for language "${language}" and no English fallback. Cannot parse.`);
      return [];
  }


  if (!transcriptInput || transcriptInput.trim() === "") {
    console.log("parseTranscript: Input is empty or only whitespace (early exit).");
    return [];
  }

  let processedTranscript = transcriptInput
    .toLowerCase() // Convert to lowercase for consistent matching
    .replace(/[.,!?]/g, "") // Remove common punctuation
    .trim();
  console.log(`parseTranscript STAGE 1: Initial processed input: "${processedTranscript}" (Original: "${transcriptInput}")`);

  const sortedWords = Object.keys(digitMap).sort(
    (a, b) => b.length - a.length
  );

  let anyReplacementMade = false;
  for (const word of sortedWords) {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<!\\p{L})${escapedWord}(?!\\p{L})`, "gui");

    if (regex.test(processedTranscript)) { // Check if the word exists before attempting replacement
      processedTranscript = processedTranscript.replace(regex, String(digitMap[word]));
      anyReplacementMade = true;
      console.log(`parseTranscript STAGE 2: After replacing "${word}" with "${digitMap[word]}": "${processedTranscript}"`);
    }
  }

  if (!anyReplacementMade && processedTranscript.length > 0 && !(/^\s*[\d\s]+\s*$/.test(processedTranscript))) {
    console.warn(`parseTranscript STAGE 2: No replacements made from digitMap, and transcript is not purely digits/spaces. Transcript: "${processedTranscript}"`);
  } else if (anyReplacementMade) {
    console.log(`parseTranscript STAGE 2: Final after all potential digitMap replacements: "${processedTranscript}"`);
  }

  console.log(`parseTranscript STAGE 3: After stripping all non-digits (except spaces): "${numbersAndSpaces}"`);

  let cleaned = numbersAndSpaces.trim().replace(/\s+/g, " ");
  console.log(`parseTranscript STAGE 4: Final cleaned (should be only digits and single spaces): "${cleaned}"`);

  if (cleaned === "") {
    console.warn(
      `parseTranscript STAGE 4: Cleaned transcript is empty. Original input: "${transcriptInput}", Processed before final clean (numbersAndSpaces): "${numbersAndSpaces}"`
    );
    return [];
  }

  const spaceSplit = cleaned.split(" ").filter((s) => s !== ""); // Filter out empty strings from split

  if (
    spaceSplit.length > 0 &&
    spaceSplit.every((item) => /^\d$/.test(item) && item.length === 1) // Ensure each part is a single digit
  ) {
    const result = spaceSplit.map(Number);
    console.log("parseTranscript STAGE 5: Parsed successfully via spaceSplit:", result);
    return result;
  }
  console.log("parseTranscript STAGE 5: Failed to parse via spaceSplit. Current spaceSplit array:", spaceSplit);

  const concatenated = cleaned.replace(/\s+/g, ""); // Remove all spaces
  if (concatenated.length > 0 && /^\d+$/.test(concatenated)) { // Check if it's purely digits
    const result = concatenated.split("").map(Number);
    console.log("parseTranscript STAGE 5: Parsed successfully via concatenated digits:", result);
    return result;
  }
  console.log("parseTranscript STAGE 5: Failed to parse via concatenated digits. Current concatenated string:", concatenated);

  console.warn(
    "parseTranscript STAGE 5: All parsing attempts failed. Could not reliably parse numbers.",
    `Original Input: "${transcriptInput}"`,
    `Cleaned String (final before parse attempts): "${cleaned}"`
  );
  return [];
};

  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // --- Define functions first before they're used ---
  const uploadAudio = useCallback(
    async (audioBlob) => {
      const formData = new FormData();
      const file = new File([audioBlob], "user_digit_span.wav", {
        type: "audio/wav",
      });
      formData.append("file", file);
      formData.append("language", language);
      setIsTranscribing(true);
      setEvaluationResult(null);
      try {
        console.log("Attempting to upload audio for language:", language);
        const response = await fetch(`${backendURL}/transcribe`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("Transcription API Response:", result); // Detailed logging
        console.log("Raw transcription from backend:", result.transcription);
        console.log("Language sent to backend for this transcription:", language);
        console.log("Full API Response from /transcribe:", result);

        if (response.ok) {
          setTranscript(result.transcription || "");
          setGameState("evaluating");
        } else {
          console.error("Transcription error response:", result);
          toast.error(t("transcription_failed"));
          setGameState("listening");
        }
      } catch (error) {
        console.error("Error uploading audio:", error);
        toast.error(t("audio_upload_error"));
        setGameState("listening");
      } finally {
        setIsTranscribing(false);
      }
    },
    [t]
  );

  const stopListening = useCallback(() => {
 
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping MediaRecorder:", e);
      }
    }

    if (window.stream) {
      try {
        window.stream.getTracks().forEach((track) => {
          track.stop();
        });
        // console.log("Audio tracks stopped.");
      } catch (e) {
        console.error("Error stopping stream tracks:", e);
      }
      window.stream = null;
    }

    mediaRecorderRef.current = null;

    if (isRecordingRef.current) {
      setIsRecording(false);
    }
  }, [isRecordingRef]); 

  const startListening = useCallback(() => {
    if (isRecordingRef.current) {
      return;
    }

    setTranscript("");
    setEvaluationResult(null);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
        let localAudioChunks = [];

        if (stream.getAudioTracks().length > 0) {
          stream.getAudioTracks()[0].onended = () => {
            console.warn("Audio track ended unexpectedly!");
            stopListening();
          };
        }

        const newMediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = newMediaRecorder;
        newMediaRecorder.onstart = () => {
        };

        // Simplified ondataavailable
        newMediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            localAudioChunks.push(event.data);
          }
        };

        // Simplified onstop: Only handle data upload
        newMediaRecorder.onstop = async () => {
          //  console.log("MediaRecorder onstop triggered. State:", newMediaRecorder.state);
          // NO state changes here
          if (localAudioChunks.length > 0) {
            const audioBlob = new Blob(localAudioChunks, { type: "audio/wav" });
            //  const chunksToUpload = [...localAudioChunks];
            localAudioChunks = [];
            //  console.log(`Uploading ${chunksToUpload.length} audio chunks from onstop.`);
            await uploadAudio(audioBlob);
          } else {
            console.log("No audio chunks recorded in onstop.");
          }
        };

        newMediaRecorder.onerror = (event) => {
          console.error(
            "MediaRecorder error event:",
            event.error,
            "State:",
            newMediaRecorder.state
          );
          stopListening(); // Use the main cleanup function on error
        };

        // Start recording
        try {
          newMediaRecorder.start();
        } catch (e) {
          console.error("Error calling MediaRecorder.start():", e);
          stopListening(); // Cleanup on start error
          return; // Don't proceed to set state if start failed
        }

        setIsRecording(true);
      })
      .catch((error) => {
        console.error("Error accessing microphone (getUserMedia):", error);
        toast.error(t("microphone_access_error"));
        // stopListening handles state cleanup
        stopListening();
      });
  }, [uploadAudio, stopListening, isRecordingRef, t]); // Keep dependencies

  // Define stablePresentNextDigit before it's used
  const stablePresentNextDigit = useCallback((sequence, index) => {
    // Call the current implementation in the ref
    if (presentNextDigitLogicRef.current) {
      presentNextDigitLogicRef.current(sequence, index);
    }
  }, []);

  // --- Game Logic Callbacks ---
  // Memoized: Transition to the next mode (forward -> reverse or reverse -> finished)
  const moveToNextMode = useCallback(() => {
    // console.log("Moving to next mode...");
    stopListening();
    setEvaluationResult(null);
    setTranscript("");

    if (mode === "forward") {
      if (reverseErrors >= MAX_ERRORS) {
        setGameState("finished");
      } else {
        setMode("reverse");
        setSequences(STARTING_REVERSE_SEQUENCES);
        setSequenceIndex(0);
        setGameState("instructions_reverse");
      }
    } else {
      setGameState("finished");
    }
  }, [mode, reverseErrors, stopListening]);

  // Memoized: Transition to the next sequence within the current mode
  const moveToNextSequence = useCallback(() => {
    // console.log("Moving to next sequence...");
    stopListening();
    setEvaluationResult(null);
    setTranscript("");

    if (sequenceIndex + 1 < sequences.length) {
      setSequenceIndex((prev) => prev + 1);
      setGameState("presenting"); // Go to presenting first
    } else {
      moveToNextMode();
    }
  }, [sequenceIndex, sequences.length, moveToNextMode, stopListening]);

  // Memoized: Evaluate the user's transcribed answer
  const evaluateAnswer = useCallback(() => {
    const userAnswer = parseTranscript(transcript);
    const correctAnswer =
      mode === "forward" ? currentSequence : [...currentSequence].reverse();

    if (userAnswer.length === 0 && transcript && transcript.trim() !== "") {
      toast.warning(t("could_not_understand_numbers_clearly")); // New, more specific toast
      setTranscript(""); 
      if (mode === "forward") setForwardErrors((prev) => prev + 1);
      else setReverseErrors((prev) => prev + 1);

      const currentModeErrors = mode === "forward" ? forwardErrors + 1 : reverseErrors + 1;
      if (currentModeErrors >= MAX_ERRORS) {
        moveToNextMode();
      } else {
        moveToNextSequence();
      }
      return;
    }

    if (userAnswer.length === 0 && (!transcript || transcript.trim() === "")) {
        toast.info(t("no_response_recorded_try_next")); // Feedback for no input
        // Treat as an error
        if (mode === "forward") setForwardErrors((prev) => prev + 1);
        else setReverseErrors((prev) => prev + 1);

        const currentModeErrors = mode === "forward" ? forwardErrors + 1 : reverseErrors + 1;
        if (currentModeErrors >= MAX_ERRORS) {
            moveToNextMode();
        } else {
            moveToNextSequence();
        }
        return;
    }


    let isCorrect =
      userAnswer.length === correctAnswer.length &&
      userAnswer.every((digit, i) => digit === correctAnswer[i]);

    setEvaluationResult(isCorrect ? "correct" : "incorrect");
    // Set feedback state based on correctness

    if (isCorrect) {
      speakText(t("correct"), 0.9, 1.3);
      if (mode === "forward") setForwardScore((prev) => prev + 1);
      else setReverseScore((prev) => prev + 1);
      moveToNextSequence();
    } else {
      speakText(t("not_quite_try_next"), 0.9, 1.0);
      if (mode === "forward") setForwardErrors((prev) => prev + 1);
      else setReverseErrors((prev) => prev + 1);

      if (
        (mode === "forward" && forwardErrors + 1 >= MAX_ERRORS) ||
        (mode === "reverse" && reverseErrors + 1 >= MAX_ERRORS)
      ) {
        moveToNextMode();
      } else {
        moveToNextSequence();
      }
    }
  }, [
    transcript,
    mode,
    currentSequence,
    forwardErrors,
    reverseErrors,
    moveToNextSequence,
    moveToNextMode,
    t,
    speakText
  ]);
  useEffect(() => {
    // Store a function that will call whatever is in the ref
    presentNextDigitLogicRef.current = (sequence, index) => {
      if (index >= sequence.length) {
        setDisplayedDigit(null);
        timeoutRef.current = setTimeout(() => {
          setGameState("listening");
        }, 500);
        return;
      }

      const digit = sequence[index];
      setDisplayedDigit(digit);
      speakText(String(digit), 1, 1.2);

      timeoutRef.current = setTimeout(() => {
        setDisplayedDigit(null);
        timeoutRef.current = setTimeout(() => {
          if (presentNextDigitLogicRef.current) {
            presentNextDigitLogicRef.current(sequence, index + 1);
          }
        }, PAUSE_BETWEEN_DIGITS);
      }, DIGIT_DISPLAY_TIME);
    };
  }, [mode]);

  // --- Cleanup Effect ---
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopListening();
    };
  }, [stopListening]);

  useEffect(() => {
    if (gameState === "presenting" && sequenceIndex < sequences.length) {
      setCurrentSequence(sequences[sequenceIndex]);
      setDigitIndex(0);
      setTranscript("");
      setEvaluationResult(null);
      timeoutRef.current = setTimeout(
        () => stablePresentNextDigit(sequences[sequenceIndex], 0),
        500
      );
    }
    return () => clearTimeout(timeoutRef.current);
  }, [gameState, sequenceIndex, sequences, stablePresentNextDigit]);

  // Effect to auto-start recording when moving to listening state
  useEffect(() => {
    if (gameState === "listening") {
      // console.log("Gamestate changed to listening, scheduling startListening...");
      speakText(
        mode === "forward"
          ? t("your_turn_say_numbers")
          : t("your_turn_say_numbers_backwards")
      );

      const startTimeout = setTimeout(() => {
        if (!isRecordingRef.current) {
          console.log("Timeout finished (1500ms), calling startListening");
          startListening();
        }
      }, 1500); // Increased delay
      return () => {
        //  console.log("Clearing startListening timeout.");
        clearTimeout(startTimeout);
      };
    }
  }, [gameState, startListening, mode, t]); // Keep dependencies

  // Effect to trigger evaluation
  useEffect(() => {
    if (gameState === "evaluating" && transcript) {
      evaluateAnswer();
    }
  }, [evaluateAnswer, gameState, transcript]);

  // --- Other Handlers ---
  const startTest = useCallback(
    (selectedMode) => {
      setMode(selectedMode);
      setSequences(
        selectedMode === "forward"
          ? STARTING_FORWARD_SEQUENCES
          : STARTING_REVERSE_SEQUENCES
      );
      setSequenceIndex(0);
      setReverseScore(0);
      setReverseErrors(0);
      setTranscript("");
      setEvaluationResult(null);
      setGameState("presenting");
    },
    [STARTING_FORWARD_SEQUENCES, STARTING_REVERSE_SEQUENCES]
  );

  const handleStartForward = useCallback(() => {
    speakText(t("start_forward_instructions"));
    startTest("forward");
  }, [startTest, t]);

  const handleStartReverse = useCallback(() => {
    speakText(t("start_reverse_instructions"));
    startTest("reverse");
  }, [startTest, t]);

  const submitResults = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      toast.error(t("no_student_selected"));
      return;
    }

    // Final score calculation: Total correct / 2, rounded
    const finalScore = Math.round((forwardScore + reverseScore) / 2);

    try {
      const response = await axios.post(
        `${backendURL}/addTest13`,
        {
          childId: childId,
          score: finalScore,
          forwardCorrect: forwardScore,
          reverseCorrect: reverseScore,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        toast.success(t("test_submitted_success", { score: finalScore }), {
          position: "top-center",
          autoClose: 5000,
          onClose: () => navigate("/"),
        });
      } else {
        toast.error(t("submit_results_failed"));
      }
    } catch (error) {
      console.error("Error submitting test results:", error);
      toast.error(t("submit_error_check_connection"));
    }
  }, [forwardScore, reverseScore, navigate, t]);

  // --- UI Rendering ---
  const renderInstructions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center p-10 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto border border-gray-100"
    >
      <div className="mb-8">
        <Volume2 size={64} className="mx-auto text-blue-600" />
      </div>
      <h2 className="text-4xl font-bold text-gray-800 mb-8">
        {t("memory_test")}
      </h2>
      <div className="space-y-6 mb-10">
        <p className="text-xl text-gray-600 leading-relaxed">
          {t("welcome_memory_game")}
        </p>
        <ul className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <li className="flex items-center gap-4 bg-blue-50 p-6 rounded-xl">
            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg">
              1
            </span>
            <span className="text-lg text-gray-700">
              {t("listen_carefully_numbers")}
            </span>
          </li>
          <li className="flex items-center gap-4 bg-blue-50 p-6 rounded-xl">
            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg">
              2
            </span>
            <span className="text-lg text-gray-700">
              {t("repeat_back_exactly")}
            </span>
          </li>
          <li className="flex items-center gap-4 bg-blue-50 p-6 rounded-xl">
            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg">
              3
            </span>
            <span className="text-lg text-gray-700">
              {t("start_easy_get_harder")}
            </span>
          </li>
        </ul>
      </div>
      <button
        onClick={handleStartForward}
        className="group relative px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
      >
        {t("start_test")}
      </button>
    </motion.div>
  );

  const renderReverseInstructions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center p-10 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto border border-gray-100"
    >
      <div className="mb-8">
        <HelpCircle size={64} className="mx-auto text-blue-600" />
      </div>
      <h2 className="text-4xl font-bold text-gray-800 mb-8">
        {t("level_up_reverse_challenge")}
      </h2>
      <div className="space-y-6 mb-10">
        <p className="text-xl text-gray-600 leading-relaxed">
          {t("now_exciting_twist")}
        </p>
        <div className="bg-blue-50 p-8 rounded-xl max-w-2xl mx-auto">
          <p className="text-xl text-gray-700">
            {t("if_i_say")}{" "}
            <span className="font-bold text-blue-600">1 - 3 - 5</span>
            <br />
            {t("you_say")}{" "}
            <span className="font-bold text-blue-600">5 - 3 - 1</span>
          </p>
        </div>
      </div>
      <button
        onClick={handleStartReverse}
        className="group relative px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
      >
        {t("start_reverse_challenge")}
      </button>
    </motion.div>
  );

  const renderPresenting = () => (
    <motion.div
      className="flex flex-col items-center justify-center space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative h-80 w-80 flex items-center justify-center">
        <AnimatePresence>
          {displayedDigit !== null && (
            <motion.div
              key={digitIndex}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
                transition: { type: "spring", stiffness: 200, damping: 15 },
              }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-9xl font-bold text-blue-600 p-10 bg-white rounded-2xl shadow-lg border border-gray-100">
                {displayedDigit}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div
        className="text-2xl font-medium text-gray-700 bg-blue-50 px-8 py-4 rounded-xl shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {t("listen_carefully")}
      </motion.div>
    </motion.div>
  );

  const renderListening = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center space-y-8 p-10 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto border border-gray-100"
    >
      <h3 className="text-2xl font-bold text-gray-800">
        {mode === "forward"
          ? t("repeat_numbers_order")
          : t("say_numbers_reverse")}
      </h3>

      <div className="flex items-center gap-6">
        <motion.button
          onClick={stopListening}
          disabled={!isRecording}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative rounded-xl h-16 w-16 flex items-center justify-center transition-all duration-300 shadow-md ${
            !isRecording
              ? "bg-gray-100 cursor-not-allowed text-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          {isRecording && (
            <motion.span
              className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.button>

        {isRecording && !isTranscribing && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl"
          >
            <span className="text-lg font-medium">{t("recording")}</span>
            <span className="flex gap-0.5">
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
              >
                •
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
              >
                •
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, delay: 1 }}
              >
                •
              </motion.span>
            </span>
          </motion.div>
        )}
      </div>

      {isTranscribing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            className="w-16 h-16 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </motion.div>
          <div className="text-xl text-blue-600 font-medium">
            {t("processing_your_answer")}
          </div>
        </motion.div>
      )}

      {transcript && !isTranscribing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl"
        >
          <p className="text-lg text-gray-600">
            {t("you_said")}:{" "}
            <strong className="text-gray-800">{transcript}</strong>
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {evaluationResult && (
          <motion.div
            key="evaluationFeedback"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center space-y-4 mt-6"
          >
            {evaluationResult === "correct" ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle size={48} className="text-green-600" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 text-green-600 px-8 py-4 rounded-xl border border-green-200"
                >
                  <span className="text-2xl font-bold">{t("correct")}!</span>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <XCircle size={48} className="text-blue-600" />
                </motion.div>
                <div className="bg-blue-50 text-blue-600 px-8 py-4 rounded-xl border border-blue-200">
                  <span className="text-2xl font-bold">
                    {t("lets_try_next_one")}
                  </span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderFinished = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl mx-auto mt-10 border border-blue-200 text-center"
    >
      <CheckCircle size={80} className="mx-auto text-blue-600 mb-6" />
      <h2 className="text-4xl font-bold text-gray-800 mb-10">
        {t("challenge_complete")}!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-blue-50 p-8 rounded-xl">
          <h3 className="text-xl text-gray-700 mb-3">{t("forward_score")}</h3>
          <p className="text-4xl font-bold text-blue-600">
            {forwardScore} / {STARTING_FORWARD_SEQUENCES.length}
          </p>
        </div>
        <div className="bg-blue-50 p-8 rounded-xl">
          <h3 className="text-xl text-gray-700 mb-3">{t("reverse_score")}</h3>
          <p className="text-4xl font-bold text-blue-600">
            {reverseScore} / {STARTING_REVERSE_SEQUENCES.length}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-10 rounded-xl mb-10">
        <h3 className="text-2xl text-gray-700 mb-3">{t("final_score")}</h3>
        <p className="text-6xl font-extrabold text-blue-600">
          {Math.round((forwardScore + reverseScore) / 2)} / 10
        </p>
      </div>

      {!suppressResultPage && (
        <motion.button
          onClick={submitResults}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
        >
          <Send size={24} />
          <span>{t("submit_results")}</span>
        </motion.button>
      )}
    </motion.div>
  );
  return (
    <div className="h-screen overflow-y-auto bg-gray-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto w-full">
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        {(gameState === "presenting" ||
          gameState === "listening" ||
          gameState === "evaluating") && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <span className="text-lg font-medium text-gray-600">
                  {t("mode")}:{" "}
                  <span className="font-bold capitalize text-blue-600">
                    {mode}
                  </span>
                </span>
                <span className="text-lg font-medium text-gray-600">
                  {t("sequence")}:{" "}
                  <span className="font-bold text-blue-600">
                    {sequenceIndex + 1}
                  </span>{" "}
                  / <span className="text-gray-600">{sequences.length}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-gray-600">
                  {t("errors")}:
                </span>
                <div className="flex gap-2">
                  {[...Array(MAX_ERRORS)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-full transition-colors duration-300 ${
                        i < (mode === "forward" ? forwardErrors : reverseErrors)
                          ? "bg-red-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {gameState === "instructions" && (
            <motion.div key="instructions" exit={{ opacity: 0 }}>
              {renderInstructions()}
            </motion.div>
          )}
          {gameState === "instructions_reverse" && (
            <motion.div key="instructions_reverse" exit={{ opacity: 0 }}>
              {renderReverseInstructions()}
            </motion.div>
          )}
          {gameState === "presenting" && (
            <motion.div
              key="presenting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-10"
            >
              {renderPresenting()}
            </motion.div>
          )}
          {(gameState === "listening" || gameState === "evaluating") && (
            <motion.div
              key="listening-evaluating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderListening()}
            </motion.div>
          )}
          {gameState === "finished" && !suppressResultPage && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {renderFinished()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Test13;
