import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundForward } from "react-icons/io";
import books from "../assets/b.jpg";
import mag from "../assets/mag.jpeg.jpg";
import speak from "../assets/s.jpg";

const TestCard = ({ test }) => {
  const navigate = useNavigate();

  const getImageForTest = (id) => {
    if (id === 1) return mag;
    if (id === 2) return speak;
    if (id === 3) return books;
    if (id === 4) return books;
    if (id === 5) return books;
    if (id === 6) return speak;
    return books;
  };

  const getnameForTest = (id) => {
    if (id === 1) return "Schonell Test";
    if (id === 2) return "Visual Discrimination";
    if (id === 3) return "Sound Discrimination Test";
    if (id === 4) return "Picture Recognition";
    if (id === 5) return "Grapheme/Phoneme Correspondence";
    if (id === 6) return "Auditory Sequence Memory Test";
    if (id === 7) return "Sequence Arrangement";
    if (id === 8) return "Symbol Sequence";
  };

  const handleTestClick = (testId) => {
    localStorage.setItem("selectedTestId", testId);
    navigate("/selectstudent");
  };

  return (
    <div
      className="p-2 w-full cursor-pointer group"
      onClick={() => handleTestClick(test.id)}
    >
      <div className="flex items-center bg-white shadow-lg rounded-xl p-4 border border-gray-200 
        hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 
        hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-in-out
        hover:border-blue-200">
        {/* Image on the Left */}
        <div className="relative overflow-hidden rounded-lg w-20 h-20">
          <img
            src={getImageForTest(test.id)}
            alt="Test Thumbnail"
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-in-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Text Content on the Right */}
        <div className="ml-4 flex-1">
          <h1 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {getnameForTest(test.id)}
          </h1>
          <div className="flex items-center text-gray-500 text-sm mt-1 group-hover:text-blue-500 transition-colors duration-300">
            <span>Take Test</span>
            <IoIosArrowRoundForward className="text-xl ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCard;
