import React, { useState } from "react";
import Popup from "reactjs-popup";
import { backendURL } from "../definedURL";

export default function PopupForm({ showPopup, handleClose }) {
  const [formData, setFormData] = useState({
    name: "",
    rollno: "",
    age: "",
  });

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${backendURL}/addChild`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        setFormData({ name: "", rollno: "", age: "" }); // Reset form after submission
        handleClose(); // Call the handleClose prop to close the popup
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <Popup open={showPopup} closeOnDocumentClick onClose={handleClose}>
      <div className="flex justify-center items-center fixed inset-0 z-50 bg-gray-800 bg-opacity-50">
        <div className="bg-white p-8 rounded-lg shadow-lg w-80">
          <h2 className="text-2xl font-semibold mb-4">Enter Details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-left font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-left font-medium">Roll No</label>
              <input
                type="text"
                name="rollno"
                value={formData.rollno}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-left font-medium">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-between mt-4">
              <button
                type="submit"
                className="hover:bg-green-500 bg-white hover:text-white text-green-500 border-2 border-green-500 px-4 py-2 rounded hover:bg-green-600 transition-colors"
              >
                Submit
              </button>
              <button
                type="button"
                className="hover:bg-red-500 bg-white hover:text-white text-red-500 border-2 border-red-500 px-4 py-2 rounded hover:bg-green-600 transition-colors"
                onClick={handleClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Popup>
  );
}
