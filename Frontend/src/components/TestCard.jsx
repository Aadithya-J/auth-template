import React from "react";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import defaulttest1 from "../assets/default-test.png";
import { IoIosArrowRoundForward } from "react-icons/io";
import defaulttest2 from "../assets/default-profile.jpg";
import books from "../assets/b.jpg";
import mag from "../assets/mag.jpeg.jpg";
import speak from "../assets/s.jpg";

const TestCard = ({ test }) => {
  const navigate = useNavigate();

  const getImageForTest = (id) => {
    if (id === 1) {
      return mag;
    }
    if (id === 2) {
      return speak;
    }
    if (id === 3) {
      return books;
    }
    if (id === 4) {
      return books;
    }
    if (id === 5) {
      return books;
    }
    if(id === 6){
      return speak;
    }
    return books;
  };

  const getnameForTest = (id) => {
    if (id === 1) {
      return "Schonell Test";
    }
    if (id === 2) {
      return "Visual Discrimination";
    }
    if (id === 3) {
      return "Sound Discrimination Test";
    }
    if (id == 4) {
      return "Picture Recognition";
    }
    if (id == 5) {
      return "Grapheme/Phoneme Correspondence";
    }
    if( id == 6){
      return "Auditory Sequence Memory Test"
    }
    if(id == 7){
      return "Sequence Arrangement";
    }

  };
  const handleTestClick = (testId) => {
    localStorage.setItem("selectedTestId", testId);
    navigate("/selectstudent");
  };

  return (
    <div
      className="p-2 w-full cursor-pointer"
      onClick={() => handleTestClick(test.id)}
    >
      <div className="flex items-center bg-white shadow-md rounded-lg p-3 border border-gray-200 hover:bg-gray-100 transition duration-300">
        {/* Image on the Left */}
        <img
          src={getImageForTest(test.id)}
          alt="Test Thumbnail"
          className="w-20 h-20 object-cover rounded-md border border-gray-300"
        />

        {/* Text Content on the Right */}
        <div className="ml-4 flex-1">
          <h1 className="text-lg font-semibold text-gray-900">
            { getnameForTest(test.id)}
          </h1>
          <div className="flex items-center text-gray-500 text-sm mt-1">
            <span>Take Test</span>
            <IoIosArrowRoundForward className="text-xl ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCard;
