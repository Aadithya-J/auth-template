import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext";
import { FaArrowLeft, FaChevronRight, FaCheck } from "react-icons/fa";
import echoCharacter from "../../assets/symbol-sequence/Rune.png"; // Adjust path
import backgroundImage from "../../assets/symbol-sequence/Mystical-Runescape.png"; // Adjust path
// Fix for NodeJS.Timeout issue
import { useNavigate } from "react-router-dom";
type Timeout = ReturnType<typeof setTimeout>;

const symbols = [
  "★",
  "●",
  "▲",
  "■",
  "♥",
  "♦",
  "♣",
  "♠",
  "✿",
  "☀",
  "☁",
  "☂",
  "☃",
  "☎",
  "☑",
  "☠",
  "☢",
  "☣",
  "☯",
  "☺",
];

type DifficultyLevel = {
  name: string;
  sequenceLength: number;
  cardsToShow: number;
  timeToView: number;
};

const difficultyLevels: DifficultyLevel[] = [
  { name: "easy", sequenceLength: 3, cardsToShow: 6, timeToView: 5000 },
  { name: "medium", sequenceLength: 4, cardsToShow: 8, timeToView: 5000 },
  { name: "hard", sequenceLength: 5, cardsToShow: 10, timeToView: 5000 },
];

type GameState =
  | "welcome"
  | "playing"
  | "showing"
  | "guessing"
  | "results"
  | "gameOver";

interface SymbolSequenceProps {
  suppressResultPage?: boolean;
  onComplete?: (score: number) => void;
  student?: any;
}

const CharacterDialog = ({ onComplete, t }) => {
  const [currentDialog, setCurrentDialog] = useState(0);
  const dialog = [
    "👋 Welcome to Rune Rock!",
    "These floating stones are full of glowing runes.",
    "Watch the runes light up in a special order.",
    "Then, tap them in the same order to solve the puzzle.",
    "Stay focused and have fun!",
    "Are you ready?",
  ];

  const handleNext = () => {
    if (currentDialog < dialog.length - 1) {
      setCurrentDialog(currentDialog + 1);
    } else {
      onComplete();
    }
  };

  return (
    <>
      {/* Blurred background with animated overlay */}
      <div className="fixed inset-0 z-40">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(8px)",
          }}
        />
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
              src={echoCharacter}
              alt="Rune Keeper"
              className="h-64 sm:h-80 lg:h-96 xl:h-112 object-contain"
            />
          </motion.div>

          {/* Dialog box */}
          <motion.div
            className="bg-gradient-to-br from-blue-900/70 to-teal-900/70 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-white/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 via-purple-500 to-teal-500"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full filter blur-xl"></div>
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-400/20 rounded-full filter blur-xl"></div>

            <motion.div
              key={currentDialog}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="text-2xl sm:text-3xl lg:text-4xl text-white mb-8 lg:mb-12 min-h-48 sm:min-h-56 lg:min-h-64 flex items-center justify-center font-serif font-medium leading-relaxed text-center px-4"
            >
              <span className="drop-shadow-lg">{dialog[currentDialog]}</span>
            </motion.div>

            {/* Progress indicators */}
            <div className="flex justify-center gap-3 mb-8 lg:mb-10">
              {dialog.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                    index <= currentDialog
                      ? "bg-gradient-to-r from-white to-blue-200 shadow-lg"
                      : "bg-white/30"
                  }`}
                  initial={{ scale: 0.8 }}
                  animate={{
                    scale: index === currentDialog ? 1.3 : 1,
                    y: index === currentDialog ? -4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              ))}
            </div>

            {/* Action button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className={`flex items-center justify-center gap-3 py-4 px-8 lg:px-12 rounded-xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 ${
                  currentDialog < dialog.length - 1
                    ? "bg-gradient-to-r from-white to-blue-100 text-blue-900 hover:from-blue-50 hover:to-blue-200 hover:shadow-blue-200/50"
                    : "bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 text-white hover:from-blue-600 hover:via-purple-600 hover:to-teal-600 hover:shadow-purple-500/50"
                }`}
              >
                {currentDialog < dialog.length - 1 ? (
                  <>
                    <span className="drop-shadow-sm">{t("next")}</span>
                    <FaChevronRight className="mt-0.5 drop-shadow-sm" />
                  </>
                ) : (
                  <>
                    <span className="drop-shadow-sm">{t("imReady")}</span>
                    <FaCheck className="mt-0.5 drop-shadow-sm" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

const SymbolSequence: React.FC<SymbolSequenceProps> = ({
  suppressResultPage = false,
  onComplete = null,
  student,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("welcome");
  const [level, setLevel] = useState<number>(0);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>("");
  const [timer, setTimer] = useState<Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showingIndex, setShowingIndex] = useState<number>(-1);
  const [confetti, setConfetti] = useState<boolean>(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number>(-1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState !== "welcome") {
      const gameData = {
        gameState,
        level,
        currentSequence,
        userSequence,
        score,
        currentRound,
        timeLeft,
      };
      localStorage.setItem("symbolSequenceGameState", JSON.stringify(gameData));
    } else {
      localStorage.removeItem("symbolSequenceGameState");
    }
  }, [
    gameState,
    level,
    currentSequence,
    userSequence,
    score,
    currentRound,
    timeLeft,
  ]);

  // Load game state from localStorage on component mount
  useEffect(() => {
    try {
      const savedGameState = localStorage.getItem("symbolSequenceGameState");

      if (savedGameState) {
        const gameData = JSON.parse(savedGameState);

        if (gameData.gameState && gameData.gameState !== "welcome") {
          setGameState(gameData.gameState);
          setLevel(gameData.level);
          setScore(gameData.score);
          setCurrentRound(gameData.currentRound);
          setTimeLeft(gameData.timeLeft || 0);

          if (Array.isArray(gameData.currentSequence)) {
            setCurrentSequence(gameData.currentSequence);
          }

          if (Array.isArray(gameData.userSequence)) {
            setUserSequence(gameData.userSequence);
          }

          if (gameData.gameState === "showing") {
            const timeRemaining = Math.max(gameData.timeLeft || 0, 1);

            const countdown = setInterval(() => {
              setTimeLeft((prev) => {
                if (prev <= 0.1) {
                  clearInterval(countdown);
                  return 0;
                }
                return prev - 0.1;
              });
            }, 100);

            const timer = setTimeout(() => {
              setGameState("guessing");
              clearInterval(countdown);
              clearTimeout(timer);
            }, timeRemaining * 1000);

            setTimer(timer);
          }
        }
      }
    } catch (error) {
      console.error("Error restoring game state:", error);
      localStorage.removeItem("symbolSequenceGameState");
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const submitResults = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    const childId = localStorage.getItem("childId");
    const token = localStorage.getItem("access_token");

    if (!childId || !token) {
      setSubmitError("Missing authentication data");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/symbolsequenceresults`,
        {
          childId,
          difficulty: t(difficultyLevels[level].name),
          level: level + 1,
          score,
          totalRounds: 10,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Results submitted successfully:", response.data);
    } catch (error) {
      console.error("Error submitting results:", error);
      setSubmitError("Failed to save results. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startGame = (difficulty: number) => {
    if (timer) clearTimeout(timer);
    setLevel(difficulty);
    setScore(0);
    setCurrentRound(0);
    nextRound(difficulty);
  };

  const nextRound = (difficulty: number) => {
    setGameState("showing");
    setCurrentRound((prev) => prev + 1);

    // Create a copy of symbols array and shuffle it
    const shuffledSymbols = [...symbols].sort(() => 0.5 - Math.random());

    // Take the first 'sequenceLength' symbols from the shuffled array
    const seq = shuffledSymbols.slice(
      0,
      difficultyLevels[difficulty].sequenceLength
    );

    setCurrentSequence(seq);
    setUserSequence([]);
    setTimeLeft(difficultyLevels[difficulty].timeToView / 1000);

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    setShowingIndex(-1);
    let currentIndex = 0;
    const showNextSymbol = () => {
      if (currentIndex < seq.length) {
        setShowingIndex(currentIndex);
        currentIndex++;
        setTimeout(showNextSymbol, 500);
      } else {
        setShowingIndex(-1);
      }
    };
    showNextSymbol();

    const timer = setTimeout(() => {
      setGameState("guessing");
      clearInterval(countdown);
      clearTimeout(timer);
    }, difficultyLevels[difficulty].timeToView);
    setTimer(timer);
  };

  const selectSymbol = (symbol: string) => {
    if (gameState !== "guessing") return;

    const audio = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3"
    );
    audio.volume = 0.2;
    audio.play().catch(() => {});

    setUserSequence((prev) => [...prev, symbol]);

    if (userSequence.length + 1 === currentSequence.length) {
      checkAnswer([...userSequence, symbol]);
    }
  };

  const removeSymbol = (indexToRemove: number) => {
    if (gameState !== "guessing") return;

    const audio = new Audio(
      "https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3"
    );
    audio.volume = 0.2;
    audio.play().catch(() => {});

    setUserSequence((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const checkAnswer = async (userSeq: string[]) => {
    if (timer) clearTimeout(timer);
    setTimer(null);

    const isCorrect =
      JSON.stringify(userSeq) === JSON.stringify(currentSequence);
    const newScore = isCorrect ? score + 1 : score;

    setScore(newScore);
    setFeedback(isCorrect ? t("correct") : t("incorrect"));
    setGameState("results");

    const nextStateTimer = setTimeout(async () => {
      setFeedback("");

      const totalRounds = 10;
      if (currentRound >= totalRounds) {
        if (suppressResultPage && typeof onComplete === "function") {
          await submitResults();
          onComplete(newScore);
        } else {
          await submitResults();
          setGameState("gameOver");
          if (isCorrect) {
            setConfetti(true);
            setTimeout(() => setConfetti(false), 3000);
          }
        }
      } else {
        nextRound(level);
      }
    }, 1500);

    return () => clearTimeout(nextStateTimer);
  };

  const quitGame = () => {
    if (timer) clearTimeout(timer);
    setGameState("welcome");
  };

  const getAvailableSymbols = () => {
    // Start with the correct sequence symbols
    const requiredSymbols = [...currentSequence];

    // Get all symbols except those in the correct sequence
    const remainingSymbols = symbols.filter(
      (s) => !requiredSymbols.includes(s)
    );

    // Shuffle the remaining symbols
    const shuffledRemaining = [...remainingSymbols].sort(
      () => 0.5 - Math.random()
    );

    // Calculate how many additional symbols we need
    const additionalCount =
      difficultyLevels[level].cardsToShow - requiredSymbols.length;

    // Take the needed number from the shuffled remaining symbols
    const additionalSymbols = shuffledRemaining.slice(0, additionalCount);

    // Combine and shuffle the result
    const result = [...requiredSymbols, ...additionalSymbols];

    return [...result].sort(() => 0.5 - Math.random());
  };

  return (
    <div
      className="fixed inset-0 overflow-y-auto"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {showIntro && (
        <CharacterDialog
          onComplete={() => {
            setShowIntro(false);
            setGameState("welcome");
          }}
          t={t}
        />
      )}

      {/* Blurred background with animated overlay */}
      {/* Back button */}
      <motion.button
        whileHover={{ scale: 1.05, x: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/taketests")}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-blue-400 to-purple-500
       text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-purple-400"
      >
        <motion.span
          animate={{ x: [-2, 0, -2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            className="w-6 h-6 text-white-400 drop-shadow-lg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </motion.span>
        <span className="font-semibold">Back to Tests</span>
      </motion.button>
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              initial={{
                top: "0%",
                left: `${Math.random() * 100}%`,
                backgroundColor: [
                  "#1E40AF",
                  "#3B82F6",
                  "#60A5FA",
                  "#93C5FD",
                  "#BFDBFE",
                  "#DBEAFE",
                ][Math.floor(Math.random() * 6)],
              }}
              animate={{
                top: "100%",
                left: [
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`,
                  `${Math.random() * 100}%`,
                ],
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: "linear",
              }}
            />
          ))}
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === "welcome" && (
            <motion.div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 max-w-2xl text-center border border-blue-100">
              <motion.div>
                <h2 className="text-3xl font-bold text-blue-700 mb-4">
                  {t("symbolSequenceAssessment")}
                </h2>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  {t("symbolSequenceDescription")}
                </p>
              </motion.div>

              <motion.div className="mt-8">
                <h3 className="text-2xl font-semibold mb-6 text-blue-600">
                  {t("chooseDifficulty")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {difficultyLevels.map((level, index) => (
                    <motion.button
                      onClick={() => startGame(index)}
                      className="relative overflow-hidden group px-8 py-4 rounded-xl font-bold text-lg"
                      style={{
                        background: "linear-gradient(135deg, #2C003E, #6C757D)",
                        border: "1px solid #8A2BE2",
                      }}
                      whileHover={{
                        scale: 1.05,
                        boxShadow: "0 0 15px rgba(138, 43, 226, 0.6)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="relative z-10 text-white">
                        {t(level.name)}
                      </span>
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === "showing" && (
            <motion.div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 w-full max-w-3xl text-center border border-blue-100">
              <h2 className="text-2xl font-bold text-blue-700 mb-8">
                {t("lookCarefully")}
              </h2>

              <div className="flex justify-center flex-wrap gap-6 my-10">
                {currentSequence.map((symbol, index) => (
                  <div
                    key={index}
                    className="w-24 h-24 flex items-center justify-center text-5xl rounded-xl shadow-lg bg-white border-2 border-blue-200 text-blue-800"
                  >
                    <motion.div
                      key={index}
                      className="w-24 h-24 flex items-center justify-center text-5xl rounded-xl relative overflow-hidden"
                      style={{
                        background: "radial-gradient(circle, #2C003E, #6C757D)",
                        border: "2px solid #00BFFF",
                        boxShadow:
                          showingIndex === index
                            ? "0 0 20px rgba(0, 191, 255, 0.8)"
                            : "0 0 10px rgba(0, 191, 255, 0.5)",
                        color: "#FFD700",
                        textShadow:
                          showingIndex === index
                            ? "0 0 15px rgba(255, 215, 0, 0.9)"
                            : "0 0 8px rgba(255, 215, 0, 0.7)",
                      }}
                      animate={{
                        scale: showingIndex === index ? [1, 1.1, 1] : 1,
                        rotate: showingIndex === index ? [0, 5, -5, 0] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                      }}
                    >
                      {symbol}
                      {showingIndex === index && (
                        <motion.div
                          className="absolute inset-0 bg-blue-400/20 rounded-xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 0.3, 0] }}
                          transition={{ duration: 0.8 }}
                        />
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mt-8">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: difficultyLevels[level].timeToView / 1000,
                    ease: "linear",
                  }}
                />
              </div>

              <p className="mt-4 text-blue-600 font-medium">
                {t("waitUntilDisappear")}
              </p>
            </motion.div>
          )}

          {gameState === "guessing" && (
            <motion.div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 w-full max-w-3xl text-center border border-blue-100">
              <h2 className="text-2xl font-bold text-blue-700 mb-8">
                {t("recreateSequence")}
              </h2>

              <div className="flex justify-center flex-wrap gap-6 my-10">
                {userSequence.map((symbol, index) => (
                  <motion.div
                    key={index}
                    className="w-24 h-24 flex items-center justify-center text-5xl bg-white border-2 border-blue-200 text-blue-800 rounded-xl shadow-md relative cursor-pointer"
                    onHoverStart={() => setHoveredCardIndex(index)}
                    onHoverEnd={() => setHoveredCardIndex(-1)}
                    onClick={() => removeSymbol(index)}
                  >
                    {symbol}
                    {hoveredCardIndex === index && (
                      <motion.div className="absolute inset-0 bg-blue-800/50 rounded-xl flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {t("remove")}
                        </span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                {Array(currentSequence.length - userSequence.length)
                  .fill(0)
                  .map((_, index) => (
                    <motion.div
                      key={index + userSequence.length}
                      className="w-24 h-24 flex items-center justify-center text-5xl bg-white border-2 border-dashed border-blue-300 rounded-xl"
                      animate={{
                        boxShadow: [
                          "0px 0px 0px rgba(0,0,0,0)",
                          "0px 0px 10px rgba(59,130,246,0.5)",
                          "0px 0px 0px rgba(0,0,0,0)",
                        ],
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  ))}
              </div>

              <h3 className="text-xl font-semibold mb-6 text-blue-700">
                {t("availableSymbols")}
              </h3>

              <div className="flex justify-center flex-wrap gap-4 my-8">
                {getAvailableSymbols().map((symbol, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectSymbol(symbol)}
                    className="w-24 h-24 flex items-center justify-center text-5xl bg-white border-2 border-blue-200 text-blue-800 rounded-xl shadow-md"
                  >
                    {symbol}
                  </motion.button>
                ))}
              </div>

              <button
                onClick={quitGame}
                className="mt-8 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg"
              >
                {t("quitAssessment")}
              </button>
            </motion.div>
          )}

          {gameState === "results" && (
            <motion.div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 w-full max-w-3xl text-center border border-blue-100">
              <h2
                className={`text-2xl font-bold mb-6 ${
                  feedback.includes(t("correct"))
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {feedback}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-700">
                    {t("yourSequence")}
                  </h3>
                  <div className="flex justify-center flex-wrap gap-3">
                    {userSequence.map((symbol, index) => (
                      <div
                        key={index}
                        className={`w-20 h-20 flex items-center justify-center text-4xl rounded-lg ${
                          symbol === currentSequence[index]
                            ? "bg-gradient-to-br from-green-200 to-green-300 border-2 border-green-300"
                            : "bg-gradient-to-br from-red-200 to-red-300 border-2 border-red-300"
                        }`}
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-blue-700">
                    {t("correctSequence")}
                  </h3>
                  <div className="flex justify-center flex-wrap gap-3">
                    {currentSequence.map((symbol, index) => (
                      <div
                        key={index}
                        className="w-20 h-20 flex items-center justify-center text-4xl bg-gradient-to-br from-blue-100 to-blue-300 rounded-lg"
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === "gameOver" && !suppressResultPage && (
            <motion.div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 max-w-2xl text-center border border-blue-100">
              <h2 className="text-3xl font-bold text-blue-700 mb-4">
                {t("gameComplete")}
              </h2>

              <div className="w-40 h-40 mx-auto my-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                <span className="text-6xl font-bold text-blue-700">
                  {score}/10
                </span>
              </div>

              <p className="text-xl mb-8 text-gray-700">{t("finalScore")}</p>

              <div className="my-8 text-2xl">
                {score >= 9 && (
                  <p className="text-yellow-500 font-bold">
                    {t("excellentMemory")}
                  </p>
                )}
                {score >= 7 && score < 9 && (
                  <p className="text-green-600 font-bold">{t("veryGoodJob")}</p>
                )}
                {score >= 5 && score < 7 && (
                  <p className="text-blue-600">{t("goodEffort")}</p>
                )}
                {score < 5 && (
                  <p className="text-blue-600">{t("keepPracticing")}</p>
                )}
              </div>

              {submitError && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
                  <p>{submitError}</p>
                </div>
              )}

              <button
                onClick={() => setGameState("welcome")}
                className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 px-10 rounded-lg shadow-lg hover:shadow-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {t("savingResults")}
                  </div>
                ) : (
                  t("playAgain")
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SymbolSequence;
