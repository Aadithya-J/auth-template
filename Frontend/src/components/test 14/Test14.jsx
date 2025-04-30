// import { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { Mic, MicOff, Check, X, Volume2, ArrowRight, SkipForward, Loader } from "lucide-react";
// import { backendURL, pythonURL } from "../../definedURL";
// import { motion, AnimatePresence } from "framer-motion";
// import PropTypes from "prop-types";

// const WORDS = [
//   {
//     id: 1,
//     sounds: ["/sounds/c.mp3", "/sounds/a.mp3", "/sounds/t.mp3"],
//     word: "cat",
//   },
//   {
//     id: 2,
//     sounds: ["/sounds/f.mp3", "/sounds/a.mp3", "/sounds/t.mp3"],
//     word: "fat",
//   },
//   {
//     id: 3,
//     sounds: ["/sounds/l.mp3", "/sounds/e.mp3", "/sounds/t.mp3"],
//     word: "let",
//   },
//   {
//     id: 4,
//     sounds: ["/sounds/l.mp3", "/sounds/i.mp3", "/sounds/p.mp3"],
//     word: "lip",
//   },
//   {
//     id: 5,
//     sounds: ["/sounds/p.mp3", "/sounds/o.mp3", "/sounds/t.mp3"],
//     word: "pot",
//   },
//   {
//     id: 6,
//     sounds: ["/sounds/b.mp3", "/sounds/o.mp3", "","/sounds/t.mp3"],
//     word: "boat",
//   },
//   {
//     id: 7,
//     sounds: ["/sounds/p.mp3", "/sounds/e.mp3", "/sounds/g.mp3"],
//     word: "peg",
//   },
//   {
//     id: 8,
//     sounds: ["/sounds/b.mp3", "/sounds/e.mp3", "/sounds/g.mp3"],
//     word: "beg",
//   },
//   {
//     id: 9,
//     sounds: ["/sounds/sh.mp3", "/sounds/o.mp3", "/sounds/p.mp3"],
//     word: "shop",
//   },
//   {
//     id: 10,
//     sounds: ["/sounds/f.mp3", "/sounds/ee.mp3", "/sounds/t.mp3"],
//     word: "feet",
//   },
//   {
//     id: 11,
//     sounds: [
//       "/sounds/d.mp3",
//       "/sounds/i.mp3",
//       "/sounds/n.mp3",
//       "/sounds/er.mp3",
//     ],
//     word: "dinner",
//   },
//   {
//     id: 12,
//     sounds: [
//       "/sounds/w.mp3",
//       "/sounds/e.mp3",
//       "/sounds/th.mp3",
//       "/sounds/er.mp3",
//     ],
//     word: "weather",
//   },
//   {
//     id: 13,
//     sounds: [
//       "/sounds/l.mp3",
//       "/sounds/i.mp3",
//       "/sounds/t.mp3",
//       "/sounds/l.mp3",
//     ],
//     word: "little",
//   },
//   {
//     id: 14,
//     sounds: [
//       "/sounds/d.mp3",
//       "/sounds/e.mp3",
//       "/sounds/l.mp3",
//       "/sounds/i.mp3",
//       "/sounds/k.mp3",
//       "/sounds/t.mp3",
//     ],
//     word: "delicate",
//   },
//   {
//     id: 15,
//     sounds: ["/sounds/t.mp3", "/sounds/a.mp3", "/sounds/p.mp3"],
//     word: "tap",
//   },
//   {
//     id: 16,
//     sounds: ["/sounds/d.mp3", "/sounds/u.mp3", "/sounds/p.mp3"],
//     word: "dup",
//   },
//   {
//     id: 17,
//     sounds: ["/sounds/p.mp3", "/sounds/o.mp3", "/sounds/g.mp3"],
//     word: "pog",
//   },
//   {
//     id: 18,
//     sounds: [
//       "/sounds/g.mp3",
//       "/sounds/l.mp3",
//       "/sounds/e.mp3",
//       "/sounds/b.mp3",
//     ],
//     word: "gleb",
//   },
//   {
//     id: 19,
//     sounds: [
//       "/sounds/g.mp3",
//       "/sounds/a.mp3",
//       "/sounds/p.mp3",
//       "/sounds/o.mp3",
//     ],
//     word: "gapo",
//     alternatives: ["gapo", "gappo", "gahpo"]
//   },
//   {
//     id: 20,
//     sounds: [
//       "/sounds/t.mp3",
//       "/sounds/i.mp3",
//       "/sounds/s.mp3",
//       "/sounds/e.mp3",
//       "/sounds/k.mp3",
//     ],
//     word: "tisek",
//     alternatives: ["tisek", "teesek", "tissek", "teeseck"]
//   },
  
  
// ];

// const ProgressBar = ({ progress }) => (
//   <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
//     <motion.div
//       className="bg-gradient-to-r from-blue-500 to-blue-600 h-3"
//       initial={{ width: 0 }}
//       animate={{ width: `${progress}%` }}
//       transition={{ duration: 0.5, ease: "easeInOut" }}
//     />
//   </div>
// );

// ProgressBar.propTypes = {
//   progress: PropTypes.number.isRequired,
// };

// const ResultCard = ({ item, index }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ delay: index * 0.1 }}
//     className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
//       item.isCorrect
//         ? "bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400"
//         : "bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400"
//     }`}
//   >
//     <div className="flex justify-between items-center">
//       <span className="font-medium text-blue-900">
//         Word {index + 1}: <span className="font-bold">{item.word}</span>
//       </span>
//       <span
//         className={`flex items-center font-bold ${
//           item.isCorrect ? "text-green-600" : "text-red-600"
//         }`}
//       >
//         {item.isCorrect ? (
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             className="bg-green-100 p-1 rounded-full"
//           >
//             <Check size={16} />
//           </motion.div>
//         ) : (
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             className="bg-red-100 p-1 rounded-full"
//           >
//             <X size={16} />
//           </motion.div>
//         )}
//       </span>
//     </div>
//     <div className="mt-2 text-sm text-blue-800">
//       <p>
//         You said:{" "}
//         <span className={`font-medium ${item.isCorrect ? "text-green-600" : "text-red-500"}`}>
//           {item.response || "No response"}
//         </span>
//       </p>
//       {!item.isCorrect && (
//         <p className="text-blue-700 mt-1">
//           Correct answer: <span className="font-medium">{item.word}</span>
//         </p>
//       )}
//     </div>
//   </motion.div>
// );

// ResultCard.propTypes = {
//   item: PropTypes.shape({
//     isCorrect: PropTypes.bool.isRequired,
//     word: PropTypes.string.isRequired,
//     response: PropTypes.string,
//   }).isRequired,
//   index: PropTypes.number.isRequired,
// };

// const Button = ({
//   onClick,
//   disabled,
//   variant = "primary",
//   children,
//   className = "",
//   isLoading = false,
// }) => {
//   const baseStyle = "py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm";
//   const variants = {
//     primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed",
//     secondary: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 hover:from-blue-100 hover:to-blue-200 active:scale-98",
//     danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-98",
//     success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 active:scale-98",
//     warning: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 active:scale-98",
//   };

//   return (
//     <motion.button
//       whileHover={{ scale: disabled ? 1 : 1.02 }}
//       whileTap={{ scale: disabled ? 1 : 0.98 }}
//       onClick={onClick}
//       disabled={disabled || isLoading}
//       className={`${baseStyle} ${variants[variant]} ${className}`}
//     >
//       {isLoading ? (
//         <>
//           <Loader className="h-5 w-5 animate-spin" />
//           <span>Processing...</span>
//         </>
//       ) : (
//         children
//       )}
//     </motion.button>
//   );
// };

// Button.propTypes = {
//   onClick: PropTypes.func.isRequired,
//   disabled: PropTypes.bool,
//   variant: PropTypes.oneOf(["primary", "secondary", "danger", "success", "warning"]),
//   children: PropTypes.node.isRequired,
//   className: PropTypes.string,
//   isLoading: PropTypes.bool,
// };

// // Loading overlay component
// const LoadingOverlay = ({ message = "Processing..." }) => (
//   <motion.div
//     initial={{ opacity: 0 }}
//     animate={{ opacity: 1 }}
//     exit={{ opacity: 0 }}
//     className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
//   >
//     <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center max-w-xs">
//       <div className="relative">
//         <motion.div
//           animate={{ 
//             rotate: 360,
//             scale: [1, 1.1, 1]
//           }}
//           transition={{ 
//             rotate: { repeat: Infinity, duration: 1.5, ease: "linear" },
//             scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
//           }}
//           className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600"
//         />
//       </div>
//       <p className="mt-4 text-blue-800 font-medium">{message}</p>
//     </div>
//   </motion.div>
// );

// LoadingOverlay.propTypes = {
//   message: PropTypes.string,
// };

// export default function PhonemeGame({
//   onComplete,
//   suppressResultPage,
//   student,
// }) {
//   const [gameState, setGameState] = useState("playing");
//   const [currentWordIndex, setCurrentWordIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [showResponse, setShowResponse] = useState(false);
//   const [responses, setResponses] = useState([]);
//   const [isRecording, setIsRecording] = useState(false);
//   const [error, setError] = useState(null);
//   const [transcript, setTranscript] = useState("");
//   const [userResponses, setUserResponses] = useState([]); // Track all user responses for current word
//   const [readyForNext, setReadyForNext] = useState(false);
//   const [showFinalSubmit, setShowFinalSubmit] = useState(false);
//   const [isLoading, setIsLoading] = useState(false); // New state for loading overlay
//   const [loadingMessage, setLoadingMessage] = useState(""); // Message to display during loading
//   const audioRef = useRef(null);
//   const mediaRecorderRef = useRef(null);

//   useEffect(() => {
//     return () => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//       }
//       stopRecording();
//     };
//   }, []);

//   useEffect(() => {
//     // Reset user responses when changing to a new word
//     setUserResponses([]);
//     setReadyForNext(false);
//   }, [currentWordIndex]);

//   const playSound = (src) => {
//     return new Promise((resolve) => {
//       if (audioRef.current) {
//         audioRef.current.pause();
//       }
//       const audio = new Audio(src);
//       audioRef.current = audio;
//       audio
//         .play()
//         .then(() => {
//           audio.onended = resolve;
//         })
//         .catch((e) => {
//           console.error("Audio playback failed:", e);
//           setError("Failed to play sounds. Please check your audio.");
//           resolve();
//         });
//     });
//   };

//   const playCurrentWord = async () => {
//     try {
//       setIsPlaying(true);
//       setError(null);
//       const currentWord = WORDS[currentWordIndex];

//       for (const sound of currentWord.sounds) {
//         await playSound(sound);
//         await new Promise((resolve) => setTimeout(resolve, 500));
//       }

//       setIsPlaying(false);
//       setShowResponse(true);
//     } catch (err) {
//       setError("Error playing sounds. Please try again.");
//       setIsPlaying(false);
//     }
//   };

//   const startRecording = async () => {
//     setError(null);
//     setTranscript("");
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       const mediaRecorder = new MediaRecorder(stream, {
//         mimeType: "audio/webm",
//       });
//       mediaRecorderRef.current = mediaRecorder;
//       const audioChunks = [];

//       mediaRecorder.ondataavailable = (e) => {
//         if (e.data.size > 0) {
//           audioChunks.push(e.data);
//         }
//       };

//       mediaRecorder.onstop = async () => {
//         setIsLoading(true); // Show loading overlay
//         setLoadingMessage("Processing your speech...");
        
//         const audioBlob = new Blob(audioChunks);
//         const file = new File(
//           [audioBlob],
//           `rec.${audioBlob.type.split("/")[1]}`,
//           {
//             type: audioBlob.type,
//           }
//         );

//         const transcription = await transcribeAudio(file);
//         stream.getTracks().forEach((track) => track.stop());
        
//         // Add the new response to userResponses
//         setUserResponses(prev => [...prev, transcription]);
        
//         // Ready to move to next word
//         setReadyForNext(true);
//         setIsLoading(false); // Hide loading overlay
//       };

//       // Start recording with timeslice to ensure dataavailable events fire
//       mediaRecorder.start(100); // 100ms timeslice
//       setIsRecording(true);
//     } catch (err) {
//       console.error("Error starting recording:", err);
//       setError("Couldn't access microphone. Please check permissions.");
//       setIsRecording(false);
//     }
//   };

//   const stopRecording = () => {
//     if (
//       mediaRecorderRef.current &&
//       mediaRecorderRef.current.state === "recording"
//     ) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   const transcribeAudio = async (fileOrBlob) => {
//     try {
//       const formData = new FormData();
//       const upload =
//         fileOrBlob instanceof File
//           ? fileOrBlob
//           : new File([fileOrBlob], "recording", { type: fileOrBlob.type });

//       formData.append("file", upload);

//       const response = await axios.post(`${pythonURL}/transcribe`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const transcription =
//         response.data.transcription
//           ?.toLowerCase()
//           .trim()
//           .replace(/[.,!?;:]*$/, "") || "";

//       setTranscript(transcription);
//       return transcription;
//     } catch (err) {
//       console.error("Transcription error:", err);
//       setError("Failed to transcribe audio. Please try again.");
//       return "";
//     }
//   };

//   const moveToNextWord = () => {
//     const currentWord = WORDS[currentWordIndex];
//     // Use the last response as the final answer
//     const finalResponse = userResponses.length > 0 ? userResponses[userResponses.length - 1] : "";
    
//     // Check if answer is correct (accounting for alternative correct answers)
//     const isCorrect = currentWord.alternatives
//       ? [...currentWord.alternatives, currentWord.word.toLowerCase()].includes(finalResponse)
//       : finalResponse === currentWord.word.toLowerCase();

//     // Create the new response object
//     const newResponse = {
//       wordId: currentWord.id,
//       word: currentWord.word,
//       response: finalResponse,
//       isCorrect,
//     };

//     const updatedResponses = [...responses, newResponse];
//     setResponses(updatedResponses);

//     if (currentWordIndex === WORDS.length - 1) {
//       // This was the last word
//       setShowFinalSubmit(true);
//     } else {
//       // Move to next word
//       setCurrentWordIndex(currentWordIndex + 1);
//       setShowResponse(false);
//       setTranscript("");
//       setUserResponses([]);
//       setReadyForNext(false);
//     }
//   };
  
//   const skipWord = () => {
//     const currentWord = WORDS[currentWordIndex];
    
//     // Add an empty response (skipped)
//     const newResponse = {
//       wordId: currentWord.id,
//       word: currentWord.word,
//       response: "[skipped]",
//       isCorrect: false, // Skipped answers are marked incorrect
//     };

//     const updatedResponses = [...responses, newResponse];
//     setResponses(updatedResponses);

//     if (currentWordIndex === WORDS.length - 1) {
//       // This was the last word
//       setShowFinalSubmit(true);
//     } else {
//       // Move to next word
//       setCurrentWordIndex(currentWordIndex + 1);
//       setShowResponse(false);
//       setTranscript("");
//       setUserResponses([]);
//       setReadyForNext(false);
//     }
//   };
  
//   const handleFinalSubmit = async () => {
//     setIsLoading(true);
//     setLoadingMessage("Submitting your results...");
//     await finishGame(responses);
//     setIsLoading(false);
//   };

//   const finishGame = async (responsesToSubmit) => {
//     const token = localStorage.getItem("access_token");
//     const childId = localStorage.getItem("childId") || (student && student.id);
//     // Calculate score according to new rules
//     const incorrectCount = responsesToSubmit.filter((r) => !r.isCorrect).length;
//     const rawScore = 20 - incorrectCount;
//     const finalScore = Math.min(10, Math.round(rawScore / 2));

//     try {
//       await axios.post(
//         `${backendURL}/submitResults`,
//         {
//           responses: responsesToSubmit.map((r) => ({
//             wordId: r.wordId,
//             isCorrect: r.isCorrect,
//           })),
//           normalized_score: finalScore,
//           total_score: rawScore,
//           studentId: student?.id,
//           childId: childId,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (suppressResultPage) {
//         onComplete(finalScore); // Immediately proceed to next test
//       } else {
//         setGameState("results");
//       }
//     } catch (err) {
//       console.error("Error submitting results:", err);
//       setError("Failed to save results. You can try again later.");
//       if (suppressResultPage) {
//         onComplete(0); // Proceed with zero score if error occurs
//       } else {
//         setGameState("results");
//       }
//     }
//   };
  
//   const restartGame = () => {
//     setCurrentWordIndex(0);
//     setResponses([]);
//     setError(null);
//     setShowFinalSubmit(false);
//     setGameState("playing");
//   };

//   if (gameState === "results") {
//     const incorrectCount = responses.filter((r) => !r.isCorrect).length;
//     const rawScore = 20 - incorrectCount;
//     const finalScore = Math.min(10, Math.round(rawScore / 2));
//     const percentage = Math.round((finalScore / 10) * 100);

//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50 p-6">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6"
//         >
//           <div className="text-center">
//             <motion.div
//               initial={{ y: -20 }}
//               animate={{ y: 0 }}
//               className="inline-block bg-blue-100 p-3 rounded-full mb-4"
//             >
//               {finalScore >= 8 ? "🎉" : finalScore >= 5 ? "👍" : "🌱"}
//             </motion.div>
//             <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
//               Test Completed!
//             </h1>
//           </div>

//           <div className="flex flex-col items-center space-y-4">
//             <motion.div
//               initial={{ rotate: -180 }}
//               animate={{ rotate: 0 }}
//               transition={{ duration: 1, ease: "easeOut" }}
//               className="relative"
//             >
//               <svg className="w-36 h-36" viewBox="0 0 36 36">
//                 <path
//                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                   fill="none"
//                   stroke="#e6e6e6"
//                   strokeWidth="3"
//                 />
//                 <motion.path
//                   d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                   fill="none"
//                   stroke="url(#gradient)"
//                   strokeWidth="3"
//                   strokeLinecap="round"
//                   initial={{ strokeDasharray: "0, 100" }}
//                   animate={{ strokeDasharray: `${percentage}, 100` }}
//                   transition={{ duration: 1.5, ease: "easeOut" }}
//                 />
//                 <defs>
//                   <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
//                     <stop offset="0%" stopColor="#4F46E5" />
//                     <stop offset="100%" stopColor="#60A5FA" />
//                   </linearGradient>
//                 </defs>
//               </svg>
//               <div className="absolute inset-0 flex flex-col items-center justify-center">
//                 <motion.span
//                   initial={{ scale: 0 }}
//                   animate={{ scale: 1 }}
//                   transition={{ delay: 0.5 }}
//                   className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500"
//                 >
//                   {finalScore}/10
//                 </motion.span>
//                 <span className="text-sm font-medium text-blue-800">
//                   {responses.filter((r) => r.isCorrect).length}/{WORDS.length}{" "}
//                   correct
//                 </span>
//               </div>
//             </motion.div>
//           </div>

//           <div className="max-h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 p-1">
//             <AnimatePresence>
//               {responses.map((item, index) => (
//                 <ResultCard key={index} item={item} index={index} />
//               ))}
//             </AnimatePresence>
//           </div>

//           <Button onClick={() => onComplete(finalScore)} variant="primary" className="w-full">
//             <ArrowRight className="h-5 w-5" />
//             Continue to Next Test
//           </Button>
//         </motion.div>
//       </div>
//     );
//   }
  
//   const currentWord = WORDS[currentWordIndex];
//   const progress =
//     ((currentWordIndex + (showResponse ? 1 : 0)) / WORDS.length) * 100;

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50 p-6">
//       {/* Loading overlay */}
//       <AnimatePresence>
//         {isLoading && <LoadingOverlay message={loadingMessage} />}
//       </AnimatePresence>
      
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6"
//       >
//         <div className="space-y-1">
//           <ProgressBar progress={progress} />
//           <div className="flex justify-between text-xs text-blue-500">
//             <span>Start</span>
//             <span>Word {currentWordIndex + 1} of {WORDS.length}</span>
//             <span>Finish</span>
//           </div>
//         </div>

//         <div className="text-center space-y-1">
//           <motion.h2 
//             initial={{ y: -10, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600"
//           >
//             Blend the Sounds!
//           </motion.h2>
//           <p className="text-blue-600 font-medium">
//             {showResponse ? "Say the word you heard" : "Listen carefully"}
//           </p>
//         </div>

//         {error && (
//           <motion.div
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             exit={{ opacity: 0, x: 20 }}
//             className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm"
//           >
//             <div className="flex items-center">
//               <div className="mr-2">⚠️</div>
//               <p>{error}</p>
//             </div>
//           </motion.div>
//         )}

//         <motion.div
//           animate={{
//             scale: isPlaying || isRecording ? [1, 1.1, 1] : 1,
//             rotate: isPlaying ? [0, 5, -5, 0] : 0,
//           }}
//           transition={{
//             duration: isPlaying || isRecording ? 2 : 0.5,
//             repeat: isPlaying || isRecording ? Infinity : 0,
//           }}
//           className="flex justify-center text-8xl my-6"
//         >
//           {isPlaying ? "👂" : showResponse ? (isRecording ? "🎙️" : "🎤") : "🔊"}
//         </motion.div>

//         {!showResponse ? (
//           <div className="space-y-4">
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100"
//             >
//               <p className="text-center text-blue-700">
//                 Listen to the sounds and combine them to form a word
//               </p>
//             </motion.div>
            
//             <Button
//               onClick={playCurrentWord}
//               disabled={isPlaying}
//               variant={isPlaying ? "secondary" : "primary"}
//               className="w-full"
//             >
//               <Volume2 className="h-5 w-5" />
//               {isPlaying ? "Playing Sounds..." : "Play Sounds"}
//             </Button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <motion.div
//               initial={{ opacity: 0, y: 10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100"
//             >
//               <p className="text-center font-medium text-blue-700">
//                 What word did you hear?
//               </p>
//             </motion.div>

//             <div className="flex flex-col items-center space-y-3">
//               {/* Display all user responses for the current word */}
//               <AnimatePresence>
//                 {userResponses.length > 0 && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg w-full border border-blue-100 shadow-sm"
//                   >
//                     <p className="font-medium text-blue-700 mb-2">Your responses:</p>
//                     <ul className="space-y-2">
//                       {userResponses.map((response, index) => (
//                         <motion.li
//                           key={index}
//                           initial={{ opacity: 0, y: -10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ delay: 0.1 * index }}
//                           className={`p-2 rounded-md ${
//                             index === userResponses.length - 1
//                               ? "bg-blue-100 font-medium border-l-4 border-blue-400"
//                               : "bg-white bg-opacity-60"
//                           }`}
//                         >
//                           {index + 1}. {response || "[No response detected]"}
//                         </motion.li>
//                       ))}
//                     </ul>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               <Button
//                 onClick={isRecording ? stopRecording : startRecording}
//                 variant={isRecording ? "danger" : "primary"}
//                 className="w-full"
//               >
//                 {isRecording ? (
//                   <>
//                     <div className="flex items-center">
//                       <span className="relative flex h-3 w-3 mr-2">
//                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
//                         <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
//                       </span>
//                       <MicOff className="h-5 w-5" />
//                     </div>
//                     Stop Recording
//                   </>
//                 ) : (
//                   <>
//                     <Mic className="h-5 w-5" />
//                     Press & Speak
//                   </>
//                 )}
//               </Button>

//               {/* Navigation buttons */}
//               <div className="flex gap-2 w-full mt-2">
//                 {/* Skip button - Always visible */}
//                 {!showFinalSubmit && (
//                   <Button
//                     onClick={skipWord}
//                     variant="warning"
//                     className="flex-1"
//                   >
//                     <SkipForward className="h-5 w-5" />
//                     Skip
//                   </Button>
//                 )}
                
//                 {/* Next button - Only show when there's at least one response */}
//                 {userResponses.length > 0 && !showFinalSubmit && (
//                   <Button
//                     onClick={moveToNextWord}
//                     variant="success"
//                     className="flex-1"
//                   >
//                     <ArrowRight className="h-5 w-5" />
//                     Next
//                   </Button>
//                 )}
//               </div>

//               {showFinalSubmit && (
//                 <Button 
//                   onClick={handleFinalSubmit} 
//                   variant="primary" 
//                   className="w-full"
//                   isLoading={isLoading}
//                 >
//                   Submit All Results
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}
//       </motion.div>
//     </div>
//   );
// }




import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Mic, MicOff, Check, X, Volume2, ArrowRight, SkipForward, Loader } from "lucide-react";
import { backendURL } from "../../definedURL";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";

// --- WORDS array as in your paste ---
const WORDS = [
  { id: 1, sounds: ["/sounds/c.mp3", "/sounds/a.mp3", "/sounds/t.mp3"], word: "cat" },
  { id: 2, sounds: ["/sounds/f.mp3", "/sounds/a.mp3", "/sounds/t.mp3"], word: "fat" },
  { id: 3, sounds: ["/sounds/l.mp3", "/sounds/e.mp3", "/sounds/t.mp3"], word: "let" },
  { id: 4, sounds: ["/sounds/l.mp3", "/sounds/i.mp3", "/sounds/p.mp3"], word: "lip" },
  { id: 5, sounds: ["/sounds/p.mp3", "/sounds/o.mp3", "/sounds/t.mp3"], word: "pot" },
  { id: 6, sounds: ["/sounds/b.mp3", "/sounds/o.mp3", "", "/sounds/t.mp3"], word: "boat" },
  { id: 7, sounds: ["/sounds/p.mp3", "/sounds/e.mp3", "/sounds/g.mp3"], word: "peg" },
  { id: 8, sounds: ["/sounds/b.mp3", "/sounds/e.mp3", "/sounds/g.mp3"], word: "beg" },
  { id: 9, sounds: ["/sounds/sh.mp3", "/sounds/o.mp3", "/sounds/p.mp3"], word: "shop" },
  { id: 10, sounds: ["/sounds/f.mp3", "/sounds/ee.mp3", "/sounds/t.mp3"], word: "feet" },
  { id: 11, sounds: ["/sounds/d.mp3", "/sounds/i.mp3", "/sounds/n.mp3", "/sounds/er.mp3"], word: "dinner" },
  { id: 12, sounds: ["/sounds/w.mp3", "/sounds/e.mp3", "/sounds/th.mp3", "/sounds/er.mp3"], word: "weather" },
  { id: 13, sounds: ["/sounds/l.mp3", "/sounds/i.mp3", "/sounds/t.mp3", "/sounds/l.mp3"], word: "little" },
  { id: 14, sounds: ["/sounds/d.mp3", "/sounds/e.mp3", "/sounds/l.mp3", "/sounds/i.mp3", "/sounds/k.mp3", "/sounds/t.mp3"], word: "delicate" },
  { id: 15, sounds: ["/sounds/t.mp3", "/sounds/a.mp3", "/sounds/p.mp3"], word: "tap" },
  { id: 16, sounds: ["/sounds/d.mp3", "/sounds/u.mp3", "/sounds/p.mp3"], word: "dup" },
  { id: 17, sounds: ["/sounds/p.mp3", "/sounds/o.mp3", "/sounds/g.mp3"], word: "pog" },
  { id: 18, sounds: ["/sounds/g.mp3", "/sounds/l.mp3", "/sounds/e.mp3", "/sounds/b.mp3"], word: "gleb" },
  { id: 19, sounds: ["/sounds/g.mp3", "/sounds/a.mp3", "/sounds/p.mp3", "/sounds/o.mp3"], word: "gapo", alternatives: ["gapo", "gappo", "gahpo"] },
  { id: 20, sounds: ["/sounds/t.mp3", "/sounds/i.mp3", "/sounds/s.mp3", "/sounds/e.mp3", "/sounds/k.mp3"], word: "tisek", alternatives: ["tisek", "teesek", "tissek", "teeseck"] },
];

// --- ProgressBar, ResultCard, Button, LoadingOverlay components as in your paste ---

const ProgressBar = ({ progress }) => (
  <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
    <motion.div
      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  </div>
);

ProgressBar.propTypes = { progress: PropTypes.number.isRequired };

const ResultCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`p-4 rounded-lg shadow-md transition-all duration-300 ${
      item.isCorrect
        ? "bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-400"
        : "bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400"
    }`}
  >
    <div className="flex justify-between items-center">
      <span className="font-medium text-blue-900">
        Word {index + 1}: <span className="font-bold">{item.word}</span>
      </span>
      <span className={`flex items-center font-bold ${item.isCorrect ? "text-green-600" : "text-red-600"}`}>
        {item.isCorrect ? (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-green-100 p-1 rounded-full">
            <Check size={16} />
          </motion.div>
        ) : (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-red-100 p-1 rounded-full">
            <X size={16} />
          </motion.div>
        )}
      </span>
    </div>
    <div className="mt-2 text-sm text-blue-800">
      <p>
        You said:{" "}
        <span className={`font-medium ${item.isCorrect ? "text-green-600" : "text-red-500"}`}>
          {item.response || "No response"}
        </span>
      </p>
      {!item.isCorrect && (
        <p className="text-blue-700 mt-1">
          Correct answer: <span className="font-medium">{item.word}</span>
        </p>
      )}
    </div>
  </motion.div>
);

ResultCard.propTypes = {
  item: PropTypes.shape({
    isCorrect: PropTypes.bool.isRequired,
    word: PropTypes.string.isRequired,
    response: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const Button = ({
  onClick,
  disabled,
  variant = "primary",
  children,
  className = "",
  isLoading = false,
}) => {
  const baseStyle = "py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm";
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed",
    secondary: "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 hover:from-blue-100 hover:to-blue-200 active:scale-98",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-98",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 active:scale-98",
    warning: "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 active:scale-98",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <Loader className="h-5 w-5 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(["primary", "secondary", "danger", "success", "warning"]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
};

const LoadingOverlay = ({ message = "Processing..." }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div className="bg-white rounded-xl p-6 shadow-xl flex flex-col items-center max-w-xs">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { repeat: Infinity, duration: 1.5, ease: "linear" },
            scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
          }}
          className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600"
        />
      </div>
      <p className="mt-4 text-blue-800 font-medium">{message}</p>
    </div>
  </motion.div>
);

LoadingOverlay.propTypes = { message: PropTypes.string };

// --- MAIN GAME COMPONENT ---
export default function PhonemeGame({
  onComplete,
  suppressResultPage,
  student,
}) {
  const [gameState, setGameState] = useState("playing");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [responses, setResponses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [userResponses, setUserResponses] = useState([]);
  const [readyForNext, setReadyForNext] = useState(false);
  const [showFinalSubmit, setShowFinalSubmit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      stopRecognition();
    };
  }, []);

  useEffect(() => {
    setUserResponses([]);
    setReadyForNext(false);
  }, [currentWordIndex]);

  const playSound = (src) => {
    return new Promise((resolve) => {
      if (audioRef.current) audioRef.current.pause();
      const audio = new Audio(src);
      audioRef.current = audio;
      audio.play().then(() => {
        audio.onended = resolve;
      }).catch((e) => {
        setError("Failed to play sounds. Please check your audio.");
        resolve();
      });
    });
  };

  const playCurrentWord = async () => {
    try {
      setIsPlaying(true);
      setError(null);
      const currentWord = WORDS[currentWordIndex];
      for (const sound of currentWord.sounds) {
        if (sound) {
          await playSound(sound);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      setIsPlaying(false);
      setShowResponse(true);
    } catch (err) {
      setError("Error playing sounds. Please try again.");
      setIsPlaying(false);
    }
  };

  // --- Web Speech API logic ---
  const startRecognition = () => {
    setError(null);
    setTranscript("");
    setIsRecording(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Your browser does not support the Web Speech API.");
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map(result => result[0].transcript)
        .join("")
        .toLowerCase()
        .trim()
        .replace(/[.,!?;:]*$/, "");
      setTranscript(text);
      setUserResponses(prev => [...prev, text]);
      setReadyForNext(true);
      setIsRecording(false);
    };

    recognition.onerror = (event) => {
      setError("Transcription error: " + event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const moveToNextWord = () => {
    const currentWord = WORDS[currentWordIndex];
    const finalResponse = userResponses.length > 0 ? userResponses[userResponses.length - 1] : "";
    const isCorrect = currentWord.alternatives
      ? [...currentWord.alternatives, currentWord.word.toLowerCase()].includes(finalResponse)
      : finalResponse === currentWord.word.toLowerCase();
    const newResponse = {
      wordId: currentWord.id,
      word: currentWord.word,
      response: finalResponse,
      isCorrect,
    };
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentWordIndex === WORDS.length - 1) {
      setShowFinalSubmit(true);
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowResponse(false);
      setTranscript("");
      setUserResponses([]);
      setReadyForNext(false);
    }
  };

  const skipWord = () => {
    const currentWord = WORDS[currentWordIndex];
    const newResponse = {
      wordId: currentWord.id,
      word: currentWord.word,
      response: "[skipped]",
      isCorrect: false,
    };
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentWordIndex === WORDS.length - 1) {
      setShowFinalSubmit(true);
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowResponse(false);
      setTranscript("");
      setUserResponses([]);
      setReadyForNext(false);
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setLoadingMessage("Submitting your results...");
    await finishGame(responses);
    setIsLoading(false);
  };

  const finishGame = async (responsesToSubmit) => {
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId") || (student && student.id);
    const incorrectCount = responsesToSubmit.filter((r) => !r.isCorrect).length;
    const rawScore = 20 - incorrectCount;
    const finalScore = Math.min(10, Math.round(rawScore / 2));

    try {
      await axios.post(
        `${backendURL}/submitResults`,
        {
          responses: responsesToSubmit.map((r) => ({
            wordId: r.wordId,
            isCorrect: r.isCorrect,
          })),
          normalized_score: finalScore,
          total_score: rawScore,
          studentId: student?.id,
          childId: childId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (suppressResultPage) {
        onComplete(finalScore);
      } else {
        setGameState("results");
      }
    } catch (err) {
      setError("Failed to save results. You can try again later.");
      if (suppressResultPage) {
        onComplete(0);
      } else {
        setGameState("results");
      }
    }
  };

  const restartGame = () => {
    setCurrentWordIndex(0);
    setResponses([]);
    setError(null);
    setShowFinalSubmit(false);
    setGameState("playing");
  };

  if (gameState === "results") {
    const incorrectCount = responses.filter((r) => !r.isCorrect).length;
    const rawScore = 20 - incorrectCount;
    const finalScore = Math.min(10, Math.round(rawScore / 2));
    const percentage = Math.round((finalScore / 10) * 100);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6"
        >
          <div className="text-center">
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="inline-block bg-blue-100 p-3 rounded-full mb-4"
            >
              {finalScore >= 8 ? "🎉" : finalScore >= 5 ? "👍" : "🌱"}
            </motion.div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600">
              Test Completed!
            </h1>
          </div>
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <svg className="w-36 h-36" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e6e6e6"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${percentage}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#60A5FA" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500"
                >
                  {finalScore}/10
                </motion.span>
                <span className="text-sm font-medium text-blue-800">
                  {responses.filter((r) => r.isCorrect).length}/{WORDS.length} correct
                </span>
              </div>
            </motion.div>
          </div>
          <div className="max-h-64 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 p-1">
            <AnimatePresence>
              {responses.map((item, index) => (
                <ResultCard key={index} item={item} index={index} />
              ))}
            </AnimatePresence>
          </div>
          <Button onClick={() => onComplete(finalScore)} variant="primary" className="w-full">
            <ArrowRight className="h-5 w-5" />
            Continue to Next Test
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentWord = WORDS[currentWordIndex];
  const progress = ((currentWordIndex + (showResponse ? 1 : 0)) / WORDS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-50 p-6">
      <AnimatePresence>
        {isLoading && <LoadingOverlay message={loadingMessage} />}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-6"
      >
        <div className="space-y-1">
          <ProgressBar progress={progress} />
          <div className="flex justify-between text-xs text-blue-500">
            <span>Start</span>
            <span>Word {currentWordIndex + 1} of {WORDS.length}</span>
            <span>Finish</span>
          </div>
        </div>
        <div className="text-center space-y-1">
          <motion.h2
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600"
          >
            Blend the Sounds!
          </motion.h2>
          <p className="text-blue-600 font-medium">
            {showResponse ? "Say the word you heard" : "Listen carefully"}
          </p>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-sm"
          >
            <div className="flex items-center">
              <div className="mr-2">⚠️</div>
              <p>{error}</p>
            </div>
          </motion.div>
        )}
        <motion.div
          animate={{
            scale: isPlaying || isRecording ? [1, 1.1, 1] : 1,
            rotate: isPlaying ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: isPlaying || isRecording ? 2 : 0.5,
            repeat: isPlaying || isRecording ? Infinity : 0,
          }}
          className="flex justify-center text-8xl my-6"
        >
          {isPlaying ? "👂" : showResponse ? (isRecording ? "🎙️" : "🎤") : "🔊"}
        </motion.div>
        {!showResponse ? (
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-blue-50 rounded-lg p-4 shadow-sm border border-blue-100"
            >
              <p className="text-center text-blue-700">
                Listen to the sounds and combine them to form a word
              </p>
            </motion.div>
            <Button
              onClick={playCurrentWord}
              disabled={isPlaying}
              variant={isPlaying ? "secondary" : "primary"}
              className="w-full"
            >
              <Volume2 className="h-5 w-5" />
              {isPlaying ? "Playing Sounds..." : "Play Sounds"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100"
            >
              <p className="text-center font-medium text-blue-700">
                What word did you hear?
              </p>
            </motion.div>
            <div className="flex flex-col items-center space-y-3">
              <AnimatePresence>
                {userResponses.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg w-full border border-blue-100 shadow-sm"
                  >
                    <p className="font-medium text-blue-700 mb-2">Your responses:</p>
                    <ul className="space-y-2">
                      {userResponses.map((response, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className={`p-2 rounded-md ${
                            index === userResponses.length - 1
                              ? "bg-blue-100 font-medium border-l-4 border-blue-400"
                              : "bg-white bg-opacity-60"
                          }`}
                        >
                          {index + 1}. {response || "[No response detected]"}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                onClick={isRecording ? stopRecognition : startRecognition}
                variant={isRecording ? "danger" : "primary"}
                className="w-full"
              >
                {isRecording ? (
                  <>
                    <div className="flex items-center">
                      <span className="relative flex h-3 w-3 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                      </span>
                      <MicOff className="h-5 w-5" />
                    </div>
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    Press & Speak
                  </>
                )}
              </Button>
              <div className="flex gap-2 w-full mt-2">
                {!showFinalSubmit && (
                  <Button
                    onClick={skipWord}
                    variant="warning"
                    className="flex-1"
                  >
                    <SkipForward className="h-5 w-5" />
                    Skip
                  </Button>
                )}
                {userResponses.length > 0 && !showFinalSubmit && (
                  <Button
                    onClick={moveToNextWord}
                    variant="success"
                    className="flex-1"
                  >
                    <ArrowRight className="h-5 w-5" />
                    Next
                  </Button>
                )}
              </div>
              {showFinalSubmit && (
                <Button 
                  onClick={handleFinalSubmit} 
                  variant="primary" 
                  className="w-full"
                  isLoading={isLoading}
                >
                  Submit All Results
                </Button>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}