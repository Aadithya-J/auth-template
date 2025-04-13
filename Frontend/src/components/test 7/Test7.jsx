import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "sonner";
import images from "../../Data/imageData";
import { backendURL } from "../../definedURL";
import PictureCard from "./PictureCard";
import ProgressTracker from "./ProgressTracker";

const PictureRecognition = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canSee, setCanSee] = useState(null);
  const [answer, setAnswer] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const currentImage = images[currentIndex];
  const [responses, setResponses] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [testId, setTestId] = useState(null); // Properly define testId state
  const [isLoading, setIsLoading] = useState(false);

  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 0.9;
      speech.pitch = 1.2;
      window.speechSynthesis.speak(speech);
    }
  };

  const startRecording = (setTextCallback) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTextCallback(transcript);
      toast.success(`I heard: ${transcript}`);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleCanSeeSelection = (selection) => {
    setCanSee(selection);

    if (!selection) {
      // For "No, I can't" response
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

    setIsLoading(true); // Start loading

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
        toast.success("Test submitted successfully!");
        setTestId(response.data.id); // Set the test ID
        await fetchTestResults(response.data.id); // Fetch results with the new ID
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("Failed to submit test. Please try again.");
    } finally {
      setIsLoading(false); // End loading
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
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="h-screen overflow-y-auto bg-gradient-to-b from-white to-blue-100 p-6">
        <div className="max-w-5xl w-full mx-auto bg-white shadow-lg rounded-2xl p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            {testResults ? "Test Results" : "Loading Results..."}
          </h1>
    
          {testResults ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2">Image</th>
                      <th className="border border-gray-300 px-4 py-2">Your Answer</th>
                      <th className="border border-gray-300 px-4 py-2">Correct Answer</th>
                      <th className="border border-gray-300 px-4 py-2">Answer Score</th>
                      <th className="border border-gray-300 px-4 py-2">Description</th>
                      <th className="border border-gray-300 px-4 py-2">Description Score</th>
                      <th className="border border-gray-300 px-4 py-2">Feedback</th>
                      <th className="border border-gray-300 px-4 py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testResults.responses.map((response, index) => (
                      <tr key={index} className="text-center">
                        <td className="border border-gray-300 px-4 py-2">
                          <img
                            src={response.image}
                            alt="question"
                            className="w-16 h-16 object-cover rounded-md mx-auto"
                          />
                        </td>
                        <td
                          className={`border border-gray-300 px-4 py-2 ${
                            response.answerScore === 0 ? "text-red-800" : "text-green-700"
                          }`}
                        >
                          {response.userAnswer || "No Answer"}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {response.correctAnswer}
                        </td>
                        <td
                          className={`border border-gray-300 px-4 py-2 ${
                            response.answerScore === 0 ? "text-red-800" : "text-green-700"
                          }`}
                        >
                          {response.answerScore}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {response.description || "No Description"}
                        </td>
                        <td
                          className={`border border-gray-300 px-4 py-2 ${
                            response.descriptionScore === 0 ? "text-red-800" : "text-green-700"
                          }`}
                        >
                          {response.descriptionScore}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {response.feedback}
                        </td>
                        <td
                          className={`border border-gray-300 px-4 py-2 font-bold ${
                            response.totalForThisImage === 0
                              ? "text-red-500"
                              : response.totalForThisImage === 2
                              ? "text-green-700"
                              : "text-yellow-900"
                          }`}
                        >
                          {response.totalForThisImage}/2
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
    
              <div className="text-center mt-6">
                <h2 className="text-xl font-bold mb-4">
                  Total Score: {testResults.score}/{testResults.responses.length * 2}
                </h2>
                <div className="flex justify-center space-x-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300"
                    onClick={() => window.location.reload()}
                  >
                    Take New Test
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    );
    
  }

  return (
    <div className="h-screen overflow-y-scroll bg-gradient-to-b from-white to-blue-100 p-6">
      <div className="max-w-2xl scale-75 mb-16 w-full bg-white shadow-lg rounded-2xl p-6 mx-auto">
        <ProgressTracker
          currentStep={currentIndex + 1}
          totalSteps={images.length}
        />
        <div className="text-center space-y-6">
          <motion.h1
            key={step}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-gray-800"
          >
            {step === 1
              ? "Can you see this picture?"
              : step === 2
              ? "What is it?"
              : "What is the picture about?"}
          </motion.h1>
  
          <div className="flex justify-center">
            <PictureCard imageName={currentImage.imageUrl} />
          </div>
  
          {step === 1 && (
            <div className="flex justify-center space-x-6">
              <button
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300"
                onClick={() => handleCanSeeSelection(true)}
              >
                Yes, I can!
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300"
                onClick={() => handleCanSeeSelection(false)}
              >
                No, I can't
              </button>
            </div>
          )}
  
          {step > 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={step === 2 ? answer : description}
                  onChange={(e) =>
                    step === 2
                      ? setAnswer(e.target.value)
                      : setDescription(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-xl p-3 text-lg focus:ring-2 focus:ring-blue-400"
                  placeholder={
                    step === 2
                      ? "Type your answer here..."
                      : "Type the description here..."
                  }
                />
                <span className="text-gray-500">or</span>
                <button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-4 w-[30%] rounded-xl shadow-md transition-all duration-300"
                  onClick={() =>
                    startRecording(step === 2 ? setAnswer : setDescription)
                  }
                >
                  {isRecording ? "Listening..." : "Use Voice"}
                </button>
              </div>
  
              <div className="flex justify-center space-x-4">
                <button
                  className={`${
                    currentIndex === images.length - 1
                      ? "bg-blue-700 hover:bg-blue-800"
                      : "bg-purple-500 hover:bg-purple-600"
                  } text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300`}
                  onClick={handleNext}
                >
                  {currentIndex === images.length - 1 ? "Submit Test" : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
};

export default PictureRecognition;
