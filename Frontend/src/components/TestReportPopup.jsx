import React, { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { FaPrint, FaDownload, FaEnvelope, FaUser } from "react-icons/fa";
import logo from "../../public/logo.jpeg";
import testDataMap from "../Data/inference.json";
import axios from "axios";
import { backendURL } from "../definedURL.js";

const TestReportPopup = ({
  test,
  childDetails,
  onClose,
  isCumulative = false,
}) => {
  const [inference, setInference] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const tokenId = localStorage.getItem("access_token");
  const childId = localStorage.getItem("childId");
  useEffect(() => {
    if (isCumulative && test.allTests) {
      generateCumulativeInference();
    }
  }, [isCumulative, test]);

  const generateCumulativeInference = async () => {
    setIsLoading(true);
    try {
      const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);
      const recentTests = test.allTests.filter(
        (t) => new Date(t.created_at) > twentyMinutesAgo
      );

      if (recentTests.length === 0) {
        setInference("No recent test data available for analysis.");
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${backendURL}/generateInference`,
        { tests: recentTests, childId },
        {
          headers: { authorization: `Bearer ${tokenId}` },
        }
      );

      setInference(response.data.inference || "Could not generate inference.");
    } catch (error) {
      console.error("Error generating inference:", error);
      setInference("Failed to generate cumulative analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (!isNaN(date)) {
      return date.toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    return "Invalid Date";
  };

  const handlePrint = () => {
    const printContent = document.getElementById("report-content");
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContent.innerHTML;
    const style = document.createElement("style");
    style.innerHTML = `
      @page { size: auto; margin: 0mm; }
    `;
    document.head.appendChild(style);
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const generateBarcode = () => {
    return (
      <div className="text-center">
        <div className="font-mono text-sm mb-1">|||||||||||||||||||</div>
        <div className="text-xs">{childDetails.id || "000000"}</div>
      </div>
    );
  };

  // Check if score falls in difficulty range
  const shouldShowRemedies = () => {
    if (!test || !test.test_name) return false;

    const testData = testDataMap[test.test_name];
    if (!testData || !testData.scoreRange || test.score === undefined)
      return false;

    const [min, max] = testData.scoreRange.difficulty;
    return test.score >= min && test.score <= max;
  };

  // Check if score falls in strong range
  const isStrongScore = () => {
    if (!test || !test.test_name || !test.score) {
      console.log("Missing test data for strong score check");
      return false;
    }

    // Get test data from the inference.json
    const testData = testDataMap[test.test_name];
    if (!testData || !testData.scoreRange) {
      console.log(
        "No matching test data in inference.json for:",
        test.test_name
      );
      return false;
    }

    const [min, max] = testData.scoreRange.strong;
    const score = parseFloat(test.score);
    const isStrong = score >= min && score <= max;

    console.log(
      "Strong score check:",
      test.test_name,
      "Score:",
      score,
      "Range:",
      min,
      "-",
      max,
      "Result:",
      isStrong,
      "Has message:",
      !!testData.strongMessage
    );

    return isStrong;
  };

  // Get the test data for the current test
  const getCurrentTestData = () => {
    if (!test || !test.test_name) return null;
    return testDataMap[test.test_name] || null;
  };

  // Determines the test type from test name or test.type
  const getTestType = () => {
    if (!test) return null;

    if (test.type) {
      return test.type;
    }

    const name = test.test_name || "";

    if (name.includes("Schonell") || name.includes("Reading")) return "reading";
    if (name.includes("Visual Discrimination")) return "visual";
    if (name.includes("Sound Discrimination")) return "sound";
    if (name.includes("Grapheme") || name.includes("Phoneme")) return "phoneme";
    if (name.includes("Picture Recognition")) return "picture";
    if (name.includes("Auditory")) return "auditory";
    if (name.includes("Sequence Arrangement")) return "sequence";
    if (name.includes("Symbol Sequence")) return "symbol";
    if (name.includes("Sound Blending")) return "soundBlending";

    return "unknown";
  };

  const currentTestData = getCurrentTestData();
  const showRemedies = shouldShowRemedies();
  const testType = getTestType();

  // Renders the appropriate table for each test type
  const renderTestDetails = () => {
    if (!test) return null;

    switch (testType) {
      case "reading":
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-blue-200 p-2 text-left">Test</th>
                  <th className="border border-blue-200 p-2 text-center">
                    Continous Correct Words
                  </th>
                  <th className="border border-blue-200 p-2 text-center">
                    Incorrect Words
                  </th>
                  <th className="border border-blue-200 p-2 text-center">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-blue-200 p-2 font-semibold">
                    {test.test_name}
                  </td>
                  {/* Correct Words Column */}
                  <td className="border border-blue-200 p-4 text-left align-top w-1/2 whitespace-pre-wrap">
                    <div>
                      {test.correct_words ? (
                        <ul className="list-disc list-inside space-y-1 text-gray-800">
                          {(typeof test.correct_words === "string"
                            ? JSON.parse(test.correct_words)
                            : test.correct_words
                          ).map((word, idx) => (
                            <li key={idx}>{word}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">No correct words</p>
                      )}
                    </div>
                  </td>

                  {/* Incorrect Words Column */}
                  <td className="border border-blue-200 p-4 text-left align-top w-1/2 whitespace-pre-wrap">
                    <div>
                      {test.incorrect_words ? (
                        <ul className="list-disc list-inside space-y-1 text-gray-800">
                          {(typeof test.incorrect_words === "string"
                            ? JSON.parse(test.incorrect_words)
                            : test.incorrect_words
                          ).map((item, idx) => (
                            <li key={idx}>
                              {item.word}{" "}
                              <span className="text-gray-500 text-sm">
                                (Pos {item.position})
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">
                          No incorrect words
                        </p>
                      )}
                    </div>
                  </td>

                  <td className="border border-blue-200 p-2 text-center">
                    {test.score || "-"}
                  </td>
                </tr>
              </tbody>
            </table>
            {test.reading_age && (
              <div className="mt-3 bg-blue-50 p-2 rounded text-sm">
                <span className="font-semibold">Reading Age:</span>{" "}
                {test.reading_age} years (Child's Age: {childDetails.age} years)
              </div>
            )}
          </div>
        );

      case "visual":
        return (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 p-2 text-left">Test</th>
                <th className="border border-blue-200 p-2 text-center">
                  Selected Options
                </th>
                <th className="border border-blue-200 p-2 text-center">
                  Correct Options
                </th>
                <th className="border border-blue-200 p-2 text-center">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-blue-200 p-2 font-semibold">
                  {test.test_name}
                </td>
                <td className="border border-blue-200 p-2 text-left align-top">
                  {Array.isArray(test.options)
                    ? test.options.map((item, index) => (
                        <div key={index}>
                          {index + 1}. {item || "-"}
                        </div>
                      ))
                    : "-"}
                </td>

                <td className="border border-blue-200 p-2 text-left align-top">
                  {[
                    "o",
                    "f",
                    "b",
                    "m",
                    "no",
                    "cat",
                    "girl",
                    "little",
                    "help",
                    "fast",
                  ].map((item, index) => (
                    <div key={index}>
                      {index + 1}. {item}
                    </div>
                  ))}
                </td>

                <td className="border border-blue-200 p-2 text-center">
                  {test.score || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        );

      case "sound":
        return (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 p-2 text-left">Test</th>
                <th className="border border-blue-200 p-2 text-center">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-blue-200 p-2 font-semibold">
                  {test.test_name}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.score || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        );

      case "phoneme":
        return (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 p-2 text-left">Letter</th>
                <th className="border border-blue-200 p-2 text-center">
                  Spoken
                </th>
                <th className="border border-blue-200 p-2 text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {test.results && typeof test.results === "string" ? (
                JSON.parse(test.results).map((item, index) => (
                  <tr key={index}>
                    <td className="border border-blue-200 p-2">
                      {item.letter}
                    </td>
                    <td className="border border-blue-200 p-2 text-center">
                      {item.spoken ? "Yes" : "No"}
                    </td>
                    <td className="border border-blue-200 p-2 text-center">
                      {item.status}
                    </td>
                  </tr>
                ))
              ) : test.results && Array.isArray(test.results) ? (
                test.results.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-blue-200 p-2">
                      {item.letter}
                    </td>
                    <td className="border border-blue-200 p-2 text-center">
                      {item.spoken ? "Yes" : "No"}
                    </td>
                    <td className="border border-blue-200 p-2 text-center">
                      {item.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    className="border border-blue-200 p-2 text-center"
                  >
                    No results available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        );

      case "picture":
        return (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 p-2 text-left">Test</th>
                <th className="border border-blue-200 p-2 text-center">
                  Responses
                </th>
                <th className="border border-blue-200 p-2 text-center">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-blue-200 p-2 font-semibold text-left align-top">
                  {test.test_name}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {/* Handle responses */}
                  {Array.isArray(test.responses) ? (
                    <div className="space-y-2">
                      {test.responses.map((response, index) => (
                        <div
                          key={index}
                          className="p-2 bg-blue-50 rounded-md shadow-sm border border-blue-200"
                        >
                          <p className="text-sm">
                            <span className="font-semibold">
                              Question {index + 1}:
                            </span>
                          </p>
                          {response.image && (
                            <p className="text-sm">
                              <span className="font-semibold">
                                Your Answer:
                              </span>{" "}
                              {response.userAnswer || "N/A"}
                            </p>
                          )}
                          {response.feedback && (
                            <p className="text-sm">
                              <span className="font-semibold">
                                Correct Answer:
                              </span>{" "}
                              {response.correctAnswer || "N/A"}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {test.responses || "No responses available"}
                    </p>
                  )}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.score || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        );

      case "auditory":
        return (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 p-2 text-left">Test</th>
                <th className="border border-blue-200 p-2 text-center">
                  Forward Correct
                </th>
                <th className="border border-blue-200 p-2 text-center">
                  Reverse Correct
                </th>
                <th className="border border-blue-200 p-2 text-center">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-blue-200 p-2 font-semibold">
                  {test.test_name}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.forward_correct !== undefined
                    ? test.forward_correct
                    : "-"}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.reverse_correct !== undefined
                    ? test.reverse_correct
                    : "-"}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.score || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        );

      case "sequence":
        return (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 p-2 text-left">Test</th>
                <th className="border border-blue-200 p-2 text-center">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-blue-200 p-2 font-semibold">
                  {test.test_name}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.score || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        );

      case "symbol":
      case "soundBlending":
        return (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 p-2 text-left">Test</th>
                <th className="border border-blue-200 p-2 text-center">
                  Difficulty
                </th>
                <th className="border border-blue-200 p-2 text-center">
                  Level
                </th>
                <th className="border border-blue-200 p-2 text-center">
                  Total Rounds
                </th>
                <th className="border border-blue-200 p-2 text-center">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-blue-200 p-2 font-semibold">
                  {test.test_name}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.difficulty || "-"}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.level || "-"}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.total_rounds || "-"}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.score || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        );

      default:
        return (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="border border-blue-200 p-2 text-left">Test</th>
                <th className="border border-blue-200 p-2 text-center">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-blue-200 p-2 font-semibold">
                  {test.test_name || "Assessment"}
                </td>
                <td className="border border-blue-200 p-2 text-center">
                  {test.score || "-"}
                </td>
              </tr>
            </tbody>
          </table>
        );
    }
  };

  // Renders a cumulative report with all tests
  const renderCumulativeReport = () => {
    if (!test || !test.allTests || !Array.isArray(test.allTests)) return null;

    return (
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-50">
            <th className="border border-blue-200 p-2 text-left">Test Name</th>
            <th className="border border-blue-200 p-2 text-center">Date</th>
            <th className="border border-blue-200 p-2 text-center">Score</th>
          </tr>
        </thead>
        <tbody>
          {test.allTests.filter((singleTest) => {
            if (!singleTest.created_at) return false;
            const testTime = new Date(singleTest.created_at).getTime();
            const twentyMinutesAgo = Date.now() - 20 * 60 * 1000;
            return testTime >= twentyMinutesAgo;
          }).length === 0 ? (
            <tr>
              <td
                colSpan="3"
                className="border border-blue-200 p-2 text-center text-gray-500"
              >
                No tests taken recently
              </td>
            </tr>
          ) : (
            test.allTests
              .filter((singleTest) => {
                if (!singleTest.created_at) return false;
                const testTime = new Date(singleTest.created_at).getTime();
                const twentyMinutesAgo = Date.now() - 20 * 60 * 1000;
                return testTime >= twentyMinutesAgo;
              })
              .map((singleTest, index) => (
                <tr key={index}>
                  <td className="border border-blue-200 p-2 font-semibold">
                    {singleTest.test_name || `Test ${index + 1}`}
                  </td>
                  <td className="border border-blue-200 p-2 text-center">
                    {singleTest.created_at
                      ? formatDateTime(singleTest.created_at)
                      : "-"}
                  </td>
                  <td className="border border-blue-200 p-2 text-center">
                    {singleTest.score || "-"}
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="report-content">
          {/* Header with report institution */}
          <div className="bg-blue-800 p-6 print:bg-blue-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-12 h-12 mr-4">
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-white text-2xl font-bold">
                    {isCumulative
                      ? "Comprehensive Assessment Report"
                      : "Learning Assessment Report"}
                  </h1>
                  <p className="text-blue-200 text-sm">
                    {isCumulative
                      ? "Multi-Domain Evaluation Summary"
                      : "Educational Evaluation"}
                  </p>
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-sm">
                  Reg. No.: {childDetails.id || "XXXX00000XX"}
                </p>
                <p className="text-sm">Contact: support@jiveesha.com</p>
                <p className="text-sm">https://www.jiveesha.com</p>
              </div>
            </div>
          </div>

          {/* Patient information section */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4 p-6">
              {/* Left column - Patient details */}
              <div className="col-span-2">
                <h2 className="text-xl font-bold text-blue-800 mb-3">
                  {childDetails.name || "Student Name"}
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex">
                    <span className="font-semibold mr-2">Age / Gender:</span>
                    <span>
                      {childDetails.age || "-"} YRS /{" "}
                      {childDetails.gender || "M"}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold mr-2">ID:</span>
                    <span>{childDetails.id || "Not available"}</span>
                  </div>
                </div>
              </div>

              {/* Right column - Report details */}
              <div className="col-span-1 border-l border-gray-200 pl-4">
                {generateBarcode()}
                <div className="mt-2 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">Registered on:</span>
                    <span>
                      {childDetails.joined_date
                        ? formatDateTime(childDetails.joined_date)
                        : "-"}
                    </span>
                  </div>
                  {test && (
                    <>
                      <div className="flex justify-between">
                        <span className="font-semibold">Test date:</span>
                        <span>{formatDateTime(test.created_at)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Report date:</span>
                        <span>{formatDateTime(test.created_at)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="p-6">
            <h2 className="text-xl font-bold uppercase text-center mb-4 text-blue-800 border-b pb-2">
              {test?.test_name || "Assessment Results"}
            </h2>

            {test?.is_cumulative
              ? renderCumulativeReport()
              : renderTestDetails()}

            {/* AI-Generated Cumulative Inference */}
            {isCumulative && (
              <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">AI-Powered Analysis:</h3>
                {isLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm mb-2">
                      Based on recent assessments completed:
                    </p>
                    <div className="bg-white p-3 rounded border border-blue-200">
                      <p className="whitespace-pre-line">{inference}</p>
                    </div>
                    <p className="text-xs mt-2 text-gray-600 italic">
                      This analysis is generated by AI and should be reviewed by
                      a qualified professional.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Clinical Notes */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Assessment Feedback:</h3>
              <p className="text-sm">
                {isStrongScore() &&
                currentTestData &&
                currentTestData.strongMessage ? (
                  <>
                    <span className="text-green-600 font-bold">
                      Excellent!{" "}
                    </span>
                    {currentTestData.strongMessage}
                  </>
                ) : showRemedies && currentTestData ? (
                  <>
                    <span className="text-amber-600 font-bold">
                      Areas for Improvement:{" "}
                    </span>
                    {currentTestData.description}
                  </>
                ) : isCumulative ? (
                  "This comprehensive assessment evaluates multiple cognitive domains relevant to the student's learning profile. Results should be considered alongside overall educational performance."
                ) : (
                  "This assessment evaluates cognitive abilities relevant to the student's learning profile. Results should be considered alongside overall educational performance."
                )}
              </p>

              {/* Show remedies only if score is in difficulty range */}
              {showRemedies && currentTestData && (
                <div className="mt-4">
                  <h4 className="font-semibold">Recommended Interventions:</h4>
                  <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                    {currentTestData.remedies.map((remedy, index) => (
                      <li key={index}>{remedy}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* [Rest of your existing interpretation sections remain unchanged...] */}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
              <p>Page 1 of 1</p>
              <p className="mt-1">
                This report is generated by the Jiveesha Assessment Platform
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="bg-gray-100 p-4 print:hidden flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Close
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaPrint className="mr-1" /> Print
            </button>
            <button className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
              <FaDownload className="mr-1" /> Download
            </button>
            <button className="flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">
              <FaEnvelope className="mr-1" /> Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestReportPopup;
