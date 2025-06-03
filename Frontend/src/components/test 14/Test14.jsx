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
import {
  FaArrowRight,
  FaChevronRight,
  FaCheck,
  FaArrowLeft,
} from "react-icons/fa";
import { backendURL } from "../../definedURL";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import backgroundImage from "../../assets/sound-blending/background.png";
import characterImage from "../../assets/sound-blending/dolphin.png";
import { useNavigate } from "react-router-dom";

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

const ResultCard = ({ item, index, t }) => (
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
        {t("phonemeBlendingResultCardWordLabel", { indexPlusOne: index + 1 })}{" "}
        <span className="font-bold">{item.word}</span>
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
        {t("phonemeBlendingResultCardYouSaid")}{" "}
        <span
          className={`font-medium ${
            item.isCorrect ? "text-green-600" : "text-red-500"
          }`}
        >
          {item.response || t("phonemeBlendingResultCardNoResponse")}
        </span>
      </p>
      {!item.isCorrect && (
        <p className="text-blue-700 mt-1">
          {t("phonemeBlendingResultCardCorrectAnswer")}{" "}
          <span className="font-medium">{item.word}</span>
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
  loadingTextKey = "phonemeBlendingLoadingProcessing", // Default loading text key
  t, // ADD t as a prop
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
const LoadingOverlay = ({
  messageKey = "phonemeBlendingLoadingProcessing",
  t,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50"
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
      <p className="mt-4 text-blue-800 font-medium">{t(messageKey)}</p>
    </div>
  </motion.div>
);

LoadingOverlay.propTypes = {
  messageKey: PropTypes.string,
  t: PropTypes.func.isRequired,
};

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
  const { t, language } = useLanguage();
  const audioRef = useRef(null);
  const inputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(isRecording);
  const [showIntro, setShowIntro] = useState(true);
  const [currentDialog, setCurrentDialog] = useState(0);
  const childId = localStorage.getItem("childId") || (student && student.id);
  const token = localStorage.getItem("access_token");

  const dialogIntroTexts = [
    t("phonemeBlendingIntroDialog1"),
    t("phonemeBlendingIntroDialog2"),
    t("phonemeBlendingIntroDialog3"),
    t("phonemeBlendingIntroDialog4"),
    t("phonemeBlendingIntroDialog5"),
  ];
  const navigate = useNavigate();
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

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
          setError(t("phonemeBlendingErrorPlaySound"));
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
      setError(t("phonemeBlendingErrorPlayingSounds"));
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
      formData.append("language", language);
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
            setError(t("phonemeBlendingErrorTranscriptionEmpty"));
          }
        } else {
          console.error(
            `Transcription failed for index ${currentWordIndex}:`,
            result
          );
          setError(t("phonemeBlendingErrorTranscriptionFailedGeneral"));
          setCurrentTranscriptionStatus("error");
        }
      } catch (error) {
        console.error(
          `Error uploading/transcribing audio for index ${currentWordIndex}:`,
          error
        );
        setError(t("phonemeBlendingErrorProcessingAudio"));
        setCurrentTranscriptionStatus("error");
      } finally {
        setIsTranscribing(false);
      }
    },
    [childId, currentWordIndex, backendURL, language, t]
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
  }, [isRecordingRef, currentTranscriptionStatus]);

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
            setError(t("phonemeBlendingErrorRecording"));
            setCurrentTranscriptionStatus("error");
            stopListening();
          };

          recorder.start();
        } catch (error) {
          console.error("Error creating/starting MediaRecorder:", error);
          setError(t("phonemeBlendingErrorStartRecording"));
          setCurrentTranscriptionStatus("error");
          stopListening();
          setIsRecording(false);
        }
      })
      .catch((error) => {
        console.error("getUserMedia error:", error);
        setError(t("phonemeBlendingErrorMicAccess"));
        setCurrentTranscriptionStatus("error");
        setIsRecording(false);
      });
  }, [stopListening, uploadAudio, t, isTranscribing]);
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      stopListening();
    };
  }, [stopListening]);

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
  }, [currentWordIndex, stopListening]);

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
      setError(t("phonemeBlendingErrorNoInputSubmit"));
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
    setLoadingMessageKey("phonemeBlendingLoadingSubmitting"); // Use a key for LoadingOverlay
    await finishGame(responses);
    setIsSubmittingAll(false);
  };

  const finishGame = async (responsesToSubmit) => {
    const effectiveChildId = childId;
    if (!effectiveChildId) {
      console.error("Cannot submit results: childId is missing.");
      setError(t("phonemeBlendingErrorSubmitNoChildId"));
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
      setError(t("phonemeBlendingErrorSubmitFailed"));

      if (suppressResultPage && typeof onComplete === "function") {
        console.log("Error submitting, but calling onComplete with score 0.");
        onComplete(0);
      } else {
        console.log("Error submitting, showing results page.");
        setGameState("results");
      }
    }
  };

  const currentWord = WORDS[currentWordIndex];
  const progress = Math.min(100, (currentWordIndex / WORDS.length) * 100);

  const renderTranscriptionStatus = () => {
    switch (currentTranscriptionStatus) {
      case "recording":
        return (
          <div className="flex items-center justify-center gap-2 text-red-600 h-6">
            <Mic className="h-4 w-4 animate-pulse" />{" "}
            {t("phonemeBlendingStatusRecording")}
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center justify-center gap-2 text-blue-600 h-6">
            <Loader2 className="h-4 w-4 animate-spin" />{" "}
            {t("phonemeBlendingStatusTranscribing")}
          </div>
        );
      case "done":
        return (
          <div className="flex items-center justify-center gap-2 text-green-600 h-6">
            <Check className="h-4 w-4" /> {t("phonemeBlendingStatusDone")}
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center gap-2 text-red-600 h-6">
            <X className="h-4 w-4" /> {t("phonemeBlendingStatusError")}
          </div>
        );
      case "typed":
        return (
          <div className="flex items-center justify-center gap-2 text-white h-6 text-sm">
            {t("phonemeBlendingStatusTyped")}
          </div>
        );
      case "idle":
      default:
        return (
          <div className="h-6 text-white text-lg text-center">
            {t("phonemeBlendingStatusIdle")}
          </div>
        );
    }
  };
  const handleNext = () => {
    if (currentDialog < dialogIntroTexts.length - 1) {
      setCurrentDialog((prev) => prev + 1);
    } else {
      setShowIntro(false);
    }
  };
  return (
    <>
      {showIntro ? (
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
              className="absolute inset-0 bg-white/20"
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
                  alt={t("altBlendaTheDolphin")}
                  className="h-64 sm:h-80 lg:h-96 xl:h-112 object-contain"
                />
              </motion.div>

              {/* Enhanced glass-morphism dialog box */}
              <motion.div
                className="bg-gradient-to-br from-cyan-800/70 via-blue-900/70 to-indigo-900/70 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-white/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {/* Oceanic decorative elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-500"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-400/20 rounded-full filter blur-xl"></div>
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-sky-400/20 rounded-full filter blur-xl"></div>
                <div className="absolute top-1/2 right-8 w-24 h-24 bg-indigo-300/10 rounded-full filter blur-lg"></div>
                <div className="absolute bottom-8 left-8 w-32 h-32 bg-blue-300/10 rounded-full filter blur-lg"></div>

                {/* Enhanced animated dialog text */}
                <motion.div
                  key={currentDialog}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white mb-8 lg:mb-12 min-h-48 sm:min-h-56 lg:min-h-64 xl:min-h-72 flex items-center justify-center font-serif font-medium leading-relaxed text-center px-4"
                >
                  <span className="drop-shadow-lg">
                    {dialogIntroTexts[currentDialog]}
                  </span>
                </motion.div>

                {/* Enhanced progress indicators */}
                <div className="flex justify-center gap-3 mb-8 lg:mb-10">
                  {dialogIntroTexts.map((_, index) => (
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
                      currentDialog < dialogIntroTexts.length - 1
                        ? "bg-gradient-to-r from-white to-blue-100 text-blue-900 hover:from-blue-50 hover:to-blue-200 hover:shadow-blue-200/50"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-purple-500/50"
                    }`}
                  >
                    {currentDialog < dialogIntroTexts.length - 1 ? (
                      <>
                        <span className="drop-shadow-sm">{t("next")}</span>
                        <FaChevronRight className="mt-0.5 drop-shadow-sm" />
                      </>
                    ) : (
                      <>
                        <span className="drop-shadow-sm">{t("imReady")}</span>
                        <FaCheck className="mt-0.5 drop-shadow-sm" />
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      ) : (
        <>
          {/* Game Page with Ocean Background */}
          <div className="fixed inset-0 z-40">
            {/* background   */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-white/20" />
          </div>

          {/* Main game content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
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
            <AnimatePresence>
              {isSubmittingAll && (
                <LoadingOverlay messageKey={loadingMessageKey} t={t} />
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              className="w-full max-w-2xl bg-gradient-to-br from-cyan-600/80 to-blue-500/30 rounded-3xl shadow-2xl p-8 space-y-8 backdrop-blur-md border-2 border-white/40 relative overflow-hidden"
            >
              {/* Progress Bar with Wave Design */}
              <div className="space-y-3 relative z-10">
                <div className="relative h-5 bg-white/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#3FB8AF] to-[#7E6BC4] rounded-full relative"
                    style={{ width: `${progress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="absolute inset-0 bg-[url('/images/wave-pattern.png')] bg-[length:20px_10px] opacity-40" />
                  </motion.div>
                </div>
                <div className="flex justify-between text-lg font-medium text-white">
                  <span>{t("phonemeBlendingProgressBarStart")}</span>
                  <span className="text-white font-bold">
                    {t("phonemeBlendingProgressBarWord") +
                      ` ${currentWordIndex + 1} / ${WORDS.length}`}
                  </span>
                  <span>{t("phonemeBlendingProgressBarFinish")}</span>
                </div>
              </div>

              {/* Header with Dolphin Animation */}
              <div className="text-center space-y-4 relative z-10">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative inline-block"
                >
                  <motion.h2
                    className="text-4xl font-bold bg-clip-text text-[#F6F9FC]/90"
                    whileHover={{ scale: 1.05 }}
                  >
                    {t("phonemeBlendingHeaderTitle")}
                  </motion.h2>
                  <motion.div
                    animate={{ x: [0, 15, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                    className="absolute -right-12 -top-6 text-5xl"
                  >
                    🐬
                  </motion.div>
                </motion.div>
                <motion.p
                  className="text-white font-semibold text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {showResponseArea
                    ? t("phonemeBlendingPromptEnterOrSay")
                    : t("phonemeBlendingPromptListen")}
                </motion.p>
              </div>

              {/* Error Display with Bubble Effect */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-[#1B2B34]/90 border-2 border-[#FFC9DE] text-white p-4 rounded-xl shadow-lg"
                >
                  <div className="flex items-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="mr-3 text-2xl"
                    >
                      ⚠️
                    </motion.div>
                    <p className="text-lg">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Central Interactive Element */}
              <motion.div
                className="flex justify-center my-8 relative z-10"
                whileHover={{ scale: 1.05 }}
              >
                <div className="relative">
                  {/* Base Circle */}
                  <motion.div
                    animate={{
                      scale: isPlayingSound || isRecording ? [1, 1.1, 1] : 1,
                      rotate: isPlayingSound || isRecording ? [0, 5, -5, 0] : 0,
                      background: isPlayingSound
                        ? "radial-gradient(circle, #3FB8AF, #7E6BC4)"
                        : showResponseArea
                        ? isRecording
                          ? "radial-gradient(circle, #FFC9DE, #7E6BC4)"
                          : "radial-gradient(circle, #A7D676, #3FB8AF)"
                        : "radial-gradient(circle, #7E6BC4, #3FB8AF)",
                    }}
                    transition={{
                      duration: 1,
                      repeat: isPlayingSound || isRecording ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    className="w-40 h-40 rounded-full flex items-center justify-center shadow-xl border-4 border-white/40"
                  >
                    {/* Dynamic Content */}
                    {isPlayingSound ? (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                        className="text-7xl"
                      >
                        🌊
                      </motion.div>
                    ) : showResponseArea ? (
                      isRecording ? (
                        <motion.div
                          animate={{ scale: [0.9, 1.1] }}
                          transition={{
                            duration: 0.5,
                            repeat: Infinity,
                            repeatType: "reverse",
                          }}
                          className="text-7xl"
                        >
                          🎤
                        </motion.div>
                      ) : isTranscribing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="text-7xl"
                        >
                          🌀
                        </motion.div>
                      ) : currentTranscriptionStatus === "done" ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-7xl"
                        >
                          ✨
                        </motion.div>
                      ) : (
                        <div className="text-7xl">🔊</div>
                      )
                    ) : (
                      <div className="text-7xl">🐚</div>
                    )}
                  </motion.div>

                  {/* Pulsing Ring Effect */}
                  {(isPlayingSound || isRecording) && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0.7 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute inset-0 border-4 border-[#7E6BC4] rounded-full pointer-events-none"
                    />
                  )}
                </div>
              </motion.div>

              {/* Initial State: Play Sounds Button */}
              {!showResponseArea && !showFinalSubmitButton && (
                <div className="space-y-6 relative z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-brfrom-[#093B54]/80 via-[#0E5A75]/50 to-[#1289A7]/40
 rounded-xl p-5 shadow-lg border border-[#3FB8AF]/40"
                  >
                    <p className="text-center text-xl text-white font-semibold">
                      {t("phonemeBlendingPromptListen")} {/* Reusing the key */}
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={playCurrentWordSounds}
                      disabled={isPlayingSound}
                      className="w-full bg-gradient-to-r from-[#3FB8AF] to-[#7E6BC4] hover:from-[#7E6BC4] hover:to-[#3FB8AF] text-white font-bold py-4 text-xl rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                    >
                      {isPlayingSound ? (
                        <motion.span
                          animate={{ opacity: [0.6, 1, 0.6] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex items-center justify-center gap-3"
                        >
                          <Volume2 className="h-6 w-6" />{" "}
                          {t("phonemeBlendingPlayingSoundsButton")}
                        </motion.span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <Volume2 className="h-6 w-6" />{" "}
                          {t("phonemeBlendingPlaySoundsButton")}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Response State: Input Field, Record Button, Submit/Skip */}
              {showResponseArea && !showFinalSubmitButton && (
                <div className="space-y-6 relative z-10">
                  {/* Prompt Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue/20 rounded-xl p-5 shadow-lg border border-[#00D4FF]/40"
                  >
                    <p className="text-center text-xl font-semibold text-white">
                      {t("phonemeBlendingPromptHeard")}
                    </p>
                  </motion.div>

                  {/* Transcription Status */}
                  {renderTranscriptionStatus()}

                  {/* Input Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={userInput}
                      onChange={handleInputChange}
                      placeholder={t("phonemeBlendingInputPlaceholder")}
                      className="w-full px-5 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-cyan-300/40 focus:outline-none focus:ring-2 focus:ring-cyan-200/70 focus:border-transparent text-center font-semibold text-lg text-white placeholder-blue-700 shadow-lg"
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
                    <motion.div
                      animate={{
                        scaleX: [1, 1.05, 1],
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"
                    />
                  </motion.div>

                  {/* Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    {/* Record Button */}
                    <Button
                      onClick={isRecording ? stopListening : startListening}
                      className={`rounded-xl py-4 text-xl font-bold shadow-lg transition-all ${
                        isRecording
                          ? "bg-gradient-to-r from-rose-500 to-pink-400 animate-pulse"
                          : "bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-cyan-500 hover:to-sky-600"
                      } text-white`}
                      disabled={
                        isPlayingSound || isTranscribing || isSubmittingAll
                      }
                    >
                      {isRecording ? (
                        <motion.span
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          className="flex items-center justify-center gap-3"
                        >
                          <MicOff className="h-6 w-6" />{" "}
                          {t("phonemeBlendingStopButton")}
                        </motion.span>
                      ) : (
                        <span className="flex items-center justify-center gap-3">
                          <Mic className="h-6 w-6" />{" "}
                          {t("phonemeBlendingRecordButton")}
                        </span>
                      )}
                    </Button>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmitResponse}
                      className="bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-cyan-500 hover:to-sky-600 font-bold py-4 text-xl rounded-xl shadow-lg transition-all text-white drop-shadow-lg"
                      disabled={
                        !userInput.trim() ||
                        isRecording ||
                        isTranscribing ||
                        isPlayingSound ||
                        isSubmittingAll
                      }
                    >
                      <Check className="h-6 w-6" />{" "}
                      {t("phonemeBlendingSubmitButton")}
                    </Button>

                    {/* Skip Button - Full width */}
                    <Button
                      onClick={skipWord}
                      className="col-span-2 bg-gradient-to-r from-sky-800 to-cyan-500 text-slate-900 font-bold py-4 text-xl rounded-xl shadow-lg hover:from-cyan-600 hover:to-sky-700 transition-all transform hover:scale-[1.01]"
                      disabled={
                        isPlayingSound ||
                        isRecording ||
                        isTranscribing ||
                        isSubmittingAll
                      }
                    >
                      <SkipForward className="h-6 w-6" />{" "}
                      {t("phonemeBlendingSkipButton")}
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Final Submit Button State */}
              {showFinalSubmitButton && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6 pt-6 relative z-10"
                >
                  <motion.p
                    className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#A7D676]"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {t("phonemeBlendingAllWordsAttempted")}
                  </motion.p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleFinalSubmit}
                      className="bg-gradient-to-r from-[#3FB8AF] via-[#7E6BC4] to-[#FFC9DE] hover:from-[#FFC9DE] hover:via-[#7E6BC4] hover:to-[#3FB8AF] text-white font-bold py-5 px-10 rounded-xl shadow-xl text-xl relative overflow-hidden"
                      isLoading={isSubmittingAll}
                      loadingTextKey="phonemeBlendingLoadingSubmitting"
                      t={t}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        <Send className="h-6 w-6" />{" "}
                        {t("phonemeBlendingSubmitAllButton")}
                      </span>
                      <motion.div
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </>
  );
}

PhonemeGame.propTypes = {
  onComplete: PropTypes.func,
  suppressResultPage: PropTypes.bool,
  student: PropTypes.object,
};
