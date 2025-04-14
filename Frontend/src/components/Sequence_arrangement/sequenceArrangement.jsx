// import React, { useState, useEffect } from 'react';
// // import { button } from '@/components/ui/button';
// import { Card } from '../ui/Card.jsx';
// import { CardContent } from '../ui/CardContent.jsx';

// import { Progress } from '../ui/CardContent.jsx';
// import { motion } from 'framer-motion';

// const cuteEmojis = {
//   fish: '🐟',
//   mouse: '🐭'
// };

// const Test7 = () => {
//   const practiceItems = [
//     { id: 1, name: 'fish', orientation: 'left' },
//     { id: 2, name: 'fish', orientation: 'right' },
//     { id: 3, name: 'mouse', orientation: 'left' },
//     { id: 4, name: 'mouse', orientation: 'right' }
//   ];

//   const testItems = [
//     {
//       id: 1,
//       correctSequence: [
//         { id: 1, name: 'fish', orientation: 'left' },
//         { id: 3, name: 'mouse', orientation: 'left' },
//         { id: 2, name: 'fish', orientation: 'right' },
//         { id: 4, name: 'mouse', orientation: 'right' }
//       ]
//     }
//     // Add more test items here
//   ];

//   const [phase, setPhase] = useState('instructions');
//   const [index, setIndex] = useState(0);
//   const [showCards, setShowCards] = useState(false);
//   const [selections, setSelections] = useState([]);
//   const [feedback, setFeedback] = useState('');
//   const [timer, setTimer] = useState(5);
//   const [score, setScore] = useState({ sequence: 0, orientation: 0, total: 0 });

//   useEffect(() => {
//     if (showCards && timer > 0) {
//       const countdown = setTimeout(() => setTimer(timer - 1), 1000);
//       return () => clearTimeout(countdown);
//     } else if (showCards && timer === 0) {
//       setShowCards(false);
//       setTimer(5);
//     }
//   }, [showCards, timer]);

//   const handleSelect = (card) => {
//     if (selections.length < 4 && !selections.includes(card)) {
//       setSelections([...selections, card]);
//     }
//   };

//   const reset = () => setSelections([]);

//   const check = () => {
//     const current = testItems[index];
//     let seqErr = 0;
//     let oriErr = 0;

//     for (let i = 0; i < 4; i++) {
//       if (selections[i]?.name !== current.correctSequence[i].name) seqErr++;
//       if (selections[i]?.orientation !== current.correctSequence[i].orientation) oriErr++;
//     }

//     const itemScore = Math.max(0, 2 - (seqErr > 0 ? 1 : 0) - (oriErr > 0 ? 1 : 0));
//     setScore(prev => ({
//       sequence: prev.sequence + (seqErr > 0 ? 0 : 1),
//       orientation: prev.orientation + (oriErr > 0 ? 0 : 1),
//       total: prev.total + itemScore
//     }));

//     setFeedback(seqErr === 0 && oriErr === 0 ? '🎉 Great job!' : '🤔 Let’s try again!');

//     if (index < testItems.length - 1) {
//       setTimeout(() => {
//         setIndex(index + 1);
//         setSelections([]);
//         setShowCards(true);
//         setFeedback('');
//       }, 2000);
//     } else {
//       setTimeout(() => setPhase('completed'), 2000);
//     }
//   };

//   return (
//     <div className="p-6 max-w-xl mx-auto text-center">
//       <h2 className="text-3xl font-bold mb-4 text-pink-600">🎮 Sequence Arrangement Game</h2>

//       {phase === 'instructions' && (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//           <p className="text-lg mb-4">Let's play a fun memory game! 👀✨</p>
//           <p className="mb-4">Look at the pictures, remember the order and which way they’re facing. Then, make it just like mine!</p>
//           <button onClick={() => { setPhase('test'); setShowCards(true); }} className="bg-pink-500 hover:bg-pink-600">Start Game</button>
//         </motion.div>
//       )}

//       {phase === 'test' && (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//           <h3 className="text-xl mb-2">Test {index + 1} of {testItems.length}</h3>

//           {showCards ? (
//             <div className="mb-4">
//               <p className="text-md">Watch closely! ⏳ ({timer}s)</p>
//               <div className="flex justify-center gap-4 mt-2">
//                 {testItems[index].correctSequence.map((card, i) => (
//                   <Card key={i} className="p-3 text-3xl">
//                     <CardContent>{card.orientation === 'left' ? '⬅️' : '➡️'} {cuteEmojis[card.name]}</CardContent>
//                   </Card>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               <p className="text-md">Now you do it! 🎯</p>
//               <div className="flex justify-center gap-4 flex-wrap">
//                 {practiceItems.map((card, i) => (
//                   <button key={i} onClick={() => handleSelect(card)} disabled={selections.includes(card)} className="text-2xl">
//                     {card.orientation === 'left' ? '⬅️' : '➡️'} {cuteEmojis[card.name]}
//                   </button>
//                 ))}
//               </div>

//               <div className="flex justify-center gap-4 mt-4">
//                 {selections.map((card, i) => (
//                   <Card key={i} className="p-3 text-3xl">
//                     <CardContent>{card.orientation === 'left' ? '⬅️' : '➡️'} {cuteEmojis[card.name]}</CardContent>
//                   </Card>
//                 ))}
//               </div>

//               <div className="mt-4 flex justify-center gap-4">
//                 <button onClick={reset} className="bg-yellow-400 hover:bg-yellow-500">Reset</button>
//                 <button onClick={check} disabled={selections.length < 4} className="bg-green-500 hover:bg-green-600">Check</button>
//               </div>
//               <p className="text-xl mt-2">{feedback}</p>
//             </div>
//           )}

//           <Progress value={((index + 1) / testItems.length) * 100} className="mt-4" />
//         </motion.div>
//       )}

//       {phase === 'completed' && (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//           <h3 className="text-2xl font-bold mb-2">🏁 All Done!</h3>
//           <p className="text-lg">Sequence Score: {score.sequence} / {testItems.length}</p>
//           <p className="text-lg">Orientation Score: {score.orientation} / {testItems.length}</p>
//           <p className="text-lg">Total Score: {score.total} / {testItems.length * 2}</p>
//         </motion.div>
//       )}
//     </div>
//   );
// };

// export default Test7;




import React, { useState, useEffect } from 'react';
import './sequenceArrangement.css';

const Test7 = () => {
  // Animal emojis
  const animals = {
    fish: '🐟',
    mouse: '🐭',
    rabbit: '🐰',
    frog: '🐸',
    bear: '🐻'
  };

  // Practice sequence
  const practiceSequence = [
    { name: 'fish' },
    { name: 'mouse' },
    { name: 'fish' },
    { name: 'mouse' }
  ];

  // Test items (10 items with correct sequences)
  const testItems = [
    // Item 1
    [
      { name: 'fish' },
      { name: 'mouse' },
      { name: 'fish' },
      { name: 'mouse' }
    ],
    // Item 2
    [
      { name: 'mouse' },
      { name: 'fish' },
      { name: 'mouse' },
      { name: 'fish' }
    ],
    // Item 3
    [
      { name: 'rabbit' },
      { name: 'frog' },
      { name: 'rabbit' },
      { name: 'frog' }
    ],
    // Item 4
    [
      { name: 'bear' },
      { name: 'mouse' },
      { name: 'bear' },
      { name: 'mouse' }
    ],
    // Item 5
    [
      { name: 'frog' },
      { name: 'frog' },
      { name: 'rabbit' },
      { name: 'rabbit' }
    ],
    // Item 6
    [
      { name: 'fish' },
      { name: 'rabbit' },
      { name: 'mouse' },
      { name: 'frog' }
    ],
    // Item 7
    [
      { name: 'bear' },
      { name: 'bear' },
      { name: 'bear' },
      { name: 'mouse' }
    ],
    // Item 8
    [
      { name: 'frog' },
      { name: 'mouse' },
      { name: 'frog' },
      { name: 'mouse' }
    ],
    // Item 9
    [
      { name: 'rabbit' },
      { name: 'fish' },
      { name: 'rabbit' },
      { name: 'fish' }
    ],
    // Item 10
    [
      { name: 'mouse' },
      { name: 'frog' },
      { name: 'bear' },
      { name: 'rabbit' }
    ]
  ];

  // Game state
  const [gameState, setGameState] = useState('welcome');
  const [currentItem, setCurrentItem] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const [timer, setTimer] = useState(5);
  const [selectedCards, setSelectedCards] = useState([]);
  const [availableCards, setAvailableCards] = useState([]);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [feedback, setFeedback] = useState({ message: '', isCorrect: false });

  // Initialize available cards (shuffled with some extras)
  const initCards = (sequence) => {
    const allCards = [...sequence];
    // Add 2 extra random cards to make it more challenging
    const animalTypes = Object.keys(animals);
    for (let i = 0; i < 2; i++) {
      allCards.push({
        name: animalTypes[Math.floor(Math.random() * animalTypes.length)]
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
    setGameState('practice');
    setAvailableCards(initCards(practiceSequence));
    setSelectedCards([]);
    showSequence(practiceSequence);
  };

  // Start test
  const startTest = () => {
    setGameState('test');
    setCurrentItem(0);
    startTestItem(0);
  };

  // Start a test item
  const startTestItem = (index) => {
    setAvailableCards(initCards(testItems[index]));
    setSelectedCards([]);
    showSequence(testItems[index]);
  };

  // Show the sequence to remember
  const showSequence = (sequence) => {
    setShowExample(true);
    setTimer(5);
  };

  // Timer effect
  useEffect(() => {
    if (showExample && timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    } else if (showExample && timer === 0) {
      setShowExample(false);
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
    const correctSequence = gameState === 'practice' ? practiceSequence : testItems[currentItem];
    
    // Check each position
    for (let i = 0; i < 4; i++) {
      if (!selectedCards[i] || selectedCards[i].name !== correctSequence[i].name) {
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

    // Move to next item or show results
    setTimeout(() => {
      if (gameState === 'practice') {
        setGameState('instructions2');
      } else if (currentItem < testItems.length - 1) {
        setCurrentItem(currentItem + 1);
        startTestItem(currentItem + 1);
      } else {
        setGameState('results');
      }
    }, 2000);
  };

  // Reset current item
  const tryAgain = () => {
    if (gameState === 'practice') {
      showSequence(practiceSequence);
    } else {
      showSequence(testItems[currentItem]);
    }
    setSelectedCards([]);
    setAvailableCards(initCards(gameState === 'practice' ? practiceSequence : testItems[currentItem]));
    setFeedback({ message: '', isCorrect: false });
  };

  return (
    <div className="animal-game">
      {/* Welcome Screen */}
      {gameState === 'welcome' && (
        <div className="welcome-screen">
          <h1>Animal Sequence Game</h1>
          <div className="welcome-animals">
            <div className="animal-card">{animals.fish}</div>
            <div className="animal-card">{animals.mouse}</div>
            <div className="animal-card">{animals.rabbit}</div>
            <div className="animal-card">{animals.frog}</div>
          </div>
          <p>Can you remember the correct order?</p>
          <button className="big-button" onClick={() => setGameState('instructions')}>
            Let's Play!
          </button>
        </div>
      )}

      {/* Instructions */}
      {gameState === 'instructions' && (
        <div className="instructions-screen">
          <h2>How to Play</h2>
          <div className="instruction-steps">
            <div className="step">
              <div className="step-number">1</div>
              <p>I'll show you some animals in order</p>
              <div className="example-sequence">
                <div className="animal-card">{animals.fish}</div>
                <div className="animal-card">{animals.mouse}</div>
                <div className="animal-card">{animals.fish}</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <p>Then you recreate the same order</p>
              <div className="example-sequence">
                <div className="animal-card">{animals.fish}</div>
                <div className="animal-card">{animals.mouse}</div>
                <div className="animal-card">{animals.fish}</div>
                <div className="animal-card">{animals.mouse}</div>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <p>Watch carefully - you'll only see them for 5 seconds!</p>
              <div className="timer-demo">5</div>
            </div>
          </div>
          <button className="big-button" onClick={startPractice}>
            Practice Round
          </button>
        </div>
      )}

      {/* Practice Instructions */}
      {gameState === 'instructions2' && (
        <div className="instructions-screen">
          <h2>Ready for the Challenge?</h2>
          <div className="instruction-steps">
            <div className="step">
              <p>Now you'll play <strong>10 rounds</strong></p>
              <div className="rounds-example">1/10</div>
            </div>
            <div className="step">
              <p>There will be <strong>more animal types</strong></p>
              <div className="animal-types">
                <div className="animal-card">{animals.fish}</div>
                <div className="animal-card">{animals.mouse}</div>
                <div className="animal-card">{animals.rabbit}</div>
                <div className="animal-card">{animals.frog}</div>
                <div className="animal-card">{animals.bear}</div>
                <div className="animal-card">{animals.fish}</div>
                <div className="animal-card">{animals.mouse}</div>
                <div className="animal-card">{animals.rabbit}</div>
                <div className="animal-card">{animals.frog}</div>
                <div className="animal-card">{animals.bear}</div>
                <div className="animal-card">{animals.fish}</div>
                <div className="animal-card">{animals.mouse}</div>
                <div className="animal-card">{animals.rabbit}</div>
                <div className="animal-card">{animals.frog}</div>
                <div className="animal-card">{animals.bear}</div>
                <div className="animal-card">{animals.mouse}</div>

              </div>
            </div>
            <div className="step">
              <p>Try to get as many correct as you can!</p>
              <div className="score-example">⭐ 0/0</div>
            </div>
          </div>
          <button className="big-button" onClick={startTest}>
            Start Game!
          </button>
        </div>
      )}

      {/* Game Screen (Practice and Test) */}
      {(gameState === 'practice' || gameState === 'test') && (
        <div className="game-screen">
          {/* Header */}
          <div className="game-header">
            {gameState === 'practice' ? (
              <h2>Practice Round</h2>
            ) : (
              <h2>Round {currentItem + 1} of 10</h2>
            )}
            <div className="score-display">
              <span className="score-icon">⭐</span> {score.correct}/{score.total}
            </div>
          </div>

          {/* Example to remember */}
          {showExample && (
            <div className="example-area">
              <h3>Remember this sequence:</h3>
              <div className="sequence-display">
                {(gameState === 'practice' ? practiceSequence : testItems[currentItem]).map((animal, index) => (
                  <div key={`example-${index}`} className="animal-card">
                    {animals[animal.name]}
                  </div>
                ))}
              </div>
              <div className="timer">
                <div className="timer-circle">
                  <div className="timer-text">{timer}</div>
                </div>
              </div>
            </div>
          )}

          {/* Player's turn */}
          {!showExample && (
            <div className="play-area">
              {/* Feedback message */}
              {feedback.message && (
                <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                  {feedback.message}
                </div>
              )}

              <h3>Your turn! Make the same sequence:</h3>
              
              {/* Selected cards */}
              <div className="selected-cards">
                {selectedCards.map((card, index) => (
                  <div 
                    key={`selected-${index}`} 
                    className="animal-card selected"
                    onClick={() => removeCard(index)}
                  >
                    {animals[card.name]}
                  </div>
                ))}
                {/* Empty slots */}
                {Array(4 - selectedCards.length).fill(0).map((_, index) => (
                  <div key={`empty-${index}`} className="animal-card empty">
                    ?
                  </div>
                ))}
              </div>

              {/* Available cards */}
              <div className="available-cards">
                {availableCards.map((card, index) => (
                  <div
                    key={`available-${index}`}
                    className="animal-card"
                    onClick={() => selectCard(card, index)}
                  >
                    {animals[card.name]}
                  </div>
                ))}
              </div>

              {/* Controls */}
              <div className="game-controls">
                <button className="control-button try-again" onClick={tryAgain}>
                  ↻ Try Again
                </button>
                <button 
                  className="control-button check" 
                  onClick={checkAnswer}
                  disabled={selectedCards.length < 4}
                >
                  ✓ Check
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Screen */}
      {gameState === 'results' && (
        <div className="results-screen">
          <h2>Game Complete!</h2>
          <div className="final-score">
            You got {score.correct} out of {score.total} correct!
          </div>
          <div className="score-stars">
            {Array(Math.round((score.correct / score.total) * 5)).fill(0).map((_, i) => (
              <span key={`star-${i}`} className="star">⭐</span>
            ))}
          </div>
          <div className="encouragement">
            {score.correct / score.total > 0.7 ? "Awesome memory! 🎉" : 
             score.correct / score.total > 0.4 ? "Good job! 👍" : "Nice try! 😊"}
          </div>
          <button 
            className="big-button" 
            onClick={() => {
              setGameState('welcome');
              setScore({ correct: 0, total: 0 });
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