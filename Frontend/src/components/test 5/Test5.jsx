import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { backendURL } from "../../definedURL";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import PropTypes from "prop-types";
import {
  FaChevronRight,
  FaCheck,
  FaArrowLeft,
  FaPlay,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Loader2, Mic, MicOff, Check } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import graphemeLetters from "./graphemeLetters.json";
import birdImage from "../../assets/grapheme-test/characterImage.png";
import backgroundImage from "../../assets/grapheme-test/backgroundImage.png";
import { useNavigate } from "react-router-dom";
const Button = ({
  onClick,
  disabled,
  children,
  className = "",
  variant = "primary",
  isLoading = false,
}) => {
  const baseStyle =
    "py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-sm";
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed",
    secondary:
      "bg-blue-100 text-blue-700 hover:bg-blue-200 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed",
  };
  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.03 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </motion.button>
  );
};
Button.propTypes = {
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
  isLoading: PropTypes.bool,
};

const GraphemeTest = ({ suppressResultPage = false, onComplete }) => {
  const LETTER_TIMER_DURATION = 8;
  const { language, t } = useLanguage();

  // Get letters and confusion pairs based on language
  const langKey =
    language === "ta" ? "tamil" : language === "hi" ? "hindi" : "english";
  const [letters] = useState(graphemeLetters[langKey].letters);
  const [confusionPairs] = useState(graphemeLetters[langKey].confusionPairs);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LETTER_TIMER_DURATION);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isProcessingSubmit, setIsProcessingSubmit] = useState(false);
  const [userInputs, setUserInputs] = useState(Array(letters.length).fill(""));
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [inputStatus, setInputStatus] = useState({});

  const { width, height } = useWindowSize();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const inputRef = useRef(null);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(isRecording);

  const childId = localStorage.getItem("childId");
  const token = localStorage.getItem("access_token");
  const [showIntro, setShowIntro] = useState(true);
  const [currentDialog, setCurrentDialog] = useState(0);
  const navigate = useNavigate();

  const handleNextDialog = () => {
    if (currentDialog < dialog.length - 1) {
      setCurrentDialog((prev) => prev + 1);
    } else {
      setShowIntro(false);
      speakText(t("start_forward_instructions")); // Start the test instructions
    }
  };
  const dialog = [
    "🎶 Welcome, traveler, to Phoneme Point! The singing cliffs echo with melodies of sound and letter.",
    "🐦 We are Riff & Raff, twin songbirds and guardians of these luminous cliffs. Here, each note carries the spark of a letter's sound.",
    "🔤 Your task is to match the letters with the sounds they sing (or the other way around). Let the music of the cliffs guide you.",
    "🎼 In return, we shall grant you the Shell of Soundcraft and the Tune Torch, which reveals the silent letters in any word.",
    "🎵 Are you ready to let the cliffs sing you their secrets and find the harmony of letters and sounds?",
  ];

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const stopListening = useCallback((indexToUpdate) => {
    const wasRecording = isRecordingRef.current;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping MediaRecorder:", e);
      }
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
    }
  }, []);

  const uploadAudio = useCallback(
    async (audioBlob, indexToUpdate) => {
      if (!audioBlob || audioBlob.size === 0) {
        console.log("No audio data to upload for index:", indexToUpdate);

        setInputStatus((prev) => ({
          ...prev,
          [indexToUpdate]:
            prev[indexToUpdate] === "done_typed" ? "done_typed" : "error",
        }));
        setIsTranscribing(false);
        return;
      }
      const formData = new FormData();
      const filename = `grapheme_test_child_${childId}_index_${indexToUpdate}_${Date.now()}.wav`;
      const file = new File([audioBlob], filename, { type: "audio/wav" });
      formData.append("file", file);

      setInputStatus((prev) => ({
        ...prev,
        [indexToUpdate]:
          prev[indexToUpdate] === "recording" ? "pending" : prev[indexToUpdate],
      }));
      setIsTranscribing(true);
      formData.append("language", language);
      try {
        const response = await fetch(`${backendURL}/transcribe`, {
          method: "POST",
          body: formData,
        });
        const result = await response.json();

        if (response.ok && result.transcription != null) {
          const transcribedText = result.transcription.trim().toLowerCase();

          const currentStatusBeforeUpdate = inputStatus[indexToUpdate];

          if (transcribedText) {
            setUserInputs((prevInputs) => {
              const newInputs = [...prevInputs];

              if (currentStatusBeforeUpdate !== "done_typed") {
                newInputs[indexToUpdate] = transcribedText;

                setInputStatus((prev) => ({
                  ...prev,
                  [indexToUpdate]: "done_voice",
                }));
              } else {
                console.log(
                  `Skipping transcription update for index ${indexToUpdate}, user typed.`
                );
              }
              return newInputs;
            });
          } else {
            console.error(
              `Transcription successful but empty for index ${indexToUpdate}`
            );
            toast.error(
              `Heard nothing clearly for "${letters[indexToUpdate]}". Try typing.`
            );

            if (currentStatusBeforeUpdate !== "done_typed") {
              setInputStatus((prev) => ({ ...prev, [indexToUpdate]: "error" }));
            }
          }
        } else {
          console.error(
            `Transcription failed API side for index ${indexToUpdate}:`,
            result
          );
          toast.error(
            `Transcription failed for letter "${letters[indexToUpdate]}". Try typing.`
          );

          if (inputStatus[indexToUpdate] !== "done_typed") {
            setInputStatus((prev) => ({ ...prev, [indexToUpdate]: "error" }));
          }
        }
      } catch (error) {
        console.error(
          `Network/Fetch error during transcription for index ${indexToUpdate}:`,
          error
        );
        toast.error(
          `Error processing audio for letter "${letters[indexToUpdate]}". Try typing.`
        );

        if (inputStatus[indexToUpdate] !== "done_typed") {
          setInputStatus((prev) => ({ ...prev, [indexToUpdate]: "error" }));
        }
      } finally {
        setIsTranscribing(false);

        if (
          currentIndex === indexToUpdate &&
          !(inputStatus[currentIndex] === "done_voice" || isRecording)
        ) {
          inputRef.current?.focus();
        }
      }
    },
    [childId, letters, currentIndex, inputStatus, stopListening]
  );

  const startListening = useCallback(() => {
    if (isRecordingRef.current || currentIndex >= letters.length) return;

    const currentStatus = inputStatus[currentIndex] || "idle";
    if (currentStatus === "done_voice" || currentStatus === "pending") {
      toast.info("Already processing voice input for this letter.");
      return;
    }

    setUserInputs((prev) => {
      const newInputs = [...prev];
      newInputs[currentIndex] = "";
      return newInputs;
    });
    setInputStatus((prev) => ({ ...prev, [currentIndex]: "recording" }));
    setIsRecording(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        audioChunksRef.current = [];
        if (stream.getAudioTracks().length > 0)
          stream.getAudioTracks()[0].onended = () => {
            console.warn("Audio track ended unexpectedly!");
            stopListening(currentIndex);
          };

        try {
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
          };
          recorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, {
              type: "audio/wav",
            });

            uploadAudio(audioBlob, currentIndex);
            audioChunksRef.current = [];
          };
          recorder.onerror = (e) => {
            console.error("MediaRecorder error:", e.error);
            toast.error("Recording error.");
            setInputStatus((prev) => ({ ...prev, [currentIndex]: "error" }));
            stopListening(currentIndex);
          };
          recorder.start();
        } catch (error) {
          console.error("MediaRecorder creation/start error:", error);
          toast.error("Could not start recording.");
          setInputStatus((prev) => ({ ...prev, [currentIndex]: "error" }));
          stopListening(currentIndex);
          setIsRecording(false);
        }
      })
      .catch((error) => {
        console.error("getUserMedia error:", error);
        toast.error("Microphone access denied or unavailable.");
        setInputStatus((prev) => ({ ...prev, [currentIndex]: "error" }));
        setIsRecording(false);
      });
  }, [currentIndex, letters.length, stopListening, uploadAudio, inputStatus]);

  const handleNext = useCallback(() => {
    if (currentIndex >= letters.length) return;

    console.log(`handleNext called for index ${currentIndex}`);

    stopListening(currentIndex);

    if (currentIndex < letters.length - 1) {
      console.log(`Advancing to index ${currentIndex + 1}`);
      setCurrentIndex((prev) => prev + 1);
    } else {
      console.log(`Last letter done, advancing to trigger submit view.`);

      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, letters.length, stopListening]);

  useEffect(() => {
    if (
      timeLeft <= 0 ||
      showResults ||
      showSubmit ||
      currentIndex >= letters.length ||
      isProcessingSubmit
    ) {
      if (
        timeLeft <= 0 &&
        !showResults &&
        !showSubmit &&
        currentIndex < letters.length &&
        !isProcessingSubmit
      ) {
        const currentStatus = inputStatus[currentIndex] || "idle";

        if (isRecordingRef.current) {
          stopListening(currentIndex);
        } else if (
          currentStatus === "idle" ||
          currentStatus === "error" ||
          currentStatus === "recording"
        ) {
          setUserInputs((prev) => {
            const ni = [...prev];
            if (!ni[currentIndex]) ni[currentIndex] = "";
            return ni;
          });
          setInputStatus((prev) => ({ ...prev, [currentIndex]: "error" }));
          handleNext();
        } else {
        }
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [
    timeLeft,
    showResults,
    showSubmit,
    currentIndex,
    letters.length,
    inputStatus,
    isProcessingSubmit,
    stopListening,
    handleNext,
  ]);

  useEffect(() => {
    if (currentIndex < letters.length && !showSubmit && !showResults) {
      setTimeLeft(LETTER_TIMER_DURATION);

      if (isRecordingRef.current) {
        stopListening(currentIndex);
      }
      setIsRecording(false);

      inputRef.current?.focus();
    } else if (
      currentIndex === letters.length &&
      !showSubmit &&
      !showResults &&
      !isProcessingSubmit
    ) {
      stopListening(-1);
      setShowSubmit(true);
    }
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      console.log("GraphemeTest unmounting.");
      stopListening(-1);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    const currentStatus = inputStatus[currentIndex] || "idle";

    if (
      currentStatus === "pending" ||
      currentStatus === "done_voice" ||
      currentStatus === "recording"
    ) {
      if (currentStatus === "recording")
        toast.error("Stop recording before typing.");
      else toast.error("Clear voice input to type instead.");
      return;
    }

    const newInputs = [...userInputs];
    newInputs[currentIndex] = value;
    setUserInputs(newInputs);
    setInputStatus((prev) => ({
      ...prev,
      [currentIndex]: value ? "done_typed" : "idle",
    }));
  };

  const handleRecordButtonClick = () => {
    if (isRecordingRef.current) {
      stopListening(currentIndex);
    } else {
      const currentStatus = inputStatus[currentIndex] || "idle";

      if (
        currentStatus === "done_typed" ||
        currentStatus === "done_voice" ||
        currentStatus === "pending"
      ) {
        toast.info(
          "Input already provided or pending for this letter. Clear or wait."
        );
        return;
      }

      startListening();
    }
  };

  const handleSubmit = async () => {
    setIsProcessingSubmit(true);
    setShowSubmit(false);
    toast.loading("Processing your responses...");
    stopListening(-1);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const finalUserInputs = [...userInputs];
    while (finalUserInputs.length < letters.length) finalUserInputs.push("");

    try {
      const evalResponse = await axios.post(
        `${backendURL}/evaluate-grapheme-test`,
        {
          childId,
          letters,
          transcriptions: finalUserInputs.slice(0, letters.length),
          language:
            language === "ta"
              ? "tamil"
              : language === "hi"
              ? "hindi"
              : "english",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.dismiss();
      setScore(evalResponse.data.score);
      setIsProcessingSubmit(false);

      if (suppressResultPage && typeof onComplete === "function") {
        onComplete(evalResponse.data.score);
      } else {
        setShowResults(true);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to process results. Please try again.");
      console.error("Submission Error:", error);
      setIsProcessingSubmit(false);
      setShowSubmit(true);
    }
  };

  const restartTest = () => {
    stopListening(-1);
    setCurrentIndex(0);
    setUserInputs(Array(letters.length).fill(""));
    setShowResults(false);
    setShowSubmit(false);
    setScore(0);
    setIsProcessingSubmit(false);
    setInputStatus({});
    setTimeLeft(LETTER_TIMER_DURATION);
    setIsRecording(false);
  };

  const renderCurrentInputStatus = () => {
    const status = inputStatus[currentIndex] || "idle";
    switch (status) {
      case "recording":
        return (
          <div className="flex items-center justify-center gap-2 text-red-600 h-6 mb-4">
            <Mic className="h-4 w-4 animate-pulse" /> Recording...
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center justify-center gap-2 text-blue-600 h-6 mb-4">
            <Loader2 size={16} className="animate-spin" /> Transcribing...
          </div>
        );
      case "done_voice":
        return (
          <div className="flex items-center justify-center gap-2 text-green-600 h-6 mb-4">
            <Check size={16} /> Heard:{" "}
            <span className="bg-green-100 px-2 py-0.5 rounded font-medium">
              {userInputs[currentIndex]}
            </span>
          </div>
        );
      case "done_typed":
        return (
          <div className="flex items-center justify-center gap-2 text-green-600 h-6 mb-4">
            <Check size={16} /> Typed:{" "}
            <span className="bg-green-100 px-2 py-0.5 rounded font-medium">
              {userInputs[currentIndex]}
            </span>
          </div>
        );
      case "error":
        return (
          <div className="text-red-500 text-sm h-6 mb-4 text-center">
            Processing failed. Try again or type.
          </div>
        );
      case "idle":
      default:
        return (
          <div className="text-gray-500 text-sm h-6 mb-4 text-center">
            Ready to type or record.
          </div>
        );
    }
  };

  const canGoNext =
    inputStatus[currentIndex] === "done_voice" ||
    inputStatus[currentIndex] === "done_typed";
  if (showIntro) {
    return (
      <>
        {/* Blurred background with water-like overlay */}
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              filter: "blur(8px)",
            }}
          />
          <motion.div
            className="absolute inset-0 bg-blue-900/30"
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
            {/* Mirrorfish character on the left */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                y: {
                  duration: 4,
                  repeat: Infinity,
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
                src={birdImage}
                alt="Mira the Mirrorfish"
                className="h-64 sm:h-80 lg:h-96 object-contain"
              />
            </motion.div>

            {/* Water-like glass dialog box */}
            <motion.div
              className="bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-blue-700/80 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border-2 border-blue-400/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {/* Water ripple decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full filter blur-2xl"></div>

              {/* Dialog text with water reflection effect */}
              <motion.div
                key={currentDialog}
                className="text-xl sm:text-2xl lg:text-3xl text-white mb-8 min-h-48 flex items-center justify-center font-serif leading-relaxed text-center px-4"
                style={{ textShadow: "0 0 8px rgba(173, 216, 230, 0.7)" }}
              >
                {dialog[currentDialog]}
              </motion.div>

              {/* Progress indicators as bubbles */}
              <div className="flex justify-center gap-3 mb-8">
                {dialog.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index <= currentDialog
                        ? "bg-blue-300 shadow-[0_0_10px_2px_rgba(100,200,255,0.7)]"
                        : "bg-blue-300/30"
                    }`}
                    animate={{
                      scale: index === currentDialog ? [1, 1.3, 1] : 1,
                      y: index === currentDialog ? [0, -5, 0] : 0,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  />
                ))}
              </div>

              {/* Continue button with water ripple effect */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextDialog}
                  className={`flex items-center justify-center gap-3 py-4 px-8 lg:px-12 rounded-2xl font-semibold text-lg lg:text-xl shadow-lg transition-all duration-300
        ${
          currentDialog < dialog.length - 1
            ? "bg-gradient-to-r from-teal-300 via-blue-200 to-teal-400 text-blue-900 hover:from-teal-200 hover:via-blue-100 hover:to-teal-300 hover:shadow-blue-200/50"
            : "bg-gradient-to-r from-teal-400 to-blue-500 text-white hover:from-teal-500 hover:to-blue-600 hover:shadow-blue-300/50"
        }`}
                >
                  {currentDialog < dialog.length - 1 ? (
                    <>
                      <span className="drop-shadow-sm text-blue-950">Next</span>
                      <FaChevronRight className="mt-0.5 drop-shadow-sm text-blue-950" />
                    </>
                  ) : (
                    <>
                      <span className="drop-shadow-sm text-blue-950">
                        {t("imReady")}
                      </span>
                      <FaCheck className="mt-0.5 drop-shadow-sm text-blue-950" />
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
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-cover bg-center bg-no-repeat"
    style={{
      backgroundImage: `url(${backgroundImage})`,
    }}
  >
    {/* Overlay for better text visibility */}
    <div className="absolute inset-0 bg-gradient-to-b from-orange-900/40 via-purple-900/30 to-blue-900/50" />
    
    {/* Confetti */}
    {showResults && (
      <Confetti
        width={width}
        height={height}
        recycle={false}
        numberOfPieces={200}
        colors={["#FB923C", "#A855F7", "#3B82F6", "#F59E0B", "#FFFFFF"]}
      />
    )}

    {/* Main Container */}
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
      
      {/* Header with Cliff Theme */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="text-center mb-6"
      >
        <motion.h1
          animate={{ 
            textShadow: [
              "0 0 20px rgba(251, 146, 60, 0.8)",
              "0 0 30px rgba(168, 85, 247, 0.8)",
              "0 0 20px rgba(251, 146, 60, 0.8)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-orange-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-2"
        >
          🎵 Phoneme Point 🎵
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg md:text-xl text-orange-200 font-medium"
        >
          The Harmony of Sound and Letter
        </motion.p>
      </motion.div>

      {/* Floating Birds Animation */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-20 right-20 text-4xl opacity-80"
      >
        🕊️
      </motion.div>
      
      <motion.div
        animate={{
          x: [0, -80, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute top-32 left-20 text-4xl opacity-80"
      >
        🕊️
      </motion.div>

      {/* Main Test Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="w-full max-w-2xl bg-gradient-to-br from-orange-900/80 via-purple-900/70 to-blue-900/80 backdrop-blur-lg rounded-3xl p-8 border-2 border-orange-400/30 shadow-2xl relative overflow-hidden"
      >
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400/20 rounded-full filter blur-2xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/20 rounded-full filter blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-3">
            <span className="text-sm font-medium text-orange-200">
              🎼 Cliff Progress: {Math.min(currentIndex, letters.length)}/{letters.length}
            </span>
            <span className="text-sm font-medium text-orange-200">
              {Math.round((Math.min(currentIndex, letters.length) / letters.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-purple-900/50 rounded-full h-4 overflow-hidden border border-orange-400/30">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(Math.min(currentIndex, letters.length) / letters.length) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 h-4 rounded-full relative"
            >
              <motion.div
                animate={{ x: [-10, 10, -10] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white/20 rounded-full"
              />
            </motion.div>
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {/* Processing Submit State */}
          {isProcessingSubmit ? (
            <motion.div
              key="processing-submit"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12 min-h-[400px] flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="text-6xl"
                >
                  🎵
                </motion.div>
                <Loader2 size={48} className="text-orange-400 animate-spin" />
                <p className="text-2xl text-orange-200 font-medium">
                  The cliffs are harmonizing your melody...
                </p>
              </div>
            </motion.div>
          ) : showSubmit ? (
            /* Submit Screen */
            <motion.div
              key="submit"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 min-h-[400px] flex flex-col items-center justify-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-8xl mb-6"
              >
                🏔️
              </motion.div>
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl font-bold text-orange-200 mb-4"
              >
                Ready to Unlock the Cliffs' Secrets?
              </motion.h2>
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-orange-300 mb-8 text-lg"
              >
                You've completed your journey through all the resonant stones!
              </motion.p>
              <Button
                onClick={handleSubmit}
                variant="primary"
                className="px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 border-none shadow-lg"
              >
                🎼 Submit Your Melody
              </Button>
            </motion.div>
          ) : showResults ? (
            /* Results Screen */
            <motion.div
              key="results"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 min-h-[400px] flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1, type: "spring" }}
                className="text-8xl mb-6"
              >
                🏆
              </motion.div>
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-orange-200 mb-4"
              >
                The Cliffs Sing Your Victory!
              </motion.h2>
              <motion.p
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-orange-300 mb-6 text-xl"
              >
                You harmonized {score} out of {letters.length} cliff songs!
              </motion.p>
              
              {/* Animated Score Bar */}
              <div className="w-full bg-purple-900/50 rounded-full h-6 mb-8 overflow-hidden border border-orange-400/30">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / letters.length) * 100}%` }}
                  transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 h-6 rounded-full relative flex items-center justify-center"
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={ { opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    className="text-white font-bold text-sm"
                  >
                    {Math.round((score / letters.length) * 100)}%
                  </motion.span>
                </motion.div>
              </div>
              
              <Button
                onClick={restartTest}
                variant="primary"
                className="px-8 py-4 text-lg bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 border-none shadow-lg"
              >
                🎵 Sing Again
              </Button>
            </motion.div>
          ) : currentIndex < letters.length ? (
            /* Main Test Interface */
            <motion.div
              key={`letter-${currentIndex}`}
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -30 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex flex-col items-center min-h-[400px]"
            >
              
              {/* Glowing Letter Cliff Stone */}
              <div className="relative mb-6">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  animate={{ 
                    boxShadow: [
                      "0 0 30px rgba(251, 146, 60, 0.5)",
                      "0 0 50px rgba(168, 85, 247, 0.7)",
                      "0 0 30px rgba(59, 130, 246, 0.5)",
                      "0 0 50px rgba(251, 146, 60, 0.7)"
                    ]
                  }}
                  transition={{ 
                    boxShadow: { duration: 4, repeat: Infinity },
                    hover: { type: "spring", stiffness: 300 }
                  }}
                  className="w-64 h-64 md:w-72 md:h-72 bg-gradient-to-br from-orange-200/90 via-purple-200/90 to-blue-200/90 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-orange-400/50 relative overflow-hidden"
                >
                  {/* Stone texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-300/20 via-transparent to-purple-300/20 rounded-3xl" />
                  
                  {/* Resonating ripples */}
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 border-4 border-orange-400/30 rounded-3xl"
                  />
                  
                  {/* Letter */}
                  <motion.span
                    animate={{ 
                      textShadow: [
                        "0 0 20px rgba(251, 146, 60, 0.8)",
                        "0 0 30px rgba(168, 85, 247, 0.8)",
                        "0 0 20px rgba(59, 130, 246, 0.8)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-8xl md:text-9xl font-extrabold bg-gradient-to-br from-orange-700 via-purple-700 to-blue-700 bg-clip-text text-transparent select-none relative z-10"
                  >
                    {letters[currentIndex]}
                  </motion.span>
                </motion.div>
                
                {/* Timer Compass */}
                <div className="absolute -top-6 -right-6 md:-top-8 md:-right-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="relative w-20 h-20 md:w-24 md:h-24"
                  >
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                        fill="none"
                        stroke="#FB923C40"
                        strokeWidth="3"
                      />
                      <motion.path
                        d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831"
                        fill="none"
                        stroke="#FB923C"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "100, 100" }}
                        animate={{
                          strokeDasharray: `${(timeLeft / LETTER_TIMER_DURATION) * 100}, 100`,
                        }}
                        transition={{ duration: 1, ease: "linear" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span 
                        animate={{ scale: timeLeft <= 3 ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 0.5, repeat: timeLeft <= 3 ? Infinity : 0 }}
                        className={`text-lg md:text-xl font-bold ${timeLeft <= 3 ? 'text-red-400' : 'text-orange-200'}`}
                      >
                        {timeLeft}s
                      </motion.span>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Status Indicator with Cliff Theme */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-12 mb-6 flex items-center justify-center"
              >
                {renderCurrentInputStatus()}
              </motion.div>

              {/* Input Area */}
              <div className="w-full max-w-sm mb-6 flex flex-col items-center gap-4">
                {/* Text Input with Cliff Styling */}
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(251, 146, 60, 0.5)" }}
                  ref={inputRef}
                  type="text"
                  value={userInputs[currentIndex]}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 text-center text-xl bg-gradient-to-r from-orange-100/90 to-purple-100/90 backdrop-blur-sm border-2 border-orange-400/50 rounded-2xl focus:outline-none focus:border-orange-400 disabled:bg-gray-400/20 disabled:cursor-not-allowed placeholder-orange-600/60 text-orange-900 font-medium"
                  placeholder="🎵 Type the letter..."
                  maxLength={10}
                  disabled={
                    isRecording ||
                    inputStatus[currentIndex] === "pending" ||
                    inputStatus[currentIndex] === "done_voice" ||
                    isProcessingSubmit
                  }
                />
                
                {/* Record Button with Cliff Styling */}
                <Button
                  onClick={handleRecordButtonClick}
                  disabled={
                    inputStatus[currentIndex] === "done_typed" ||
                    inputStatus[currentIndex] === "pending" ||
                    inputStatus[currentIndex] === "done_voice" ||
                    isProcessingSubmit
                  }
                  className={`w-full py-4 text-lg font-semibold border-2 rounded-2xl transition-all duration-300 ${
                    isRecording 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 border-red-400 text-white shadow-lg shadow-red-500/30' 
                      : 'bg-gradient-to-r from-orange-400/80 to-purple-500/80 backdrop-blur-sm border-orange-400/50 text-white hover:from-orange-500/90 hover:to-purple-600/90 shadow-lg'
                  }`}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                  {isRecording ? "🎤 Stop the Song" : "🎵 Sing the Letter"}
                </Button>
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNext}
                disabled={
                  !canGoNext ||
                  isProcessingSubmit ||
                  isRecording ||
                  isTranscribing
                }
                className="px-10 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-none shadow-lg disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
              >
                {currentIndex === letters.length - 1 ? "🏔️ Complete Journey" : "🎼 Next Cliff"}
                <FaChevronRight className="ml-2" />
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* Footer Hint with Floating Animation */}
      {!showResults &&
        !showSubmit &&
        currentIndex < letters.length &&
        !isProcessingSubmit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <motion.p
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-orange-200 font-medium text-lg bg-purple-900/30 backdrop-blur-sm px-6 py-3 rounded-full border border-orange-400/30"
            >
              🎵 Listen to the cliff's song and echo it back! 🎵
            </motion.p>
          </motion.div>
        )}
      
      {/* Decorative Musical Notes */}
      <motion.div
        animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        className="absolute bottom-20 left-10 text-3xl"
      >
        🎵
      </motion.div>
      
      <motion.div
        animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, delay: 2 }}
        className="absolute bottom-32 right-16 text-2xl"
      >
        🎶
      </motion.div>
      
      <motion.div
        animate={{ y: [0, -25, 0], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute top-40 left-1/4 text-4xl"
      >
        🎼
      </motion.div>
    </div>
  </motion.div>
);
};

GraphemeTest.propTypes = {
  suppressResultPage: PropTypes.bool,
  onComplete: PropTypes.func,
};

export default GraphemeTest;
