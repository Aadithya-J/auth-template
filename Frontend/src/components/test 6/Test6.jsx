import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import WordGrid from "./WordGrid";
import { pythonURL, backendURL } from "../../definedURL";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Mic, ArrowRightCircle, UploadCloud } from "lucide-react";
import { MicOff } from "lucide-react";

function Test6() {
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionReady, setTranscriptionReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const mediaRecorderRef = useRef(null);
  const navigate = useNavigate();
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  }, [navigate]);

  const startListening = () => {
    setIsRecording(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
        let localAudioChunks = [];
        const newMediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = newMediaRecorder;

        newMediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            localAudioChunks.push(event.data);
          }
        };

        newMediaRecorder.onstop = async () => {
          setIsRecording(false);
          if (localAudioChunks.length > 0) {
            const audioBlob = new Blob(localAudioChunks, { type: "audio/wav" });
            await uploadAudio(audioBlob);
          }
        };

        newMediaRecorder.start();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
        setIsRecording(false);
      });
  };

  const stopListening = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (window.stream) {
      window.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    if (audioBlob instanceof File) {
      formData.append("file", audioBlob);
    } else {
      const file = new File([audioBlob], "user_audio.wav", {
        type: "audio/wav",
      });
      formData.append("file", file);
    }

    try {
      setIsTranscribing(true);
      const response = await fetch(`${pythonURL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setTranscript(result.transcription);
        setTranscriptionReady(true);
      } else {
        console.error("Error during transcription:", response.statusText);
        toast.error("Transcription failed. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Error uploading audio. Please try again.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      await uploadAudio(file);
    }
  };

  const handleSubmit = async () => {
    if (!transcriptionReady) {
      toast.info("Transcription is not ready yet. Please wait...");
      return;
    }

    const spokenWords = transcript.trim().toLowerCase();
    const childId = localStorage.getItem("childId") || null;
    const token = localStorage.getItem("access_token");

    try {
      const responseFromApi = await axios.post(
        `${backendURL}/addTest6`,
        { childId, spokenWords },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (responseFromApi.status === 201) {
        const { score, correctGroups, errorWords } = responseFromApi.data;
        // Ensure correctGroups and errorWords are arrays of arrays
        const validCorrectGroups = Array.isArray(correctGroups)
          ? correctGroups.map((group) =>
              Array.isArray(group) ? group : [group]
            )
          : [];
        const validErrorWords = Array.isArray(errorWords)
          ? errorWords.map((word) => (Array.isArray(word) ? word : [word]))
          : [];

        const tableData = validCorrectGroups.map((group, index) => ({
          continuousCorrectWords: group.join(" "), // Join words into a string
          errorWords: validErrorWords[index]?.join(" ") || "-", // Handle missing data
        }));
        setTestResults(tableData); // Store results locally
        toast.success(`Test submitted! Score: ${score}%`, {
          position: "top-center",
          onClose: () =>
            navigate("/results", {
              state: { score, tableData }, // Pass test results to AfterTest
            }),
        });
      } else {
        toast.error("Failed to submit test. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("An error occurred while submitting the test.");
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto p-8 rounded-2xl glass-panel">
      <ToastContainer position="top-center" />
      <div className="flex flex-col space-y-8">
        <WordGrid />

        {/* Controls Panel */}
        <div className="animate-slide-up transition-transform delay-100 rounded-xl bg-secondary/50 backdrop-blur-sm border border-muted p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Recording controls */}
            <div className="flex items-center gap-4">
              {/* Start Recording Button */}
              <div className="relative">
                <button
                  onClick={startListening}
                  disabled={isRecording}
                  className={`rounded-full h-14 w-14 flex items-center justify-center transition-all duration-300 ${
                    isRecording
                      ? "opacity-50 cursor-not-allowed bg-gray-300"
                      : "bg-white border border-gray-600 hover:shadow-lg active:scale-95"
                  }`}
                  aria-label="Start recording"
                >
                  <Mic className="h-6 w-6 text-green-600 transition-transform duration-300 ease-out" />
                </button>

                {/* Recording Indicator */}
                {isRecording && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Stop Recording Button */}
              <button
                onClick={stopListening}
                disabled={!isRecording}
                className={`rounded-full h-14 w-14 flex items-center justify-center transition-all duration-300 ${
                  !isRecording
                    ? "opacity-50 cursor-not-allowed bg-gray-300"
                    : "bg-white border border-black hover:shadow-lg active:scale-95"
                }`}
                aria-label="Stop recording"
              >
                <MicOff className="h-6 w-6 text-red-500 transition-transform duration-300 ease-out" />
              </button>

              {/* Recording Status */}
              {isRecording && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md text-red-600 rounded-full border border-red-100 shadow-sm animate-fade-in">
                  <Mic className="h-4 w-4" />
                  <span className="text-sm font-medium">Recording</span>
                  <span className="inline-flex gap-0.5">
                    <span className="animate-fade-in-out delay-0">.</span>
                    <span className="animate-fade-in-out delay-300">.</span>
                    <span className="animate-fade-in-out delay-600">.</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* File upload */}
              <div className="relative w-full sm:w-auto">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  aria-label="Upload audio file"
                />
                <button className="w-full sm:w-auto flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 text-sm font-medium text-gray-700">
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload Audio</span>
                </button>
              </div>

              {/* Submit button or loading indicator */}
              {isTranscribing ? (
                <button
                  disabled
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-300 text-gray-700 rounded-lg border border-gray-400"
                >
                  <span className="text-sm font-medium">Transcribing</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!transcriptionReady}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium ${
                    transcriptionReady
                      ? "bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-primary/90 active:bg-primary/95"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <span>Submit</span>
                  <ArrowRightCircle className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Test6;
