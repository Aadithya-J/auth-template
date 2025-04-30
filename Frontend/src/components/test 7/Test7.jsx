import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState, useRef, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "sonner";
import images from "../../Data/imageData";
import { backendURL } from "../../definedURL";
import PictureCard from "./PictureCard";
import ProgressTracker from "./ProgressTracker";

const PictureRecognition = ({ suppressResultPage = false, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canSee, setCanSee] = useState(null);
  const [answer, setAnswer] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const currentImage = images[currentIndex];
  const [responses, setResponses] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [testId, setTestId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in your browser. Please use Chrome or Edge."
      );
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (step === 2) {
        setAnswer(transcript);
      } else if (step === 3) {
        setDescription(transcript);
      }
      toast.success("Speech recognized!");
    };

    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      setError(`Speech recognition error: ${event.error}`);
      toast.error("Speech recognition failed. Please try again.");
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [step]);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 0.9;
      speech.pitch = 1.2;
      window.speechSynthesis.speak(speech);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.info("Listening... Speak now");
      } catch (err) {
        setError(
          "Could not start speech recognition. Please check permissions."
        );
        toast.error("Could not start speech recognition.");
      }
    }
  };

  const handleCanSeeSelection = (selection) => {
    setCanSee(selection);

    if (!selection) {
      const updatedResponses = [
        ...responses,
        {
          image: currentImage.imageUrl,
          userAnswer: "",
          correctAnswer: currentImage.correctAnswer,
          description: "",
        },
      ];
      setResponses(updatedResponses);

      if (currentIndex === images.length - 1) {
        submitFinalResults(updatedResponses);
      } else {
        nextImage();
      }
    } else {
      setStep(2);
      speakText("Great! Can you tell me what it is?");
    }
  };

  const handleNext = () => {
    if (step === 2 && answer.trim()) {
      setStep(3);
      speakText("Please describe the picture.");
    } else if (step === 3 && description.trim()) {
      handleSubmit();
    } else {
      toast.warning("Please complete this step before proceeding.");
    }
  };

  const handleSubmit = () => {
    const updatedResponses = [
      ...responses,
      {
        image: currentImage.imageUrl,
        userAnswer: answer,
        correctAnswer: currentImage.correctAnswer,
        description: description,
      },
    ];
    setResponses(updatedResponses);

    if (currentIndex === images.length - 1) {
      submitFinalResults(updatedResponses);
    } else {
      nextImage();
    }
  };

  const submitFinalResults = async (finalResponses) => {
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      toast.error(
        "No student data found. Please select a student before taking the test."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${backendURL}/evaluate-picture-test`,
        {
          child_id: childId,
          answers: finalResponses,
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
          onComplete(
            response.data.score ||
              (response.data &&
                response.data.result &&
                response.data.result.score) ||
              0
          );
        } else {
          toast.success("Test submitted successfully!");
          setTestId(response.data.id);
          await fetchTestResults(response.data.id);
        }
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTestResults = async (id) => {
    if (!id) {
      console.error("No test ID provided for fetching results");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("access_token");

    try {
      const response = await axios.get(
        `${backendURL}/picture-test-results/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setTestResults(response.data);
        setShowResults(true);
      } else {
        throw new Error("No data received");
      }
    } catch (error) {
      console.error("Error fetching test results:", error);
      toast.error("Failed to load test results. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer("");
      setDescription("");
      setCanSee(null);
      setStep(1);
    }
  };

  useEffect(() => {
    setTimeout(() => speakText("Can you see this picture?"), 2000);
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"
          />
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-blue-700 text-lg font-medium"
          >
            Processing your results...
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 md:p-6"
      >
        <div className="max-w-5xl w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-2xl md:text-3xl font-bold text-white text-center"
            >
              Picture Recognition Test Results
            </motion.h1>
          </div>

          <div className="p-4 md:p-6">
            {testResults ? (
              <>
                <div className="overflow-x-auto rounded-lg border border-blue-200">
                  <table className="w-full">
                    <thead className="bg-blue-100">
                      <tr>
                        <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Your Answer
                        </th>
                        <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Correct
                        </th>
                        <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Feedback
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-200">
                      {testResults.responses.map((response, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={
                            index % 2 === 0 ? "bg-blue-50" : "bg-white"
                          }
                        >
                          <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap">
                            <img
                              src={response.image}
                              alt="question"
                              className="h-12 w-12 md:h-16 md:w-16 object-contain rounded-md"
                            />
                          </td>
                          <td
                            className={`px-4 py-2 md:px-6 md:py-4 whitespace-nowrap ${
                              response.answerScore === 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {response.userAnswer || "-"}
                          </td>
                          <td className="px-4 py-2 md:px-6 md:py-4 whitespace-nowrap text-blue-800">
                            {response.correctAnswer}
                          </td>
                          <td
                            className={`px-4 py-2 md:px-6 md:py-4 whitespace-nowrap font-medium ${
                              response.totalForThisImage === 0
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {response.totalForThisImage}/2
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 whitespace-normal max-w-xs">
                            {response.description || "-"}
                          </td>
                          <td className="hidden md:table-cell px-6 py-4 whitespace-normal max-w-xs text-blue-800">
                            {response.feedback || "-"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 md:mt-8 bg-blue-50 rounded-xl p-4 md:p-6 border border-blue-200"
                >
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                      <h2 className="text-xl font-bold text-blue-800">
                        Final Score
                      </h2>
                      <p className="text-3xl font-bold text-blue-600">
                        {testResults.score}/{testResults.responses.length * 2}
                      </p>
                    </div>
                    <div className="flex space-x-2 md:space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-md transition-all duration-300"
                      >
                        Take New Test
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              <div className="flex justify-center items-center h-64">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 md:p-6"
    >
      <div className="max-w-2xl mx-auto">
        <ProgressTracker
          currentStep={currentIndex + 1}
          totalSteps={images.length}
        />

        <motion.div
          layout
          className="bg-white rounded-xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 md:p-6">
            <motion.h1
              key={step}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-xl md:text-2xl font-bold text-white text-center"
            >
              {step === 1
                ? "Can you see this picture?"
                : step === 2
                ? "What is it?"
                : "Describe the picture"}
            </motion.h1>
          </div>

          <div className="p-4 md:p-6">
            <div className="flex justify-center mb-6 md:mb-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-full max-w-md"
              >
                <PictureCard imageName={currentImage.imageUrl} />
              </motion.div>
            </div>

            {step === 1 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-lg shadow-md transition-all duration-300"
                  onClick={() => handleCanSeeSelection(true)}
                >
                  Yes, I can!
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 md:px-8 md:py-4 rounded-lg shadow-md transition-all duration-300"
                  onClick={() => handleCanSeeSelection(false)}
                >
                  No, I can't
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="flex flex-col space-y-3 md:space-y-4">
                  <motion.input
                    type="text"
                    value={step === 2 ? answer : description}
                    onChange={(e) =>
                      step === 2
                        ? setAnswer(e.target.value)
                        : setDescription(e.target.value)
                    }
                    className="w-full border-2 border-blue-200 focus:border-blue-500 rounded-xl p-3 md:p-4 text-base md:text-lg focus:ring-2 focus:ring-blue-300 focus:outline-none transition-all duration-200"
                    placeholder={
                      step === 2
                        ? "Type what you see..."
                        : "Describe the picture..."
                    }
                    whileFocus={{ scale: 1.01 }}
                  />

                  <div className="flex items-center justify-center space-x-4">
                    <div className="h-px bg-blue-200 flex-1"></div>
                    <span className="text-blue-500 font-medium">OR</span>
                    <div className="h-px bg-blue-200 flex-1"></div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center justify-center space-x-2 w-full ${
                      isListening
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    } text-white font-semibold px-4 py-3 md:px-6 md:py-4 rounded-xl shadow-md transition-all duration-300`}
                    onClick={toggleListening}
                  >
                    {isListening ? (
                      <>
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        <span>Listening... Speak now</span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Use Voice Input</span>
                      </>
                    )}
                  </motion.button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`${
                      currentIndex === images.length - 1
                        ? "bg-gradient-to-r from-blue-700 to-blue-800 hover:from-blue-800 hover:to-blue-900"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    } text-white font-semibold px-6 py-2 md:px-8 md:py-3 rounded-lg shadow-md transition-all duration-300`}
                    onClick={handleNext}
                  >
                    {currentIndex === images.length - 1
                      ? "Submit Test"
                      : "Continue"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PictureRecognition;
