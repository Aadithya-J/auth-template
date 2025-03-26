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
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentList from "../components/StudentList";
import TestCard from "../components/TestCard";
import PopupForm from "../components/PopupForm";
import SearchbyName from "../components/SearchbyName";
import axios from "axios";
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
import { backendURL } from "../definedURL.js";

const Home = ({ students = [], tests = [] }) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const handleAddChildClick = () => setShowPopup(true);
  const handleClose = () => setShowPopup(false);
  const [visualTestData, setVisualTestData] = useState([]);
  const [soundTestData, setSoundTestData] = useState([]);
  const childId = localStorage.getItem("childId");
  const tokenId = localStorage.getItem("access_token");
  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [totalScoresByChild, setTotalScoresByChild] = useState({});
  const [averageScore, setAverageScore] = useState(0);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      if (!students || students.length === 0) return;

      let totalSum = 0;
      let totalStudents = 0;
      let totalTests = 0;
      const scores = {};
      let allScores = []; // All scores across all tests
      const groupedByMonth = {}; // To group data by months

      for (let student of students) {
        const studentId = student.id;

        // Fetching the visual test scores
        const visualTestResponse = await axios.get(
          `${backendURL}/getVisualByChild/${studentId}`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        const visualTests = visualTestResponse.data.tests;

        // Fetching the sound test scores
        const soundTestResponse = await axios.get(
          `${backendURL}/getSoundTestByChild/${studentId}`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        const soundTests = soundTestResponse.data.tests;

        // Fetching the Schonell test scores
        const schonellTestResponse = await axios.get(
          `${backendURL}/getTestsByChild/${studentId}`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        const schonellTests = schonellTestResponse.data.tests;

        // Calculate individual test scores and group by month
        const allTests = [...visualTests, ...soundTests, ...schonellTests];
        const totalScore = allTests.reduce(
          (sum, test) => sum + (test.score || 0),
          0
        );
        scores[studentId] = totalScore;

        totalSum += totalScore;
        totalStudents += 1;
        totalTests += allTests.length;

        // Adding scores for min/max calculation
        allScores = allScores.concat(allTests.map((test) => test.score));

        // Group by month using created_at date
        allTests.forEach((test) => {
          const month = new Date(test.created_at).toLocaleString("default", {
            month: "short",
          }); // e.g. "Jan"
          if (!groupedByMonth[month])
            groupedByMonth[month] = { scores: [], totalScore: 0 };
          groupedByMonth[month].scores.push(test.score);
          groupedByMonth[month].totalScore += test.score || 0;
        });
      }

      // Calculate performanceData after fetching all scores
      const highestScore = Math.max(
        ...allScores.filter((score) => score !== undefined)
      );
      const lowestScore = Math.min(
        ...allScores.filter((score) => score !== undefined)
      );
      const average =
        totalStudents > 0 ? (totalSum / totalStudents).toFixed(1) : 0;

      const performanceData = Object.keys(groupedByMonth).map((month) => {
        const monthlyScores = groupedByMonth[month].scores;
        const monthHighest = Math.max(
          ...monthlyScores.filter((score) => score !== undefined)
        );
        const monthLowest = Math.min(
          ...monthlyScores.filter((score) => score !== undefined)
        );
        const monthAverage =
          monthlyScores.length > 0
            ? (groupedByMonth[month].totalScore / monthlyScores.length).toFixed(
                1
              )
            : 0;

        return {
          month: month,
          highest: monthHighest,
          average: monthAverage,
          lowest: monthLowest,
        };
      });

      setPerformanceData(performanceData);
      setTotalScoresByChild(scores);
      setAverageScore(average);
    };

    fetchScores();
  }, [students, backendURL]);

  const userDetails = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleStudentClick = (studentId) => {
    localStorage.setItem("childId", studentId);
    navigate(`/testreports`);
  };

  // Placeholder for Dyslexia Likelihood (Modify with real data logic)
  const dyslexiaLikelihood = "Low";

  return (
    <div className="min-h-screen bg-blue-50 p-4 text-gray-900 overflow-y-auto">
      <div className="bg-transparent shadow-sm rounded-lg p-3">
        <h2 className="text-lg font-semibold">Dashboard,</h2>
        <span className="text-sm font-normal text-gray-600">
          Your Students' performance overview.
        </span>
        <h2 className="text-xl font-extrabold text-blue-600">
          {userDetails.name}
        </h2>
      </div>

      {/* Stats Section - Now in a Single Row */}
      <div className="mt-3 flex flex-wrap gap-3 md:flex-nowrap">
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">Total Students</p>
          <h3 className="text-xl font-bold text-blue-600">{students.length}</h3>
        </div>
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">Total Tests</p>
          <h3 className="text-xl font-bold text-blue-600">{tests.length}</h3>
        </div>
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">Avg. Student Score</p>
          <h3 className="text-xl font-bold text-blue-800">{averageScore}</h3>
        </div>
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">Dyslexia Likelihood</p>
          <h3 className="text-xl font-bold text-blue-600">
            {dyslexiaLikelihood}
          </h3>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        {/* Left Column - Class Performance Graph */}
        <div className="flex-1 bg-white shadow-sm rounded-lg p-3">
          <h3 className="text-md font-bold text-blue-600">Class Performance</h3>
          <div className="w-full mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="highest"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="lowest"
                  stroke="#93c5fd"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column - Recent Tests */}
        <div className="w-full md:w-1/3 bg-white shadow-sm rounded-lg p-3">
          <h3 className="text-md font-bold">Recent Tests</h3>
          <div className="space-y-2 mt-2 overflow-y-auto max-h-64">
            {tests.length > 0 ? (
              tests
                .slice(0, 5)
                .map((test) => (
                  <TestCard
                    key={test.id}
                    test={test}
                    onClick={() => handleStudentClick(test.id)}
                  />
                ))
            ) : (
              <p className="text-gray-500 text-sm">No tests available</p>
            )}
          </div>
        </div>
      </div>

      {/* Student List Section */}
      <div className="mt-3 bg-white shadow-sm rounded-lg p-3">
        <div className="flex items-center justify-between">
          {/* Left side: Text */}
          <div>
            <h3 className="text-lg font-bold">Students</h3>
            <h3 className="text-sm mt-1 text-gray-700 font-normal">
              Select a student to view their report
            </h3>
          </div>

          {/* Right side: Search bar */}
          <SearchbyName onSearch={handleSearch} />
        </div>
        <div className="space-y-2 p-5 overflow-y-auto max-h-64">
          {Array.isArray(students) && students.length > 0 ? (
            students
              .filter(
                (student) =>
                  searchTerm.trim() === "" ||
                  student.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
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

      {showPopup && (
        <PopupForm showPopup={showPopup} handleClose={handleClose} />
      )}
    </div>
  );
};

Home.defaultProps = { students: [], tests: [] };

export default Home;
