import React from "react";
import Button from './Button';
// import Avatar from './Avatar.jsx';

const StudentList = ({ student, buttonLabel, onButtonClick }) => {
  return (
    <div>
      <div className="relative w-full h-[70px] group bg-black rounded-md">
        {/* Removed the anchor tag to prevent unwanted navigation */}
        <article className="w-full h-[70px] rounded-md transition-transform duration-300 ease-out transform group-hover: border-2 group-hover:-translate-x-1 group-hover:-translate-y-1 border-black relative z-20">
          <div className="px-6 bg-[#fafafa] hover:bg-[#ff937a] py-5 rounded-md text-left h-full flex justify-between items-center">
            <div className="w-[25%] flex justify-start items-center rounded-md">
              
              <h1 className="text-[18px] pr-[0] font-roboto text-gray-700 font-bold group-hover:text-black pl-5">{student.name}</h1>
            </div>
            <div className="w-[25%] flex justify-center rounded-md">
              <h1 className="text-[15px] pr-[0] font-roboto text-gray-500 font-semibold group-hover:text-black">Roll No: {student.rollno}</h1>
            </div>
            <div className="w-[25%] flex justify-center rounded-md">
              <h1 className="text-[15px] pr-[0] font-roboto text-gray-500 font-semibold group-hover:text-black">Tests Taken: {student.tests_taken}</h1>
            </div>
            <div className="w-[25%] flex justify-end rounded-md">
              <Button label={buttonLabel} onClick={onButtonClick} /> {/* Attach onClick to the Button */}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default StudentList;
