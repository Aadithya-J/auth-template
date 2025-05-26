import axios from "axios";
import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext";
import questionsData from "./questions.json"; // Renamed for clarity if it's not just 'questions'
import {
  FaArrowRight,
  FaChevronRight,
  FaCheck,
  FaArrowLeft,
} from "react-icons/fa";
// Images
import backgroundImage from "../../assets/visual-test/rockvision.png";
import blinkCharacter from "../../assets/visual-test/BlinkingStone.png";

const CharacterDialog = ({ onComplete }) => {
  const { t } = useLanguage();
  const [currentDialogIndex, setCurrentDialogIndex] = useState(0);

  const dialogs = useMemo(() => [
    t("visualTestBlinkDialogWelcome"),
    t("visualTestBlinkDialogSneakyShapes"),
    t("visualTestBlinkDialogLookCarefully"),
    t("visualTestBlinkDialogReward"),
    t("visualTestBlinkDialogReadyPrompt"),
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
              src={blinkCharacter}
              alt={t("altBlinkTheGuardian")}
              className="h-64 sm:h-80 lg:h-96 xl:h-112 object-contain"
            />
          </motion.div>
          <motion.div
            className="bg-gradient-to-br from-blue-900/70 to-purple-900/70 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-white/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full filter blur-xl"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full filter blur-xl"></div>
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
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-purple-500/50"
                }`}
              >
                {currentDialogIndex < dialogs.length - 1 ? (
                  <>
                    <span className="drop-shadow-sm">{t("next")}</span>
                    <FaChevronRight className="mt-0.5 drop-shadow-sm" />
                  </>
                ) : (
                  <>
                    <span className="drop-shadow-sm">{t("buttonImReady")}</span>
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

const QuestionTimer = ({ duration, onComplete }) => {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, onComplete]);

  const progress = (timeLeft / duration) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <svg
            className="w-4 h-4 text-blue-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-medium text-white">{t("labelTimeRemaining")}</span>
        </div>
        <motion.span
          className="text-lg font-bold text-white bg-clip-text text-transparent"
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          {timeLeft}{t("seconds")}
        </motion.span>
      </div>
      <div className="relative h-3 w-full rounded-full bg-gray-200/80 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`h-full rounded-full relative ${
            timeLeft < duration * 0.3
              ? "bg-gradient-to-r from-red-500 to-pink-500"
              : "bg-gradient-to-r from-blue-500 to-purple-500"
          }`}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "linear" }}
        >
          {timeLeft < 3 && (
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-full"
              animate={{ opacity: [0, 0.5, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
        <div className="absolute inset-0 flex">
          {[...Array(duration - 1)].map((_, i) => (
            <div
              key={i}
              className="h-full w-px bg-white/30"
              style={{ marginLeft: `${(100 / duration) * (i + 1)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const QuestionDisplay = ({
  questionData,
  index,
  totalQuestions,
  onAnswer,
  onTimeout,
}) => {
  const { t } = useLanguage();
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAnswer = (option) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);
    setTimeout(() => {
      onAnswer(option);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-black/50 backdrop-blur-md rounded-3xl p-8 shadow-2xl w-full max-w-3xl mx-auto border-2 border-white/40"
    >
      <div className="text-center mb-4 text-white font-semibold text-2xl">
        {t("labelQuestionOutOfTotal")
          .replace("{index}", index + 1)
          .replace("{total}", totalQuestions)}
      </div>
      <QuestionTimer duration={8} onComplete={onTimeout} />
      <div className="flex justify-center my-10">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="py-6 px-12 rounded-2xl text-5xl font-bold border-4 border-blue-400 bg-white/90 shadow-lg"
        >
          {questionData.word}
        </motion.div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {questionData.options.map((option, optionIndex) => (
          <OptionButton
            key={optionIndex}
            option={option}
            isSelected={selectedOption === option}
            isDisabled={selectedOption !== null}
            onClick={() => handleAnswer(option)}
          />
        ))}
      </div>
    </motion.div>
  );
};

const ProgressBarComponent = ({ current, total }) => { // Renamed to avoid conflict if imported elsewhere
  const { t } = useLanguage();
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-semibold text-white/90">{t("labelProgress")}</span>
        <span className="text-xl font-bold text-white">
          {current}/{total} ({Math.round(progress)}%)
        </span>
      </div>
      <div className="w-full h-8 bg-gray-300/50 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-600 relative"
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

const OptionButton = ({ option, isSelected, isDisabled, onClick }) => {
  return (
    <motion.button
      whileHover={!isDisabled && { y: -5, scale: 1.03 }}
      whileTap={!isDisabled && { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={`py-5 px-6 rounded-xl text-2xl font-medium transition-all duration-200 ${
        isDisabled
          ? "border-2 border-gray-400 text-gray-400 bg-white/20"
          : isSelected
          ? "border-2 border-blue-500 text-white bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg"
          : "border-2 border-blue-400 text-blue-800 bg-white/90 hover:bg-blue-100 shadow-md"
      }`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {option}
    </motion.button>
  );
};

// Assuming the main component is for a Visual Test, filename AudioQuiz.jsx might be a misnomer
const VisualTest = ({ suppressResultPage = false, onComplete }) => {
  const { language, t } = useLanguage(); // t is available here
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCharacter, setShowCharacter] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const langKey =
      language === "ta" ? "tamil" : language === "hi" ? "hindi" : "english";
    // Ensure questionsData[langKey] exists and is an array
    const questionsForLang = Array.isArray(questionsData[langKey]) ? questionsData[langKey] : [];
    setQuizQuestions(questionsForLang);
    setSelectedOptions(Array(questionsForLang.length).fill(null));
  }, [language]);

  const handleAnswer = (option) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = option;
    setSelectedOptions(newSelectedOptions);

    if (quizQuestions[currentQuestionIndex] && option === quizQuestions[currentQuestionIndex].correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizCompleted(true);
      }
    }, 500);
  };

  const handleTimeout = () => {
    const newSelectedOptions = [...selectedOptions];
    if (currentQuestionIndex < newSelectedOptions.length) { // Boundary check
        newSelectedOptions[currentQuestionIndex] = null; 
        setSelectedOptions(newSelectedOptions);
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const startTest = () => {
    setShowCharacter(false);
    setQuizStarted(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      toast.error(t("visualTestSelectStudentError"));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/addVisual`, // Endpoint for visual test
        {
          child_id: childId,
          options: selectedOptions,
          score: score,
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
          toast.success(t("testSubmittedSuccessfully"), { // Existing key
            position: "top-center",
            onClose: () => navigate("/"), // Or to a results page
          });
        }
      } else {
        toast.error(t("failedToSubmitTestPleaseTryAgain")); // Existing key
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error(t("anErrorOccurredWhileSubmittingTheTestPleaseTryAgain") || t("errorOccurred")); // Existing keys
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCharacter) {
    return <CharacterDialog onComplete={startTest} />;
  }
  
  // Ensure quizQuestions and currentQuestionIndex are valid before rendering QuestionDisplay
  const currentQuestionData = quizQuestions[currentQuestionIndex];
  if (!quizStarted && !quizCompleted) { // Initial loading or pre-start state
    return (
        <div 
            className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 md:p-8 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
        >
            {/* Optional: Loading spinner or message */}
        </div>
    );
  }

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
        {t("backToTests")} {/* Existing key */}
      </motion.button>

      {quizStarted && !quizCompleted && currentQuestionData && ( // Check currentQuestionData
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
              <ProgressBarComponent // Using the renamed ProgressBar
                current={currentQuestionIndex + 1}
                total={quizQuestions.length}
              />
              <QuestionDisplay
                questionData={currentQuestionData}
                index={currentQuestionIndex}
                totalQuestions={quizQuestions.length}
                onAnswer={handleAnswer}
                onTimeout={handleTimeout}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {quizCompleted && (
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
                {t("visualTestCompleted")}
              </h2>
              <p className="text-xl text-blue-300">
                {t("visualTestScoreOutOfTotal")
                  .replace("{score}", score)
                  .replace("{total}", quizQuestions.length)}
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
                    {t("submitting")} {/* Existing key */}
                  </span>
                ) : (
                  t("submitResults") // Existing key
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

export default VisualTest; // Changed export name to reflect component's purpose