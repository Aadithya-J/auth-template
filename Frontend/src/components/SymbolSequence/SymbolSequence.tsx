import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for NodeJS.Timeout issue
type Timeout = ReturnType<typeof setTimeout>;

const symbols = [
  '★', '●', '▲', '■', '♥', '♦', '♣', '♠', '✿', '☀',
  '☁', '☂', '☃', '☎', '☑', '☠', '☢', '☣', '☯', '☺'
];

type DifficultyLevel = {
  name: string;
  sequenceLength: number;
  cardsToShow: number;
  timeToView: number;
};

const difficultyLevels: DifficultyLevel[] = [
  { name: "Easy", sequenceLength: 3, cardsToShow: 6, timeToView: 5000 },
  { name: "Medium", sequenceLength: 4, cardsToShow: 8, timeToView: 5000 },
  { name: "Hard", sequenceLength: 5, cardsToShow: 10, timeToView: 5000 }
];

type GameState = 'welcome' | 'playing' | 'showing' | 'guessing' | 'results' | 'gameOver';

interface SymbolSequenceProps {
  suppressResultPage?: boolean;
  onComplete?: (score: number) => void;
  student?: any;
}

const SymbolSequence: React.FC<SymbolSequenceProps> = ({
  suppressResultPage = false,
  onComplete = null,
  student
}) => {
  const [gameState, setGameState] = useState<GameState>('welcome');
  const [level, setLevel] = useState<number>(0);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [userSequence, setUserSequence] = useState<string[]>([]);
  const [score, setScore] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [timer, setTimer] = useState<Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showingIndex, setShowingIndex] = useState<number>(-1);
  const [confetti, setConfetti] = useState<boolean>(false);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number>(-1);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState !== 'welcome') {
      const gameData = {
        gameState,
        level,
        currentSequence,
        userSequence,
        score,
        currentRound,
        timeLeft,
      };
      localStorage.setItem('symbolSequenceGameState', JSON.stringify(gameData));
    } else {
      // Clear saved state when returning to welcome screen
      localStorage.removeItem('symbolSequenceGameState');
    }
  }, [gameState, level, currentSequence, userSequence, score, currentRound, timeLeft, suppressResultPage, onComplete]);

  // Load game state from localStorage on component mount
  useEffect(() => {
    try {
      console.log("Attempting to load saved game state...");
      const savedGameState = localStorage.getItem('symbolSequenceGameState');
      
      if (savedGameState) {
        console.log("Found saved game state:", savedGameState);
        const gameData = JSON.parse(savedGameState);
        
        // Only restore if not on welcome screen and game was in progress
        if (gameData.gameState && gameData.gameState !== 'welcome') {
          console.log("Restoring game state:", gameData.gameState);
          
          // Restore basic state
          setGameState(gameData.gameState);
          setLevel(gameData.level);
          setScore(gameData.score);
          setCurrentRound(gameData.currentRound);
          setTimeLeft(gameData.timeLeft || 0);
          
          // Restore sequences
          if (Array.isArray(gameData.currentSequence)) {
            setCurrentSequence(gameData.currentSequence);
          }
          
          if (Array.isArray(gameData.userSequence)) {
            setUserSequence(gameData.userSequence);
          }
          
          // If we were in the showing state, we need to restart the timer
          if (gameData.gameState === 'showing') {
            const timeRemaining = Math.max(gameData.timeLeft || 0, 1); // Ensure at least 1 second
            
            const countdown = setInterval(() => {
              setTimeLeft(prev => {
                if (prev <= 0.1) {
                  clearInterval(countdown);
                  return 0;
                }
                return prev - 0.1;
              });
            }, 100);
            
            const timer = setTimeout(() => {
              setGameState('guessing');
              clearInterval(countdown);
              clearTimeout(timer);
            }, timeRemaining * 1000);
            
            setTimer(timer);
          }
        } else {
          console.log("Game was on welcome screen or invalid state, not restoring");
        }
      } else {
        console.log("No saved game state found");
      }
    } catch (error) {
      console.error('Error restoring game state:', error);
      localStorage.removeItem('symbolSequenceGameState');
    }
    
    // Cleanup function
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);  // Empty dependency array means this runs once on mount


  const startGame = (difficulty: number) => {
    // Clear any existing timers when starting a new game
    if (timer) clearTimeout(timer);
    
    setLevel(difficulty);
    setScore(0);
    setCurrentRound(0);
    nextRound(difficulty);
  };

  const nextRound = (difficulty: number) => {
    setGameState('showing');
    setCurrentRound(prev => prev + 1);
    
    // Generate random sequence
    const seq: string[] = [];
    const availableSymbols = [...symbols].sort(() => 0.5 - Math.random());
    for (let i = 0; i < difficultyLevels[difficulty].sequenceLength; i++) {
      seq.push(availableSymbols[i]);
    }
    setCurrentSequence(seq);
    setUserSequence([]);
    setTimeLeft(difficultyLevels[difficulty].timeToView / 1000);
    
    // Countdown timer
    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
    
    // Animated sequence reveal
    setShowingIndex(-1);
    let currentIndex = 0;
    const showNextSymbol = () => {
      if (currentIndex < seq.length) {
        setShowingIndex(currentIndex);
        currentIndex++;
        setTimeout(showNextSymbol, 500);
      } else {
        setShowingIndex(-1); // Reset showing index
      }
    };
    showNextSymbol();
    
    // Show sequence for limited time
    const timer = setTimeout(() => {
      setGameState('guessing');
      clearInterval(countdown);
      clearTimeout(timer);
    }, difficultyLevels[difficulty].timeToView);
    setTimer(timer);
  };

  const selectSymbol = (symbol: string) => {
    if (gameState !== 'guessing') return;
    
    // Add sound effect
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {}); // Catch any autoplay restrictions
    
    setUserSequence(prev => [...prev, symbol]);
    
    // Check if sequence is complete
    if (userSequence.length + 1 === currentSequence.length) {
      checkAnswer([...userSequence, symbol]);
    }
  };

  const removeSymbol = (indexToRemove: number) => {
    if (gameState !== 'guessing') return;
    
    // Play remove sound
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-message-pop-alert-2354.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
    
    setUserSequence(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const checkAnswer = (userSeq: string[]) => {
    if (timer) clearTimeout(timer);
    setTimer(null);

    const isCorrect = JSON.stringify(userSeq) === JSON.stringify(currentSequence);
    // Calculate the score based on the current round's result
    const newScore = isCorrect ? score + 1 : score;

    // Update score immediately - state update might be async, but newScore holds the correct value for this check
    setScore(newScore);
    setFeedback(isCorrect ? 'Correct!' : 'Incorrect. Try again!');
    setGameState('results'); // Show feedback momentarily

    // Set a timer to move to the next step
    const nextStateTimer = setTimeout(() => {
      setFeedback(''); // Clear feedback

      const totalRounds = 10; // Define total rounds
      console.log(`SymbolSequence: checkAnswer timeout. Current Round completed: ${currentRound}, Total Rounds: ${totalRounds}`);

      // Check for Game Over condition (after completing the last round)
      if (currentRound >= totalRounds) {
        console.log("SymbolSequence: Game should end.");

        // If suppressing result page and onComplete is provided, call it immediately
        if (suppressResultPage && typeof onComplete === 'function') {
          console.log(`SymbolSequence: Suppressing results page. Calling onComplete with final score: ${newScore}`);
          onComplete(newScore); // Pass the final score calculated for this last round
          // IMPORTANT: Don't change gameState to 'gameOver' here.
          // Let the parent component handle unmounting or moving to the next test.
          // We can optionally reset some state if the component *might* be reused without unmounting,
          // but usually the unmount handles cleanup.
          // e.g., setGameState('welcome'); setCurrentRound(0); // Probably not needed here
        } else {
          // Otherwise, proceed to the normal game over state (show results page)
          console.log("SymbolSequence: Not suppressing results. Setting gameState to gameOver.");
          setGameState('gameOver');
          // Add confetti only if showing the game over screen and last answer was correct
          if (isCorrect) { // Use the isCorrect flag from the checkAnswer scope
             setConfetti(true);
             setTimeout(() => setConfetti(false), 3000);
          }
        }
      } else {
        // If not game over, proceed to the next round
        console.log("SymbolSequence: Proceeding to next round.");
        nextRound(level); // level state should be correct here
      }
    }, 1500); // Show feedback for 1.5 seconds

    // It's good practice to return a cleanup, though React manages setTimeout cleanup on unmounts.
    // If checkAnswer could be called rapidly, this might be needed, but shouldn't happen here.
    // setTimer(nextStateTimer); // Store the timer if you need to clear it elsewhere explicitly

    // Cleanup function for the timer IF the component unmounts or checkAnswer is somehow re-triggered before timeout
     return () => clearTimeout(nextStateTimer);
  };

  const getAvailableSymbols = () => {
    // First, include all symbols from the current sequence
    const requiredSymbols = [...currentSequence];
    
    // Get remaining random symbols to fill up to the required number
    const remainingSymbols = symbols
      .filter(s => !requiredSymbols.includes(s))
      .sort(() => 0.5 - Math.random());
    
    // Add random symbols until we reach the desired count
    const additionalCount = difficultyLevels[level].cardsToShow - requiredSymbols.length;
    const additionalSymbols = remainingSymbols.slice(0, additionalCount);
    
    // Combine and shuffle all symbols to display
    return [...requiredSymbols, ...additionalSymbols].sort(() => 0.5 - Math.random());
  };

  const quitGame = () => {
    if (timer) clearTimeout(timer);
    setGameState('welcome');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {confetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 100 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              initial={{
                top: "0%",
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'][Math.floor(Math.random() * 6)]
              }}
              animate={{
                top: "100%",
                left: [`${Math.random() * 100}%`, `${Math.random() * 100}%`, `${Math.random() * 100}%`],
                rotate: [0, 360]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                ease: "linear"
              }}
            />
          ))}
        </div>
      )}

      <motion.header 
        className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white py-6 shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1] 
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl font-bold tracking-tight text-white drop-shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
          >
            Symbol Sequence Memory Game
          </motion.h1>
          
          {gameState !== 'welcome' && gameState !== 'gameOver' && (
            <motion.div 
              className="flex justify-center gap-10 mt-6 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <motion.div 
                className="bg-gradient-to-r from-blue-600/30 to-blue-700/30 backdrop-blur-sm px-5 py-2 rounded-full shadow flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-blue-50">Round:</span> 
                <span className="font-bold">{currentRound}/10</span>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-r from-blue-600/30 to-blue-700/30 backdrop-blur-sm px-5 py-2 rounded-full shadow flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-blue-50">Score:</span> 
                <span className="font-bold">{score}</span>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-r from-blue-600/30 to-blue-700/30 backdrop-blur-sm px-5 py-2 rounded-full shadow flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-blue-50">Level:</span> 
                <span className="font-bold">{difficultyLevels[level].name}</span>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.header>

      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {gameState === 'welcome' && (
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 max-w-2xl text-center border border-blue-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold text-blue-700 mb-4">Symbol Sequence Assessment</h2>
                <p className="text-gray-700 mb-8 leading-relaxed">
                  You'll be shown a series of symbols in a specific order. Look at them carefully for 5 seconds. 
                  After they disappear, you'll need to recreate the exact same sequence from memory.
                </p>
              </motion.div>
              
              <motion.div 
                className="mt-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-2xl font-semibold mb-6 text-blue-600">Choose Difficulty:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {difficultyLevels.map((level, index) => (
                    <motion.button
                      key={index}
                      onClick={() => startGame(index)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-5 px-6 rounded-xl shadow-md hover:shadow-xl relative overflow-hidden group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div 
                        className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        initial={false}
                        whileHover={{ scale: 1.5, rotate: 10 }}
                      />
                      <span className="block text-xl font-medium relative z-10">{level.name}</span>
                      <span className="block text-sm opacity-90 mt-2 relative z-10">
                        {level.sequenceLength} symbols, {level.timeToView / 1000}s to view
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === 'showing' && (
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 w-full max-w-3xl text-center border border-blue-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <motion.h2 
                className="text-2xl font-bold text-blue-700 mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Look carefully for 5 seconds:
              </motion.h2>
              
              <div className="flex justify-center flex-wrap gap-6 my-10">
                {currentSequence.map((symbol, index) => (
                  <div
                    key={index}
                    className="w-24 h-24 flex items-center justify-center text-5xl rounded-xl shadow-lg bg-white border-2 border-blue-200 text-blue-800"
                  >
                    {symbol}
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
                    ease: "linear"
                  }}
                />
              </div>
              
              <motion.p 
                className="mt-4 text-blue-600 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Wait until symbols disappear
              </motion.p>
            </motion.div>
          )}

          {gameState === 'guessing' && (
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 w-full max-w-3xl text-center border border-blue-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <motion.h2 
                className="text-2xl font-bold text-blue-700 mb-8"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                Now recreate the exact sequence:
              </motion.h2>
              
              <div className="flex justify-center flex-wrap gap-6 my-10">
                {userSequence.map((symbol, index) => (
                  <motion.div
                    key={index}
                    className="w-24 h-24 flex items-center justify-center text-5xl bg-white border-2 border-blue-200 text-blue-800 rounded-xl shadow-md relative cursor-pointer"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    onHoverStart={() => setHoveredCardIndex(index)}
                    onHoverEnd={() => setHoveredCardIndex(-1)}
                    onClick={() => removeSymbol(index)}
                  >
                    {symbol}
                    {hoveredCardIndex === index && (
                      <motion.div 
                        className="absolute inset-0 bg-blue-800/50 rounded-xl flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className="text-white text-sm font-medium">Remove?</span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                {Array(currentSequence.length - userSequence.length).fill(0).map((_, index) => (
                  <motion.div
                    key={index + userSequence.length}
                    className="w-24 h-24 flex items-center justify-center text-5xl bg-white border-2 border-dashed border-blue-300 rounded-xl"
                    animate={{ 
                      boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 0px 10px rgba(59,130,246,0.5)", "0px 0px 0px rgba(0,0,0,0)"]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                ))}
              </div>

              <motion.h3 
                className="text-xl font-semibold mb-6 text-blue-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Available Symbols:
              </motion.h3>
              
              <div className="flex justify-center flex-wrap gap-4 my-8">
                {getAvailableSymbols().map((symbol, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectSymbol(symbol)}
                    className="w-24 h-24 flex items-center justify-center text-5xl bg-white border-2 border-blue-200 text-blue-800 rounded-xl shadow-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, type: "spring" }}
                  >
                    {symbol}
                  </motion.button>
                ))}
              </div>

              <motion.button
                onClick={quitGame}
                className="mt-8 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-3 px-8 rounded-lg shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Quit Assessment
              </motion.button>
            </motion.div>
          )}

          {gameState === 'results' && (
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 w-full max-w-3xl text-center border border-blue-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <motion.h2 
                className={`text-2xl font-bold mb-6 ${feedback.includes('Correct') ? 'text-green-600' : 'text-red-600'}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring" }}
              >
                {feedback}
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-blue-700">Your sequence:</h3>
                  <div className="flex justify-center flex-wrap gap-3">
                    {userSequence.map((symbol, index) => (
                      <motion.div
                        key={index}
                        className={`w-20 h-20 flex items-center justify-center text-4xl rounded-lg ${
                          symbol === currentSequence[index]
                            ? 'bg-gradient-to-br from-green-200 to-green-300 border-2 border-green-300'
                            : 'bg-gradient-to-br from-red-200 to-red-300 border-2 border-red-300'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 * index, type: "spring" }}
                      >
                        {symbol}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <h3 className="text-xl font-semibold mb-4 text-blue-700">Correct sequence:</h3>
                  <div className="flex justify-center flex-wrap gap-3">
                    {currentSequence.map((symbol, index) => (
                      <motion.div
                        key={index}
                        className="w-20 h-20 flex items-center justify-center text-4xl bg-gradient-to-br from-blue-100 to-blue-300 rounded-lg"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1 * index, type: "spring" }}
                      >
                        {symbol}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {gameState === 'gameOver' && !suppressResultPage && (
            <motion.div 
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-10 max-w-2xl text-center border border-blue-100"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", bounce: 0.4 }}
            >
              <motion.h2 
                className="text-3xl font-bold text-blue-700 mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                Game Complete!
              </motion.h2>
              
              <motion.div
                className="w-40 h-40 mx-auto my-6 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.3, bounce: 0.5 }}
              >
                <span className="text-6xl font-bold text-blue-700">{score}/10</span>
              </motion.div>
              
              <motion.p 
                className="text-xl mb-8 text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Your final score
              </motion.p>
              
              <motion.div 
                className="my-8 text-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {score >= 9 && <p className="text-yellow-500 font-bold"> Excellent memory! </p>}
                {score >= 7 && score < 9 && <p className="text-green-600 font-bold"> Very good job! </p>}
                {score >= 5 && score < 7 && <p className="text-blue-600"> Good effort! </p>}
                {score < 5 && <p className="text-blue-600">Keep practicing to improve!</p>}
              </motion.div>
              
              <motion.button
                onClick={() => setGameState('welcome')}
                className="mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-3 px-10 rounded-lg shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default SymbolSequence;