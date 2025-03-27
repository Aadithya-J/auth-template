// import React, { useState } from "react";
// import images from "../../Data/imageData";

// const PictureRecognition = () => {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [score, setScore] = useState(0);
//   const [feedback, setFeedback] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [description, setDescription] = useState("");
//   const [canSee, setCanSee] = useState(null);
//   const [step, setStep] = useState(1);
//   const [isRecording, setIsRecording] = useState(false);
  
//   const currentImage = images[currentIndex];

//   const startRecording = (setTextCallback) => {
//     if (!("webkitSpeechRecognition" in window)) {
//       alert("Speech Recognition is not supported in this browser.");
//       return;
//     }

//     const recognition = new window.webkitSpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = "en-US";

//     recognition.onstart = () => {
//       setIsRecording(true);
//     };

//     recognition.onresult = (event) => {
//       const transcript = event.results[0][0].transcript;
//       setTextCallback(transcript);
//     };

//     recognition.onend = () => {
//       setIsRecording(false);
//     };

//     recognition.start();
//   };

//   const handleNext = () => {
//     if (step === 1 && answer.trim()) {
//       setStep(2);
//     } else if (step === 2 && description.trim()) {
//       handleSubmit();
//     } else {
//       setFeedback("Please complete this step before proceeding.");
//     }
//   };

//   const handleSubmit = () => {
//     if (answer.toLowerCase() === currentImage.correctAnswer.toLowerCase()) {
//       setScore(score + 1);
//       setFeedback("Excellent work! That's absolutely right.");
//     } else {
//       setFeedback("That's an interesting attempt! Try again.");
//     }
//     setTimeout(() => {
//       nextImage();
//     }, 2000);
//   };

//   const nextImage = () => {
//     if (currentIndex < images.length - 1) {
//       setCurrentIndex(currentIndex + 1);
//       setFeedback("");
//       setAnswer("");
//       setDescription("");
//       setCanSee(null);
//       setStep(1);
//     } else {
//       setFeedback(`Game Over! Your score: ${score + 1}/${images.length}`);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-purple-500 p-6">
//       <div className="w-full max-w-md p-4 bg-white shadow-lg rounded-2xl">
//         <div className="flex flex-col items-center">
//           <img src={currentImage.imageUrl} alt="Test" className="w-60 h-60 object-cover rounded-lg mt-4" />
          
//           <p className="text-lg font-semibold mt-4">Can you see this picture?</p>
//           <div className="flex gap-4 mt-2">
//             <button onClick={() => setCanSee(true)} className={`px-4 py-2 rounded-md ${canSee === true ? "bg-green-600 text-white" : "bg-gray-300"}`}>Yes</button>
//             <button onClick={() => setCanSee(false)} className={`px-4 py-2 rounded-md ${canSee === false ? "bg-red-600 text-white" : "bg-gray-300"}`}>No</button>
//           </div>

//           {canSee === true && step === 1 && (
//             <>
//               <p className="text-lg font-semibold mt-4">Can you tell me what it is?</p>
//               <div className="flex flex-col sm:flex-row items-center gap-4">
//                 <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} className="p-2 border rounded-md w-full text-center" placeholder="Type your answer here" />
//                 <button onClick={() => startRecording(setAnswer)} className="px-4 py-2 rounded-md bg-blue-600 text-white">{isRecording ? "Listening..." : "Speak"}</button>
//               </div>
//               <button onClick={handleNext} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Next</button>
//             </>
//           )}

//           {canSee === true && step === 2 && (
//             <>
//               <p className="text-lg font-semibold mt-4">What is the picture about?</p>
//               <div className="flex flex-col sm:flex-row items-center gap-4">
//                 <textarea className="p-2 border rounded-md w-full text-center" placeholder="Describe the image..." value={description} onChange={(e) => setDescription(e.target.value)} />
//                 <button onClick={() => startRecording(setDescription)} className="px-4 py-2 rounded-md bg-blue-600 text-white">{isRecording ? "Listening..." : "Speak"}</button>
//               </div>
//               <button onClick={handleNext} className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">Submit</button>
//             </>
//           )}

//           {feedback && <p className="mt-3 text-gray-700">{feedback}</p>}

//           <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
//             <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}></div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PictureRecognition;


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PictureCard from './PictureCard';
import ProgressTracker from './ProgressTracker';
import images from '../../Data/imageData';

const PictureRecognition = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canSee, setCanSee] = useState(null);
  const [answer, setAnswer] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const currentImage = images[currentIndex];

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      speech.rate = 0.9;
      speech.pitch = 1.2;
      window.speechSynthesis.speak(speech);
    }
  };

  const startRecording = (setTextCallback) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsRecording(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTextCallback(transcript);
      toast.success(`I heard: ${transcript}`);
    };

    recognition.onend = () => setIsRecording(false);

    recognition.start();
  };

  const handleCanSeeSelection = (selection) => {
    setCanSee(selection);
    if (selection) {
      setStep(2);
      speakText('Great! Can you tell me what it is?');
    } else {
      nextImage();
    }
  };

  const handleNext = () => {
    if (step === 2 && answer.trim()) {
      setStep(3);
      speakText('Now, tell me about the picture.');
    } else if (step === 3 && description.trim()) {
      handleSubmit();
    } else {
      setFeedback('Please complete this step before proceeding.');
    }
  };

  const handleSubmit = () => {
    if (answer?.toLowerCase() === currentImage.correctAnswer?.toLowerCase()) {
      setScore(prevScore => prevScore + 1);
      setFeedback('Excellent work! That\'s absolutely right.');
    } else {
      setFeedback('That\'s an interesting attempt! Try again.');
    }
    setTimeout(() => {
      if (typeof nextImage === 'function') {
        nextImage();
      }
    }, 2000);
  };
  

  const nextImage = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setFeedback('');
      setAnswer('');
      setDescription('');
      setCanSee(null);
      setStep(1);
    } else {
      setFeedback(`Game Over! Your score: ${score}/${images.length}`);
    }
  };

  useEffect(() => {
    setTimeout(() => speakText('Can you see this picture?'), 1000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-blue-100 p-6">
      <div className="max-w-2xl scale-75 mb-16 w-full bg-white shadow-lg rounded-2xl p-6">
      <ProgressTracker currentStep={currentIndex + 1} totalSteps={images.length} />
      <div className="text-center space-y-6">
          <motion.h1
            key={step}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-2xl font-bold text-gray-800"
          >
            {step === 1 ? 'Can you see this picture?' : step === 2 ? 'What is it?' : 'What is the picture about?'}
          </motion.h1>

          <div className="flex justify-center">
            <PictureCard imageName={currentImage.imageUrl} />
          </div>

          {step === 1 && (
            <div className="flex justify-center space-x-6">
              <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300" onClick={() => handleCanSeeSelection(true)}>Yes, I can!</button>
              <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300" onClick={() => handleCanSeeSelection(false)}>No, I can't</button>
            </div>
          )}

          {step > 1 && (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
  <input
    type="text"
    value={step === 2 ? answer : description}
    onChange={(e) =>
      step === 2 ? setAnswer(e.target.value) : setDescription(e.target.value)
    }
    className="w-full border border-gray-300 rounded-xl p-3 text-lg focus:ring-2 focus:ring-blue-400"
    placeholder={step === 2 ? "Type your answer here..." : "Type the description here..."}
  />
  <span className="text-gray-500">or</span>
  <button
    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-4 w-[30%] rounded-xl shadow-md transition-all duration-300"
    onClick={() => startRecording(step === 2 ? setAnswer : setDescription)}
  >
    {isRecording ? "Listening..." : "Use Voice"}
  </button>
</div>

              <div className="flex justify-center space-x-4">
                <button className="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all duration-300" onClick={handleNext}>Next</button>
              </div>
            </div>
          )}
          {feedback && <p className="text-purple-700 mt-4 font-semibold">{feedback}</p>}
        </div>
      </div>
    </div>
  );
};

export default PictureRecognition;
