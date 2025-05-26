import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext";
import questions from "./questions.json";
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
  const [currentDialog, setCurrentDialog] = useState(0);
  const { t } = useLanguage();

  const dialog = [
    "🦉 Hoo-hoo... Greetings, traveler. I am Gearhart, guardian of Clockwork Grove.",
    "🌲 This forest is alive with rhythm. Its trees tick, whirl, and chime in curious patterns.",
    "⏱️ Here, your task is not just to see, but to notice... the slightest shift, the tiniest difference — in shape, in sequence, in time.",
    "🔍 Look closely. Choose the mark that matches the rhythm — perfectly, precisely.",
    "⚙️ Ready yourself. Time in the Grove waits for no one...",
  ];

  const handleNext = () => {
    if (currentDialog < dialog.length - 1) {
      setCurrentDialog(currentDialog + 1);
    } else {
      onComplete();
    }
  };

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
              src={blinkCharacter}
              alt="Blink the Guardian"
              className="h-64 sm:h-80 lg:h-96 xl:h-112 object-contain"
            />
          </motion.div>

          {/* Enhanced greenish-gold glass-morphism dialog box */}
          <motion.div
            className="bg-gradient-to-br from-green-800/70 to-yellow-800/70 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-white/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {/* Decorative green-gold accents */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lime-300 to-amber-300"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-400/20 rounded-full filter blur-xl"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-amber-300/20 rounded-full filter blur-xl"></div>
            <div className="absolute top-1/2 right-8 w-24 h-24 bg-lime-400/10 rounded-full filter blur-lg"></div>
            <div className="absolute bottom-8 left-8 w-32 h-32 bg-green-300/10 rounded-full filter blur-lg"></div>

            {/* Dialog text */}
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

            {/* Progress indicators */}
            <div className="flex justify-center gap-3 mb-8 lg:mb-10">
              {dialog.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                    index <= currentDialog
                      ? "bg-gradient-to-r from-white to-lime-200 shadow-lg"
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

            {/* Action button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className={`flex items-center justify-center gap-3 py-4 px-8 lg:px-12 rounded-xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 ${
                  currentDialog < dialog.length - 1
                    ? "bg-gradient-to-r from-white to-lime-100 text-green-900 hover:from-lime-50 hover:to-amber-100 hover:shadow-lime-200/50"
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 hover:shadow-amber-500/50"
                }`}
              >
                {currentDialog < dialog.length - 1 ? (
                  <>
                    <span className="drop-shadow-sm">Next</span>
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

const QuestionTimer = ({ duration, onComplete }) => {
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
          <span className="text-sm font-medium text-white">Time Remaining</span>
        </div>
        <motion.span
          className="text-lg font-bold text-white bg-clip-text text-transparent"
          key={timeLeft}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          {timeLeft}s
        </motion.span>
      </div>

      <div className="relative h-3 w-full rounded-full bg-gray-200/80 overflow-hidden">
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-yellow-400/20"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Main progress bar */}
        <motion.div
          className={`h-full rounded-full relative ${
            timeLeft < duration * 0.3
              ? "bg-gradient-to-r from-red-500 to-pink-500"
              : "bg-gradient-to-r from-emerald-500 to-yellow-500"
          }`}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 1,
            ease: "linear",
          }}
        >
          {/* Animated pulse effect when time is low */}
          {timeLeft < 3 && (
            <motion.div
              className="absolute inset-0 bg-white/30 rounded-full"
              animate={{
                opacity: [0, 0.5, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            />
          )}
        </motion.div>

        {/* Progress ticks */}
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
      className="relative bg-gradient-to-br from-emerald-900/30 via-gray-900/50 to-amber-900/30 backdrop-blur-md rounded-3xl p-8 shadow-2xl w-full max-w-3xl mx-auto border-2 border-emerald-400/20 overflow-hidden"
    >
      {/* Glowing decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60" />
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-400/10 blur-xl" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-amber-400/10 blur-xl" />

      {/* Progress indicator */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-emerald-200 font-bold text-lg tracking-wider">
          QUESTION <span className="text-amber-200">{index + 1}</span> /{" "}
          {totalQuestions}
        </div>
        <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-emerald-400/30 text-emerald-100 text-sm font-medium">
          {Math.round(((index + 1) / totalQuestions) * 100)}% COMPLETE
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 relative h-2 bg-gray-800/50 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-amber-300"
          initial={{ width: "0%" }}
          animate={{ width: `${((index + 1) / totalQuestions) * 100}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <motion.div
            className="absolute top-0 right-0 h-full w-1 bg-white"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </div>

      {/* Timer */}
      <QuestionTimer
        duration={8}
        onComplete={onTimeout}
        colorStart="#4CAF50" // green
        colorEnd="#FFD700" // gold
      />

      {/* Word display */}
      <div className="flex justify-center my-10 relative">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="absolute -inset-3 bg-yellow-300/10 blur-xl rounded-2xl" />
          <motion.div
            whileHover={{ scale: 1.03, rotate: 0.5 }}
            whileTap={{ scale: 0.98 }}
            className="relative py-8 px-16 rounded-xl text-5xl font-bold border-2 border-yellow-400/30 bg-slate-800/90 text-yellow-100 shadow-2xl shadow-amber-500/20 backdrop-blur-md"
          >
            {questionData.word}
            <div className="absolute top-0 left-0 w-full h-full border border-white/10 rounded-xl pointer-events-none" />
          </motion.div>
        </motion.div>
      </div>

      {/* Options grid with better visibility */}
      <div className="grid grid-cols-2 gap-4">
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

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-40" />
    </motion.div>
  );
};

// Enhanced OptionButton component
const OptionButton = ({ option, isSelected, isDisabled, onClick }) => {
  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.03 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={isDisabled}
      className={`p-5 rounded-xl text-xl font-semibold transition-all duration-200 relative overflow-hidden
        ${
          isSelected
            ? "bg-gradient-to-br from-emerald-300 to-amber-300 text-gray-900 shadow-lg ring-2 ring-amber-200 shadow-amber-300/30"
            : "bg-gray-800/80 backdrop-blur-sm border border-emerald-400/30 text-emerald-100 hover:bg-gray-800/60"
        }
        ${isDisabled && !isSelected ? "opacity-70" : ""}`}
    >
      {option}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.3 }}
        />
      )}
      {/* Corner accents */}
      {!isSelected && (
        <>
          <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-emerald-400/50" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-emerald-400/50" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-emerald-400/50" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-emerald-400/50" />
        </>
      )}
    </motion.button>
  );
};

const AudioQuiz = ({ suppressResultPage = false, onComplete }) => {
  const { language } = useLanguage();
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
    setQuizQuestions(questions[langKey]);
    setSelectedOptions(Array(questions[langKey].length).fill(null));
  }, [language]);

  const handleAnswer = (option) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = option;
    setSelectedOptions(newSelectedOptions);

    if (option === quizQuestions[currentQuestionIndex].correct) {
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
    newSelectedOptions[currentQuestionIndex] = null; // Mark as timeout/unanswered
    setSelectedOptions(newSelectedOptions);

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
      toast.error("Please select a student before taking the test");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/addVisual`,
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
          toast.success("Test submitted successfully!", {
            position: "top-center",
            onClose: () => navigate("/"),
          });
        }
      } else {
        toast.error("Failed to submit test. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("An error occurred while submitting the test.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showCharacter) {
    return <CharacterDialog onComplete={startTest} />;
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
        Back to Tests
      </motion.button>

      {quizStarted && !quizCompleted && (
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
              <QuestionDisplay
                questionData={quizQuestions[currentQuestionIndex]}
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
                Test Completed!
              </h2>
              <p className="text-xl text-blue-300">
                You got {score} out of {quizQuestions.length} correct
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
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="inline-block mr-2"
                    >
                      ↻
                    </motion.span>
                    Submitting...
                  </span>
                ) : (
                  "Submit Results"
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

export default AudioQuiz;
