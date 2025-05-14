import React from "react";
import PropTypes from 'prop-types';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdArrowForward, MdAccessTime, MdDescription } from "react-icons/md";
import books from "../assets/b.jpg";
import mag from "../assets/mag.jpeg.jpg";
import speak from "../assets/s.jpg";
import { useLanguage } from "../contexts/LanguageContext";

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
  const { t } = useLanguage();
  
  const getBadgeInfo = (id) => {
    const categories = {
      1: { color: "bg-blue-100 text-blue-800", label: t("visual") },
      2: { color: "bg-indigo-100 text-indigo-800", label: t("audio") },
      3: { color: "bg-cyan-100 text-cyan-800", label: t("reading") },
      4: { color: "bg-sky-100 text-sky-800", label: t("reading") },
      5: { color: "bg-blue-100 text-blue-800", label: t("reading") },
      6: { color: "bg-indigo-100 text-indigo-800", label: t("audio") },
      7: { color: "bg-cyan-100 text-cyan-800", label: t("visual") },
      8: { color: "bg-sky-100 text-sky-800", label: t("reading") },
      9: { color: "bg-blue-100 text-blue-800", label: t("reading") },
      10: { color: "bg-indigo-100 text-indigo-800", label: t("audio") },
    };
    
    return categories[id] || { color: "bg-blue-100 text-blue-800", label: t("test") };
  };

  const badgeInfo = getBadgeInfo(testId);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeInfo.color}`}>
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
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <MdArrowForward className="ml-2" />
      </motion.div>
    </motion.button>
  );
};

// Main Card Component
const TakeTestCard = ({ test, buttonLabel, onClick, estimatedTime = "5-10 minutes" }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  const handleButtonClick = (e) => {
    e.stopPropagation();
    localStorage.setItem("selectedTestId", test.id);
    navigate("/selectstudent");
    if (onClick) onClick();
  };

  // Get localized test name and description
  const testName = 
  language === 'ta' && test.testName_ta ? test.testName_ta :
  language === 'hi' && test.testName_hi ? test.testName_hi :
  test.testName;

const testDescription = 
  language === 'ta' && test.About_ta ? test.About_ta :
  language === 'hi' && test.About_hi ? test.About_hi :
  test.About;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden"
    >
      <div className="flex flex-col md:flex-row w-full">
        <CardImage testId={test.id} testName={testName} />
        
        <div className="w-full md:w-2/3 lg:w-3/4 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <TestBadge testId={test.id} />
              <div className="flex items-center text-xs text-blue-600">
                <MdAccessTime className="mr-1" />
                <span>{t('estimatedTime')}</span>
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-blue-800 mb-2">
              {testName}
            </h2>
            
            <div className="flex items-start mb-4 text-gray-600">
              <MdDescription className="mt-1 mr-2 text-blue-400 flex-shrink-0" />
              <p>{testDescription}</p>
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
    testName_ta: PropTypes.string,
    About: PropTypes.string,
    About_ta: PropTypes.string
  }).isRequired,
  buttonLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  estimatedTime: PropTypes.string
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
      testName_ta: PropTypes.string,
      About: PropTypes.string,
      About_ta: PropTypes.string
    })
  ).isRequired,
  buttonLabel: PropTypes.string.isRequired,
  onCardClick: PropTypes.func
};

export default TakeTestCard;