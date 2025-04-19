import React, { useState, useEffect } from 'react';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { IoClose } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

// Define CSS directly in the component for simplicity if needed, or use external CSS
const styles = `
@keyframes zoomFadeIn {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-zoomFadeIn { animation: zoomFadeIn 0.5s ease-out forwards; }

@keyframes rotateIn {
 0% { opacity: 0; transform: rotate(-15deg) scale(0.9); }
 100% { opacity: 1; transform: rotate(0deg) scale(1); }
}
.animate-rotateIn { animation: rotateIn 0.5s ease-out forwards; }

@keyframes cardFlip {
  0% { transform: rotateY(90deg) scale(0.9); opacity: 0; }
  100% { transform: rotateY(0deg) scale(1); opacity: 1; }
}
.animate-cardFlip {
  transform-style: preserve-3d;
  backface-visibility: hidden;
  animation: cardFlip 0.5s ease-out forwards;
}

@keyframes scaleIn {
  0% { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
.animate-scaleIn { animation: scaleIn 0.5s ease-out forwards; }
`;

const Test7 = ({ suppressResultPage = false, onComplete = null }) => {
  const navigate = useNavigate();

  // Animal emojis
  const animals = {
    fish: '🐟',
    mouse: '🐭',
    rabbit: '🐰',
    frog: '🐸',
    bear: '🐻'
  };

  const sequences = [
    // Pattern 1: Simple alternating
    [{ name: 'fish' }, { name: 'mouse' }, { name: 'fish' }, { name: 'mouse' }],
    // Pattern 2: Double same animal
    [{ name: 'bear' }, { name: 'bear' }, { name: 'fish' }, { name: 'mouse' }],
    // Pattern 3: Alternating with different animals
    [{ name: 'rabbit' }, { name: 'frog' }, { name: 'rabbit' }, { name: 'bear' }],
    // Pattern 4: Mixed sequence
    [{ name: 'mouse' }, { name: 'fish' }, { name: 'bear' }, { name: 'frog' }],
    // Pattern 5: Reverse order
    [{ name: 'frog' }, { name: 'rabbit' }, { name: 'mouse' }, { name: 'fish' }],
    // Pattern 6: All different animals
    [{ name: 'bear' }, { name: 'mouse' }, { name: 'frog' }, { name: 'rabbit' }],
    // Pattern 7: Repeating with different animals
    [{ name: 'fish' }, { name: 'bear' }, { name: 'mouse' }, { name: 'bear' }],
    // Pattern 8: Double same animal in middle
    [{ name: 'rabbit' }, { name: 'rabbit' }, { name: 'frog' }, { name: 'mouse' }],
    // Pattern 9: Same animal at start and end
    [{ name: 'mouse' }, { name: 'fish' }, { name: 'bear' }, { name: 'fish' }], // Corrected last animal
    // Pattern 10: Complex pattern
    [{ name: 'frog' }, { name: 'bear' }, { name: 'rabbit' }, { name: 'mouse' }]
  ];

  const practiceSequence = [
    { name: 'fish' },
    { name: 'mouse' },
    { name: 'fish' },
    { name: 'mouse' }
  ];

  const testItems = sequences;

  // Game state
  const [gameState, setGameState] = useState('welcome');
  const [currentItem, setCurrentItem] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timer, setTimer] = useState(5);
  const [timerProgress, setTimerProgress] = useState(100);
  const [selectedCards, setSelectedCards] = useState([]);
  const [availableCards, setAvailableCards] = useState([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState({ message: '', isCorrect: false });
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  // Initialize available cards (shuffled with some extras)
  const initCards = (sequence) => {
    const allCards = [...sequence];
    // Add 2 extra random cards to make it more challenging
    const animalTypes = Object.keys(animals);
    while (allCards.length < 6) { // Ensure there are always 6 cards total
        const randomAnimal = animalTypes[Math.floor(Math.random() * animalTypes.length)];
        // Add only if it creates exactly 6 cards or to fill up
        if (allCards.length < 6) {
             allCards.push({ name: randomAnimal });
        }
        // Basic duplicate check (optional, could be more robust)
        const counts = {};
        allCards.forEach(card => counts[card.name] = (counts[card.name] || 0) + 1);
        if (Object.values(counts).some(count => count > 3)) { // Avoid too many duplicates
            allCards.pop(); // Remove last added if it creates too many duplicates
        }
    }
     // Ensure exactly 6 cards if loop finished early due to duplicate check
    while (allCards.length < 6) {
        allCards.push({
             name: animalTypes[Math.floor(Math.random() * animalTypes.length)]
        });
    }
    return shuffleArray(allCards.slice(0, 6)); // Ensure exactly 6 and shuffle
  };

  // Shuffle array
  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  // Start practice round
  const startPractice = () => {
    setGameState('practice');
    setCurrentItem(0); // Reset item index for practice
    setScore({ correct: 0, total: 0 }); // Reset score for practice
    setAvailableCards(initCards(practiceSequence));
    setSelectedCards([]);
    setFeedback({ message: '', isCorrect: false });
    showSequence(practiceSequence);
  };

  // Start test
  const startTest = () => {
    setGameState('test');
    setCurrentItem(0);
    setScore({ correct: 0, total: 0 });
    setFeedback({ message: '', isCorrect: false });
    startTestItem(0);
  };

  // Start a test item
  const startTestItem = (index) => {
    // --- *** FIX POINT 1 START *** ---
    if (index >= testItems.length) {
      // Check if we should suppress the result page and call onComplete
      if (suppressResultPage && typeof onComplete === 'function') {
        // Calculate score as percentage or raw correct count as needed
        // Using raw correct count here based on previous results display
        onComplete(score.correct);
        // No need to reset internal state here, as the parent component
        // will typically unmount this component or move to the next test.
        // Resetting might cause issues if the parent expects the state to persist briefly.
        return; // *** CRITICAL: Return here to prevent falling through to setGameState('results')
      } else {
        // Otherwise, go to the internal results page
        setGameState('results');
        return; // Return here as well
      }
    }
    // --- *** FIX POINT 1 END *** ---

    // If not the end of the test, proceed to set up the item
    setAvailableCards(initCards(testItems[index]));
    setSelectedCards([]);
    setFeedback({ message: '', isCorrect: false }); // Clear feedback for new item
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
    let countdown;
    if (showExample && timer > 0) {
      countdown = setTimeout(() => {
        setTimer(timer - 1);
        setTimerProgress((timer - 1) * 20); // Update progress (20% per second)
      }, 1000);
    } else if (showExample && timer === 0) {
      setShowExample(false);
      setShowTimer(false);
      setTimerProgress(100); // Reset progress
    }
    return () => clearTimeout(countdown);
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
    setAvailableCards(shuffleArray([...availableCards, removedCard])); // Reshuffle available
  };

  // Check the answer
  const checkAnswer = () => {
    let isCorrect = true;
    const correctSequence = gameState === 'practice' ? practiceSequence : testItems[currentItem];

    // Check each position
    if (selectedCards.length !== 4) {
        isCorrect = false;
    } else {
        for (let i = 0; i < 4; i++) {
          if (!selectedCards[i] || selectedCards[i].name !== correctSequence[i].name) {
            isCorrect = false;
            break;
          }
        }
    }


    // Update score and show feedback BEFORE the timeout
    let nextScore = score;
    if (isCorrect) {
      setFeedback({ message: "Great job! 🎉", isCorrect: true });
      nextScore = { correct: score.correct + 1, total: score.total + 1 };
      setScore(nextScore);
    } else {
      setFeedback({ message: "Incorrect. Try again or check the next sequence. 👍", isCorrect: false });
      nextScore = { ...score, total: score.total + 1 };
      setScore(nextScore);
    }

    // Move to next item or state AFTER showing feedback
    setTimeout(() => {
      setFeedback({ message: '', isCorrect: false }); // Clear feedback visually

      if (gameState === 'practice') {
        // Practice round finished, move to instructions for the real test
        setGameState('instructions2');
      } else {
        // --- *** FIX POINT 2 START *** ---
        // Always increment item and call startTestItem.
        // startTestItem will handle the logic for the end of the test sequence.
        const nextItemIndex = currentItem + 1;
        setCurrentItem(nextItemIndex); // Update the current item index state
        startTestItem(nextItemIndex); // Let startTestItem decide the next step
        // --- *** FIX POINT 2 END *** ---
      }
    }, 2000); // Keep the 2-second delay to show feedback
  };


  // Reset current item (Try Again button functionality)
  const tryAgain = () => {
      // Reset means showing the sequence again for the *current* item
      const sequenceToShow = gameState === 'practice' ? practiceSequence : testItems[currentItem];
      // Re-initialize cards for the current item
      setAvailableCards(initCards(sequenceToShow));
      setSelectedCards([]); // Clear selection
      setFeedback({ message: '', isCorrect: false }); // Clear feedback
      showSequence(sequenceToShow); // Show the sequence again
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-white font-sans text-blue-900 p-5 flex items-center justify-center relative">
       {/* Inject styles */}
       <style>{styles}</style>

      {/* Info Icon and End Test Button */}
      <div className="absolute top-4 right-4 flex gap-4 z-50">
        <button
          onClick={() => setShowInfoDialog(true)}
          className="p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors duration-300"
          aria-label="Show game information"
        >
          <IoIosInformationCircleOutline className="text-3xl text-blue-600" />
        </button>
        {/* Conditional End Test Button - Removed as parent component handles navigation */}
        {/* {(gameState === 'practice' || gameState === 'test') && (
          <button
            onClick={() => {
              // Decide how to handle "End Test" - maybe call onComplete with current score?
              // Or navigate away using parent's logic if possible.
              // For now, just navigate, but this might need coordination with parent.
               if (typeof onComplete === 'function') {
                   onComplete(score.correct); // Or indicate premature end?
               } else {
                  navigate('/dashboard'); // Fallback if no onComplete
               }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors duration-300 font-semibold"
          >
            End Test
          </button>
        )} */}
      </div>


      {/* Info Dialog */}
      {showInfoDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]"> {/* Ensure high z-index */}
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-[90%] mx-auto shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowInfoDialog(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close information dialog"
            >
              <IoClose className="text-2xl md:text-3xl" />
            </button>

            <h2 className="text-2xl md:text-3xl font-bold text-blue-800 mb-6 text-center">About the Game</h2>

            <div className="space-y-5 md:space-y-6">
              <div className="bg-blue-50 rounded-2xl p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-blue-700 mb-3">How to Play</h3>
                <p className="text-blue-800/90 mb-3 text-sm md:text-base">
                  This is a memory game where you need to remember and recreate sequences of animals.
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-blue-800/90 text-sm md:text-base">
                  <li>Watch the sequence of 4 animals carefully.</li>
                  <li>You have 5 seconds to memorize the order.</li>
                  <li>After the timer, the sequence disappears.</li>
                  <li>Click on the available animal cards below to recreate the sequence in the empty slots above.</li>
                  <li>Click on a selected animal in the top row to remove it if you made a mistake.</li>
                  <li>Click 'Check' when you have placed 4 animals.</li>
                </ol>
              </div>

              <div className="bg-green-50 rounded-2xl p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-green-700 mb-3">Game Structure</h3>
                 <p className="text-green-800/90 text-sm md:text-base">
                    <span className="font-medium">Practice Round:</span> One sequence to get familiar with the game. <br />
                    <span className="font-medium">Main Test:</span> 10 different sequences with varying patterns.
                </p>
              </div>

              <div className="bg-yellow-50 rounded-2xl p-5 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold text-yellow-700 mb-3">Tips for Success</h3>
                <ul className="list-disc list-inside space-y-1.5 text-yellow-800/90 text-sm md:text-base">
                  <li>Focus intensely during the 5-second viewing time.</li>
                  <li>Try to notice any patterns (repeats, alternations).</li>
                  <li>Verbally repeat the sequence to yourself (e.g., "Fish, Mouse, Fish, Mouse").</li>
                  <li>Don't rush placing the cards; double-check the order.</li>
                  <li>Use the 'Try Again' button if you need to see the sequence once more (this restarts the timer for the current item).</li>
                </ul>
              </div>
               <button
                    onClick={() => setShowInfoDialog(false)}
                    className="mt-4 w-full px-6 py-3 bg-blue-600 text-white rounded-full text-base font-semibold shadow-md hover:bg-blue-700 transition-all duration-300"
                >
                    Got it!
                </button>
            </div>
          </div>
        </div>
      )}


      {/* Welcome Screen */}
      {gameState === 'welcome' && (
        <div className="animate-zoomFadeIn max-w-2xl mx-auto text-center space-y-6 md:space-y-8 bg-white/95 rounded-3xl p-6 md:p-10 shadow-xl border border-blue-100">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800">Animal Sequence Game</h1>
          <p className="text-base md:text-lg text-gray-700 max-w-md mx-auto">
             Test your visual memory! Watch the animal sequence, then recreate it.
          </p>
          {/* Simple icon display */}
          <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
            {Object.values(animals).map((animal, index) => (
              <div key={index} className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-md flex items-center justify-center text-3xl md:text-4xl border border-blue-200">
                {animal}
              </div>
            ))}
          </div>
          <button onClick={() => setGameState('instructions')}
                  className="px-8 py-3 md:px-10 md:py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            Let's Play!
          </button>
        </div>
      )}

      {/* Instructions Screen 1 */}
      {gameState === 'instructions' && (
        <div className="animate-rotateIn max-w-2xl mx-auto bg-white/95 rounded-3xl p-6 md:p-10 shadow-xl border border-blue-100">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800 text-center mb-6 md:mb-8">How to Play</h2>
          <div className="space-y-5 md:space-y-6">
             {/* Step 1 */}
             <div className="bg-blue-50 rounded-2xl p-4 md:p-5 shadow-sm border border-blue-100">
                 <div className="flex items-center gap-3 md:gap-4 mb-3">
                     <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">1</div>
                     <p className="text-base md:text-lg text-blue-800/90">Watch the sequence of animals.</p>
                 </div>
                 <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
                     {[animals.fish, animals.mouse, animals.frog, animals.bear].map((animal, index) => (
                     <div key={index} className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl md:text-3xl border border-gray-200">
                         {animal}
                     </div>
                     ))}
                 </div>
             </div>

             {/* Step 2 */}
             <div className="bg-blue-50 rounded-2xl p-4 md:p-5 shadow-sm border border-blue-100">
                 <div className="flex items-center gap-3 md:gap-4 mb-3">
                     <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">2</div>
                     <p className="text-base md:text-lg text-blue-800/90">Remember the order for 5 seconds!</p>
                 </div>
                 <div className="flex justify-center">
                    {/* Simple Timer Icon */}
                    <div className="relative w-14 h-14 md:w-16 md:h-16">
                         <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path className="text-gray-200" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="text-blue-500" strokeWidth="3" strokeLinecap="round" fill="none"
                                strokeDasharray="100, 100"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl md:text-2xl font-bold text-blue-600">5s</span>
                        </div>
                    </div>
                 </div>
             </div>

             {/* Step 3 */}
             <div className="bg-blue-50 rounded-2xl p-4 md:p-5 shadow-sm border border-blue-100">
                 <div className="flex items-center gap-3 md:gap-4 mb-3">
                     <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">3</div>
                     <p className="text-base md:text-lg text-blue-800/90">Click the cards below to recreate the sequence.</p>
                 </div>
                 {/* Placeholder for selection area */}
                  <div className="flex justify-center gap-3 md:gap-4 mb-4 flex-wrap">
                      {Array(4).fill(0).map((_, index) => (
                          <div key={index} className="w-14 h-14 md:w-16 md:h-16 bg-gray-200 rounded-xl shadow-inner flex items-center justify-center text-2xl md:text-3xl text-gray-400 border border-gray-300">
                              ?
                          </div>
                      ))}
                  </div>
                  {/* Placeholder for available cards */}
                   <div className="flex justify-center gap-3 md:gap-4 flex-wrap opacity-60">
                        {[animals.rabbit, animals.fish, animals.mouse, animals.frog, animals.bear, animals.rabbit].map((animal, index) => (
                         <div key={index} className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl shadow-md flex items-center justify-center text-2xl md:text-3xl border border-gray-200 cursor-pointer">
                            {animal}
                        </div>
                        ))}
                    </div>
             </div>
         </div>


          <button
            className="mt-6 md:mt-8 w-full px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={startPractice}
          >
            Start Practice Round
          </button>
        </div>
      )}

      {/* Instructions Screen 2 (Before Test) */}
      {gameState === 'instructions2' && (
        <div className="animate-rotateIn max-w-xl mx-auto bg-white/95 rounded-3xl p-6 md:p-10 shadow-xl border border-blue-100">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800 text-center mb-6">Ready for the Real Test?</h2>
          <div className="space-y-5">
            <div className="bg-green-50 rounded-2xl p-5 shadow-sm border border-green-100 text-center">
              <p className="text-base md:text-lg text-green-800/90">
                 Great job on the practice! <br/> Now you'll face 10 sequences. Try your best to remember each one.
              </p>
            </div>
            <button
              className="w-full px-8 py-3 md:py-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={startTest}
            >
              Start Test
            </button>
          </div>
        </div>
      )}

      {/* Practice or Test Screen */}
       {(gameState === 'practice' || gameState === 'test') && (
            <div className="flex flex-col items-center w-full max-w-4xl relative"> {/* Container for positioning feedback */}
              <style>
                {`
                  @keyframes slideInDown {
                    0% { opacity: 0; transform: translate(-50%, -20px); }
                    100% { opacity: 1; transform: translate(-50%, 0); }
                  }
                  .feedback-animation {
                    position: absolute; /* Position relative to the parent */
                    top: calc(100% + 1rem); /* Position below the card */
                    left: 50%;
                    transform: translateX(-50%);
                    width: calc(100% - 1rem); /* Slightly narrower than the card */
                    max-width: 500px; /* Max width for feedback */
                    animation: slideInDown 0.4s ease-out forwards;
                    z-index: 20; /* Ensure feedback is above other elements if needed */
                  }
                `}
              </style>
                <div className="w-full bg-white/95 rounded-3xl p-5 md:p-8 shadow-2xl border border-blue-100 mb-4"> {/* Card container */}
                    {/* Header */}
                    <div className="flex justify-between items-center mb-5 md:mb-6 pb-3 border-b border-blue-100">
                        <h2 className="text-xl md:text-2xl font-bold text-blue-800">
                        {gameState === 'practice' ? 'Practice Round' : `Sequence ${currentItem + 1} / ${testItems.length}`}
                        </h2>
                        {gameState === 'test' && (
                            <div className="px-4 py-1.5 md:px-5 md:py-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full text-white text-sm md:text-base font-semibold shadow-md whitespace-nowrap">
                                Score: {score.correct} / {score.total}
                            </div>
                        )}
                    </div>

                    {/* Content Area */}
                    <div className="min-h-[380px] md:min-h-[420px] w-full flex flex-col justify-center"> {/* Adjusted min-height */}
                        {showExample ? (
                            /* Showing Sequence View */
                            <div className="flex flex-col items-center justify-center text-center h-full animate-fadeIn">
                                <h3 className="text-lg md:text-xl font-semibold text-blue-700 mb-5 md:mb-6">Remember this sequence:</h3>
                                <div className="flex justify-center gap-3 md:gap-5 flex-wrap mb-6 md:mb-8">
                                {(gameState === 'practice' ? practiceSequence : testItems[currentItem]).map((animal, index) => (
                                    <div
                                    key={`example-${index}`}
                                    className="animate-cardFlip"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                    <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-xl shadow-lg flex items-center justify-center text-4xl md:text-5xl border border-blue-100">
                                        {animals[animal.name]}
                                    </div>
                                    </div>
                                ))}
                                </div>
                                {showTimer && (
                                <div className="relative w-14 h-14 md:w-16 md:h-16">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                        <circle className="text-gray-200" strokeWidth="3" stroke="currentColor" fill="transparent" r="15.9155" cx="18" cy="18" />
                                        <circle className="text-blue-500" strokeWidth="3" strokeDasharray={`${timerProgress}, 100`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="15.9155" cx="18" cy="18" />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg md:text-xl font-bold text-blue-600">
                                        {timer}
                                    </span>
                                    </div>
                                </div>
                                )}
                            </div>
                        ) : (
                            /* Recreating Sequence View */
                            <div className="flex flex-col justify-between h-full animate-fadeIn">
                                <div className="space-y-6 md:space-y-8 flex-grow">
                                    {/* Selected Cards Area */}
                                    <div>
                                        <h3 className="text-center text-base md:text-lg font-semibold text-blue-700 mb-3 md:mb-4">Recreate the sequence here:</h3>
                                         <div className="grid grid-cols-4 gap-3 md:gap-5 w-full max-w-xl mx-auto mb-6 md:mb-8 min-h-[6rem] md:min-h-[7rem]">
                                            {selectedCards.map((card, index) => (
                                                <div
                                                    key={`selected-${index}`}
                                                    className="relative w-full aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg flex items-center justify-center text-4xl md:text-5xl transform hover:scale-105 transition-all duration-200 group cursor-pointer border-2 border-blue-200"
                                                    onClick={() => removeCard(index)}
                                                >
                                                    {animals[card.name]}
                                                    {/* Remove overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 rounded-xl transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                                        <IoClose className="text-white text-3xl" />
                                                    </div>
                                                </div>
                                            ))}
                                            {Array(4 - selectedCards.length).fill(0).map((_, index) => (
                                                <div key={`empty-${index}`} className="w-full aspect-square bg-gray-200/80 rounded-xl shadow-inner flex items-center justify-center text-3xl md:text-4xl text-gray-400 border border-dashed border-gray-400">
                                                    ?
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Available Cards Area */}
                                    <div className="relative pt-6 md:pt-8 border-t border-blue-100">
                                        <h3 className="text-center text-base md:text-lg font-semibold text-blue-700 mb-3 md:mb-4">Click to choose:</h3>
                                         <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-5 w-full max-w-2xl mx-auto">
                                            {availableCards.map((card, index) => (
                                                <button // Use button for better accessibility
                                                    key={`available-${index}`}
                                                    className="w-full aspect-square bg-white rounded-xl shadow-lg flex items-center justify-center text-4xl md:text-5xl transform hover:scale-105 hover:shadow-xl hover:border-2 hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
                                                    onClick={() => selectCard(card, index)}
                                                    disabled={selectedCards.length >= 4} // Disable adding more when full
                                                    aria-label={`Select ${card.name}`}
                                                >
                                                    {animals[card.name]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-4 mt-6 md:mt-8 pt-4 border-t border-blue-100">
                                <button onClick={tryAgain}
                                        className="px-5 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 rounded-full font-semibold shadow-md hover:shadow-lg hover:from-yellow-200 hover:to-yellow-300 transition-all duration-300 text-sm md:text-base flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.51A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.51-1.276z" clipRule="evenodd" />
                                    </svg>
                                    Retry View
                                </button>
                                <button onClick={checkAnswer}
                                        disabled={selectedCards.length !== 4 || !!feedback.message} // Disable if not 4 cards selected or feedback is showing
                                        className="px-5 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 text-sm md:text-base flex items-center gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                    Check
                                </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                 {/* Feedback Message Area - Positioned Absolutely */}
                 {feedback.message && (
                    <div className={`p-3 md:p-4 rounded-xl text-white text-center font-semibold text-base md:text-lg feedback-animation shadow-lg ${
                    feedback.isCorrect ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                    }`}>
                    {feedback.message}
                    </div>
                )}
            </div>
        )}


      {/* Results Screen (Only shown if suppressResultPage is false) */}
      {gameState === 'results' && !suppressResultPage && (
        <div className="animate-scaleIn max-w-xl mx-auto text-center space-y-6 md:space-y-8 bg-white/95 rounded-3xl p-6 md:p-10 shadow-xl border border-blue-100">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800">Game Complete!</h2>
          <div className="text-lg md:text-xl font-semibold text-blue-700">
            Final Score: {score.correct} out of {score.total} correct!
          </div>
          {/* Star Rating - Simple Example */}
           <div className="flex justify-center gap-1 text-3xl md:text-4xl">
                {score.total > 0 && Array(5).fill(0).map((_, i) => (
                <span key={`star-${i}`} className={i < Math.round((score.correct / score.total) * 5) ? 'text-yellow-400' : 'text-gray-300'}>
                    ⭐
                </span>
                ))}
                {score.total === 0 && Array(5).fill(0).map((_, i) => ( // Handle division by zero if no rounds played
                     <span key={`star-empty-${i}`} className='text-gray-300'>⭐</span>
                ))}
            </div>
          <div className="text-base md:text-lg text-blue-600/90">
             {score.total === 0 ? "No rounds were played." :
              score.correct / score.total >= 0.8 ? "Excellent memory! 🎉 You're a sequence master!" :
              score.correct / score.total >= 0.5 ? "Good job! You've got a solid memory. 👍" :
              score.correct / score.total > 0 ? "Nice try! Keep practicing to improve. 😊" :
              "Keep practicing to improve your memory skills! 😊"}
          </div>
          <button
            className="px-8 py-3 md:py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            onClick={() => {
              // Reset state for a potential new game within this component
              setGameState('welcome');
              setScore({ correct: 0, total: 0 });
              setCurrentItem(0);
              setSelectedCards([]);
              setAvailableCards([]);
              setFeedback({ message: '', isCorrect: false });
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Test7;