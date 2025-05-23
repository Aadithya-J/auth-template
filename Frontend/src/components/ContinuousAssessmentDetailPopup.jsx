import React, { useState, useEffect } from "react"; // Import useState and useEffect
import logo from "../assets/daira-logo.png"; // Adjust path if necessary
import { useLanguage } from "../contexts/LanguageContext"; // Assuming you have this for 't'
import { backendURL } from "../definedURL"; // Adjust path if necessary
import { FaPrint } from "react-icons/fa"; // Import FaPrint

const ContinuousAssessmentDetailPopup = ({
  assessment, // The specific continuous assessment object
  childDetails,
  onClose,
}) => {
  const { t } = useLanguage();
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const childId = childDetails?.id || localStorage.getItem("childId");

  useEffect(() => {
    // Just a brief artificial loading state to prevent UI flicker
    const timer = setTimeout(() => {
      setIsLoadingAnalysis(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [assessment]);

  if (!assessment) {
    console.log("Assessment prop is null, returning null from ContinuousAssessmentDetailPopup");
    return null;
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return `${t("N/A")}`;
    const date = new Date(dateString);
    if (!isNaN(date)) {
      return date.toLocaleString("en-US", { // Match TestReportPopup format
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
    return t("Invalid Date");
  };

  const handlePrint = () => {
    const printContent = document.getElementById(
      "continuous-assessment-detail-content"
    );
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    const style = document.createElement("style");
    style.innerHTML = `
      @page { size: auto; margin: 0mm; }
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    `;
    document.head.appendChild(style);
    window.print();
    document.body.innerHTML = originalContents;
    // Restore event listeners or reload if necessary
    window.location.reload(); // Or a more targeted re-render
  };

  const generateBarcode = () => { // Added from TestReportPopup for consistency if needed
    return (
      <div className="text-center">
        <div className="font-mono text-sm mb-1">|||||||||||||||||||</div>
        <div className="text-xs">{childDetails?.id || "000000"}</div>
      </div>
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
        <div id="continuous-assessment-detail-content">
          {/* Header */}
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
                    {t("Continuous Assessment Details")}
                  </h1>
                  <p className="text-blue-200 text-sm">
                    {t("Individual Assessment Record")}
                  </p>
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-sm">
                  {t("Reg. No.")}: {childDetails?.id || "XXXX00000XX"}
                </p>
                <p className="text-sm">{t("Contact")}: support@jiveesha.com</p>
                <p className="text-sm">https://www.jiveesha.com</p>
              </div>
            </div>
          </div>

          {/* Child and Assessment Info */}
          <div className="border-b border-gray-200">
            <div className="grid grid-cols-3 gap-4 p-6">
              <div className="col-span-2">
                <h2 className="text-xl font-bold text-blue-800 mb-3">
                  {childDetails?.name || t("Student Name")}
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex">
                    <span className="font-semibold mr-2">{t("Age / Gender")}:</span>
                    <span>
                      {childDetails?.age || "-"} {t("YRS")} /{" "}
                      {childDetails?.gender || t("N/A")}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold mr-2">{t("ID")}:</span>
                    <span>{childDetails?.id || t("Not available")}</span>
                  </div>
                </div>
              </div>
              <div className="col-span-1 border-l border-gray-200 pl-4">
                {generateBarcode()}
                <div className="mt-2 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">{t("Registered on")}:</span>
                    <span>
                      {childDetails?.joined_date
                        ? formatDateTime(childDetails.joined_date)
                        : t("N/A")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">{t("Assessment Date")}:</span>
                    <span>{formatDateTime(assessment.created_at)}</span>
                  </div>
                   <div className="flex justify-between">
                    <span className="font-semibold">{t("Total Score")}:</span>
                    <span className="font-bold">
                      {assessment.total_score !== undefined
                        ? assessment.total_score
                        : t("N/A")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Tests Table & Analysis */}
          <div className="p-6">
            <h2 className="text-xl font-bold uppercase text-center mb-4 text-blue-800 border-b pb-2">
              {t("Sub-Test Results")}
            </h2>
            {assessment.test_results && assessment.test_results.length > 0 ? (
              <table className="w-full border-collapse mb-6">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="border border-blue-200 p-2 text-left">
                      {t("Sub-Test Name")}
                    </th>
                    <th className="border border-blue-200 p-2 text-center">
                      {t("Score")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assessment.test_results.map((subTest, index) => (
                    <tr key={index}>
                      <td className="border border-blue-200 p-2 font-semibold">
                        {t(subTest.test_name) || `${t("Sub-Test")} ${index + 1}`}
                      </td>
                      <td className="border border-blue-200 p-2 text-center">
                        {subTest.score !== undefined ? subTest.score : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 mb-6">
                {t("No sub-test data available for this assessment.")}
              </p>
            )}

            {/* AI-Generated Analysis Section */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-blue-800">
                {t("AI-Powered Analysis")}:
              </h3>
              {isLoadingAnalysis ? (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  <div className="bg-white p-3 rounded border border-blue-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {assessment.analysis || t("Analysis not available for this assessment.")}
                    </p>
                  </div>
                  <p className="text-xs mt-2 text-gray-600 italic">
                    {t("This analysis is generated by AI and should be reviewed by a qualified professional.")}
                  </p>
                </>
              )}
            </div>
            {/* Footer within content for print */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
              <p>{t("Page 1 of 1")}</p>
              <p className="mt-1">
                {t("This report is generated by the Jiveesha Assessment Platform")}
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
            {t("Close")}
          </button>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <FaPrint className="mr-1" /> {t("Print Report")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContinuousAssessmentDetailPopup;