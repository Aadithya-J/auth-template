import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../definedURL";
import {
  Mic,
  MicOff,
  AlertCircle,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import backgroundImage from "../../assets/vocab-scale/background-image.png";
import characterImage from "../../assets/vocab-scale/Cute-Dragon.png";
import microphone from "../../assets/vocab-scale/microphone.png";

const useAudioRecorder = (onAudioCaptured) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const isRecordingRef = useRef(isRecording);
  const { language, t } = useLanguage();

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const uploadAudio = useCallback(
    async (audioBlob) => {
      const formData = new FormData();
      const file = new File([audioBlob], "vocabulary_definition.wav", {
        type: "audio/wav",
      });
      formData.append("file", file);
      formData.append("language", language);
      setIsTranscribing(true);
      setError(null);
      try {
        const response = await fetch(`${backendURL}/transcribe`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.transcription) {
          const transcription =
            result.transcription
              .toLowerCase()
              .trim()
              .replace(/[.,!?;:]*$/, "") || "";
          onAudioCaptured(transcription);
        } else {
          const errorMsg =
            result.error || t("transcriptionFailedPleaseTryAgain");
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        setError(t("errorUploadingAudioPleaseCheckConnection"));
        toast.error(t("errorUploadingAudioPleaseCheckConnection"));
      } finally {
        setIsTranscribing(false);
      }
    },
    [onAudioCaptured, language, t]
  );

  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error(t("errorStoppingMediaRecorder"), e);
      }
    }
    if (window.stream) {
      try {
        window.stream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.error(t("errorStoppingStreamTracks"), e);
      }
      window.stream = null;
    }
    mediaRecorderRef.current = null;
    if (isRecordingRef.current) {
      setIsRecording(false);
    }
  }, [isRecordingRef, t]);

  const startListening = useCallback(() => {
    if (isRecordingRef.current) return;

    setError(null);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
        let localAudioChunks = [];

        if (stream.getAudioTracks().length > 0) {
          stream.getAudioTracks()[0].onended = () => {
            stopListening();
          };
        }

        const mimeType = MediaRecorder.isTypeSupported("audio/wav;codecs=pcm")
          ? "audio/wav;codecs=pcm"
          : "audio/webm";

        const newMediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = newMediaRecorder;

        newMediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            localAudioChunks.push(event.data);
          }
        };

        newMediaRecorder.onstop = async () => {
          if (localAudioChunks.length > 0) {
            const audioBlob = new Blob(localAudioChunks, { type: mimeType });
            localAudioChunks = [];
            await uploadAudio(audioBlob);
          }
        };

        newMediaRecorder.onerror = (event) => {
          toast.error(`${t("recordingError")}: ${event.error.name}`);
          stopListening();
        };

        try {
          newMediaRecorder.start();
          setIsRecording(true);
        } catch (e) {
          toast.error(t("failedToStartRecording"));
          stopListening();
        }
      })
      .catch((error) => {
        setError(t("couldNotAccessMicrophone"));
        toast.error(t("couldNotAccessMicrophone"));
      });
  }, [uploadAudio, stopListening, isRecordingRef, t]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isRecording,
    isTranscribing,
    error,
    startListening,
    stopListening,
  };
};

// Enhanced Word Display Component
const WordDisplay = ({
  currentWord,
  currentIndex,
  totalWords,
  language,
  t,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 p-8 border-2 border-white/30 rounded-2xl bg-gradient-to-br from-blue-900/30 to-purple-900/30 shadow-lg backdrop-blur-sm relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/10 rounded-full filter blur-xl"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-sky-500"></div>

      <motion.p
        className="text-lg text-white/80 mb-4 flex justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span>
          {t("word")} {currentIndex + 1} {t("of")} {totalWords}
        </span>
        <span className="px-3 py-1 bg-white/10 rounded-full text-xs">
          {t("level")}: {currentWord.level}
        </span>
      </motion.p>

      <motion.div
        key={currentWord.word}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 15,
          delay: 0.3,
        }}
        className="text-center mb-6"
      >
        <motion.p
          className="text-5xl sm:text-6xl font-bold mb-4 text-white drop-shadow-lg"
          whileHover={{ scale: 1.02 }}
        >
          {language === "ta" && currentWord.ta
            ? currentWord.ta
            : language === "hi" && currentWord.hi
            ? currentWord.hi
            : currentWord.word}
        </motion.p>

        {(language === "ta" && currentWord.ta) ||
        (language === "hi" && currentWord.hi) ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-block px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm"
          >
            {t("english")}: {currentWord.word}
          </motion.div>
        ) : null}
      </motion.div>
    </motion.div>
  );
};

const Waveform = () => {
  const bars = [0.4, 0.6, 1, 0.6, 0.4];
  return (
    <div className="flex items-end gap-[2px] h-5">
      {bars.map((scale, i) => (
        <motion.div
          key={i}
          className="w-[3px] bg-white rounded-sm"
          animate={{ scaleY: [1, scale, 1] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 0.1,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const RecordingButton = ({
  isRecording,
  isSubmitting,
  isTranscribing,
  startListening,
  stopListening,
  t,
}) => {
  return (
    <div className="w-full flex flex-col items-center mt-6 gap-3">
      {" "}
      {/* flex-col + gap */}
      <motion.button
        whileHover={{ scale: isSubmitting || isTranscribing ? 1 : 1.08, y: -3 }}
        whileTap={{ scale: 0.92 }}
        onClick={isRecording ? stopListening : startListening}
        disabled={isSubmitting || isTranscribing}
        className={`relative flex items-center justify-center rounded-full w-32 h-32 focus:outline-none transition-all duration-300 ${
          isRecording
            ? "bg-red-500 shadow-red-500/30"
            : "bg-gradient-to-r from-blue-700/80 to-sky-400/80 shadow-[0_8px_30px_rgba(59,130,246,0.3)]"
        } ${
          isSubmitting || isTranscribing ? "opacity-70 cursor-not-allowed" : ""
        }`}
        style={{
          boxShadow: isRecording
            ? "0 0 20px rgba(239, 68, 68, 0.6)"
            : "0 6px 20px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.7)", // added extra glow here
        }}
      >
        {/* Pulsing glow effect when recording */}
        {isRecording && (
          <motion.span
            className="absolute inset-0 rounded-full bg-red-400/50"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Inner circle with microphone image (rotated anticlockwise) */}
        <motion.div
          className="relative z-10 rounded-full flex items-center justify-center w-24 h-24"
          animate={{
            scale: isRecording ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 2,
            repeat: isRecording ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{
            border: isRecording
              ? "1.5px solid rgba(255, 255, 255, 0.6)"
              : "1px solid rgba(255, 255, 255, 0.3)",
            background: "rgba(255, 255, 255, 0.15)", // translucent white
            backdropFilter: "blur(10px)", // glass blur effect
            WebkitBackdropFilter: "blur(10px)", // for Safari support
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", // subtle shadow for depth
          }}
        >
          <motion.img
            src={microphone} // transparent PNG recommended
            alt="Microphone"
            className="w-16 h-16 object-contain"
          />

          {/* Wave animation when recording */}
          {isRecording && (
            <div className="absolute -bottom-8 flex space-x-1">
              {[1, 1.2, 1.5, 1.2, 1].map((scale, i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{
                    height: [4, 12, 4],
                    backgroundColor: ["#ef4444", "#f87171", "#ef4444"],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Loading spinner (thinner border) */}
        {(isTranscribing || isSubmitting) && (
          <motion.div
            className="absolute inset-0 rounded-full border-[3px] border-white/30 border-t-white" // Thinner border
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.button>
      {!isRecording ? (
        <div className="text-white text-lg font-semibold select-none">
          Click to Speak!
        </div>
      ) : (
        <div className="text-white text-lg mt-3 font-semibold select-none">
          Click to Stop!
        </div>
      )}
    </div>
  );
};

const DefinitionInput = ({
  currentDefinition,
  setCurrentDefinition,
  wordText,
  isRecording,
  isTranscribing,
  isSubmitting,
  startListening,
  stopListening,
  incorrectStreak,
  error,
  language,
  t,
}) => {
  return (
    <div className="mb-8">
      <motion.label
        htmlFor="definition"
        className="block text-xl font-medium text-white mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {t("whatDoesThisWordMean")}
      </motion.label>

      <motion.div
        initial={{ opacity: 0.8, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <motion.textarea
          id="definition"
          rows="4"
          value={currentDefinition}
          onChange={(e) => setCurrentDefinition(e.target.value)}
          placeholder={t("enterDefinitionHere")}
          className={`w-full text-2xl px-4 py-3 text-white bg-white/10 backdrop-blur-sm border-2 ${
            isRecording ? "border-red-400/50" : "border-white/20"
          } rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 placeholder-white/50`}
          disabled={isSubmitting || isRecording || isTranscribing}
          whileFocus={{
            boxShadow: "0 0 0 2px rgba(96, 165, 250, 0.5)",
            scale: 1.01,
          }}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <RecordingButton
            isRecording={isRecording}
            isSubmitting={isSubmitting}
            isTranscribing={isTranscribing}
            startListening={startListening}
            stopListening={stopListening}
            t={t}
          />

          <AnimatePresence>
            {isTranscribing && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 text-white"
              >
                <motion.div
                  className="w-4 h-4 border-2 border-blue-300/50 border-t-blue-300 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {incorrectStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-3 flex items-center gap-2 text-amber-300 text-sm"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: incorrectStreak >= 3 ? Infinity : 0,
                  repeatType: "mirror",
                }}
              >
                <AlertCircle className="h-4 w-4" />
              </motion.div>
              <span>
                {t("consecutiveIncorrectSkipped")}: {incorrectStreak}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="mt-3 p-3 bg-red-500/20 rounded-lg text-red-200 text-sm flex items-start gap-2"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Enhanced Navigation Button Component
const NavigationButton = ({
  onClick,
  isLast,
  isDisabled,
  isSubmitting,
  isRecording,
  isTranscribing,
  incorrectStreak,
  t,
}) => {
  const isFinish = isLast || incorrectStreak >= 4;

  return (
    <motion.button
      whileHover={{
        scale: isDisabled ? 1 : 1.05,
        y: isDisabled ? 0 : -2,
        boxShadow: isDisabled ? "none" : "0 4px 20px rgba(139, 92, 246, 0.3)",
      }}
      whileTap={{ scale: isDisabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={isDisabled || isSubmitting || isRecording || isTranscribing}
      className={`relative overflow-hidden py-3 px-8 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center gap-2 ${
        isDisabled || isSubmitting || isRecording || isTranscribing
          ? "opacity-70 cursor-not-allowed bg-gray-500/30"
          : "bg-gradient-to-r from-blue-500 to-sky-700 hover:from-blue-600 hover:to-sky-800"
      }`}
    >
      {/* Animated background */}
      {!isDisabled && (
        <motion.span
          className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500 to-sky-700 opacity-0 hover:opacity-100 transition-opacity duration-300"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        />
      )}

      {/* Content wrapper with higher z-index */}
      <div className="relative z-10 flex items-center gap-2">
        {isSubmitting ? (
          <>
            <motion.div
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            />
            <span>{t("submitting")}...</span>
          </>
        ) : (
          <>
            <span>{isFinish ? t("finishAndSubmit") : t("nextWord")}</span>
            <motion.div
              animate={
                isFinish
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }
                  : {
                      x: [0, 4, 0],
                    }
              }
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            >
              {isFinish ? (
                <Check className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </motion.div>
          </>
        )}
      </div>
    </motion.button>
  );
};

// Test Complete Component
const TestComplete = ({ finalScore, totalWords, error, childId }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg text-center border-t-4 border-blue-500"
    >
      <ToastContainer position="top-center" autoClose={3000} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-blue-600" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        {t("testCompleted")}
      </h2>

      {finalScore !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-xl mb-2">{t("yourFinalScoreIs")}</p>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {finalScore} / {totalWords}
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2.5 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(finalScore / totalWords) * 100}%` }}
              transition={{ delay: 0.6, duration: 1 }}
              className="bg-blue-600 h-2.5 rounded-full"
            ></motion.div>
          </div>
        </motion.div>
      )}

      <p className="mb-6 text-blue-800">
        {t("thankYouForCompletingVocabularyScaleTest")}
      </p>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 mb-4 p-2 bg-red-50 rounded"
        >
          {t("submissionError")}: {error}
        </motion.p>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(`/taketests`)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center gap-2 mx-auto"
      >
        {t("BackToTests")} <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
};

// Loading Component
const LoadingState = ({ t }) => (
  <div className="flex flex-col items-center justify-center p-8 h-64">
    <motion.div
      className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-4 text-blue-700 font-medium"
    >
      {t("loadingTest")}...
    </motion.p>
  </div>
);

// Error Component
const ErrorState = ({ message, t }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center p-8"
  >
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
      <AlertCircle className="h-8 w-8 text-red-600" />
    </div>
    <p className="text-red-600 font-medium">{message}</p>
  </motion.div>
);

const VocabularyScaleTest = () => {
  const childId = localStorage.getItem("childId");
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentDefinition, setCurrentDefinition] = useState("");
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [incorrectStreak, setIncorrectStreak] = useState(0);
  const { language, t } = useLanguage();
  const [currentDialog, setCurrentDialog] = useState(0);
  const [showTest, setShowTest] = useState(false);

  const handleNextDialog = () => {
    if (currentDialog < dialog.length - 1) {
      setCurrentDialog((prev) => prev + 1);
    } else {
      setShowTest(true);
    }
  };
  const dialog = [
    "Ahoy, young wordsmith!",
    "Welcome to the Tower of Tides — a place where every word you understand lifts the tower higher into the clouds.",
    "I am the Archivist, keeper of meanings and guardian of the final Codex fragment.",
    "Are you ready to build your tower of understanding? Let's begin!",
  ];
  const DialogIntro = ({ currentDialog, dialog, handleNext, t }) => (
    <>
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

      <div className="flex justify-center">
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className={`flex items-center justify-center gap-3 py-4 px-8 lg:px-12 rounded-xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 ${
            currentDialog < dialog.length - 1
              ? "bg-gradient-to-r from-white to-teal-100 text-teal-900 hover:from-blue-50 hover:to-teal-200 hover:shadow-cyan-200/50"
              : "bg-gradient-to-r from-cyan-500 to-sky-600 text-white hover:from-cyan-600 hover:to-sky-800 hover:shadow-blue-400/50"
          }`}
        >
          {currentDialog < dialog.length - 1 ? (
            <>
              <span className="drop-shadow-sm">{t("next")}</span>
              <ChevronRight className="mt-0.5 drop-shadow-sm" />
            </>
          ) : (
            <>
              <span className="drop-shadow-sm">{t("imReady")}</span>
              <Check className="mt-0.5 drop-shadow-sm" />
            </>
          )}
        </motion.button>
      </div>
    </>
  );
  // Handle transcribed audio
  const handleTranscriptionComplete = useCallback((transcription) => {
    setCurrentDefinition(transcription);
  }, []);

  const {
    isRecording,
    isTranscribing,
    error: recorderError,
    startListening,
    stopListening,
  } = useAudioRecorder(handleTranscriptionComplete);

  // Combine component error with recorder error
  useEffect(() => {
    if (recorderError) {
      setError(recorderError);
    }
  }, [recorderError]);

  // Fetch words on component mount
  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${backendURL}/vocabulary/words`);
        if (response.data && Array.isArray(response.data.words)) {
          setWords(response.data.words);
        } else {
          throw new Error(t("invalidDataFormatReceivedForWords"));
        }
      } catch (err) {
        console.error(t("errorFetchingVocabularyWords"), err);
        setError(t("failedToLoadVocabularyWords"));
        toast.error(t("failedToLoadVocabularyWords"));
      } finally {
        setIsLoading(false);
      }
    };
    fetchWords();
  }, [t]);

  const handleNextWord = useCallback(() => {
    stopListening();
    const currentWord = words[currentWordIndex];
    const newResponse = {
      word: currentWord.word,
      definition: currentDefinition,
    };
    const updatedResponses = [
      ...responses.slice(0, currentWordIndex),
      newResponse,
      ...responses.slice(currentWordIndex + 1),
    ];
    setResponses(updatedResponses);

    // Basic check if definition is empty - consider this "incorrect" for stopping rule
    if (!currentDefinition.trim()) {
      setIncorrectStreak((prev) => prev + 1);
    } else {
      setIncorrectStreak(0); // Reset streak if there's an answer
    }

    // Move to the next word or finish
    if (currentWordIndex < words.length - 1 && incorrectStreak < 4) {
      setCurrentWordIndex((prevIndex) => prevIndex + 1);
      // Load existing definition if user is revisiting a word
      const nextWordResponse = updatedResponses[currentWordIndex + 1];
      setCurrentDefinition(nextWordResponse ? nextWordResponse.definition : "");
    } else {
      // End of test or 5 incorrect rule triggered
      handleSubmit();
    }
  }, [
    currentWordIndex,
    words,
    currentDefinition,
    responses,
    incorrectStreak,
    stopListening,
    t,
  ]);

  const handleSubmit = async () => {
    stopListening();
    if (isSubmitting || testComplete) return;

    setSubmitting(true);
    setError(null);

    // Capture the last response if not already saved
    const finalResponses = [...responses];
    const currentWord = words[currentWordIndex];
    if (currentWord && !responses.find((r) => r.word === currentWord.word)) {
      finalResponses.push({
        word: currentWord.word,
        definition: currentDefinition,
      });
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error(t("authenticationTokenNotFound"));
      }

      const response = await axios.post(
        `${backendURL}/vocabulary/submit`,
        {
          child_id: childId,
          responses: finalResponses,
          language: language,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        if (response.data && typeof response.data.score === "number") {
          setFinalScore(response.data.score);
        } else {
          setFinalScore(0);
          console.warn(t("scoreMissingFromAPIResponse"));
        }
        setTestComplete(true);
        toast.success(t("testSubmittedSuccessfully"));
      } else {
        throw new Error(response.data?.error || t("failedToSubmitTestResults"));
      }
    } catch (err) {
      console.error(t("submissionError"), err);
      const errorMsg =
        err.response?.data?.error ||
        err.message ||
        t("submissionFailedTryAgain");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Render states
  if (isLoading) {
    return <LoadingState t={t} />;
  }

  if (testComplete) {
    return (
      <TestComplete
        finalScore={finalScore}
        totalWords={words.length}
        error={error}
        childId={childId}
      />
    );
  }

  if (words.length === 0 && !isLoading) {
    return <ErrorState message={t("noVocabularyWordsFound")} t={t} />;
  }

  const currentWord = words[currentWordIndex];

  return (
    <>
      {/* Background - conditionally blurred */}
      <div className="fixed inset-0 z-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: showTest ? "none" : "blur(8px)",
          }}
        />
        <motion.div
          className="absolute inset-0 bg-black/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: showTest ? 0.3 : 0.5 }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Main content container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
        <button
          onClick={() => navigate("/taketests")}
          className="text-white/80 hover:text-white flex items-center gap-1 border border-white/20 rounded-full px-4 py-2 transition-colors duration-300 shadow-lg absolute top-4 left-4 z-50 backdrop-blur-md hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToTests")}
        </button>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative max-w-7xl w-full flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12"
        >
          {/* Floating character - only show during intro */}
          {!showTest && (
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
              className="flex-shrink-0"
            >
              <img
                src={characterImage}
                alt="The Archivist"
                className="h-64 sm:h-80 lg:h-96 xl:h-112 object-contain"
              />
            </motion.div>
          )}

          {/* Main content area */}
          <motion.div
            className={`bg-gradient-to-br from-sky-600/70 to-teal-800/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-amber-200/30 shadow-[0_8px_30px_rgba(0,183,235,0.25)] flex-1 relative overflow-hidden w-full ${
              showTest ? "lg:max-w-3xl mx-auto" : "lg:max-w-4xl"
            }`}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {/* 🌊 Horizon Line */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-100/60 via-white/30 to-teal-200/50"></div>

            {/* 🌀 Ocean Mist Orbs */}
            <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-cyan-200/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-20 -left-20 w-44 h-44 bg-sky-300/20 rounded-full blur-3xl"></div>

            {/* ☀️ Sun sparkle/magic aura */}
            <div className="absolute top-1/2 right-8 w-24 h-24 bg-amber-100/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-8 left-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>

            {/* 🌤️ Drift shimmer */}
            <div className="absolute -top-12 right-1/3 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-pulse"></div>

            <ToastContainer position="top-center" autoClose={3000} />

            {!showTest ? (
              <DialogIntro
                currentDialog={currentDialog}
                dialog={dialog}
                handleNext={handleNextDialog}
                t={t}
              />
            ) : isLoading ? (
              <LoadingState t={t} />
            ) : error && !isLoading && !isSubmitting && !isTranscribing ? (
              <ErrorState message={error} t={t} />
            ) : testComplete ? (
              <TestComplete
                finalScore={finalScore}
                totalWords={words.length}
                error={error}
                childId={childId}
              />
            ) : words.length === 0 && !isLoading ? (
              <ErrorState message={t("noVocabularyWordsFound")} t={t} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`test-content-${currentWordIndex}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col"
                >
                  {/* Progress bar and back button */}
                  <div className="w-full mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">
                        {t("progress")}: {currentWordIndex + 1}/{words.length}
                      </span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            ((currentWordIndex + 1) / words.length) * 100
                          }%`,
                        }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>

                  {currentWord && (
                    <>
                      <WordDisplay
                        currentWord={currentWord}
                        currentIndex={currentWordIndex}
                        totalWords={words.length}
                        language={language}
                        t={t}
                      />

                      <DefinitionInput
                        currentDefinition={currentDefinition}
                        setCurrentDefinition={setCurrentDefinition}
                        isRecording={isRecording}
                        t={t}
                        isTranscribing={isTranscribing}
                        isSubmitting={isSubmitting}
                        startListening={startListening}
                        stopListening={stopListening}
                        incorrectStreak={incorrectStreak}
                        error={error}
                        wordText={
                          language === "ta" && currentWord.ta
                            ? currentWord.ta
                            : language === "hi" && currentWord.hi
                            ? currentWord.hi
                            : currentWord.word
                        }
                        language={language}
                      />

                      <div className="mt-auto pt-6 flex justify-end items-center">
                        <NavigationButton
                          onClick={handleNextWord}
                          isLast={currentWordIndex === words.length - 1}
                          isDisabled={isSubmitting}
                          isSubmitting={isSubmitting}
                          isRecording={isRecording}
                          isTranscribing={isTranscribing}
                          incorrectStreak={incorrectStreak}
                          t={t}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};
export default VocabularyScaleTest;
