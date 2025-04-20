import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { backendURL } from "../../definedURL";

const AudioQuiz = ({ suppressResultPage = false, onComplete }) => {
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [skippedQuestions, setSkippedQuestions] = useState(Array(10).fill(false));
  const [selectedOptions, setSelectedOptions] = useState(Array(10).fill(null));
  const navigate = useNavigate();

  // Removed audioSrc property from questions
  const questions = [
    { word: "ο", options: ["c", "a", "o", "d", "e", "p"], correct: "o" },
    { word: "f", options: ["k", "h", "f", "j", "t", "g"], correct: "f" },
    { word: "b", options: ["p", "d", "q", "b", "g", "h"], correct: "b" },
    { word: "m", options: ["w", "n", "u", "m", "h", "s"], correct: "m" },
    { word: "no", options: ["oh", "on", "in", "no", "uo", "ou"], correct: "no" },
    { word: "cat", options: ["act", "tac", "cat", "atc", "cta"], correct: "cat" },
    { word: "girl", options: ["gril", "lirg", "irig", "girl", "glir"], correct: "girl" },
    { word: "little", options: ["kitten", "little", "like", "litter", "kettle"], correct: "little" },
    { word: "help", options: ["hlep", "hple", "help", "pleh", "hlpe"], correct: "help" },
    { word: "fast", options: ["staf", "fats", "fast", "taps", "saft"], correct: "fast" }
  ];

  const handleAnswer = (index, selectedAnswer) => {
    if (skippedQuestions[index]) return;

    setSelectedOptions((prev) => {
      const updated = [...prev];
      updated[index] = selectedAnswer;
      return updated;
    });

    const isCorrect = selectedAnswer === questions[index].correct;

    setScore((prevScore) => {
      if (answeredQuestions.has(index)) {
        const previousAnswerCorrect = selectedOptions[index] === questions[index].correct;
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
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      alert("No student data found. Please select a student before taking the test.");
      return;
    }

    try {
      // Send selectedOptions array as the options field in the payload
      const response = await axios.post(
        `${backendURL}/addVisual`,
        {
          child_id: childId,
          options: selectedOptions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        if (suppressResultPage && typeof onComplete === 'function') {
          onComplete(score);
        } else {
          toast.success("Test submitted successfully!", {
            position: "top-center",
            onClose: () => navigate('/'),
          });
        }
      } else {
        toast.error("Failed to submit test. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("An error occurred while submitting the test. Please try again.");
    }
  };

  return (
    <div className="p-8 overflow-auto h-screen bg-gray-200">
      <div className="mb-8">
        <h2 className="text-3xl font-roboto font-extrabold mb-7 flex items-center">
          Visual Discrimination Test
        </h2>
        <div style={{ height: '2px', backgroundColor: '#ccc', width: '100%', marginBottom: '40px' }}></div>

        {questions.map((question, index) => (
          <div key={index} className="flex flex-col items-end mb-7 bg-white rounded-lg p-5 w-full">
            <div className="w-full mb-4 text-left">
              <span className={`text-xl font-bold ${skippedQuestions[index] ? "text-gray-500" : ""}`}>
                Question {index + 1} {skippedQuestions[index] && <span className="text-gray-500">: Skipped</span>}
              </span>
            </div>

            <div className="flex justify-between w-full items-center space-x-4">
              <div className="flex mr-20">
                <button className="py-3 px-5 rounded-md text-lg transition transform duration-200 border-2 border-gray-600 text-gray-600">
                  {question.word}
                </button>
              </div>

              <div className="flex flex-wrap space-x-4">
                {question.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    className={`py-3 px-5 rounded-md text-lg transition transform duration-200 ${
                      skippedQuestions[index]
                        ? "border-2 border-gray-700 text-gray-700"
                        : selectedOptions[index] === option
                        ? "border-2 border-gray-800 text-black bg-[#ff937a]"
                        : "border-2 border-gray-800 text-gray-800 hover:bg-[#ff937a] hover:text-black hover:translate-y-[-2px]"
                    }`}
                    onClick={() => handleAnswer(index, option)}
                    disabled={skippedQuestions[index]}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex justify-end flex-grow">
              <button
              className={`py-3 px-5 rounded-md text-lg transition transform duration-200 ${
                skippedQuestions[index]
                ? "border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                : "border-2 border-gray-700 text-gray-700 hover:bg-gray-100 hover:text-black"
              }`}
                  onClick={() => handleSkip(index)}
                >
                  {skippedQuestions[index] ? "Attempt" : "Skip"}
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white font-bold py-3 px-6 rounded-md text-lg transition transform duration-200 hover:bg-green-700 hover:translate-y-[-2px] shadow-lg"
          >
            Submit Test
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AudioQuiz;
