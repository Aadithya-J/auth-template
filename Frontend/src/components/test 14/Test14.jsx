import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Mic, MicOff, Check, X, Volume2 } from "lucide-react";
import { backendURL, pythonURL } from "../../definedURL";
import { motion, AnimatePresence } from "framer-motion";
import PropTypes from 'prop-types';

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

// Components
const ProgressBar = ({ progress }) => (
  <div className="w-full bg-blue-100 rounded-full h-2.5 overflow-hidden">
    <motion.div
      className="bg-blue-600 h-2.5"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    />
  </div>
);

ProgressBar.propTypes = {
  progress: PropTypes.number.isRequired,
};

const ResultCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`p-4 rounded-lg shadow-sm transition-all duration-300 ${
      item.isCorrect
        ? "bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200"
        : "bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
    }`}
  >
    <div className="flex justify-between items-center">
      <span className="font-medium text-blue-900">Word {index + 1}: {item.word}</span>
      <span className={`font-bold ${item.isCorrect ? "text-blue-600" : "text-red-600"}`}>
        {item.isCorrect ? <Check size={18} /> : <X size={18} />}
      </span>
    </div>
    <div className="mt-2 text-sm text-blue-800">
      <p>You said: <span className="font-medium">{item.response || "No response"}</span></p>
      {!item.isCorrect && (
        <p className="text-blue-600 mt-1">
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

const Button = ({ onClick, disabled, variant = "primary", children, className = "" }) => {
  const baseStyle = "py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:scale-98 disabled:bg-blue-300",
    secondary: "bg-blue-100 text-blue-800 hover:bg-blue-200 active:scale-98",
    danger: "bg-red-600 text-white hover:bg-red-700 active:scale-98",
    success: "bg-green-600 text-white hover:bg-green-700 active:scale-98",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopRecording();
    };
  }, []);

  const playSound = (src) => {
    return new Promise((resolve) => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(src);
      audioRef.current = audio;
      audio
        .play()
        .then(() => {
          audio.onended = resolve;
        })
        .catch((e) => {
          console.error("Audio playback failed:", e);
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
        await playSound(sound);
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

    // Calculate score according to new rules
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6"
        >
          <h1 className="text-3xl font-bold text-center text-blue-600">
            Test Completed!
          </h1>

          <div className="flex flex-col items-center space-y-4">
            <motion.div
              initial={{ rotate: -180 }}
              animate={{ rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              <svg className="w-32 h-32" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e6e6e6"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${percentage}, 100` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold text-blue-600"
                >
                  {finalScore}/10
                </motion.span>
                <span className="text-lg font-medium text-blue-800">
                  {responses.filter((r) => r.isCorrect).length}/{WORDS.length} correct
                </span>
              </div>
            </motion.div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
            <AnimatePresence>
              {responses.map((item, index) => (
                <ResultCard key={index} item={item} index={index} />
              ))}
            </AnimatePresence>
          </div>

          <Button onClick={restartGame} variant="primary">
            Restart Test
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentWord = WORDS[currentWordIndex];
  const progress =
    ((currentWordIndex + (showResponse ? 1 : 0)) / WORDS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 space-y-6"
      >
        <ProgressBar progress={progress} />

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-blue-700">
            Blend the Sounds!
          </h2>
          <p className="text-blue-600">
            Word {currentWordIndex + 1} of {WORDS.length}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-3 rounded"
          >
            <p>{error}</p>
          </motion.div>
        )}

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: isPlaying ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: isPlaying ? 2 : 0.5,
            repeat: isPlaying ? Infinity : 0,
          }}
          className="flex justify-center text-8xl my-4"
        >
          {isPlaying ? "👂" : showResponse ? "🎤" : "🤔"}
        </motion.div>

        {!showResponse ? (
          <Button
            onClick={playCurrentWord}
            disabled={isPlaying}
            variant={isPlaying ? "secondary" : "primary"}
          >
            <Volume2 className="h-5 w-5" />
            {isPlaying ? "Playing Sounds..." : "Play Sounds"}
          </Button>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-lg font-medium text-blue-700">
              What word did you hear?
            </p>

            <div className="flex flex-col items-center space-y-3">
              <AnimatePresence>
                {transcript && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-blue-50 p-3 rounded-lg w-full text-center"
                  >
                    <p className="font-medium text-blue-800">
                      You said:{" "}
                      <span className="text-blue-600">{transcript}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "danger" : "primary"}
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

              {transcript && (
                <Button
                  onClick={() => checkAnswer(transcript)}
                  variant="success"
                >
                  {showFinalSubmit ? "Finish Test" : "Submit Answer"}
                </Button>
              )}

              {showFinalSubmit && (
                <Button
                  onClick={handleFinalSubmit}
                  variant="primary"
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