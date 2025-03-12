import React from "react";
import { useNavigate } from "react-router-dom";
import TakeTestCard from "../components/TakeTestCard";
import img1 from "../assets/grid.jpg"; // Importing the background image just like in Home.jsx
import books from "../assets/b.jpg";
import mag from "../assets/mag.jpeg.jpg"
import speak from "../assets/s.jpg"

const TakeTests = ({ tests }) => {
  const navigate = useNavigate();

  const handleTestClick = (testId) => {
    localStorage.setItem('selectedTestId', testId);
    navigate('/selectstudent');
  };

  return (
    <div className="pb-12" style={{ position: "relative", height: "100vh" }}>
      <div className=""
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
        <div className="pl-7 pr-7">
          <h2
            className="text-[30px] pt-7 mb-[0.5] font-extrabold font-roboto "
            style={{ textShadow: '2px 2px 0 #ff937a' }} // Example shadow with color #ff937a
          >
            TAKE TESTS
          </h2>
          <hr className="flex justify-center border-t-2 border-gray-800 mt-4 ml-0 mb-3 mr-0" />
        </div>
        <div className="space-y-1 max-h-screen pl-6 pr-6"> {/* Reduced the space between cards */}
          {tests.length > 0 ? (
            tests.map((test, index) => (
              <div key={test.id} >
                <TakeTestCard test={test} buttonLabel="Take Test" />
              </div>
            ))
          ) : (
            <p>No tests available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeTests;
