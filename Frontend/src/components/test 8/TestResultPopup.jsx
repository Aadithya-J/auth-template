import React from 'react';

const TestResultPopup = ({ questions, selectedOptions, onClose }) => {
  const getErrorText = (correct, selected) => {
    if (selected === null || selected === "Not Answered") return "Incorrect";
    return correct === selected ? "No Error" : "Incorrect";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-3xl shadow-lg max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Results</h2>

        <table className="min-w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">Correct</th>
              <th className="border border-gray-300 px-4 py-2">Selected</th>
              <th className="border border-gray-300 px-4 py-2">Error</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, index) => {
              const selected = selectedOptions[index] || "Not Answered";
              const error = getErrorText(q.correct, selected);
              return (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2 text-center">{q.correct}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{selected}</td>
                  <td
                    className={`border border-gray-300 px-4 py-2 text-center font-semibold ${
                      error === "No Error" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {error}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestResultPopup;
