import React, { useState, useEffect } from "react";
import Popup from "reactjs-popup";
import { backendURL } from "../definedURL";
import { MdClose, MdPersonAdd } from "react-icons/md";

export default function PopupForm({ showPopup, handleClose, onNewStudent }) {
  const [formData, setFormData] = useState({
    name: "",
    rollno: "",
    age: "",
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showPopup) {
      // Small delay to trigger entrance animation
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    }
    setIsVisible(false);
  }, [showPopup]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseWithAnimation = () => {
    setIsVisible(false);
    // Wait for exit animation to complete
    setTimeout(() => {
      handleClose();
    }, 300);
  };

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
        if (data && data.data) {
          onNewStudent(data.data[0]);
        }
        setFormData({ name: "", rollno: "", age: "" });
        handleCloseWithAnimation();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <Popup open={showPopup} closeOnDocumentClick={false} onClose={handleCloseWithAnimation}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
           style={{ opacity: isVisible ? 1 : 0 }}>
        <div className={`bg-white rounded-lg shadow-xl w-full max-w-md m-4 relative overflow-hidden transition-all duration-500 ease-out ${isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 py-4 px-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <MdPersonAdd className="w-6 h-6 text-white mr-2" aria-hidden="true" />
                <h2 className="text-xl font-semibold text-white">Add New Student</h2>
              </div>
              <button 
                onClick={handleCloseWithAnimation}
                className="text-white hover:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-100 rounded-full p-1 transition-all duration-300 hover:bg-blue-500"
                aria-label="Close dialog"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div className="transition-all duration-300 ease-out transform hover:-translate-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="transition-all duration-300 ease-out transform hover:-translate-y-1" style={{ transitionDelay: '50ms' }}>
                <label htmlFor="rollno" className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  id="rollno"
                  name="rollno"
                  value={formData.rollno}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                  aria-required="true"
                />
              </div>
              
              <div className="transition-all duration-300 ease-out transform hover:-translate-y-1" style={{ transitionDelay: '100ms' }}>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  required
                  aria-required="true"
                  min="1"
                  max="100"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCloseWithAnimation}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1 transition-all duration-300 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
              >
                Add Student
              </button>
            </div>
          </form>
        </div>
      </div>
    </Popup>
  );
}
