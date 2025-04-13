// import React from "react";
// import Popup from "reactjs-popup";

// export default function PopupWindowVisual({ score, student_age, testName }) {
//   // Define the correct options and error categories for each question.
//   const questionData = [
//     { word: "o", correct: "o", substitution: "c, a, d, e, p", reversal: "-", transposition: "-", addition: "-" },
//     { word: "f", correct: "f", substitution: "k, h, j, t, g", reversal: "-", transposition: "-", addition: "-" },
//     { word: "b", correct: "b", substitution: "g, h", reversal: "p, d, q", transposition: "-", addition: "-" },
//     { word: "m", correct: "m", substitution: "n, u, h, s", reversal: "w", transposition: "-", addition: "-" },
//     { word: "no", correct: "no", substitution: "oh, in, uo, ou", reversal: "-", transposition: "on", addition: "-" },
//     { word: "cat", correct: "cat", substitution: "-", reversal: "-", transposition: "act, tac, atc, cta", addition: "-" },
//     { word: "girl", correct: "girl", substitution: "irig", reversal: "-", transposition: "gril, lirg, glir", addition: "-" },
//     { word: "little", correct: "little", substitution: "like", reversal: "-", transposition: "-", addition: "kitten, litter, kettle" },
//     { word: "help", correct: "help", substitution: "-", reversal: "-", transposition: "hlep, hple, pleh, hlpe", addition: "-" },
//     { word: "fast", correct: "fast", substitution: "taps", reversal: "-", transposition: "staf, fats, saft", addition: "-" }
//   ];

//   return (
//     <Popup
//       trigger={
//         <button
//           className="flex justify-center items-center w-full h-full text-sm font-sans text-gray-800 border-gray-800 hover:text-black font-medium border border-gray-400 hover:border-black px-4 py-2 bg-transparent hover:bg-white hover:shadow-sm active:bg-blue-200 rounded-lg transition-all duration-300"
//         >
//           Result
//         </button>
//       }
//       modal
//       closeOnDocumentClick
//     >
//       {(close) => (
//         <div className="flex justify-center items-center fixed inset-0 z-50 bg-gray-800 bg-opacity-50">
//           <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl overflow-auto">
//             <h2 className="text-2xl font-semibold mb-4">Student Details</h2>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-left font-medium">Student Age</label>
//                 <div className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
//                   {student_age}
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-left font-medium">Results</label>
//                 <div className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
//                   <table className="w-full border-collapse text-sm">
//                     <thead>
//                       <tr>
//                         {/* <th className="border px-2 py-1">Word</th> */}
//                         <th className="border px-2 py-1">Correct</th>
//                         <th className="border px-2 py-1">Selected</th>
//                         <th className="border px-2 py-1">Substitution</th>
//                         <th className="border px-2 py-1">Reversal</th>
//                         <th className="border px-2 py-1">Transposition</th>
//                         <th className="border px-2 py-1">Addition</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {questionData.map((data, index) => (
//                         <tr key={index}>
//                           {/* <td className="border px-2 py-1 text-center">{data.word}</td> */}
//                           <td className="border px-2 py-1 text-center">{data.correct}</td>
//                           <td className="border px-2 py-1 text-center">
//                             {score && score[index] ? score[index] : "Not Answered"}
//                           </td>
//                           <td className="border px-2 py-1 text-center">{data.substitution}</td>
//                           <td className="border px-2 py-1 text-center">{data.reversal}</td>
//                           <td className="border px-2 py-1 text-center">{data.transposition}</td>
//                           <td className="border px-2 py-1 text-center">{data.addition}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//               <button
//                 className="flex justify-center items-center w-full text-sm font-sans text-gray-800 border-gray-800 hover:text-black font-medium border border-gray-400 hover:border-black px-4 py-2 bg-transparent hover:bg-gray-100 hover:shadow-sm active:bg-blue-200 rounded-lg transition-all duration-300"
//                 onClick={close}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </Popup>
//   );
// }


import React from "react";
import Popup from "reactjs-popup";

export default function PopupWindowVisual({ score, student_age, testName }) {
  // Define the correct options and error categories for each question.
  const questionData = [
    { word: "o", correct: "o", substitution: "c, a, d, e, p", reversal: "-", transposition: "-", addition: "-" },
    { word: "f", correct: "f", substitution: "k, h, j, t, g", reversal: "-", transposition: "-", addition: "-" },
    { word: "b", correct: "b", substitution: "g, h", reversal: "p, d, q", transposition: "-", addition: "-" },
    { word: "m", correct: "m", substitution: "n, u, h, s", reversal: "w", transposition: "-", addition: "-" },
    { word: "no", correct: "no", substitution: "oh, in, uo, ou", reversal: "-", transposition: "on", addition: "-" },
    { word: "cat", correct: "cat", substitution: "-", reversal: "-", transposition: "act, tac, atc, cta", addition: "-" },
    { word: "girl", correct: "girl", substitution: "irig", reversal: "-", transposition: "gril, lirg, glir", addition: "-" },
    { word: "little", correct: "little", substitution: "like", reversal: "-", transposition: "-", addition: "kitten, litter, kettle" },
    { word: "help", correct: "help", substitution: "-", reversal: "-", transposition: "hlep, hple, pleh, hlpe", addition: "-" },
    { word: "fast", correct: "fast", substitution: "taps", reversal: "-", transposition: "staf, fats, saft", addition: "-" }
  ];

  // Helper function to determine the error type based on the selected answer.
  const getErrorType = (selected, data) => {
    // If the answer is correct, return "No Error"
    if (selected === data.correct) return "No Error";
    
    // Utility function to check an error category.
    const checkError = (errorString, errorType) => {
      if (errorString !== "-" && errorString.split(",").map(s => s.trim()).includes(selected)) {
        return errorType;
      }
      return "";
    };

    const errorFound = 
      checkError(data.substitution, "Substitution") ||
      checkError(data.reversal, "Reversal") ||
      checkError(data.transposition, "Transposition") ||
      checkError(data.addition, "Addition");

    return errorFound || "Incorrect";
  };

  return (
    <Popup
        trigger={
        <button
        aria-label="View test result"
          className="flex justify-center items-center w-full h-full text-sm font-sans text-gray-800 border-gray-800 hover:text-black font-medium border border-gray-400 hover:border-black px-4 py-2 bg-transparent hover:bg-white hover:shadow-sm active:bg-blue-200 rounded-lg transition-all duration-300"
        >
          Result
        </button>
      }
      modal
      closeOnDocumentClick
      contentProps={{
        role: "dialog",
        "aria-labelledby": "student-dialog-title", // updated to match the heading's id
        "aria-describedby": "student-dialog-description",
        "aria-modal": "true"

      }}

    >
      {(close) => (
        <div className="flex justify-center items-center fixed inset-0 z-50 bg-gray-800 bg-opacity-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl overflow-auto"
          role="dialog"
          aria-labelledby="student-dialog-title">
            <h2 id="student-dialog-title" className="text-2xl font-semibold mb-4">Student Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-left font-medium">Student Age</label>
                <div className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  {student_age}
                </div>
              </div>
              <div>
                <label className="block text-left font-medium">Results</label>
                <div className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        <th className="border px-2 py-1">Correct</th>
                        <th className="border px-2 py-1">Selected</th>
                        <th className="border px-2 py-1">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questionData.map((data, index) => {
                        const selected = score && score[index] ? score[index] : "Not Answered";
                        const errorType = getErrorType(selected, data);
                        return (
                          <tr key={index}>
                            <td className="border px-2 py-1 text-center">{data.correct}</td>
                            <td className="border px-2 py-1 text-center">{selected}</td>
                            <td
                              className={`border px-2 py-1 text-center ${
                                errorType === "No Error" ? "text-green-700" : "text-red-800"
                              }`}
                            >
                              {errorType}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                className="flex justify-center items-center w-full text-sm font-sans text-gray-800 border-gray-800 hover:text-black font-medium border border-gray-400 hover:border-black px-4 py-2 bg-transparent hover:bg-gray-100 hover:shadow-sm active:bg-blue-200 rounded-lg transition-all duration-300"
                onClick={close}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Popup>
  );
}
