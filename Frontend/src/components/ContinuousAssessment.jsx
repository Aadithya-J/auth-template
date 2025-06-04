import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Test components imports
import SequenceArrangement from "./Sequence_arrangement/sequenceArrangement";
import SymbolSequence from "./SymbolSequence/SymbolSequence";
import Test5 from "./test 5/Test5";
import Test6 from "./test 6/Test6";
import Test7 from "./test 7/Test7";
import Test8 from "./test 8/Test8";
import Test13 from "./test 13/Test13";
import Test16 from "./test 16/Test16";
import Test14 from "./test 14/Test14";
import VocabularyScaleTest from "./VocabularyScaleTest/VocabularyScaleTest";

const TESTS = [
  {
    name: "Sequence Arrangement",
    component: SequenceArrangement,
    description: "Arrange items in correct sequence",
    instructions: "Drag and drop items to arrange them in order",
    icon: "🧩",
    color: "bg-blue-100 text-blue-800",
    gradientFrom: "from-blue-400",
    gradientTo: "to-blue-600",
  },
  {
    name: "Symbol Sequence",
    component: SymbolSequence,
    description: "Identify correct symbol sequences",
    instructions: "Click symbols in the correct order",
    icon: "🔠",
    color: "bg-blue-100 text-blue-800",
    gradientFrom: "from-blue-400",
    gradientTo: "to-blue-600",
  },
  {
    name: "Grapheme Matching",
    component: Test5,
    description: "Match letters to their sounds",
    instructions: "Select the correct sound for each letter",
    icon: "🔤",
    color: "bg-green-100 text-green-800",
    gradientFrom: "from-green-400",
    gradientTo: "to-green-600",
  },
  {
    name: "Reading Proficiency Assessment",
    component: Test6,
    description: "Assess spelling skills",
    instructions: "Spell words correctly",
    icon: "📘",
    color: "bg-yellow-100 text-yellow-800",
    gradientFrom: "from-yellow-400",
    gradientTo: "to-yellow-600",
  },
  {
    name: "Picture Recognition",
    component: Test7,
    description: "Identify objects in pictures",
    instructions: "Answer questions about pictures",
    icon: "🖼️",
    color: "bg-pink-100 text-pink-800",
    gradientFrom: "from-pink-400",
    gradientTo: "to-pink-600",
  },
  {
    name: "Visual Discrimination",
    component: Test8,
    description: "Spot differences between words",
    instructions: "Choose correctly spelled words",
    icon: "👀",
    color: "bg-indigo-100 text-indigo-800",
    gradientFrom: "from-indigo-400",
    gradientTo: "to-indigo-600",
  },
  {
    name: "Auditory Memory",
    component: Test13,
    description: "Remember sound sequences",
    instructions: "Repeat sequences correctly",
    icon: "👂",
    color: "bg-red-100 text-red-800",
    gradientFrom: "from-red-400",
    gradientTo: "to-red-600",
  },
  {
    name: "Sound Discrimination",
    component: Test16,
    description: "Distinguish different sounds",
    instructions: "Identify different sounds",
    icon: "🔊",
    color: "bg-teal-100 text-teal-800",
    gradientFrom: "from-teal-400",
    gradientTo: "to-teal-600",
  },
  {
    name: "Sound Blending",
    component: Test14,
    description: "Blend sounds to form words",
    instructions: "Combine sounds to create words",
    icon: "🔤",
    color: "bg-orange-100 text-orange-800",
    gradientFrom: "from-orange-400",
    gradientTo: "to-orange-600",
  },
  {
    name: "Vocabulary Scale Test",
    component: VocabularyScaleTest,
    description: "Assess vocabulary knowledge",
    instructions: "Choose the correct meaning of words",
    icon: "📚",
    color: "bg-gray-100 text-gray-800",
    gradientFrom: "from-gray-400",
    gradientTo: "to-gray-600",
  },
];

// Smooth countdown animation component
const CountdownTimer = ({ countdown }) => {
  const variants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: [1.2, 1],
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
    exit: { scale: 0.5, opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      key={countdown}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600"
    >
      {countdown}
    </motion.div>
  );
};

// Modern spinner component
const Spinner = () => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="w-16 h-16 rounded-full border-4 border-gray-200"></div>
      <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-t-4 border-l-4 border-blue-500 animate-spin"></div>
    </div>
    <span className="text-blue-600 font-medium">Preparing Test...</span>
  </div>
);

export default function ContinuousAssessment() {
  const [student, setStudent] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [results, setResults] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [loadingTest, setLoadingTest] = useState(false);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(900);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem("selectedStudent");
      if (s) setStudent(JSON.parse(s));
    } catch (error) {
      console.error("Failed to parse student data:", error);
    } finally {
      setLoadingStudent(false);
    }
  }, []);
  const handleTestComplete = useCallback(
    (score) => {
      setResults((prev) => [
        ...prev,
        {
          name: TESTS[currentTest].name,
          score,
          icon: TESTS[currentTest].icon,
          color: TESTS[currentTest].color,
          gradientFrom: TESTS[currentTest].gradientFrom,
          gradientTo: TESTS[currentTest].gradientTo,
        },
      ]);

      if (currentTest < TESTS.length - 1) {
        setCurrentTest(currentTest + 1);
      } else {
        setCurrentTest(TESTS.length);
        setShowFinalMessage(true);
      }
    },
    [currentTest]
  );

  const handleSkipTest = () => handleTestComplete(0);

  useEffect(() => {
    if (started && currentTest < TESTS.length) {
      setShowInstructions(true);
      setShowCountdown(false);
      setLoadingTest(false);
      setTimeRemaining(900);
    }
  }, [started, currentTest]);

  useEffect(() => {
    let timer;
    if (showCountdown && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (showCountdown && countdown === 0) {
      setShowCountdown(false);
      setCountdown(3);
      setLoadingTest(true);
      setTimeout(() => setLoadingTest(false), 800);
    }
    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  // Timer effect for test duration
  useEffect(() => {
    let timer;
    if (
      currentTest < TESTS.length &&
      !showInstructions &&
      !showCountdown &&
      !loadingTest &&
      timeRemaining > 0
    ) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    }

    if (timeRemaining === 0) {
      handleTestComplete(0); // Auto-complete with zero score if time runs out
    }

    return () => clearInterval(timer);
  }, [
    currentTest,
    showInstructions,
    showCountdown,
    loadingTest,
    timeRemaining,
    handleTestComplete,
  ]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmitResults = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const totalScore = results.reduce(
        (sum, result) => sum + (Number(result.score) || 0),
        0
      );

      const payload = {
        child_id: student.id, // Assuming student object has an id field
        results: results.map((result) => ({
          name: result.name,
          score: result.score,
        })),
        total_score: totalScore,
        total_tests: results.length,
      };

      const response = await fetch(
        "http://localhost:3000/api/continuous-assessment/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Show success message or redirect
        alert("Results submitted successfully!");
        // Optionally redirect to dashboard
        // window.location.href = '/dashboard';
      } else {
        throw new Error(data.message || "Failed to submit results");
      }
    } catch (error) {
      console.error("Error submitting results:", error);
      alert("Failed to submit results. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Spinner />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-6"
          >
            ⚠️
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Student Selected
          </h2>
          <p className="text-gray-600 mb-8">
            Please select a student before starting the assessment
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
              Continuous Assessment
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto"></div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex items-center justify-center space-x-4 mb-10"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-600 flex items-center justify-center text-2xl text-white shadow-md">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-gray-500 text-sm">Student</p>
              <p className="text-xl font-semibold text-gray-800">
                {student.name}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="p-5 bg-gray-50 rounded-xl mb-8"
          >
            <h3 className="text-gray-700 font-medium mb-4">
              Assessment sections:
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {TESTS.map((test, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className={`p-3 rounded-lg ${test.color} flex items-center shadow-sm`}
                >
                  <span className="text-xl mr-2">{test.icon}</span>
                  <span className="text-sm font-medium">{test.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStarted(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg font-semibold text-lg"
            >
              Begin Assessment
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (showInstructions && currentTest < TESTS.length) {
    const test = TESTS[currentTest];
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className={`w-20 h-20 bg-gradient-to-br ${test.gradientFrom} ${test.gradientTo} rounded-2xl flex items-center justify-center text-3xl text-white shadow-md mb-6 mx-auto`}
          >
            {test.icon}
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {test.name}
            </h2>
            <p className="text-gray-600 text-center mb-6">{test.description}</p>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200"
          >
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <span className="bg-blue-100 text-blue-800 w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                i
              </span>
              Instructions
            </h3>
            <p className="text-gray-700">{test.instructions}</p>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowInstructions(false);
                setShowCountdown(true);
              }}
              className={`px-8 py-3 bg-gradient-to-r ${test.gradientFrom} ${test.gradientTo} text-white rounded-xl shadow-md font-semibold flex items-center`}
            >
              Start Test
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (showCountdown && currentTest < TESTS.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <AnimatePresence mode="wait">
            <CountdownTimer countdown={countdown} />
          </AnimatePresence>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-gray-600 text-lg font-medium"
        >
          Get ready!
        </motion.p>
      </div>
    );
  }

  if (loadingTest && currentTest < TESTS.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <Spinner />
      </div>
    );
  }

  if (currentTest < TESTS.length) {
    const TestComponent = TESTS[currentTest].component;

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white relative">
        <TestComponent
          suppressResultPage={true}
          onComplete={handleTestComplete}
          student={student}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="fixed bottom-4 right-4 z-[60] flex items-center space-x-4 p-3 bg-white/80 backdrop-blur-sm rounded-lg shadow-md"
        >
          <div className="text-sm font-medium flex items-center bg-gray-100 px-3 py-1 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              className={timeRemaining < 60 ? "text-red-600" : "text-gray-700"}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSkipTest}
            className="px-4 py-2 text-sm bg-red-500 text-white hover:bg-red-600 rounded-md transition flex items-center shadow z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
            Skip
          </motion.button>
        </motion.div>
      </div>
    );
  }

  if (showFinalMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-5xl mb-6 mx-auto shadow-lg"
          >
            🎉
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              Assessment Complete!
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Well done! You&apos;ve completed all tests for{" "}
              <span className="font-semibold">{student.name}</span>
            </p>
          </motion.div>

          {/* Results Summary */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Test Results:
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {results.map((result, index) => (
                <div key={index} className={`p-4 rounded-xl ${result.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{result.icon}</span>
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <span className="text-lg font-bold">{result.score}/10</span>
                  </div>
                  <div className="mt-2 bg-white bg-opacity-50 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${result.gradientFrom} ${result.gradientTo}`}
                      style={{ width: `${result.score * 10}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Score */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-2xl px-8 py-4">
              <div className="text-lg font-medium">Total Score</div>
              <div className="text-3xl font-bold">
                {results.reduce(
                  (sum, result) => sum + (Number(result.score) || 0),
                  0
                )}
                /{results.length * 10}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitResults}
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-800 hover:shadow-xl"
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit Results"
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
            >
              Back to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results page
  return (
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg"
        >
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Assessment Results
                </h2>
                <p className="text-gray-600">
                  Student: <span className="font-semibold">{student.name}</span>
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg flex items-center">
                <div className="text-4xl mr-3">📊</div>
                <div>
                  <div className="text-sm text-gray-500">Total Score</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {results.reduce(
                      (sum, result) => sum + (Number(result.score) || 0),
                      0
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-5 hover:bg-gray-50 transition"
              >
                <div className="flex items-center">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${result.gradientFrom} ${result.gradientTo} flex items-center justify-center text-2xl text-white shadow-sm mr-4`}
                  >
                    {result.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-gray-800">{result.name}</h3>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score * 10}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                        className={`h-1.5 rounded-full bg-gradient-to-r ${result.gradientFrom} ${result.gradientTo}`}
                      />
                    </div>
                  </div>
                  <div className="ml-4">
                    <div
                      className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${result.gradientFrom} ${result.gradientTo}`}
                    >
                      {result.score}/10
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-sm text-gray-500 mb-1">
                Overall Performance
              </span>
              <div className="flex items-center">
                <div className="flex mr-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const totalScore = results.reduce(
                      (sum, result) => sum + (Number(result.score) || 0),
                      0
                    );
                    const avgScore = (totalScore / (results.length * 10)) * 5;
                    return (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 ${
                          i < Math.round(avgScore)
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                </div>
                <span className="text-gray-700 font-medium">
                  {(() => {
                    const totalScore = results.reduce(
                      (sum, result) => sum + (Number(result.score) || 0),
                      0
                    );
                    const percentage =
                      (totalScore / (results.length * 10)) * 100;

                    if (percentage >= 80) return "Excellent";
                    if (percentage >= 65) return "Good";
                    if (percentage >= 50) return "Satisfactory";
                    return "Needs Improvement";
                  })()}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Export Results
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setStarted(false);
                  setCurrentTest(0);
                  setResults([]);
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition font-medium flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                New Assessment
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="border-t"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results
                  .filter((r) => r.score < 6)
                  .map((result, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <div className="flex items-center mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-br ${result.gradientFrom} ${result.gradientTo} flex items-center justify-center text-lg text-white mr-2`}
                        >
                          {result.icon}
                        </div>
                        <h4 className="font-medium text-gray-800">
                          {result.name}
                        </h4>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {result.score < 4
                          ? `Needs significant practice with ${result.name.toLowerCase()} skills. Consider dedicated exercises.`
                          : `Could use some improvement in ${result.name.toLowerCase()} skills. Regular practice recommended.`}
                      </p>
                    </motion.div>
                  ))}

                {results.filter((r) => r.score < 6).length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 }}
                    className="bg-green-50 rounded-lg p-4 border border-green-200 col-span-1 md:col-span-2"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-lg text-green-600 mr-3">
                        ✓
                      </div>
                      <div>
                        <h4 className="font-medium text-green-800">
                          Great performance!
                        </h4>
                        <p className="text-green-700 text-sm">
                          All skills show good proficiency. Continue with
                          advanced exercises to maintain progress.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
