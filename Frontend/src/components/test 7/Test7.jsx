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
    if (currentDialog < dialogIntroTexts.length - 1) {
      setCurrentDialog((prev) => prev + 1);
    } else {
      setShowIntro(false);
      speakText(t("start_forward_instructions")); // Start the test instructions
    }
  };
  const dialogIntroTexts = [
    t("pictureTestIntroDialog1"),
    t("pictureTestIntroDialog2"),
    t("pictureTestIntroDialog3"),
    t("pictureTestIntroDialog4"),
    t("pictureTestIntroDialog5"),
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

          toast.success(t("transcriptionReceived"));
        } else {
          const errorMsg = result.error || t("transcriptionFailedTryAgain");
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        const connectionErrorMsg = t("errorUploadingAudioCheckConnection");
        setError(connectionErrorMsg);
        toast.error(connectionErrorMsg);
      } finally {
        setIsTranscribing(false);
      }
    },
    [step, language, t]
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
        toast.error(t("errorStoppingRecording"));
      }
    }
    if (window.stream) {
      try {
        window.stream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.error("Error stopping stream tracks:", e);
        toast.error(t("errorStoppingMicrophone"));
      }
      window.stream = null;
    }
    mediaRecorderRef.current = null;
    if (isRecordingRef.current) {
      setIsRecording(false);
    }
  }, [t]);

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
          toast.error(t("failedToStartRecording"));
          stopListening();
        }
      })
      .catch((error) => {
        const micErrorMsg = t("couldNotAccessMicrophoneCheckPermissions"); // CHANGED
        setError(micErrorMsg);
        toast.error(micErrorMsg);
      });
  }, [uploadAudio, stopListening, t]);

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
      speakText(t("speakGreatWhatIsIt"));
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
            <p>{t("processingYourResults")}</p>
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
                          {t("imageColumn")}
                        </th>
                        <th className="px-4 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                          {t("finalScore")}
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
            className="absolute inset-0 bg-[#3C6E71]/30"
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
              className="bg-gradient-to-br from-[#3C6E71]/80 via-[#6CB4A3]/60 to-[#A3D8D0]/80 backdrop-blur-lg rounded-3xl p-6 sm:p-8 border-2 border-[#FFE57F]/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              {/* Water ripple decorative elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A3D8D0] via-[#6CB4A3] to-[#3C6E71]"></div>
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#A3D8D0]/20 rounded-full filter blur-2xl"></div>

              {/* Dialog text with water reflection effect */}
              <motion.div
                key={currentDialog}
                className="text-xl sm:text-2xl lg:text-3xl text-white mb-8 min-h-48 flex items-center justify-center font-serif leading-relaxed text-center px-4"
                style={{ textShadow: "0 0 8px rgba(163, 216, 208, 0.7)" }}
              >
                {dialogIntroTexts[currentDialog]}
              </motion.div>

              {/* Progress indicators as bubbles */}
              <div className="flex justify-center gap-3 mb-8">
                {dialogIntroTexts.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index <= currentDialog
                        ? "bg-[#FFE57F] shadow-[0_0_10px_2px_rgba(255,229,127,0.7)]"
                        : "bg-[#FFE57F]/30"
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
        currentDialog < dialogIntroTexts.length - 1
          ? "bg-gradient-to-r from-[#FFCAD4] via-[#FDF6E3] to-[#FFE57F] text-[#3E2F2F] hover:from-[#FFCAD4] hover:via-[#FDF6E3] hover:to-[#FFE57F] hover:shadow-[#FFE57F]/50"
          : "bg-gradient-to-r from-[#FFCAD4] to-[#6CB4A3] text-white hover:from-[#FFCAD4] hover:to-[#3C6E71] hover:shadow-[#6CB4A3]/50"
      }`}
                >
                  {currentDialog < dialogIntroTexts.length - 1 ? (
                    <>
                      <span className="drop-shadow-sm text-[#3E2F2F]">
                        {t("pictureTestButtonNextDialog")}
                      </span>
                      <FaChevronRight className="mt-0.5 drop-shadow-sm text-[#3E2F2F]" />
                    </>
                  ) : (
                    <>
                      <span className="drop-shadow-sm text-[#3E2F2F]">
                        {t("imReady")}
                      </span>
                      <FaCheck className="mt-0.5 drop-shadow-sm text-[#3E2F2F]" />
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
      className="h-screen w-full fixed inset-0 overflow-y-auto flex flex-col items-center"
      style={{
        backgroundImage: `url(${tidepoolBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Back to Tests Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        onClick={() => navigate("/taketests")}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-[#FDF6E3]/90 hover:bg-[#FDF6E3] text-[#3E2F2F] font-semibold py-2 px-4 rounded-lg shadow-md transition-all group"
        whileHover={{
          scale: 1.05,
          boxShadow: "0 5px 15px rgba(108, 180, 163, 0.3)",
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
          <FaArrowLeft className="text-[#6CB4A3] group-hover:text-[#3C6E71] transition-colors" />
        </motion.div>
        {t("backToTests")}
      </motion.button>

      {/* 🌊 Crystal Shoals Themed Progress Bar */}
      <div className="w-full px-4 sm:px-6 pt-20 sm:pt-24 max-w-4xl mx-auto">
        <motion.div
          className="relative p-4 bg-[#FDF6E3]/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#6CB4A3]/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-center text-[#fefefe] font-bold mb-3 text-lg md:text-xl">
            {t("pictureTestProgressBarTitle")}
          </h3>

          {/* Oceanic Progress Bar */}
          <div className="relative h-5 bg-gradient-to-r from-[#FDF6E3]/30 via-[#A3D8D0]/30 to-[#FDF6E3]/30 rounded-full overflow-hidden border border-[#6CB4A3]/30 shadow-inner">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#4B7F52] via-[#3C6E71] to-[#6CB4A3] rounded-full shadow-md"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + 1) / images.length) * 100}%`,
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              {/* Animated bubbles for watery feel */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-[#FDF6E3]/40 backdrop-blur-sm shadow"
                  style={{
                    width: `${Math.random() * 6 + 4}px`,
                    height: `${Math.random() * 6 + 4}px`,
                    left: `${Math.random() * 95}%`,
                    bottom: `${Math.random() * 10}px`,
                  }}
                  animate={{
                    y: [0, -12, 0],
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Main Content - Now properly centered and responsive */}
      <div className="flex-1 w-full flex items-center justify-center p-4 sm:p-6">
        <motion.div
          className="w-full max-w-3xl bg-[#FDF6E3]/10 backdrop-blur-lg rounded-3xl overflow-hidden shadow-2xl border border-[#6CB4A3]/50 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            boxShadow: "0 10px 30px -10px rgba(60, 110, 113, 0.3)",
          }}
        >
          {/* Question Section */}
          <div className="bg-gradient-to-r from-[#3C6E71]/90 to-[#4B7F52]/90 p-6 text-center relative overflow-hidden">
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

          {/* Image Container - Improved layout */}
          <div className="p-6 flex flex-col items-center">
            <motion.div
              className="relative rounded-xl overflow-hidden border-2 border-[#6CB4A3]/50 shadow-lg"
              whileHover={{ scale: 1.01 }}
              style={{
                maxWidth: "100%",
                width: "fit-content",
                backgroundColor: "rgba(253, 246, 227, 0.1)",
              }}
            >
              <img
                src={currentImage.imageUrl}
                alt="Tidepool reflection"
                className="max-h-80 sm:max-h-96 object-contain mx-auto"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                }}
              />

              {/* Subtle reflection effect */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#3C6E71]/30 to-transparent" />
            </motion.div>

            {/* Response Area */}
            <div className="mt-8 w-full max-w-md space-y-4">
              {step === 1 ? (
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 5px 15px rgba(75, 127, 82, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#4B7F52] to-[#6CB4A3] text-white font-bold rounded-xl shadow-lg relative overflow-hidden"
                    onClick={() => handleCanSeeSelection(true)}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <FaEye className="text-white/90" />
                      {t("yesICan")}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0 5px 15px rgba(255, 202, 212, 0.4)",
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#FFCAD4] to-[#FFE57F] text-[#3E2F2F] font-bold rounded-xl shadow-lg relative overflow-hidden"
                    onClick={() => handleCanSeeSelection(false)}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <FaEyeSlash className="text-[#3E2F2F]/90" />
                      {t("noICan")}
                    </span>
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
                        className="w-full p-4 border-2 border-[#A3D8D0] rounded-xl focus:border-[#3C6E71] focus:ring-2 focus:ring-[#A3D8D0] outline-none transition-all text-lg bg-[#FDF6E3]/90 backdrop-blur-sm"
                        placeholder={
                          step === 2
                            ? t("typeWhatYouSee")
                            : t("describeThePicture")
                        }
                      />
                    </div>

                    {/* Voice Input Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={toggleRecording}
                      className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold relative overflow-hidden ${
                        isRecording
                          ? "bg-gradient-to-r from-[#FFCAD4] to-[#FFE57F] text-[#3E2F2F]"
                          : "bg-gradient-to-r from-[#3C6E71] to-[#4B7F52] text-white"
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <div className="relative z-10 flex items-center gap-2">
                            <div className="flex space-x-1">
                              {[1, 2, 3].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-[#3E2F2F] rounded-full"
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
                        </>
                      ) : (
                        <>
                          <div className="relative z-10 flex items-center gap-2">
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
                            {t("useVoiceInput")}
                          </div>
                        </>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Next/Submit Button */}
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 5px 20px rgba(60, 110, 113, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNext}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-white relative overflow-hidden ${
                      currentIndex === images.length - 1
                        ? "bg-gradient-to-r from-[#3C6E71] to-[#4B7F52]"
                        : "bg-gradient-to-r from-[#3C6E71] to-[#6CB4A3]"
                    }`}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {currentIndex === images.length - 1
                        ? t("submitTest")
                        : t("continue")}
                    </span>
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
