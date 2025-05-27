import { useEffect, useMemo, useRef, useState } from "react"; // Added useMemo
import { useNavigate, Link } from "react-router-dom";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import wordLists from "./wordLists.json";
import { improveTranscriptionAccuracy } from "./accuracyImprover";
import ancientPaper from "../../assets/reading-test/ancientPaper.png";
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
  const { language, t } = useLanguage(); // Assuming t is needed here for toast messages

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
        const rawTranscript = result.transcription;
        const targetWordsForLanguage = wordLists[language] || wordLists.en;
        const safeTargetWords = Array.isArray(targetWordsForLanguage)
          ? targetWordsForLanguage
          : [];
        if (typeof rawTranscript !== "string") {
          console.error("Raw transcript is not a string:", rawTranscript);
          setTranscript("");
          setTranscriptionReady(true);
          return "";
        }
        if (!Array.isArray(safeTargetWords) || safeTargetWords.length === 0) {
          console.warn(
            "safeTargetWords is not a valid array or is empty. Using raw transcript for language:",
            language,
            "Content:",
            safeTargetWords
          );
          const cleanedRawTranscript = String(rawTranscript)
            .toLowerCase()
            .replace(/[.,!?;:"']/g, "")
            .split(/\s+/)
            .filter((word) => word.length > 0)
            .join(" ");
          setTranscript(cleanedRawTranscript);
          setTranscriptionReady(true);
          return cleanedRawTranscript;
        }

        const correctedTranscript = improveTranscriptionAccuracy(
          rawTranscript,
          safeTargetWords
        );

        setTranscript(correctedTranscript);
        setTranscriptionReady(true);
        return correctedTranscript;
      } else {
        console.error("Error during transcription:", response.statusText);
        toast.error(t("transcriptionFailedTryAgain"));
        setTranscript(""); // Clear transcript on error
        return null;
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error(t("errorUploadingAudioTryAgain"));
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
  const { t } = useLanguage(); // Assuming t is needed here for toast messages

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
          toast.success(t("testSubmittedWithScore").replace("{score}", score), {
            position: "top-center",
            onClose: () =>
              navigate("/results", {
                state: { score, tableData },
              }),
          });
        }
        return { success: true, score };
      } else {
        toast.error(t("failedToSubmitTestPleaseTryAgain"));
        return { success: false };
      }
    } catch (error) {
      console.error("Full error details:", {
        config: error.config,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Ensure 'anErrorOccurredWhileSubmittingTheTestPleaseTryAgain' exists in your translations
      // If not, use a more generic one like 'errorOccurred'
      toast.error(
        t("anErrorOccurredWhileSubmittingTheTestPleaseTryAgain") ||
          t("errorOccurred")
      );
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
  const [wordsPerBatch, setWordsPerBatch] = useState(12); // Changed from 16 to 12
  const wordIntervalRef = useRef(null);
  const [tutorialPhase, setTutorialPhase] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isTutorialComplete, setIsTutorialComplete] = useState(false);

  const tutorialMessages = useMemo(
    () => [
      t("tutorialHelloExplorer"),
      t("tutorialCoralineIntro"),
      t("tutorialGlyphReefDescription"),
      t("tutorialReadingTask"),
      t("tutorialDifficulty"),
      t("tutorialShellOfFluency"),
      t("tutorialCoralSpyglass"),
      t("tutorialLetsGetReading"),
      t("tutorialReadyForMission"),
    ],
    [t]
  );

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
      setWordShells(
        words.map((word, index) => ({
          id: index,
          word,
          collected: false,
          glowing: false,
        }))
      );
      setGameProgress((wordsPerBatch / words.length) * 100);
    }
  }, [language, showTutorial, gameState, wordsPerBatch]); // Added wordsPerBatch

  const startWordBatches = (words) => {
    setCurrentWordIndex(0);
    setWordsPerBatch(12); // Changed from 4 to 12, ensure this aligns with your intent or remove if not needed
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarExpanded(true);
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
      setTutorialPhase(0);
      if (tutorialMessages.length > 0) {
        // Ensure tutorialMessages is populated
        setIntroMessage(tutorialMessages[0]);
      }
    };

    introSequence();
  }, [showTutorial, tutorialMessages]); // Added tutorialMessages dependency

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
      setIntroMessage(t("coralineExcellentRecording"));
      // Call transcribeAudio once and use its result
      const currentTranscript = await transcribeAudio(file);

      if (currentTranscript) {
        setCoralineAnimationState("happy");
        setIntroMessage(t("coralineHeardClearly"));
        setGameProgress((prev) => Math.min(prev + 30, 70));
        glowCorrectWords(currentTranscript);
      } else {
        setCoralineAnimationState("confused");
        setIntroMessage(t("coralineCouldntMakeOut"));
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
      setIntroMessage(t("coralineNeedYourVoice"));
      setTimeout(() => {
        setShowEels(false);
        setCoralineAnimationState("idle");
        setIntroMessage("");
      }, 3000);
      return;
    }

    setCoralineAnimationState("focused");
    setIntroMessage(t("coralineCheckingPronunciation"));
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
        setIntroMessage(t("coralineAmazingScore").replace("{score}", score));
        const newTreasure = {
          id: Date.now(),
          name: `${t("shellNamePrefix")}${collectedTreasures.length + 1}`,
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
        setIntroMessage(
          t("coralineScoreKeepPracticing").replace("{score}", score)
        );
      }
    } else {
      setCoralineAnimationState("confused");
      setIntroMessage(t("coralineReefMagicError"));
    }
  };

  const visibleWords = wordShells.slice(
    currentWordIndex,
    currentWordIndex + wordsPerBatch
  );

  return (
    <div
      className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4 md:p-8 bg-cover bg-center"
      style={{ backgroundImage: `url(${coralBackground})` }}
    >
      {showTutorial && (
        <>
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-md" />
            <motion.div
              className="absolute inset-0 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative max-w-7xl w-full flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12"
            >
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
                  alt={t("altCoralineCharacter")}
                  className="h-64 sm:h-80 lg:h-96 xl:h-[500px] object-contain"
                />
              </motion.div>
              <motion.div
                className="bg-gradient-to-br from-blue-900/70 to-purple-900/70 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-white/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full filter blur-xl"></div>
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-400/20 rounded-full filter blur-xl"></div>
                <div className="absolute top-1/2 right-8 w-24 h-24 bg-purple-400/10 rounded-full filter blur-lg"></div>
                <div className="absolute bottom-8 left-8 w-32 h-32 bg-cyan-400/10 rounded-full filter blur-lg"></div>
                <motion.div
                  key={tutorialPhase} // Ensures re-render on phase change for animation
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-2xl sm:text-3xl lg:text-4xl text-white mb-8 lg:mb-12 min-h-48 sm:min-h-56 lg:min-h-64 flex items-center font-serif font-medium leading-relaxed px-4"
                >
                  <span className="drop-shadow-lg">
                    {/* Display current intro message, which is set based on tutorialMessages */}
                    {introMessage}
                  </span>
                </motion.div>
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
                        <span className="drop-shadow-sm">{t("next")}</span>{" "}
                        {/* Use existing 'next' key */}
                        <span className="drop-shadow-sm">➔</span>
                      </>
                    ) : (
                      <>
                        <span className="drop-shadow-sm">
                          {t("buttonTutorialConfirmReady")}
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
      <Link
        to="/taketests"
        className="absolute top-4 left-0 z-50 flex items-center gap-2 bg-white/80 hover:bg-white text-teal-800 font-medium py-2 px-4 rounded-full shadow-md transition-all"
      >
        <ChevronLeft className="h-5 w-5" />
        {t("backToTests")}
      </Link>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
      </div>
      {!showTutorial && (
        <>
          <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8 w-full px-4 sm:px-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-400 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  {t("labelReefProgress")}
                </span>
                <span className="text-teal-600 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]">
                  {gameProgress}%
                </span>
              </div>
              <ProgressBar progress={gameProgress} />
            </div>

            {/* Ancient paper container with responsive sizing */}
            <div className="relative mb-8 w-full max-w-3xl mx-auto">
              <div className="relative h-[600px] max-h-[600px]">
                <img
                  src={ancientPaper}
                  className="w-full h-full object-cover rounded-lg"
                  alt="Ancient paper background"
                />
                {/* Responsive grid - positioned absolutely over the image */}
                <div className="absolute inset-4 grid grid-cols-3 grid-rows-4 gap-1 p-24 pr-48">
                  {" "}
                  {/* Changed grid-cols-4 to grid-cols-3 */}
                  {visibleWords.map((wordObj, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-center rounded-md shadow-sm p-4"
                    >
                      <span className="text-md md:text-base lg:text-xl font-bold text-black text-center leading-tight">
                        {wordObj.word}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-6 shadow-xl border border-white/30 w-full">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-auto">
                  {/* Assuming RecordingControls will get 't' prop if needed inside it */}
                  <RecordingControls
                    isRecording={isRecording}
                    onStartRecording={startRecording}
                    onStopRecording={stopRecording}
                    showEels={showEels}
                    largeSize={true}
                    t={t} // Pass t if RecordingControls uses it internally
                  />
                </div>
                {currentWordIndex + wordsPerBatch < currentWords.length && (
                  <motion.button
                    onClick={() => {
                      const newIndex = currentWordIndex + wordsPerBatch;
                      setCurrentWordIndex(newIndex);
                      const progress = Math.min(
                        100,
                        (newIndex / currentWords.length) * 100
                      );
                      setGameProgress(progress);
                    }}
                    className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-700 to-cyan-500 text-white rounded-full shadow-lg mx-auto"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {t("buttonNextWords")} <ChevronRight className="h-5 w-5" />
                  </motion.button>
                )}
                <div className="flex flex-col md:flex-row gap-6 w-full sm:w-auto">
                  <FileUploadButton onFileUpload={handleFileUpload} t={t} />
                  <SubmitButton
                    isTranscribing={isTranscribing}
                    transcriptionReady={transcriptionReady}
                    onSubmit={handleSubmit}
                    t={t}
                    largeSize={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
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
                alt={t("altEarnedShellImage")}
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
                {t("titleShellOfFluencyEarned")}
              </h3>
              <p className="text-yellow-800 text-lg mb-6">
                {t("messagePronunciationShining")}
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
                {t("buttonCollectTreasure")}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" />
    </div>
  );
}

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-teal-100/60 rounded-full h-6 overflow-hidden border-2 border-teal-200/70 shadow-inner relative">
    <motion.div
      className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-end text-xs font-bold text-white pr-2 relative"
      initial={{ width: "0%" }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
    >
      {progress > 5 && (
        <motion.span
          className="absolute left-0 top-0 bottom-0 bg-white/20"
          style={{ width: "100%" }}
          animate={{ x: ["-100%", "100%"] }}
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

// Speech Bubble Component - Assuming 't' is passed as a prop or useLanguage is used internally
const SpeechBubble = ({
  text,
  visible,
  isLastMessage = false,
  onConfirm,
  t,
}) => (
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
          {text}{" "}
          {/* This 'text' prop should already be translated if it's dynamic from Test6 */}
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
              {t && t("buttonModalYesImReady")} {/* Check if t is provided */}
            </motion.button>
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

// Recording Controls Component - Assuming 't' is passed as a prop
const RecordingControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  showEels,
  t, // Added t as a prop
}) => (
  <div className="flex items-center gap-4 relative">
    <AnimatePresence>
      {showEels && (
        <motion.div
          initial={{ opacity: 0, x: -50, rotate: -30 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={{ opacity: 0, x: -50, rotate: 30 }}
          className="absolute -top-16 -left-12 z-10"
        >
          <img
            src={coralineImage}
            className="w-24 h-24 object-contain transform scale-x-[-1] "
            alt={t("altWarningSignImage")}
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
        aria-label={t("startRecording")}
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
      aria-label={t("stopRecording")}
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
        <span className="text-sm font-semibold">{t("recording")}</span>
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

const FileUploadButton = ({ onFileUpload, t }) => (
  <div className="relative w-full sm:w-auto">
    <input
      type="file"
      accept="audio/*,.m4a,.mp3,.wav,.ogg"
      onChange={onFileUpload}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      aria-label={t("ariaLabelUploadAudioFile")}
      id="audioUpload"
    />
    <motion.label
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
