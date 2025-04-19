import React from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import books from "../assets/b.jpg";
import mag from "../assets/mag.jpeg.jpg";
import speak from "../assets/s.jpg";
import { MdArrowForward } from "react-icons/md";

const TakeTestCard = ({ test, buttonLabel, onClick }) => {
  const navigate = useNavigate();
  
  const getImageForTest = (id) => {
    if (id === 1) return mag;
    if (id === 2) return speak;
    if (id === 3 || id === 4 || id === 5) return books;
    if (id === 6) return speak;
    if (id === 7) return mag;
    if (id === 8) return books;
    return books;
  };
  
  const handleButtonClick = (e) => {
    e.stopPropagation();
    localStorage.setItem("selectedTestId", test.id);
    navigate("/selectstudent");
    if (onClick) onClick();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-300 group">
      <div className="flex flex-col md:flex-row w-full">
        {/* Image Section */}
        <div className="w-full md:w-1/4 h-48 md:h-auto overflow-hidden">
          <img
            src={getImageForTest(test.id)}
            alt={`${test.testName} thumbnail`}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        
        {/* Content Section */}
        <div className="w-full md:w-3/4 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-2 transition-colors duration-300 group-hover:text-blue-600">
              {test.testName}
            </h2>
            <p className="text-gray-600 mb-4">
              {test.About}
            </p>
          </div>
          
          <div className="flex justify-end mt-auto">
            <button
              onClick={handleButtonClick}
              className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white rounded-md border border-blue-300 hover:border-transparent transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`Take ${test.testName} test`}
            >
              <span>{buttonLabel}</span>
              <MdArrowForward className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

TakeTestCard.propTypes = {
  test: PropTypes.shape({
    id: PropTypes.number.isRequired,
    testName: PropTypes.string.isRequired,
    About: PropTypes.string
  }).isRequired,
  buttonLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func
};

export default TakeTestCard;
