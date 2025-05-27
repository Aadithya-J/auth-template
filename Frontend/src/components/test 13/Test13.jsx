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
  Loader2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext";
import test13Translations from "./test13Translations.json";
import backgroundImage from "../../assets/auditory-test/backgroundImage.png";
import characterImage from "../../assets/auditory-test/characterImage.png";
import { FaChevronRight, FaCheck, FaArrowLeft, FaPlay } from "react-icons/fa";

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
  const [showIntro, setShowIntro] = useState(true);
  const [currentDialog, setCurrentDialog] = useState(0);
  const dialog = [
    "🎶 Welcome, traveler, to Echo Hollow. Here, the walls hum with ancient melodies.",
    "🦇 I am Harmony, keeper of these sounds. Your memory shall be your guide.",
    "🎵 Listen closely to the notes that echo through these caves. Repeat them exactly as you hear them.",
    "✨ Should you succeed, you will be rewarded with the Shell of Memory and the Whispering Horn.",
    "🎼 Are you ready to test your mind's ear? Let the echoes guide you.",
  ];

  const handleNext = () => {
    if (currentDialog < dialog.length - 1) {
      setCurrentDialog((prev) => prev + 1);
    } else {
      setShowIntro(false);
      speakText(t("start_forward_instructions")); // Start the test instructions
    }
  };

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
    const currentLangData =
      test13Translations[language] || test13Translations.en;
    let digitMap = currentLangData.digitMap || {};

    if (
      Object.keys(digitMap).length === 0 &&
      language !== "en" &&
      test13Translations.en &&
      test13Translations.en.digitMap
    ) {
      console.warn(
        `parseTranscript: No digitMap for language "${language}", falling back to English digitMap.`
      );
      digitMap = test13Translations.en.digitMap;
    }

    if (Object.keys(digitMap).length === 0) {
      console.error(
        `parseTranscript: Critical - No digitMap available for language "${language}" and no English fallback. Cannot parse.`
      );
      return [];
    }

    if (!transcriptInput || transcriptInput.trim() === "") {
      console.log(
        "parseTranscript: Input is empty or only whitespace (early exit)."
      );
      return [];
    }

    let processedTranscript = transcriptInput
      .toLowerCase() // Convert to lowercase for consistent matching
      .replace(/[.,!?]/g, "") // Remove common punctuation
      .trim();
    console.log(
      `parseTranscript STAGE 1: Initial processed input: "${processedTranscript}" (Original: "${transcriptInput}")`
    );

    const sortedWords = Object.keys(digitMap).sort(
      (a, b) => b.length - a.length
    );

    let anyReplacementMade = false;
    for (const word of sortedWords) {
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?<!\\p{L})${escapedWord}(?!\\p{L})`, "gui");

      if (regex.test(processedTranscript)) {
        // Check if the word exists before attempting replacement
        processedTranscript = processedTranscript.replace(
          regex,
          String(digitMap[word])
        );
        anyReplacementMade = true;
        console.log(
          `parseTranscript STAGE 2: After replacing "${word}" with "${digitMap[word]}": "${processedTranscript}"`
        );
      }
    }

    if (
      !anyReplacementMade &&
      processedTranscript.length > 0 &&
      !/^\s*[\d\s]+\s*$/.test(processedTranscript)
    ) {
      console.warn(
        `parseTranscript STAGE 2: No replacements made from digitMap, and transcript is not purely digits/spaces. Transcript: "${processedTranscript}"`
      );
    } else if (anyReplacementMade) {
      console.log(
        `parseTranscript STAGE 2: Final after all potential digitMap replacements: "${processedTranscript}"`
      );
    }

    let numbersAndSpaces = processedTranscript.replace(/[^\d\s]/gu, ""); // Added 'u' flag for Unicode
    console.log(
      `parseTranscript STAGE 3: After stripping all non-digits (except spaces): "${numbersAndSpaces}"`
    );

    let cleaned = numbersAndSpaces.trim().replace(/\s+/g, " ");
    console.log(
      `parseTranscript STAGE 4: Final cleaned (should be only digits and single spaces): "${cleaned}"`
    );

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
      console.log(
        "parseTranscript STAGE 5: Parsed successfully via spaceSplit:",
        result
      );
      return result;
    }
    console.log(
      "parseTranscript STAGE 5: Failed to parse via spaceSplit. Current spaceSplit array:",
      spaceSplit
    );

    const concatenated = cleaned.replace(/\s+/g, ""); // Remove all spaces
    if (concatenated.length > 0 && /^\d+$/.test(concatenated)) {
      // Check if it's purely digits
      const result = concatenated.split("").map(Number);
      console.log(
        "parseTranscript STAGE 5: Parsed successfully via concatenated digits:",
        result
      );
      return result;
    }
    console.log(
      "parseTranscript STAGE 5: Failed to parse via concatenated digits. Current concatenated string:",
      concatenated
    );

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
        console.log(
          "Language sent to backend for this transcription:",
          language
        );
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
        newMediaRecorder.onstart = () => {};

        // Simplified ondataavailable
        newMediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            localAudioChunks.push(event.data);
          }
        };

        newMediaRecorder.onstop = async () => {
          if (localAudioChunks.length > 0) {
            const audioBlob = new Blob(localAudioChunks, { type: "audio/wav" });

            localAudioChunks = [];
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
        stopListening();
      });
  }, [uploadAudio, stopListening, isRecordingRef, t]);
  const stablePresentNextDigit = useCallback((sequence, index) => {
    // Call the current implementation in the ref
    if (presentNextDigitLogicRef.current) {
      presentNextDigitLogicRef.current(sequence, index);
    }
  }, []);

  const moveToNextMode = useCallback(() => {
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

  const moveToNextSequence = useCallback(() => {
    stopListening();
    setEvaluationResult(null);
    setTranscript("");

    if (sequenceIndex + 1 < sequences.length) {
      setSequenceIndex((prev) => prev + 1);
      setGameState("presenting");
    } else {
      moveToNextMode();
    }
  }, [sequenceIndex, sequences.length, moveToNextMode, stopListening]);

  const evaluateAnswer = useCallback(() => {
    const userAnswer = parseTranscript(transcript);
    const correctAnswer =
      mode === "forward" ? currentSequence : [...currentSequence].reverse();

    if (userAnswer.length === 0 && transcript && transcript.trim() !== "") {
      toast.warning(t("could_not_understand_numbers_clearly")); // New, more specific toast
      setTranscript("");
      if (mode === "forward") setForwardErrors((prev) => prev + 1);
      else setReverseErrors((prev) => prev + 1);

      const currentModeErrors =
        mode === "forward" ? forwardErrors + 1 : reverseErrors + 1;
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

      const currentModeErrors =
        mode === "forward" ? forwardErrors + 1 : reverseErrors + 1;
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
    speakText,
  ]);
  useEffect(() => {
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

  useEffect(() => {
    if (gameState === "listening") {
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
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative mx-auto p-10 sm:p-12 lg:p-16 rounded-3xl border-2 border-green-400/30 shadow-2xl backdrop-blur-lg bg-gradient-to-br from-green-400/30 via-green-600/30 to-green-800/30 max-w-4xl w-full"
    >
      {/* Enhanced decorative elements */}
      <div className="absolute -top-16 -left-16 w-60 h-60 bg-green-400/30 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-16 -right-16 w-60 h-60 bg-green-500/30 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-green-300/20 rounded-full filter blur-3xl animate-pulse animation-delay-1000"></div>

      <div className="mb-10 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          <Volume2 size={80} className="text-green-500 drop-shadow-lg" />
        </motion.div>
      </div>

      <motion.h2
        className="text-5xl font-bold text-white/80 mb-8 text-center drop-shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {t("memory_test")}
      </motion.h2>

      <motion.div
        className="space-y-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-2xl text-white/80 leading-relaxed text-center font-medium">
          {t("welcome_memory_game")}
        </p>

        <ul className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
          {[1, 2, 3].map((num) => (
            <motion.li
              key={num}
              className="flex items-center gap-6 bg-white/10 p-6 sm:p-8 rounded-2xl border-2 border-green-400/20 shadow-lg transition-all duration-300 hover:shadow-green-500/30 hover:scale-[1.02]"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + num * 0.1 }}
            >
              <span className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-green-500 text-white font-bold text-xl">
                {num}
              </span>
              <span className="text-2xl text-white/80 font-semibold ">
                {num === 1 && t("listen_carefully_numbers")}
                {num === 2 && t("repeat_back_exactly")}
                {num === 3 && t("start_easy_get_harder")}
              </span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <div className="flex justify-center">
        <motion.button
          whileHover={{
            scale: 1.05,
            y: -3,
            boxShadow: "0 10px 25px -5px rgba(74, 222, 128, 0.4)",
          }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartForward}
          className="group relative px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 text-white text-2xl font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <span className="drop-shadow-sm">{t("start_test")}</span>
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <FaPlay className="drop-shadow-sm" />
          </motion.div>
          <div className="absolute -inset-2 rounded-xl bg-green-400/30 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </motion.button>
      </div>
    </motion.div>
  );

  const renderReverseInstructions = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6 }}
      className="text-center p-12 max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-green-400/30 via-green-600/30 to-green-800/30 backdrop-blur-lg border-2 border-green-400/30 shadow-2xl"
    >
      <motion.div
        className="mb-10"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <HelpCircle size={80} className="mx-auto text-green-500" />
      </motion.div>

      <motion.h2
        className="text-5xl font-bold text-white/80 mb-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {t("level_up_reverse_challenge")}
      </motion.h2>

      <motion.div
        className="space-y-8 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-2xl text-white/80 leading-relaxed font-medium">
          {t("now_exciting_twist")}
        </p>

        <motion.div
          className="p-10 rounded-2xl max-w-3xl mx-auto border-2 border-green-400/30 backdrop-blur"
          whileHover={{ scale: 1.01 }}
        >
          <p className="text-2xl text-white/80 font-medium">
            {t("if_i_say")}{" "}
            <span className="font-bold text-white/80 px-3 py-1 rounded-lg">
              1 - 3 - 5
            </span>
            <br />
            {t("you_say")}{" "}
            <span className="font-bold text-white/80  px-3 py-1 rounded-lg">
              5 - 3 - 1
            </span>
          </p>
        </motion.div>
      </motion.div>

      <motion.button
        onClick={handleStartReverse}
        className="group relative px-10 py-5 bg-green-500/40 border-2 border-green-500/50 text-white/80 text-2xl font-bold rounded-xl shadow-lg transition-all duration-300 hover:bg-green-500/60 backdrop-blur"
        whileHover={{ scale: 1.03, y: -2 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {t("start_reverse_challenge")}
        <div className="absolute inset-0 rounded-xl bg-green-400/30 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
      </motion.button>
    </motion.div>
  );

  const renderPresenting = () => {
    const isFirstDigit = digitIndex === 0;

    return (
      <motion.div
        className="flex flex-col items-center justify-center space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Enhanced digit display container */}
        <motion.div
          className="relative h-96 w-96 flex items-center justify-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Mystical glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-green-300/30 to-green-500/20 rounded-full filter blur-3xl animate-pulse" />

          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-green-400/60 rounded-full"
              animate={{
                x: [0, Math.sin(i) * 100, 0],
                y: [0, Math.cos(i) * 100, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                left: `${20 + i * 10}%`,
                top: `${20 + i * 10}%`,
              }}
            />
          ))}

          <AnimatePresence>
            {displayedDigit !== null && (
              <motion.div
                key={digitIndex}
                initial={{ opacity: 0, scale: 0.3, rotateY: -90 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotateY: 0,
                  transition: {
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                    opacity: { duration: 0.3 },
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.3,
                  rotateY: 90,
                  transition: {
                    duration: isFirstDigit ? 0.3 : 0.4, // Slightly faster for first digit
                    delay: isFirstDigit ? 0 : 0.1, // Optional: add small delay for non-first digits
                  },
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                {/* Enhanced digit box with mystical theme */}
                <motion.div
                  className="relative text-[10rem] font-bold text-white p-16 rounded-3xl backdrop-blur-xl border shadow-2xl overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.25) 50%, rgba(5, 150, 105, 0.15) 100%)",
                    borderColor: "rgba(34, 197, 94, 0.4)",
                    borderWidth: "2px",
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(34, 197, 94, 0.3)",
                      "0 0 50px rgba(34, 197, 94, 0.5)",
                      "0 0 30px rgba(34, 197, 94, 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {/* Inner glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-transparent to-green-600/10 rounded-3xl" />

                  {/* Mystical corner decorations */}
                  <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-green-400/60 rounded-tl-lg" />
                  <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-green-400/60 rounded-tr-lg" />
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-green-400/60 rounded-bl-lg" />
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-green-400/60 rounded-br-lg" />

                  <span className="relative z-10 drop-shadow-lg">
                    {displayedDigit}
                  </span>

                  {/* Subtle animated background pattern */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)",
                    }}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced instruction message */}
        <motion.div
          className="relative text-4xl font-bold text-white px-12 py-8 rounded-2xl shadow-xl backdrop-blur-xl border-2 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(34, 197, 94, 0.15) 50%, rgba(0, 0, 0, 0.3) 100%)",
            borderColor: "rgba(34, 197, 94, 0.4)",
          }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {/* Mystical background shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent"
            animate={{ x: [-300, 300] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <span className="relative z-10 drop-shadow-lg">
            {t("listen_carefully")}
          </span>

          {/* Corner accents */}
          <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-green-400/60" />
          <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-green-400/60" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-green-400/60" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-green-400/60" />
        </motion.div>
      </motion.div>
    );
  };

  const renderListening = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative flex flex-col items-center space-y-10 p-12 max-w-4xl mx-auto rounded-3xl backdrop-blur-xl border-2 shadow-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(34, 197, 94, 0.08) 25%, rgba(16, 185, 129, 0.12) 50%, rgba(5, 150, 105, 0.08) 75%, rgba(0, 0, 0, 0.4) 100%)",
        borderColor: "rgba(34, 197, 94, 0.3)",
      }}
    >
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400/60 to-transparent">
        <motion.div
          className="h-full bg-green-400"
          animate={{ x: [-100, "100vw"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ width: "100px" }}
        />
      </div>

      {/* Floating mystical orbs */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-green-400/40 rounded-full blur-sm"
          animate={{
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: `${20 + i * 20}%`,
            top: `${20 + i * 15}%`,
          }}
        />
      ))}

      <motion.h3
        className="relative text-3xl font-bold text-white text-center z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="drop-shadow-lg">
          {mode === "forward"
            ? t("repeat_numbers_order")
            : t("say_numbers_reverse")}
        </span>
      </motion.h3>

      <div className="flex flex-col items-center gap-8 w-full z-10">
        <div className="flex items-center gap-8">
          <motion.button
            onClick={stopListening}
            disabled={!isRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative rounded-2xl h-20 w-20 flex items-center justify-center transition-all duration-300 shadow-lg border-2 backdrop-blur-lg overflow-hidden ${
              !isRecording
                ? "bg-black/30 cursor-not-allowed text-white/50 border-green-400/20"
                : "bg-green-500/40 hover:bg-green-500/50 text-white border-green-500/60"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Button glow effect */}
            {isRecording && (
              <motion.div
                className="absolute inset-0 bg-green-400/20 rounded-2xl"
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
            {isRecording && (
              <motion.span
                className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full border-2 border-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </motion.button>

          {isRecording && !isTranscribing && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-8 py-4 backdrop-blur-xl text-white rounded-xl border-2 border-green-400/30 overflow-hidden relative"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)",
              }}
            >
              {/* Pulsing background */}
              <motion.div
                className="absolute inset-0 bg-green-400/10"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />

              <span className="text-xl font-bold relative z-10">
                {t("recording")}
              </span>
              <div className="flex gap-1 relative z-10">
                {[0, 0.3, 0.6].map((delay) => (
                  <motion.span
                    key={delay}
                    className="h-3 w-3 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Enhanced audio visualizer */}
        {isRecording && (
          <motion.div
            className="relative w-full max-w-md h-8 backdrop-blur-lg rounded-full overflow-hidden flex items-center gap-1 px-3 border border-green-400/30"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(34, 197, 94, 0.08) 100%)",
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Animated background wave */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-green-300/20 to-green-400/10"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="h-4 bg-gradient-to-t from-green-500 to-green-300 rounded-full flex-1 origin-bottom relative z-10"
                animate={{
                  height: [4, Math.random() * 24 + 4, 4],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5,
                  delay: i * 0.05,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Enhanced transcription loading */}
      {isTranscribing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-6 relative z-10"
        >
          <motion.div className="relative w-24 h-24">
            {/* Multiple rotating rings */}
            <motion.div
              className="absolute inset-0 border-2 border-green-400/30 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 border-2 border-green-500/50 rounded-full border-t-transparent"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 border-2 border-green-300/70 rounded-full border-r-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>
          <div className="text-2xl text-white font-bold drop-shadow-lg">
            {t("processing_your_answer")}
          </div>
        </motion.div>
      )}

      {/* Enhanced transcript display */}
      {transcript && !isTranscribing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl text-center relative z-10"
        >
          <p className="text-xl text-white/80 mb-2 drop-shadow">
            {t("you_said")}:
          </p>
          <motion.p
            className="text-3xl font-bold text-white px-6 py-4 rounded-xl backdrop-blur-lg border border-green-400/30 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(34, 197, 94, 0.1) 100%)",
            }}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring" }}
          >
            {/* Subtle shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent"
              animate={{ x: [-200, 200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="relative z-10 drop-shadow">{transcript}</span>
          </motion.p>
        </motion.div>
      )}

      {/* Enhanced evaluation feedback */}
      <AnimatePresence>
        {evaluationResult && (
          <motion.div
            key="evaluationFeedback"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="flex flex-col items-center space-y-6 mt-8 relative z-10"
          >
            {evaluationResult === "correct" ? (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="relative"
                >
                  <CheckCircle
                    size={60}
                    className="text-green-400 drop-shadow-lg"
                  />
                  {/* Success glow */}
                  <motion.div
                    className="absolute inset-0 bg-green-400/30 rounded-full blur-xl"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl text-white px-10 py-6 rounded-2xl border-2 border-green-400/30 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(16, 185, 129, 0.15) 100%)",
                  }}
                >
                  <span className="text-3xl font-bold drop-shadow-lg">
                    {t("correct")}!
                  </span>
                </motion.div>
                <motion.div
                  className="text-4xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🎉
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: 180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="relative"
                >
                  <XCircle
                    size={60}
                    className="text-green-400 drop-shadow-lg"
                  />
                  {/* Gentle glow for incorrect answer */}
                  <motion.div
                    className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="backdrop-blur-xl text-white px-10 py-6 rounded-2xl border-2 border-green-400/30 relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(34, 197, 94, 0.1) 100%)",
                  }}
                >
                  <span className="text-3xl font-bold drop-shadow-lg">
                    {t("lets_try_next_one")}
                  </span>
                </motion.div>
                <motion.div
                  className="text-4xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  💪
                </motion.div>
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
      transition={{ duration: 0.8 }}
      className="relative rounded-3xl p-12 max-w-4xl mx-auto mt-12 text-center backdrop-blur-xl border-2 shadow-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(34, 197, 94, 0.08) 25%, rgba(16, 185, 129, 0.12) 50%, rgba(5, 150, 105, 0.08) 75%, rgba(0, 0, 0, 0.4) 100%)",
        borderColor: "rgba(34, 197, 94, 0.3)",
      }}
    >
      {/* Celebratory floating elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-400/50 rounded-full"
          animate={{
            x: [0, Math.sin(i) * 200],
            y: [0, Math.cos(i) * 200],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeInOut",
          }}
          style={{
            left: `${50}%`,
            top: `${50}%`,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="relative"
      >
        <CheckCircle
          size={100}
          className="mx-auto text-green-400 mb-8 drop-shadow-lg"
        />
        {/* Success aura */}
        <motion.div
          className="absolute inset-0 bg-green-400/20 rounded-full blur-2xl"
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </motion.div>

      <motion.h2
        className="text-5xl font-bold text-white mb-12 drop-shadow-lg relative z-10"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {t("challenge_complete")}!
      </motion.h2>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="backdrop-blur-xl p-10 rounded-2xl border-2 border-green-400/30 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)",
          }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: "spring" }}
        >
          {/* Subtle animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent"
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <h3 className="text-2xl text-white/90 mb-4 relative z-10 drop-shadow">
            {t("forward_score")}
          </h3>
          <p className="text-5xl font-bold text-green-400 relative z-10 drop-shadow-lg">
            {forwardScore}{" "}
            <span className="text-3xl text-white/60">
              / {STARTING_FORWARD_SEQUENCES.length}
            </span>
          </p>
        </motion.div>

        <motion.div
          className="backdrop-blur-xl p-10 rounded-2xl border-2 border-green-400/30 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(34, 197, 94, 0.1) 100%)",
          }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ type: "spring" }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent"
            animate={{ opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
          />
          <h3 className="text-2xl text-white/90 mb-4 relative z-10 drop-shadow">
            {t("reverse_score")}
          </h3>
          <p className="text-5xl font-bold text-green-400 relative z-10 drop-shadow-lg">
            {reverseScore}{" "}
            <span className="text-3xl text-white/60">
              / {STARTING_REVERSE_SEQUENCES.length}
            </span>
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        className="backdrop-blur-xl p-12 rounded-2xl mb-12 border-2 border-green-400/30 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 50%, rgba(5, 150, 105, 0.15) 100%)",
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
      >
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/10 to-transparent"
          animate={{ x: [-300, 300] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <h3 className="text-3xl text-white/90 mb-4 relative z-10 drop-shadow">
          {t("final_score")}
        </h3>
        <p className="text-7xl font-extrabold text-green-400 relative z-10 drop-shadow-lg">
          {Math.round((forwardScore + reverseScore) / 2)}{" "}
          <span className="text-4xl text-white/60">/ 10</span>
        </p>
      </motion.div>

      {!suppressResultPage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-8 relative z-10"
        >
          <motion.button
            onClick={submitResults}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 30px rgba(34, 197, 94, 0.4)",
            }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 border-2 border-green-500/60 text-white text-2xl font-bold rounded-2xl shadow-lg transition-all duration-300 backdrop-blur-xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.3) 0%, rgba(16, 185, 129, 0.4) 100%)",
            }}
          >
            {/* Button shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-200, 200] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            <Send size={28} className="relative z-10" />
            <span className="relative z-10">{t("submit_results")}</span>
          </motion.button>

          <motion.div
            className="text-xl text-white/70 drop-shadow relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {t("thank_you_for_participating")}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
  if (showIntro) {
    return (
      <>
        {/* Blurred background with animated overlay */}
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(8px)",
            }}
          />
          <motion.div
            className="absolute inset-0 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Main content container */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="relative max-w-7xl w-full flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12"
          >
            {/* Floating character on the left */}
            <motion.div
              initial={{ y: -40, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: [1, 1.03, 1],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                y: { duration: 0.6, ease: "backOut" },
                opacity: { duration: 0.8 },
                scale: {
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                },
              }}
              className="flex-shrink-0 order-2 lg:order-1"
            >
              <img
                src={characterImage}
                alt="Harmony the Echo Keeper"
                className="h-64 sm:h-80 lg:h-96 xl:h-112 object-contain"
              />
            </motion.div>

            {/* Enhanced glass-morphism dialog box */}
            <motion.div
              className="bg-gradient-to-br from-black/20 via-black/40 to-black/60 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-green-400/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {/* Musical decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-green-400/20 rounded-full filter blur-2xl"></div>
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-green-500/20 rounded-full filter blur-2xl"></div>
              <div className="absolute top-1/2 right-8 w-24 h-24 bg-green-300/10 rounded-full filter blur-lg"></div>
              <div className="absolute bottom-8 left-8 w-32 h-32 bg-green-300/10 rounded-full filter blur-lg"></div>

              {/* Enhanced animated dialog text */}
              <motion.div
                key={currentDialog}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white mb-8 lg:mb-12 min-h-48 sm:min-h-56 lg:min-h-64 xl:min-h-72 flex items-center justify-center font-serif font-medium leading-relaxed text-center px-4"
              >
                <span className="drop-shadow-lg">{dialog[currentDialog]}</span>
              </motion.div>

              {/* Enhanced progress indicators */}
              <div className="flex justify-center gap-3 mb-8 lg:mb-10">
                {dialog.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                      index <= currentDialog
                        ? "bg-gradient-to-r from-white to-blue-200 shadow-lg"
                        : "bg-white/30"
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: index === currentDialog ? 1.3 : 1,
                      y: index === currentDialog ? -4 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                ))}
              </div>

              {/* Enhanced animated action button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  className={`flex items-center justify-center gap-3 py-4 px-8 lg:px-12 rounded-xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 ${
                    currentDialog < dialog.length - 1
                      ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-green-900 hover:from-green-300 hover:via-green-400 hover:to-green-500 hover:shadow-green-500/50"
                      : "bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800 hover:shadow-green-500/50"
                  }`}
                >
                  {currentDialog < dialog.length - 1 ? (
                    <>
                      <span className="drop-shadow-sm text-black">Next</span>
                      <FaChevronRight className="mt-0.5 drop-shadow-sm text-black" />
                    </>
                  ) : (
                    <>
                      <span className="drop-shadow-sm text-black">
                        {t("imReady")}
                      </span>
                      <FaCheck className="mt-0.5 drop-shadow-sm text-black" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }
  return (
    <div
      className="h-screen absolute inset-0"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* back to tests*/}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate("/taketests")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaArrowLeft className="text-blue-600" />
        {t("BacktoTests")}
      </motion.button>
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-6xl mx-auto w-full p-6">
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
              className="mb-10 bg-green-500/30 rounded-2xl p-6 shadow-lg border border-green-100 max-w-3xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <span className="text-lg font-medium text-white">
                    {t("mode")}:{" "}
                    <span className="font-bold capitalize text-white">
                      {mode}
                    </span>
                  </span>
                  <span className="text-lg font-medium text-white">
                    {t("sequence")}:{" "}
                    <span className="font-bold text-white">
                      {sequenceIndex + 1}
                    </span>{" "}
                    / <span className="text-white">{sequences.length}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-gray-600">
                    {t("errors")}:
                  </span>
                  <div className="flex gap-2">
                    {[...Array(MAX_ERRORS)].map((_, i) => {
                      const currentErrors =
                        mode === "forward" ? forwardErrors : reverseErrors;
                      const isError = i < currentErrors;

                      return (
                        <div
                          key={i}
                          className={`h-4 w-4 rounded-full transition-colors duration-300 ${
                            isError ? "bg-red-500" : "bg-green-200"
                          }`}
                        />
                      );
                    })}
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
    </div>
  );
}

export default Test13;
