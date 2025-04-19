import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TakeTestCard from "../components/TakeTestCard";
import { MdSchool, MdQuiz, MdSearch } from "react-icons/md";
import PropTypes from 'prop-types';

const TakeTests = ({ tests = [] }) => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleTestClick = (testId) => {
    localStorage.setItem('selectedTestId', testId);
    navigate('/selectstudent');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const filteredTests = tests.filter(test => 
    test.testName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (test.About && test.About.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-gradient-to-b from-blue-50/80 to-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="animate-fadeIn">
          <div className="flex justify-end mb-6">
            <button
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 text-lg font-semibold"
              onClick={() => { localStorage.setItem('selectedTestId', 'all'); navigate('/selectstudent'); }}
            >
              <MdQuiz className="w-6 h-6" />
              Take All Tests
            </button>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center">
              <MdSchool className="text-blue-500 w-8 h-8 mr-3" aria-hidden="true" />
              <h1 className="text-3xl font-bold text-blue-700 transition-all duration-300 hover:text-blue-600">
                Take Tests
              </h1>
            </div>

            <div className="w-full md:w-64 relative">
              <div className={`relative transition-all duration-300 ease-in-out ${isFocused ? 'translate-y-[-2px]' : ''}`}>
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MdSearch 
                    className={`w-5 h-5 transition-all duration-300 ${isFocused ? 'text-blue-600' : 'text-blue-400'}`} 
                  />
                </div>
                <input
                  type="search"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full py-2 pl-10 pr-12 text-sm text-gray-700 bg-white border border-blue-200 rounded-lg transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:shadow-md"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-200 mt-2 rounded-full animate-pulseLight mb-8" />
        </header>

        <main className="pb-8">
          {/* Make only the test list scrollable */}
          <div className="overflow-y-auto max-h-[calc(100vh-260px)] pr-2">
            <div className={`space-y-6 ${isLoaded ? 'opacity-100' : 'opacity-0'} max-h-[calc(100vh-220px)] overflow-y-auto pr-2`}>
              {filteredTests.length > 0 ? (
                filteredTests.map((test) => (
                  <div 
                    key={test.id}
                    className="transform transition-all duration-500 ease-out hover:translate-y-[-4px]"
                  >
                    <TakeTestCard 
                      test={test} 
                      buttonLabel="Take Test" 
                      onClick={() => handleTestClick(test.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-blue-200 shadow-sm animate-slideInUp">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-4">
                    <MdQuiz className="w-10 h-10" />
                  </div>
                  <p className="text-lg text-gray-600">
                    {searchTerm ? "No matching tests found" : "No tests available"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    {searchTerm ? (
                      <button 
                        onClick={clearSearch}
                        className="text-blue-500 hover:underline focus:outline-none"
                      >
                        Clear search
                      </button>
                    ) : "Check back later for new assessments"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

TakeTests.propTypes = {
  tests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      testName: PropTypes.string.isRequired,
      About: PropTypes.string
    })
  )
};

export default TakeTests;