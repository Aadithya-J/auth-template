TakeTestCard.jsx;

// import React from "react";
// import PropTypes from 'prop-types';
// import { useNavigate } from "react-router-dom";
// import books from "../assets/b.jpg";
// import mag from "../assets/mag.jpeg.jpg";
// import speak from "../assets/s.jpg";
// import { MdArrowForward } from "react-icons/md";

// const TakeTestCard = ({ test, buttonLabel, onClick }) => {
//   const navigate = useNavigate();

//   const getImageForTest = (id) => {
//     if (id === 1) return mag;
//     if (id === 2) return speak;
//     if (id === 3 || id === 4 || id === 5) return books;
//     if (id === 6) return speak;
//     if (id === 7) return mag;
//     if (id === 8) return books;
//     if (id === 9) return books;
//     if (id === 10) return speak;
//     return books;
//   };

//   const handleButtonClick = (e) => {
//     e.stopPropagation();
//     localStorage.setItem("selectedTestId", test.id);
//     navigate("/selectstudent");
//     if (onClick) onClick();
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-blue-300 group">
//       <div className="flex flex-col md:flex-row w-full">
//         {/* Image Section */}
//         <div className="w-full md:w-1/4 h-48 md:h-auto overflow-hidden">
//           <img
//             src={getImageForTest(test.id)}
//             alt={${test.testName} thumbnail}
//             className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
//           />
//         </div>

//         {/* Content Section */}
//         <div className="w-full md:w-3/4 p-6 flex flex-col justify-between">
//           <div>
//             <h2 className="text-xl font-bold text-blue-800 mb-2 transition-colors duration-300 group-hover:text-blue-600">
//               {test.testName}
//             </h2>
//             <p className="text-gray-600 mb-4">
//               {test.About}
//             </p>
//           </div>

//           <div className="flex justify-end mt-auto">
//             <button
//               onClick={handleButtonClick}
//               className="flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white rounded-md border border-blue-300 hover:border-transparent transition-all duration-300 ease-in-out transform group-hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//               aria-label={Take ${test.testName} test}
//             >
//               <span>{buttonLabel}</span>
//               <MdArrowForward className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// TakeTestCard.propTypes = {
//   test: PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     testName: PropTypes.string.isRequired,
//     About: PropTypes.string
//   }).isRequired,
//   buttonLabel: PropTypes.string.isRequired,
//   onClick: PropTypes.func
// };

// export default TakeTestCard;

import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdArrowForward, MdAccessTime, MdDescription } from "react-icons/md";
import books from "../assets/b.jpg";
import mag from "../assets/mag.jpeg.jpg";
import speak from "../assets/s.jpg";

// Card Image Component
const CardImage = ({ testId, testName }) => {
  const getImageForTest = (id) => {
    if (id === 1) return mag;
    if (id === 2) return speak;
    if (id === 3 || id === 4 || id === 5) return books;
    if (id === 6) return speak;
    if (id === 7) return mag;
    if (id === 8) return books;
    if (id === 9) return books;
    if (id === 10) return speak;
    return books;
  };

  return (
    <div className="w-full md:w-1/3 lg:w-1/4 h-48 md:h-auto relative overflow-hidden">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full h-full"
      >
        <img
          src={getImageForTest(testId)}
          alt={`${testName} thumbnail`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent opacity-70"></div>
      </motion.div>
    </div>
  );
};

// Card Badge Component
const TestBadge = ({ testId }) => {
  const getBadgeInfo = (id) => {
    const categories = {
      1: { color: "bg-blue-100 text-blue-800", label: "Visual" },
      2: { color: "bg-indigo-100 text-indigo-800", label: "Audio" },
      3: { color: "bg-cyan-100 text-cyan-800", label: "Reading" },
      4: { color: "bg-sky-100 text-sky-800", label: "Reading" },
      5: { color: "bg-blue-100 text-blue-800", label: "Reading" },
      6: { color: "bg-indigo-100 text-indigo-800", label: "Audio" },
      7: { color: "bg-cyan-100 text-cyan-800", label: "Visual" },
      8: { color: "bg-sky-100 text-sky-800", label: "Reading" },
      9: { color: "bg-blue-100 text-blue-800", label: "Reading" },
      10: { color: "bg-indigo-100 text-indigo-800", label: "Audio" },
    };

    return (
      categories[id] || { color: "bg-blue-100 text-blue-800", label: "Test" }
    );
  };

  const badgeInfo = getBadgeInfo(testId);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeInfo.color}`}
    >
      {badgeInfo.label}
    </span>
  );
};

// Action Button Component
const ActionButton = ({ label, onClick }) => {
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
      aria-label={`${label}`}
    >
      <span>{label}</span>
      <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
        <MdArrowForward className="ml-2" />
      </motion.div>
    </motion.button>
  );
};

// Main Card Component
const TakeTestCard = ({
  test,
  buttonLabel,
  onClick,
  estimatedTime = "5-10 minutes",
}) => {
  const navigate = useNavigate();

  const handleButtonClick = (e) => {
    e.stopPropagation();
    localStorage.setItem("selectedTestId", test.id);
    navigate("/selectstudent");
    if (onClick) onClick();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row w-full">
        <CardImage testId={test.id} testName={test.testName} />

        <div className="w-full md:w-2/3 lg:w-3/4 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <TestBadge testId={test.id} />
              <div className="flex items-center text-xs text-blue-600">
                <MdAccessTime className="mr-1" />
                <span>{estimatedTime}</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-blue-800 mb-2">
              {test.testName}
            </h2>

            <div className="flex items-start mb-4 text-gray-600">
              <MdDescription className="mt-1 mr-2 text-blue-400 flex-shrink-0" />
              <p>{test.About}</p>
            </div>
          </div>

          <div className="flex justify-end mt-auto pt-4 border-t border-blue-50">
            <ActionButton label={buttonLabel} onClick={handleButtonClick} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

TakeTestCard.propTypes = {
  test: PropTypes.shape({
    id: PropTypes.number.isRequired,
    testName: PropTypes.string.isRequired,
    About: PropTypes.string,
  }).isRequired,
  buttonLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  estimatedTime: PropTypes.string,
};

// List of Test Cards Component
export const TestCardList = ({ tests, buttonLabel, onCardClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {tests.map((test, index) => (
        <motion.div
          key={test.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <TakeTestCard
            test={test}
            buttonLabel={buttonLabel}
            onClick={() => onCardClick && onCardClick(test)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

TestCardList.propTypes = {
  tests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      testName: PropTypes.string.isRequired,
      About: PropTypes.string,
    })
  ).isRequired,
  buttonLabel: PropTypes.string.isRequired,
  onCardClick: PropTypes.func,
};

export default TakeTestCard;
