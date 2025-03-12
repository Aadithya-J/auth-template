import React from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import TestCard from "../components/TestCard"; // Assuming you keep the original TestCard
import { MdOutlineEventNote } from "react-icons/md";
import { RiGraduationCapFill } from "react-icons/ri";
import { CiCirclePlus } from "react-icons/ci";
import { useState } from "react";
import PopupForm from "../components/PopupForm";
import StudentList from "../components/StudentList";
import img1 from "../assets/grid.jpg"; // Importing the background image

const Home = ({ students, tests }) => {
  const navigate = useNavigate();

  const [showPopup, setShowPopup] = useState(false);

  // Toggle the popup on button click
  const handleAddChildClick = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  const userDetails = {
    name: "RAHUL MAHESH",
    email: "u@gmail.com",
  };

  // Handle click on a specific student
  const handleStudentClick = (studentId) => {
    const storedId = localStorage.getItem("childId");
    if (studentId !== storedId) {
      localStorage.setItem("childId", studentId);
    }
    navigate(`/testreports`); // Navigate to student details page
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      {/* Background image with fixed positioning */}
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

      {/* Scrollable content */}
      <div className="p-7 overflow-auto h-full">
        <h2 className="text-[30px] mb-[0.5] font-bold font-roboto pl-5">
          Welcome,
        </h2>
        <h2
          className="text-[35px] mb-[0.5] font-extrabold font-roboto pl-5"
          style={{ textShadow: '2px 2px 0 #ff937a' }} // Example shadow with color #ff937a
        >
          {userDetails.name}
        </h2>

        <hr className="border-t-2 border-gray-800 mt-4 ml-5 mb-5 mr-5" />

        <div className="flex-grow overflow-auto">
          <div className="flex flex-wrap justify-start">
            {tests.length > 0 ? (
              tests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onClick={() => handleStudentClick(test.id)} // Pass click handler to TestCard
                />
              ))
            ) : (
              <p>No tests available</p>
            )}
          </div>
          <hr className="border-t-2 border-gray-800 mt-5 ml-5 mr-5 mb-3" />
          <div className="space-y-2 p-5">
            {students.length > 0 ? (
              // First reverse the students array, then slice to get the first 10
              students
                .slice()
                .reverse()
                .slice(0, 10)
                .map((student) => (
                  <StudentList
                    key={student._id}
                    student={student}
                    buttonLabel="View Results"
                    onButtonClick={() => handleStudentClick(student._id)}
                  />
                ))
            ) : (
              <p>No students available</p>
            )}
          </div>
        </div>
        {showPopup && (
          <PopupForm showPopup={showPopup} handleClose={handleClose} />
        )}
      </div>
    </div>
  );
};

export default Home;
