import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import { RiGraduationCapFill } from "react-icons/ri";
import { CiCirclePlus } from "react-icons/ci";
import img1 from "../assets/grid.jpg"; // Importing the background image
import SearchbyName from "../components/SearchbyName"; // Importing SearchbyName

export default function ClassPage({ students }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(""); // Adding search term state

  // Handle clicking on a student card
  const handleStudentClick = (studentId) => {
    const storedId = localStorage.getItem("childId");
    const selectedTestId = localStorage.getItem("selectedTestId"); // Retrieve selectedTestId from localStorage
    if (studentId !== storedId || storedId == undefined) {
      localStorage.setItem("childId", studentId);
    }
    // Check the selectedTestId and navigate accordingly
    if (selectedTestId === "1") {
      navigate("/test6");
    } else if (selectedTestId === "2") {
      navigate("/test8");
    } else if (selectedTestId === "3") {
      navigate("/test16"); // Default or if selectedTestId is 3
    } else if (selectedTestId === "5"){
      navigate("/test13")
    } else {
      navigate("/test7"); // Default or if selectedTestId is not recognized
    }
  };

  // Handle clicking the 'Add Child' button
  const handleClick = () => {
    navigate("/empty");
  };

  // Handle search term updates
  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  // Filter students based on search term
  const filteredStudents = (students || []).filter((student) =>
    student?.name?.toLowerCase().includes(searchTerm)
  );
  return (
    <div style={{ position: "relative", height: "100vh" }}>
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
      <div
        className="p-6 overflow-auto h-full"
        style={{ backgroundColor: "rgba(255, 255, 255, 0)" }}
      >
        <div className="pl-7 pr-7 pt-2">
          <div className="flex justify-center items-center">
            <h2
              className="text-[30px] pt-0 mb-[0.5] font-extrabold font-roboto  "
              style={{ textShadow: "2px 2px 0 #ff937a" }} // Example shadow with color #ff937a
            >
              SELECT A STUDENT
            </h2>

            {/* SearchBar Component Integration */}
            <SearchbyName onSearch={handleSearch} />
          </div>
          <hr className="flex justify-between border-t-2 border-gray-800 mt-4 ml-0 mb-7 mr-0" />
        </div>

        {/* SearchbyName Component Integration
        <SearchbyName onSearch={handleSearch} /> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-cols-fr gap-8 pb-4 pl-6 pr-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                buttonLabel="Select Student"
                onButtonClick={() => handleStudentClick(student.id)} // Pass the click handler
              />
            ))
          ) : (
            <p>No students available</p>
          )}
        </div>
      </div>
    </div>
  );
}
