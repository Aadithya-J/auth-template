import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { pythonURL, backendURL } from "../../definedURL";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

const GraphemeTest = () => {
  const [letters] = useState(["A", "B", "C", "D", "E"]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { width, height } = useWindowSize();
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);

  const childId = localStorage.getItem("childId");
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!isRecording || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isRecording]);

  useEffect(() => {
    if (currentIndex < letters.length) {
      setTimeLeft(5);
      const timeout = setTimeout(() => {
        handleRecording();
      }, 1000);

      return () => clearTimeout(timeout);
    } else {
      stopRecording();
      setShowSubmit(true);
    }
  }, [currentIndex]);

  const handleRecording = async () => {
    if (!isRecording && currentIndex === 0) {
      setIsRecording(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        streamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          audioChunksRef.current.push(e.data);
        };

        recorder.start();
        setIsRecording(true);
      } catch (error) {
        toast.error("Microphone permission denied");
        setCurrentIndex(letters.length);
        return;
      }
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1); // ✅ This line ensures we move beyond the last index
    }, 5000);

    return () => clearTimeout(timer);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.requestData();
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    setShowSubmit(false);
    toast.loading("Processing your recording...");

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("file", audioBlob, "full_recording.webm");

      const response = await axios.post(`${pythonURL}/transcribe`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const transcription = response.data.transcription.trim();
      const words = transcription
        .split(/\s+/)
        .filter((word) => word.length > 0);
      const transcriptions = letters.map((_, index) => words[index] || "");

      const evalResponse = await axios.post(
        `${backendURL}/evaluate-grapheme-test`,
        { childId, letters, transcriptions },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.dismiss();
      setScore(evalResponse.data.score);
      setShowResults(true);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to process results");
      console.error(error);
    }
  };

  const restartTest = () => {
    setCurrentIndex(0);
    audioChunksRef.current = [];
    setShowResults(false);
    setShowSubmit(false);
    setScore(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {showResults && (
        <Confetti width={width} height={height} recycle={false} />
      )}

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-purple-600">
            Letter Challenge
          </h1>
          <p className="text-gray-600">Say the letter you see!</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-purple-700">
              Progress: {currentIndex}/{letters.length}
            </span>
            <span className="text-sm font-medium text-purple-700">
              {Math.round((currentIndex / letters.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(currentIndex / letters.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {currentIndex < letters.length ? (
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <div className="w-48 h-48 bg-purple-100 rounded-xl flex items-center justify-center shadow-md mb-6">
                <span className="text-8xl font-bold text-purple-800">
                  {letters[currentIndex]}
                </span>
              </div>

              <div className="absolute -top-4 -right-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="3"
                      strokeDasharray={`${(timeLeft / 5) * 100}, 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-800">
                      {timeLeft}s
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <div
                className={`w-4 h-4 rounded-full mr-2 ${
                  isRecording ? "bg-red-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span className="text-gray-600">
                {isRecording ? "Recording..." : "Ready"}
              </span>
            </div>
          </motion.div>
        ) : showResults ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-8"
          >
            <div className="text-5xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-purple-700 mb-2">
              Test Complete!
            </h2>
            <p className="text-gray-600 mb-6">
              You scored {score} out of {letters.length}!
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                style={{ width: `${(score / letters.length) * 100}%` }}
              ></div>
            </div>
            <button
              onClick={restartTest}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-md"
            >
              Try Again
            </button>
          </motion.div>
        ) : showSubmit ? (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-purple-700 mb-4">
              Ready to Submit?
            </h2>
            <p className="text-gray-600 mb-6">
              You've recorded all letters. Click below to process your results.
            </p>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
            >
              Submit Recording
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xl">Processing results...</p>
          </div>
        )}
      </div>

      {!showResults && currentIndex < letters.length && (
        <div className="mt-6 text-center">
          <p className="text-gray-500">
            {["🌟", "🎯", "💡", "🔊", "👏"][currentIndex % 5]} Say it loud and
            clear!
          </p>
        </div>
      )}
    </div>
  );
};

export default GraphemeTest;
