import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendURL } from "../../definedURL";
import { useLanguage } from "../../contexts/LanguageContext";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import clockAnimation from "../../assets/sequence-test/clockAnimation.json";
// Images
import backgroundImage from "../../assets/sequence-test/Mystical-TimeIsland.png";
import captainCharacter from "../../assets/sequence-test/Pirate-crab.png";
//import swirlImage from "../../assets/sequence-test/swirlBackground.png";
const Test7 = ({ onComplete, suppressResultPage, student }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const animals = {
    fish: "🐟",
    mouse: "🐭",
    rabbit: "🐰",
    frog: "🐸",
    bear: "🐻",
  };

  const sequences = [
    // Pattern 1: Simple alternating
    [{ name: "fish" }, { name: "mouse" }, { name: "fish" }, { name: "mouse" }],
    // Pattern 2: Double same animal
    [{ name: "bear" }, { name: "bear" }, { name: "fish" }, { name: "mouse" }],
    // Pattern 3: Alternating with different animals
    [
      { name: "rabbit" },
      { name: "frog" },
      { name: "rabbit" },
      { name: "bear" },
    ],
    // Pattern 4: Mixed sequence
    [{ name: "mouse" }, { name: "fish" }, { name: "bear" }, { name: "frog" }],
    // Pattern 5: Reverse order
    [{ name: "frog" }, { name: "rabbit" }, { name: "mouse" }, { name: "fish" }],
    // Pattern 6: All different animals
    [{ name: "bear" }, { name: "mouse" }, { name: "frog" }, { name: "rabbit" }],
    // Pattern 7: Repeating with different animals
    [{ name: "fish" }, { name: "bear" }, { name: "mouse" }, { name: "bear" }],
    // Pattern 8: Double same animal in middle
    [
      { name: "rabbit" },
      { name: "rabbit" },
      { name: "frog" },
      { name: "mouse" },
    ],
    // Pattern 9: Same animal at start and end
    [{ name: "mouse" }, { name: "fish" }, { name: "bear" }, { name: "fish" }],
    // Pattern 10: Complex pattern
    [{ name: "frog" }, { name: "bear" }, { name: "rabbit" }, { name: "mouse" }],
  ];

  const practiceSequence = [
    { name: "fish" },
    { name: "mouse" },
    { name: "fish" },
    { name: "mouse" },
  ];

  const testItems = sequences;

  // Game state
  const [gameState, setGameState] = useState("welcome");
  const [currentItem, setCurrentItem] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timer, setTimer] = useState(5);
  const [timerProgress, setTimerProgress] = useState(100);
  const [selectedCards, setSelectedCards] = useState([]);
  const [availableCards, setAvailableCards] = useState([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState({ message: "", isCorrect: false });
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [childId, setChildId] = useState(localStorage.getItem("childId"));
  const [currentDialog, setCurrentDialog] = useState(0);

  const dialog = [
    "🐚 Hello, young traveler! I am Kaalnath, the crab who guards the River of Time.",
    "🌊 Here, the river flows not just through space but through moments long past and yet to come.",
    "⏳ Your challenge is to arrange the events of time in the right order.",
    "🦀 Are you ready to journey through the currents of the past and future with me?",
  ];

  // Initialize available cards (shuffled with some extras)
  const initCards = (sequence) => {
    const allCards = [...sequence];
    // Add 2 extra random cards to make it more challenging
    const animalTypes = Object.keys(animals);
    for (let i = 0; i < 2; i++) {
      allCards.push({
        name: animalTypes[Math.floor(Math.random() * animalTypes.length)],
      });
    }
    return shuffleArray(allCards);
  };

  // Shuffle array
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // Start practice round
  const startPractice = () => {
    setGameState("practice");
    setAvailableCards(initCards(practiceSequence));
    setSelectedCards([]);
    showSequence(practiceSequence);
  };

  // Start test
  const startTest = () => {
    setGameState("test");
    setCurrentItem(0);
    setScore({ correct: 0, total: 0 });
    startTestItem(0);
  };

  // Start a test item
  const startTestItem = (index) => {
    if (index >= testItems.length) {
      setGameState("results");
      return;
    }
    setAvailableCards(initCards(testItems[index]));
    setSelectedCards([]);
    showSequence(testItems[index]);
  };

  // Show the sequence to remember
  const showSequence = (sequence) => {
    setShowExample(true);
    setShowTimer(true);
    setTimer(5);
    setTimerProgress(100);
  };

  // Timer effect
  useEffect(() => {
    if (showExample && timer > 0) {
      const countdown = setTimeout(() => {
        setTimer(timer - 1);
        setTimerProgress((timer - 1) * 20); // Update progress (20% per second)
      }, 1000);
      return () => clearTimeout(countdown);
    } else if (showExample && timer === 0) {
      setShowExample(false);
      setShowTimer(false);
      setTimerProgress(100); // Reset progress
    }
  }, [showExample, timer]);

  // Handle card selection
  const selectCard = (card, index) => {
    if (selectedCards.length < 4) {
      setSelectedCards([...selectedCards, card]);
      // Remove from available cards
      const newAvailable = [...availableCards];
      newAvailable.splice(index, 1);
      setAvailableCards(newAvailable);
    }
  };

  // Remove card from selection
  const removeCard = (index) => {
    const removedCard = selectedCards[index];
    setSelectedCards(selectedCards.filter((_, i) => i !== index));
    setAvailableCards([...availableCards, removedCard]);
  };

  // Check the answer
  const checkAnswer = () => {
    let isCorrect = true;
    const correctSequence =
      gameState === "practice" ? practiceSequence : testItems[currentItem];

    // Check each position
    for (let i = 0; i < 4; i++) {
      if (
        !selectedCards[i] ||
        selectedCards[i].name !== correctSequence[i].name
      ) {
        isCorrect = false;
        break;
      }
    }

    // Update score and show feedback
    if (isCorrect) {
      setFeedback({ message: t("greatJob"), isCorrect: true });
      setScore({ correct: score.correct + 1, total: score.total + 1 });
    } else {
      setFeedback({ message: t("tryAgain"), isCorrect: false });
      setScore({ ...score, total: score.total + 1 });
    }

    // Move to next item or show results after 2 seconds
    setTimeout(() => {
      if (gameState === "practice") {
        setGameState("instructions2");
        setFeedback({ message: "", isCorrect: false });
      } else if (currentItem < testItems.length - 1) {
        setCurrentItem(currentItem + 1);
        startTestItem(currentItem + 1);
        setFeedback({ message: "", isCorrect: false });
      } else {
        setGameState("results");
        setFeedback({ message: "", isCorrect: false });
      }
    }, 2000);
  };

  // Reset current item
  const tryAgain = () => {
    if (gameState === "practice") {
      showSequence(practiceSequence);
    } else {
      showSequence(testItems[currentItem]);
    }
    setSelectedCards([]);
    setAvailableCards(
      initCards(
        gameState === "practice" ? practiceSequence : testItems[currentItem]
      )
    );
    setFeedback({ message: "", isCorrect: false });
  };

  const saveTestResults = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.post(
        `${backendURL}/addsequencetest`,
        {
          childId,
          score: score.correct,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Test results saved:", response.data);
      if (onComplete) onComplete(score.correct);
    } catch (error) {
      console.error("Error saving test results:", error);
      if (onComplete) onComplete(score.correct);
    }
  };

  const handleNextDialog = () => {
    if (currentDialog < dialog.length - 1) {
      setCurrentDialog(currentDialog + 1);
    } else {
      setGameState("instructions");
    }
  };

  return (
    <div
      className="fixed inset-0 overflow-y-auto bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {gameState === "welcome" && (
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
                  src={captainCharacter}
                  alt="Captain Clockjaw"
                  className="h-64 sm:h-80 lg:h-96 xl:h-112 object-contain"
                />
              </motion.div>

              {/* Enhanced glass-morphism dialog box */}
              <motion.div
                className="bg-gradient-to-br from-amber-900/70 to-yellow-900/70 backdrop-blur-lg rounded-3xl p-6 sm:p-8 lg:p-10 xl:p-12 border-2 border-white/20 shadow-2xl flex-1 relative overflow-hidden w-full max-w-none lg:max-w-4xl order-1 lg:order-2"
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                {/* Enhanced decorative elements */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500"></div>
                <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-amber-400/20 rounded-full filter blur-xl"></div>
                <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-400/20 rounded-full filter blur-xl"></div>
                <div className="absolute top-1/2 right-8 w-24 h-24 bg-orange-400/10 rounded-full filter blur-lg"></div>
                <div className="absolute bottom-8 left-8 w-32 h-32 bg-yellow-400/10 rounded-full filter blur-lg"></div>

                {/* Enhanced animated dialog text */}
                <motion.div
                  key={currentDialog}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-white mb-8 lg:mb-12 min-h-48 sm:min-h-56 lg:min-h-64 xl:min-h-72 flex items-center justify-center font-serif font-medium leading-relaxed text-center px-4"
                >
                  <span className="drop-shadow-lg">
                    {dialog[currentDialog]}
                  </span>
                </motion.div>

                {/* Enhanced progress indicators */}
                <div className="flex justify-center gap-3 mb-8 lg:mb-10">
                  {dialog.map((_, index) => (
                    <motion.div
                      key={index}
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                        index <= currentDialog
                          ? "bg-gradient-to-r from-white to-amber-200 shadow-lg"
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

                {/* Enhanced animated action button */}
                <div className="flex justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNextDialog}
                    className={`flex items-center justify-center gap-3 py-4 px-8 lg:px-12 rounded-xl font-bold text-lg lg:text-xl shadow-2xl transition-all duration-300 ${
                      currentDialog < dialog.length - 1
                        ? "bg-gradient-to-r from-white to-amber-100 text-amber-900 hover:from-amber-50 hover:to-amber-200 hover:shadow-amber-200/50"
                        : "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600 hover:shadow-orange-500/50"
                    }`}
                  >
                    {currentDialog < dialog.length - 1 ? (
                      <>
                        <span className="drop-shadow-sm">Continue</span>
                        <span className="text-xl">⏳</span>
                      </>
                    ) : (
                      <>
                        <span className="drop-shadow-sm">Let's Begin!</span>
                        <span className="text-xl">🦀</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
      {/* Info Dialog */}
      {showInfoDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-amber-50 rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl relative border-4 border-amber-200"
          >
            <motion.button
              whileHover={{ rotate: 90 }}
              onClick={() => setShowInfoDialog(false)}
              className="absolute top-4 right-4 text-amber-700 hover:text-amber-900"
            >
              <IoClose className="text-2xl" />
            </motion.button>

            <h2 className="text-3xl font-bold text-amber-800 mb-6 text-center">
              {t("aboutTheGame")}
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                <h3 className="text-xl font-semibold text-amber-700 mb-4">
                  {t("howToPlay")}
                </h3>
                <p className="text-amber-800 mb-4">
                  {t("memoryGameDescription")}
                </p>
                <ol className="list-decimal list-inside space-y-2 text-amber-800">
                  <li>{t("watchSequence")}</li>
                  <li>{t("rememberOrder")}</li>
                  <li>{t("recreateSequence")}</li>
                  <li>{t("fiveSecondsToMemorize")}</li>
                </ol>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                <h3 className="text-xl font-semibold text-amber-700 mb-4">
                  {t("gameStructure")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-amber-800">
                      {t("practiceRound")}
                    </h4>
                    <p className="text-amber-800">
                      {t("practiceRoundDescription")}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-800">
                      {t("mainTest")}
                    </h4>
                    <p className="text-amber-800">{t("mainTestDescription")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-amber-100">
                <h3 className="text-xl font-semibold text-amber-700 mb-4">
                  {t("tips")}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-amber-800">
                  <li>{t("focusOnOrder")}</li>
                  <li>{t("lookForPatterns")}</li>
                  <li>{t("takeYourTime")}</li>
                  <li>{t("removeRearrange")}</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {gameState === "instructions" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-40"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-200 z-50"
          >
            <h2 className="text-3xl font-bold text-amber-800 text-center mb-8">
              {t("howToPlay")}
            </h2>
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-amber-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <p className="text-lg text-amber-800">
                    {t("showAnimalsInOrder")}
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  {[animals.fish, animals.mouse, animals.fish].map(
                    (animal, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl border-2 border-amber-200"
                      >
                        {animal}
                      </motion.div>
                    )
                  )}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-amber-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <p className="text-lg text-amber-800">
                    {t("recreateSequence")}
                  </p>
                </div>
                <div className="flex justify-center gap-4">
                  {[
                    animals.fish,
                    animals.mouse,
                    animals.fish,
                    animals.mouse,
                  ].map((animal, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl border-2 border-amber-200"
                    >
                      {animal}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-2xl p-6 shadow-md border border-amber-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <p className="text-lg text-amber-800">
                    {t("fiveSecondsToMemorize")}
                  </p>
                </div>
                <div className="flex justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="w-16 h-16 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg"
                  >
                    5
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl"
              onClick={startPractice}
            >
              {t("startPracticeRound")}
            </motion.button>
          </motion.div>
        </motion.div>
      )}

      {gameState === "instructions2" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-40"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-200 z-50"
          >
            <h2 className="text-3xl font-bold text-amber-800 text-center mb-8">
              {t("readyForTest")}
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
                <p className="text-lg text-amber-800 text-center">
                  {t("testDescription")}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl"
                onClick={startTest}
              >
                {t("startTest")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {(gameState === "practice" || gameState === "test") && (
        <div className="flex flex-col items-center justify-center min-h-screen relative px-4 py-10">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-0 left-0 right-0 z-50 p-4"
          >
            <div className="flex justify-between items-center">
              {/* Back to Tests Button */}
              <motion.button
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/taketests")}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-700/80  to-yellow-600/80 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-yellow-400"
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
                <span className="font-semibold text-lg">Back to Tests</span>
              </motion.button>
              {gameState === "test" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-4 bg-black/60 backdrop-blur-md rounded-full px-6 py-3 border-2 border-amber-400/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-bold text-lg">
                      Progress:
                    </span>
                    <div className="flex gap-1">
                      {Array(10)
                        .fill(0)
                        .map((_, index) => (
                          <motion.div
                            key={index}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`w-4 h-4 rounded-full transition-all duration-300 ${
                              index <= currentItem
                                ? "bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg"
                                : "bg-white/30"
                            }`}
                          />
                        ))}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-amber-400/50"></div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-2 text-amber-300"
                  >
                    <span className="text-3xl">🏆</span>
                    <span className="font-bold text-xl">
                      {score.correct}/{score.total}
                    </span>
                  </motion.div>
                </motion.div>
              )}

              {/* Info and Skip Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowInfoDialog(true)}
                  className="p-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-amber-300"
                >
                  <IoIosInformationCircleOutline className="text-3xl text-white" />
                </motion.button>

                {(gameState === "practice" || gameState === "test") && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (onComplete) onComplete(0);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-red-400"
                  >
                    <span className="text-2xl">🚪</span>
                    <span className="font-semibold text-lg">
                      {t("skipTest")}
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Content Box - Now Larger and Centered */}
          <div className="w-full max-w-5xl mx-auto bg-black/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-2 border-amber-300/30">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-amber-300">
                {gameState === "practice"
                  ? t("practiceRound")
                  : `${t("round")} ${currentItem + 1} ${t("of")} 10`}
              </h2>
            </div>

            <div className="min-h-[500px] w-full flex flex-col justify-center">
              {showExample ? (
                <div className="w-full">
                  <div className="space-y-6 w-full">
                    <div className="flex flex-col items-center w-full">
                      <h3 className="text-3xl font-bold text-amber-300 mb-10">
                        {t("rememberSequence")}
                      </h3>
                      <div className="flex justify-center gap-8 w-full">
                        {(gameState === "practice"
                          ? practiceSequence
                          : testItems[currentItem]
                        ).map((animal, index) => (
                          <motion.div
                            key={`example-${index}`}
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              delay: index * 0.15,
                              type: "spring",
                              stiffness: 300,
                              damping: 10,
                            }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="w-32 h-32 cursor-pointer bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl shadow-lg flex items-center justify-center text-6xl border-4 border-amber-300"
                            >
                              {animals[animal.name]}
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                      {showTimer && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: showTimer ? 1 : 0 }}
                          transition={{ delay: 0.6 }}
                          className="relative w-72 h-72 mt-8 mx-auto"
                        >
                          {/* Background Halo */}
                          <div className="absolute inset-x-12 inset-y-12 rounded-full bg-amber-950/30 z-0"></div>

                          {/* Lottie Clock Animation */}
                          <Lottie
                            animationData={clockAnimation}
                            loop={true}
                            style={{ width: "100%", height: "100%" }}
                            className="absolute inset-0 z-10"
                          />

                          {/* Timer Overlay Number with Pulse */}
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center z-20"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <span className="text-5xl font-bold text-white drop-shadow-md">
                              {timer}
                            </span>
                          </motion.div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="space-y-8 w-full">
                    <div className="grid grid-cols-4 gap-8 w-full max-w-3xl mx-auto mb-16">
                      {selectedCards.map((card, index) => (
                        <motion.div
                          key={`selected-${index}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative w-32 h-32 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl shadow-lg flex items-center justify-center text-6xl border-4 border-amber-300 group cursor-pointer"
                          onClick={() => removeCard(index)}
                        >
                          {animals[card.name]}
                          <motion.div
                            className="absolute inset-0 bg-black/0 group-hover:bg-black/60 rounded-xl flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            whileHover={{ opacity: 1 }}
                          >
                            <span className="text-white text-lg font-semibold">
                              {t("remove")}
                            </span>
                          </motion.div>
                        </motion.div>
                      ))}
                      {Array(4 - selectedCards.length)
                        .fill(0)
                        .map((_, index) => (
                          <motion.div
                            key={`empty-${index}`}
                            initial={{
                              scale: 0,
                              boxShadow: "0 0 0px rgba(255, 215, 0, 0)",
                            }}
                            animate={{
                              scale: 1,
                              boxShadow: [
                                "0 0 0px rgba(255, 215, 0, 0)",
                                "0 0 20px rgba(255, 215, 0, 0.8)",
                                "0 0 0px rgba(255, 215, 0, 0)",
                              ],
                            }}
                            transition={{
                              delay: index * 0.1,
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "loop",
                            }}
                            className="w-32 h-32 bg-amber-900/20 rounded-xl shadow-lg flex items-center justify-center text-5xl text-amber-200 border-2 border-amber-700/30"
                          >
                            ?
                          </motion.div>
                        ))}
                    </div>

                    <div className="relative">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
                      <div className="py-10">
                        <h3 className="text-2xl font-semibold text-amber-300 text-center mb-8">
                          {t("availableChoices")}
                        </h3>
                        <div className="grid grid-cols-6 gap-8 w-full max-w-4xl mx-auto">
                          {availableCards.map((card, index) => (
                            <motion.div
                              key={`available-${index}`}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="w-32 h-32 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl shadow-lg flex items-center justify-center text-6xl border-4 border-amber-300 cursor-pointer"
                              onClick={() => selectCard(card, index)}
                            >
                              {animals[card.name]}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-6 w-full mt-10">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={tryAgain}
                      className="px-8 py-4 bg-gradient-to-r from-amber-700 to-amber-600 text-white rounded-full font-semibold text-xl shadow-md hover:shadow-lg"
                    >
                      ↻ {t("tryAgain")}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={checkAnswer}
                      disabled={selectedCards.length < 4}
                      className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full font-semibold text-xl shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      ✓ {t("checkAnswer")}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <AnimatePresence>
            {feedback.message && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className={`fixed bottom-8 left-[45%] transform -translate-x-1/2 p-6 rounded-2xl shadow-xl z-50 ${
                  feedback.isCorrect
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-red-500 to-rose-500"
                }`}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="text-white font-bold text-2xl text-center"
                >
                  {feedback.message}
                  {feedback.isCorrect ? " 🎉" : " 😢"}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      {gameState === "results" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-40"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-200 z-50"
          >
            <h2 className="text-3xl font-bold text-amber-800 text-center mb-8">
              {t("testResults")}
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
                <p className="text-lg text-center text-amber-800">
                  {t("testCompleted")}
                </p>
                <p className="text-lg text-center text-amber-800 font-bold">
                  {t("score")}: {score.correct}/{score.total}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl"
                onClick={saveTestResults}
              >
                {t("finishTest")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {gameState === "feedback" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-40"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-200 z-50"
          >
            <h2 className="text-3xl font-bold text-amber-800 text-center mb-8">
              {t("feedback")}
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
                <p className="text-lg text-center text-amber-800">
                  {feedback.message}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl"
                onClick={tryAgain}
              >
                {t("tryAgain")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {gameState === "end" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center p-4 z-40"
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative max-w-2xl mx-auto bg-gradient-to-br from-amber-100 to-yellow-50 rounded-3xl p-8 shadow-2xl border-4 border-amber-200 z-50"
          >
            <h2 className="text-3xl font-bold text-amber-800 text-center mb-8">
              {t("testCompleted")}
            </h2>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-md border border-amber-100">
                <p className="text-lg text-center text-amber-800">
                  {t("thankYouForPlaying")}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl"
                onClick={onComplete}
              >
                {t("finishTest")}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};
export default Test7;
