import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendURL } from "../../definedURL";
import { WordGrid, WordGridTamil, WordGridHindi } from "./WordGrid.jsx";
import { useLanguage } from "../../contexts/LanguageContext.jsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ArrowRightCircle, Mic, MicOff, UploadCloud } from "lucide-react";

// Audio Recording Hook
const useAudioRecorder = (onAudioRecorded) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });

    return () => {
      if (window.stream) {
        window.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = () => {
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
            onAudioRecorded(audioBlob);
          }
        };

        newMediaRecorder.start();
      })
      .catch((error) => {
        console.error("Error accessing microphone:", error);
        setIsRecording(false);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (window.stream) {
      window.stream.getTracks().forEach((track) => track.stop());
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};

// Transcription Service
const useTranscriptionService = () => {
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionReady, setTranscriptionReady] = useState(false);
  const { language } = useLanguage();
  const transcribeAudio = async (audioBlob) => {
    const formData = new FormData();

    if (audioBlob instanceof File) {
      formData.append("file", audioBlob);
    } else {
      const file = new File([audioBlob], "user_audio.wav", {
        type: "audio/wav",
      });
      formData.append("file", file);
    }

    formData.append("language", language);

    try {
      setIsTranscribing(true);

      const response = await fetch(`${backendURL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setTranscript(result.transcription);
        setTranscriptionReady(true);
        return result.transcription;
      } else {
        console.error("Error during transcription:", response.statusText);
        toast.error("Transcription failed. Please try again.");
        return null;
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
      toast.error("Error uploading audio. Please try again.");
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  return {
    transcript,
    isTranscribing,
    transcriptionReady,
    transcribeAudio,
    setTranscriptionReady,
  };
};

// Test Submission Service
const useTestSubmission = (onTestComplete) => {
  const [testResults, setTestResults] = useState([]);
  const navigate = useNavigate();

  const submitTest = async (
    transcript,
    suppressResultPage,
    language = "en"
  ) => {
    const spokenWords = transcript.trim().toLowerCase();
    const childId = localStorage.getItem("childId") || null;
    const token = localStorage.getItem("access_token");

    try {
      const responseFromApi = await axios.post(
        `${backendURL}/addTest6`,
        { childId, spokenWords, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (responseFromApi.status === 201) {
        const { score, correctGroups, errorWords } = responseFromApi.data;
        const validCorrectGroups = Array.isArray(correctGroups)
          ? correctGroups.map((group) =>
              Array.isArray(group) ? group : [group]
            )
          : [];
        const validErrorWords = Array.isArray(errorWords)
          ? errorWords.map((word) => (Array.isArray(word) ? word : [word]))
          : [];

        const tableData = validCorrectGroups.map((group, index) => ({
          continuousCorrectWords: group.join(" "),
          errorWords: validErrorWords[index]?.join(" ") || "-",
        }));

        setTestResults(tableData);

        if (suppressResultPage && typeof onTestComplete === "function") {
          onTestComplete(score);
        } else {
          toast.success(`Test submitted! Score: ${score}%`, {
            position: "top-center",
            onClose: () =>
              navigate("/results", {
                state: { score, tableData },
              }),
          });
        }
        return true;
      } else {
        toast.error("Failed to submit test. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Full error details:", {
        config: error.config,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("An error occurred while submitting the test.");
      return false;
    }
  };

  return {
    testResults,
    submitTest,
  };
};

// UI Components
const RecordingControls = ({
  isRecording,
  onStartRecording,
  onStopRecording,
}) => (
  <div className="flex items-center gap-4">
    <div className="relative">
      <button
        onClick={onStartRecording}
        disabled={isRecording}
        className={`rounded-full h-14 w-14 flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
          isRecording
            ? "opacity-50 cursor-not-allowed bg-blue-100"
            : "bg-white border border-blue-400 hover:shadow-md hover:shadow-blue-200 active:scale-95"
        }`}
        aria-label="Start recording"
      >
        <Mic className="h-6 w-6 text-blue-600 transition-transform duration-300 ease-out" />
      </button>

      {isRecording && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
      )}
    </div>

    <button
      onClick={onStopRecording}
      disabled={!isRecording}
      className={`rounded-full h-14 w-14 flex items-center justify-center transition-all duration-300 transform hover:scale-105 ${
        !isRecording
          ? "opacity-50 cursor-not-allowed bg-blue-100"
          : "bg-white border border-blue-400 hover:shadow-md hover:shadow-blue-200 active:scale-95"
      }`}
      aria-label="Stop recording"
    >
      <MicOff className="h-6 w-6 text-blue-600 transition-transform duration-300 ease-out" />
    </button>

    {isRecording && (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md text-blue-600 rounded-full border border-blue-100 shadow-sm animate-pulse">
        <Mic className="h-4 w-4" />
        <span className="text-sm font-medium">Recording</span>
        <span className="inline-flex gap-0.5">
          <span className="animate-bounce delay-0">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </span>
      </div>
    )}
  </div>
);

const FileUploadButton = ({ onFileUpload, t }) => (
  <div className="relative w-full sm:w-auto">
    <input
      type="file"
      accept="audio/*"
      onChange={onFileUpload}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      aria-label="Upload audio file"
    />
    <button className="w-full sm:w-auto flex items-center gap-2 px-5 py-2.5 bg-white rounded-lg shadow-sm hover:shadow-blue-200 hover:shadow-md transition-all duration-300 text-sm font-medium text-blue-700 border border-blue-200 transform hover:translate-y-px">
      <UploadCloud className="h-4 w-4" />
      <span>{t("uploadAudio")}</span>
    </button>
  </div>
);

const SubmitButton = ({ isTranscribing, transcriptionReady, onSubmit, t }) =>
  isTranscribing ? (
    <button
      disabled
      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-500 rounded-lg border border-blue-200"
    >
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
      </div>
      <span className="text-sm font-medium ml-2">{t("transcribing")}</span>
    </button>
  ) : (
    <button
      onClick={onSubmit}
      disabled={!transcriptionReady}
      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium transform hover:translate-y-px ${
        transcriptionReady
          ? "bg-blue-500 text-white shadow-md hover:shadow-lg hover:bg-blue-600 active:bg-blue-700"
          : "bg-blue-100 text-blue-300 cursor-not-allowed"
      }`}
    >
      <span>{t("submit")}</span>
      <ArrowRightCircle className="h-4 w-4" />
    </button>
  );

// Main Component
function Test6({ suppressResultPage = false, onComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const { language, t } = useLanguage();
  const {
    transcript,
    isTranscribing,
    transcriptionReady,
    transcribeAudio,
    setTranscriptionReady,
  } = useTranscriptionService();
  const { testResults, submitTest } = useTestSubmission(onComplete);
  const { isRecording, startRecording, stopRecording } =
    useAudioRecorder(transcribeAudio);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      await transcribeAudio(file);
    }
  };

  const handleSubmit = async () => {
    if (!transcriptionReady) {
      toast.info(t("transcriptionNotReady"));
      return;
    }
    await submitTest(transcript, suppressResultPage, language);
  };

  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-blue-50 to-white">
      <div className="animate-fade-in w-full max-w-4xl mx-auto p-8 rounded-2xl glass-panel transition-all duration-500 ease-in-out transform hover:shadow-lg bg-white/80 backdrop-blur-sm shadow-md border border-blue-100">
        <ToastContainer position="top-center" />

        <div className="flex flex-col space-y-8">
          {language === "en" ? (
            <WordGrid />
          ) : language === "ta" ? (
            <WordGridTamil />
          ) : language === "hi" ? (
            <WordGridHindi />
          ) : null}

          <div className="animate-slide-up transition-transform delay-100 rounded-xl bg-blue-100/40 backdrop-blur-sm border border-blue-200 p-6 hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <RecordingControls
                isRecording={isRecording}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
              />

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <FileUploadButton onFileUpload={handleFileUpload} t={t} />
                <SubmitButton
                  isTranscribing={isTranscribing}
                  transcriptionReady={transcriptionReady}
                  onSubmit={handleSubmit}
                  t={t}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Test6;
