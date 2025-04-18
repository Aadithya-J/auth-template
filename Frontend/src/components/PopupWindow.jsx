import React, { useEffect, useState } from "react";
import Popup from "reactjs-popup";

export default function PopupWindow({ testName, cbcReport }) {
  const [user, setUser] = useState({
    name: "",
    age: "",
    sex: "",
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    setUser({
      name: userData.name || "N/A",
      age: userData.age || "N/A",
      sex: userData.sex || "N/A",
    });
  }, []);

  return (
    <Popup
      trigger={
        <button className="flex justify-center items-center w-full h-full text-sm font-sans text-gray-800 border-gray-800 hover:text-black font-medium border border-gray-400 hover:border-black px-4 py-2 bg-transparent hover:bg-white hover:shadow-sm active:bg-blue-200 rounded-lg transition-all duration-300">
          View CBC Report
        </button>
      }
      modal
      closeOnDocumentClick
    >
      {(close) => (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white w-[800px] max-w-full rounded-lg shadow-xl p-8 relative">
            <div className="text-center border-b pb-4 mb-4">
              <h1 className="text-xl font-bold text-blue-700">Labsmart Software</h1>
              <p className="text-sm text-gray-500">Sample CBC Blood Test Report</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-6">
              <div><strong>Patient:</strong> {user.name}</div>
              <div><strong>Age/Sex:</strong> {user.age} / {user.sex}</div>
              <div><strong>Date:</strong> {cbcReport?.date || "17/10/2024"}</div>
              <div><strong>Reg No.:</strong> {cbcReport?.regNo || "1001"}</div>
            </div>

            <h2 className="text-md font-semibold mb-2 border-b pb-2">Complete Blood Count (CBC)</h2>
            <table className="w-full text-sm mb-4 border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-2 py-1 text-left">Test</th>
                  <th className="border px-2 py-1 text-left">Value</th>
                  <th className="border px-2 py-1 text-left">Unit</th>
                  <th className="border px-2 py-1 text-left">Reference</th>
                </tr>
              </thead>
              <tbody>
                {cbcReport?.tests?.map((item, index) => (
                  <tr key={index} className={`${item.flag === "L" ? "text-blue-600" : item.flag === "H" ? "text-red-600" : ""}`}>
                    <td className="border px-2 py-1">{item.name}</td>
                    <td className="border px-2 py-1">{item.value}</td>
                    <td className="border px-2 py-1">{item.unit}</td>
                    <td className="border px-2 py-1">{item.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 text-sm text-gray-600 border-t pt-4">
              <p className="mb-2"><strong>Clinical Notes:</strong> A CBC helps evaluate overall health and detect disorders like anemia, infection, and leukemia.</p>
              <p className="italic text-xs">Note: Interpret values with a certified medical professional.</p>
            </div>

            <button
              className="absolute top-4 right-4 text-sm text-gray-600 hover:text-black"
              onClick={close}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </Popup>
  );
}
