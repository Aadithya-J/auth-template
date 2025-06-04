import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import TestReportPopup from "../components/TestReportPopup"; // Existing popup
import ContinuousAssessmentDetailPopup from "../components/ContinuousAssessmentDetailPopup"; // New popup
import { useLanguage } from "../contexts/LanguageContext";
import {
  FaCalendarAlt,
  FaChartLine,
  FaEnvelope,
  FaIdCard,
  FaPhone,
  FaUser,
} from "react-icons/fa";
import { backendURL } from "../definedURL";

const TestResultsTable = () => {
  const [data, setData] = useState([]);
  const [childDetails, setChildDetails] = useState({});
  const [visualTestData, setVisualTestData] = useState([]);
  const [soundTestData, setSoundTestData] = useState([]);
  const [auditoryTestData, setAuditoryTestData] = useState([]);
  const [graphemeTestData, setGraphemeTestData] = useState([]);
  const [pictureTestData, setPictureTestData] = useState([]);
  const [sequenceTestData, setSequenceTestData] = useState([]);
  const [soundBlendingTestData, setSoundBlendingTestData] = useState([]);
  const [symbolSequenceTestData, setSymbolSequenceTestData] = useState([]);
  const [vocalTestData, setVocalTestData] = useState([]);
  const [continuousAssessmentData, setContinuousAssessmentData] = useState([]);

  const [selectedTestForReport, setSelectedTestForReport] = useState(null); // For TestReportPopup
  const [showReportPopup, setShowReportPopup] = useState(false);

  const [selectedContinuousAssessment, setSelectedContinuousAssessment] =
    useState(null); // For new popup
  const [showContinuousDetailPopup, setShowContinuousDetailPopup] =
    useState(false);

  const [userDetails, setUserDetails] = useState({});
  const [showCumulativeReport, setShowCumulativeReport] = useState(false); // For TestReportPopup's cumulative view
  const [currentView, setCurrentView] = useState("all"); // 'all', 'individual', 'continuous'

  const childId = localStorage.getItem("childId");
  const tokenId = localStorage.getItem("access_token");
  const { t } = useLanguage();

  useEffect(() => {
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

    const fetchgraphemeTestData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/getGraphemeByChild/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        setGraphemeTestData(response.data.tests);
      } catch (error) {
        console.error("Error fetching grapheme test data:", error);
      }
    };

    const fetchPictureTestData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/getPictureByChild/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        setPictureTestData(response.data.tests);
      } catch (error) {
        console.error("Error fetching picture test data:", error);
      }
    };

    const fetchSequenceTestData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/getSequenceTestsByUser/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        setSequenceTestData(response.data.tests);
      } catch (error) {
        console.error("Error fetching sequence test data:", error);
      }
    };

    const fetchSoundBlendingTestData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/getSoundBlendingByChild/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        setSoundBlendingTestData(response.data.tests);
      } catch (error) {
        console.error("Error fetching sound blending test data:", error);
      }
    };

    const fetchSymbolSequenceTestData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/symbolsequenceresults/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        setSymbolSequenceTestData(response.data.tests);
      } catch (error) {
        console.error("Error fetching symbol sequence test data:", error);
      }
    };

    const fetchVocalTestData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/vocabulary/results/child/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        setVocalTestData(response.data.tests);
      } catch (error) {
        console.error("Error fetching vocal test data:", error);
      }
    };

    const fetchContinuousAssessmentData = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(
          `${backendURL}/continuous-assessment/getByChildId/${childId}`,
          {
            headers: { authorization: `Bearer ${tokenId}` },
          }
        );
        // console.log("Continuous Assessment Data:", response.data);
        setContinuousAssessmentData(response.data.data || []);
      } catch (error) {
        console.error("Error fetching continuous assessment data:", error);
      }
    };

    fetchData();
    fetchVisualTestData();
    fetchSoundTestData();
    fetchAuditoryTestData();
    fetchgraphemeTestData();
    fetchPictureTestData();
    fetchSequenceTestData();
    fetchSoundBlendingTestData();
    fetchSymbolSequenceTestData();
    fetchVocalTestData();
    fetchContinuousAssessmentData();
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
  }, [childId, tokenId, backendURL]);

  const formatDateTime = (dateString) => {
    if (!dateString) return { datePart: "N/A", timePart: "N/A" };
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timePart = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return { datePart, timePart };
  };

  const handleViewReport = (test) => {
    if (test.type === "continuous") {
      setSelectedContinuousAssessment(test); // test object already has test_results, total_score etc.
      setShowContinuousDetailPopup(true);
      setShowReportPopup(false); // Ensure other popup is closed
      setShowCumulativeReport(false);
    } else {
      // For other individual tests, use the existing TestReportPopup
      setSelectedTestForReport({
        ...test,
        report_view_type: "single_test_detail",
      });
      setShowReportPopup(true);
      setShowContinuousDetailPopup(false); // Ensure other popup is closed
      setShowCumulativeReport(false);
    }
  };

  const handleViewCumulativeReport = () => {
    // This is for the main, overall cumulative report using TestReportPopup
    setSelectedTestForReport({
      test_name: "Cumulative Assessment Report",
      created_at: new Date().toISOString(),
      report_view_type: "main_cumulative",
      allTests: allTests, // Pass the grand list of all tests (unfiltered)
    });
    setShowCumulativeReport(true); // This flag is used by TestReportPopup for its 'isCumulative' prop
    setShowReportPopup(true);
    setShowContinuousDetailPopup(false); // Ensure other popup is closed
  };

  const closeReportPopup = () => {
    setShowReportPopup(false);
    setSelectedTestForReport(null);
    setShowCumulativeReport(false); // Reset this flag as well
  };

  const closeContinuousDetailPopup = () => {
    setShowContinuousDetailPopup(false);
    setSelectedContinuousAssessment(null);
  };

  const allTests = useMemo(
    () => [
      ...data.map((test) => ({
        ...test,
        type: "reading",
        test_name: test.test_name || "Reading Proficiency Test",
      })),
      ...visualTestData.map((test) => ({
        ...test,
        type: "visual",
        test_name: test.test_name || "Visual Discrimination",
      })),
      ...soundTestData.map((test) => ({
        ...test,
        type: "sound",
        test_name: test.test_name || "Sound Discrimination",
      })),
      ...auditoryTestData.map((test) => ({
        ...test,
        type: "auditory",
        test_name: test.test_name || "Auditory Memory",
      })),
      ...graphemeTestData.map((test) => ({
        ...test,
        type: "grapheme",
        test_name: test.test_name || "Grapheme Matching",
      })),
      ...pictureTestData.map((test) => ({
        ...test,
        type: "picture",
        test_name: test.test_name || "Picture Recognition",
      })),
      ...sequenceTestData.map((test) => ({
        ...test,
        type: "sequence",
        test_name: test.test_name || "Sequence Arrangement",
      })),
      ...soundBlendingTestData.map((test) => ({
        ...test,
        type: "soundBlending",
        test_name: test.test_name || "Sound Blending",
      })),
      ...symbolSequenceTestData.map((test) => ({
        ...test,
        type: "symbol",
        test_name: test.test_name || "Symbol Sequence",
      })),
      ...vocalTestData.map((test) => ({
        ...test,
        type: "vocabulary",
        test_name: test.test_name || "Vocabulary Scale Test",
      })),
      ...(Array.isArray(continuousAssessmentData)
        ? continuousAssessmentData.map((test) => ({
            ...test,
            type: "continuous",
            test_name: "Continuous Assessment", // Name for the table
            score: test.total_score, // Score for the table (overall score of the continuous assessment)
          }))
        : []),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [
      data,
      visualTestData,
      soundTestData,
      auditoryTestData,
      graphemeTestData,
      pictureTestData,
      sequenceTestData,
      soundBlendingTestData,
      symbolSequenceTestData,
      vocalTestData,
      continuousAssessmentData,
    ]
  );

  const displayedTests = useMemo(() => {
    if (currentView === "continuous") {
      return allTests.filter((test) => test.type === "continuous");
    } else if (currentView === "individual") {
      return allTests.filter((test) => test.type !== "continuous");
    }
    return allTests; // 'all' view
  }, [allTests, currentView]);

  return (
    <div className="h-screen flex flex-col  h-full bg-gradient-to-b from-blue-50/80 to-white p-4 md:p-8 overflow-auto">
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
                  {childDetails.name}
                </h1>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                  {userDetails.role && (
                    <div className="flex items-center">
                      <FaIdCard className="mr-2" />
                      <span className="font-medium">{t("role")}</span>
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
                      <span>
                        {t("memberSince")}{" "}
                        {new Date(userDetails.since).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Student Info Banner */}
                <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-8 bg-white/10 p-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-blue-100">
                      {t("viewingResultsFor")}
                    </span>
                    <span className="ml-2 font-semibold">
                      {childDetails.name || "Student"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-100">{t("studentId")}</span>
                    <span className="ml-2 font-semibold">
                      {childId || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-100">{t("studentAge")}</span>
                    <span className="ml-2 font-semibold">
                      {childDetails.age || "N/A"} {t("years")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-100">{t("testsCount")}</span>
                    <span className="ml-2 font-semibold">
                      {allTests.length} {/* This shows total tests available */}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-blue-100 bg-blue-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <h2 className="font-semibold text-blue-700">
                {currentView === "all" && t("allTestResults")}
                {currentView === "individual" && t("individualTestResults")}
                {currentView === "continuous" && t("continuousAssessmentResults")}
              </h2>
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                {displayedTests.length}
              </span>
            </div>

            {/* View Toggle Buttons */}
            <div className="flex flex-wrap gap-2 my-2 md:my-0">
              <button
                onClick={() => setCurrentView("all")}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  currentView === "all"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("allTestsView")}
              </button>
              <button
                onClick={() => setCurrentView("individual")}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  currentView === "individual"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("individualTestsView")}
              </button>
              <button
                onClick={() => setCurrentView("continuous")}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  currentView === "continuous"
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("continuousAssessmentsView")}
              </button>
            </div>

            {/* Cumulative Report Button */}
            {allTests.length > 0 && (
              <button
                onClick={handleViewCumulativeReport}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-md shadow-sm transition-all duration-200 w-full md:w-auto justify-center"
              >
                <FaChartLine className="text-blue-200" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{t("cumulativeReport")}</span>
                  <span className="text-xs text-blue-200">
                    {t("viewComprehensiveAssessment")}
                  </span>
                </div>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    {t("testName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    {t("dateTaken")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    {t("timeTaken")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                    {t("score")}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-white uppercase tracking-wider">
                    {t("actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {allTests.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      {t("noTestResultsFoundAtAll")}
                    </td>
                  </tr>
                ) : displayedTests.length > 0 ? (
                  displayedTests.map((test, index) => {
                    const { datePart, timePart } = formatDateTime(
                      test.created_at
                    );
                    const displayName =
                      test.test_name === "Schonell Test"
                        ? "Reading Proficiency Test"
                        : t(test.test_name) || test.test_name; // Apply translation here
                    return (
                      <tr
                        key={`${test.type}-${test.id || test._id || index}`}
                        className="hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-blue-800 font-medium">
                          {displayName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {datePart}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {timePart}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {test.score !== undefined
                            ? test.score
                            : test.total_score !== undefined
                            ? test.total_score
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewReport(test)}
                            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200"
                          >
                            {t("viewReport")}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      {t("noTestResultsFoundForFilter")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Conditional rendering for popups */}
      {showReportPopup && selectedTestForReport && (
        <TestReportPopup
          test={selectedTestForReport}
          childDetails={{ ...childDetails, id: childId }}
          onClose={closeReportPopup}
          isCumulative={showCumulativeReport} // This controls if TestReportPopup shows cumulative view
        />
      )}

      {showContinuousDetailPopup && selectedContinuousAssessment && (
        <ContinuousAssessmentDetailPopup
          assessment={selectedContinuousAssessment}
          childDetails={{ ...childDetails, id: childId }}
          onClose={closeContinuousDetailPopup}
        />
      )}
    </div>
  );
};

export default TestResultsTable;
