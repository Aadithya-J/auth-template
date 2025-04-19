import React from "react";

const StudentCard = ({ student = {}, buttonLabel = "Click Me", onButtonClick = () => {} }) => {
  return (
    <div className="h-80 bg-white rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:border-blue-400 group overflow-hidden">
      <article className="h-full flex flex-col p-4">
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 mb-3 rounded-full overflow-hidden border-2 border-blue-300 transition-all duration-300 group-hover:border-blue-500 transform group-hover:scale-105">
            <img
              src={student.imageUrl || "/defaultphp.jpg"}
              alt={`${student.name || "Student"}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          </div>
          <h3 className="text-xl font-semibold text-blue-800 transition-colors duration-300 group-hover:text-blue-600">
            {student.name || "Unknown Student"}
          </h3>
        </div>
        
        <div className="flex justify-between items-center w-full px-4 mb-5">
          <div className="flex flex-col items-center justify-center space-y-1 w-1/2 transition-transform duration-300 ease-out group-hover:transform group-hover:-translate-y-1">
            <p className="text-sm text-gray-500">Roll No</p>
            <p className="text-base font-semibold text-blue-600">
              {student.rollno || "N/A"}
            </p>
          </div>
          <div className="h-12 border-r border-blue-200 transition-all duration-300 group-hover:border-blue-400 group-hover:h-14"></div>
          <div className="flex flex-col items-center justify-center space-y-1 w-1/2 transition-transform duration-300 ease-out group-hover:transform group-hover:-translate-y-1">
            <p className="text-sm text-gray-500">Tests Taken</p>
            <p className="text-base font-semibold text-blue-600">
              {student.tests_taken || "0"}
            </p>
          </div>
        </div>
        
        <div className="mt-auto">
          <button
            onClick={onButtonClick}
            className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white rounded-md border border-blue-300 hover:border-transparent transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={`View test report for ${student.name || "student"}`}
          >
            {buttonLabel}
          </button>
        </div>
      </article>
    </div>
  );
};

export default StudentCard;
