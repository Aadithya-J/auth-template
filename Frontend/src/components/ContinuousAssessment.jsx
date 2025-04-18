import { useState, useEffect } from 'react';
import SequenceArrangement from './Sequence_arrangement/sequenceArrangement';
import SymbolSequence from './SymbolSequence/SymbolSequence';
import Test5 from './test 5/Test5';
import Test6 from './test 6/Test6';
import Test7 from './test 7/Test7';
import Test8 from './test 8/Test8';
import Test13 from './test 13/Test13';
import Test16 from './test 16/Test16';

const TESTS = [
  { name: 'Test 9: Sequence Arrangement', component: SequenceArrangement },
  { name: 'Test 10: Symbol Sequence', component: SymbolSequence },
  { name: 'Test 5: Letter Challenge', component: Test5 },
  { name: 'Test 6: Word Repetition', component: Test6 },
  { name: 'Test 7: Picture Recognition', component: Test7 },
  { name: 'Test 8: Audio Quiz', component: Test8 },
  { name: 'Test 13: Number Memory', component: Test13 },
  { name: 'Test 16: Sound Discrimination', component: Test16 },
];

// --- Constants for Styling and Config ---
const MAX_CARD_WIDTH = 'max-w-9xl';
const CARD_PADDING = 'p-6 md:p-10';
const MIN_VIEW_HEIGHT = 'min-h-[85vh]';


export default function ContinuousAssessment() {
  const [student, setStudent] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentTest, setCurrentTest] = useState(0);
  const [results, setResults] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(true);

  useEffect(() => {
    try {
      const s = localStorage.getItem('selectedStudent');
      if (s) {
        setStudent(JSON.parse(s));
      }
    } catch (error) {
      console.error("Failed to parse student data from localStorage:", error);
    } finally {
      setLoadingStudent(false);
    }
  }, []);

  const handleTestComplete = (score) => {
    setResults((prev) => [
      ...prev,
      { name: TESTS[currentTest].name, score },
    ]);
    if (currentTest < TESTS.length - 1) {
      setCurrentTest(currentTest + 1);
    } else {
      setCurrentTest(TESTS.length);
    }
  };

  const handleSkipTest = () => {
    handleTestComplete(0);
  };

  if (loadingStudent) {
    return (
      <div className={`flex items-center justify-center ${MIN_VIEW_HEIGHT}`}>
        <p className="text-gray-500 text-lg">Loading student data...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className={`flex items-center justify-center ${MIN_VIEW_HEIGHT}`}>
        <div className={`bg-white shadow-lg rounded-lg ${CARD_PADDING} text-center ${MAX_CARD_WIDTH} w-full mx-4`}>
          <h2 className="text-2xl font-bold text-red-600 mb-3">No Student Selected</h2>
          <p className="text-gray-700 text-lg">Please go back and select a student before starting the assessment.</p>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className={`flex items-center justify-center ${MIN_VIEW_HEIGHT} bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8`}>
        <div className={`bg-white shadow-xl rounded-xl ${CARD_PADDING} ${MAX_CARD_WIDTH} w-full text-center animate-fadeIn`}>
          <h2 className="text-3xl font-bold text-blue-700 mb-4">Continuous Assessment</h2>
          <p className="text-xl text-gray-700 mb-8">
            Student: <span className="font-semibold text-indigo-600">{student.name || JSON.stringify(student)}</span>
          </p>
          <button
            className="px-10 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 text-lg font-semibold"
            onClick={() => setStarted(true)}
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }


  // --- Render Test Screen ---
  if (currentTest < TESTS.length) {
    const TestComponent = TESTS[currentTest].component;
    return (
      <div className={`flex flex-col items-center justify-start ${MIN_VIEW_HEIGHT} bg-gradient-to-b from-blue-50 to-white px-4 py-8`}>        
        <div className={`w-full ${MAX_CARD_WIDTH} mb-6 px-2 sm:px-0`}>
         <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-blue-700">Progress</span>
            <span className="text-sm font-medium text-blue-700">{currentTest + 1} / {TESTS.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentTest + 1) / TESTS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className={`bg-white shadow-xl rounded-xl ${CARD_PADDING} w-full ${MAX_CARD_WIDTH} animate-fadeIn max-h-[80vh] overflow-y-auto`}> 
          {/* <h3 className="text-2xl font-semibold text-center text-blue-800 mb-3">{TESTS[currentTest].name}</h3> */}

          <div className="flex flex-wrap justify-center gap-2 mb-6 border-b pb-4">
            {TESTS.map((test, idx) => (
              <span
                key={test.name}
                className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ${
                  idx === currentTest
                    ? 'bg-blue-600 text-white shadow-md'
                    : idx < currentTest
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {test.name}
              </span>
            ))}
          </div>

          <div className={`mt-2 mx-auto transition-transform duration-300 ease-in-out origin-top`}>
            <TestComponent
              suppressResultPage={true}
              onComplete={handleTestComplete}
              student={student}
            />
          </div>

           {/* --- Skip Button --- */}
          <div className="text-center border-t"> 
            <button
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition font-semibold shadow"
              onClick={handleSkipTest}
            >
              Skip This Test
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --- Render Summary Screen
  return (
    <div className={`flex items-center justify-center ${MIN_VIEW_HEIGHT} bg-gradient-to-b from-green-50 to-white px-4 py-8`}>
      <div className={`bg-white shadow-xl rounded-xl ${CARD_PADDING} w-full ${MAX_CARD_WIDTH} text-center animate-fadeIn`}>
        <h2 className="text-3xl font-bold text-green-700 mb-6">Assessment Summary</h2>
        <p className="text-lg text-gray-700 mb-6">
            Student: <span className="font-semibold text-indigo-600">{student.name || JSON.stringify(student)}</span>
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Test Name</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {results.map((res, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}`}>                  
                  <td className="py-3 px-6 text-gray-800 font-medium whitespace-nowrap">{res.name}</td>
                  <td className="py-3 px-6 text-blue-700 font-bold whitespace-nowrap">{res.score}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                  <td className="py-3 px-6 text-gray-700">Total Score</td>
                  <td className="py-3 px-6 text-indigo-700">{results.reduce((acc, cur) => acc + (Number(cur.score) || 0), 0)}</td>
              </tr>
            </tbody>
          </table>
        </div>
         <div className="mt-8">
             <button
                className="px-8 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-300 text-lg font-semibold"
                onClick={() => { setStarted(false); setCurrentTest(0); setResults([]); }}
              >
                Finish / Start New
              </button>
         </div>
      </div>
    </div>
  );
}
