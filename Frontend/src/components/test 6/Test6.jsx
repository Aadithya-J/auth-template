// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import WordGrid from "./WordGrid";
// import styles from "../../styles/Test.module.css";
// import AfterTest from "./AfterTest";
// import { backendURL } from "../../definedURL";
// import { pythonURL } from "../../definedURL";
// import { FaRegCirclePlay } from "react-icons/fa6";
// import { FaRegStopCircle } from "react-icons/fa";
// import { PiDotsThreeBold } from "react-icons/pi";
// import { MdOutlineArrowCircleRight } from "react-icons/md";
// import axios from 'axios';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';  // Import Toast styles

// function Test() {
//   const [givingTest, setGivingTest] = useState(true);
//   const [transcript, setTranscript] = useState("");
//   const [username, setUsername] = useState("");
//   const [response, setResponse] = useState(null);
//   const [audioChunks, setAudioChunks] = useState([]);
//   const [isTranscribing, setIsTranscribing] = useState(false);
//   const [transcriptionReady, setTranscriptionReady] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia({ audio: true })
//       .then((stream) => {
//         window.stream = stream;
//       })
//       .catch((error) => {
//         console.error("Error accessing media devices.", error);
//       });
//   }, [navigate]);

//   const startListening = () => {
//     if (window.stream) {
//       let localAudioChunks = [];
//       const newMediaRecorder = new MediaRecorder(window.stream);

//       newMediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           localAudioChunks.push(event.data);
//         }
//       };

//       newMediaRecorder.onstop = async () => {
//         if (localAudioChunks.length > 0) {
//           const audioBlob = new Blob(localAudioChunks, { type: "audio/wav" });
//           const file = new File([audioBlob], "user_audio.wav", { type: "audio/wav" });
//           const formData = new FormData();
//           formData.append("file", file);

//           try {
//             setIsTranscribing(true);
//             const response = await fetch(`${pythonURL}/transcribe`, {
//               method: "POST",
//               body: formData,
//             });

//             if (response.ok) {
//               const result = await response.json();
//               setTranscript(result.transcription);
//               setTranscriptionReady(true);
//               console.log("Transcription Result", result);
//             } else {
//               console.error("Error during transcription:", response.statusText);
//             }
//           } catch (error) {
//             console.error("Error uploading audio:", error);
//           } finally {
//             setIsTranscribing(false);
//           }
//         }
//       };

//       newMediaRecorder.start();
//     } else {
//       console.error("Media stream not initialized.");
//     }
//   };

//   const stopListening = () => {
//     if (window.stream) {
//       const tracks = window.stream.getTracks();
//       tracks.forEach((track) => track.stop());
//     } else {
//       console.error("Media stream not initialized.");
//     }
//   };

//   const handleSubmit = async () => {
//     if (!transcriptionReady) {
//       console.log("Transcription is not ready yet. Please wait...");
//       return;
//     }

//     setGivingTest(false);

//     const wordsArray = transcript
//       .split(" ")
//       .map((word) => word.toLowerCase().replace(/[^a-z]/g, ""));

//     const { score, age, correctWords, incorrectWords } = await checkWords(wordsArray);

//     setResponse({ score, age, correctWords, incorrectWords });

//     const childId = localStorage.getItem('childId');  // Fetching childId from localStorage
//     const token = localStorage.getItem('token');  // Fetching token from localStorage

//     try {
//       const responseFromApi = await axios.post(
//         `${backendURL}/addTest`,
//         {
//           childId,
//           test_name: "Test 6: Schonells Test",
//           reading_age: age,
//           score,
//           correctWords,
//           incorrectWords,
//         },
//         {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         }
//       );

//       if (responseFromApi.status === 201) {
//         toast.success("Test submitted successfully!", {
//           position: "top-center",  // Position the toast
//           onClose: () => navigate('/'),  // Redirect to homepage on toast close
//         });
//       } else {
//         toast.error("Failed to submit test. Please try again.", {
//           position: "top-center",
//         });
//       }
//     } catch (error) {
//       console.error("Error submitting test results:", error);
//       toast.error("An error occurred while submitting the test.", {
//         position: "top-center",
//       });
//     }
//   };

//   const checkWords = async (words) => {
//     let score = 0;
//     let correctWords = [];
//     let incorrectWords = [];

//     const flatWordsGrid = wordsGrid.flat();

//     for (let word of words) {
//       if (flatWordsGrid.includes(word)) {
//         score++;
//         correctWords.push(word);
//       } else {
//         incorrectWords.push(word);
//       }
//     }

//     const tempAge = getReadingAge(score);
//     return { score, age: tempAge, correctWords, incorrectWords };
//   };

//   const getReadingAge = (score) => {
//     const match = readingAgeMap.find((entry) => entry.score === score);
//     return match ? match.age : "N/A";
//   };

//   return (
//     <>
//       {givingTest ? (
//         <div className={`${styles.container} ${givingTest ? styles.giveHeight : ''}`}>
//           <div className={styles.testBox}>
//             <WordGrid />
//             <div className={styles.buttonBox}>
//               <FaRegCirclePlay onClick={startListening} className={styles.iconButton} />
//               <FaRegStopCircle onClick={stopListening} className={styles.iconButton} />
//               {isTranscribing ? (
//                 <PiDotsThreeBold className={styles.iconButton} />
//               ) : (
//                 <MdOutlineArrowCircleRight onClick={handleSubmit} disabled={!transcriptionReady} className={styles.iconButtonsubmit} />
//               )}
//             </div>
//           </div>
//         </div>
//       ) : (
//         <AfterTest
//           username={username}
//           score={response ? response.score : 0}
//           age={response ? response.age : 0}
//           correctWords={response ? response.correctWords : []}
//           incorrectWords={response ? response.incorrectWords : []}
//         />
//       )}
//       <ToastContainer />  {/* Toast container to display notifications */}
//     </>
//   );
// }

// export default Test;






import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WordGrid from "./WordGrid";
import styles from "../../styles/Test.module.css";
import { backendURL } from "../../definedURL";
import { pythonURL } from "../../definedURL";
import { FaRegCirclePlay } from "react-icons/fa6";
import { FaRegStopCircle } from "react-icons/fa";
import { PiDotsThreeBold } from "react-icons/pi";
import { MdOutlineArrowCircleRight } from "react-icons/md";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  // Import Toast styles

function Test() {
  const [givingTest, setGivingTest] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionReady, setTranscriptionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        window.stream = stream;
      })
      .catch((error) => {
        console.error("Error accessing media devices.", error);
      });
  }, [navigate]);

  const startListening = () => {
    if (window.stream) {
      let localAudioChunks = [];
      const newMediaRecorder = new MediaRecorder(window.stream);

      newMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          localAudioChunks.push(event.data);
        }
      };

      newMediaRecorder.onstop = async () => {
        if (localAudioChunks.length > 0) {
          const audioBlob = new Blob(localAudioChunks, { type: "audio/wav" });
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
              console.log("Transcription Result", result);
            } else {
              console.error("Error during transcription:", response.statusText);
            }
          } catch (error) {
            console.error("Error uploading audio:", error);
          } finally {
            setIsTranscribing(false);
          }
        }
      };

      newMediaRecorder.start();
    } else {
      console.error("Media stream not initialized.");
    }
  };

  const stopListening = () => {
    if (window.stream) {
      const tracks = window.stream.getTracks();
      tracks.forEach((track) => track.stop());
    } else {
      console.error("Media stream not initialized.");
    }
  };

  const handleSubmit = async () => {
    if (!transcriptionReady) {
        console.log("Transcription is not ready yet. Please wait...");
        return;
    }

    const spokenWords = transcript.trim().toLowerCase();  // Send raw transcript to backend
    const childId = localStorage.getItem('childId');  
    const token = localStorage.getItem('access_token');

    try {
        const responseFromApi = await axios.post(
            `${backendURL}/addTest6`,  // Updated to use new API endpoint
            { childId, spokenWords },  // Only sending the spoken words, backend will process them
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (responseFromApi.status === 201) {
            const { score, incorrectWords } = responseFromApi.data; 

            toast.success(`Test submitted! Score: ${score}, Incorrect words: ${incorrectWords.join(', ')}`, {
                position: "top-center",
                onClose: () => navigate('/'),  
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
    <>
      {givingTest && (
        <div className={`${styles.container} ${givingTest ? styles.giveHeight : ''}`}>
          <div className={styles.testBox}>
            <WordGrid />
            <div className={styles.buttonBox}>
              <FaRegCirclePlay onClick={startListening} className={styles.iconButton} />
              <FaRegStopCircle onClick={stopListening} className={styles.iconButton} />
              {isTranscribing ? (
                <PiDotsThreeBold className={styles.iconButton} />
              ) : (
                <MdOutlineArrowCircleRight onClick={handleSubmit} disabled={!transcriptionReady} className={styles.iconButtonsubmit} />
              )}
            </div>
          </div>
        </div>
      )}
      <ToastContainer />  {/* Toast container to display notifications */}
    </>
  );
}

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
  ["tree", "little", "milk", "egg", "book"],            // Row 1
  ["school", "sit", "frog", "playing", "bun"],          // Row 2
  ["flower", "road", "clock", "train", "light"],        // Row 3
  ["picture", "think", "summer", "people", "something"],// Row 4
  ["dream", "downstairs", "biscuit", "shepherd", "thirsty"], // Row 5
  ["crowd", "sandwich", "beginning", "postage", "island"],   // Row 6
  ["saucer", "angel", "sailing", "appeared", "knife"],       // Row 7
  ["canary", "attractive", "imagine", "nephew", "gradually"],// Row 8
  ["smoulder", "applaud", "disposal", "nourished", "diseased"], // Row 9
  ["university", "orchestra", "knowledge", "audience", "situated"], // Row 10
  ["physics", "campaign", "choir", "intercede", "fascinate"], // Row 11
  ["forfeit", "siege", "pavement", "plausible", "prophecy"],  // Row 12
  ["colonel", "soloist", "systematic", "slovenly", "classification"], // Row 13
  ["genuine", "institution", "pivot", "conscience", "heroic"], // Row 14
  ["pneumonia", "preliminary", "antique", "susceptible", "enigma"],   // Row 15
  ["oblivion", "scintillate", "satirical", "sabre", "beguile"],  // Row 16
  ["terrestrial", "belligerent", "adamant", "sepulchre", "statistics"], // Row 17
  ["miscellaneous", "procrastinate", "tyrannical", "evangelical", "grotesque"], // Row 18
  ["ineradicable", "judicature", "preferential", "homonym", "fictitious"], // Row 19
  ["rescind", "metamorphosis", "somnambulist", "bibliography", "idiosyncrasy"]  // Row 20
];




