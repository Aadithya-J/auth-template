import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext";
import questions from "./questions.json"; // Assuming you have a JSON file with your questions
// Option Button Component
const OptionButton = ({ option, isSelected, isDisabled, onClick }) => {
  return (
    <motion.button
      whileHover={!isDisabled && { y: -2, scale: 1.05 }}
      whileTap={!isDisabled && { scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`py-3 px-5 rounded-md text-lg transition-colors duration-200 ${
        isDisabled
          ? "border-2 border-blue-300 text-blue-300"
          : isSelected
          ? "border-2 border-blue-800 text-white bg-blue-600"
          : "border-2 border-blue-600 text-blue-700 hover:bg-blue-100"
      }`}
      onClick={onClick}
      disabled={isDisabled}
    >
      {option}
    </motion.button>
  );
};

// Question Component
const Question = ({
  questionData,
  index,
  isSkipped,
  selectedOption,
  onAnswer,
  onSkipToggle,
}) => {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex flex-col items-end mb-7 bg-white rounded-lg p-5 w-full shadow-md border-l-4 border-blue-500"
    >
      <div className="w-full mb-4 text-left">
        <span
          className={`text-xl font-bold ${
            isSkipped ? "text-blue-300" : "text-blue-700"
          }`}
        >
          {t("question")} {index + 1}{" "}
          {isSkipped && <span className="text-blue-300">: {t("skipped")}</span>}
        </span>
      </div>

      <div className="flex justify-between w-full items-center space-x-4">
        <div className="flex mr-20">
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="py-3 px-5 rounded-md text-lg transition-transform duration-200 border-2 border-blue-600 text-blue-700 bg-blue-50"
          >
            {questionData.word}
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-2">
          {questionData.options.map((option, optionIndex) => (
            <OptionButton
              key={optionIndex}
              option={option}
              isSelected={selectedOption === option}
              isDisabled={isSkipped}
              onClick={() => onAnswer(index, option)}
            />
          ))}
        </div>

        <div className="flex justify-end flex-grow">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`py-3 px-5 rounded-md text-lg transition-colors duration-200 ${
              isSkipped
                ? "border-2 border-blue-500 text-white bg-blue-500 hover:bg-blue-600"
                : "border-2 border-blue-300 text-blue-500 hover:bg-blue-50"
            }`}
            onClick={() => onSkipToggle(index)}
          >
            {isSkipped ? t("attempt") : t("skip")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const AudioQuiz = ({ suppressResultPage = false, onComplete }) => {
  const { language } = useLanguage();
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const { t } = useLanguage();
  const [skippedQuestions, setSkippedQuestions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set questions based on language
    const langKey =
      language === "ta" ? "tamil" : language === "hi" ? "hindi" : "english";
    setQuizQuestions(questions[langKey]);
    setSkippedQuestions(Array(questions[langKey].length).fill(false));
    setSelectedOptions(Array(questions[langKey].length).fill(null));
  }, [language]);

  const handleAnswer = (index, selectedAnswer) => {
    if (skippedQuestions[index]) return;

    setSelectedOptions((prev) => {
      const updated = [...prev];
      updated[index] = selectedAnswer;
      return updated;
    });

    const isCorrect = selectedAnswer === quizQuestions[index].correct;

    setScore((prevScore) => {
      if (answeredQuestions.has(index)) {
        const previousAnswerCorrect =
          selectedOptions[index] === quizQuestions[index].correct;
        return isCorrect && !previousAnswerCorrect
          ? prevScore + 1
          : !isCorrect && previousAnswerCorrect
          ? prevScore - 1
          : prevScore;
      } else {
        return isCorrect ? prevScore + 1 : prevScore;
      }
    });

    setAnsweredQuestions((prev) => new Set(prev).add(index));
  };

  const handleSkip = (index) => {
    setSkippedQuestions((prev) => {
      const newSkipped = [...prev];
      newSkipped[index] = !newSkipped[index];
      return newSkipped;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      toast.error(
        t("noStudentDataFoundPleaseSelectAStudentBeforeTakingTheTest")
      );
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
          toast.success(t("testSubmittedSuccessfully"), {
            position: "top-center",
            onClose: () => navigate("/"),
          });
        }
      } else {
        toast.error(t("failedToSubmitTestPleaseTryAgain"));
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error(t("anErrorOccurredWhileSubmittingTheTestPleaseTryAgain"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total questions answered
  const totalAnswered = answeredQuestions.size;
  const totalQuestions = quizQuestions.length;

  return (
    <div className="p-8 overflow-auto h-screen bg-blue-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-roboto font-extrabold mb-7 flex items-center text-blue-800">
          {t("visualDiscriminationTest")}
        </h2>
        <div className="h-0.5 bg-blue-200 w-full mb-10"></div>

        {quizQuestions.map((question, index) => (
          <Question
            key={index}
            questionData={question}
            index={index}
            isSkipped={skippedQuestions[index]}
            selectedOption={selectedOptions[index]}
            onAnswer={handleAnswer}
            onSkipToggle={handleSkip}
          />
        ))}

        <div className="flex justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-blue-600 text-white font-bold py-3 px-6 rounded-md text-lg transition duration-200 shadow-lg ${
              isSubmitting
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? t("submitting") : t("submitTest")}
          </motion.button>
        </div>
      </motion.div>
      <ToastContainer />
    </div>
  );
};

export default AudioQuiz;
