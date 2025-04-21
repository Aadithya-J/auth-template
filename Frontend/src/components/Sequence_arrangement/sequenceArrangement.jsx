import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { backendURL } from "../../definedURL";

const Test7 = () => {
  const navigate = useNavigate();

  // Animal emojis
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
      setFeedback({ message: "Great job! 🎉", isCorrect: true });
      setScore({ correct: score.correct + 1, total: score.total + 1 });
    } else {
      setFeedback({ message: "Let's try again! 👍", isCorrect: false });
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
      // Show success message to user
      alert("Results saved successfully!");
    } catch (error) {
      console.error("Error saving test results:", error);
      // Show error message to user
      alert("Failed to save results. Please try again.");
    }
  };
  return (
    <div className="h-screen w-full overflow-y-auto bg-gradient-to-br from-blue-50 to-white font-montserrat text-blue-900 p-5">
      {/* Info Icon and End Test Button */}

      <div className="absolute top-4 right-4 flex gap-4 z-50">
        <button
          onClick={() => setShowInfoDialog(true)}
          className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors duration-300"
        >
          <IoIosInformationCircleOutline className="text-3xl text-blue-600" />
        </button>
        {(gameState === "practice" || gameState === "test") && (
          <button
            onClick={() => {
              navigate("/test9");
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors duration-300 font-semibold"
          >
            End Test
          </button>
        )}
      </div>

      {/* Info Dialog */}
      {showInfoDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl relative">
            <button
              onClick={() => setShowInfoDialog(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <IoClose className="text-2xl" />
            </button>

            <h2 className="text-3xl font-bold text-blue-800 mb-6">
              About the Game
            </h2>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-blue-700 mb-4">
                  How to Play
                </h3>
                <p className="text-blue-800 mb-4">
                  This is a memory game where you need to remember and recreate
                  sequences of animals. Here's how it works:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-blue-800">
                  <li>Watch the sequence of animals carefully</li>
                  <li>Remember the order of the animals</li>
                  <li>Recreate the same sequence using the available cards</li>
                  <li>You have 5 seconds to memorize each sequence</li>
                </ol>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-blue-700 mb-4">
                  Game Structure
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-blue-800">
                      Practice Round
                    </h4>
                    <p className="text-blue-800">
                      One simple sequence to get familiar with the game
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">Main Test</h4>
                    <p className="text-blue-800">
                      10 different sequences with varying difficulty
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-blue-700 mb-4">
                  Tips
                </h3>
                <ul className="list-disc list-inside space-y-2 text-blue-800">
                  <li>Focus on the order of the animals</li>
                  <li>Look for patterns in the sequences</li>
                  <li>Take your time to arrange the cards correctly</li>
                  <li>You can remove and rearrange cards if needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {gameState === "welcome" && (
        <div className="animate-zoomFadeIn max-w-2xl mx-auto text-center space-y-8 bg-white/90 rounded-3xl p-8 shadow-xl">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-blue-800">
              Animal Sequence Game
            </h1>
            <p className="text-sm text-gray-800 max-w-lg mx-auto">
              Match the sequence first shown to the next one and test your
              memory.
            </p>
          </div>
          <style>
            {`
              @keyframes slideInfinite {
                0% {
                  transform: translateX(0);
                }
                100% {
                  transform: translateX(-50%);
                }
              }
              .slide-animation {
                animation: slideInfinite 20s linear infinite;
                display: flex;
                gap: 8px;
                width: 200%;
                transform-origin: left center;
              }
              .slide-animation:hover {
                animation-play-state: paused;
              }
              .fade-edges {
                position: relative;
              }
              .fade-edges::before,
              .fade-edges::after {
                content: '';
                position: absolute;
                top: 0;
                bottom: 0;
                width: 30px;
                pointer-events: none;
                z-index: 10;
              }
              .fade-edges::before {
                left: 0;
                background: linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 100%);
              }
              .fade-edges::after {
                right: 0;
                background: linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0) 100%);
              }
            `}
          </style>
          <div className="relative overflow-hidden h-32 fade-edges">
            <div className="absolute top-0 left-0 slide-animation">
              {Object.values(animals).map((animal, index) => (
                <div
                  key={index}
                  className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-lg flex items-center justify-center text-3xl transform hover:scale-1.01 transition-transform duration-300 border-2 border-blue-200 hover:border-blue-400"
                >
                  {animal}
                </div>
              ))}
              {/* Duplicate the animals for seamless animation */}
              {Object.values(animals).map((animal, index) => (
                <div
                  key={`dup-${index}`}
                  className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-lg flex items-center justify-center text-3xl transform hover:scale-105 transition-transform duration-300 border-2 border-blue-200 hover:border-blue-400"
                >
                  {animal}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => setGameState("instructions")}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Let's Play!
          </button>
        </div>
      )}

      {gameState === "instructions" && (
        <div className="animate-rotateIn max-w-2xl mx-auto bg-white/90 rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-blue-800 text-center mb-8">
            How to Play
          </h2>
          <div className="space-y-8">
            <div className="bg-blue-50 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <p className="text-lg text-blue-800">
                  I'll show you some animals in order
                </p>
              </div>
              <div className="flex justify-center gap-4">
                {[animals.fish, animals.mouse, animals.fish].map(
                  (animal, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl"
                    >
                      {animal}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <p className="text-lg text-blue-800">
                  Then you recreate the same order
                </p>
              </div>
              <div className="flex justify-center gap-4">
                {[animals.fish, animals.mouse, animals.fish, animals.mouse].map(
                  (animal, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl"
                    >
                      {animal}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-2xl p-6 shadow-md">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <p className="text-lg text-blue-800">
                  Watch carefully - you'll only see them for 5 seconds!
                </p>
              </div>
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full flex items-center justify-center text-2xl text-white font-bold shadow-lg">
                  5
                </div>
              </div>
            </div>
          </div>

          <button
            className="mt-8 w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
            onClick={startPractice}
          >
            Start Practice Round
          </button>
        </div>
      )}

      {gameState === "instructions2" && (
        <div className="animate-rotateIn max-w-2xl mx-auto bg-white/90 rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-blue-800 text-center mb-8">
            Ready for the Test?
          </h2>
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-2xl p-6 shadow-md">
              <p className="text-lg text-blue-800 text-center">
                You'll now see 10 different sequences. Try to remember and match
                each one correctly!
              </p>
            </div>
            <button
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              onClick={startTest}
            >
              Start Test
            </button>
          </div>
        </div>
      )}

      {(gameState === "practice" || gameState === "test") && (
        <div className="flex flex-col items-center min-h-[600px] relative">
          <style>
            {`
              @keyframes slideIn {
                0% {
                  opacity: 0;
                  transform: translate(-50%, -20px);
                }
                100% {
                  opacity: 1;
                  transform: translate(-50%, 0);
                }
              }
              .feedback-animation {
                animation: slideIn 0.5s ease-out forwards;
              }
            `}
          </style>
          <div className="max-w-4xl w-full mx-auto bg-white/95 rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-blue-800">
                {gameState === "practice"
                  ? "Practice Round"
                  : `Round ${currentItem + 1} of 10`}
              </h2>
              <div className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full text-white font-semibold shadow-md">
                ⭐ {score.correct}/{score.total}
              </div>
            </div>

            <div className="h-[450px] w-full flex flex-col justify-between">
              {showExample ? (
                <div className="w-full">
                  <div className="space-y-4 w-full">
                    <div className="flex flex-col mt-20 items-center w-full">
                      <h3 className="text-2xl font-bold text-blue-800 mb-8">
                        Remember this sequence:
                      </h3>
                      <div className="flex justify-center gap-6 w-full">
                        {(gameState === "practice"
                          ? practiceSequence
                          : testItems[currentItem]
                        ).map((animal, index) => (
                          <div
                            key={`example-${index}`}
                            className="animate-cardFlip"
                            style={{ animationDelay: `${index * 0.15}s` }}
                          >
                            <div className="w-28 h-28 cursor-pointer hover:scale-105 hover:border-blue-600 transition-all duration-300 bg-white rounded-xl shadow-lg flex items-center justify-center text-5xl">
                              {animals[animal.name]}
                            </div>
                          </div>
                        ))}
                      </div>
                      {showTimer && (
                        <div className="relative w-16 h-16 mt-8">
                          <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `conic-gradient(
                                #3b82f6 ${timerProgress * 3.6}deg,
                                transparent ${timerProgress * 3.6}deg
                              )`,
                            }}
                          ></div>
                          <div className="absolute inset-1 rounded-full bg-white flex items-center justify-center">
                            <span className="text-xl font-bold text-blue-600">
                              {timer}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="space-y-6 w-full">
                    <div className="space-y-8 w-full">
                      <div className="grid grid-cols-4 gap-6 w-full max-w-2xl mx-auto mb-12">
                        {selectedCards.map((card, index) => (
                          <div
                            key={`selected-${index}`}
                            className="relative w-28 h-28 bg-white rounded-xl shadow-lg flex items-center justify-center text-5xl transform hover:scale-110 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                            onClick={() => removeCard(index)}
                            style={{ animationDelay: `${index * 0.1}s` }}
                          >
                            {animals[card.name]}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 rounded-xl transition-all duration-300"></div>
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <span className="text-white text-base font-semibold">
                                Remove?
                              </span>
                            </div>
                          </div>
                        ))}
                        {Array(4 - selectedCards.length)
                          .fill(0)
                          .map((_, index) => (
                            <div
                              key={`empty-${index}`}
                              className="w-28 h-28 bg-gray-200 rounded-xl shadow-lg flex items-center justify-center text-4xl"
                            >
                              ?
                            </div>
                          ))}
                      </div>

                      <div className="relative">
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
                        <div className="py-8">
                          <h3 className="text-lg font-semibold text-blue-700 text-center mb-6">
                            Available Choices
                          </h3>
                          <div className="grid grid-cols-6 gap-6 w-full max-w-3xl mx-auto">
                            {availableCards.map((card, index) => (
                              <div
                                key={`available-${index}`}
                                className="w-28 h-28 bg-white rounded-xl shadow-lg flex items-center justify-center text-5xl transform hover:scale-110 hover:shadow-xl hover:border-2 hover:border-blue-400 transition-all duration-300"
                                onClick={() => selectCard(card, index)}
                                style={{ animationDelay: `${index * 0.1}s` }}
                              >
                                {animals[card.name]}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center gap-4 w-full">
                      <button
                        onClick={tryAgain}
                        className="px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        ↻ Try Again
                      </button>
                      <button
                        onClick={checkAnswer}
                        disabled={selectedCards.length < 4}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-300"
                      >
                        ✓ Check
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {feedback.message && (
            <div
              className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-4 p-4 rounded-xl text-white text-center font-semibold text-xl w-full max-w-4xl feedback-animation ${
                feedback.isCorrect
                  ? "bg-gradient-to-r from-blue-500 to-blue-400"
                  : "bg-gradient-to-r from-red-500 to-red-400"
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>
      )}

      {gameState === "results" && (
        <div className="animate-scaleIn max-w-2xl mx-auto text-center space-y-8 bg-white/90 rounded-3xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-blue-800">Game Complete!</h2>
          <div className="text-xl font-semibold text-blue-700">
            You got {score.correct} out of {score.total} correct!
          </div>
          <div className="flex justify-center gap-2">
            {Array(Math.round((score.correct / score.total) * 5))
              .fill(0)
              .map((_, i) => (
                <span key={`star-${i}`} className="text-3xl text-yellow-400">
                  ⭐
                </span>
              ))}
          </div>
          <div className="text-lg text-blue-600">
            {score.correct / score.total > 0.7
              ? "Awesome memory! 🎉"
              : score.correct / score.total > 0.4
              ? "Good job! 👍"
              : "Nice try! 😊"}
          </div>
          <div className="flex gap-4 justify-center">
            <button
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              onClick={() => {
                saveTestResults();
              }}
            >
              Finish and Save Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Test7;
