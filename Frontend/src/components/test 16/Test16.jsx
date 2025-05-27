import axios from "axios";
import React, { useState, useEffect, useRef, useMemo } from "react"; // Added useMemo
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  FaArrowRight,
  FaChevronRight,
  FaCheck,
  FaArrowLeft,
  FaPlay,
} from "react-icons/fa";
import Lottie from "lottie-react";
import AudioPlayer from "react-h5-audio-player";
import speakerbirdAnimation from "../../assets/sound-test/speakerbird.json";
// Images
import backgroundImage from "../../assets/sound-test/whispering-isle.png";
import echoCharacter from "../../assets/sound-test/echo-crab.png";

const CharacterDialog = ({ onComplete }) => {
  const { t } = useLanguage(); 
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);

  const dialogs = useMemo(() => [
    t("soundTestEchoDialogAhoy"),
    t("soundTestEchoDialogIntro"),
    t("soundTestEchoDialogIsleDescription"),
    t("soundTestEchoDialogTwoSounds"),
    t("soundTestEchoDialogYourJob"),
    t("soundTestEchoDialogAreTheySame"),
    t("soundTestEchoDialogOrDifferent"),
    t("soundTestEchoDialogReadyPirate"),
    t("imReady"),
  ], [t]);

  const handleNext = () => {
    if (currentDialogIndex < dialogs.length - 1) {
      setCurrentDialogIndex(currentDialogIndex + 1);
    } else {
      onComplete();
    }
  };

  return (
    <>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative max-w-7xl w-full flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12"
        >
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
              src={echoCharacter}
              alt={t("altSirEchoTheCrab")}
              className="h-64 sm:h-80 lg:h-96 xl:h-112 object-contain"
            />
          </motion.div>
          <motion.div
            className="bg-gradient-to-br from-blue-900/70 to-teal-900/70 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-white/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-teal-500"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full filter blur-xl"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-400/20 rounded-full filter blur-xl"></div>
            <div className="absolute top-1/2 right-8 w-24 h-24 bg-purple-400/10 rounded-full filter blur-lg"></div>
            <div className="absolute bottom-8 left-8 w-32 h-32 bg-cyan-400/10 rounded-full filter blur-lg"></div>
            <motion.div
              key={currentDialogIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white mb-8 lg:mb-12 min-h-48 sm:min-h-56 lg:min-h-64 xl:min-h-72 flex items-center justify-center font-serif font-medium leading-relaxed text-center px-4"
            >
              <span className="drop-shadow-lg">{dialogs[currentDialogIndex]}</span>
            </motion.div>
            <div className="flex justify-center gap-3 mb-8 lg:mb-10">
              {dialogs.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                    index <= currentDialogIndex
                      ? "bg-gradient-to-r from-white to-blue-200 shadow-lg"
                      : "bg-white/30"
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: index === currentDialogIndex ? 1.3 : 1,
                    y: index === currentDialogIndex ? -4 : 0,
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
                  currentDialogIndex < dialogs.length - 1
                    ? "bg-gradient-to-r from-white to-blue-100 text-blue-900 hover:from-blue-50 hover:to-blue-200 hover:shadow-blue-200/50"
                    : "bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-teal-600 hover:shadow-purple-500/50"
                }`}
              >
                {currentDialogIndex < dialogs.length - 1 ? (
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
  );
};

const SoundPlayer = ({ pair, onTimeout }) => {
  const { t } = useLanguage(); 
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const lottieRef = useRef(null);
  const timeoutRef = useRef(null);
  const [audioError, setAudioError] = useState(null);
  const [glow, setGlow] = useState(false);

  const handleClick = () => {
    document.querySelector(".rhap_play-pause-button")?.click();
    setGlow(true);
    setTimeout(() => setGlow(false), 300); // glow lasts 300ms
  };
  // Handle play count and timeout
  useEffect(() => {
    if (playCount >= 2) {
      timeoutRef.current = setTimeout(() => {
        onTimeout();
      }, 5000);
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [playCount, onTimeout]);

  const handleAudioEnd = () => {
    setPlayCount((prev) => prev + 1);
  };

  const handleAudioError = (error) => {
    console.error("Audio error:", error);
    setAudioError("Failed to load audio");
    // Fallback - simulate playback completion
    timeoutRef.current = setTimeout(() => {
      setPlayCount((prev) => prev + 1);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="relative w-64 h-64 mb-6">
        <Lottie
          lottieRef={lottieRef}
          animationData={speakerbirdAnimation}
          loop={true}
          autoplay={true}
          style={{ height: "100%", width: "100%" }}
        />
      </div>

      <div className="w-full max-w-md mb-6">
        <AudioPlayer
          src={`/audio/${pair[0]}_${pair[1]}.m4a`}
          onEnded={handleAudioEnd}
          onError={handleAudioError}
          customProgressBarSection={[
            "MAIN_CONTROLS",
            "PROGRESS_BAR",
            "DURATION",
          ]}
          customControlsSection={[]}
          customAdditionalControls={[]}
          showJumpControls={false}
          layout="horizontal"
          style={{ opacity: 0, position: "absolute", pointerEvents: "none" }}
        />
      </div>
      <motion.button
        whileHover={{
          scale: 1.05,
          boxShadow: "0 0 20px rgba(59, 130, 246, 0.7)",
        }}
        whileTap={{
          scale: 0.95,
          boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)",
        }}
        onClick={handleClick}
        className={`
  relative p-8 rounded-full 
  bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-400 
  text-white shadow-xl 
  transition-all duration-300
  ${glow ? "ring-4 ring-cyan-300/60" : ""}
  overflow-hidden
`}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/0 rounded-full" />

        {/* Button content */}
        <FaPlay className="text-3xl" />

        {/* Pulse animation when glowing */}
        {glow && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-blue-300/30"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </motion.button>
      {audioError && (
        <motion.div
          className="text-center mt-4 text-red-400 font-medium text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {audioError} - Continuing in 2 seconds...
        </motion.div>
      )}
    </div>
  );
};

const SoundQuestion = ({
  pair,
  index,
  totalQuestions,
  onAnswer,
  onTimeout,
}) => {
  const { t } = useLanguage(); // t is now fetched here
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleAnswer = (isSame) => {
    if (hasAnswered) return;
    setSelectedOption(isSame);
    setHasAnswered(true);
    setTimeout(() => {
      onAnswer(isSame);
    }, 500);
  };

  // Reset state when pair changes (new question)
  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
  }, [pair]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-black/50 backdrop-blur-md rounded-3xl p-8 shadow-2xl w-full max-w-3xl mx-auto border-2 border-white/40"
    >
      <div className="text-center mb-4 text-white font-semibold text-2xl">
        {t("question")} {index + 1} {t("of")} {totalQuestions}
      </div>
      {pair && <SoundPlayer pair={pair} onTimeout={onTimeout} />} {/* Ensure pair is defined */}
      <div className="flex justify-center gap-6 mt-10">
        <motion.button
          whileHover={!hasAnswered && { scale: 1.05 }}
          whileTap={!hasAnswered && { scale: 0.95 }}
          onClick={() => handleAnswer(true)}
          disabled={hasAnswered}
          className={`py-4 px-6 rounded-xl text-xl font-bold transition-all ${
            hasAnswered
              ? selectedOption === true
                ? "bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500 text-white shadow-lg"
                : "bg-gray-500 text-gray-300"
              : "bg-gradient-to-r from-green-700 via-lime-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg"
          }`}
        >
          {t("sameSounds")}
        </motion.button>
        <motion.button
          whileHover={!hasAnswered && { scale: 1.05 }}
          whileTap={!hasAnswered && { scale: 0.95 }}
          onClick={() => handleAnswer(false)}
          disabled={hasAnswered}
          className={`py-4 px-6 rounded-xl text-xl font-bold transition-all ${
            hasAnswered
              ? selectedOption === false
                ? "bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-lg"
                : "bg-gray-500 text-gray-300"
              : "bg-gradient-to-r from-rose-500 via-red-500 to-orange-500 hover:from-red-600 hover:to-orange-500 text-white shadow-lg"
          }`}
        >
          {t("differentSounds")}
        </motion.button>
      </div>
    </motion.div>
  );
};

const ProgressBarComponent = ({ current, total }) => { // Renamed ProgressBar to avoid conflicts
  const { t } = useLanguage(); 
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-semibold text-white/90">
          {t("progress")}
        </span>
        <span className="text-xl font-bold text-white">
          {current}/{total} ({Math.round(progress)}%)
        </span>
      </div>
      <div className="w-full h-8 bg-gray-300/50 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-600 relative"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{ opacity: [0, 0.3, 0], x: ["-100%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
    </div>
  );
};

const SoundDiscriminationTest = ({
  suppressResultPage = false,
  onComplete,
}) => {
  const { t, language } = useLanguage();
  
  const wordPairs = useMemo(() => [ 
    ["dog", "hog"], ["gate", "cake"], ["bun", "bun"], ["let", "net"],
    ["ride", "ride"], ["man", "man"], ["pit", "bit"], ["thing", "sing"],
    ["nut", "ton"], ["big", "big"], ["no", "mow"], ["pot", "top"],
    ["pat", "pat"], ["shut", "just"], ["name", "game"], ["raw", "war"],
    ["feet", "seat"], ["fun", "fun"], ["day", "bay"], ["in", "on"],
  ], []);

  const [score, setScore] = useState(0);
  const [showCharacter, setShowCharacter] = useState(true);
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState(
    Array(wordPairs.length).fill(null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const startTest = () => {
    setShowCharacter(false);
    setTestStarted(true);
  };

  const handleAnswer = (isSame) => {
    if (currentQuestionIndex >= wordPairs.length) return; 

    const currentPair = wordPairs[currentQuestionIndex];
    const correctAnswer = currentPair[0] === currentPair[1];
    const isUserCorrect = isSame === correctAnswer;

    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = isSame;
    setSelectedOptions(newSelectedOptions);

    if (isUserCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < wordPairs.length - 1) {
        setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        setTestCompleted(true);
      }
    }, 500);
  };

  const handleTimeout = () => {
    if (currentQuestionIndex >= wordPairs.length) return; // Safety check

    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = null; 
    setSelectedOptions(newSelectedOptions);

    if (currentQuestionIndex < wordPairs.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      toast.error(t("selectStudentFirst")); // Using existing key
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/addTest16`,
        {
          childId: childId, // Ensure backend expects 'childId'
          test_name: t("soundTestApiName"), // Can be translated if needed for display
          score: score,
          // selectedOptions: selectedOptions, // Send if backend needs detailed answers
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        if (suppressResultPage && typeof onComplete === "function") {
          onComplete(score);
        } else {
          toast.success(t("testSubmittedSuccessfully"), { // Using existing key
            position: "top-center",
            onClose: () => navigate("/"), // Or to a results page
          });
        }
      } else {
        toast.error(t("failedToSubmitTestPleaseTryAgain")); // Using existing key
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error(t("anErrorOccurredWhileSubmittingTheTestPleaseTryAgain") || t("errorOccurred")); // Using existing key
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCharacter) {
    return <CharacterDialog onComplete={startTest} />;
  }

  const currentPair = wordPairs[currentQuestionIndex];

  return (
    <div
      className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 md:p-8 bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
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
        {t("backToTests")}
      </motion.button>

      {testStarted && !testCompleted && currentPair && (
        <div className="w-full max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <ProgressBarComponent 
                current={currentQuestionIndex + 1}
                total={wordPairs.length}
              />
              <SoundQuestion
                pair={currentPair}
                index={currentQuestionIndex}
                totalQuestions={wordPairs.length}
                onAnswer={handleAnswer}
                onTimeout={handleTimeout}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {testCompleted && (
        <div className="w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center border-2 border-white/30"
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h2 className="text-3xl font-bold text-white mb-2">
                {t("testCompleted")}
              </h2>
              <p className="text-xl text-blue-300">
                {t("youGot")} {score} {t("outOf")} {wordPairs.length}{" "}
                {t("correct")}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl text-xl shadow-lg hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block mr-2"
                    >
                      ↻
                    </motion.span>
                    {t("submitting")}
                  </span>
                ) : (
                  t("submitResults")
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      )}
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
    </div>
  );
};

export default SoundDiscriminationTest;