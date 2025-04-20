import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Mic, MicOff, Check, X, Play, Headphones, Volume2 } from "lucide-react";
import { backendURL, pythonURL } from "../../definedURL";
import { motion, AnimatePresence } from "framer-motion";

const WORDS = [
  {
    id: 1,
    sounds: ["/sounds/c.mp3", "/sounds/a.mp3", "/sounds/t.mp3"],
    word: "cat",
  },
  {
    id: 2,
    sounds: ["/sounds/f.mp3", "/sounds/a.mp3", "/sounds/t.mp3"],
    word: "fat",
  },
  {
    id: 3,
    sounds: ["/sounds/l.mp3", "/sounds/e.mp3", "/sounds/t.mp3"],
    word: "let",
  },
  {
    id: 4,
    sounds: ["/sounds/l.mp3", "/sounds/i.mp3", "/sounds/p.mp3"],
    word: "lip",
  },
  {
    id: 5,
    sounds: ["/sounds/p.mp3", "/sounds/o.mp3", "/sounds/t.mp3"],
    word: "pot",
  },
  {
    id: 6,
    sounds: ["/sounds/b.mp3", "/sounds/o.mp3", "/sounds/t.mp3"],
    word: "boat",
  },
  {
    id: 7,
    sounds: ["/sounds/p.mp3", "/sounds/e.mp3", "/sounds/g.mp3"],
    word: "peg",
  },
  {
    id: 8,
    sounds: ["/sounds/b.mp3", "/sounds/e.mp3", "/sounds/g.mp3"],
    word: "beg",
  },
  {
    id: 9,
    sounds: ["/sounds/sh.mp3", "/sounds/o.mp3", "/sounds/p.mp3"],
    word: "shop",
  },
  {
    id: 10,
    sounds: ["/sounds/f.mp3", "/sounds/ee.mp3", "/sounds/t.mp3"],
    word: "feet",
  },
  {
    id: 11,
    sounds: [
      "/sounds/d.mp3",
      "/sounds/i.mp3",
      "/sounds/n.mp3",
      "/sounds/er.mp3",
    ],
    word: "dinner",
  },
  {
    id: 12,
    sounds: [
      "/sounds/w.mp3",
      "/sounds/e.mp3",
      "/sounds/th.mp3",
      "/sounds/er.mp3",
    ],
    word: "weather",
  },
  {
    id: 13,
    sounds: [
      "/sounds/l.mp3",
      "/sounds/i.mp3",
      "/sounds/t.mp3",
      "/sounds/l.mp3",
    ],
    word: "little",
  },
  {
    id: 14,
    sounds: [
      "/sounds/d.mp3",
      "/sounds/e.mp3",
      "/sounds/l.mp3",
      "/sounds/i.mp3",
      "/sounds/k.mp3",
      "/sounds/t.mp3",
    ],
    word: "delicate",
  },
  {
    id: 15,
    sounds: ["/sounds/t.mp3", "/sounds/a.mp3", "/sounds/p.mp3"],
    word: "tap",
  },
  {
    id: 16,
    sounds: ["/sounds/d.mp3", "/sounds/u.mp3", "/sounds/p.mp3"],
    word: "dup",
  },
  {
    id: 17,
    sounds: ["/sounds/p.mp3", "/sounds/o.mp3", "/sounds/g.mp3"],
    word: "pog",
  },
  {
    id: 18,
    sounds: [
      "/sounds/g.mp3",
      "/sounds/l.mp3",
      "/sounds/e.mp3",
      "/sounds/b.mp3",
    ],
    word: "gleb",
  },
  {
    id: 19,
    sounds: [
      "/sounds/g.mp3",
      "/sounds/a.mp3",
      "/sounds/p.mp3",
      "/sounds/o.mp3",
    ],
    word: "gapo",
  },
  {
    id: 20,
    sounds: [
      "/sounds/t.mp3",
      "/sounds/i.mp3",
      "/sounds/s.mp3",
      "/sounds/e.mp3",
      "/sounds/k.mp3",
    ],
    word: "tisek",
  },
];

export default function PhonemeGame() {
  const [gameState, setGameState] = useState("playing");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [responses, setResponses] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [showFinalSubmit, setShowFinalSubmit] = useState(false);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [playingSoundIndex, setPlayingSoundIndex] = useState(-1);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopRecording();
    };
  }, []);

  const playSound = (src, index) => {
    return new Promise((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(src);
      audioRef.current = audio;
      setPlayingSoundIndex(index);
      
      audio
        .play()
        .then(() => {
          audio.onended = () => {
            setPlayingSoundIndex(-1);
            resolve();
          };
        })
        .catch((e) => {
          console.error("Audio playback failed:", e);
          setError("Failed to play sounds. Please check your audio.");
          setPlayingSoundIndex(-1);
          resolve();
        });
    });
  };

  const playCurrentWord = async () => {
    try {
      setIsPlaying(true);
      setError(null);
      const currentWord = WORDS[currentWordIndex];

      for (let i = 0; i < currentWord.sounds.length; i++) {
        await playSound(currentWord.sounds[i], i);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setIsPlaying(false);
      setShowResponse(true);
    } catch (err) {
      setError("Error playing sounds. Please try again.");
      setIsPlaying(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    setTranscript("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks);
        const file = new File(
          [audioBlob],
          `rec.${audioBlob.type.split("/")[1]}`,
          {
            type: audioBlob.type,
          }
        );

        const transcription = await transcribeAudio(file);
        stream.getTracks().forEach((track) => track.stop());

        await checkAnswer(transcription);
      };

      // Start recording with timeslice to ensure dataavailable events fire
      mediaRecorder.start(100); // 100ms timeslice
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Couldn't access microphone. Please check permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const transcribeAudio = async (fileOrBlob) => {
    try {
      const formData = new FormData();
      const upload =
        fileOrBlob instanceof File
          ? fileOrBlob
          : new File([fileOrBlob], "recording", { type: fileOrBlob.type });

      formData.append("file", upload);

      const response = await axios.post(`${pythonURL}/transcribe`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const transcription =
        response.data.transcription
          ?.toLowerCase()
          .trim()
          .replace(/[.,!?;:]*$/, "") || "";

      setTranscript(transcription);
      return transcription;
    } catch (err) {
      console.error("Transcription error:", err);
      setError("Failed to transcribe audio. Please try again.");
      return "";
    }
  };

  const checkAnswer = async (transcription) => {
    const currentWord = WORDS[currentWordIndex];
    const isCorrect = transcription === currentWord.word.toLowerCase();

    // Create the new response object
    const newResponse = {
      wordId: currentWord.id,
      word: currentWord.word,
      response: transcription,
      isCorrect,
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentWordIndex === WORDS.length - 1) {
      await finishGame(updatedResponses); // Pass the complete responses including last word
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
      setShowResponse(false);
      setTranscript("");
    }
  };

  const handleFinalSubmit = async () => {
    await finishGame(responses);
  };

  const finishGame = async (responsesToSubmit) => {
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");
    // Calculate score according to new rules
    const incorrectCount = responsesToSubmit.filter((r) => !r.isCorrect).length;
    const rawScore = 20 - incorrectCount;
    const finalScore = Math.min(10, Math.round(rawScore / 2));

    try {
      await axios.post(
        `${backendURL}/submitResults`,
        {
          responses: responsesToSubmit.map((r) => ({
            word: r.word,
            wordId: r.wordId,
            isCorrect: r.isCorrect,
          })),
          normalized_score: finalScore,
          total_score: rawScore,
          childId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setGameState("results");
    } catch (err) {
      console.error("Error submitting results:", err);
      setError("Failed to save results. You can try again later.");
      setGameState("results");
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4"
      >
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-blue-100"
        >
          <motion.h1 
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-center text-blue-600"
          >
            Test Completed!
          </motion.h1>

          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center space-y-4"
          >
            <div className="relative">
              <svg className="w-32 h-32" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#DBEAFE"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-3xl font-bold text-blue-600"
                >
                  {finalScore}/10
                </motion.span>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="text-lg font-medium text-blue-800"
                >
                  {responses.filter((r) => r.isCorrect).length}/{WORDS.length}{" "}
                  correct
                </motion.span>
              </div>
            </div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="text-lg font-medium text-blue-700"
            >
              {finalScore >= 7 ? "Great job!" : "Keep practicing!"}
            </motion.p>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar"
          >
            {responses.map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.05, duration: 0.3 }}
                className={`p-3 rounded-lg border ${
                  item.isCorrect
                    ? "bg-blue-50 border-blue-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-blue-900">
                    Word {index + 1}: {item.word}
                  </span>
                  <span
                    className={`font-bold ${
                      item.isCorrect ? "text-blue-600" : "text-red-500"
                    }`}
                  >
                    {item.isCorrect ? <Check size={18} /> : <X size={18} />}
                  </span>
                </div>
                <div className="mt-1 text-sm text-blue-800">
                  <p>
                    You said:{" "}
                    <span className="font-medium">
                      {item.response || "No response"}
                    </span>
                  </p>
                  {!item.isCorrect && (
                    <p className="text-blue-600 mt-1">
                      Correct answer:{" "}
                      <span className="font-medium">{item.word}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={restartGame}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all"
          >
            Restart Test
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const currentWord = WORDS[currentWordIndex];
  const progress =
    ((currentWordIndex + (showResponse ? 1 : 0)) / WORDS.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4"
    >
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-blue-100"
      >
        <div className="relative w-full bg-blue-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-blue-600 h-3 rounded-full"
          ></motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute right-0 top-0 -mt-6 font-medium text-blue-700 text-sm"
          >
            {currentWordIndex + 1}/{WORDS.length}
          </motion.div>
        </div>

        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-1"
        >
          <h2 className="text-2xl font-bold text-blue-700">
            Blend the Sounds!
          </h2>
          <p className="text-blue-600">
            Listen carefully and identify the word
          </p>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-3 rounded overflow-hidden"
            >
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center my-6"
        >
          {currentWord.sounds.map((sound, index) => (
            <motion.div 
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: playingSoundIndex === index ? [1, 1.1, 1] : 1, 
                opacity: 1 
              }}
              transition={{ 
                delay: 0.4 + index * 0.1,
                duration: 0.3,
                repeat: playingSoundIndex === index ? Infinity : 0,
                repeatType: "reverse"
              }}
              className={`w-12 h-12 mx-1 rounded-full flex items-center justify-center ${
                playingSoundIndex === index
                  ? "bg-blue-600 text-white"
                  : isPlaying 
                    ? "bg-blue-200 text-blue-700" 
                    : "bg-blue-100 text-blue-600"
              } ${isPlaying ? "animate-pulse" : ""}`}
            >
              <Volume2 size={20} />
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {!showResponse ? (
            <motion.button
              key="play-button"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={playCurrentWord}
              disabled={isPlaying}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                isPlaying
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              }`}
            >
              {isPlaying ? (
                <>
                  <Headphones className="h-5 w-5" />
                  Playing Sounds...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Play Sounds
                </>
              )}
            </motion.button>
          ) : (
            <motion.div
              key="response-section"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <motion.p
                initial={{ y: -5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-lg font-medium text-blue-700"
              >
                What word did you hear?
              </motion.p>

              <motion.div
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center space-y-3"
              >
                <AnimatePresence>
                  {transcript && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-blue-50 p-3 rounded-lg w-full text-center"
                    >
                      <p className="font-medium text-blue-800">
                        You said:{" "}
                        <span className="text-blue-600 font-bold">{transcript}</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    isRecording
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  } active:scale-95`}
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
                </motion.button>

                <AnimatePresence>
                  {transcript && (
                    <motion.button
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 5, opacity: 0 }}
                      transition={{ delay: 0.6 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => checkAnswer(transcript)}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      {showFinalSubmit ? "Finish Test" : "Submit Answer"}
                    </motion.button>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showFinalSubmit && (
                    <motion.button
                      initial={{ y: 5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 5, opacity: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleFinalSubmit}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      Submit All Results
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Add this at the end of your CSS file or in your global styles
// Add the following to your global CSS or component styles
/* 
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(37, 99, 235, 0.3) rgba(219, 234, 254, 0.3);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(219, 234, 254, 0.3);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(37, 99, 235, 0.3);
  border-radius: 20px;
}
*/
