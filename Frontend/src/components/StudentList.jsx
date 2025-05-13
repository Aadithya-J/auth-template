import React from "react";
import PropTypes from "prop-types";
import { useLanguage } from "../contexts/LanguageContext";

const StudentList = ({ student, buttonLabel, onButtonClick, buttonClassName }) => {
  const { t } = useLanguage();
  
  return (
    <div className="mb-3">
      <div className="w-full group">
        <article className="bg-white rounded-lg shadow-sm transition-all duration-300 ease-in-out hover:shadow-md">
          <div className="px-4 py-3 text-left flex flex-wrap md:flex-nowrap items-center justify-between">
            <div className="flex items-center space-x-3 mb-2 md:mb-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-800">{student.name}</h3>
                <div className="flex space-x-3 text-xs text-gray-500">
                  <span>{t("rollNo")}: {student.rollno}</span>
                  <span>{t("tests")}: {student.tests_taken || 0}</span>
                </div>
              </div>
            </div>
            
            <button
              className={buttonClassName || "bg-blue-600 text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"}
              onClick={() => {
                onButtonClick(student.id);
              }}
            >
              {buttonLabel}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

StudentList.propTypes = {
  student: PropTypes.object.isRequired,
  buttonLabel: PropTypes.string.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  buttonClassName: PropTypes.string
};

export default StudentList;