import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import { RiGraduationCapFill } from "react-icons/ri";
import { CiCirclePlus } from "react-icons/ci";
import PopupForm from "../components/PopupForm";
import img1 from "../assets/grid.jpg"; // Importing the background image
import SearchbyName from "../components/SearchbyName"; // Importing the SearchBar

export default function MyClass({ students }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // Adding state for search term

  const handleAddChildClick = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleChildClick = (studentId) => { 
    const storedId = localStorage.getItem("childId");
    if (studentId !== storedId) {
      localStorage.setItem("childId", studentId);
    }
    navigate("/testreports");
  };

  const handleSearch = (term) => {
    setSearchTerm(term); // Search term update handler
  };

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  ); // Filtering students based on the search term
  return (
    <div className="pt-4" style={{ position: "relative", height: "100vh" }}>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url(${img1})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
        }}
      />
      <div className="p-6 overflow-auto h-full" style={{ backgroundColor: "rgba(255, 255, 255, 0)" }}>
        <div className="pl-7 pr-7 ">
          <div className="flex justify-center items-center">
          <h2
            className="text-[30px] pt-0 mb-[0.5] font-extrabold font-roboto  "
            style={{ textShadow: '2px 2px 0 #ff937a' }} // Example shadow with color #ff937a
          >
            MY CLASSROOM
          </h2>
          
          {/* SearchBar Component Integration */}
          <SearchbyName onSearch={handleSearch} />
          </div>
          <hr className="flex justify-between border-t-2 border-gray-800 mt-4 ml-0 mb-7 mr-0" />
        </div>
        
        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-cols-fr gap-8 pb-4 pl-6 pr-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                buttonLabel="View Test Report"
                onButtonClick={() => handleChildClick(student.id)}
              />
            ))
          ) : (
            <p>No students available</p>
          )}
          <div
            className="flex flex-col items-center justify-top w-full border-2 border-black rounded-xl h-100 bg-white cursor-pointer"
            onClick={handleAddChildClick}
          >
            <span className="text-4xl items-top justify-center text-black">
              <CiCirclePlus style={{ fontSize: "4rem", marginTop: "100px" }} />
            </span>
            <h2 className="items-top justify-center text-center mt-2 text-black hover:scale-105">Add Student</h2>
          </div>
        </div>
        {showPopup && (
          <PopupForm
            showPopup={showPopup}
            handleClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}
