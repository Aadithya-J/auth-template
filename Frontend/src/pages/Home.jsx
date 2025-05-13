import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PopupForm from "../components/PopupForm";
import SearchbyName from "../components/SearchbyName";
import StudentList from "../components/StudentList";
import TestCard from "../components/TestCard";
import { backendURL } from "../definedURL.js";
import { useLanguage } from "../contexts/LanguageContext";

const Home = ({ students = [], tests = [] }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
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
  const [highestScore, setHighestScore] = useState(0);
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
          const createdAt = new Date(test.created_at);
          if (isNaN(createdAt)) return; // Skip invalid dates
          const month = createdAt.toLocaleString("default", { month: "short" }); // e.g. "Jan"

          if (!groupedByMonth[month])
            groupedByMonth[month] = { scores: [], totalScore: 0 };
          groupedByMonth[month].scores.push(test.score);
          groupedByMonth[month].totalScore += test.score || 0;
        });
      }

      // Calculate performanceData after fetching all scores
      const highestScore = Math.max(
        ...allScores.filter((score) => score !== undefined && score !== null)
      );
      const lowestScore = Math.min(
        ...allScores.filter((score) => score !== undefined && score !== null)
      );
      const average =
        totalStudents > 0 ? (totalSum / totalStudents).toFixed(1) : 0;

      const performanceData = Object.keys(groupedByMonth)
        .map((month) => {
          const monthlyScores = groupedByMonth[month].scores;
          if (monthlyScores.length === 0) return null; // Skip months with no data

          const monthHighest = Math.max(
            ...monthlyScores.filter(
              (score) => score !== undefined && score !== null
            )
          );
          const monthLowest = Math.min(
            ...monthlyScores.filter(
              (score) => score !== undefined && score !== null
            )
          );
          const monthAverage =
            monthlyScores.length > 0
              ? (
                  groupedByMonth[month].totalScore / monthlyScores.length
                ).toFixed(1)
              : 0;

          return {
            month: month,
            highest: monthHighest,
            average: monthAverage,
            lowest: monthLowest,
          };
        })
        .filter((data) => data !== null); // Remove null months

      setPerformanceData(performanceData);
      setTotalScoresByChild(scores);
      setAverageScore(average);
      setHighestScore(highestScore);
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
  const dyslexiaLikelihood = t("low");

  return (
    <div className="h-screen overflow-y-auto bg-blue-50 px-4 text-gray-900">
      <div className="transform scale-[0.96] origin-top mx-auto px-4 py-8 pb-16">
      <div className="bg-transparent shadow-sm rounded-lg p-3">
        <h2 className="text-lg font-semibold">{t("dashboard")},</h2>
        <span className="text-sm font-normal text-gray-600">
          {t("studentsPerformanceOverview")}
        </span>
        <h3 className="text-xl font-extrabold text-blue-600">{userDetails.name}</h3>
      </div>
  
      <div className="mt-3 flex flex-wrap gap-3 md:flex-nowrap">
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">{t("totalStudents")}</p>
          <h2 className="text-xl font-bold text-blue-600">{students.length}</h2>
        </div>
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">{t("totalTests")}</p>
          <h2 className="text-xl font-bold text-blue-600">{tests.length}</h2>
        </div>
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">{t("avgStudentScore")}</p>
          <h2 className="text-xl font-bold text-blue-800">{averageScore}</h2>
        </div>
        <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
          <p className="text-sm font-medium">{t("highestScore")}</p>
          <h2 className="text-xl font-bold text-blue-600">{highestScore}</h2>
        </div>
      </div>
  
      <div className="flex flex-col md:flex-row gap-4 mt-4">
        <div className="flex-1 bg-white shadow-sm rounded-lg p-3">
          <h2 className="text-md font-bold text-blue-600">{t("classPerformance")}</h2>
          <div className="w-full mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="highest" stroke="#2563eb" strokeWidth={2} name={t("highest")} />
                <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} name={t("average")} />
                <Line type="monotone" dataKey="lowest" stroke="#93c5fd" strokeWidth={2} name={t("lowest")} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
  
        <div className="w-full md:w-1/3 bg-white shadow-sm rounded-lg p-3">
          <h2 className="text-md font-bold">{t("recentTests")}</h2>
          <div className="space-y-2 mt-2 overflow-y-auto max-h-64">
            {tests.length > 0 ? (
              tests.slice(0, 5).map((test) => (
                <TestCard key={test.id} test={test} onClick={() => handleStudentClick(test.id)} />
              ))
            ) : (
              <p className="text-gray-500 text-sm">{t("noTests")}</p>
            )}
          </div>
        </div>
      </div>
  
      <div className="mt-3 bg-white shadow-sm rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{t("students")}</h2>
            <h3 className="text-sm mt-1 text-gray-700 font-normal">
              {t("selectStudentViewReport")}
            </h3>
          </div>
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
                  buttonLabel={t("viewResults")}
                  onButtonClick={() => handleStudentClick(student.id)}
                  buttonClassName="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                />
              ))
          ) : (
            <p>{t("noStudentsFound")}</p>
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
