import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentCard from "../components/StudentCard";
import { MdPerson } from "react-icons/md";
import SearchbyName from "../components/SearchbyName";

export default function ClassPage({ students }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Enable the animation after initial render
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle clicking on a student card
  const handleStudentClick = (studentId) => {
    const storedId = localStorage.getItem("childId");
    const selectedTestId = localStorage.getItem("selectedTestId"); // Retrieve selectedTestId from localStorage
    if (studentId !== storedId || storedId == undefined) {
      localStorage.setItem("childId", studentId);
    }
    // Find the student object
    const selectedStudentObj = (students || []).find(s => String(s.id) === String(studentId));
    // Check the selectedTestId and navigate accordingly
    if (selectedTestId === "all") {
      if (selectedStudentObj) {
        localStorage.setItem('selectedStudent', JSON.stringify(selectedStudentObj));
      }
      navigate("/continuousassessment");
    } else if (selectedTestId === "1") {
      navigate("/test6");
    } else if (selectedTestId === "2") {
      navigate("/test8");
    } else if (selectedTestId === "3") {
      navigate("/test16");
    } else if (selectedTestId === "4") {
      navigate("/test7");
    } else if (selectedTestId === "5") {
      navigate("/test5");
    } else if (selectedTestId === "6") {
      navigate("/test13");
    } else if(selectedTestId === "7"){
      navigate("/test9");
    }else if(selectedTestId === "8"){
      navigate("/test10");
    }
  };

  // Handle search term updates
  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase());
  };

  // Filter students based on search term
  const filteredStudents = (students || []).filter((student) =>
    student?.name?.toLowerCase().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-auto">
      <div className="container mx-auto px-4 py-8 pb-16">
        <header className="mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 
              className="text-3xl font-bold text-blue-800 transition-all duration-300 hover:text-blue-700"
              aria-label="Select a Student"
            >
              Select a Student
            </h1>
            <SearchbyName onSearch={handleSearch} />
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-600 to-blue-300 mt-4 rounded-full animate-pulseLight" 
               aria-hidden="true" />
        </header>

        <main>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
            {/* Student Cards */}
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  buttonLabel="Select Student"
                  onButtonClick={() => handleStudentClick(student.id)}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-blue-200 shadow-sm animate-slideInUp">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                  <MdPerson className="w-10 h-10" aria-hidden="true" />
                </div>
                <p className="text-lg text-gray-600">No students found</p>
                <p className="text-sm text-gray-500 mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
