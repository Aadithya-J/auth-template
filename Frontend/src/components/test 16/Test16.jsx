
import axios from "axios";
import { useState } from "react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { backendURL } from "../../definedURL";

const wordPairs = [
  ["dog", "hog"],
  ["gate", "cake"],
  ["bun", "bun"],
  ["let", "net"],
  ["ride", "ride"],
  ["man", "man"],
  ["pit", "bit"],
  ["thing", "sing"],
  ["nut", "ton"],
  ["big", "big"],
  ["no", "mow"],
  ["pot", "top"],
  ["pat", "pat"],
  ["shut", "just"],
  ["name", "game"],
  ["raw", "war"],
  ["feet", "seat"],
  ["fun", "fun"],
  ["day", "bay"],
  ["in", "on"],
];

const SoundDiscriminationTest = ({ suppressResultPage = false, onComplete }) => {
  const [score, setScore] = useState(0);
  const [answeredPairs, setAnsweredPairs] = useState(new Set());
  const [selectedOptions, setSelectedOptions] = useState(Array(wordPairs.length).fill(null));
  const [skippedPairs, setSkippedPairs] = useState(Array(wordPairs.length).fill(false));
  const navigate = useNavigate(); // Use navigate hook

  const handleResponse = (index, isCorrect) => {
    if (skippedPairs[index]) return;

    const [word1, word2] = wordPairs[index];
    const correctAnswer = word1 === word2;

    setSelectedOptions((prev) => {
      const updated = [...prev];
      updated[index] = isCorrect;
      return updated;
    });

    setScore((prevScore) => {
      if (answeredPairs.has(index)) {
        const previousAnswerCorrect = selectedOptions[index] === correctAnswer;
        return isCorrect === correctAnswer && !previousAnswerCorrect
          ? prevScore + 1
          : isCorrect !== correctAnswer && previousAnswerCorrect
          ? prevScore - 1
          : prevScore;
      } else {
        return isCorrect === correctAnswer ? prevScore + 1 : prevScore;
      }
    });

    setAnsweredPairs((prev) => new Set(prev).add(index));
  };

  const handleSkip = (index) => {
    setSkippedPairs((prev) => {
      const newSkipped = [...prev];
      newSkipped[index] = !newSkipped[index]; // Toggle skip/unskip
      return newSkipped;
    });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access_token");
    const childId = localStorage.getItem("childId");

    if (!childId) {
      alert("No student data found. Please select a student before taking the test.");
      return;
    }

    try {
      const response = await axios.post(`${backendURL}/addTest16`, 
        {
          childId: childId,
          test_name: "Test 16: Sound Discrimination",
          score: score,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        if (suppressResultPage && typeof onComplete === 'function') {
          onComplete(score);
        } else {
          toast.success("Test submitted successfully!", {
            position: "top-center",
            onClose: () => navigate('/'),
          });
        }
      } else {
        toast.error("Failed to submit test. Please try again.", {
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error submitting test:", error);
      toast.error("An error occurred while submitting the test. Please try again.", {
        position: "top-center",
      });
    }
  };

  return (
<div className="p-8 overflow-auto h-screen bg-gray-200">
  <div className="mb-8">
    <h2 className="text-3xl font-roboto font-extrabold mb-7 flex items-center">
      Sound Discrimination Test
    </h2>
    <div style={{ height: '2px', backgroundColor: '#999', width: '100%', marginBottom: '40px' }}></div>

    {wordPairs.map((pair, index) => (
      <div
        key={index}
        className="flex flex-col items-end mb-7 bg-white rounded-lg p-5 w-full shadow-md"
      >
        <div className="w-full mb-4 text-left">
          <span className={`text-xl font-bold ${skippedPairs[index] ? "text-gray-600" : "text-gray-900"}`}>
            Word Pair Number {index + 1} {skippedPairs[index] && <span className="text-gray-600">: Skipped</span>}
          </span>
        </div>

        <div className="w-full flex justify-end mb-4">
          <div className="w-full">
            <AudioPlayer
              src={`/audio/${pair[0]}_${pair[1]}.m4a`}
              customProgressBarSection={['MAIN_CONTROLS', 'PROGRESS_BAR', 'DURATION']}
              customControlsSection={[]}
              customAdditionalControls={[]}
              showJumpControls={false}
              layout="horizontal"
            />
          </div>
        </div>

        <div className="flex justify-between w-full items-center space-x-4">
          <div className="flex space-x-4">
            <button
              className={`py-3 px-5 rounded-md text-lg transition transform duration-200 ${
                selectedOptions[index] === true
                  ? "bg-green-700 text-white"
                  : skippedPairs[index]
                  ? "border-2 border-gray-600 text-gray-600"
                  : "border-2 border-green-700 text-green-700 hover:bg-green-700 hover:text-white hover:translate-y-[-2px]"
              }`}
              onClick={() => handleResponse(index, true)}
              disabled={skippedPairs[index]}
            >
              Yes, the sounds are same
            </button>

            <button
              className={`py-3 px-5 rounded-md text-lg transition transform duration-200 ${
                selectedOptions[index] === false
                  ? "bg-red-700 text-white"
                  : skippedPairs[index]
                  ? "border-2 border-gray-600 text-gray-600"
                  : "border-2 border-red-700 text-red-700 hover:bg-red-700 hover:text-white hover:translate-y-[-2px]"
              }`}
              onClick={() => handleResponse(index, false)}
              disabled={skippedPairs[index]}
            >
              No, the sounds are not same
            </button>
          </div>

          <div className="flex justify-end flex-grow">
            <button
              className={`py-3 px-5 rounded-md text-lg transition transform duration-200 ${
                skippedPairs[index]
                  ? "border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white"
                  : "border-2 border-gray-700 text-gray-700 hover:bg-gray-300 hover:text-black"
              }`}
              onClick={() => handleSkip(index)}
            >
              {skippedPairs[index] ? "Attempt" : "Skip"}
            </button>
          </div>
        </div>
      </div>
    ))}

    <div className="flex justify-center mt-8">
      <button
        onClick={handleSubmit}
        className="bg-green-700 text-white font-bold py-3 px-6 rounded-md text-lg transition transform duration-200 hover:bg-green-800 hover:translate-y-[-2px] shadow-lg"
      >
        Submit Test
      </button>
    </div>
  </div>
  <ToastContainer />
</div>

  );
};

export default SoundDiscriminationTest;
