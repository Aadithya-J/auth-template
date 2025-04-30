import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, HelpCircle, Mic, MicOff, Send, Volume2, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { backendURL, pythonURL } from "../../definedURL";

// --- Configuration ---
const DIGIT_DISPLAY_TIME = 1000;
const PAUSE_BETWEEN_DIGITS = 200;
const STARTING_FORWARD_SEQUENCES = [
  [4, 9], [3, 8],
  [7, 1, 2], [2, 6, 2],
  [6, 3, 5, 1], [1, 4, 5, 2],
  [2, 7, 4, 6, 9], [2, 4, 7, 1, 6],
  [6, 9, 1, 8, 3, 7], [1, 4, 5, 4, 7, 6]
];

const STARTING_REVERSE_SEQUENCES = [
  [7, 5], [2, 7],
  [5, 2, 7], [0, 1, 9],
  [4, 7, 3, 5], [1, 6, 8, 5],
  [1, 7, 5, 0, 4], [3, 5, 2, 1, 7],
  [8, 3, 9, 7, 5, 3], [1, 4, 0, 4, 7, 2]
];

const MAX_ERRORS = 2;

// --- Helper Functions ---
const speakText = (text, rate = 0.9, pitch = 1.1) => {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel(); // Cancel any ongoing speech
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = rate;
    speech.pitch = pitch;
    
    // Add event listener to track when speech ends
    speech.onend = () => {
      console.log("Speech finished");
      // If we need to do something after speech ends
    };
    
    window.speechSynthesis.speak(speech);
  } else {
    console.warn("Speech synthesis not supported in this browser.");
  }
};

const parseTranscript = (transcript) => {
  if (!transcript) return [];
  const digitMap = {
    zero: "0", one: "1", two: "2", three: "3", four: "4",
    five: "5", six: "6", seven: "7", eight: "8", nine: "9",
  };

  // Normalize: lowercase, remove punctuation, replace number words
  let cleaned = transcript.toLowerCase().replace(/[.,!?]/g, "");
  Object.entries(digitMap).forEach(([word, digit]) => {
    cleaned = cleaned.replace(new RegExp(`\\b${word}\\b`, 'g'), digit);
  });

  // Attempt to split by space and validate
  const spaceSplit = cleaned.trim().split(/\s+/);
  if (spaceSplit.every(item => /^\d$/.test(item))) {
    return spaceSplit.map(Number);
  }

  // Attempt to treat as concatenated digits
  const concatenated = cleaned.replace(/\s+/g, "");
  if (/^\d+$/.test(concatenated)) {
    return concatenated.split("").map(Number);
  }

  console.warn("Could not reliably parse transcript:", transcript);
  toast.warn("Couldn't understand the numbers clearly. Please try speaking again.");
  return []; // Return empty if parsing fails
};

// --- Component ---
function Test13({ suppressResultPage = false, onComplete }) {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState("instructions"); // instructions, presenting, listening, evaluating, finished
  const [mode, setMode] = useState("forward"); // forward, reverse
  const [sequences, setSequences] = useState(STARTING_FORWARD_SEQUENCES);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [currentSequence, setCurrentSequence] = useState([]);
  const [displayedDigit, setDisplayedDigit] = useState(null); // The digit currently shown
  const [digitIndex, setDigitIndex] = useState(0); // Index for presenting digits

  const [forwardScore, setForwardScore] = useState(0);
  const [reverseScore, setReverseScore] = useState(0);
  const [forwardErrors, setForwardErrors] = useState(0);
  const [reverseErrors, setReverseErrors] = useState(0);

  // Add effect to handle test completion
  useEffect(() => {
    if (gameState === "finished" && suppressResultPage && onComplete) {
      // Calculate final score - same formula used in submitResults
      const finalScore = Math.round((forwardScore + reverseScore) / 2);
      onComplete(finalScore);
    }
  }, [gameState, suppressResultPage, onComplete, forwardScore, reverseScore]);

  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null); // 'correct', 'incorrect', null
  const mediaRecorderRef = useRef(null);
  const timeoutRef = useRef(null);
  const presentNextDigitLogicRef = useRef(); // Ref to hold the latest logic

  // Ref to hold the current value of isRecording for use in callbacks
  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // --- Define functions first before they're used ---
  const uploadAudio = useCallback(async (audioBlob) => {
    const formData = new FormData();
    const file = new File([audioBlob], "user_digit_span.wav", { type: "audio/wav" });
    formData.append("file", file);

    setIsTranscribing(true);
    setEvaluationResult(null);
    try {
      const response = await fetch(`${pythonURL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log('Transcription API Response:', result); // Detailed logging

      if (response.ok) {
        setTranscript(result.transcription || "0 0");
        setGameState("evaluating");
      } else {
        console.error("Transcription error response:", result);
        toast.error("Transcription failed. Please try again.");
        setGameState("listening");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Error uploading audio. Please try again.");
      setGameState("listening");
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    // console.log("Attempting to stop listening...");

    // Stop the media recorder if it's recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
        // console.log("MediaRecorder.stop() called.");
      } catch (e) { console.error("Error stopping MediaRecorder:", e); }
    }

    // Stop all tracks on the stream
    if (window.stream) {
      try {
        window.stream.getTracks().forEach((track) => { track.stop(); });
        // console.log("Audio tracks stopped.");
      } catch (e) { console.error("Error stopping stream tracks:", e); }
      window.stream = null;
    }

    // Clean up the recorder reference *after* stopping
    mediaRecorderRef.current = null;

    // Update state: Use ref to check *current* value before setting
    if (isRecordingRef.current) { 
       setIsRecording(false);
    }
    // This function is the single source of truth for setting isRecording=false
  }, [isRecordingRef]); // Depend on the ref wrapper state

  const startListening = useCallback(() => {
    // console.log("Attempting to start listening...");
    if (isRecordingRef.current) { // Check ref first
      // console.log("Already recording (ref check), returning.");
      return;
    }

    setTranscript("");
    setEvaluationResult(null);
    // console.log("Requesting user media...");

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        //  console.log("Got user media stream.");
         window.stream = stream;
         let localAudioChunks = [];

         // Add listener for stream track ending unexpectedly
         if (stream.getAudioTracks().length > 0) {
            stream.getAudioTracks()[0].onended = () => {
              console.warn("Audio track ended unexpectedly!");
              // Attempt cleanup if the track ends prematurely
              stopListening();
            };
         }

         const newMediaRecorder = new MediaRecorder(stream);
         mediaRecorderRef.current = newMediaRecorder;
        //  console.log("New MediaRecorder created.");

         // Add onstart listener
         newMediaRecorder.onstart = () => {
            // console.log("MediaRecorder onstart event fired. State:", newMediaRecorder.state);
         };

         // Simplified ondataavailable
         newMediaRecorder.ondataavailable = (event) => {
           if (event.data && event.data.size > 0) {
             localAudioChunks.push(event.data);
           }
         };

         // Simplified onstop: Only handle data upload
         newMediaRecorder.onstop = async () => {
          //  console.log("MediaRecorder onstop triggered. State:", newMediaRecorder.state);
           // NO state changes here
           if (localAudioChunks.length > 0) {
             const audioBlob = new Blob(localAudioChunks, { type: "audio/wav" });
            //  const chunksToUpload = [...localAudioChunks]; 
             localAudioChunks = []; 
            //  console.log(`Uploading ${chunksToUpload.length} audio chunks from onstop.`);
             await uploadAudio(audioBlob); 
           } else { console.log("No audio chunks recorded in onstop."); }
         };

         newMediaRecorder.onerror = (event) => {
            console.error("MediaRecorder error event:", event.error, "State:", newMediaRecorder.state);
            stopListening(); // Use the main cleanup function on error
         };

         // Start recording
         try {
            newMediaRecorder.start();
            // console.log("MediaRecorder.start() called. Initial state:", newMediaRecorder.state);
            // It might still be 'inactive' immediately after start, 'onstart' confirms transition
         } catch (e) {
             console.error("Error calling MediaRecorder.start():", e);
             stopListening(); // Cleanup on start error
             return; // Don't proceed to set state if start failed
         }

         // Set state *after* starting
         setIsRecording(true);
        //  console.log("Set isRecording to true *after* media recorder start call.");
         
      })
      .catch((error) => {
        console.error("Error accessing microphone (getUserMedia):", error);
        toast.error("Could not access microphone. Please check permissions.");
        // stopListening handles state cleanup
        stopListening(); 
      });
  }, [uploadAudio, stopListening, isRecordingRef]); // Keep dependencies

  // Define stablePresentNextDigit before it's used
  const stablePresentNextDigit = useCallback((sequence, index) => {
    // Call the current implementation in the ref
    if (presentNextDigitLogicRef.current) {
      presentNextDigitLogicRef.current(sequence, index);
    }
  }, []);

  // --- Game Logic Callbacks ---
  // Memoized: Transition to the next mode (forward -> reverse or reverse -> finished)
  const moveToNextMode = useCallback(() => {
    // console.log("Moving to next mode...");
    stopListening();
    setEvaluationResult(null);
    setTranscript("");

    if (mode === "forward") {
      if (reverseErrors >= MAX_ERRORS) {
        setGameState("finished");
      } else {
        setMode("reverse");
        setSequences(STARTING_REVERSE_SEQUENCES);
        setSequenceIndex(0);
        setGameState("instructions_reverse");
      }
    } else {
      setGameState("finished");
    }
  }, [mode, reverseErrors, stopListening]);

  // Memoized: Transition to the next sequence within the current mode
  const moveToNextSequence = useCallback(() => {
    // console.log("Moving to next sequence...");
    stopListening();
    setEvaluationResult(null);
    setTranscript("");

    if (sequenceIndex + 1 < sequences.length) {
      setSequenceIndex(prev => prev + 1);
      setGameState("presenting"); // Go to presenting first
    } else {
      moveToNextMode();
    }
  }, [sequenceIndex, sequences.length, moveToNextMode, stopListening]);

  // Memoized: Evaluate the user's transcribed answer
  const evaluateAnswer = useCallback(() => {
    const userAnswer = parseTranscript(transcript);
    const correctAnswer = mode === "forward" ? currentSequence : [...currentSequence].reverse();

    // If we couldn't parse any numbers from the transcript
    if (userAnswer.length === 0) {
      toast.warning("Couldn't understand the numbers clearly. Let's try that sequence again.");
      setTranscript("");
      setGameState("presenting");
      return;
    }

    let isCorrect = userAnswer.length === correctAnswer.length &&
                    userAnswer.every((digit, i) => digit === correctAnswer[i]);

    setEvaluationResult(isCorrect ? 'correct' : 'incorrect');
    // Set feedback state based on correctness

    if (isCorrect) {
      speakText("Correct!", 0.9, 1.3);
      if (mode === "forward") setForwardScore(prev => prev + 1);
      else setReverseScore(prev => prev + 1);
      moveToNextSequence();
    } else {
      speakText("Not quite. Let's try the next one.", 0.9, 1.0);
      if (mode === "forward") setForwardErrors(prev => prev + 1);
      else setReverseErrors(prev => prev + 1);

      if ((mode === "forward" && forwardErrors + 1 >= MAX_ERRORS) || (mode === "reverse" && reverseErrors + 1 >= MAX_ERRORS)) {
        moveToNextMode();
      } else {
        moveToNextSequence();
      }
    }
  }, [transcript, mode, currentSequence, forwardErrors, reverseErrors, moveToNextSequence, moveToNextMode]);

  // --- Effect to update the ref with the latest digit presentation logic ---
  useEffect(() => {
    // Store a function that will call whatever is in the ref
    presentNextDigitLogicRef.current = (sequence, index) => {
      if (index >= sequence.length) {
        setDisplayedDigit(null);
        timeoutRef.current = setTimeout(() => {
          // console.log("Presentation finished, setting gameState to listening");
          setGameState("listening");
        }, 500);
        return;
      }

      const digit = sequence[index];
      setDisplayedDigit(digit);
      speakText(String(digit), 1, 1.2);

      timeoutRef.current = setTimeout(() => {
        setDisplayedDigit(null);
        timeoutRef.current = setTimeout(() => {
          if (presentNextDigitLogicRef.current) {
            presentNextDigitLogicRef.current(sequence, index + 1);
          }
        }, PAUSE_BETWEEN_DIGITS);
      }, DIGIT_DISPLAY_TIME);
    };
  }, [mode]);

  // --- Cleanup Effect ---
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      stopListening();
    };
  }, [stopListening]);

  // Effect to trigger presentation
  useEffect(() => {
    if (gameState === "presenting" && sequenceIndex < sequences.length) {
      setCurrentSequence(sequences[sequenceIndex]);
      setDigitIndex(0);
      setTranscript("");
      setEvaluationResult(null);
      timeoutRef.current = setTimeout(() => stablePresentNextDigit(sequences[sequenceIndex], 0), 500);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [gameState, sequenceIndex, sequences, stablePresentNextDigit]);

  // Effect to auto-start recording when moving to listening state
  useEffect(() => {
    if (gameState === "listening") {
      // console.log("Gamestate changed to listening, scheduling startListening...");
      speakText(mode === "forward" ? "Your turn. Say the numbers." : "Your turn. Say the numbers backwards.");
      
      const startTimeout = setTimeout(() => {
        if (!isRecordingRef.current) { 
           console.log("Timeout finished (1500ms), calling startListening");
           startListening();
        }
      }, 1500); // Increased delay
      return () => {
        //  console.log("Clearing startListening timeout.");
         clearTimeout(startTimeout);
      };
    }
  }, [gameState, startListening, mode]); // Keep dependencies

  // Effect to trigger evaluation
  useEffect(() => {
    if (gameState === "evaluating" && transcript) {
      evaluateAnswer();
    }
  }, [evaluateAnswer, gameState, transcript]);

  // --- Other Handlers ---
  const startTest = useCallback((selectedMode) => {
    setMode(selectedMode);
    setSequences(selectedMode === "forward" ? STARTING_FORWARD_SEQUENCES : STARTING_REVERSE_SEQUENCES);
    setSequenceIndex(0);
    setReverseScore(0);
    setReverseErrors(0);
    setTranscript("");
    setEvaluationResult(null);
    setGameState("presenting");
  }, []);

  const handleStartForward = useCallback(() => {
    speakText("Okay, let&apos;s start with forward numbers. Listen carefully, then say the numbers just like I do. Ready?");
    startTest("forward");
  }, [startTest]);

  const handleStartReverse = useCallback(() => {
    speakText("Great! Now for backwards numbers. When I say numbers, you say them the other way round. If I say 1, 3... you say 3, 1. Understand? Let&apos;s try.");
    startTest("reverse");
  }, [startTest]);

  const submitResults = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      toast.error("No student selected. Please select a student first.");
      return;
    }

    // Final score calculation: Total correct / 2, rounded
    const finalScore = Math.round((forwardScore + reverseScore) / 2);

    try {
      const response = await axios.post(`${backendURL}/addTest13`,
        {
          childId: childId,
          score: finalScore,
          forwardCorrect: forwardScore,
          reverseCorrect: reverseScore
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        toast.success(`Test Submitted! Final Score: ${finalScore}/10`, {
          position: "top-center",
          autoClose: 5000,
          onClose: () => navigate('/'),
        });
      } else {
        toast.error("Failed to submit results. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting test results:", error);
      toast.error("An error occurred while submitting. Please check connection or try again later.");
    }
  }, [forwardScore, reverseScore, navigate]);

  // --- UI Rendering ---
  const renderInstructions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center p-10 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto border border-gray-100"
    >
      <div className="mb-8">
        <Volume2 size={64} className="mx-auto text-blue-600" />
      </div>
      <h2 className="text-4xl font-bold text-gray-800 mb-8">
        Memory Test
      </h2>
      <div className="space-y-6 mb-10">
        <p className="text-xl text-gray-600 leading-relaxed">
          Welcome to an exciting memory game! Here&apos;s how to play:
        </p>
        <ul className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <li className="flex items-center gap-4 bg-blue-50 p-6 rounded-xl">
            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg">1</span>
            <span className="text-lg text-gray-700">Listen carefully to the numbers I say</span>
          </li>
          <li className="flex items-center gap-4 bg-blue-50 p-6 rounded-xl">
            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg">2</span>
            <span className="text-lg text-gray-700">When I finish, repeat them back exactly</span>
          </li>
          <li className="flex items-center gap-4 bg-blue-50 p-6 rounded-xl">
            <span className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold text-lg">3</span>
            <span className="text-lg text-gray-700">We&apos;ll start easy and get harder!</span>
          </li>
        </ul>
      </div>
      <button
        onClick={handleStartForward}
        className="group relative px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
      >
        Start the Test!
      </button>
    </motion.div>
  );

  const renderReverseInstructions = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center p-10 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto border border-gray-100"
    >
      <div className="mb-8">
        <HelpCircle size={64} className="mx-auto text-blue-600" />
      </div>
      <h2 className="text-4xl font-bold text-gray-800 mb-8">
        Level Up: Reverse Challenge!
      </h2>
      <div className="space-y-6 mb-10">
        <p className="text-xl text-gray-600 leading-relaxed">
          Now for an exciting twist! Let&apos;s play the game backwards:
        </p>
        <div className="bg-blue-50 p-8 rounded-xl max-w-2xl mx-auto">
          <p className="text-xl text-gray-700">
            If I say <span className="font-bold text-blue-600">1 - 3 - 5</span>
            <br/>
            You say <span className="font-bold text-blue-600">5 - 3 - 1</span>
          </p>
        </div>
      </div>
      <button
        onClick={handleStartReverse}
        className="group relative px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
      >
        Start Reverse Challenge!
      </button>
    </motion.div>
  );

  const renderPresenting = () => (
    <motion.div 
      className="flex flex-col items-center justify-center space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative h-80 w-80 flex items-center justify-center">
        <AnimatePresence>
          {displayedDigit !== null && (
            <motion.div
              key={digitIndex}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotate: 0,
                transition: { type: "spring", stiffness: 200, damping: 15 }
              }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-9xl font-bold text-blue-600 p-10 bg-white rounded-2xl shadow-lg border border-gray-100">
                {displayedDigit}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <motion.div 
        className="text-2xl font-medium text-gray-700 bg-blue-50 px-8 py-4 rounded-xl shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Listen carefully...
      </motion.div>
    </motion.div>
  );

  const renderListening = () => (
     <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center space-y-8 p-10 bg-white rounded-2xl shadow-lg max-w-3xl mx-auto border border-gray-100"
    >
      <h3 className="text-2xl font-bold text-gray-800">
        {mode === "forward" ? "Repeat the numbers in order" : "Say the numbers in reverse"}
      </h3>
      
      <div className="flex items-center gap-6">
        <motion.button
          onClick={stopListening}
          disabled={!isRecording}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative rounded-xl h-16 w-16 flex items-center justify-center transition-all duration-300 shadow-md ${
            !isRecording
              ? "bg-gray-100 cursor-not-allowed text-gray-400"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
          {isRecording && (
            <motion.span
              className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </motion.button>

        {isRecording && !isTranscribing && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl"
          >
            <span className="text-lg font-medium">Recording</span>
            <span className="flex gap-0.5">
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>•</motion.span>
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}>•</motion.span>
              <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 1 }}>•</motion.span>
            </span>
          </motion.div>
        )}
      </div>

      {isTranscribing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div 
            className="w-16 h-16 relative"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </motion.div>
          <div className="text-xl text-blue-600 font-medium">
            Processing your answer...
          </div>
        </motion.div>
      )}

      {transcript && !isTranscribing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl"
        >
          <p className="text-lg text-gray-600">You said: <strong className="text-gray-800">{transcript}</strong></p>
        </motion.div>
      )}

      <AnimatePresence>
        {evaluationResult && (
          <motion.div
            key="evaluationFeedback"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center space-y-4 mt-6"
          >
            {evaluationResult === 'correct' ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle size={48} className="text-green-600" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 text-green-600 px-8 py-4 rounded-xl border border-green-200"
                >
                  <span className="text-2xl font-bold">Correct!</span>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <XCircle size={48} className="text-blue-600" />
                </motion.div>
                <div className="bg-blue-50 text-blue-600 px-8 py-4 rounded-xl border border-blue-200">
                  <span className="text-2xl font-bold">Let&apos;s try the next one</span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderFinished = () => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl mx-auto mt-10 border border-blue-200 text-center"
      >
        <CheckCircle size={80} className="mx-auto text-blue-600 mb-6" />
        <h2 className="text-4xl font-bold text-gray-800 mb-10">
          Challenge Complete!
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="bg-blue-50 p-8 rounded-xl">
            <h3 className="text-xl text-gray-700 mb-3">Forward Score</h3>
            <p className="text-4xl font-bold text-blue-600">
              {forwardScore} / {STARTING_FORWARD_SEQUENCES.length}
            </p>
          </div>
          <div className="bg-blue-50 p-8 rounded-xl">
            <h3 className="text-xl text-gray-700 mb-3">Reverse Score</h3>
            <p className="text-4xl font-bold text-blue-600">
              {reverseScore} / {STARTING_REVERSE_SEQUENCES.length}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-10 rounded-xl mb-10">
          <h3 className="text-2xl text-gray-700 mb-3">Final Score</h3>
          <p className="text-6xl font-extrabold text-blue-600">
            {Math.round((forwardScore + reverseScore) / 2)} / 10
          </p>
        </div>

        {!suppressResultPage && (
          <motion.button
            onClick={submitResults}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white text-xl font-semibold rounded-xl shadow-md hover:bg-blue-700 transition-all duration-300 hover:shadow-lg"
          >
            <Send size={24}/>
            <span>Submit Results</span>
          </motion.button>
        )}
      </motion.div>
  );
  return (
    <div className="h-screen overflow-y-auto bg-gray-50 p-6 md:p-10">

      <div className="max-w-6xl mx-auto w-full">
        <ToastContainer 
          position="top-center" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="colored" 
        />
        
        {(gameState === "presenting" || gameState === "listening" || gameState === "evaluating") && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <span className="text-lg font-medium text-gray-600">
                  Mode: <span className="font-bold capitalize text-blue-600">{mode}</span>
                </span>
                <span className="text-lg font-medium text-gray-600">
                  Sequence: <span className="font-bold text-blue-600">{sequenceIndex + 1}</span> / <span className="text-gray-600">{sequences.length}</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-medium text-gray-600">Errors:</span>
                <div className="flex gap-2">
                  {[...Array(MAX_ERRORS)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-full transition-colors duration-300 ${
                        i < (mode === "forward" ? forwardErrors : reverseErrors)
                          ? "bg-red-500"
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {gameState === "instructions" && (
            <motion.div key="instructions" exit={{ opacity: 0 }}>
              {renderInstructions()}
            </motion.div>
          )}
          {gameState === "instructions_reverse" && (
            <motion.div key="instructions_reverse" exit={{ opacity: 0 }}>
              {renderReverseInstructions()}
            </motion.div>
          )}
          {gameState === "presenting" && (
             <motion.div
              key="presenting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-10"
            >
               {renderPresenting()}
             </motion.div>
          )}
          {(gameState === "listening" || gameState === "evaluating") && (
            <motion.div
              key="listening-evaluating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderListening()}
            </motion.div>
          )}
          {gameState === "finished" && !suppressResultPage && (
            <motion.div key="finished" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {renderFinished()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Test13;
