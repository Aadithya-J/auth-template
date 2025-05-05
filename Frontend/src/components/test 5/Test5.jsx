import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { backendURL } from "../../definedURL";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import PropTypes from "prop-types";
import { Loader2, Mic, MicOff, Check } from "lucide-react";

const Button = ({ onClick, disabled, children, className = "", variant = "primary", isLoading = false }) => {
    const baseStyle = "py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm text-sm";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed",
        secondary: "bg-blue-100 text-blue-700 hover:bg-blue-200 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed",
        danger: "bg-red-600 text-white hover:bg-red-700 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed",
    };
    return (
        <motion.button
            whileHover={{ scale: disabled || isLoading ? 1 : 1.03 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.97 }}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
        </motion.button>
    );
};
Button.propTypes = { onClick: PropTypes.func, disabled: PropTypes.bool, children: PropTypes.node.isRequired, className: PropTypes.string, variant: PropTypes.oneOf(["primary", "secondary", "danger"]), isLoading: PropTypes.bool };


const GraphemeTest = ({ suppressResultPage = false, onComplete }) => {
  const LETTER_TIMER_DURATION = 8;

  const [letters] = useState([
    "w", "a", "j", "c", "e", "i", "x", "o", "z", "l", "s", "h", "v", "k", "u", "t", "r", "f", "n", "p", "m", "d", "y", "b", "g", "q",
    "A", "L", "G", "Z", "U", "B", "H", "I", "O", "S", "N", "D", "K", "T", "R", "V", "M", "Q", "F", "X", "P", "Y", "J", "E", "C", "W",
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LETTER_TIMER_DURATION);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [isProcessingSubmit, setIsProcessingSubmit] = useState(false);
  const [userInputs, setUserInputs] = useState(Array(letters.length).fill(""));
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false); 
  const [inputStatus, setInputStatus] = useState({}); 

  const { width, height } = useWindowSize();
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const inputRef = useRef(null);
  const streamRef = useRef(null);
  const isRecordingRef = useRef(isRecording);

  const childId = localStorage.getItem("childId");
  const token = localStorage.getItem("access_token");

  
  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);

  
  const stopListening = useCallback((indexToUpdate) => {
    const wasRecording = isRecordingRef.current; 
    

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        
        mediaRecorderRef.current.stop(); 
      } catch (e) { console.error("Error stopping MediaRecorder:", e); }
    } else {
      
      audioChunksRef.current = [];
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      
    }
    mediaRecorderRef.current = null;

    
    if (wasRecording) {
      
      setIsRecording(false);
       
       
       
    }
    
    
  }, []); 

  
  const uploadAudio = useCallback(async (audioBlob, indexToUpdate) => {
      
    if (!audioBlob || audioBlob.size === 0) {
      console.log("No audio data to upload for index:", indexToUpdate);
       
        setInputStatus(prev => ({ ...prev, [indexToUpdate]: prev[indexToUpdate] === 'done_typed' ? 'done_typed' : 'error' }));
        setIsTranscribing(false); 
        return;
    }
    const formData = new FormData();
    const filename = `grapheme_test_child_${childId}_index_${indexToUpdate}_${Date.now()}.wav`;
    const file = new File([audioBlob], filename, { type: "audio/wav" });
    formData.append("file", file);

    
    
    setInputStatus(prev => ({ ...prev, [indexToUpdate]: prev[indexToUpdate] === 'recording' ? 'pending' : prev[indexToUpdate] }));
    setIsTranscribing(true); 

    try {
      const response = await fetch(`${backendURL}/transcribe`, { method: "POST", body: formData });
      const result = await response.json();
      

      if (response.ok && result.transcription != null) {
        const transcribedText = result.transcription.trim().toLowerCase();
        
         const currentStatusBeforeUpdate = inputStatus[indexToUpdate];

        if (transcribedText) {
          setUserInputs(prevInputs => {
            const newInputs = [...prevInputs];
             
             if (currentStatusBeforeUpdate !== 'done_typed') {
                newInputs[indexToUpdate] = transcribedText;
                 
                setInputStatus(prev => ({ ...prev, [indexToUpdate]: 'done_voice' })); 
             } else {
                 console.log(`Skipping transcription update for index ${indexToUpdate}, user typed.`);
                 
             }
            return newInputs;
          });
        } else {
           console.error(`Transcription successful but empty for index ${indexToUpdate}`);
           toast.error(`Heard nothing clearly for "${letters[indexToUpdate]}". Try typing.`);
            
            if (currentStatusBeforeUpdate !== 'done_typed') {
                 setInputStatus(prev => ({ ...prev, [indexToUpdate]: 'error' }));
            }
        }
      } else {
         console.error(`Transcription failed API side for index ${indexToUpdate}:`, result);
         toast.error(`Transcription failed for letter "${letters[indexToUpdate]}". Try typing.`);
         
          if (inputStatus[indexToUpdate] !== 'done_typed') {
               setInputStatus(prev => ({ ...prev, [indexToUpdate]: 'error' }));
          }
      }
    } catch (error) {
      console.error(`Network/Fetch error during transcription for index ${indexToUpdate}:`, error);
      toast.error(`Error processing audio for letter "${letters[indexToUpdate]}". Try typing.`);
      
        if (inputStatus[indexToUpdate] !== 'done_typed') {
             setInputStatus(prev => ({ ...prev, [indexToUpdate]: 'error' }));
        }
    } finally {
       setIsTranscribing(false); 
        
       if (currentIndex === indexToUpdate && !(inputStatus[currentIndex] === 'done_voice' || isRecording)) {
           inputRef.current?.focus();
       }
    }
    
  }, [childId, letters, currentIndex, inputStatus, stopListening]); 


  
  const startListening = useCallback(() => {
      
    if (isRecordingRef.current || currentIndex >= letters.length) return;

    
    const currentStatus = inputStatus[currentIndex] || 'idle';
    if (currentStatus === 'done_voice' || currentStatus === 'pending') {
        toast.info("Already processing voice input for this letter.");
        return;
    }
    
    setUserInputs(prev => { const newInputs = [...prev]; newInputs[currentIndex] = ""; return newInputs; });
    setInputStatus(prev => ({ ...prev, [currentIndex]: 'recording' }));
    setIsRecording(true); 

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        streamRef.current = stream;
        audioChunksRef.current = [];
        if (stream.getAudioTracks().length > 0) stream.getAudioTracks()[0].onended = () => { console.warn("Audio track ended unexpectedly!"); stopListening(currentIndex); };

        try {
            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            recorder.ondataavailable = e => { if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data); };
            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
                
                uploadAudio(audioBlob, currentIndex);
                audioChunksRef.current = [];
                
            };
            recorder.onerror = e => { console.error("MediaRecorder error:", e.error); toast.error("Recording error."); setInputStatus(prev => ({ ...prev, [currentIndex]: 'error' })); stopListening(currentIndex); };
            recorder.start();
             
        } catch (error) {
            console.error("MediaRecorder creation/start error:", error); toast.error("Could not start recording."); setInputStatus(prev => ({ ...prev, [currentIndex]: 'error' })); stopListening(currentIndex); setIsRecording(false);
        }
      })
      .catch(error => {
        console.error("getUserMedia error:", error); toast.error("Microphone access denied or unavailable."); setInputStatus(prev => ({ ...prev, [currentIndex]: 'error' })); setIsRecording(false);
      });
  }, [currentIndex, letters.length, stopListening, uploadAudio, inputStatus]); 


  

  
  const handleNext = useCallback(() => {
    if (currentIndex >= letters.length) return; 

     console.log(`handleNext called for index ${currentIndex}`);
    
    stopListening(currentIndex);

    
    

    
    if (currentIndex < letters.length - 1) {
       console.log(`Advancing to index ${currentIndex + 1}`);
      setCurrentIndex(prev => prev + 1);
    } else {
       console.log(`Last letter done, advancing to trigger submit view.`);
      
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, letters.length, stopListening]);


  
  useEffect(() => {
    
    if (timeLeft <= 0 || showResults || showSubmit || currentIndex >= letters.length || isProcessingSubmit) {
        
        if (timeLeft <= 0 && !showResults && !showSubmit && currentIndex < letters.length && !isProcessingSubmit) {
             const currentStatus = inputStatus[currentIndex] || 'idle';
             

            if (isRecordingRef.current) {
                 
                stopListening(currentIndex);
                
            } else if (currentStatus === 'idle' || currentStatus === 'error' || currentStatus === 'recording') { 
                 
                
                 setUserInputs(prev => { const ni = [...prev]; if (!ni[currentIndex]) ni[currentIndex] = ""; return ni; });
                 setInputStatus(prev => ({ ...prev, [currentIndex]: 'error' })); 
                 handleNext(); 
            } else {
                
                
                 
            }
        }
        return; 
    }

    
    const timer = setTimeout(() => { setTimeLeft(prev => prev - 1); }, 1000);
    return () => clearTimeout(timer); 

  }, [timeLeft, showResults, showSubmit, currentIndex, letters.length, inputStatus, isProcessingSubmit, stopListening, handleNext]); 


  
  useEffect(() => {
    if (currentIndex < letters.length && !showSubmit && !showResults) {
      
      setTimeLeft(LETTER_TIMER_DURATION); 
      
       if (isRecordingRef.current) {
           stopListening(currentIndex); 
       }
      setIsRecording(false); 
      
      
      inputRef.current?.focus(); 
    } else if (currentIndex === letters.length && !showSubmit && !showResults && !isProcessingSubmit) {
      
        
       stopListening(-1); 
       setShowSubmit(true);
    }
    
  }, [currentIndex]); 


  
  useEffect(() => { return () => { console.log("GraphemeTest unmounting."); stopListening(-1); }; }, []);


  

  const handleInputChange = (e) => {
    const value = e.target.value;
    const currentStatus = inputStatus[currentIndex] || 'idle';

     
    if (currentStatus === 'pending' || currentStatus === 'done_voice' || currentStatus === 'recording') {
         if (currentStatus === 'recording') toast.error("Stop recording before typing.");
         else toast.error("Clear voice input to type instead.");
         return;
     }

    
    const newInputs = [...userInputs];
    newInputs[currentIndex] = value;
    setUserInputs(newInputs);
    setInputStatus(prev => ({ ...prev, [currentIndex]: value ? 'done_typed' : 'idle' }));
  };

   
   const handleRecordButtonClick = () => {
       if (isRecordingRef.current) {
            
           stopListening(currentIndex); 
       } else {
           const currentStatus = inputStatus[currentIndex] || 'idle';
           
            if (currentStatus === 'done_typed' || currentStatus === 'done_voice' || currentStatus === 'pending') {
                toast.info("Input already provided or pending for this letter. Clear or wait.");
                return;
            }
            
           startListening();
       }
   };

  
    const handleSubmit = async () => {
        setIsProcessingSubmit(true);
        setShowSubmit(false);
        toast.loading("Processing your responses...");
        stopListening(-1);
        await new Promise(resolve => setTimeout(resolve, 500));

        const finalUserInputs = [...userInputs];
        while (finalUserInputs.length < letters.length) finalUserInputs.push("");
        console.log("Submitting final inputs:", finalUserInputs.slice(0, letters.length));

        try {
            const evalResponse = await axios.post(
                `${backendURL}/evaluate-grapheme-test`,
                { childId, letters, transcriptions: finalUserInputs.slice(0, letters.length) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.dismiss();
            setScore(evalResponse.data.score);
            setIsProcessingSubmit(false);

            if (suppressResultPage && typeof onComplete === "function") {
                onComplete(evalResponse.data.score);
            } else {
                setShowResults(true);
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to process results. Please try again.");
            console.error("Submission Error:", error);
            setIsProcessingSubmit(false);
            setShowSubmit(true);
        }
    };

  
   const restartTest = () => {
        stopListening(-1);
        setCurrentIndex(0);
        setUserInputs(Array(letters.length).fill(""));
        setShowResults(false);
        setShowSubmit(false);
        setScore(0);
        setIsProcessingSubmit(false);
        setInputStatus({});
        setTimeLeft(LETTER_TIMER_DURATION);
        setIsRecording(false); 
    };

  
   const renderCurrentInputStatus = () => {
    const status = inputStatus[currentIndex] || 'idle';
    switch(status) {
        case 'recording': return <div className="flex items-center justify-center gap-2 text-red-600 h-6 mb-4"><Mic className="h-4 w-4 animate-pulse" /> Recording...</div>;
        case 'pending': return <div className="flex items-center justify-center gap-2 text-blue-600 h-6 mb-4"><Loader2 size={16} className="animate-spin" /> Transcribing...</div>;
        case 'done_voice': return <div className="flex items-center justify-center gap-2 text-green-600 h-6 mb-4"><Check size={16} /> Heard: <span className="bg-green-100 px-2 py-0.5 rounded font-medium">{userInputs[currentIndex]}</span></div>;
        case 'done_typed': return <div className="flex items-center justify-center gap-2 text-green-600 h-6 mb-4"><Check size={16} /> Typed: <span className="bg-green-100 px-2 py-0.5 rounded font-medium">{userInputs[currentIndex]}</span></div>;
        case 'error': return <div className="text-red-500 text-sm h-6 mb-4 text-center">Processing failed. Try again or type.</div>;
        case 'idle': default: return <div className="text-gray-500 text-sm h-6 mb-4 text-center">Ready to type or record.</div>;
    }
  };

  
  const canGoNext = (inputStatus[currentIndex] === 'done_voice' || inputStatus[currentIndex] === 'done_typed');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
       {showResults && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} colors={["#2563EB", "#60A5FA", "#93C5FD", "#FFFFFF"]}/>}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
         {/* Header & Progress Bar (remain the same) */}
          <div className="text-center mb-8">
            <motion.h1 initial={{ y: -10 }} animate={{ y: 0 }} className="text-4xl font-bold text-blue-600 mb-2">Letter Challenge</motion.h1>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}><p className="text-lg text-blue-600/80">Type or say the letter you see!</p></motion.div>
          </div>
          <div className="mb-8">
            <div className="flex justify-between mb-2"><span className="text-md font-medium text-blue-700">Progress: {Math.min(currentIndex, letters.length)}/{letters.length}</span><span className="text-md font-medium text-blue-700">{Math.round((Math.min(currentIndex, letters.length) / letters.length) * 100)}%</span></div>
            <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(Math.min(currentIndex, letters.length) / letters.length) * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }} className="bg-blue-600 h-3 rounded-full"></motion.div></div>
          </div>

         {/* Content Area */}
        <AnimatePresence mode="wait">
           {/* Loading Submit / Submit Screen / Results Screen (remain the same) */}
           {isProcessingSubmit ? (
              <motion.div key="processing-submit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-8 min-h-[400px] flex items-center justify-center"><div className="flex flex-col items-center gap-4"><Loader2 size={40} className="text-blue-600 animate-spin" /><p className="text-xl text-blue-600">Submitting results...</p></div></motion.div>
           ) : showSubmit ? (
             <motion.div key="submit" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.5 }} className="text-center py-8 min-h-[400px] flex flex-col items-center justify-center">
                <motion.h2 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="text-2xl font-bold text-blue-700 mb-4">Ready to Submit?</motion.h2>
                <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }} className="text-blue-600 mb-6">You've attempted all letters. Click below.</motion.p>
                <Button onClick={handleSubmit} variant="primary" className="px-6 py-3 text-base">Submit Responses</Button>
             </motion.div>
           ) : showResults ? (
             <motion.div key="results" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ duration: 0.5 }} className="text-center py-8 min-h-[400px] flex flex-col items-center justify-center">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-5xl mb-6">🎉</motion.div>
                <motion.h2 initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-2xl font-bold text-blue-700 mb-2">Test Complete!</motion.h2>
                <motion.p initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-blue-600 mb-6">You scored {score} out of {letters.length}!</motion.p>
                <div className="w-full bg-blue-100 rounded-full h-4 mb-6 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(score / letters.length) * 100}%` }} transition={{ duration: 1, delay: 0.5, ease: "easeOut" }} className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full"></motion.div></div>
                <Button onClick={restartTest} variant="primary" className="px-6 py-3 text-base">Try Again</Button>
             </motion.div>
           ) : currentIndex < letters.length ? (
              
             <motion.div key={`letter-${currentIndex}`} initial={{ scale: 0.8, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="flex flex-col items-center min-h-[400px]">
                {/* Letter Box and Timer */}
                 <div className="relative mb-4">
                   <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }} className="w-56 h-56 md:w-64 md:h-64 bg-blue-50 rounded-2xl flex items-center justify-center shadow-lg border-2 border-blue-200">
                     <span className="text-8xl md:text-9xl font-extrabold text-blue-700 select-none">{letters[currentIndex]}</span>
                   </motion.div>
                   <div className="absolute -top-4 -right-4 md:-top-5 md:-right-5">
                      <div className="relative w-16 h-16 md:w-20 md:h-20">
                          <svg className="w-full h-full" viewBox="0 0 36 36"><path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="#DBEAFE" strokeWidth="3" /><motion.path d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" initial={{ strokeDasharray: "100, 100" }} animate={{ strokeDasharray: `${(timeLeft / LETTER_TIMER_DURATION) * 100}, 100` }} transition={{ duration: 1, ease: "linear"}}/></svg>
                          <div className="absolute inset-0 flex items-center justify-center"><span className="text-lg md:text-xl font-bold text-blue-700">{timeLeft}s</span></div>
                      </div>
                   </div>
                 </div>

                {/* Input Status Indicator */}
                 {renderCurrentInputStatus()}

                 {/* Input Area */}
                 <div className="w-full max-w-xs mb-3 flex flex-col items-center gap-2">
                      {/* Text Input */}
                      <input
                        ref={inputRef} type="text" value={userInputs[currentIndex]} onChange={handleInputChange}
                        className="w-full px-4 py-2 text-center text-xl border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Type or Record" maxLength={10}
                        disabled={isRecording || inputStatus[currentIndex] === 'pending' || inputStatus[currentIndex] === 'done_voice' || isProcessingSubmit}
                      />
                      {/* Record Button */}
                     <Button
                          onClick={handleRecordButtonClick}
                          disabled={inputStatus[currentIndex] === 'done_typed' || inputStatus[currentIndex] === 'pending' || inputStatus[currentIndex] === 'done_voice' || isProcessingSubmit}
                          variant={isRecording ? "danger" : "secondary"}
                          className="w-full"
                     >
                         {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
                         {isRecording ? 'Stop Recording' : 'Record Letter'}
                     </Button>
                 </div>

                 {/* Next Button */}
                 <Button
                   onClick={handleNext}
                   disabled={!canGoNext || isProcessingSubmit || isRecording || isTranscribing } 
                   className="mt-4 px-8 py-3 text-base"
                   variant="primary"
                 >
                   {currentIndex === letters.length - 1 ? "Finish" : "Next Letter"}
                 </Button>
             </motion.div>
           ) : null}
         </AnimatePresence>
       </motion.div>

      {/* Footer Hint */}
      {!showResults && !showSubmit && currentIndex < letters.length && !isProcessingSubmit && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 text-center">
           <p className="text-blue-500 font-medium">{["✨", "🎯", "💡", "🎤", "👏"][currentIndex % 5]} Type or speak the letter clearly!</p>
         </motion.div>
       )}
    </motion.div>
  );
};

GraphemeTest.propTypes = {
  suppressResultPage: PropTypes.bool,
  onComplete: PropTypes.func,
};

export default GraphemeTest;