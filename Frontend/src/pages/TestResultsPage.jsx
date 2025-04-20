import axios from "axios";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaChartLine, FaEnvelope, FaFileAlt, FaIdCard, FaPhone, FaUser } from 'react-icons/fa';
import TestReportPopup from "../components/TestReportPopup";
import { backendURL } from "../definedURL.js";

const TestResultsTable = () => {
  const [data, setData] = useState([]);
  const [childDetails, setChildDetails] = useState({});
  const [visualTestData, setVisualTestData] = useState([]);
  const [soundTestData, setSoundTestData] = useState([]);
  const [auditoryTestData, setAuditoryTestData] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [showCumulativeReport, setShowCumulativeReport] = useState(false);
  const childId = localStorage.getItem("childId");
  const tokenId = localStorage.getItem("access_token");

  useEffect(() => {
    // Retrieve user details from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserDetails(parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }

    const fetchData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/getTestsbyChild/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        const fetchedData = response.data.tests;
        setData(fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const fetchVisualTestData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/getVisualByChild/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        setVisualTestData(response.data.tests);
      } catch (error) {
        console.error("Error fetching visual test data:", error);
      }
    };

    const fetchSoundTestData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/getSoundTestByChild/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        setSoundTestData(response.data.tests);
      } catch (error) {
        console.error("Error fetching sound test data:", error);
      }
    };

    const fetchAuditoryTestData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/getTest13ByChild/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        setAuditoryTestData(response.data.tests);
      } catch (error) {
        console.error("Error fetching auditory test data:", error);
      }
    };

    fetchData();
    fetchVisualTestData();
    fetchSoundTestData();
    fetchAuditoryTestData();
  }, [childId, tokenId]);

  useEffect(() => {
    const fetchChildDetails = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(`${backendURL}/getChild/${childId}`, {
          headers: { authorization: `Bearer ${tokenId}` },
        });
        setChildDetails(response.data.child);
      } catch (error) {
        console.error("Error fetching child details:", error);
      }
    };

    fetchChildDetails();
  }, [childId, tokenId]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (!isNaN(date)) {
      return {
        datePart: date.toLocaleDateString(),
        timePart: date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      };
    }
    return { datePart: "Invalid Date", timePart: "Invalid Time" };
  };

  const handleViewReport = (test) => {
    setSelectedTest(test);
    setShowReportPopup(true);
    setShowCumulativeReport(false);
  };

  const handleViewCumulativeReport = () => {
    setSelectedTest({
      test_name: "Cumulative Assessment Report",
      created_at: new Date().toISOString(),
      is_cumulative: true,
      allTests
    });
    setShowCumulativeReport(true);
    setShowReportPopup(true);
  };

  const closeReportPopup = () => {
    setShowReportPopup(false);
  };

  // Combine all test data for display
  const allTests = [
    ...data.map(test => ({ ...test, type: "reading" })),
    ...visualTestData.map(test => ({ ...test, type: "visual" })),
    ...soundTestData.map(test => ({ ...test, type: "sound" })),
    ...auditoryTestData.map(test => ({ ...test, type: "auditory" }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/80 to-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* User Profile Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* User Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                  {userDetails.profilePic ? (
                    <img 
                      src={userDetails.profilePic} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUser className="w-16 h-16 text-blue-300" />
                  )}
                </div>
              </div>
              
              {/* User Information */}
              <div className="flex-1 text-white">
                <h1 className="text-2xl md:text-3xl font-bold text-center md:text-left">
                  {childDetails.name|| "Vimal"}
                </h1>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                  {userDetails.role && (
                    <div className="flex items-center">
                      <FaIdCard className="mr-2" />
                      <span className="font-medium">Role:</span>
                      <span className="ml-2 bg-blue-700 px-2 py-0.5 rounded text-sm">
                        {userDetails.role}
                      </span>
                    </div>
                  )}
                  {userDetails.email && (
                    <div className="flex items-center">
                      <FaEnvelope className="mr-2" />
                      <span>{userDetails.email}</span>
                    </div>
                  )}
                  {userDetails.phone && (
                    <div className="flex items-center">
                      <FaPhone className="mr-2" />
                      <span>{userDetails.phone}</span>
                    </div>
                  )}
                  {userDetails.since && (
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      <span>Member since: {new Date(userDetails.since).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Student Info Banner */}
                <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-8 bg-white/10 p-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-100">Viewing Results for:</span>
                    <span className="ml-2 font-semibold">{childDetails.name || "Student"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-100">ID:</span>
                    <span className="ml-2 font-semibold">{childId || "N/A"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-100">Age:</span>
                    <span className="ml-2 font-semibold">{childDetails.age || "N/A"} years</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-100">Tests:</span>
                    <span className="ml-2 font-semibold">{allTests.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-100 bg-blue-50 flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center">
              <h2 className="font-semibold text-blue-700">All Test Results</h2>
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                {allTests.length}
              </span>
            </div>
            
            {/* Cumulative Report Button */}
            {allTests.length > 0 && (
              <button 
                onClick={handleViewCumulativeReport}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 w-full md:w-auto justify-center"
              >
                <FaChartLine className="text-blue-200" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Cumulative Report</span>
                  <span className="text-xs text-blue-200">View comprehensive assessment</span>
                </div>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Test Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">
                    Report
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {allTests.length > 0 ? (
                  allTests.map((test, index) => {
                    const { datePart, timePart } = formatDateTime(test.created_at);
                    return (
                      <tr key={`${test.type}-${index}`} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-blue-800 font-medium">
                          {test.test_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-blue-700">
                          {datePart}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-blue-700">
                          {timePart}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {test.type === "visual" ? test.options : test.score || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewReport(test)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors duration-150 flex items-center"
                          >
                            <FaFileAlt className="mr-1" size={12} />
                            View Report
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-blue-600">
                      No test results found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Report Popup */}
      {showReportPopup && selectedTest && (
        <TestReportPopup
          test={selectedTest}
          childDetails={{...childDetails, id: childId}}
          onClose={closeReportPopup}
          isCumulative={showCumulativeReport}
        />
      )}
    </div>
  );
};

export default TestResultsTable;