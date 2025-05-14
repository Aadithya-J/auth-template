import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { backendURL } from "../../definedURL";
import {
  Mic,
  MicOff,
  AlertCircle,
  Check,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
// Audio Recording Hook
const useAudioRecorder = (onAudioCaptured) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const isRecordingRef = useRef(isRecording);
  const { language } = useLanguage();
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const uploadAudio = useCallback(
    async (audioBlob) => {
      const formData = new FormData();
      const file = new File([audioBlob], "vocabulary_definition.wav", {
        type: "audio/wav",
      });
      formData.append("file", file);
      formData.append("language", language);
      setIsTranscribing(true);
      setError(null);
      try {
        const response = await fetch(`${backendURL}/transcribe`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.transcription) {
          const transcription =
            result.transcription
              .toLowerCase()
              .trim()
              .replace(/[.,!?;:]*$/, "") || "";
          onAudioCaptured(transcription);
        } else {
          const errorMsg =
            result.error || "Transcription failed. Please try again.";
          setError(errorMsg);
          toast.error(errorMsg);
        }
      } catch (error) {
        setError("Error uploading audio. Please check connection.");
        toast.error("Error uploading audio. Please check connection.");
      } finally {
        setIsTranscribing(false);
      }
    },
    [onAudioCaptured]
  );

  const stopListening = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping MediaRecorder:", e);
      }
    }
    if (window.stream) {
      try {
        window.stream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (e) {
        console.error("Error stopping stream tracks:", e);
      }
      window.stream = null;
    }
    mediaRecorderRef.current = null;
    if (isRecordingRef.current) {
      setIsRecording(false);
    }
  }, [isRecordingRef]);

  const startListening = useCallback(() => {
    if (isRecordingRef.current) return;

    setError(null);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
        let localAudioChunks = [];

        if (stream.getAudioTracks().length > 0) {
          stream.getAudioTracks()[0].onended = () => {
            stopListening();
          };
        }

        const mimeType = MediaRecorder.isTypeSupported("audio/wav;codecs=pcm")
          ? "audio/wav;codecs=pcm"
          : "audio/webm";

        const newMediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = newMediaRecorder;

        newMediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            localAudioChunks.push(event.data);
          }
        };

        newMediaRecorder.onstop = async () => {
          if (localAudioChunks.length > 0) {
            const audioBlob = new Blob(localAudioChunks, { type: mimeType });
            localAudioChunks = [];
            await uploadAudio(audioBlob);
          }
        };

        newMediaRecorder.onerror = (event) => {
          toast.error(`Recording error: ${event.error.name}`);
          stopListening();
        };

        try {
          newMediaRecorder.start();
          setIsRecording(true);
        } catch (e) {
          toast.error(t("failedToStartRecording"));
          stopListening();
        }
      })
      .catch((error) => {
        setError(t("couldNotAccessMicrophone"));
        toast.error(t("couldNotAccessMicrophone"));
      });
  }, [uploadAudio, stopListening, isRecordingRef]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isRecording,
    isTranscribing,
    error,
    startListening,
    stopListening,
  };
};

// Word Display Component
const WordDisplay = ({ currentWord, currentIndex, totalWords, language, t }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 p-4 border border-blue-200 rounded-lg bg-blue-50 shadow-sm"
    >
      <p className="text-sm text-blue-600 mb-2">
        Word {currentIndex + 1} of {totalWords}
      </p>
      <motion.p
        key={currentWord.word}
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="text-4xl font-semibold text-center mb-4 text-blue-800"
      >
        {language === "ta" && currentWord.ta
          ? currentWord.ta
          : currentWord.word}
      </motion.p>
      <div className="flex justify-center gap-4">
        <p className="text-sm text-blue-500">
          <span className="inline-block px-2 py-1 bg-blue-100 rounded-full">
            {t("level")}
            : {currentWord.level}
          </span>
        </p>
        {language === "ta" && currentWord.ta && (
          <p className="text-sm text-gray-500">
            <span className="inline-block px-2 py-1 bg-gray-100 rounded-full">
              {t("english")}
              : {currentWord.word}
            </span>
          </p>
        )}
      </div>
    </motion.div>
  );
};

// Definition Input Component
const DefinitionInput = ({
  currentDefinition,
  setCurrentDefinition,
  wordText,
  isRecording,
  isTranscribing,
  isSubmitting,
  startListening,
  stopListening,
  incorrectStreak,
  error,
  language,
  t
}) => {
  return (
    <div className="mb-6">
      <label
        htmlFor="definition"
        className="block text-lg font-medium text-blue-700 mb-2"
      >
        {t("whatDoesThisWordMean")}
      </label>
      <motion.div
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <textarea
          id="definition"
          rows="4"
          value={currentDefinition}
          onChange={(e) => setCurrentDefinition(e.target.value)}
          placeholder={t("enterDefinitionHere")}
          className={`w-full px-3 py-2 text-blue-800 border ${
            isRecording ? "border-red-400" : "border-blue-300"
          } rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-300`}
          disabled={isSubmitting || isRecording || isTranscribing}
        />

        <div className="mt-3 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopListening : startListening}
            disabled={isSubmitting || isTranscribing}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
              isRecording
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } ${
              isSubmitting || isTranscribing
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="h-5 w-5" /> {t("stopRecording")}
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" /> {t("startRecording")}
              </>
            )}
          </motion.button>
          <AnimatePresence>
            {isRecording && !isTranscribing && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 text-red-600"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Recording...
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isTranscribing && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2 text-blue-600"
              >
                <motion.div
                  className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Transcribing...
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {incorrectStreak > 0 && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-xs text-orange-600 mt-2 flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {t("consecutiveIncorrectSkipped")}: {incorrectStreak}
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="text-red-600 mt-2 text-sm flex items-center gap-1"
            >
              <AlertCircle className="h-4 w-4" /> {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Navigation Button Component
const NavigationButton = ({
  onClick,
  isLast,
  isDisabled,
  isSubmitting,
  isRecording,
  isTranscribing,
  incorrectStreak,
  t
}) => {
  const isFinish = isLast || incorrectStreak >= 4;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={isDisabled || isSubmitting || isRecording || isTranscribing}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center gap-2 ${
        isDisabled || isSubmitting || isRecording || isTranscribing
          ? "opacity-50 cursor-not-allowed"
          : "shadow-md"
      }`}
    >
      {isSubmitting ? (
        <>
          <motion.div
            className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          Submitting...
        </>
      ) : (
        <>
          {isFinish ? t("finishAndSubmit") : t("nextWord")}
          {isFinish ? (
            <Check className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </>
      )}
    </motion.button>
  );
};

// Test Complete Component
const TestComplete = ({ finalScore, totalWords, error, childId }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-lg text-center border-t-4 border-blue-500"
    >
      <ToastContainer position="top-center" autoClose={3000} />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
          <Check className="h-8 w-8 text-blue-600" />
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold mb-4 text-blue-700">Test Completed!</h2>

      {finalScore !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-xl mb-2">Your final score is:</p>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {finalScore} / {totalWords}
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2.5 mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(finalScore / totalWords) * 100}%` }}
              transition={{ delay: 0.6, duration: 1 }}
              className="bg-blue-600 h-2.5 rounded-full"
            ></motion.div>
          </div>
        </motion.div>
      )}

      <p className="mb-6 text-blue-800">
        {t("thankYouForCompletingVocabularyScaleTest")}
      </p>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 mb-4 p-2 bg-red-50 rounded"
        >
          Submission Error: {error}
        </motion.p>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(`/user/${childId}`)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 flex items-center gap-2 mx-auto"
      >
        Back to Child Profile <ArrowRight className="h-4 w-4" />
      </motion.button>
    </motion.div>
  );
};

// Loading Component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center p-8 h-64">
    <motion.div
      className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-4 text-blue-700 font-medium"
    >
      Loading test...
    </motion.p>
  </div>
);

// Error Component
const ErrorState = ({ message }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center p-8"
  >
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
      <AlertCircle className="h-8 w-8 text-red-600" />
    </div>
    <p className="text-red-600 font-medium">{message}</p>
  </motion.div>
);

// Main Component
const VocabularyScaleTest = () => {
  const childId = localStorage.getItem("childId");
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentDefinition, setCurrentDefinition] = useState("");
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [incorrectStreak, setIncorrectStreak] = useState(0);
  const { language, t } = useLanguage();
  // Handle transcribed audio
  const handleTranscriptionComplete = useCallback((transcription) => {
    setCurrentDefinition(transcription);
  }, []);

  const {
    isRecording,
    isTranscribing,
    error: recorderError,
    startListening,
    stopListening,
  } = useAudioRecorder(handleTranscriptionComplete);

  // Combine component error with recorder error
  useEffect(() => {
    if (recorderError) {
      setError(recorderError);
    }
  }, [recorderError]);

  // Fetch words on component mount
  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${backendURL}/vocabulary/words`);
        if (response.data && Array.isArray(response.data.words)) {
          setWords(response.data.words);
        } else {
          throw new Error("Invalid data format received for words.");
        }
      } catch (err) {
        console.error("Error fetching vocabulary words:", err);
        setError("Failed to load vocabulary words. Please try again later.");
        toast.error("Failed to load vocabulary words.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWords();
  }, []);

  const handleNextWord = useCallback(() => {
    stopListening();
    const currentWord = words[currentWordIndex];
    const newResponse = {
      word: currentWord.word,
      definition: currentDefinition,
    };
    const updatedResponses = [
      ...responses.slice(0, currentWordIndex),
      newResponse,
      ...responses.slice(currentWordIndex + 1),
    ];
    setResponses(updatedResponses);

    // Basic check if definition is empty - consider this "incorrect" for stopping rule
    if (!currentDefinition.trim()) {
      setIncorrectStreak((prev) => prev + 1);
    } else {
      setIncorrectStreak(0); // Reset streak if there's an answer
    }

    // Move to the next word or finish
    if (currentWordIndex < words.length - 1 && incorrectStreak < 4) {
      setCurrentWordIndex((prevIndex) => prevIndex + 1);
      // Load existing definition if user is revisiting a word
      const nextWordResponse = updatedResponses[currentWordIndex + 1];
      setCurrentDefinition(nextWordResponse ? nextWordResponse.definition : "");
    } else {
      // End of test or 5 incorrect rule triggered
      handleSubmit();
    }
  }, [
    currentWordIndex,
    words,
    currentDefinition,
    responses,
    incorrectStreak,
    stopListening,
  ]);

  const handleSubmit = async () => {
    stopListening();
    if (isSubmitting || testComplete) return;

    setSubmitting(true);
    setError(null);

    // Ensure the last definition is captured if user clicks submit directly
    const finalResponses = [...responses];
    if (
      currentWordIndex < words.length &&
      !responses.find((r) => r.word === words[currentWordIndex].word)
    ) {
      finalResponses.push({
        word: words[currentWordIndex].word,
        definition: currentDefinition,
      });
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${backendURL}/vocabulary/submit`,
        { child_id: childId, responses: finalResponses, language: language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 && response.data) {
        setFinalScore(response.data.score);
        setTestComplete(true);
        toast.success("Test submitted successfully!");
      } else {
        throw new Error("Failed to submit test results.");
      }
    } catch (err) {
      console.error("Error submitting vocabulary test:", err);
      const errorMsg =
        err.response?.data?.error || "An error occurred during submission.";
      setError(errorMsg);
      toast.error(errorMsg);
      setTestComplete(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Render states
  if (isLoading) {
    return <LoadingState />;
  }

  if (error && !isLoading && !isSubmitting && !isTranscribing) {
    return <ErrorState message={error} />;
  }

  if (testComplete) {
    return (
      <TestComplete
        finalScore={finalScore}
        totalWords={words.length}
        error={error}
        childId={childId}
      />
    );
  }

  if (words.length === 0 && !isLoading) {
    return <ErrorState message="No vocabulary words found." />;
  }

  const currentWord = words[currentWordIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mt-32 mx-auto p-6 bg-white shadow-md rounded-lg border border-blue-100"
    >
      <ToastContainer position="top-center" autoClose={3000} />
      <motion.h1
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        className="text-3xl font-bold text-center mb-6 text-blue-800"
      >
        {t("vocabularyScaleTest")}
      </motion.h1>

      {currentWord && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`word-${currentWordIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <WordDisplay
              currentWord={currentWord}
              currentIndex={currentWordIndex}
              totalWords={words.length}
              language={language}
              t={t}
            />

            <DefinitionInput
              currentDefinition={currentDefinition}
              setCurrentDefinition={setCurrentDefinition}
              isRecording={isRecording}
              t={t}
              isTranscribing={isTranscribing}
              isSubmitting={isSubmitting}
              startListening={startListening}
              stopListening={stopListening}
              incorrectStreak={incorrectStreak}
              error={error}
              wordText={
                language === "ta" && currentWord.ta
                  ? currentWord.ta
                  : currentWord.word
              }
              language={language}
            />

            <div className="flex justify-end items-center">
              <NavigationButton
                onClick={handleNextWord}
                isLast={currentWordIndex === words.length - 1}
                isDisabled={isSubmitting}
                isSubmitting={isSubmitting}
                isRecording={isRecording}
                isTranscribing={isTranscribing}
                incorrectStreak={incorrectStreak}
                t={t}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default VocabularyScaleTest;
