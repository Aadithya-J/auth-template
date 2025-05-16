import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  Check,
  X,
  Volume2,
  ArrowRight,
  SkipForward,
  Loader,
  Mic,
  MicOff,
  Loader2,
} from "lucide-react";
import { backendURL } from "../../definedURL";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

const WORDS = [
  {
    id: 1,
    sounds: ["/sounds/c.mp3", "/sounds/a.mp3", "/sounds/t.mp3"],
    word: "cat",
  },
  {
    id: 2,
    sounds: ["/sounds/f.mp3", "/sounds/a.mp3", "/sounds/t.mp3"],
    word: "fat",
  },
  {
    id: 3,
    sounds: ["/sounds/l.mp3", "/sounds/e.mp3", "/sounds/t.mp3"],
    word: "let",
  },
  {
    id: 4,
    sounds: ["/sounds/l.mp3", "/sounds/i.mp3", "/sounds/p.mp3"],
    word: "lip",
  },
  {
    id: 5,
    sounds: ["/sounds/p.mp3", "/sounds/o.mp3", "/sounds/t.mp3"],
    word: "pot",
  },
  {
    id: 6,
    sounds: [
      "/sounds/b.mp3",
      "/sounds/o.mp3",
      "/sounds/a.mp3",
      "/sounds/t.mp3",
    ],
    word: "boat",
  },
  {
    id: 7,
    sounds: ["/sounds/p.mp3", "/sounds/e.mp3", "/sounds/g.mp3"],
    word: "peg",
  },
  {
    id: 8,
    sounds: ["/sounds/b.mp3", "/sounds/e.mp3", "/sounds/g.mp3"],
    word: "beg",
  },
  {
    id: 9,
    sounds: ["/sounds/sh.mp3", "/sounds/o.mp3", "/sounds/p.mp3"],
    word: "shop",
  },
  {
    id: 10,
    sounds: ["/sounds/f.mp3", "/sounds/ee.mp3", "/sounds/t.mp3"],
    word: "feet",
  },
  {
    id: 11,
    sounds: [
      "/sounds/d.mp3",
      "/sounds/i.mp3",
      "/sounds/n.mp3",
      "/sounds/er.mp3",
    ],
    word: "dinner",
  },
  {
    id: 12,
    sounds: [
      "/sounds/w.mp3",
      "/sounds/e.mp3",
      "/sounds/th.mp3",
      "/sounds/er.mp3",
    ],
    word: "weather",
  },
  {
    id: 13,
    sounds: [
      "/sounds/l.mp3",
      "/sounds/i.mp3",
      "/sounds/t.mp3",
      "/sounds/l.mp3",
    ],
    word: "little",
  },
  {
    id: 14,
    sounds: [
      "/sounds/d.mp3",
      "/sounds/e.mp3",
      "/sounds/l.mp3",
      "/sounds/i.mp3",
      "/sounds/k.mp3",
      "/sounds/t.mp3",
    ],
    word: "delicate",
  },
  {
    id: 15,
    sounds: ["/sounds/t.mp3", "/sounds/a.mp3", "/sounds/p.mp3"],
    word: "tap",
  },
  {
    id: 16,
    sounds: ["/sounds/d.mp3", "/sounds/u.mp3", "/sounds/p.mp3"],
    word: "dup",
  },
  {
    id: 17,
    sounds: ["/sounds/p.mp3", "/sounds/o.mp3", "/sounds/g.mp3"],
    word: "pog",
  },
  {
    id: 18,
    sounds: [
      "/sounds/g.mp3",
      "/sounds/l.mp3",
      "/sounds/e.mp3",
      "/sounds/b.mp3",
    ],
    word: "gleb",
  },
  {
    id: 19,
    sounds: [
      "/sounds/g.mp3",
      "/sounds/a.mp3",
      "/sounds/p.mp3",
      "/sounds/o.mp3",
    ],
    word: "gapo",
    alternatives: ["gapo", "gappo", "gahpo"],
  },
  {
    id: 20,
    sounds: [
      "/sounds/t.mp3",
      "/sounds/i.mp3",
      "/sounds/s.mp3",
      "/sounds/e.mp3",
      "/sounds/k.mp3",
    ],
    word: "tisek",
    alternatives: ["tisek", "teesek", "tissek", "teeseck"],
  },
];

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
    <motion.div
      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  </div>
);
ProgressBar.propTypes = { progress: PropTypes.number.isRequired };

const ResultCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
      item.isCorrect
        ? "bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400"
        : "bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400"
    }`}
  >
    <div className="flex justify-between items-center">
      <span className="font-medium text-blue-900">
        Word {index + 1}: <span className="font-bold">{item.word}</span>
      </span>
      <span
        className={`flex items-center font-bold ${
          item.isCorrect ? "text-green-600" : "text-red-600"
        }`}
      >
        {item.isCorrect ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-100 p-1 rounded-full"
          >
            <Check size={16} />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-100 p-1 rounded-full"
          >
            <X size={16} />
          </motion.div>
        )}
      </span>
    </div>
    <div className="mt-2 text-sm text-blue-800">
      <p>
        You said:{" "}
        <span
          className={`font-medium ${
            item.isCorrect ? "text-green-600" : "text-red-500"
          }`}
        >
          {item.response || "No response"}
        </span>
      </p>
      {!item.isCorrect && (
        <p className="text-blue-700 mt-1">
          Correct answer: <span className="font-medium">{item.word}</span>
        </p>
      )}
    </div>
  </motion.div>
);
ResultCard.propTypes = {
  item: PropTypes.shape({
    isCorrect: PropTypes.bool.isRequired,
    word: PropTypes.string.isRequired,
    response: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const Button = ({
  onClick,
  disabled,
  variant = "primary",
  children,
  className = "",
  isLoading = false,
}) => {
  const baseStyle =
    "py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm";
  const variants = {
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed",
    secondary:
      "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 hover:from-blue-100 hover:to-blue-200 active:scale-98",
    danger:
      "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-98",
    success:
      "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 active:scale-98",
    warning:
      "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 active:scale-98",
  };
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader className="h-5 w-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};
Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "danger",
    "success",
    "warning",
  ]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
};

const LoadingOverlay = ({ message = "Processing..." }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center max-w-xs">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { repeat: Infinity, duration: 1.5, ease: "linear" },
            scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
          }}
          className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600"
        />
      </div>
      <p className="mt-4 text-blue-800 font-medium">{message}</p>
    </div>
  </motion.div>
);
LoadingOverlay.propTypes = { message: PropTypes.string };

export default function PhonemeGame({
  onComplete,
  suppressResultPage,
  student,
}) {
  const [gameState, setGameState] = useState("playing");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [showResponseArea, setShowResponseArea] = useState(false);
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);
  const [userInput, setUserInput] = useState("");
  const [showFinalSubmitButton, setShowFinalSubmitButton] = useState(false);
  const [isSubmittingAll, setIsSubmittingAll] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [currentTranscriptionStatus, setCurrentTranscriptionStatus] =
    useState("idle");

  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(isRecording);

  const childId = localStorage.getItem("childId") || (student && student.id);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      stopListening();
    };
  }, []);

  useEffect(() => {
    if (
      showResponseArea &&
      !isRecording &&
      !isTranscribing &&
      inputRef.current
    ) {
      inputRef.current.focus();
    }
  }, [showResponseArea, isRecording, isTranscribing]);

  useEffect(() => {
    console.log(`Word changed to index: ${currentWordIndex}. Resetting state.`);
    setUserInput("");
    setCurrentTranscriptionStatus("idle");
    setError(null);
    setIsRecording(false);
    setIsTranscribing(false);
    stopListening();
  }, [currentWordIndex]);

  const playSound = (src) => {
    return new Promise((resolve, reject) => {
      if (!src) {
        console.warn("Empty sound source provided, skipping.");
        resolve();
        return;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(src);
      audioRef.current = audio;
      audio
        .play()
        .then(() => {
          audio.onended = resolve;
        })
        .catch((e) => {
          console.error("Audio playback failed:", src, e);
          setError(
            `Failed to play sound. Please try again or check permissions.`
          );
          resolve();
        });
    });
  };

  const playCurrentWordSounds = async () => {
    if (isPlayingSound) return;
    try {
      setIsPlayingSound(true);
      setError(null);
      setShowResponseArea(false);
      const currentWord = WORDS[currentWordIndex];
      console.log(`Playing sounds for word: ${currentWord.word}`);

      for (const sound of currentWord.sounds) {
        await playSound(sound);
        if (sound) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      console.log("Finished playing sounds.");
      setIsPlayingSound(false);
      setShowResponseArea(true);
    } catch (err) {
      console.error("Error in playCurrentWordSounds:", err);
      setError("An error occurred while playing sounds.");
      setIsPlayingSound(false);
      setShowResponseArea(true);
    }
  };

  const uploadAudio = useCallback(
    async (audioBlob) => {
      if (!audioBlob || audioBlob.size === 0) {
        console.log("No audio data to upload.");
        setCurrentTranscriptionStatus("error");
        setIsTranscribing(false);
        return;
      }

      const formData = new FormData();
      const filename = `phoneme_game_child_${childId}_word_${currentWordIndex}_${Date.now()}.wav`;
      const file = new File([audioBlob], filename, { type: "audio/wav" });
      formData.append("file", file);

      console.log(`Uploading audio for word index: ${currentWordIndex}`);
      setCurrentTranscriptionStatus("pending");
      setIsTranscribing(true);

      try {
        const response = await fetch(`${backendURL}/transcribe`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log(
          `Transcription API Response for index ${currentWordIndex}:`,
          result
        );

        if (response.ok && result.transcription != null) {
          const transcribedText = result.transcription.trim().toLowerCase();

          setUserInput((prevInput) => {
            if (prevInput.trim() === "") {
              console.log(
                `Transcription received: "${transcribedText}", updating input.`
              );
              return transcribedText;
            } else {
              console.log(
                `Transcription received: "${transcribedText}", but input already has value: "${prevInput}". Keeping typed value.`
              );
              return prevInput;
            }
          });
          setCurrentTranscriptionStatus(transcribedText ? "done" : "error");
          if (!transcribedText) {
            setError("Transcription returned empty. Please type or try again.");
          }
        } else {
          console.error(
            `Transcription failed for index ${currentWordIndex}:`,
            result
          );
          setError(
            `Transcription failed. Please type your answer or try recording again.`
          );
          setCurrentTranscriptionStatus("error");
        }
      } catch (error) {
        console.error(
          `Error uploading/transcribing audio for index ${currentWordIndex}:`,
          error
        );
        setError("Error processing audio. Please type your answer.");
        setCurrentTranscriptionStatus("error");
      } finally {
        setIsTranscribing(false);
      }
    },
    [childId, currentWordIndex, backendURL]
  );

  const stopListening = useCallback(() => {
    const wasRecording = isRecordingRef.current;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    } else {
      audioChunksRef.current = [];
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;

    if (wasRecording) {
      setIsRecording(false);

      setCurrentTranscriptionStatus((prev) => {
        if (prev === "pending") return "pending";

        return "idle";
      });
    }
  }, [isRecordingRef]);

  const startListening = useCallback(() => {
    if (isRecordingRef.current) {
      console.log("Start listening called, but already recording.");
      return;
    }
    setError(null);
    setUserInput("");
    setCurrentTranscriptionStatus("recording");
    setIsRecording(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        audioChunksRef.current = [];
        if (stream.getAudioTracks().length > 0) {
          stream.getAudioTracks()[0].onended = () => {
            console.warn("Audio track ended unexpectedly!");
            stopListening();
          };
        }

        try {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;

          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0)
              audioChunksRef.current.push(event.data);
          };
          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });
            uploadAudio(audioBlob);
            audioChunksRef.current = [];
          };
          recorder.onerror = (event) => {
            console.error("MediaRecorder error:", event.error);
            setError("Recording error. Please type or try again.");
            setCurrentTranscriptionStatus("error");
            stopListening();
          };

          recorder.start();
        } catch (error) {
          console.error("Error creating/starting MediaRecorder:", error);
          setError("Could not start recording. Check permissions/refresh.");
          setCurrentTranscriptionStatus("error");
          stopListening();
          setIsRecording(false);
        }
      })
      .catch((error) => {
        console.error("getUserMedia error:", error);
        setError("Could not access microphone. Check permissions.");
        setCurrentTranscriptionStatus("error");
        setIsRecording(false);
      });
  }, [stopListening, uploadAudio]);

  const handleInputChange = (e) => {
    const typedValue = e.target.value;
    setUserInput(typedValue);

    if (isRecordingRef.current) {
      console.log("User typed while recording, stopping recording.");
      stopListening();
    }

    setCurrentTranscriptionStatus((prev) => {
      if (prev !== "recording" && prev !== "pending") {
        return typedValue ? "typed" : "idle";
      }
      return prev;
    });
  };

  const processAndMoveNext = (responseValue, isSkipped = false) => {
    stopListening();

    const currentWordData = WORDS[currentWordIndex];
    const finalResponse = isSkipped
      ? "[skipped]"
      : responseValue.toLowerCase().trim();
    const isCorrect = isSkipped
      ? false
      : currentWordData.alternatives
      ? [
          ...currentWordData.alternatives,
          currentWordData.word.toLowerCase(),
        ].includes(finalResponse)
      : finalResponse === currentWordData.word.toLowerCase();

    const newResponse = {
      wordId: currentWordData.id,
      word: currentWordData.word,
      response: finalResponse,
      isCorrect,
    };

    console.log(`Processed Word ${currentWordIndex}:`, newResponse);
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentWordIndex === WORDS.length - 1) {
      console.log("Last word processed, showing final submit.");
      setShowFinalSubmitButton(true);
      setShowResponseArea(false);
    } else {
      console.log("Moving to next word.");
      setCurrentWordIndex((prevIndex) => prevIndex + 1);
      setShowResponseArea(false);
    }
  };

  const handleSubmitResponse = () => {
    if (!userInput.trim()) {
      setError("Please enter or record a word before submitting.");
      return;
    }
    console.log(`Submitting user input: "${userInput}"`);
    processAndMoveNext(userInput, false);
  };

  const skipWord = () => {
    console.log(`Skipping word ${currentWordIndex}`);
    processAndMoveNext("", true);
  };

  const handleFinalSubmit = async () => {
    console.log("Handling final submission.");
    setIsSubmittingAll(true);
    setLoadingMessage("Submitting your results...");
    await finishGame(responses);
    setIsSubmittingAll(false);
  };

  const finishGame = async (responsesToSubmit) => {
    const effectiveChildId = childId;
    if (!effectiveChildId) {
      console.error("Cannot submit results: childId is missing.");
      setError("Cannot submit results: Student ID not found.");
      setIsSubmittingAll(false);
      return;
    }

    const incorrectCount = responsesToSubmit.filter((r) => !r.isCorrect).length;
    const rawScore = Math.max(0, 20 - incorrectCount);
    const finalScore = Math.min(10, Math.max(0, Math.round(rawScore / 2)));

    console.log("Final submission data:", {
      responsesToSubmit,
      finalScore,
      rawScore,
      effectiveChildId,
    });

    try {
      await axios.post(
        `${backendURL}/submitResults`,
        {
          responses: responsesToSubmit.map((r) => ({
            wordId: r.wordId,
            isCorrect: r.isCorrect,
            response: r.response,
          })),
          normalized_score: finalScore,
          total_score: rawScore,
          studentId: student?.id,
          childId: effectiveChildId,
          testType: "PhonemeBlending",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Results submitted successfully.");

      if (suppressResultPage && typeof onComplete === "function") {
        console.log("Suppressing results page, calling onComplete.");
        onComplete(finalScore);
      } else {
        console.log("Showing results page.");
        setGameState("results");
      }
    } catch (err) {
      console.error(
        "Error submitting results:",
        err.response?.data || err.message
      );
      setError(
        "Failed to save results. Please try again later or contact support."
      );

      if (suppressResultPage && typeof onComplete === "function") {
        console.log("Error submitting, but calling onComplete with score 0.");
        onComplete(0);
      } else {
        console.log("Error submitting, showing results page.");
        setGameState("results");
      }
    }
  };

  if (gameState === "results") {
    const incorrectCount = responses.filter((r) => !r.isCorrect).length;
    const rawScore = Math.max(0, 20 - incorrectCount);
    const finalScore = Math.min(10, Math.max(0, Math.round(rawScore / 2)));
    const percentage = Math.max(
      0,
      Math.min(100, Math.round((finalScore / 10) * 100))
    );

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          <div className="text-center">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="inline-block bg-blue-100 p-3 rounded-full mb-4"
            >
              {finalScore >= 8 ? "🎉" : finalScore >= 5 ? "👍" : "🌱"}
            </motion.div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
              Test Completed!
            </h1>
            {/* Show error message if submission failed */}
            {error && (
              <p className="mt-4 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                {error}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <svg className="w-36 h-36" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e6e6e6"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${percentage}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500"
                >
                  {finalScore}/10
                </motion.span>
                <span className="text-sm font-medium text-blue-800">
                  {responses.filter((r) => r.isCorrect).length}/{WORDS.length}{" "}
                  correct
                </span>
              </div>
            </motion.div>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 p-1">
            <AnimatePresence>
              {responses.map((item, index) => (
                <ResultCard
                  key={item.wordId || index}
                  item={item}
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
          {/* Button depends on suppressResultPage */}
          <Button
            onClick={() => onComplete && onComplete(finalScore)}
            variant="primary"
            className="w-full"
          >
            <ArrowRight className="h-5 w-5" />
            {suppressResultPage ? "Next Test" : "Finish"}
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentWord = WORDS[currentWordIndex];
  const progress = Math.min(100, (currentWordIndex / WORDS.length) * 100);

  const renderTranscriptionStatus = () => {
    switch (currentTranscriptionStatus) {
      case "recording":
        return (
          <div className="flex items-center justify-center gap-2 text-red-600 h-6">
            <Mic className="h-4 w-4 animate-pulse" /> Recording...
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center justify-center gap-2 text-blue-600 h-6">
            <Loader2 className="h-4 w-4 animate-spin" /> Transcribing...
          </div>
        );
      case "done":
        return (
          <div className="flex items-center justify-center gap-2 text-green-600 h-6">
            <Check className="h-4 w-4" /> Done. Ready to submit.
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center gap-2 text-red-600 h-6">
            <X className="h-4 w-4" /> Transcription failed.
          </div>
        );
      case "typed":
        return (
          <div className="flex items-center justify-center gap-2 text-gray-600 h-6 text-sm">
            Typed input
          </div>
        );
      case "idle":
      default:
        return (
          <div className="h-6 text-gray-500 text-sm text-center">
            Ready to record or type
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50 p-6">
      <AnimatePresence>
        {isSubmittingAll && <LoadingOverlay message={loadingMessage} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6"
      >
        {/* Progress Bar */}
        <div className="space-y-1">
          <ProgressBar progress={progress} />
          <div className="flex justify-between text-xs text-blue-500">
            <span>Start</span>
            <span>
              Word {currentWordIndex + 1} of {WORDS.length}
            </span>
            <span>Finish</span>
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center space-y-1">
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600"
          >
            Blend the Sounds!
          </motion.h2>
          <p className="text-blue-600 font-medium">
            {showResponseArea
              ? "Enter or say the word you heard"
              : "Listen carefully"}
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm"
          >
            <div className="flex items-center">
              <div className="mr-2">⚠️</div>
              <p>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Central Icon */}
        <motion.div
          animate={{ scale: isPlayingSound || isRecording ? [1, 1.1, 1] : 1 }}
          transition={{
            duration: 1,
            repeat: isPlayingSound || isRecording ? Infinity : 0,
            ease: "easeInOut",
          }}
          className="flex justify-center text-8xl my-6"
        >
          {/* Determine icon based on state */}
          {isPlayingSound
            ? "👂"
            : showResponseArea
            ? isRecording
              ? "🎙️"
              : isTranscribing
              ? "💬"
              : currentTranscriptionStatus === "done"
              ? "✅"
              : "✏️"
            : "🔊"}
        </motion.div>

        {/* Initial State: Play Sounds Button */}
        {!showResponseArea && !showFinalSubmitButton && (
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100"
            >
              <p className="text-center text-blue-700">
                Listen to the sounds and combine them to form a word
              </p>
            </motion.div>
            <Button
              onClick={playCurrentWordSounds}
              disabled={isPlayingSound}
              variant={isPlayingSound ? "secondary" : "primary"}
              className="w-full"
            >
              <Volume2 className="h-5 w-5" />
              {isPlayingSound ? "Playing Sounds..." : "Play Sounds"}
            </Button>
          </div>
        )}

        {/* Response State: Input Field, Record Button, Submit/Skip */}
        {showResponseArea && !showFinalSubmitButton && (
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100"
            >
              <p className="text-center font-medium text-blue-700">
                What word did you hear?
              </p>
            </motion.div>

            {/* Transcription Status */}
            {renderTranscriptionStatus()}

            {/* Input Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full"
            >
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type or Record your answer"
                className="w-full px-4 py-3 rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-medium text-blue-800 placeholder-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                onKeyPress={(e) => {
                  if (
                    e.key === "Enter" &&
                    userInput.trim() &&
                    !isRecording &&
                    !isTranscribing
                  ) {
                    handleSubmitResponse();
                  }
                }}
                disabled={
                  isRecording ||
                  isTranscribing ||
                  isPlayingSound ||
                  isSubmittingAll
                }
              />
            </motion.div>

            {/* Action Buttons Container */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-2 w-full"
            >
              {/* Top Row: Record / Submit */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Record/Stop Button */}
                <Button
                  onClick={isRecording ? stopListening : startListening}
                  variant={isRecording ? "danger" : "secondary"}
                  className="flex-1 order-1"
                  disabled={isPlayingSound || isTranscribing || isSubmittingAll}
                >
                  {isRecording ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                  {isRecording ? "Stop Recording" : "Record Answer"}
                </Button>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmitResponse}
                  variant="success"
                  className="flex-1 order-2"
                  disabled={
                    !userInput.trim() ||
                    isRecording ||
                    isTranscribing ||
                    isPlayingSound ||
                    isSubmittingAll
                  }
                >
                  <Check className="h-5 w-5" />
                  Submit Answer
                </Button>
              </div>
              {/* Bottom Row: Skip Button */}
              <Button
                onClick={skipWord}
                variant="warning"
                className="w-full order-3"
                disabled={
                  isPlayingSound ||
                  isRecording ||
                  isTranscribing ||
                  isSubmittingAll
                }
              >
                <SkipForward className="h-5 w-5" /> Skip Word
              </Button>
            </motion.div>
          </div>
        )}

        {/* Final Submit Button State */}
        {showFinalSubmitButton && (
          <div className="text-center space-y-4 pt-4">
            <p className="text-lg font-semibold text-blue-800">
              All words attempted!
            </p>
            <Button
              onClick={handleFinalSubmit}
              variant="primary"
              className="w-full max-w-xs mx-auto"
              isLoading={isSubmittingAll}
            >
              Submit All Results
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

PhonemeGame.propTypes = {
  onComplete: PropTypes.func,
  suppressResultPage: PropTypes.bool,
  student: PropTypes.object,
};
