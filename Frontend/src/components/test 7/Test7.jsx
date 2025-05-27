import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState, useRef, useCallback } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "sonner";
import images from "../../Data/imageData";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import { useNavigate } from "react-router-dom";
import mirrorfishImage from "../../assets/picture-test/characterImage.png";
import tidepoolBackground from "../../assets/picture-test/backgroundImage.png";
import {
  FaChevronRight,
  FaCheck,
  FaArrowLeft,
  FaPlay,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
const PictureRecognition = ({ suppressResultPage = false, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canSee, setCanSee] = useState(null);
  const [answer, setAnswer] = useState("");
  const [description, setDescription] = useState("");
  const [step, setStep] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const currentImage = images[currentIndex];
  const [responses, setResponses] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [testId, setTestId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { language, t } = useLanguage();
  const mediaRecorderRef = useRef(null);
  const isRecordingRef = useRef(false);
  const [showIntro, setShowIntro] = useState(true);
  const [currentDialog, setCurrentDialog] = useState(0);
  const navigate = useNavigate();

  const handleNextDialog = () => {
    if (currentDialog < dialog.length - 1) {
      setCurrentDialog((prev) => prev + 1);
    } else {
      setShowIntro(false);
      speakText(t("start_forward_instructions")); // Start the test instructions
    }
  };
  const dialog = [
    "🌊 Welcome, traveler, to Crystal Shoals! The tidepools here shimmer with reflections from above.",
    "🪞 I am Mira, the mirrorfish, guardian of these hidden images. Each pool holds visions waiting to be recognized.",
    "🐚 Your task is simple yet deep: name what you see reflected in the pools, and reveal the world they come from.",
    "💧 In return, you shall receive the Shell of Imagery and The Reflecting Pearl, treasures of insight and clarity.",
    "✨ Are you ready to peer beyond the ripples and unlock the secrets held in these mirrored waters?",
  ];

  const getCorrectAnswer = (image) => {
    return language === "ta"
      ? image.correctAnswerTamil
      : language === "hi"
      ? image.correctAnswerHindi
      : image.correctAnswer;
  };
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 0.9;
      speech.pitch = 1.2;
      window.speechSynthesis.speak(speech);
    }
  };

  const uploadAudio = useCallback(
    async (audioBlob) => {
      const formData = new FormData();
      const file = new File([audioBlob], "picture_recognition.wav", {
        type: "audio/wav",
      });
      formData.append("file", file);
      formData.append("language", language);
      setIsTranscribing(true);
      setError(null);
      try {
        const response = await fetch(`${backendURL}/transcribe`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.transcription) {
          const transcription =
            result.transcription
              .toLowerCase()
              .trim()
              .replace(/[.,!?;:]*$/, "") || "";

          if (step === 2) {
            setAnswer(transcription);
          } else if (step === 3) {
            setDescription(transcription);
          }

          toast.success("Transcription received!");
        } else {
          const errorMsg =
            result.error || "Transcription failed. Please try again.";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        setError("Error uploading audio. Please check connection.");
        toast.error("Error uploading audio. Please check connection.");
      } finally {
        setIsTranscribing(false);
      }
    },
    [step]
  );

  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping MediaRecorder:", e);
        toast.error("Error stopping recording");
      }
    }
    if (window.stream) {
      try {
        window.stream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.error("Error stopping stream tracks:", e);
        toast.error("Error stopping microphone");
      }
      window.stream = null;
    }
    mediaRecorderRef.current = null;
    if (isRecordingRef.current) {
      setIsRecording(false);
    }
  }, []);

  const startListening = useCallback(() => {
    if (isRecordingRef.current) return;

    setError(null);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
        let localAudioChunks = [];

        if (stream.getAudioTracks().length > 0) {
          stream.getAudioTracks()[0].onended = () => {
            stopListening();
          };
        }

        const mimeType = MediaRecorder.isTypeSupported("audio/wav;codecs=pcm")
          ? "audio/wav;codecs=pcm"
          : "audio/webm";

        const newMediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = newMediaRecorder;

        newMediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            localAudioChunks.push(event.data);
          }
        };

        newMediaRecorder.onstop = async () => {
          if (localAudioChunks.length > 0) {
            const audioBlob = new Blob(localAudioChunks, { type: mimeType });
            localAudioChunks = [];
            await uploadAudio(audioBlob);
          }
        };

        newMediaRecorder.onerror = (event) => {
          toast.error(`Recording error: ${event.error.name}`);
          stopListening();
        };

        try {
          newMediaRecorder.start(100); // Collect data every 100ms
          isRecordingRef.current = true;
          setIsRecording(true);
        } catch (e) {
          toast.error("Failed to start recording.");
          stopListening();
        }
      })
      .catch((error) => {
        setError("Could not access microphone. Please check permissions.");
        toast.error("Could not access microphone. Please check permissions.");
      });
  }, [uploadAudio, stopListening]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopListening();
    } else {
      startListening();
    }
  }, [isRecording, startListening, stopListening]);

  const handleCanSeeSelection = (selection) => {
    setCanSee(selection);

    if (!selection) {
      const updatedResponses = [
        ...responses,
        {
          image: currentImage.imageUrl,
          userAnswer: "",
          correctAnswer: getCorrectAnswer(currentImage),
          description: "",
          language: language,
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
      speakText(
        language === "ta"
          ? "நல்லது! அது என்ன என்று சொல்ல முடியுமா?"
          : "Great! Can you tell me what it is?"
      );
    }
  };

  const handleNext = () => {
    if (step === 2 && answer.trim()) {
      setStep(3);
      isRecordingRef.current = false;
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
        correctAnswer: getCorrectAnswer(currentImage),
        description: description,
        language: language,
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
      isRecordingRef.current = false;
    }
  };

  useEffect(() => {
    setTimeout(
      () =>
        speakText(
          language === "ta"
            ? "இது என்ன என்று சொல்ல முடியுமா?"
            : "Can you see this picture?"
        ),
      2000
    );
    return () => {
      stopListening();
    };
  }, [stopListening]);

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
  if (showIntro) {
    return (
      <>
        {/* Blurred background with water-like overlay */}
        <div className="fixed inset-0 z-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${tidepoolBackground})`,
              backgroundSize: "cover",
              filter: "blur(8px)",
            }}
          />
          <motion.div
            className="absolute inset-0 bg-blue-900/30"
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
            {/* Mirrorfish character on the left */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                y: {
                  duration: 4,
                  repeat: Infinity,
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
                src={mirrorfishImage}
                alt="Mira the Mirrorfish"
                className="h-64 sm:h-80 lg:h-96 object-contain"
              />
            </motion.div>

            {/* Water-like glass dialog box */}
            <motion.div
              className="bg-gradient-to-br from-blue-900/80 via-blue-800/60 to-blue-700/80 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border-2 border-blue-400/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {/* Water ripple decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full filter blur-2xl"></div>

              {/* Dialog text with water reflection effect */}
              <motion.div
                key={currentDialog}
                className="text-xl sm:text-2xl lg:text-3xl text-white mb-8 min-h-48 flex items-center justify-center font-serif leading-relaxed text-center px-4"
                style={{ textShadow: "0 0 8px rgba(173, 216, 230, 0.7)" }}
              >
                {dialog[currentDialog]}
              </motion.div>

              {/* Progress indicators as bubbles */}
              <div className="flex justify-center gap-3 mb-8">
                {dialog.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index <= currentDialog
                        ? "bg-blue-300 shadow-[0_0_10px_2px_rgba(100,200,255,0.7)]"
                        : "bg-blue-300/30"
                    }`}
                    animate={{
                      scale: index === currentDialog ? [1, 1.3, 1] : 1,
                      y: index === currentDialog ? [0, -5, 0] : 0,
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  />
                ))}
              </div>

              {/* Continue button with water ripple effect */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextDialog}
                  className={`flex items-center justify-center gap-3 py-4 px-8 lg:px-12 rounded-2xl font-semibold text-lg lg:text-xl shadow-lg transition-all duration-300
      ${
        currentDialog < dialog.length - 1
          ? "bg-gradient-to-r from-teal-300 via-blue-200 to-teal-400 text-blue-900 hover:from-teal-200 hover:via-blue-100 hover:to-teal-300 hover:shadow-blue-200/50"
          : "bg-gradient-to-r from-teal-400 to-blue-500 text-white hover:from-teal-500 hover:to-blue-600 hover:shadow-blue-300/50"
      }`}
                >
                  {currentDialog < dialog.length - 1 ? (
                    <>
                      <span className="drop-shadow-sm text-blue-950">Next</span>
                      <FaChevronRight className="mt-0.5 drop-shadow-sm text-blue-950" />
                    </>
                  ) : (
                    <>
                      <span className="drop-shadow-sm text-blue-950">
                        {t("imReady")}
                      </span>
                      <FaCheck className="mt-0.5 drop-shadow-sm text-blue-950" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }
  return (
    <div
      className="h-screen w-full fixed inset-0 overflow-y-auto"
      style={{
        backgroundImage: `url(${tidepoolBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Back to Tests Button - Enhanced with wave animation */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate("/taketests")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-white/90 hover:bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md transition-all group"
        whileHover={{
          scale: 1.05,
          boxShadow: "0 5px 15px rgba(59, 130, 246, 0.3)",
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{
            x: [-2, 2, -2],
            transition: {
              duration: 1.5,
              repeat: Infinity,
            },
          }}
        >
          <FaArrowLeft className="text-blue-600 group-hover:text-blue-700 transition-colors" />
        </motion.div>
        {t("BacktoTests")}
      </motion.button>

      {/* Enhanced Progress Bar - Better positioning and styling */}
      <div className="fixed top-10 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-4xl px-4">
        <motion.div
          className="relative p-4 bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-blue-200/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-center text-blue-800 font-bold mb-3 text-lg md:text-xl">
            {t("TestProgress")}
          </h3>
          <div className="relative h-4 bg-blue-900/20 rounded-full overflow-hidden border border-blue-400/30 shadow-inner">
            {/* Water fill animation with waves */}
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-teal-400 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / images.length) * 100}%`,
              }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              {/* Animated waves */}
              <motion.div
                className="absolute top-0 left-0 w-full h-full"
                animate={{
                  backgroundPositionX: ["0%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundImage: `
                  linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.3) 50%, transparent 75%)
                `,
                  backgroundSize: "40px 100%",
                }}
              />
            </motion.div>
          </div>
          <p className="text-center text-blue-600 mt-2 font-medium">
            {currentIndex + 1} of {images.length} completed
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-48 pb-12 flex flex-col items-center">
        <motion.div
          className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-blue-200/50 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Ocean wave decoration at top */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-teal-300 to-blue-400 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 right-0 h-full"
              animate={{
                backgroundPositionX: ["0%", "100%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundImage: `
              linear-gradient(90deg, 
                transparent 20%, 
                rgba(255,255,255,0.5) 30%, 
                transparent 40%,
                transparent 60%,
                rgba(255,255,255,0.5) 70%,
                transparent 80%
              )
            `,
                backgroundSize: "200% 100%",
              }}
            />
          </div>

          {/* Question Section with animated bubbles */}
          <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 text-center relative overflow-hidden">
            <motion.h2
              key={step}
              className="text-2xl md:text-3xl font-bold text-white relative z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1
                ? t("canYouSeeThisPicture")
                : step === 2
                ? t("whatIsIt")
                : t("describeThePicture")}
            </motion.h2>
          </div>

          {/* Image with glowing border and reflection */}
          <div className="p-6">
            <motion.div
              className="relative overflow-hidden rounded-lg shadow-inner"
              whileHover={{ scale: 1.01 }}
              initial={{ boxShadow: "0 0 0 0px rgba(96, 165, 250, 0)" }}
              animate={{
                boxShadow: [
                  "0 0 0 2px rgba(96, 165, 250, 0.3)",
                  "0 0 0 4px rgba(96, 165, 250, 0.2)",
                  "0 0 0 6px rgba(96, 165, 250, 0.1)",
                  "0 0 0 2px rgba(96, 165, 250, 0.3)",
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <img
                src={currentImage.imageUrl}
                alt="Tidepool reflection"
                className="w-full h-auto max-h-96 object-contain mx-auto bg-gradient-to-br from-blue-50 to-blue-100"
              />

              {/* Enhanced reflection effect */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-900/50 to-transparent overflow-hidden">
                <motion.div
                  className="absolute inset-0"
                  animate={{
                    backgroundPositionX: ["0%", "100%"],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundImage: `
                  linear-gradient(90deg, 
                    transparent 20%, 
                    rgba(255,255,255,0.2) 30%, 
                    transparent 40%,
                    transparent 60%,
                    rgba(255,255,255,0.2) 70%,
                    transparent 80%
                  )
                `,
                    backgroundSize: "200% 100%",
                  }}
                />
              </div>
            </motion.div>

            {/* Response Area */}
            <div className="mt-6 space-y-4">
              {step === 1 ? (
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 5px 15px rgba(16, 185, 129, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-400 to-green-600 text-white font-bold rounded-xl shadow-lg relative overflow-hidden"
                    onClick={() => handleCanSeeSelection(true)}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <FaEye className="text-white/90" />
                      {t("yesICan")}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 opacity-0"
                      animate={{
                        opacity: [0, 0.3, 0],
                        left: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 5px 15px rgba(239, 68, 68, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-400 to-red-600 text-white font-bold rounded-xl shadow-lg relative overflow-hidden"
                    onClick={() => handleCanSeeSelection(false)}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <FaEyeSlash className="text-white/90" />
                      {t("noICan")}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 opacity-0"
                      animate={{
                        opacity: [0, 0.3, 0],
                        left: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                      }}
                    />
                  </motion.button>
                </div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={step === 2 ? answer : description}
                        onChange={(e) =>
                          step === 2
                            ? setAnswer(e.target.value)
                            : setDescription(e.target.value)
                        }
                        className="w-full p-4 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-lg bg-white/95"
                        placeholder={
                          step === 2
                            ? t("typeWhatYouSee")
                            : t("describeThePicture")
                        }
                      />
                      {/* Animated cursor */}
                      <motion.div
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        animate={{
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      >
                        <svg
                          className="w-5 h-5 text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                          />
                        </svg>
                      </motion.div>
                    </div>

                    {/* Enhanced Voice Input Button with wave animation */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={toggleRecording}
                      className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold relative overflow-hidden ${
                        isRecording
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                          : "bg-gradient-to-r from-blue-500 to-teal-500 text-white"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <div className="relative z-10 flex items-center gap-2">
                            <div className="flex space-x-1">
                              {[1, 2, 3].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-white rounded-full"
                                  animate={{
                                    height: [2, 10, 2],
                                  }}
                                  transition={{
                                    duration: 1.2,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                  }}
                                />
                              ))}
                            </div>
                            {t("stopRecording")}
                          </div>
                          <motion.div
                            className="absolute inset-0 bg-white/10"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.1, 0, 0.1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                          {/* Pulsing rings */}
                          <motion.div
                            className="absolute inset-0 rounded-xl border-2 border-white/30"
                            animate={{
                              scale: [1, 1.2, 1.4],
                              opacity: [0.5, 0.3, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        </>
                      ) : (
                        <>
                          <div className="relative z-10 flex items-center gap-2">
                            <motion.div
                              animate={{
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                              }}
                            >
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                />
                              </svg>
                            </motion.div>
                            {t("useVoiceInput")}
                          </div>
                          <motion.div
                            className="absolute inset-0 bg-white/10"
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0, 0.1, 0],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                            }}
                          />
                          {/* Subtle wave pattern */}
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/10 to-transparent overflow-hidden"
                            animate={{
                              backgroundPositionX: ["0%", "100%"],
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            style={{
                              backgroundImage: `
                              linear-gradient(90deg, 
                                transparent 20%, 
                                rgba(255,255,255,0.3) 50%, 
                                transparent 80%
                            )`,
                              backgroundSize: "200% 100%",
                            }}
                          />
                        </>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Next/Submit Button with enhanced wave animation */}
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 5px 20px rgba(59, 130, 246, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-white relative overflow-hidden ${
                      currentIndex === images.length - 1
                        ? "bg-gradient-to-r from-blue-600 to-blue-700"
                        : "bg-gradient-to-r from-blue-500 to-teal-500"
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {currentIndex === images.length - 1
                        ? t("submitTest")
                        : t("continue")}
                      {currentIndex === images.length - 1 && (
                        <motion.div
                          animate={{
                            x: [0, 5, 0],
                            y: [0, -5, 0],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                          }}
                        >
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        </motion.div>
                      )}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PictureRecognition;
