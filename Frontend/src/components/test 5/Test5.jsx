// import { useEffect, useState, useRef } from "react";
// import { toast } from "sonner";
// import axios from "axios";
// import { pythonURL, backendURL } from "../../definedURL";
// import { motion, AnimatePresence } from "framer-motion";
// import Confetti from "react-confetti";
// import useWindowSize from "react-use/lib/useWindowSize";
// import PropTypes from "prop-types";

// const GraphemeTest = ({ suppressResultPage = false, onComplete }) => {
//   const [letters] = useState([
//     "w",
//     "a",
//     "j",
//     "c",
//     "e",
//     "i",
//     "x",
//     "o",
//     "z",
//     "l",
//     "s",
//     "h",
//     "v",
//     "k",
//     "u",
//     "t",
//     "r",
//     "f",
//     "n",
//     "p",
//     "m",
//     "d",
//     "y",
//     "b",
//     "g",
//     "q",
//     "A",
//     "L",
//     "G",
//     "Z",
//     "U",
//     "B",
//     "H",
//     "I",
//     "O",
//     "S",
//     "N",
//     "D",
//     "K",
//     "T",
//     "R",
//     "V",
//     "M",
//     "Q",
//     "F",
//     "X",
//     "P",
//     "Y",
//     "J",
//     "E",
//     "C",
//     "W",
//   ]);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isRecording, setIsRecording] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(5);
//   const [showSubmit, setShowSubmit] = useState(false);
//   const [showResults, setShowResults] = useState(false);
//   const [score, setScore] = useState(0);
//   const { width, height } = useWindowSize();
//   const mediaRecorderRef = useRef(null);
//   const streamRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   const childId = localStorage.getItem("childId");
//   const token = localStorage.getItem("access_token");

//   useEffect(() => {
//     if (!isRecording || timeLeft <= 0) return;

//     const timer = setTimeout(() => {
//       setTimeLeft(timeLeft - 1);
//     }, 1000);

//     return () => clearTimeout(timer);
//   }, [timeLeft, isRecording]);

//   useEffect(() => {
//     if (currentIndex < letters.length) {
//       setTimeLeft(5);
//       const timeout = setTimeout(() => {
//         handleRecording();
//       }, 1000);

//       return () => clearTimeout(timeout);
//     } else {
//       stopRecording();
//       setShowSubmit(true);
//     }
//   }, [currentIndex]);

//   const handleRecording = async () => {
//     if (!isRecording && currentIndex === 0) {
//       setIsRecording(true);
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//         });
//         streamRef.current = stream;
//         const recorder = new MediaRecorder(stream);
//         mediaRecorderRef.current = recorder;
//         audioChunksRef.current = [];

//         recorder.ondataavailable = (e) => {
//           audioChunksRef.current.push(e.data);
//         };

//         recorder.start();
//         setIsRecording(true);
//       } catch (err) {
//         console.error("Error accessing microphone:", err);
//         toast.error("Microphone permission denied");
//         setCurrentIndex(letters.length);
//         return;
//       }
//     }

//     const timer = setTimeout(() => {
//       setCurrentIndex((prev) => prev + 1);
//     }, 5000);

//     return () => clearTimeout(timer);
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.requestData();
//       mediaRecorderRef.current.stop();
//       streamRef.current?.getTracks().forEach((track) => track.stop());
//       setIsRecording(false);
//     }
//   };

//   const handleSubmit = async () => {
//     setShowSubmit(false);
//     toast.loading("Processing your recording...");

//     try {
//       const audioBlob = new Blob(audioChunksRef.current, {
//         type: "audio/webm",
//       });
//       const formData = new FormData();
//       formData.append("file", audioBlob, "full_recording.webm");

//       const response = await axios.post(`${pythonURL}/transcribe`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       const transcription = response.data.transcription.trim();
//       const words = transcription
//         .split(/\s+/)
//         .filter((word) => word.length > 0);
//       const transcriptions = letters.map((_, index) => words[index] || "");

//       const evalResponse = await axios.post(
//         `${backendURL}/evaluate-grapheme-test`,
//         { childId, letters, transcriptions },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       toast.dismiss();
//       setScore(evalResponse.data.score);
//       if (suppressResultPage && typeof onComplete === 'function') {
//         onComplete(evalResponse.data.score);
//       } else {
//         setShowResults(true);
//       }
//     } catch (error) {
//       toast.dismiss();
//       toast.error("Failed to process results");
//       console.error(error);
//     }
//   };

//   const restartTest = () => {
//     setCurrentIndex(0);
//     audioChunksRef.current = [];
//     setShowResults(false);
//     setShowSubmit(false);
//     setScore(0);
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6"
//     >
//       {showResults && (
//         <Confetti width={width} height={height} recycle={false} colors={['#2563EB', '#60A5FA', '#93C5FD', '#FFFFFF']} />
//       )}

//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-blue-100"
//       >
//         <div className="text-center mb-8">
//           <motion.h1
//             initial={{ y: -10 }}
//             animate={{ y: 0 }}
//             className="text-4xl font-bold text-blue-600 mb-2"
//           >
//             Letter Challenge
//           </motion.h1>
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             <p className="text-lg text-blue-600/80">Say the letter you see!</p>
//           </motion.div>
//         </div>

//         <div className="mb-8">
//           <div className="flex justify-between mb-2">
//             <span className="text-md font-medium text-blue-700">
//               Progress: {currentIndex}/{letters.length}
//             </span>
//             <span className="text-md font-medium text-blue-700">
//               {Math.round((currentIndex / letters.length) * 100)}%
//             </span>
//           </div>
//           <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: `${(currentIndex / letters.length) * 100}%` }}
//               transition={{ duration: 0.5, ease: "easeOut" }}
//               className="bg-blue-600 h-3 rounded-full"
//             ></motion.div>
//           </div>
//         </div>

//         <AnimatePresence mode="wait">
//           {currentIndex < letters.length ? (
//             <motion.div
//               key={`letter-${currentIndex}`}
//               initial={{ scale: 0.8, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.8, opacity: 0, y: -20 }}
//               transition={{ duration: 0.4 }}
//               className="flex flex-col items-center"
//             >
//               <div className="relative">
//                 <motion.div
//                   whileHover={{ scale: 1.05 }}
//                   transition={{ type: "spring", stiffness: 300 }}
//                   className="w-64 h-64 bg-blue-50 rounded-2xl flex items-center justify-center shadow-lg mb-8 border-2 border-blue-200"
//                 >
//                   <span className="text-9xl font-extrabold text-blue-700">
//                     {letters[currentIndex]}
//                   </span>
//                 </motion.div>

//                 <div className="absolute -top-5 -right-5">
//                   <div className="relative w-20 h-20">
//                     <svg className="w-full h-full" viewBox="0 0 36 36">
//                       <path
//                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                         fill="none"
//                         stroke="#DBEAFE"
//                         strokeWidth="3"
//                       />
//                       <path
//                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                         fill="none"
//                         stroke="#2563EB"
//                         strokeWidth="3"
//                         strokeDasharray={`${(timeLeft / 5) * 100}, 100`}
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <span className="text-xl font-bold text-blue-700">
//                         {timeLeft}s
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <motion.div
//                 animate={{ opacity: isRecording ? 1 : 0.7 }}
//                 transition={{ duration: 0.3 }}
//                 className="flex items-center mb-6"
//               >
//                 <motion.div
//                   animate={{
//                     scale: isRecording ? [1, 1.2, 1] : 1,
//                     backgroundColor: isRecording ? "#EF4444" : "#94A3B8"
//                   }}
//                   transition={{
//                     repeat: isRecording ? Infinity : 0,
//                     duration: 1.5
//                   }}
//                   className="w-5 h-5 rounded-full mr-2"
//                 ></motion.div>
//                 <span className="text-lg text-blue-700">
//                   {isRecording ? "Recording..." : "Ready"}
//                 </span>
//               </motion.div>
//             </motion.div>
//           ) : showResults ? (
//             <motion.div
//               key="results"
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               transition={{ duration: 0.5 }}
//               className="text-center py-8"
//             >
//               <motion.div
//                 initial={{ y: -20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.2 }}
//                 className="text-5xl mb-6"
//               >
//                 🎉
//               </motion.div>
//               <motion.h2
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.3 }}
//                 className="text-2xl font-bold text-blue-700 mb-2"
//               >
//                 Test Complete!
//               </motion.h2>
//               <motion.p
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.4 }}
//                 className="text-blue-600 mb-6"
//               >
//                 You scored {score} out of {letters.length}!
//               </motion.p>
//               <div className="w-full bg-blue-100 rounded-full h-4 mb-6 overflow-hidden">
//                 <motion.div
//                   initial={{ width: 0 }}
//                   animate={{ width: `${(score / letters.length) * 100}%` }}
//                   transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
//                   className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full"
//                 ></motion.div>
//               </div>
//               <motion.button
//                 initial={{ y: 10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.6 }}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={restartTest}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
//               >
//                 Try Again
//               </motion.button>
//             </motion.div>
//           ) : showSubmit ? (
//             <motion.div
//               key="submit"
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               transition={{ duration: 0.5 }}
//               className="text-center py-8"
//             >
//               <motion.h2
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//                 className="text-2xl font-bold text-blue-700 mb-4"
//               >
//                 Ready to Submit?
//               </motion.h2>
//               <motion.p
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ duration: 0.3, delay: 0.1 }}
//                 className="text-blue-600 mb-6"
//               >
//                 You&apos;ve recorded all letters. Click below to process your results.
//               </motion.p>
//               <motion.button
//                 initial={{ y: 10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ duration: 0.3, delay: 0.2 }}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={handleSubmit}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
//               >
//                 Submit Recording
//               </motion.button>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="processing"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="text-center py-8"
//             >
//               <motion.p
//                 animate={{ opacity: [0.5, 1, 0.5] }}
//                 transition={{ repeat: Infinity, duration: 1.5 }}
//                 className="text-xl text-blue-600"
//               >
//                 Processing results...
//               </motion.p>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>

//       {!showResults && currentIndex < letters.length && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6 }}
//           className="mt-6 text-center"
//         >
//           <p className="text-blue-500 font-medium">
//             {["✨", "🎯", "💡", "🔊", "👏"][currentIndex % 5]} Say it loud and
//             clear!
//           </p>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// GraphemeTest.propTypes = {
//   suppressResultPage: PropTypes.bool,
//   onComplete: PropTypes.func,
// };

// export default GraphemeTest;

// import { useEffect, useState, useRef } from "react";
// import { toast } from "sonner";
// import axios from "axios";
// import { backendURL } from "../../definedURL";
// import { motion, AnimatePresence } from "framer-motion";
// import Confetti from "react-confetti";
// import useWindowSize from "react-use/lib/useWindowSize";
// import PropTypes from "prop-types";

// const GraphemeTest = ({ suppressResultPage = false, onComplete }) => {
//   const [letters] = useState([
//     "w", "a", "j", "c", "e", "i", "x", "o", "z", "l", "s", "h", "v", "k", "u", "t", "r", "f", "n", "p", "m", "d", "y", "b", "g", "q", "A", "L", "G", "Z", "U", "B", "H", "I", "O", "S", "N", "D", "K", "T", "R", "V", "M", "Q", "F", "X", "P", "Y", "J", "E", "C", "W",
//   ]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isRecording, setIsRecording] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(5);
//   const [showSubmit, setShowSubmit] = useState(false);
//   const [showResults, setShowResults] = useState(false);
//   const [score, setScore] = useState(0);
//   const [transcriptions, setTranscriptions] = useState([]);
//   const [currentTranscript, setCurrentTranscript] = useState("");
//   const recognitionRef = useRef(null);
//   const timerRef = useRef(null);
//   const { width, height } = useWindowSize();

//   const childId = localStorage.getItem("childId");
//   const token = localStorage.getItem("access_token");

//   // Setup SpeechRecognition
//   useEffect(() => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       toast.error("Speech Recognition is not supported in this browser.");
//       return;
//     }
//     recognitionRef.current = new SpeechRecognition();
//     recognitionRef.current.lang = "en-US";
//     recognitionRef.current.interimResults = false;
//     recognitionRef.current.maxAlternatives = 1;
//   }, []);

//   useEffect(() => {
//     if (!isRecording || timeLeft <= 0) return;
//     timerRef.current = setTimeout(() => {
//       setTimeLeft(timeLeft - 1);
//     }, 1000);
//     return () => clearTimeout(timerRef.current);
//   }, [timeLeft, isRecording]);

//   useEffect(() => {
//     if (currentIndex < letters.length) {
//       setTimeLeft(5);
//       const timeout = setTimeout(() => {
//         handleRecording();
//       }, 1000);
//       return () => clearTimeout(timeout);
//     } else {
//       stopRecording();
//       setShowSubmit(true);
//     }
//     // eslint-disable-next-line
//   }, [currentIndex]);

//   const handleRecording = () => {
//     if (!recognitionRef.current) {
//       toast.error("Speech Recognition is not available.");
//       setCurrentIndex(letters.length);
//       return;
//     }
//     setIsRecording(true);
//     setTimeLeft(5);
//     setCurrentTranscript(""); // Clear previous

//     let spoken = "";
//     recognitionRef.current.onresult = (event) => {
//       if (event.results.length > 0) {
//         spoken = event.results[0][0].transcript.trim();
//         setCurrentTranscript(spoken); // Show immediately
//       }
//     };

//     recognitionRef.current.onerror = (event) => {
//       toast.error("Speech Recognition error: " + event.error);
//       spoken = "";
//       setCurrentTranscript("");
//     };

//     recognitionRef.current.onend = () => {
//       setIsRecording(false);
//       setTranscriptions((prev) => {
//         const updated = [...prev];
//         updated[currentIndex] = spoken;
//         return updated;
//       });
//       setTimeout(() => setCurrentIndex((prev) => prev + 1), 500);
//     };

//     recognitionRef.current.start();

//     // Stop after 5 seconds if not already stopped
//     setTimeout(() => {
//       if (isRecording && recognitionRef.current) {
//         recognitionRef.current.stop();
//       }
//     }, 5000);
//   };

//   const stopRecording = () => {
//     if (recognitionRef.current && isRecording) {
//       recognitionRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   const handleSubmit = async () => {
//     setShowSubmit(false);
//     toast.loading("Processing your recording...");
//     try {
//       // Ensure all transcriptions are available
//       const filledTranscriptions = letters.map((_, idx) => transcriptions[idx] || "");
//       const evalResponse = await axios.post(
//         `${backendURL}/evaluate-grapheme-test`,
//         { childId, letters, transcriptions: filledTranscriptions },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       toast.dismiss();
//       setScore(evalResponse.data.score);
//       if (suppressResultPage && typeof onComplete === "function") {
//         onComplete(evalResponse.data.score);
//       } else {
//         setShowResults(true);
//       }
//     } catch (error) {
//       toast.dismiss();
//       toast.error("Failed to process results");
//       console.error(error);
//     }
//   };

//   const restartTest = () => {
//     setCurrentIndex(0);
//     setTranscriptions([]);
//     setShowResults(false);
//     setShowSubmit(false);
//     setScore(0);
//     setCurrentTranscript("");
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6"
//     >
//       {showResults && (
//         <Confetti width={width} height={height} recycle={false} colors={['#2563EB', '#60A5FA', '#93C5FD', '#FFFFFF']} />
//       )}

//       <motion.div
//         initial={{ y: 20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-blue-100"
//       >
//         <div className="text-center mb-8">
//           <motion.h1
//             initial={{ y: -10 }}
//             animate={{ y: 0 }}
//             className="text-4xl font-bold text-blue-600 mb-2"
//           >
//             Letter Challenge
//           </motion.h1>
//           <motion.div
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             <p className="text-lg text-blue-600/80">Say the letter you see!</p>
//           </motion.div>
//         </div>

//         <div className="mb-8">
//           <div className="flex justify-between mb-2">
//             <span className="text-md font-medium text-blue-700">
//               Progress: {currentIndex}/{letters.length}
//             </span>
//             <span className="text-md font-medium text-blue-700">
//               {Math.round((currentIndex / letters.length) * 100)}%
//             </span>
//           </div>
//           <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
//             <motion.div
//               initial={{ width: 0 }}
//               animate={{ width: `${(currentIndex / letters.length) * 100}%` }}
//               transition={{ duration: 0.5, ease: "easeOut" }}
//               className="bg-blue-600 h-3 rounded-full"
//             ></motion.div>
//           </div>
//         </div>

//         <AnimatePresence mode="wait">
//           {currentIndex < letters.length ? (
//             <motion.div
//               key={`letter-${currentIndex}`}
//               initial={{ scale: 0.8, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.8, opacity: 0, y: -20 }}
//               transition={{ duration: 0.4 }}
//               className="flex flex-col items-center"
//             >
//               <div className="relative">
//                 <motion.div
//                   whileHover={{ scale: 1.05 }}
//                   transition={{ type: "spring", stiffness: 300 }}
//                   className="w-64 h-64 bg-blue-50 rounded-2xl flex items-center justify-center shadow-lg mb-8 border-2 border-blue-200"
//                 >
//                   <span className="text-9xl font-extrabold text-blue-700">
//                     {letters[currentIndex]}
//                   </span>
//                 </motion.div>
//                 <div className="absolute -top-5 -right-5">
//                   <div className="relative w-20 h-20">
//                     <svg className="w-full h-full" viewBox="0 0 36 36">
//                       <path
//                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                         fill="none"
//                         stroke="#DBEAFE"
//                         strokeWidth="3"
//                       />
//                       <path
//                         d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//                         fill="none"
//                         stroke="#2563EB"
//                         strokeWidth="3"
//                         strokeDasharray={`${(timeLeft / 5) * 100}, 100`}
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                     <div className="absolute inset-0 flex items-center justify-center">
//                       <span className="text-xl font-bold text-blue-700">
//                         {timeLeft}s
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <motion.div
//                 animate={{ opacity: isRecording ? 1 : 0.7 }}
//                 transition={{ duration: 0.3 }}
//                 className="flex items-center mb-3"
//               >
//                 <motion.div
//                   animate={{
//                     scale: isRecording ? [1, 1.2, 1] : 1,
//                     backgroundColor: isRecording ? "#EF4444" : "#94A3B8"
//                   }}
//                   transition={{
//                     repeat: isRecording ? Infinity : 0,
//                     duration: 1.5
//                   }}
//                   className="w-5 h-5 rounded-full mr-2"
//                 ></motion.div>
//                 <span className="text-lg text-blue-700">
//                   {isRecording ? "Recording..." : "Ready"}
//                 </span>
//               </motion.div>

//               {/* Show the current transcript */}
//               <div className="mb-4">
//                 <span className="text-blue-600 text-lg font-medium">
//                   {currentTranscript && (
//                     <>
//                       <span>Heard:&nbsp;</span>
//                       <span className="bg-blue-100 px-2 py-1 rounded">{currentTranscript}</span>
//                     </>
//                   )}
//                 </span>
//               </div>

//               {/* Show all previous transcriptions */}
//               <div className="w-full max-w-md mt-4">
//                 <h3 className="text-blue-700 font-semibold mb-2 text-left">Your Answers So Far:</h3>
//                 <ul className="text-blue-600 text-left text-base">
//                   {letters.slice(0, currentIndex).map((letter, idx) => (
//                     <li key={idx}>
//                       <span className="font-bold">{letter}:</span>{" "}
//                       <span className="bg-blue-50 px-1 rounded">{transcriptions[idx] || <em>Not heard</em>}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </motion.div>
//           ) : showResults ? (
//             <motion.div
//               key="results"
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               transition={{ duration: 0.5 }}
//               className="text-center py-8"
//             >
//               <motion.div
//                 initial={{ y: -20, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.2 }}
//                 className="text-5xl mb-6"
//               >
//                 🎉
//               </motion.div>
//               <motion.h2
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.3 }}
//                 className="text-2xl font-bold text-blue-700 mb-2"
//               >
//                 Test Complete!
//               </motion.h2>
//               <motion.p
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.4 }}
//                 className="text-blue-600 mb-6"
//               >
//                 You scored {score} out of {letters.length}!
//               </motion.p>
//               <div className="w-full bg-blue-100 rounded-full h-4 mb-6 overflow-hidden">
//                 <motion.div
//                   initial={{ width: 0 }}
//                   animate={{ width: `${(score / letters.length) * 100}%` }}
//                   transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
//                   className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full"
//                 ></motion.div>
//               </div>
//               <motion.button
//                 initial={{ y: 10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ delay: 0.6 }}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={restartTest}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
//               >
//                 Try Again
//               </motion.button>
//             </motion.div>
//           ) : showSubmit ? (
//             <motion.div
//               key="submit"
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               transition={{ duration: 0.5 }}
//               className="text-center py-8"
//             >
//               <motion.h2
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ duration: 0.3 }}
//                 className="text-2xl font-bold text-blue-700 mb-4"
//               >
//                 Ready to Submit?
//               </motion.h2>
//               <motion.p
//                 initial={{ y: -10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ duration: 0.3, delay: 0.1 }}
//                 className="text-blue-600 mb-6"
//               >
//                 You&apos;ve recorded all letters. Click below to process your results.
//               </motion.p>
//               <motion.button
//                 initial={{ y: 10, opacity: 0 }}
//                 animate={{ y: 0, opacity: 1 }}
//                 transition={{ duration: 0.3, delay: 0.2 }}
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={handleSubmit}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
//               >
//                 Submit Recording
//               </motion.button>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="processing"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="text-center py-8"
//             >
//               <motion.p
//                 animate={{ opacity: [0.5, 1, 0.5] }}
//                 transition={{ repeat: Infinity, duration: 1.5 }}
//                 className="text-xl text-blue-600"
//               >
//                 Processing results...
//               </motion.p>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </motion.div>

//       {!showResults && currentIndex < letters.length && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.6 }}
//           className="mt-6 text-center"
//         >
//           <p className="text-blue-500 font-medium">
//             {["✨", "🎯", "💡", "🔊", "👏"][currentIndex % 5]} Say it loud and clear!
//           </p>
//         </motion.div>
//       )}
//     </motion.div>
//   );
// };

// GraphemeTest.propTypes = {
//   suppressResultPage: PropTypes.bool,
//   onComplete: PropTypes.func,
// };

// export default GraphemeTest;

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { backendURL } from "../../definedURL";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import PropTypes from "prop-types";

const GraphemeTest = ({ suppressResultPage = false, onComplete }) => {
  const [letters] = useState([
    "w",
    "a",
    "j",
    "c",
    "e",
    "i",
    "x",
    "o",
    "z",
    "l",
    "s",
    "h",
    "v",
    "k",
    "u",
    "t",
    "r",
    "f",
    "n",
    "p",
    "m",
    "d",
    "y",
    "b",
    "g",
    "q",
    "A",
    "L",
    "G",
    "Z",
    "U",
    "B",
    "H",
    "I",
    "O",
    "S",
    "N",
    "D",
    "K",
    "T",
    "R",
    "V",
    "M",
    "Q",
    "F",
    "X",
    "P",
    "Y",
    "J",
    "E",
    "C",
    "W",
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const { width, height } = useWindowSize();
  const recognitionRef = useRef(null);
  const transcriptionsRef = useRef([]);

  const childId = localStorage.getItem("childId");
  const token = localStorage.getItem("access_token");

  // Timer for each letter
  useEffect(() => {
    if (!isRecording || timeLeft <= 0) return;
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isRecording]);

  // Start next letter or finish
  useEffect(() => {
    if (currentIndex < letters.length) {
      setTimeLeft(5);
      setCurrentTranscript(""); // Clear transcript for new letter
      const timeout = setTimeout(() => {
        handleRecording();
      }, 1000);
      return () => clearTimeout(timeout);
    } else {
      stopRecording();
      setShowSubmit(true);
    }
    // eslint-disable-next-line
  }, [currentIndex]);

  // Initialize Web Speech API
  const initializeSpeechRecognition = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Web Speech API is not supported in this browser");
      return null;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript.trim();
      setCurrentTranscript(speechResult);
      transcriptionsRef.current.push(speechResult);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      toast.error("Speech recognition error occurred");
      setCurrentTranscript("");
      transcriptionsRef.current.push("");
    };

    return recognition;
  };

  // Handle recording for each letter
  const handleRecording = async () => {
    if (!isRecording && currentIndex === 0) {
      recognitionRef.current = initializeSpeechRecognition();
      if (!recognitionRef.current) {
        setCurrentIndex(letters.length);
        return;
      }
      transcriptionsRef.current = [];
      setIsRecording(true);
    }

    if (recognitionRef.current) {
      try {
        setCurrentTranscript(""); // Clear before listening
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        toast.error("Speech recognition failed");
        setCurrentIndex(letters.length);
        return;
      }
    }

    // Move to next letter after 5 seconds
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearTimeout(timer);
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    setShowSubmit(false);
    toast.loading("Processing your results...");
    try {
      // Wait to ensure all recognition results are processed
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const transcriptions = transcriptionsRef.current;
      // Fill missing transcriptions with empty strings
      while (transcriptions.length < letters.length) {
        transcriptions.push("");
      }
      const evalResponse = await axios.post(
        `${backendURL}/evaluate-grapheme-test`,
        { childId, letters, transcriptions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.dismiss();
      setScore(evalResponse.data.score);
      if (suppressResultPage && typeof onComplete === "function") {
        onComplete(evalResponse.data.score);
      } else {
        setShowResults(true);
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to process results");
      console.error(error);
    }
  };

  // Restart test
  const restartTest = () => {
    setCurrentIndex(0);
    transcriptionsRef.current = [];
    setShowResults(false);
    setShowSubmit(false);
    setScore(0);
    setCurrentTranscript("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6"
    >
      {showResults && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          colors={["#2563EB", "#60A5FA", "#93C5FD", "#FFFFFF"]}
        />
      )}

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-blue-100"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold text-blue-600 mb-2"
          >
            Letter Challenge
          </motion.h1>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg text-blue-600/80">Say the letter you see!</p>
          </motion.div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-md font-medium text-blue-700">
              Progress: {currentIndex}/{letters.length}
            </span>
            <span className="text-md font-medium text-blue-700">
              {Math.round((currentIndex / letters.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentIndex / letters.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-blue-600 h-3 rounded-full"
            ></motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentIndex < letters.length ? (
            <motion.div
              key={`letter-${currentIndex}`}
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-64 h-64 bg-blue-50 rounded-2xl flex items-center justify-center shadow-lg mb-8 border-2 border-blue-200"
                >
                  <span className="text-9xl font-extrabold text-blue-700">
                    {letters[currentIndex]}
                  </span>
                </motion.div>
                <div className="absolute -top-5 -right-5">
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#DBEAFE"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3"
                        strokeDasharray={`${(timeLeft / 5) * 100}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-700">
                        {timeLeft}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                animate={{ opacity: isRecording ? 1 : 0.7 }}
                transition={{ duration: 0.3 }}
                className="flex items-center mb-3"
              >
                <motion.div
                  animate={{
                    scale: isRecording ? [1, 1.2, 1] : 1,
                    backgroundColor: isRecording ? "#EF4444" : "#94A3B8",
                  }}
                  transition={{
                    repeat: isRecording ? Infinity : 0,
                    duration: 1.5,
                  }}
                  className="w-5 h-5 rounded-full mr-2"
                ></motion.div>
                <span className="text-lg text-blue-700">
                  {isRecording ? "Listening..." : "Ready"}
                </span>
              </motion.div>

              {/* Show the current transcript */}
              <div className="mb-4">
                <span className="text-blue-600 text-lg font-medium">
                  {currentTranscript && (
                    <>
                      <span>Heard:&nbsp;</span>
                      <span className="bg-blue-100 px-2 py-1 rounded">
                        {currentTranscript}
                      </span>
                    </>
                  )}
                </span>
              </div>

              {/* Show all previous transcriptions */}
              {/* <div className="w-full max-w-md mt-4">
                <h3 className="text-blue-700 font-semibold mb-2 text-left">Your Answers So Far:</h3>
                <ul className="text-blue-600 text-left text-base">
                  {letters.slice(0, currentIndex).map((letter, idx) => (
                    <li key={idx}>
                      <span className="font-bold">{letter}:</span>{" "}
                      <span className="bg-blue-50 px-1 rounded">{transcriptionsRef.current[idx] || <em>Not heard</em>}</span>
                    </li>
                  ))}
                </ul>
              </div> */}
            </motion.div>
          ) : showResults ? (
            <motion.div
              key="results"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl mb-6"
              >
                🎉
              </motion.div>
              <motion.h2
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-blue-700 mb-2"
              >
                Test Complete!
              </motion.h2>
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-blue-600 mb-6"
              >
                You scored {score} out of {letters.length}!
              </motion.p>
              <div className="w-full bg-blue-100 rounded-full h-4 mb-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / letters.length) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full"
                ></motion.div>
              </div>
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={restartTest}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Try Again
              </motion.button>
            </motion.div>
          ) : showSubmit ? (
            <motion.div
              key="submit"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-8"
            >
              <motion.h2
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold text-blue-700 mb-4"
              >
                Ready to Submit?
              </motion.h2>
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="text-blue-600 mb-6"
              >
                You&apos;ve recorded all letters. Click below to process your
                results.
              </motion.p>
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
              >
                Submit Results
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-xl text-blue-600"
              >
                Processing results...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {!showResults && currentIndex < letters.length && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-blue-500 font-medium">
            {["✨", "🎯", "💡", "🔊", "👏"][currentIndex % 5]} Say it loud and
            clear!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

GraphemeTest.propTypes = {
  suppressResultPage: PropTypes.bool,
  onComplete: PropTypes.func,
};

export default GraphemeTest;
