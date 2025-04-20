import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { backendURL, pythonURL } from '../../definedURL';
import { Mic, MicOff } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

const VocabularyScaleTest = ({ suppressResultPage = false, onComplete, student }) => {
  const childId = localStorage.getItem("childId") || (student && student.id);
  const navigate = useNavigate();
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentDefinition, setCurrentDefinition] = useState('');
  const [responses, setResponses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);
  const [testComplete, setTestComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [incorrectStreak, setIncorrectStreak] = useState(0);

  // Speech Recognition State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const isRecordingRef = useRef(isRecording);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Fetch words on component mount
  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use backendURL for fetching words
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


  const uploadAudio = useCallback(async (audioBlob) => {
    const formData = new FormData();
    const file = new File([audioBlob], "vocabulary_definition.wav", { type: "audio/wav" });
    formData.append("file", file);

    setIsTranscribing(true);
    setError(null); // Clear previous errors
    try {
      // Use pythonURL for transcription
      const response = await fetch(`${pythonURL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log('Transcription API Response:', result);

      if (response.ok && result.transcription) {
        const transcription = result.transcription
          .toLowerCase()
          .trim()
          .replace(/[.,!?;:]*$/, '') || '';
        setCurrentDefinition(transcription);
        toast.success("Transcription received!");
      } else {
        console.error("Transcription error response:", result);
        const errorMsg = result.error || "Transcription failed. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      setError("Error uploading audio. Please check connection.");
      toast.error("Error uploading audio. Please check connection.");
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) { console.error("Error stopping MediaRecorder:", e); }
    }
    if (window.stream) {
      try {
        window.stream.getTracks().forEach((track) => { track.stop(); });
      } catch (e) { console.error("Error stopping stream tracks:", e); }
      window.stream = null;
    }
    mediaRecorderRef.current = null;
    if (isRecordingRef.current) {
       setIsRecording(false);
    }
  }, [isRecordingRef]);

  const startListening = useCallback(() => {
    if (isRecordingRef.current) {
      return;
    }
    setError(null);
    setCurrentDefinition('');

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
         window.stream = stream;
         let localAudioChunks = [];

         if (stream.getAudioTracks().length > 0) {
            stream.getAudioTracks()[0].onended = () => {
              console.warn("Audio track ended unexpectedly!");
              stopListening();
            };
         }

         const mimeType = MediaRecorder.isTypeSupported('audio/wav;codecs=pcm')
           ? 'audio/wav;codecs=pcm'
           : 'audio/webm';
         console.log("Using mimeType:", mimeType);

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
           } else { console.log("No audio chunks recorded in onstop."); }
         };

         newMediaRecorder.onerror = (event) => {
            console.error("MediaRecorder error event:", event.error);
            toast.error(`Recording error: ${event.error.name}`);
            stopListening();
         };

         try {
            newMediaRecorder.start();
            setIsRecording(true);
         } catch (e) {
             console.error("Error calling MediaRecorder.start():", e);
             toast.error("Failed to start recording.");
             stopListening();
             return;
         }
      })
      .catch((error) => {
        console.error("Error accessing microphone (getUserMedia):", error);
        setError("Could not access microphone. Please check permissions.");
        toast.error("Could not access microphone. Please check permissions.");
        stopListening();
      });
  }, [uploadAudio, stopListening, isRecordingRef]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);


  // --- Test Logic ---

  const handleNextWord = useCallback(() => {
    stopListening();
    const currentWord = words[currentWordIndex];
    const newResponse = { word: currentWord.word, definition: currentDefinition };
    const updatedResponses = [...responses.slice(0, currentWordIndex), newResponse, ...responses.slice(currentWordIndex + 1)];
    setResponses(updatedResponses);

    // Basic check if definition is empty - consider this "incorrect" for stopping rule
    if (!currentDefinition.trim()) {
      setIncorrectStreak(prev => prev + 1);
    } else {
      setIncorrectStreak(0); // Reset streak if there's an answer
    }

    // Move to the next word or finish
    if (currentWordIndex < words.length - 1 && incorrectStreak < 4) { // Stop *before* the 5th incorrect
      setCurrentWordIndex(prevIndex => prevIndex + 1);
      // Load existing definition if user is revisiting a word
      const nextWordResponse = updatedResponses[currentWordIndex + 1];
      setCurrentDefinition(nextWordResponse ? nextWordResponse.definition : '');
    } else {
      // End of test or 5 incorrect rule triggered
      handleSubmit();
    }
  }, [currentWordIndex, words, currentDefinition, responses, incorrectStreak, stopListening]); // Added stopListening

  const handleSubmit = async () => {
    stopListening(); // Ensure recording stops before submitting
    if (isSubmitting || testComplete) return; // Prevent double submission

    setSubmitting(true);
    setError(null);

    // Ensure the last definition is captured if user clicks submit directly
    const finalResponses = [...responses];
    if (currentWordIndex < words.length && !responses.find(r => r.word === words[currentWordIndex].word)) {
      finalResponses.push({ word: words[currentWordIndex].word, definition: currentDefinition });
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendURL}/vocabulary/submit`,
        { child_id: childId, responses: finalResponses },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201 && response.data) {
        const score = response.data.score || 0;
        setFinalScore(score);
        
        if (suppressResultPage && typeof onComplete === 'function') {
          onComplete(score);
        } else {
          setTestComplete(true);
          toast.success("Test submitted successfully!");
        }
      } else {
        throw new Error("Failed to submit test results.");
      }
    } catch (err) {
      console.error("Error submitting vocabulary test:", err);
      const errorMsg = err.response?.data?.error || "An error occurred during submission.";
      setError(errorMsg);
      toast.error(errorMsg);
      
      // Even on error, if we're in continuous assessment mode, we need to continue
      if (suppressResultPage && typeof onComplete === 'function') {
        onComplete(0); // Pass 0 score on error
      } else {
        setTestComplete(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // --- UI Rendering ---

  if (isLoading) {
    return <div className="text-center p-8">Loading test...</div>;
  }

  // Show general error if not loading and not submitting
  if (error && !isLoading && !isSubmitting && !isTranscribing) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  if (testComplete) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg text-center">
        <ToastContainer position="top-center" autoClose={3000} />
        <h2 className="text-2xl font-bold mb-4 text-green-600">Test Completed!</h2>
        {finalScore !== null && (
          <p className="text-xl mb-4">Your final score is: {finalScore} / {words.length}</p>
        )}
        <p className="mb-4">Thank you for completing the Vocabulary Scale test.</p>
        {/* Display submission error if any */}
        {error && <p className="text-red-600 mb-4">Submission Error: {error}</p>}
        <button
          onClick={() => navigate(`/user/${childId}`)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Back to Child Profile
        </button>
      </div>
    );
  }

  if (words.length === 0 && !isLoading) {
    return <div className="text-center p-8">No vocabulary words found.</div>;
  }

  const currentWord = words[currentWordIndex];

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <ToastContainer position="top-center" autoClose={3000} />
      <h1 className="text-3xl font-bold text-center mb-6">Vocabulary Scale Test</h1>
      {currentWord && ( // Ensure currentWord exists before rendering
        <>
          <div className="mb-8 p-4 border border-gray-300 rounded bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Word {currentWordIndex + 1} of {words.length}</p>
            <p className="text-4xl font-semibold text-center mb-4">{currentWord.word}</p>
            <p className="text-sm text-gray-500 text-center">(Level: {currentWord.level})</p>
          </div>

          <div className="mb-6">
            <label htmlFor="definition" className="block text-lg font-medium text-gray-700 mb-2">
              {`What does "${currentWord.word}" mean?`}
            </label>
            <textarea
              id="definition"
              rows="4"
              value={currentDefinition}
              onChange={(e) => setCurrentDefinition(e.target.value)}
              placeholder="Enter the definition here or use the microphone..."
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
              disabled={isSubmitting || isRecording || isTranscribing}
            />
            <div className="mt-2 flex items-center gap-4">
              <button
                onClick={isRecording ? stopListening : startListening}
                disabled={isSubmitting || isTranscribing} // Disable while submitting or transcribing
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${
                  isRecording
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } ${isSubmitting || isTranscribing ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" /> Start Recording
                  </>
                )}
              </button>
              {isRecording && !isTranscribing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-600"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  Recording...
                </motion.div>
              )}
              {isTranscribing && (
                 <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-purple-600"
                >
                   <motion.div
                    className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  Transcribing...
                </motion.div>
              )}
            </div>
            {incorrectStreak > 0 && (
              <p className="text-xs text-orange-600 mt-1">Consecutive incorrect/skipped: {incorrectStreak}</p>
            )}
          </div>

          {/* Display transcription/general errors */}
          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

          <div className="flex justify-end items-center">
            <button
              onClick={handleNextWord}
              disabled={isSubmitting || isRecording || isTranscribing}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isSubmitting || isRecording || isTranscribing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : (currentWordIndex === words.length - 1 || incorrectStreak >= 4 ? 'Finish & Submit' : 'Next Word')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VocabularyScaleTest;
