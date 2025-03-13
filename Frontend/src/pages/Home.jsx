import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import TestCard from "../components/TestCard";
import { MdOutlineEventNote } from "react-icons/md";
import { RiGraduationCapFill } from "react-icons/ri";
import { CiCirclePlus } from "react-icons/ci";
import PopupForm from "../components/PopupForm";
import StudentList from "../components/StudentList";
import img1 from "../assets/grid.jpg";

const Home = ({ students = [], tests = [] }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleAddChildClick = () => setShowPopup(true);
  const handleClose = () => setShowPopup(false);

  const userDetails = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : { name: "user", email: "u@gmail.com" };  // const userDetails = { name: "user", email: "

  // const userDetails = { name: "user", email: "u@gmail.com" };

  const handleStudentClick = (studentId) => {
    const storedId = localStorage.getItem("childId");
    if (studentId !== storedId) localStorage.setItem("childId", studentId);
    navigate(`/testreports`);
  };

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

      <div className="p-7 overflow-auto h-full">
        <h2 className="text-[30px] mb-[0.5] font-bold font-roboto pl-5">Welcome,</h2>
        <h2
          className="text-[35px] mb-[0.5] font-extrabold font-roboto pl-5"
          style={{ textShadow: "2px 2px 0 #ff937a" }}
        >
          {userDetails.name}
        </h2>

        <hr className="border-t-2 border-gray-800 mt-4 ml-5 mb-5 mr-5" />

        <div className="flex-grow overflow-auto">
          <div className="flex flex-wrap justify-start">
            {Array.isArray(tests) && tests.length > 0 ? (
              tests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  onClick={() => handleStudentClick(test.id)}
                />
              ))
            ) : (
              <p>No tests available</p>
            )}
          </div>

          <hr className="border-t-2 border-gray-800 mt-5 ml-5 mr-5 mb-3" />

          <div className="space-y-2 p-5">
            {Array.isArray(students) && students.length > 0 ? (
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

        {showPopup && <PopupForm showPopup={showPopup} handleClose={handleClose} />}
      </div>
    </div>
  );
};

Home.defaultProps = { students: [], tests: [] };

export default Home;