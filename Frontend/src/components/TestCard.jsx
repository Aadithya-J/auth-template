import React from 'react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import defaulttest1 from '../assets/default-test.png';
import { IoIosArrowRoundForward } from 'react-icons/io';
import defaulttest2 from '../assets/default-profile.jpg';
import books from "../assets/b.jpg";
import mag from "../assets/mag.jpeg.jpg"
import speak from "../assets/s.jpg"


const TestCard = ({ test }) => {
  const navigate = useNavigate();

  const getImageForTest = (id) => {
    if (id === 1) {
      return mag;
    }
    if (id === 2) {
      return speak;
    }
    return books; // Fallback image
  };

  const getnameForTest = (id) => {
    if (id === 1) {
      return "Schonell Test";
    }
    if (id === 2) {
      return "Visual Discrimination";
    }
    return "Sound Discrimination"; // Fallback image
  };

  const handleTestClick = (testId) => {
    localStorage.setItem('selectedTestId', testId);
    navigate('/selectstudent');
  };

  return (
    <div className="p-2 pl-5" onClick={() => handleTestClick(test.id)}>
      <div className="relative w-[336px] h-[290px] group bg-black rounded-xl">
        <div className="absolute top-0 left-0 w-full h-full shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xl opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-0"></div>
        <div className="block cursor-pointer relative z-10 group">
          <article className="w-full h-[290px] transition-transform duration-300 ease-out transform group-hover:-translate-x-1 group-hover:-translate-y-1 border-2 border-black rounded-xl group-hover:bg-[#ff937a]">
            <figure className="w-full h-[75%] border-black border-b-2">
              <img
                src={getImageForTest(test.id)} // Using function to determine the image
                alt="thumbnail"
                className="w-full h-full object-cover rounded-t-xl"
              />
            </figure>
            <div className="px-6 py-5 text-left h-[25%] flex flex-col justify-center rounded-b-xl bg-[#fafafa] text-black group-hover:bg-[#ff937a]">
            <h1 className="text-[20px] mb-[0.5] font-bold font-roboto"> {getnameForTest(test.id)}</h1>

<div className="flex items-center space-x-1">
                <h2 className="text-[12px] pr-[0] font-roboto text-gray-500 group-hover:text-black">Take Test</h2>
                <div className="p-0 rounded-full mt-[0px]">
                  <IoIosArrowRoundForward className="text-[25px] mb-[1px] text-gray-500 group-hover:text-black" />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default TestCard;
