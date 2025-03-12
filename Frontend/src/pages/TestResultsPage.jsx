import React, { useState, useEffect } from "react";
import axios from "axios";
import PopupWindow from "../components/PopupWindow.jsx";
import PopupWindowVisual from "../components/PopupWindowVisual.jsx";
import DropDown from "../components/DropDown.jsx";
import { backendURL } from "../definedURL.js";
import img1 from "../assets/grid.jpg";

const TestResultsTable = () => {
  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [childDetails, setChildDetails] = useState({});
  const [findTestNum, setFindTestNum] = useState(""); // For filtering by test number
  const [isFilterActive, setIsFilterActive] = useState(false); // For filtering
  const [isLatestActive, setIsLatestActive] = useState(false); // For sorting by latest

  const [visualTestData, setVisualTestData] = useState([]);

  const childId = localStorage.getItem("childId");
  const tokenId = localStorage.getItem("token");

  useEffect(() => {
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
        setSortedData(fetchedData); // Initially, set sorted data to fetched data
        console.log("Tests by child", fetchedData);
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
        console.log(response);

        const fetchedData = response.data.tests;
        setVisualTestData(fetchedData);
        // setSortedData(fetchedData); // Initially, set sorted data to fetched data
        // console.log("Tests by child", fetchedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    fetchVisualTestData();
  }, [childId, tokenId]);

  useEffect(() => {
    const fetchChildDetails = async () => {
      if (!childId || !tokenId) return;
      try {
        const response = await axios.get(`${backendURL}/getChild/${childId}`, {
          headers: { authorization: `Bearer ${tokenId}` },
        });
        setChildDetails(response.data.child);
        console.log("Details of the child", response.data.child);
      } catch (error) {
        console.error("Error fetching child details:", error);
      }
    };

    fetchChildDetails();
  }, [childId, tokenId]);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    if (!isNaN(date)) {
      const datePart = date.toLocaleDateString();
      const timePart = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { datePart, timePart };
    }
    return { datePart: "Invalid Date", timePart: "Invalid Time" };
  };

  const TableRow = ({ testName, dateTaken, readingAge, score }) => {
    const { datePart, timePart } = formatDateTime(dateTaken);
    return (
      <tr className="group hover:bg-[#ff937a] transition cursor-pointer">
        <td className="border-b font-roboto text-gray-700 p-3 font-semibold text-sm group-hover:text-black">
          {testName}
        </td>
        <td className="border-b font-roboto text-gray-700 p-3 font-semibold text-sm group-hover:text-black">
          {timePart}
        </td>
        <td className="border-b font-roboto text-gray-700 p-3 font-semibold text-sm group-hover:text-black">
          {datePart}
        </td>
        <td className="border-b font-roboto text-gray-700 p-3 font-semibold text-sm group-hover:text-black">
          <PopupWindow
            testName={testName} // Pass the test name to PopupWindow
            reading_age={readingAge}
            score={score}
            student_age={childDetails.age} // Use childDetails.age here
          />
        </td>
      </tr>
    );
  };
  const TableRowVisual = ({ testName, dateTaken, score }) => {
    const { datePart, timePart } = formatDateTime(dateTaken);
    console.log("score",score);
    
    return (
      <tr className="group hover:bg-[#ff937a] transition cursor-pointer">
        <td className="border-b font-roboto text-gray-700 p-3 font-semibold text-sm group-hover:text-black">
          {testName}
        </td>
        <td className="border-b font-roboto text-gray-700 p-3 font-semibold text-sm group-hover:text-black">
          {timePart}
        </td>
        <td className="border-b font-roboto text-gray-700 p-3 font-semibold text-sm group-hover:text-black">
          {datePart}
        </td>
        <td className="border-b font-roboto text-gray-700 p-3 font-semibold text-sm group-hover:text-black ">
          <PopupWindowVisual
            testName={testName} // Pass the test name to PopupWindow
            score={score}
            student_age={childDetails.age} // Use childDetails.age here
          />
        </td>
      </tr>
    );
  };

  // Sorting tests by latest submission
  const handleLatestClicked = () => {
    const sorted = [...data].sort(
      (a, b) => new Date(b.date_taken) - new Date(a.date_taken)
    );
    setSortedData(sorted);
    setIsLatestActive(true);
  };

  // Handle test filtering
  const handleFilterClicked = (bool) => {
    setIsFilterActive(bool);
    setIsLatestActive(false);
    setFindTestNum("");
  };

  const handleNumfromDropDown = (num) => {
    setFindTestNum(num);
  };

  const getFilteredData = () => {
    if (isLatestActive && findTestNum === "") return sortedData;
    if (findTestNum === "") return data;
    if (isFilterActive) return data;
    const regex = new RegExp(`\\b${findTestNum}\\b`, "i");
    return data.filter((test) => regex.test(test.test_name));
  };

  const filteredData = getFilteredData();

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <div
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
      <div className="w-full flex flex-col items-start h-screen px-5">
        <div className="pl-7 pr-7 w-full">
          <h2
            className="text-[30px] pt-7 mb-[0.5] font-extrabold font-roboto"
            style={{ textShadow: "2px 2px 0 #ff937a" }}
          >
            TEST RESULTS: {childDetails.name || "Loading..."}
          </h2>
          <hr className="border-t-2 border-gray-800 mt-4" />
        </div>

        {/* Dropdown and Buttons */}

        <div className="w-full flex-grow overflow-y-auto pt-7">
          <div className="w-full pl-6 pr-6 rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full border-2 rounded-t-xl border-black rounded-xl focus:outline-none shadow-lg bg-white text-center">
                <thead className="bg-gray-200 rounded-t-xl">
                  <tr className="rounded-t-xl">
                    <th className="border p-5 text-lg font-extrabold border-transparent">
                      <div className="flex flex-row items-center justify-center">
                        <div className="flex w-50%">TEST NAME</div>
                        <div className="w-50% flex justify-between items-center pt-2 pl-7 pr-7">
                          <div>
                            <DropDown
                              findNum={handleNumfromDropDown}
                              LatestClicked={handleLatestClicked}
                              FilterClicked={handleFilterClicked}
                            />
                          </div>
                        </div>
                      </div>
                    </th>
                    <th className="border p-5 text-lg font-extrabold border-transparent">
                      TIME
                    </th>
                    <th className="border p-5 text-lg font-extrabold border-transparent">
                      DATE
                    </th>
                    <th className="border p-5 text-lg font-extrabold border-transparent">
                      RESULTS
                    </th>
                  </tr>
                </thead>
                <tbody className="rounded-b-xl">
                  {filteredData.length > 0 &&
                    filteredData.map((test, index) => (
                      <TableRow
                        key={index}
                        testName={test.test_name}
                        dateTaken={test.date_taken}
                        readingAge={test.reading_age}
                        score={test.score}
                      />
                    ))}
                  {visualTestData.length > 0 &&
                    visualTestData.map((test, index) => (
                      <TableRowVisual
                        key={index}
                        testName={test.test_name}
                        dateTaken={test.date_taken}
                        score={test.options}
                      />
                    ))}
                  {visualTestData.length === 0 && filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="p-5 text-center rounded-b-xl border-transparent"
                      >
                        No Test Results Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultsTable;
