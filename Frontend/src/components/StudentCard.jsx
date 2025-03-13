import React from "react";
import Button from "./Button";

const StudentCard = ({ student = {}, buttonLabel = "Click Me", onButtonClick = () => {} }) => {
  return (
    <div className="relative w-100 h-80 group bg-black rounded-xl">
      <div className="absolute top-0 left-0 w-full h-full shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xl opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-0"></div>
      <article className="w-55 h-80 p-2 bg-white transition-transform duration-300 ease-out transform group-hover:bg-[#ff937a] group-hover:-translate-x-1 group-hover:-translate-y-1 border-2 border-black rounded-xl">
        <div className="flex flex-col items-center pb-2">
          <img
            src={student.imageUrl || "/defaultphp.jpg"}
            alt={`Profile picture of ${student.name}`}
            className="w-24 h-24 mb-4 mt-7 rounded-full object-cover border-2 border-black"
          />
          <h3 className="text-[20px] mb-[0.5] font-bold font-roboto">
            {student.name || "Unknown Student"}
          </h3>
        </div>
        <div className="flex justify-between items-center w-full px-4">
          <div className="flex flex-col items-center justify-center text-sm text-gray-700 space-y-1 w-1/2">
            <p className="text-sm font-roboto group-hover:text-black text-gray-500">Roll No</p>
            <p className="text-sm font-semibold font-roboto group-hover:text-black text-gray-500">
              {student.rollno}
            </p>
          </div>
          <div className="h-8 border border-gray-400"></div>
          <div className="flex flex-col items-center justify-center text-sm text-gray-700 space-y-1 w-1/2">
            <p className="text-sm font-roboto group-hover:text-black text-gray-500">Test Taken</p>
            <p className="text-sm font-semibold font-roboto group-hover:text-black text-gray-500">
              {student.tests_taken}
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <Button label={buttonLabel} onClick={onButtonClick} /> {/* Reintegrated the Button with onClick */}
        </div>
      </article>
    </div>
  );
};

export default StudentCard;
