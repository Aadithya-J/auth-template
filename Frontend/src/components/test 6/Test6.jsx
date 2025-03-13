import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import WordGrid from "./WordGrid";
import styles from "../../styles/Test.module.css";
import { backendURL } from "../../definedURL";
import { pythonURL } from "../../definedURL";
import { FaRegCirclePlay } from "react-icons/fa6";
import { FaRegStopCircle } from "react-icons/fa";
import { PiDotsThreeBold } from "react-icons/pi";
import { MdOutlineArrowCircleRight } from "react-icons/md";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import Toast styles

import { Play, StopCircle, Mic, ArrowRightCircle, UploadCloud, Loader } from 'lucide-react';
import { CiPlay1 } from "react-icons/ci";
import {  MicOff } from "lucide-react";




function Test() {
  const [givingTest, setGivingTest] = useState(true);
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
    const file = new File([audioBlob], "user_audio.wav", { type: "audio/wav" });
    const formData = new FormData();
    formData.append("file", file);

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
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const formData = new FormData();
      formData.append("file", file);
      await uploadAudio(file);
    }
  };

  const handleSubmit = async () => {
    if (!transcriptionReady) {
      console.log("Transcription is not ready yet. Please wait...");
      return;
    }

    const spokenWords = transcript.trim().toLowerCase();
    const childId = localStorage.getItem("childId") || null;
    const token = localStorage.getItem("access_token");

    try {
      const responseFromApi = await axios.post(
        "http://localhost:3000/addTest6",
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
              state: { score, tableData }, // 🔹 Pass test results to AfterTest
            }),
        });
      } else {
        toast.error("Failed to submit test. Please try again.", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("An error occurred while submitting the test.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-4xl mx-auto p-8 rounded-2xl glass-panel">
      <div className="flex flex-col space-y-8">
      <WordGrid/>
              <div className="animate-slide-up transition-all duration-300">
          <div className="WordGrid" />
        </div>

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
</div>;

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* File upload */}
              <div className="relative w-full sm:w-auto">
                <input
                  type="file"
                  accept="audio/mp3"
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
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-500 rounded-lg border border-gray-200"
                >
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Transcribing</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!transcriptionReady}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 text-sm font-medium ${
                    transcriptionReady
                      ? 'bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary/90 active:bg-primary/95' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
};

export default Test;

// The readingAgeMap and wordsGrid remain unchanged.

// ... The readingAgeMap and wordsGrid are unchanged

const readingAgeMap = [
  { score: 0, age: "6.0 minus" },
  { score: 1, age: "6.0 minus" },
  { score: 2, age: "6.0" },
  { score: 3, age: "6.2" },
  { score: 4, age: "6.4" },
  { score: 5, age: "6.5" },
  { score: 6, age: "6.6" },
  { score: 7, age: "6.7" },
  { score: 8, age: "6.7" },
  { score: 9, age: "6.8" },
  { score: 10, age: "6.9" },
  { score: 11, age: "6.10" },
  { score: 12, age: "6.10" },
  { score: 13, age: "6.11" },
  { score: 14, age: "6.11" },
  { score: 15, age: "7.0" },
  { score: 16, age: "7.1" },
  { score: 17, age: "7.2" },
  { score: 18, age: "7.2" },
  { score: 19, age: "7.3" },
  { score: 20, age: "7.4" },
  { score: 21, age: "7.4" },
  { score: 22, age: "7.5" },
  { score: 23, age: "7.5" },
  { score: 24, age: "7.6" },
  { score: 25, age: "7.7" },
  { score: 26, age: "7.7" },
  { score: 27, age: "7.8" },
  { score: 28, age: "7.9" },
  { score: 29, age: "7.10" },
  { score: 30, age: "8.0" },
  { score: 31, age: "8.1" },
  { score: 32, age: "8.2" },
  { score: 33, age: "8.3" },
  { score: 34, age: "8.4" },
  { score: 35, age: "8.5" },
  { score: 36, age: "8.6" },
  { score: 37, age: "8.6" },
  { score: 38, age: "8.7" },
  { score: 39, age: "8.8" },
  { score: 40, age: "8.9" },
  { score: 41, age: "8.10" },
  { score: 42, age: "8.11" },
  { score: 43, age: "9.0" },
  { score: 44, age: "9.1" },
  { score: 45, age: "9.2" },
  { score: 46, age: "9.3" },
  { score: 47, age: "9.4" },
  { score: 48, age: "9.5" },
  { score: 49, age: "9.6" },
  { score: 50, age: "9.6" },
  { score: 51, age: "9.7" },
  { score: 52, age: "9.8" },
  { score: 53, age: "9.9" },
  { score: 54, age: "9.10" },
  { score: 55, age: "9.11" },
  { score: 56, age: "10.0" },
  { score: 57, age: "10.1" },
  { score: 58, age: "10.1" },
  { score: 59, age: "10.2" },
  { score: 60, age: "10.3" },
  { score: 61, age: "10.4" },
  { score: 62, age: "10.5" },
  { score: 63, age: "10.6" },
  { score: 64, age: "10.7" },
  { score: 65, age: "10.8" },
  { score: 66, age: "10.9" },
  { score: 67, age: "10.10" },
  { score: 68, age: "11.0" },
  { score: 69, age: "11.1" },
  { score: 70, age: "11.3" },
  { score: 71, age: "11.4" },
  { score: 72, age: "11.5" },
  { score: 73, age: "11.6" },
  { score: 74, age: "11.8" },
  { score: 75, age: "11.10" },
  { score: 76, age: "12.0" },
  { score: 77, age: "12.1" },
  { score: 78, age: "12.2" },
  { score: 79, age: "12.3" },
  { score: 80, age: "12.4" },
  { score: 81, age: "12.5" },
  { score: 82, age: "12.6" },
  { score: 83, age: "12.6+" },
  { score: 84, age: "12.6+" },
  { score: 85, age: "12.6+" },
  { score: 86, age: "12.6+" },
  { score: 87, age: "12.6+" },
  { score: 88, age: "12.6+" },
  { score: 89, age: "12.6+" },
  { score: 90, age: "12.6+" },
  { score: 91, age: "12.6+" },
  { score: 92, age: "12.6+" },
  { score: 93, age: "12.6+" },
  { score: 94, age: "12.6+" },
  { score: 95, age: "12.6+" },
  { score: 96, age: "12.6+" },
  { score: 97, age: "12.6+" },
  { score: 98, age: "12.6+" },
  { score: 99, age: "12.6+" },
  { score: 100, age: "12.6+" },
];

const wordsGrid = [
  ["tree", "little", "milk", "egg", "book"], // Row 1
  ["school", "sit", "frog", "playing", "bun"], // Row 2
  ["flower", "road", "clock", "train", "light"], // Row 3
  ["picture", "think", "summer", "people", "something"], // Row 4
  ["dream", "downstairs", "biscuit", "shepherd", "thirsty"], // Row 5
  ["crowd", "sandwich", "beginning", "postage", "island"], // Row 6
  ["saucer", "angel", "sailing", "appeared", "knife"], // Row 7
  ["canary", "attractive", "imagine", "nephew", "gradually"], // Row 8
  ["smoulder", "applaud", "disposal", "nourished", "diseased"], // Row 9
  ["university", "orchestra", "knowledge", "audience", "situated"], // Row 10
  ["physics", "campaign", "choir", "intercede", "fascinate"], // Row 11
  ["forfeit", "siege", "pavement", "plausible", "prophecy"], // Row 12
  ["colonel", "soloist", "systematic", "slovenly", "classification"], // Row 13
  ["genuine", "institution", "pivot", "conscience", "heroic"], // Row 14
  ["pneumonia", "preliminary", "antique", "susceptible", "enigma"], // Row 15
  ["oblivion", "scintillate", "satirical", "sabre", "beguile"], // Row 16
  ["terrestrial", "belligerent", "adamant", "sepulchre", "statistics"], // Row 17
  ["miscellaneous", "procrastinate", "tyrannical", "evangelical", "grotesque"], // Row 18
  ["ineradicable", "judicature", "preferential", "homonym", "fictitious"], // Row 19
  ["rescind", "metamorphosis", "somnambulist", "bibliography", "idiosyncrasy"], // Row 20
];
