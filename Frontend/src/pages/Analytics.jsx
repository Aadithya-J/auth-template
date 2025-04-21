import React, { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { MdPerson } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PopupForm from "../components/PopupForm";
import SearchbyName from "../components/SearchbyName";
import StudentCard from "../components/StudentCard";

export default function Analytics({ students: initialStudents }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState(initialStudents || []);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAddChildClick = () => {
    setShowPopup(true);
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  const handleChildClick = (studentId) => {
    const storedId = localStorage.getItem("childId");
    if (studentId !== storedId) {
      localStorage.setItem("childId", studentId);
    }
    navigate("/testreports");
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleNewStudent = (newStudent) => {
    setStudents((prevStudents) => [newStudent, ...prevStudents]);
  };

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col overflow-auto">
        <header className="mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1
              className="text-3xl font-bold text-blue-800 transition-all duration-300 hover:text-blue-700"
              aria-label="My Classroom"
            >
              Analytics
            </h1>
            <SearchbyName onSearch={handleSearch} />
          </div>
          <div
            className="h-1 w-full bg-gradient-to-r from-blue-600 to-blue-300 mt-4 rounded-full animate-pulseLight"
            aria-hidden="true"
          />
        </header>

        <main className="flex-grow overflow-auto pb-16">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children ${
              isLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Add Student Card */}
            <div
              className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-md"
              onClick={handleAddChildClick}
              aria-label="Add new student"
            >
              <CiCirclePlus className="w-12 h-12 text-blue-500 mb-2" />
              <span className="text-blue-600 font-medium">Add Student</span>
            </div>

            {/* Student Cards */}
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  buttonLabel="View Test Report"
                  onButtonClick={() => handleChildClick(student.id)}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-blue-200 shadow-sm animate-slideInUp">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                  <MdPerson className="w-10 h-10" aria-hidden="true" />
                </div>
                <p className="text-lg text-gray-600">No students found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search or add a new student
                </p>
              </div>
            )}
          </div>
        </main>

        {showPopup && (
          <PopupForm
            showPopup={showPopup}
            handleClose={handleClose}
            onNewStudent={handleNewStudent}
          />
        )}
      </div>
    </div>
  );
}
