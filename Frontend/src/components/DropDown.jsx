import React, { useState } from "react";
import { FaFilter } from "react-icons/fa6";

export default function DropDown({ findNum, LatestClicked, FilterClicked }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLatestClick = (e) => {
    e.preventDefault();
    LatestClicked();
    setIsOpen(false); // Close dropdown after selecting Latest
  };

  const handleFilterClick = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const handleTestNumberClick = (number) => {
    findNum(number);
    setIsOpen(false); // Close dropdown after selecting a test number
  };

  
  return (
    <div className="overflow-visible relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex w-full justify-center hover:scale-110 hover:text-black rounded-md bg-transparent  text-med font-bold  "
          onClick={handleFilterClick}
           aria-label="Open filter options"
        >
          
          {/* <ChevronDown className="-mr-1 h-5 w-5 text-gray-700" aria-hidden="true" /> */}
          <FaFilter className="-mr-1 h-5 w-5 text-gray-700" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <a
              href="#"
              className="block px-4 py-2 font-semibold text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={handleLatestClick}
            >
              Latest
            </a>
            <div className="border-t border-gray-200" />
            <a
              href="#"
              className="block px-4 py-2 font-semibold text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => handleTestNumberClick(6)}
            >
              Test Number 6
            </a>
            <a
              href="#"
              className="block px-4 py-2 font-semibold text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => handleTestNumberClick(8)}
            >
              Test Number 8
            </a>
            <a
              href="#"
              className="block px-4 py-2 font-semibold text-md text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              onClick={() => handleTestNumberClick(16)}
            >
              Test Number 16
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
