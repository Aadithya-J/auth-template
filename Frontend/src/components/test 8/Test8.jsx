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

  const dialog = [
    "👁️ Hello, explorer... I am Blink, the Eye of Vision Rock.",
    "🌀 This place is full of sneaky shapes. Some look almost the same… but only one is a perfect match.",
    "🔍 Use your eyes. Look carefully. Find the one that matches exactly.",
    "🏆 If you choose right, I'll reward you with the Shell of Sight 🐚 and the Lens of Truth 🔮. They will help you see things others can't!",
    "⚔️ Are you ready? Let's see how sharp your eyes really are!",
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative max-w-2xl w-full flex flex-col items-center"
        >
          {/* Floating character with pulse animation */}
          <motion.img
            src={blinkCharacter}
            alt="Blink the Guardian"
            className="h-96 object-contain mb-4 z-10"
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
          />

          {/* Glass-morphism dialog box */}
          <motion.div
            className="bg-gradient-to-br from-blue-900/70 to-purple-900/70 backdrop-blur-lg rounded-3xl p-8 border-2 border-white/20 shadow-2xl w-full max-w-xl relative overflow-hidden"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full filter blur-xl"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full filter blur-xl"></div>

            {/* Animated dialog text */}
            <motion.div
              key={currentDialog}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center text-2xl text-white mb-8 min-h-32 flex items-center justify-center font-serif font-medium leading-relaxed"
            >
              {dialog[currentDialog]}
            </motion.div>

            {/* Progress indicators */}
            <div className="flex justify-center gap-2 mb-6">
              {dialog.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentDialog ? "bg-white" : "bg-white/30"
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: index === currentDialog ? 1.2 : 1,
                    y: index === currentDialog ? -3 : 0,
                  }}
                  transition={{ type: "spring" }}
                />
              ))}
            </div>

            {/* Animated action button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className={`flex items-center justify-center gap-3 py-3 px-8 rounded-xl font-bold text-lg shadow-lg ${
                  currentDialog < dialog.length - 1
                    ? "bg-white text-blue-900 hover:bg-blue-100"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                }`}
              >
                {currentDialog < dialog.length - 1 ? (
                  <>
                    Next <FaChevronRight className="mt-0.5" />
                  </>
                ) : (
                  <>
                    I'm Ready! <FaCheck className="mt-0.5" />
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
          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"
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
              : "bg-gradient-to-r from-blue-500 to-purple-500"
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
      className="bg-black/50 backdrop-blur-md rounded-3xl p-8 shadow-2xl w-full max-w-3xl mx-auto border-2 border-white/40"
    >
      <div className="text-center mb-4 text-white font-semibold text-2xl">
        Question {index + 1} of {totalQuestions}
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

const ProgressBar = ({ current, total }) => {
  const progress = (current / total) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xl font-semibold text-white/90">Progress</span>
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
            animate={{
              opacity: [0, 0.3, 0],
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
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
              <ProgressBar
                current={currentQuestionIndex + 1}
                total={quizQuestions.length}
              />

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
