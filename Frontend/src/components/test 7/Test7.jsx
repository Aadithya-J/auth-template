import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PictureCard from "./PictureCard";
import ProgressTracker from "./ProgressTracker";
import images from "../../Data/imageData";
import axios from "axios";
import { backendURL } from "../../definedURL";
import "react-toastify/dist/ReactToastify.css";

const PictureRecognition = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canSee, setCanSee] = useState(null);
  const [answer, setAnswer] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const currentImage = images[currentIndex];

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
    recognition.continuous = false;
    recognition.interimResults = false;
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
    if (selection) {
      setStep(2);
      speakText("Great! Can you tell me what it is?");
    } else {
      nextImage();
    }
  };

  const handleNext = () => {
    if (step === 2 && answer.trim()) {
      setStep(3);
      speakText("Now, tell me about the picture.");
    } else if (step === 3 && description.trim()) {
      handleSubmit();
    } else {
      setFeedback("Please complete this step before proceeding.");
    }
  };

  const handleSubmit = async () => {
    let scoreIncrement = currentImage.score || 1; // Assigning score based on image
    setScore((prev) => prev + scoreIncrement); // Update total score

    setFeedback(`You earned ${scoreIncrement} points!`);

    setTimeout(() => {
      if (currentIndex < images.length - 1) {
        nextImage();
      } else {
        // Submit final score after last image
        submitFinalScore();
      }
    }, 2000);
  };

  const submitFinalScore = async () => {
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      alert(
        "No student data found. Please select a student before taking the test."
      );
      return;
    }
    try {
      const response = await axios.post(
        `${backendURL}/addPicture`,
        {
          child_id: childId,
          score: score, // Send final accumulated score
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        toast.success(`Test completed! Your total score: ${score}`, {
          position: "top-center",
          onClose: () => navigate("/"),
        });
      } else {
        toast.error("Failed to submit test. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error(
        "An error occurred while submitting the test. Please try again."
      );
    }
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFeedback("");
      setAnswer("");
      setDescription("");
      setCanSee(null);
      setStep(1);
    } else {
      setFeedback(`Game Over! Your score: ${score}/${images.length}`);
    }
  };

  useEffect(() => {
    setTimeout(() => speakText("Can you see this picture?"), 1000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-100 p-6">
      <div className="max-w-2xl scale-75 mb-16 w-full bg-white shadow-lg rounded-2xl p-6">
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
                  className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </div>
          )}
          {feedback && (
            <p className="text-purple-700 mt-4 font-semibold">{feedback}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PictureRecognition;
