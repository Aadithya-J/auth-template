import React from "react";
import Popup from "reactjs-popup";
import { FaPrint, FaDownload, FaEnvelope, FaUser } from 'react-icons/fa';
import logo from '../../public/logo.jpeg';

const TestReportPopup = ({ test, childDetails, onClose }) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (!isNaN(date)) {
      return date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    return "Invalid Date";
  };

  const handlePrint = () => {
    const printContent = document.getElementById('report-content');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  const generateBarcode = () => {
    return (
      <div className="text-center">
        <div className="font-mono text-sm mb-1">|||||||||||||||||||</div>
        <div className="text-xs">{childDetails.id || '000000'}</div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div id="report-content">
          {/* Header with report institution */}
          <div className="bg-blue-800 p-6 print:bg-blue-800">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-12 h-12 mr-4">
                  <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-white text-2xl font-bold">Learning Assessment Report</h1>
                  <p className="text-blue-200 text-sm">Comprehensive Educational Evaluation</p>
                </div>
              </div>
              <div className="text-right text-white">
                <p className="text-sm">Reg. No.: {childDetails.id || 'XXXX00000XX'}</p>
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
                <h2 className="text-xl font-bold text-blue-800 mb-3">{childDetails.name || "Student Name"}</h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex">
                    <span className="font-semibold mr-2">Age / Gender:</span>
                    <span>{childDetails.age || "-"} YRS / {childDetails.gender || "M"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold mr-2">ID:</span>
                    <span>{childDetails.id || "Not available"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold mr-2">Referred by:</span>
                    <span>{childDetails.referred_by || "Self"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold mr-2">Joined:</span>
                    <span>{childDetails.joined_date ? new Date(childDetails.joined_date).toLocaleDateString() : "Not available"}</span>
                  </div>
                </div>
              </div>

              {/* Right column - Report details */}
              <div className="col-span-1 border-l border-gray-200 pl-4">
                {generateBarcode()}
                <div className="mt-2 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">Registered on:</span>
                    <span>{childDetails.joined_date ? formatDateTime(childDetails.joined_date) : "-"}</span>
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
            
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  <th className="border border-blue-200 p-2 text-left">TEST</th>
                  <th className="border border-blue-200 p-2 text-center">VALUE</th>
                  <th className="border border-blue-200 p-2 text-center">UNIT</th>
                  <th className="border border-blue-200 p-2 text-center">REFERENCE</th>
                </tr>
              </thead>
              <tbody>
                {/* Reading test specific display */}
                {test?.test_name?.includes("Reading") && (
                  <>
                    <tr>
                      <td className="border border-blue-200 p-2 font-semibold">SCORE</td>
                      <td className="border border-blue-200 p-2 text-center">{test.score || "-"}</td>
                      <td className="border border-blue-200 p-2 text-center">points</td>
                      <td className="border border-blue-200 p-2 text-center">Age appropriate</td>
                    </tr>
                    {test.reading_age && (
                      <tr>
                        <td className="border border-blue-200 p-2 font-semibold">READING AGE</td>
                        <td className="border border-blue-200 p-2 text-center">{test.reading_age}</td>
                        <td className="border border-blue-200 p-2 text-center">years</td>
                        <td className="border border-blue-200 p-2 text-center">{childDetails.age} years</td>
                      </tr>
                    )}
                  </>
                )}

                {/* Visual test specific display */}
                {test?.test_name?.includes("Visual") && (
                  <tr>
                    <td className="border border-blue-200 p-2 font-semibold">VISUAL ASSESSMENT</td>
                    <td className="border border-blue-200 p-2 text-center">{test.options || "-"}</td>
                    <td className="border border-blue-200 p-2 text-center">score</td>
                    <td className="border border-blue-200 p-2 text-center">Normal: 4-10</td>
                  </tr>
                )}

                {/* Sound test specific display */}
                {test?.test_name?.includes("Sound") && (
                  <tr>
                    <td className="border border-blue-200 p-2 font-semibold">AUDITORY PERCEPTION</td>
                    <td className="border border-blue-200 p-2 text-center">{test.score || "-"}</td>
                    <td className="border border-blue-200 p-2 text-center">score</td>
                    <td className="border border-blue-200 p-2 text-center">Age appropriate</td>
                  </tr>
                )}

                {/* Auditory test specific display */}
                {test?.test_name?.includes("Auditory") && (
                  <>
                    <tr>
                      <td className="border border-blue-200 p-2 font-semibold">AUDITORY MEMORY</td>
                      <td className="border border-blue-200 p-2 text-center">{test.score || "-"}</td>
                      <td className="border border-blue-200 p-2 text-center">score</td>
                      <td className="border border-blue-200 p-2 text-center">Age appropriate</td>
                    </tr>
                    {test.forward_correct !== undefined && (
                      <tr>
                        <td className="border border-blue-200 p-2 pl-8">FORWARD SEQUENCE</td>
                        <td className="border border-blue-200 p-2 text-center">{test.forward_correct}</td>
                        <td className="border border-blue-200 p-2 text-center">correct</td>
                        <td className="border border-blue-200 p-2 text-center">-</td>
                      </tr>
                    )}
                    {test.reverse_correct !== undefined && (
                      <tr>
                        <td className="border border-blue-200 p-2 pl-8">REVERSE SEQUENCE</td>
                        <td className="border border-blue-200 p-2 text-center">{test.reverse_correct}</td>
                        <td className="border border-blue-200 p-2 text-center">correct</td>
                        <td className="border border-blue-200 p-2 text-center">-</td>
                      </tr>
                    )}
                  </>
                )}

                {/* Generic fallback for any other test types */}
                {test && !test.test_name?.includes("Reading") && 
                 !test.test_name?.includes("Visual") && 
                 !test.test_name?.includes("Sound") && 
                 !test.test_name?.includes("Auditory") && (
                  <tr>
                    <td className="border border-blue-200 p-2 font-semibold">{test.test_name?.toUpperCase() || "ASSESSMENT"}</td>
                    <td className="border border-blue-200 p-2 text-center">{test.score || "-"}</td>
                    <td className="border border-blue-200 p-2 text-center">score</td>
                    <td className="border border-blue-200 p-2 text-center">Age appropriate</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Clinical Notes */}
            <div className="mt-6 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Inference:</h3>
              <p className="text-sm">
                This assessment evaluates cognitive and educational abilities relevant to the student&apos;s learning profile.
                Results should be interpreted in the context of the student&apos;s overall educational performance and development.
              </p>
              
              {test?.test_name?.includes("Reading") && (
                <div className="mt-3">
                  <h4 className="font-semibold">Reading Assessment Interpretation:</h4>
                  <p className="text-sm mt-1">
                    The reading age indicates the student&apos;s functional reading level compared to age norms. 
                    {test.reading_age && childDetails.age && 
                      parseFloat(test.reading_age) < parseFloat(childDetails.age) 
                      ? " The reading age is below the chronological age, suggesting potential areas for targeted intervention." 
                      : " The reading age aligns with or exceeds chronological age, indicating appropriate reading development."}
                  </p>
                </div>
              )}

              {test?.test_name?.includes("Visual") && (
                <div className="mt-3">
                  <h4 className="font-semibold">Visual Processing Interpretation:</h4>
                  <p className="text-sm mt-1">
                    Visual processing skills are essential for reading, writing and learning. 
                    Results indicate the student&apos;s ability to process visual information efficiently.
                  </p>
                </div>
              )}

              {test?.test_name?.includes("Auditory") && (
                <div className="mt-3">
                  <h4 className="font-semibold">Auditory Processing Interpretation:</h4>
                  <p className="text-sm mt-1">
                    Auditory processing abilities are critical for language development and classroom learning.
                    Forward and reverse sequence tasks measure working memory and cognitive flexibility.
                  </p>
                </div>
              )}
            </div>

            {/* Signature Section */}
            {/* <div className="mt-8 grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="h-12 border-b border-gray-300 mb-1"></div>
                <p className="text-sm font-semibold">Examiner Signature</p>
              </div>
              <div className="text-center">
                <div className="h-12 border-b border-gray-300 mb-1"></div>
                <p className="text-sm font-semibold">Director, Educational Assessment</p>
              </div>
            </div> */}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
              <p>Page 1 of 1</p>
              <p className="mt-1">This report is generated by the Jiveesha Assessment Platform</p>
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
            <button onClick={handlePrint} className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
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