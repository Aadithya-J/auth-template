// import axios from "axios";
// import { useState } from "react";
// import AudioPlayer from "react-h5-audio-player";
// import "react-h5-audio-player/lib/styles.css";
// import { useNavigate } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { backendURL } from "../../definedURL";

// const wordPairs = [
//   ["dog", "hog"],
//   ["gate", "cake"],
//   ["bun", "bun"],
//   ["let", "net"],
//   ["ride", "ride"],
//   ["man", "man"],
//   ["pit", "bit"],
//   ["thing", "sing"],
//   ["nut", "ton"],
//   ["big", "big"],
//   ["no", "mow"],
//   ["pot", "top"],
//   ["pat", "pat"],
//   ["shut", "just"],
//   ["name", "game"],
//   ["raw", "war"],
//   ["feet", "seat"],
//   ["fun", "fun"],
//   ["day", "bay"],
//   ["in", "on"],
// ];

// const SoundDiscriminationTest = ({
//   suppressResultPage = false,
//   onComplete,
// }) => {
//   const [score, setScore] = useState(0);
//   const [answeredPairs, setAnsweredPairs] = useState(new Set());
//   const [selectedOptions, setSelectedOptions] = useState(
//     Array(wordPairs.length).fill(null)
//   );
//   const [skippedPairs, setSkippedPairs] = useState(
//     Array(wordPairs.length).fill(false)
//   );
//   const navigate = useNavigate(); // Use navigate hook

//   const handleResponse = (index, isCorrect) => {
//     if (skippedPairs[index]) return;

//     const [word1, word2] = wordPairs[index];
//     const correctAnswer = word1 === word2;

//     setSelectedOptions((prev) => {
//       const updated = [...prev];
//       updated[index] = isCorrect;
//       return updated;
//     });

//     setScore((prevScore) => {
//       if (answeredPairs.has(index)) {
//         const previousAnswerCorrect = selectedOptions[index] === correctAnswer;
//         return isCorrect === correctAnswer && !previousAnswerCorrect
//           ? prevScore + 1
//           : isCorrect !== correctAnswer && previousAnswerCorrect
//           ? prevScore - 1
//           : prevScore;
//       } else {
//         return isCorrect === correctAnswer ? prevScore + 1 : prevScore;
//       }
//     });

//     setAnsweredPairs((prev) => new Set(prev).add(index));
//   };

//   const handleSkip = (index) => {
//     setSkippedPairs((prev) => {
//       const newSkipped = [...prev];
//       newSkipped[index] = !newSkipped[index]; // Toggle skip/unskip
//       return newSkipped;
//     });
//   };

//   const handleSubmit = async () => {
//     const token = localStorage.getItem("access_token");
//     const childId = localStorage.getItem("childId");

//     if (!childId) {
//       alert(
//         "No student data found. Please select a student before taking the test."
//       );
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${backendURL}/addTest16`,
//         {
//           childId: childId,
//           test_name: "Test 16: Sound Discrimination",
//           score: score / 2,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.status === 201) {
//         if (suppressResultPage && typeof onComplete === "function") {
//           onComplete(score);
//         } else {
//           toast.success("Test submitted successfully!", {
//             position: "top-center",
//             onClose: () => navigate("/"),
//           });
//         }
//       } else {
//         toast.error("Failed to submit test. Please try again.", {
//           position: "top-center",
//         });
//       }
//     } catch (error) {
//       console.error("Error submitting test:", error);
//       toast.error(
//         "An error occurred while submitting the test. Please try again.",
//         {
//           position: "top-center",
//         }
//       );
//     }
//   };

//   return (
//     <div className="p-8 overflow-auto h-screen bg-gray-200">
//       <div className="mb-8">
//         <h2 className="text-3xl font-roboto font-extrabold mb-7 flex items-center">
//           Sound Discrimination Test
//         </h2>
//         <div
//           style={{
//             height: "2px",
//             backgroundColor: "#999",
//             width: "100%",
//             marginBottom: "40px",
//           }}
//         ></div>

//         {wordPairs.map((pair, index) => (
//           <div
//             key={index}
//             className="flex flex-col items-end mb-7 bg-white rounded-lg p-5 w-full shadow-md"
//           >
//             <div className="w-full mb-4 text-left">
//               <span
//                 className={`text-xl font-bold ${
//                   skippedPairs[index] ? "text-gray-600" : "text-gray-900"
//                 }`}
//               >
//                 Word Pair Number {index + 1}{" "}
//                 {skippedPairs[index] && (
//                   <span className="text-gray-600">: Skipped</span>
//                 )}
//               </span>
//             </div>

//             <div className="w-full flex justify-end mb-4">
//               <div className="w-full">
//                 <AudioPlayer
//                   src={`/audio/${pair[0]}_${pair[1]}.m4a`}
//                   customProgressBarSection={[
//                     "MAIN_CONTROLS",
//                     "PROGRESS_BAR",
//                     "DURATION",
//                   ]}
//                   customControlsSection={[]}
//                   customAdditionalControls={[]}
//                   showJumpControls={false}
//                   layout="horizontal"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-between w-full items-center space-x-4">
//               <div className="flex space-x-4">
//                 <button
//                   className={`py-3 px-5 rounded-md text-lg transition transform duration-200 ${
//                     selectedOptions[index] === true
//                       ? "bg-green-700 text-white"
//                       : skippedPairs[index]
//                       ? "border-2 border-gray-600 text-gray-600"
//                       : "border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white hover:translate-y-[-2px]"
//                   }`}
//                   onClick={() => handleResponse(index, true)}
//                   disabled={skippedPairs[index]}
//                 >
//                   Yes, the sounds are same
//                 </button>

//                 <button
//                   className={`py-3 px-5 rounded-md text-lg transition transform duration-200 ${
//                     selectedOptions[index] === false
//                       ? "bg-red-700 text-white"
//                       : skippedPairs[index]
//                       ? "border-2 border-gray-600 text-gray-600"
//                       : "border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white hover:translate-y-[-2px]"
//                   }`}
//                   onClick={() => handleResponse(index, false)}
//                   disabled={skippedPairs[index]}
//                 >
//                   No, the sounds are not same
//                 </button>
//               </div>

//               <div className="flex justify-end flex-grow">
//                 <button
//                   className={`py-3 px-5 rounded-md text-lg transition transform duration-200 ${
//                     skippedPairs[index]
//                       ? "border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
//                       : "border-2 border-gray-700 text-gray-700 hover:bg-gray-300 hover:text-black"
//                   }`}
//                   onClick={() => handleSkip(index)}
//                 >
//                   {skippedPairs[index] ? "Attempt" : "Skip"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}

//         <div className="flex justify-center mt-8">
//           <button
//             onClick={handleSubmit}
//             className="bg-green-700 text-white font-bold py-3 px-6 rounded-md text-lg transition transform duration-200 hover:bg-green-800 hover:translate-y-[-2px] shadow-lg"
//           >
//             Submit Test
//           </button>
//         </div>
//       </div>
//       <ToastContainer />
//     </div>
//   );
// };

// export default SoundDiscriminationTest;

import axios from "axios";
import { useState, useEffect } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { backendURL } from "../../definedURL";

// Word pairs data
const wordPairs = [
  ["dog", "hog"],
  ["gate", "cake"],
  ["bun", "bun"],
  ["let", "net"],
  ["ride", "ride"],
  ["man", "man"],
  ["pit", "bit"],
  ["thing", "sing"],
  ["nut", "ton"],
  ["big", "big"],
  ["no", "mow"],
  ["pot", "top"],
  ["pat", "pat"],
  ["shut", "just"],
  ["name", "game"],
  ["raw", "war"],
  ["feet", "seat"],
  ["fun", "fun"],
  ["day", "bay"],
  ["in", "on"],
];

// Button component with animations and styling
const AnimatedButton = ({ onClick, disabled, active, variant, children }) => {
  // Define color variants
  const variants = {
    primary: {
      base: "border-2 border-blue-600 text-blue-600",
      hover: "hover:bg-blue-600 hover:text-white",
      active: "bg-blue-700 text-white",
      disabled: "border-2 border-gray-400 text-gray-400",
    },
    success: {
      base: "border-2 border-blue-700 text-blue-700",
      hover: "hover:bg-blue-700 hover:text-white",
      active: "bg-blue-700 text-white",
      disabled: "border-2 border-gray-400 text-gray-400",
    },
    danger: {
      base: "border-2 border-red-600 text-red-600",
      hover: "hover:bg-red-600 hover:text-white",
      active: "bg-red-600 text-white",
      disabled: "border-2 border-gray-400 text-gray-400",
    },
    neutral: {
      base: "border-2 border-blue-500 text-blue-500",
      hover: "hover:bg-blue-100",
      active: "bg-blue-100 text-blue-700",
      disabled: "border-2 border-gray-400 text-gray-400",
    },
  };

  const colorClass = disabled
    ? variants[variant].disabled
    : active
    ? variants[variant].active
    : `${variants[variant].base} ${variants[variant].hover}`;

  return (
    <motion.button
      whileHover={{ y: disabled ? 0 : -2, scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`py-3 px-5 rounded-md text-lg transition duration-150 ${colorClass}`}
    >
      {children}
    </motion.button>
  );
};

// Word pair component
const WordPairItem = ({
  pair,
  index,
  skipped,
  selectedOption,
  onResponse,
  onSkip,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex flex-col items-end mb-7 bg-white rounded-lg p-5 w-full shadow-md border border-blue-100"
    >
      <div className="w-full mb-4 text-left">
        <span
          className={`text-xl font-bold ${
            skipped ? "text-gray-500" : "text-blue-800"
          }`}
        >
          Word Pair Number {index + 1}{" "}
          {skipped && <span className="text-gray-500">: Skipped</span>}
        </span>
      </div>

      <div className="w-full flex justify-end mb-6">
        <div className="w-full">
          <AudioPlayer
            src={`/audio/${pair[0]}_${pair[1]}.m4a`}
            customProgressBarSection={[
              "MAIN_CONTROLS",
              "PROGRESS_BAR",
              "DURATION",
            ]}
            customControlsSection={[]}
            customAdditionalControls={[]}
            showJumpControls={false}
            layout="horizontal"
            style={{
              borderRadius: "8px",
              backgroundColor: "#f0f7ff",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            }}
          />
        </div>
      </div>

      <div className="flex justify-between w-full items-center space-x-4">
        <div className="flex space-x-4">
          <AnimatedButton
            onClick={() => onResponse(index, true)}
            disabled={skipped}
            active={selectedOption === true}
            variant="success"
          >
            Yes, the sounds are same
          </AnimatedButton>

          <AnimatedButton
            onClick={() => onResponse(index, false)}
            disabled={skipped}
            active={selectedOption === false}
            variant="danger"
          >
            No, the sounds are not same
          </AnimatedButton>
        </div>

        <div className="flex justify-end flex-grow">
          <AnimatedButton onClick={() => onSkip(index)} variant="neutral">
            {skipped ? "Attempt" : "Skip"}
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );
};

// Header component
const Header = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mb-8"
  >
    <h2 className="text-3xl font-roboto font-extrabold mb-7 flex items-center text-blue-800">
      {title}
    </h2>
    <div
      style={{
        height: "2px",
        background: "linear-gradient(to right, #3b82f6, #bfdbfe)",
        width: "100%",
        marginBottom: "40px",
      }}
    ></div>
  </motion.div>
);

// Score summary component
const ScoreSummary = ({ score, totalPairs }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 shadow-sm"
  >
    <h3 className="font-bold text-blue-700 mb-2">Current Score</h3>
    <p className="text-blue-800">
      {score} out of {totalPairs} possible points
    </p>
  </motion.div>
);

// Submit button component
const SubmitButton = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="fixed bottom-4 left-0 right-0 flex justify-center"
  >
    <motion.button
      whileHover={{ y: -2, scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-blue-700 text-white font-bold py-3 px-6 rounded-md text-lg transition duration-200 hover:bg-blue-800 shadow-lg"
    >
      Submit Test
    </motion.button>
  </motion.div>
);

// Main component
const SoundDiscriminationTest = ({
  suppressResultPage = false,
  onComplete,
}) => {
  const [score, setScore] = useState(0);
  const [answeredPairs, setAnsweredPairs] = useState(new Set());
  const [selectedOptions, setSelectedOptions] = useState(
    Array(wordPairs.length).fill(null)
  );
  const [skippedPairs, setSkippedPairs] = useState(
    Array(wordPairs.length).fill(false)
  );
  const navigate = useNavigate();

  // Function to handle user responses
  const handleResponse = (index, isCorrect) => {
    if (skippedPairs[index]) return;

    const [word1, word2] = wordPairs[index];
    const correctAnswer = word1 === word2;

    setSelectedOptions((prev) => {
      const updated = [...prev];
      updated[index] = isCorrect;
      return updated;
    });

    setScore((prevScore) => {
      if (answeredPairs.has(index)) {
        const previousAnswerCorrect = selectedOptions[index] === correctAnswer;
        return isCorrect === correctAnswer && !previousAnswerCorrect
          ? prevScore + 1
          : isCorrect !== correctAnswer && previousAnswerCorrect
          ? prevScore - 1
          : prevScore;
      } else {
        return isCorrect === correctAnswer ? prevScore + 1 : prevScore;
      }
    });

    setAnsweredPairs((prev) => new Set(prev).add(index));
  };

  // Function to handle skipping pairs
  const handleSkip = (index) => {
    setSkippedPairs((prev) => {
      const newSkipped = [...prev];
      newSkipped[index] = !newSkipped[index]; // Toggle skip/unskip
      return newSkipped;
    });
  };

  // Function to submit test results
  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      toast.error(
        "No student data found. Please select a student before taking the test.",
        { position: "top-center" }
      );
      return;
    }

    try {
      const response = await axios.post(
        `${backendURL}/addTest16`,
        {
          childId: childId,
          test_name: "Test 16: Sound Discrimination",
          score: score / 2,
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
          onComplete(score);
        } else {
          toast.success("Test submitted successfully!", {
            position: "top-center",
            onClose: () => navigate("/"),
          });
        }
      } else {
        toast.error("Failed to submit test. Please try again.", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error(
        "An error occurred while submitting the test. Please try again.",
        {
          position: "top-center",
        }
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-8 overflow-auto h-screen bg-blue-50"
    >
      <Header title="Sound Discrimination Test" />

      <ScoreSummary score={score} totalPairs={wordPairs.length} />

      {wordPairs.map((pair, index) => (
        <WordPairItem
          key={index}
          pair={pair}
          index={index}
          skipped={skippedPairs[index]}
          selectedOption={selectedOptions[index]}
          onResponse={handleResponse}
          onSkip={handleSkip}
        />
      ))}

      <SubmitButton onClick={handleSubmit} />

      <ToastContainer />
    </motion.div>
  );
};

export default SoundDiscriminationTest;
