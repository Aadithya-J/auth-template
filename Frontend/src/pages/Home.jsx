import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
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

// Cache for storing fetched test data
const testDataCache = {};

const Home = ({ students = [], tests = [] }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalScoresByChild, setTotalScoresByChild] = useState({});
  const [highestScore, setHighestScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [performanceData, setPerformanceData] = useState([]);
  const [testCount, setTestCount] = useState(0);

  const userDetails = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
  };

  // Memoized filtered students
  const filteredStudents = useMemo(() => {
    return students
      .filter(
        (student) =>
          searchTerm.trim() === "" ||
          student.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .slice()
      .reverse()
      .slice(0, 10);
  }, [students, searchTerm]);

  // Function to fetch test data with caching
  const fetchTestData = async (url, studentId) => {
    const cacheKey = `${url}-${studentId}`;

    // Return cached data if available
    if (testDataCache[cacheKey]) {
      return testDataCache[cacheKey];
    }

    try {
      const response = await axios.get(url, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // Cache the response
      testDataCache[cacheKey] = response.data.tests || [];
      return testDataCache[cacheKey];
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      return [];
    }
  };

  // Function to process all test data for a student
  const processStudentTests = async (studentId) => {
    const testEndpoints = [
      `${backendURL}/getVisualByChild/${studentId}`,
      `${backendURL}/getSoundTestByChild/${studentId}`,
      `${backendURL}/getTestsByChild/${studentId}`,
      `${backendURL}/getTest13ByChild/${studentId}`,
      `${backendURL}/getGraphemeByChild/${studentId}`,
      `${backendURL}/getPictureByChild/${studentId}`,
      `${backendURL}/getSequenceTestsByUser/${studentId}`,
      `${backendURL}/getSoundBlendingByChild/${studentId}`,
      `${backendURL}/symbolsequenceresults/${studentId}`,
      `${backendURL}/vocabulary/results/child/${studentId}`,
    ];

    // Fetch all test data in parallel
    const testDataPromises = testEndpoints.map((endpoint) =>
      fetchTestData(endpoint, studentId)
    );

    const allTestData = await Promise.all(testDataPromises);

    // Flatten all test results
    const allTests = allTestData.flat();

    // Calculate total score for this student
    const totalScore = allTests.reduce(
      (sum, test) => sum + (test.score || 0),
      0
    );

    return {
      studentId,
      totalScore,
      tests: allTests,
      testCount: allTests.length,
    };
  };

  // Main function to fetch and process all scores
  const fetchAllScores = async () => {
    if (!students || students.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      let totalSum = 0;
      let totalTests = 0;
      const scores = {};
      let allScores = [];
      const groupedByMonth = {};

      // Process all students in parallel
      const studentResults = await Promise.all(
        students.map((student) => processStudentTests(student.id))
      );

      // Process results
      studentResults.forEach((result) => {
        const { studentId, totalScore, tests, testCount } = result;

        scores[studentId] = totalScore;
        totalSum += totalScore;
        totalTests += testCount;

        // Add scores for min/max calculation
        allScores = allScores.concat(tests.map((test) => test.score || 0));

        // Group by month
        tests.forEach((test) => {
          if (!test.created_at) return;

          const createdAt = new Date(test.created_at);
          if (isNaN(createdAt)) return;

          const month = createdAt.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });

          if (!groupedByMonth[month]) {
            groupedByMonth[month] = { scores: [], totalScore: 0 };
          }

          groupedByMonth[month].scores.push(test.score || 0);
          groupedByMonth[month].totalScore += test.score || 0;
        });
      });

      // Calculate performance metrics
      const validScores = allScores.filter((score) => !isNaN(score));
      const highest = validScores.length > 0 ? Math.max(...validScores) : 0;
      const lowest = validScores.length > 0 ? Math.min(...validScores) : 0;
      const average =
        students.length > 0 ? (totalSum / students.length).toFixed(1) : 0;

      // Prepare performance data for chart
      const chartData = Object.keys(groupedByMonth)
        .map((month) => {
          const monthlyData = groupedByMonth[month];
          const monthlyScores = monthlyData.scores.filter(
            (score) => !isNaN(score)
          );

          if (monthlyScores.length === 0) return null;

          return {
            month,
            highest: Math.max(...monthlyScores),
            average: (monthlyData.totalScore / monthlyScores.length).toFixed(1),
            lowest: Math.min(...monthlyScores),
          };
        })
        .filter((data) => data !== null)
        .sort((a, b) => {
          // Sort by date (convert month-year back to date for comparison)
          const dateA = new Date(a.month);
          const dateB = new Date(b.month);
          return dateA - dateB;
        });

      // Update state
      setTotalScoresByChild(scores);
      setAverageScore(average);
      setHighestScore(highest);
      setPerformanceData(chartData);
      setTestCount(totalTests);
    } catch (error) {
      console.error("Error processing scores:", error);
      setError(t("errorLoadingData"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllScores();
  }, [students]);

  const handleAddChildClick = () => setShowPopup(true);
  const handleClose = () => setShowPopup(false);
  const handleSearch = (term) => setSearchTerm(term);

  const handleStudentClick = (studentId) => {
    localStorage.setItem("childId", studentId);
    navigate(`/testreports`);
  };

  // Memoized chart component to prevent unnecessary re-renders
  const PerformanceChart = useMemo(() => {
    return (
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
            name={t("highest")}
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#3b82f6"
            strokeWidth={2}
            name={t("average")}
          />
          <Line
            type="monotone"
            dataKey="lowest"
            stroke="#93c5fd"
            strokeWidth={2}
            name={t("lowest")}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }, [performanceData, t]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-700">{t("loadingDashboard")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t("errorLoadingData")}
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAllScores}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-blue-50 px-4 text-gray-900">
      <div className="transform scale-[0.96] origin-top mx-auto px-4 py-8 pb-16">
        <div className="bg-transparent shadow-sm rounded-lg p-3">
          <h2 className="text-lg font-semibold">{t("dashboard")},</h2>
          <span className="text-sm font-normal text-gray-600">
            {t("studentsPerformanceOverview")}
          </span>
          <h3 className="text-xl font-extrabold text-blue-600">
            {userDetails.name}
          </h3>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 md:flex-nowrap">
          <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
            <p className="text-sm font-medium">{t("totalStudents")}</p>
            <h2 className="text-xl font-bold text-blue-600">
              {students.length}
            </h2>
          </div>
          <div className="bg-white shadow-sm rounded-md p-3 w-full md:w-1/4">
            <p className="text-sm font-medium">{t("totalTests")}</p>
            <h2 className="text-xl font-bold text-blue-600">{testCount}</h2>
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
            <h2 className="text-md font-bold text-blue-600">
              {t("classPerformance")}
            </h2>
            <div className="w-full mt-4 h-64">
              {performanceData.length > 0 ? (
                PerformanceChart
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  {t("noDataAvailable")}
                </div>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/3 bg-white shadow-sm rounded-lg p-3">
            <h2 className="text-md font-bold">{t("recentTests")}</h2>
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
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentList
                  key={student.id}
                  student={student}
                  buttonLabel={t("viewResults")}
                  onButtonClick={() => handleStudentClick(student.id)}
                  buttonClassName="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                  score={totalScoresByChild[student.id] || 0}
                />
              ))
            ) : (
              <p className="text-gray-500">{t("noStudentsFound")}</p>
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

Home.defaultProps = { students: [], tests: [] };

export default Home;
