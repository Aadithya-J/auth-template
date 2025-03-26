// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import StudentCard from "../components/StudentCard";
// import TestCard from "../components/TestCard";
// import { MdOutlineEventNote } from "react-icons/md";
// import { RiGraduationCapFill } from "react-icons/ri";
// import { CiCirclePlus } from "react-icons/ci";
// import PopupForm from "../components/PopupForm";
// import StudentList from "../components/StudentList";
// import img1 from "../assets/grid.jpg";

// const Home = ({ students = [], tests = [] }) => {
//   const navigate = useNavigate();
//   const [showPopup, setShowPopup] = useState(false);

//   const handleAddChildClick = () => setShowPopup(true);
//   const handleClose = () => setShowPopup(false);

//   const userDetails = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : { name: "user", email: "u@gmail.com" };  // const userDetails = { name: "user", email: "

//   // const userDetails = { name: "user", email: "u@gmail.com" };

//   const handleStudentClick = (studentId) => {
//     const storedId = localStorage.getItem("childId");
//     if (studentId !== storedId) localStorage.setItem("childId", studentId);
//     navigate(`/testreports`);
//   };

//   return (
//     <div style={{ position: "relative", height: "100vh" }}>
//       <div
//         style={{
//           position: "fixed",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           backgroundImage: `url(${img1})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           zIndex: -1,
//         }}
//       />
//       <div className="p-7 overflow-auto h-full">
//         <h2 className="text-[30px] mb-[0.5] font-bold font-roboto pl-5">Welcome,</h2>
//         <h2
//           className="text-[35px] mb-[0.5] font-extrabold font-roboto pl-5"
//           style={{ textShadow: "2px 2px 0 #ff937a" }}
//         >
//           {userDetails.name}
//         </h2>

//         <hr className="border-t-2 border-gray-800 mt-4 ml-5 mb-5 mr-5" />

//         <div className="flex-grow overflow-auto">
//           <div className="flex flex-wrap justify-start">
//             {Array.isArray(tests) && tests.length > 0 ? (
//               tests.map((test) => (
//                 <TestCard
//                   key={test.id}
//                   test={test}
//                   onClick={() => handleStudentClick(test.id)}
//                 />
//               ))
//             ) : (
//               <p>No tests available</p>
//             )}
//           </div>

//           <hr className="border-t-2 border-gray-800 mt-5 ml-5 mr-5 mb-3" />

//           <div className="space-y-2 p-5">
//             {Array.isArray(students) && students.length > 0 ? (
//               students
//                 .slice()
//                 .reverse()
//                 .slice(0, 10)
//                 .map((student) => (
//                   <StudentList
//                     key={student.id}
//                     student={student}
//                     buttonLabel="View Results"
//                     onButtonClick={() => handleStudentClick(student.id)}
//                   />
//                 ))
//             ) : (
//               <p>No students available</p>
//             )}
//           </div>
//         </div>

//         {showPopup && <PopupForm showPopup={showPopup} handleClose={handleClose} />}
//       </div>
//     </div>
//   );
// };

// Home.defaultProps = { students: [], tests: [] };

// export default Home;




import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentList from "../components/StudentList";
import TestCard from "../components/TestCard";
import PopupForm from "../components/PopupForm";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Home = ({ students = [], tests = [] }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleAddChildClick = () => setShowPopup(true);
  const handleClose = () => setShowPopup(false);

  const userDetails = JSON.parse(localStorage.getItem("user")) || { name: "User" };

  const handleStudentClick = (studentId) => {
    localStorage.setItem("childId", studentId);
    navigate(`/testreports`);
  };

  // Sample Data for the Chart
  const performanceData = [
    { month: "Jan", highest: 95, average: 80, lowest: 60 },
    { month: "Feb", highest: 92, average: 78, lowest: 58 },
    { month: "Mar", highest: 93, average: 79, lowest: 59 },
    { month: "Apr", highest: 96, average: 82, lowest: 62 },
    { month: "May", highest: 97, average: 84, lowest: 65 },
    { month: "Jun", highest: 98, average: 86, lowest: 67 },
  ];

  // Calculate Average Score
  const totalScores = tests.reduce((sum, test) => sum + (test.score || 0), 0);
  const averageScore = tests.length > 0 ? (totalScores / tests.length).toFixed(1) : "N/A";

  // Placeholder for Dyslexia Likelihood (Modify with real data logic)
  const dyslexiaLikelihood = "Low"; 

  return (
    <div className="min-h-screen bg-blue-50 p-4 text-gray-900 overflow-y-auto">
      <div className="bg-transparent shadow-sm rounded-lg p-3">
        <h2 className="text-lg font-semibold">Dashboard,</h2>
        <span className="text-sm font-normal text-gray-600">Your Students' performance overview.</span>
        <h2 className="text-xl font-extrabold text-blue-600">{userDetails.name}</h2>
      </div>

      {/* Stats Section - Now in a Single Row */}
      <div className="mt-3 flex flex-wrap gap-3 md:flex-nowrap">
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">Total Students</p>
          <h3 className="text-xl font-bold text-blue-600">{students.length}</h3>
        </div>
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">Completed Tests</p>
          <h3 className="text-xl font-bold text-blue-600">{tests.length}</h3>
        </div>
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
        <p className="text-sm font-medium">Avg. Student Score</p>
<h3 className="text-xl font-bold text-blue-800">86.2%</h3>
          </div>
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">Dyslexia Likelihood</p>
          <h3 className="text-xl font-bold text-blue-600">{dyslexiaLikelihood}</h3>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Left Column - Class Performance Graph */}
        <div className="flex-1 bg-white shadow-sm rounded-lg p-3">
  <h3 className="text-md font-bold text-blue-600">Class Performance</h3>
  {/* <p className="text-gray-500 text-sm">Class performance over time</p> */}
  <div className="w-full mt-4 h-64">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={performanceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="highest" stroke="#2563eb" strokeWidth={2} />
        <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} />
        <Line type="monotone" dataKey="lowest" stroke="#93c5fd" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  </div>
</div>


        {/* Right Column - Recent Tests */}
        <div className="w-full md:w-1/3 bg-white shadow-sm rounded-lg p-3">
          <h3 className="text-md font-bold">Recent Tests</h3>
          <div className="space-y-2 mt-2 overflow-y-auto max-h-64">
            {tests.length > 0 ? (
              tests.slice(0, 5).map((test) => (
                <TestCard key={test.id} test={test} onClick={() => handleStudentClick(test.id)} />
              ))
            ) : (
              <p className="text-gray-500 text-sm">No tests available</p>
            )}
          </div>
        </div>
      </div>

      {/* Student List Section */}
      <div className="mt-3 bg-white shadow-sm rounded-lg p-3">
      <h3 className="text-lg font-bold">Students</h3>
<h3 className="text-sm mt-1 text-gray-700 font-normal">Select a student to view their report</h3>


        <div className="space-y-2 p-5 overflow-y-auto max-h-64">
          {Array.isArray(students) && students.length > 0 ? (
            students
              .slice()
              .reverse()
              .slice(0, 10)
              .map((student) => (
                <StudentList
                  key={student.id}
                  student={student}
                  buttonLabel="View Results"
                  onButtonClick={() => handleStudentClick(student.id)}
                  buttonClassName="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                />
              ))
          ) : (
            <p>No students available</p>
          )}
        </div>
      </div>

      {showPopup && <PopupForm showPopup={showPopup} handleClose={handleClose} />}
    </div>
  );
};

Home.defaultProps = { students: [], tests: [] };

export default Home;
