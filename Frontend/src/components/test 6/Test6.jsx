import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import wordLists from "./wordLists.json";
import { improveTranscriptionAccuracy } from './accuracyImprover';

import "react-toastify/dist/ReactToastify.css";
import {
  ArrowRightCircle,
  Mic,
  MicOff,
  UploadCloud,
  Award,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Image Imports
import coralBackground from "../../assets/reading-test/coralBackground.png";
import coralineImage from "../../assets/reading-test/coralineImage.png";
import shellImage from "../../assets/reading-test/shellImage.png";
import actualSpyglassImage from "../../assets/reading-test/shellImage.png";
import actualTreasureChestImage from "../../assets/reading-test/starfish.png";
import actualSeaweedImage from "../../assets/reading-test/shellImage.png";
import fishImage1 from "../../assets/reading-test/fishimage2.png";
import fishImage2 from "../../assets/reading-test/fishimage2.png";
import staticStarfishImage from "../../assets/reading-test/starfish.png";

// Audio Recording Hook
const useAudioRecorder = (onAudioRecorded) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });

    return () => {
      if (window.stream) {
        window.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
        let localAudioChunks = [];
        const newMediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = newMediaRecorder;

        newMediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            localAudioChunks.push(event.data);
          }
        };

        newMediaRecorder.onstop = async () => {
          setIsRecording(false);
          if (localAudioChunks.length > 0) {
            const audioBlob = new Blob(localAudioChunks, { type: "audio/wav" });
            onAudioRecorded(audioBlob);
          }
        };

        newMediaRecorder.start();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
        setIsRecording(false);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (window.stream) {
      window.stream.getTracks().forEach((track) => track.stop());
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};

// Transcription Service
const useTranscriptionService = () => {
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionReady, setTranscriptionReady] = useState(false);
  const { language } = useLanguage();
  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();

    if (audioBlob instanceof File) {
      formData.append("file", audioBlob);
    } else {
      const file = new File([audioBlob], "user_audio.wav", {
        type: "audio/wav",
      });
      formData.append("file", file);
    }

    formData.append("language", language);

    try {
      setIsTranscribing(true);

      const response = await fetch(`${backendURL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        //setTranscript(result.transcription);
        //setTranscriptionReady(true);
        //return result.transcription
        const rawTranscript = result.transcription;
        //const targetWordsForLanguage = wordListsFromFile[language] || wordListsFromFile.en;
        const targetWordsForLanguage = wordLists[language] || wordLists.en;
        const safeTargetWords = Array.isArray(targetWordsForLanguage) ? targetWordsForLanguage : [];
        //const correctedTranscript = improveTranscriptionAccuracy(rawTranscript, safeTargetWords);
        //setTranscript(correctedTranscript);
        //setTranscriptionReady(true);
        //return correctedTranscript; 
         if (typeof rawTranscript !== 'string') {
            console.error("Raw transcript is not a string:", rawTranscript);
            setTranscript("");
            setTranscriptionReady(true); 
            return ""; 
        }
        if (!Array.isArray(safeTargetWords) || safeTargetWords.length === 0) { // Added check for empty array
            console.warn("safeTargetWords is not a valid array or is empty. Using raw transcript for language:", language, "Content:", safeTargetWords);
            // Use the raw transcript if target words aren't available/valid for correction
            const cleanedRawTranscript = String(rawTranscript) // Ensure rawTranscript is string
                                            .toLowerCase()
                                            .replace(/[.,!?;:"']/g, "")
                                            .split(/\s+/)
                                            .filter(word => word.length > 0)
                                            .join(" ");
            setTranscript(cleanedRawTranscript);
            setTranscriptionReady(true);
            return cleanedRawTranscript;
        }

        const correctedTranscript = improveTranscriptionAccuracy(rawTranscript, safeTargetWords);
        
        // console.log("Corrected transcript:", correctedTranscript);

        setTranscript(correctedTranscript);
        setTranscriptionReady(true);
        return correctedTranscript;
        

      } else {
        console.error("Error during transcription:", response.statusText);
        toast.error("Transcription failed. Please try again.");
        setTranscript(""); // Clear transcript on error
        return null;
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Error uploading audio. Please try again.");
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    transcript,
    isTranscribing,
    transcriptionReady,
    transcribeAudio,
    setTranscriptionReady,
  };
};

// Test Submission Service
const useTestSubmission = (onTestComplete) => {
  const [testResults, setTestResults] = useState([]);
  const navigate = useNavigate();

  const submitTest = async (
    transcript,
    suppressResultPage,
    language = "en"
  ) => {
    const spokenWords = transcript.trim().toLowerCase();
    const childId = localStorage.getItem("childId") || null;
    const token = localStorage.getItem("access_token");

    try {
      const responseFromApi = await axios.post(
        `${backendURL}/addTest6`,
        { childId, spokenWords, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (responseFromApi.status === 201) {
        const { score, correctGroups, errorWords } = responseFromApi.data;
        const validCorrectGroups = Array.isArray(correctGroups)
          ? correctGroups.map((group) =>
              Array.isArray(group) ? group : [group]
            )
          : [];
        const validErrorWords = Array.isArray(errorWords)
          ? errorWords.map((word) => (Array.isArray(word) ? word : [word]))
          : [];

        const tableData = validCorrectGroups.map((group, index) => ({
          continuousCorrectWords: group.join(" "),
          errorWords: validErrorWords[index]?.join(" ") || "-",
        }));

        setTestResults(tableData);

        if (suppressResultPage && typeof onTestComplete === "function") {
          onTestComplete(score);
        } else {
          toast.success(`Test submitted! Score: ${score}%`, {
            position: "top-center",
            onClose: () =>
              navigate("/results", {
                state: { score, tableData },
              }),
          });
        }
        return { success: true, score };
      } else {
        toast.error("Failed to submit test. Please try again.");
        return { success: false };
      }
    } catch (error) {
      console.error("Full error details:", {
        config: error.config,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("An error occurred while submitting the test.");
      return { success: false };
    }
  };

  return {
    testResults,
    submitTest,
  };
};

// Main Component
function Test6({ suppressResultPage = false, onComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const { language, t } = useLanguage();
  const [showEels, setShowEels] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showSpyglass, setShowSpyglass] = useState(false);
  const [coralineVisible, setCoralineVisible] = useState(false);
  const [coralineAnimationState, setCoralineAnimationState] = useState("idle");
  const [introMessage, setIntroMessage] = useState("");
  const [gameProgress, setGameProgress] = useState(0);
  const [gameState, setGameState] = useState("intro");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [collectedTreasures, setCollectedTreasures] = useState([]);
  const [currentWords, setCurrentWords] = useState([]);
  const [wordShells, setWordShells] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsPerBatch, setWordsPerBatch] = useState(4);
  const wordIntervalRef = useRef(null);
  const [tutorialPhase, setTutorialPhase] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isTutorialComplete, setIsTutorialComplete] = useState(false);

  const tutorialMessages = [
    "👋 Hello there, young explorer!",
    "🦑 I'm Coraline the Kraken, the friendly librarian of Glyph Reef.",
    "🌊 This is a special place where words grow like coral!",
    "📖 Your job is to read each word on the glowing shells out loud.",
    "✨ They'll start easy and get a little harder — but I believe in you!",
    "🏆 Read carefully and you'll earn the Shell of Fluency 🐚",
    "🔭 and my magical Coral Spyglass to help you on your journey.",
    "📚 Let's get reading!",
    "🚀 Are you ready to attempt the mission?",
  ];

  const {
    transcript,
    isTranscribing,
    transcriptionReady,
    transcribeAudio,
    setTranscriptionReady,
  } = useTranscriptionService();

  const { testResults, submitTest } = useTestSubmission(onComplete);
  const { isRecording, startRecording, stopRecording } =
    useAudioRecorder(transcribeAudio);

  useEffect(() => {
  if (!showTutorial && gameState === "active") {
    const words = wordLists[language] || wordLists.en;
    setCurrentWords(words);
    setWordShells(words.map((word, index) => ({
      id: index,
      word,
      collected: false,
      glowing: false,
    })));
    
    // Initialize progress to first batch
    setGameProgress((wordsPerBatch / words.length) * 100);
  }
}, [language, showTutorial, gameState]);

  const startWordBatches = (words) => {
    setCurrentWordIndex(0);
    setWordsPerBatch(4); // 15 seconds for each batch
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarExpanded(false);
        //setWordsPerBatch(3); // Show fewer words on mobile
      } else {
        setIsSidebarExpanded(true);
        //setWordsPerBatch(5);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const introSequence = async () => {
      if (!showTutorial) return;

      setGameState("intro");
      setCoralineVisible(true);
      setCoralineAnimationState("entering");

      // Remove the auto-progression logic
      setTutorialPhase(0);
      setIntroMessage(tutorialMessages[0]);
    };

    introSequence();
  }, [showTutorial]);

  // Add this function to handle the "Next" button click
  const handleNextTutorialStep = () => {
    if (tutorialPhase < tutorialMessages.length - 1) {
      setTutorialPhase((prev) => prev + 1);
      setIntroMessage(tutorialMessages[tutorialPhase + 1]);
      if (tutorialPhase === tutorialMessages.length - 2) {
        setCoralineAnimationState("happy");
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCoralineAnimationState("excited");
      setIntroMessage("Excellent! Let me listen to that recording...");
      await transcribeAudio(file);
      const currentTranscript = await transcribeAudio(file);

      if (currentTranscript) {
        setCoralineAnimationState("happy");
        setIntroMessage("Great job! I heard your words clearly.");
        setGameProgress((prev) => Math.min(prev + 30, 70));
        glowCorrectWords(currentTranscript);
      } else {
        setCoralineAnimationState("confused");
        setIntroMessage("Hmm, I couldn't quite make that out. Try again?");
      }

      setTimeout(() => {
        setCoralineAnimationState("idle");
        setIntroMessage("");
      }, 4000);
    }
  };

  const glowCorrectWords = (text) => {
    if (!text) return;
    const spokenWords = text.toLowerCase().split(" ");
    setWordShells((prev) =>
      prev.map((shell) => ({
        ...shell,
        glowing: spokenWords.includes(shell.word.toLowerCase()),
      }))
    );

    setTimeout(() => {
      setWordShells((prev) =>
        prev.map((shell) => ({
          ...shell,
          glowing: false,
        }))
      );
    }, 3000);
  };

  const handleSubmit = async () => {
    if (!transcriptionReady) {
      toast.info(t("transcriptionNotReady"));
      setShowEels(true);
      setCoralineAnimationState("warning");
      setIntroMessage("Wait! I need to hear your voice first!");
      setTimeout(() => {
        setShowEels(false);
        setCoralineAnimationState("idle");
        setIntroMessage("");
      }, 3000);
      return;
    }

    setCoralineAnimationState("focused");
    setIntroMessage("Let me check your pronunciation...");
    setGameProgress(85);

    const { success, score } = await submitTest(
      transcript,
      suppressResultPage,
      language
    );

    if (success) {
      setGameProgress(100);
      if (score >= 70) {
        setGameState("success");
        setCoralineAnimationState("celebrating");
        setIntroMessage(
          `Amazing! Your score is ${score}%! You've earned a treasure!`
        );
        const newTreasure = {
          id: Date.now(),
          name: `Shell #${collectedTreasures.length + 1}`,
          image: shellImage,
          score,
        };
        setCollectedTreasures([...collectedTreasures, newTreasure]);
        setTimeout(() => {
          setShowReward(true);
          setTimeout(() => {
            setShowReward(false);
            setShowSpyglass(true);
            setTimeout(() => setShowSpyglass(false), 4000);
          }, 3000);
        }, 1500);
      } else {
        setGameState("failure");
        setCoralineAnimationState("encouraging");
        setIntroMessage(`You scored ${score}%. Keep practicing and try again!`);
      }
    } else {
      setCoralineAnimationState("confused");
      setIntroMessage(
        "Something went wrong with the reef magic. Let's try once more!"
      );
    }
  };

  const coralineVariants = {
    hidden: { x: -300, opacity: 0 },
    entering: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    idle: {
      y: [0, -10, 0],
      transition: {
        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      },
    },
    talking: {
      y: [0, -5, 0],
      x: [0, 3, -3, 0],
      rotate: [0, 1, -1, 0],
      transition: {
        y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 0.5, repeat: Infinity, ease: "easeInOut" },
        rotate: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
      },
    },
    excited: {
      y: [0, -15, 0],
      scale: [1, 1.05, 1],
      transition: {
        y: { duration: 0.8, repeat: 3, ease: "easeInOut" },
        scale: { duration: 0.8, repeat: 3, ease: "easeInOut" },
      },
    },
    happy: {
      rotate: [0, 3, -3, 0],
      scale: [1, 1.1, 1],
      transition: {
        rotate: { duration: 1, repeat: 2 },
        scale: { duration: 1, repeat: 2 },
      },
    },
    confused: {
      rotate: [0, -5, 5, 0],
      x: [0, -5, 5, 0],
      transition: {
        rotate: { duration: 1.5, repeat: 2 },
        x: { duration: 1.5, repeat: 2 },
      },
    },
    warning: {
      scale: [1, 1.2, 1],
      y: [0, -20, 0],
      transition: {
        scale: { duration: 0.5, repeat: 2 },
        y: { duration: 0.5, repeat: 2 },
      },
    },
    focused: {
      scale: [1, 0.95, 1],
      y: [0, 5, 0],
      transition: {
        scale: { duration: 2, repeat: Infinity },
        y: { duration: 2, repeat: Infinity },
      },
    },
    celebrating: {
      y: [0, -20, 0],
      rotate: [0, 10, -10, 0],
      scale: [1, 1.1, 1],
      transition: {
        y: { duration: 1, repeat: 3 },
        rotate: { duration: 0.5, repeat: 6 },
        scale: { duration: 1, repeat: 3 },
      },
    },
    encouraging: {
      y: [0, -5, 0],
      x: [0, 3, -3, 0],
      rotate: [0, 2, -2, 0],
      transition: {
        y: { duration: 1.5, repeat: 2 },
        x: { duration: 0.8, repeat: 4 },
        rotate: { duration: 1, repeat: 3 },
      },
    },
  };

  const shellVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1 },
    glowing: {
      scale: [1, 1.15, 1],
      filter:
        "drop-shadow(0 0 12px rgba(72, 187, 120, 0.8)) drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))",
      transition: { duration: 1, repeat: Infinity, ease: "easeInOut" },
    },
    collected: {
      y: -100,
      opacity: 0,
      scale: 0.5,
      transition: { duration: 0.5 },
    },
  };

  const containerWidth = isSidebarExpanded
    ? "calc(100% - 16rem)"
    : "calc(100% - 7rem)";

  const fishAnimations = [
    {
      src: fishImage1,
      alt: "Swimming fish",
      width: "w-20",
      initial: { x: "-100%", y: "60vh", opacity: 0.8 },
      animate: {
        x: "110vw",
        y: ["60vh", "58vh", "62vh", "60vh"],
        opacity: [0.8, 1, 0.8],
      },
      transition: { duration: 20, repeat: Infinity, ease: "linear", delay: 2 },
    },
    {
      src: fishImage2,
      alt: "School of fish",
      width: "w-32",
      initial: { x: "110vw", y: "70vh", scaleX: -1, opacity: 0.7 },
      animate: {
        x: "-100%",
        y: ["70vh", "73vh", "68vh", "70vh"],
        opacity: [0.7, 0.9, 0.7],
      },
      transition: { duration: 28, repeat: Infinity, ease: "linear", delay: 8 },
    },
    {
      src: fishImage1,
      alt: "Small swimming fish",
      width: "w-16",
      initial: { x: "-100%", y: "75vh", opacity: 0.9 },
      animate: {
        x: "110vw",
        y: ["75vh", "72vh", "75vh"],
        opacity: [0.9, 1, 0.9],
      },
      transition: { duration: 15, repeat: Infinity, ease: "linear", delay: 5 },
    },
  ];

  const visibleWords = wordShells.slice(
    currentWordIndex,
    currentWordIndex + wordsPerBatch
  );

  return (
    <div
      className="min-h-screen overflow-hidden relative"
      style={{ width: containerWidth, marginLeft: "1rem" }}
    >
      {showTutorial && (
        <>
          {/* Blurred background with animated overlay */}
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
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
                  src={coralineImage}
                  alt="Coraline"
                  className="h-64 sm:h-80 lg:h-96 xl:h-[500px] object-contain"
                />
              </motion.div>

              {/* Enhanced glass-morphism dialog box */}
              <motion.div
                className="bg-gradient-to-br from-blue-900/70 to-purple-900/70 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-white/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {/* Enhanced decorative elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full filter blur-xl"></div>
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full filter blur-xl"></div>
                <div className="absolute top-1/2 right-8 w-24 h-24 bg-purple-400/10 rounded-full filter blur-lg"></div>
                <div className="absolute bottom-8 left-8 w-32 h-32 bg-cyan-400/10 rounded-full filter blur-lg"></div>

                {/* Enhanced animated dialog text */}
                <motion.div
                  key={tutorialPhase}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-2xl sm:text-3xl lg:text-4xl text-white mb-8 lg:mb-12 min-h-48 sm:min-h-56 lg:min-h-64 flex items-center font-serif font-medium leading-relaxed px-4"
                >
                  <span className="drop-shadow-lg">
                    {tutorialMessages[tutorialPhase]}
                  </span>
                </motion.div>

                {/* Enhanced progress indicators */}
                <div className="flex justify-center gap-3 mb-8 lg:mb-10">
                  {tutorialMessages.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                        index <= tutorialPhase
                          ? "bg-gradient-to-r from-white to-blue-200 shadow-lg"
                          : "bg-white/30"
                      }`}
                      initial={{ scale: 0.8 }}
                      animate={{
                        scale: index === tutorialPhase ? 1.3 : 1,
                        y: index === tutorialPhase ? -4 : 0,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  ))}
                </div>

                {/* Enhanced animated action button */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={
                      tutorialPhase === tutorialMessages.length - 1
                        ? () => {
                            setShowTutorial(false);
                            setIsTutorialComplete(true);
                            setGameState("active");
                          }
                        : handleNextTutorialStep
                    }
                    className={`flex items-center justify-center gap-3 py-4 px-8 lg:px-12 rounded-xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 ${
                      tutorialPhase < tutorialMessages.length - 1
                        ? "bg-gradient-to-r from-white to-blue-100 text-blue-900 hover:from-blue-50 hover:to-blue-200 hover:shadow-blue-200/50"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 hover:shadow-purple-500/50"
                    }`}
                  >
                    {tutorialPhase < tutorialMessages.length - 1 ? (
                      <>
                        <span className="drop-shadow-sm">Next</span>
                        <span className="drop-shadow-sm">➔</span>
                      </>
                    ) : (
                      <>
                        <span className="drop-shadow-sm">
                          "🧭 Aye, I'm ready!"
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
      {/* Back button at left most end */}
      <Link
        to="/taketests"
        className="absolute top-4 left-0 z-50 flex items-center gap-2 bg-white/80 hover:bg-white text-teal-800 font-medium py-2 px-4 rounded-full shadow-md transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
        Back to Tests
      </Link>

      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${coralBackground})` }}
      />

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Seaweed */}
        <motion.img
          src={actualSeaweedImage}
          alt="Seaweed swaying"
          className="absolute bottom-0 left-10 h-40 opacity-80"
          animate={{
            rotate: [0, -3, 3, -2, 2, 0],
            y: [0, -4, 4, 0],
            skewX: [0, 1, -1, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.img
          src={actualSeaweedImage}
          alt="Seaweed swaying"
          className="absolute bottom-0 right-5 h-32 opacity-70"
          animate={{
            rotate: [0, 2, -2, 3, -3, 0],
            y: [0, -3, 3, 0],
            skewX: [0, -1.5, 1.5, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        />

        {/* Bubbles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full bg-blue-300/20 pointer-events-none"
            style={{
              width: `${Math.random() * 25 + 8}px`,
              height: `${Math.random() * 25 + 8}px`,
              left: `${Math.random() * 100}%`,
              bottom: "-60px",
            }}
            animate={{
              y: -window.innerHeight - 120,
              x: [0, Math.random() * 40 - 20, Math.random() * 40 - 20, 0],
              opacity: [0, 0.6, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              delay: Math.random() * 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Moving Fish */}
        {fishAnimations.map((fish, index) => (
          <motion.img
            key={`fish-${index}`}
            src={fish.src}
            alt={fish.alt}
            className={`absolute ${fish.width} object-contain pointer-events-none`}
            initial={fish.initial}
            animate={fish.animate}
            transition={fish.transition}
          />
        ))}

        {/* Decorative Starfish */}
        <motion.img
          src={staticStarfishImage}
          alt="Starfish"
          className="absolute bottom-5 left-[15%] w-16 h-16 opacity-80"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.8, y: [0, -3, 0] }}
          transition={{
            delay: 1,
            duration: 1.5,
            y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
          }}
        />
        <motion.img
          src={staticStarfishImage}
          alt="Starfish"
          className="absolute bottom-8 right-[20%] w-12 h-12 opacity-70 rotate-[15deg]"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7, y: [0, 2, -2, 0] }}
          transition={{
            delay: 1.8,
            duration: 1.5,
            y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
          }}
        />
      </div>

      {/* Main content container */}
      {!showTutorial && (
        <>
          <div className="relative z-10 container mx-auto px-4 py-8">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-teal-700 font-bold">Reef Progress</span>
                <span className="text-teal-600 font-bold">{gameProgress}%</span>
              </div>
              <ProgressBar progress={gameProgress} />
            </div>

            {/* Word Shell Grid - Now showing only the current batch */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 place-items-center w-full max-w-8xl">
              {isTutorialComplete &&
                visibleWords.map((shell) => (
                  <motion.div
                    key={shell.id}
                    className="relative flex items-center justify-center 
           w-[52rem] h-[52rem] sm:w-[32rem] sm:h-[32rem] 
           md:w-[36rem] md:h-[36rem] lg:w-[44rem] lg:h-[44rem] 
           cursor-pointer"
                    variants={shellVariants}
                    initial="hidden"
                    animate={shell.glowing ? "glowing" : "visible"}
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <img
                      src={shellImage}
                      className="w-full h-full object-contain"
                      alt={`Shell with word ${shell.word}`}
                    />
                    <span
                      className="absolute text-center 
                  text-2xl md:text-4xl font-bold text-teal-900"
                    >
                      {shell.word}
                    </span>
                  </motion.div>
                ))}
            </div>

            {/* Transcription area with RecordingControls */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 w-full max-w-8xl">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between w-full">
                <RecordingControls
                  isRecording={isRecording}
                  onStartRecording={startRecording}
                  onStopRecording={stopRecording}
                  showEels={showEels}
                  largeSize={true} // Add this prop
                />
                {currentWordIndex + wordsPerBatch < currentWords.length && (
                  <motion.button
                    onClick={() => {
                      const newIndex = currentWordIndex + wordsPerBatch;
                      setCurrentWordIndex(newIndex);
                      // Update progress based on how many words we've completed
                      const progress = Math.min(
                        100,
                        (newIndex / currentWords.length) * 100
                      );
                      setGameProgress(progress);
                    }}
                    className="mt-2 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-cyan-500
 text-white rounded-full shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next Words <ChevronRight className="h-5 w-5" />
                  </motion.button>
                )}
                <div className="flex flex-col md:flex-row gap-6 w-full sm:w-auto">
                  <FileUploadButton onFileUpload={handleFileUpload} t={t} />
                  <SubmitButton
                    isTranscribing={isTranscribing}
                    transcriptionReady={transcriptionReady}
                    onSubmit={handleSubmit}
                    t={t}
                    largeSize={true} // Add this prop
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Treasure Chest */}
      <motion.div
        className="fixed bottom-8 right-8 z-20"
        animate={{
          y: [0, -10, 0],
          rotate: [0, 3, -3, 0],
        }}
        transition={{
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 7, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <img
          src={actualTreasureChestImage}
          className="w-24 h-24 object-contain"
          alt="Treasure Chest"
        />
        <AnimatePresence>
          {collectedTreasures.length > 0 && (
            <motion.div
              key={collectedTreasures.length}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-3 -right-3 bg-amber-400 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold text-white shadow-md"
            >
              {collectedTreasures.length}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Reward animations */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-gradient-to-br from-yellow-300 to-amber-400 backdrop-blur-md rounded-2xl p-8 shadow-2xl border-2 border-yellow-200 max-w-md text-center">
              <motion.img
                src={shellImage}
                className="w-36 h-36 mx-auto mb-4"
                alt="Earned Shell"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 15, -15, 0, 360],
                }}
                transition={{
                  y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 5, repeat: Infinity, ease: "linear" },
                }}
              />
              <h3
                className="text-3xl font-bold text-yellow-900 mb-2"
                style={{ textShadow: "1px 1px 2px white" }}
              >
                Shell of Fluency Earned!
              </h3>
              <p className="text-yellow-800 text-lg mb-6">
                Your pronunciation is shining!
              </p>
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-bold shadow-lg text-lg"
                whileHover={{
                  scale: 1.05,
                  y: -2,
                  boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowReward(false)}
              >
                Collect Treasure!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spyglass animation */}
      <AnimatePresence>
        {showSpyglass && (
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{
              scale: 0,
              opacity: 0,
              rotate: 90,
              transition: { duration: 0.4 },
            }}
            transition={{ type: "spring", damping: 10, stiffness: 100 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.img
              src={actualSpyglassImage}
              alt="Spyglass looking"
              className="w-72 h-72 md:w-96 md:h-96"
              animate={{
                y: [0, -15, 10, 0],
                rotate: [0, 2, -2, 3, -3, 0],
              }}
              transition={{
                y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </div>
  );
}
// --- Sub-Components (ProgressBar, SpeechBubble, RecordingControls, FileUploadButton, SubmitButton) ---
// ProgressBar Component
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-teal-100/60 rounded-full h-6 overflow-hidden border-2 border-teal-200/70 shadow-inner relative">
    <motion.div
      className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-end text-xs font-bold text-white pr-2 relative"
      initial={{ width: "0%" }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
    >
      {progress > 5 && ( // Show percentage earlier
        <motion.span
          className="absolute left-0 top-0 bottom-0 bg-white/20"
          style={{ width: "100%" }}
          animate={{ x: ["-100%", "100%"] }} // Shimmer effect
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            delay: 0.5,
          }}
        />
      )}
      {progress > 10 && <span className="relative z-10">{`${progress}%`}</span>}
    </motion.div>
  </div>
);

// Speech Bubble Component
const SpeechBubble = ({ text, visible, isLastMessage = false, onConfirm }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 10 }}
        transition={{ type: "spring", damping: 15, stiffness: 250 }}
        className="absolute -top-44 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-xl min-w-[350px] max-w-xl border-2 border-teal-200 z-50"
        style={{
          transformOrigin: "bottom center",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(236,253,245,0.98) 100%)",
        }}
      >
        <p className="text-xl md:text-2xl font-medium text-teal-900 mb-4">
          {text}
        </p>
        {isLastMessage && (
          <div className="flex justify-center gap-6 mt-6">
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-semibold shadow-lg"
              onClick={onConfirm}
            >
              Yes, I'm ready!
            </motion.button>
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

// Recording Controls Component
const RecordingControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  showEels, // This seems tied to Coraline's image in original, adjust if needed
}) => (
  <div className="flex items-center gap-4 relative">
    <AnimatePresence>
      {showEels && ( // This uses coralineImage. Replace with an actual eel image if desired.
        <motion.div
          initial={{ opacity: 0, x: -50, rotate: -30 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: -50, rotate: 30 }}
          className="absolute -top-16 -left-12 z-10"
        >
          <img
            src={coralineImage} // Placeholder, ideally a unique "eel" or "warning" graphic
            className="w-24 h-24 object-contain transform scale-x-[-1] " // Flipped Coraline as "eel"
            alt="Warning sign"
          />
        </motion.div>
      )}
    </AnimatePresence>

    <div className="relative">
      <motion.button
        onClick={onStartRecording}
        disabled={isRecording}
        className={`rounded-full h-16 w-16 flex items-center justify-center transition-all duration-200 ease-in-out
          ${
            isRecording
              ? "opacity-60 cursor-not-allowed bg-gray-200 border-2 border-gray-300"
              : "bg-white border-2 border-teal-500 shadow-lg hover:bg-teal-50"
          }`}
        aria-label="Start recording"
        whileHover={
          !isRecording
            ? {
                scale: 1.1,
                boxShadow: "0 0 20px rgba(20, 184, 166, 0.6)",
              }
            : {}
        }
        whileTap={!isRecording ? { scale: 0.9 } : {}}
      >
        <Mic
          className={`h-7 w-7 ${
            isRecording ? "text-gray-500" : "text-teal-600"
          }`}
        />
      </motion.button>

      {isRecording && (
        <motion.span
          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
    </div>

    <motion.button
      onClick={onStopRecording}
      disabled={!isRecording}
      className={`rounded-full h-16 w-16 flex items-center justify-center transition-all duration-200 ease-in-out
        ${
          !isRecording
            ? "opacity-60 cursor-not-allowed bg-gray-200 border-2 border-gray-300"
            : "bg-red-500 border-2 border-red-600 shadow-lg hover:bg-red-400"
        }`}
      aria-label="Stop recording"
      whileHover={
        isRecording
          ? {
              scale: 1.1,
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.6)",
            }
          : {}
      }
      whileTap={isRecording ? { scale: 0.9 } : {}}
    >
      <MicOff
        className={`h-7 w-7 ${!isRecording ? "text-gray-500" : "text-white"}`}
      />
    </motion.button>

    {isRecording && (
      <motion.div
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-red-600 rounded-full border border-red-200 shadow-md"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: [0.8, 1, 0.8], y: 0 }}
        transition={{
          opacity: { duration: 1.5, repeat: Infinity },
          y: { duration: 0.2 },
        }}
      >
        <Mic className="h-5 w-5" />
        <span className="text-sm font-semibold">Recording</span>
        <span className="inline-flex gap-0.5">
          {"...".split("").map((char, i) => (
            <motion.span
              key={i}
              animate={{ y: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      </motion.div>
    )}
  </div>
);

// File Upload Button Component
const FileUploadButton = ({ onFileUpload, t }) => (
  <div className="relative w-full sm:w-auto">
    <input
      type="file"
      accept="audio/*,.m4a,.mp3,.wav,.ogg" // More specific audio types
      onChange={onFileUpload}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      aria-label="Upload audio file"
      id="audioUpload"
    />
    <motion.label // Changed button to label for better accessibility with file input
      htmlFor="audioUpload"
      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-lg shadow-md text-sm font-medium cursor-pointer"
      whileHover={{ y: -2, boxShadow: "0 6px 15px rgba(56, 189, 248, 0.3)" }}
      whileTap={{ y: 0, scale: 0.98 }}
    >
      <UploadCloud className="h-5 w-5" />
      <span>{t("uploadAudio") || "Upload Audio"}</span>
    </motion.label>
  </div>
);

// Submit Button Component
const SubmitButton = ({ isTranscribing, transcriptionReady, onSubmit, t }) => {
  const isDisabled = isTranscribing || !transcriptionReady;
  return (
    <motion.button
      onClick={onSubmit}
      disabled={isDisabled}
      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium shadow-md transition-colors duration-200 ease-in-out
        ${
          isDisabled
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
        }`}
      whileHover={
        !isDisabled
          ? {
              y: -2,
              boxShadow: "0 6px 15px rgba(16, 185, 129, 0.3)",
              filter: "brightness(1.1)",
            }
          : {}
      }
      whileTap={!isDisabled ? { y: 0, scale: 0.98 } : {}}
    >
      {isTranscribing ? (
        <>
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gray-500 rounded-full"
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <span className="ml-2">{t("transcribing") || "Processing..."}</span>
        </>
      ) : (
        <>
          <span>{t("submit") || "Submit Answer"}</span>
          <ArrowRightCircle className="h-5 w-5" />
        </>
      )}
    </motion.button>
  );
};

export default Test6;
