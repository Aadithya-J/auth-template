import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from "framer-motion";

// Animated info card component for student details
const InfoCard = ({ title, value, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white w-full center rounded-xl p-4 flex flex-col items-center shadow-md border border-blue-100 hover:border-blue-300 transition-colors duration-300"
  >
    <div className="text-2xl mb-1 text-blue-500">{icon}</div>
    <p className="text-xs text-blue-400 font-medium">{title}</p>
    <p className="font-semibold text-blue-700 text-lg mt-1">{value}</p>
  </motion.div>
);

const StudentCard = ({
  student = {},
  buttonLabel = "Click Me",
  onButtonClick = () => {}
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        setShowDialog(false);
      }
    };
    if (showDialog) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDialog]);

  const handleCardClick = () => {
    if (location.pathname === '/viewstudents') setShowDialog(true);
  };

  return (
    <>
      <div
        className="h-full bg-white rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:border-blue-400 group overflow-hidden cursor-pointer"
        onClick={handleCardClick}
      >
        <article className="h-full flex flex-col p-4">
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 mb-3 rounded-full overflow-hidden border-2 border-blue-300 transition-all duration-300 group-hover:border-blue-500 transform group-hover:scale-105">
              <img
                src={student.imageUrl || "/defaultphp.jpg"}
                alt={`${student.name || "Student"}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            </div>
            <h3 className="text-xl font-semibold text-blue-800 transition-colors duration-300 group-hover:text-blue-600">
              {student.name || "Unknown Student"}
            </h3>
          </div>
          <div className="flex justify-between items-center w-full px-4 mb-5">
            <div className="flex flex-col items-center justify-center space-y-1 w-1/2 transition-transform duration-300 ease-out group-hover:transform group-hover:-translate-y-1">
              <p className="text-sm text-blue-500">Roll No</p>
              <p className="text-base font-semibold text-blue-700">
                {student.rollno || "N/A"}
              </p>
            </div>
            <div className="h-12 border-r border-blue-200 transition-all duration-300 group-hover:border-blue-400 group-hover:h-14"></div>
            <div className="flex flex-col items-center justify-center space-y-1 w-1/2 transition-transform duration-300 ease-out group-hover:transform group-hover:-translate-y-1">
              <p className="text-sm text-blue-500">Tests Taken</p>
              <p className="text-base font-semibold text-blue-700">
                {student.tests_taken || "0"}
              </p>
            </div>
          </div>
          {(location.pathname.includes('/analytics') || location.pathname.includes('/selectstudent')) && (
            <div className="mt-auto">
              <button
                onClick={e => {
                  e.stopPropagation();
                  onButtonClick();
                }}
                className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white rounded-md border border-blue-300 hover:border-transparent transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label={`View test report for ${student.name || "student"}`}
              >
                {buttonLabel}
              </button>
            </div>
          )}
        </article>
      </div>

      {/* Student Details Dialog */}
      <AnimatePresence>
        {showDialog && location.pathname === '/viewstudents' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 22, stiffness: 250 }}
              className="relative w-full max-w-2xl mx-auto"
              ref={dialogRef}
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full">
                {/* Dialog Header with Gradient */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-800">
                  <button
                    onClick={() => setShowDialog(false)}
                    className="absolute top-5 right-6 bg-white bg-opacity-20 hover:bg-opacity-40 rounded-full p-2 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* Profile Image */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="w-36 h-36 rounded-full border-4 border-white overflow-hidden shadow-lg">
                      <img
                        src={student.imageUrl || "/defaultphp.jpg"}
                        alt={student.name || "Student"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </motion.div>
                </div>
                {/* Student Details */}
                <div className="pt-20 pb-10 px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-6"
                  >
                    <h2 className="text-3xl font-bold text-blue-800">{student.name || "Unknown Student"}</h2>
                    <p className="text-blue-600 font-medium text-lg">Roll No: {student.rollno || "N/A"}</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center mb-8"
                  >
                    <InfoCard title="Tests Taken" value={student.tests_taken || "0"} icon="📝" delay={0.4} />
                  </motion.div>
          
                  {/* Modern Action Buttons */}
                  <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.8 }}
  className="mt-10 flex flex-col items-center gap-4 w-full sm:w-auto"
>
<button
  onClick={() => {
    localStorage.setItem('selectedTestId', 'all');
    localStorage.setItem('childId', student.id);
    localStorage.setItem('selectedStudent', JSON.stringify(student));
    navigate('/continuousassessment');
  }}
  className="flex items-center justify-center w-full gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Take Full Test
</button>

<button
  onClick={() => navigate('/taketests')}
  className="flex items-center justify-center w-full gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Take Individual Test
</button>
</motion.div>


                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.85 }}
                    className="mt-8 flex justify-center"
                  >
                    <button
                      onClick={() => setShowDialog(false)}
                      className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Close
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentCard;




// import React, { useState, useRef, useEffect } from "react";
// import { useLocation, useNavigate } from 'react-router-dom';
// import { motion, AnimatePresence } from "framer-motion";

// // InfoCard component with new styling
// const InfoCard = ({ title, value, icon, delay }) => (
//   <motion.div
//     initial={{ opacity: 0, y: 10 }}
//     animate={{ opacity: 1, y: 0 }}
//     transition={{ delay }}
//     className="bg-white w-full rounded-lg p-4 flex flex-col items-center border border-gray-100 shadow-xs hover:shadow-sm transition-shadow duration-200"
//   >
//     <div className="text-xl mb-2 text-blue-500">{icon}</div>
//     <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{title}</p>
//     <p className="text-lg font-bold text-gray-800 mt-1">{value}</p>
//   </motion.div>
// );

// const StudentCard = ({
//   student = {},
//   buttonLabel = "Click Me",
//   onButtonClick = () => {}
// }) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [showDialog, setShowDialog] = useState(false);
//   const dialogRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dialogRef.current && !dialogRef.current.contains(event.target)) {
//         setShowDialog(false);
//       }
//     };
//     if (showDialog) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [showDialog]);

//   const handleCardClick = () => {
//     if (location.pathname === '/viewstudents') setShowDialog(true);
//   };

//   return (
//     <>
//       {/* Main Card */}
//       <div
//         className="h-full bg-white rounded-lg border border-gray-100 shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden cursor-pointer"
//         onClick={handleCardClick}
//       >
//         <article className="h-full flex flex-col p-5">
//           <div className="flex flex-col items-center mb-5">
//             <div className="w-20 h-20 mb-3 rounded-full overflow-hidden border-2 border-white shadow-md transition-all duration-300 group-hover:border-blue-300">
//               <img
//                 src={student.imageUrl || "/defaultphp.jpg"}
//                 alt={`${student.name || "Student"}`}
//                 className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
//               />
//             </div>
//             <h3 className="text-lg font-bold text-gray-800">
//               {student.name || "Unknown Student"}
//             </h3>
//             <p className="text-sm text-gray-500 mt-1">Roll No: {student.rollno || "N/A"}</p>
//           </div>
          
//           <div className="flex justify-center mt-auto">
//             <div className="w-full bg-gray-50 rounded-lg p-3">
//               <div className="flex justify-between items-center">
//                 <div className="flex flex-col items-center">
//                   <p className="text-xs text-gray-500">Tests Taken</p>
//                   <p className="text-base font-semibold text-blue-600">
//                     {student.tests_taken || "0"}
//                   </p>
//                 </div>
//                 {(location.pathname.includes('/analytics') || location.pathname.includes('/selectstudent')) && (
//                   <button
//                     onClick={e => {
//                       e.stopPropagation();
//                       onButtonClick();
//                     }}
//                     className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     aria-label={`View test report for ${student.name || "student"}`}
//                   >
//                     {buttonLabel}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </article>
//       </div>

//       {/* Student Details Dialog */}
//       <AnimatePresence>
//         {showDialog && location.pathname === '/viewstudents' && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.9 }}
//               transition={{ type: "spring", damping: 20, stiffness: 300 }}
//               className="relative w-full max-w-md mx-4"
//               ref={dialogRef}
//             >
//               <div className="bg-white rounded-xl overflow-hidden shadow-xl w-full">
//                 {/* Dialog Header */}
//                 <div className="relative h-40 bg-gradient-to-r from-blue-500 to-blue-600">
//                   <button
//                     onClick={() => setShowDialog(false)}
//                     className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200"
//                   >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
                  
//                   {/* Profile Image */}
//                   <motion.div
//                     initial={{ y: 20, opacity: 0 }}
//                     animate={{ y: 0, opacity: 1 }}
//                     transition={{ delay: 0.1 }}
//                     className="absolute -bottom-12 left-1/2 transform -translate-x-1/2"
//                   >
//                     <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden shadow-lg bg-white">
//                       <img
//                         src={student.imageUrl || "/defaultphp.jpg"}
//                         alt={student.name || "Student"}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                   </motion.div>
//                 </div>
                
//                 {/* Student Details */}
//                 <div className="pt-16 pb-6 px-6">
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.2 }}
//                     className="text-center mb-6"
//                   >
//                     <h2 className="text-2xl font-bold text-gray-800">{student.name || "Unknown Student"}</h2>
//                     <p className="text-blue-600 font-medium">Roll No: {student.rollno || "N/A"}</p>
//                   </motion.div>

//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.3 }}
//                     className="grid grid-cols-2 gap-4 mb-6"
//                   >
//                     <InfoCard title="Tests Taken" value={student.tests_taken || "0"} icon="📊" delay={0.4} />
//                     <InfoCard title="Performance" value="-" icon="⭐" delay={0.5} />
//                   </motion.div>

//                   {/* Action Buttons */}
//                   <motion.div
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.6 }}
//                     className="flex flex-col space-y-3 mt-6"
//                   >
//                     <button
//                       onClick={() => {
//                         localStorage.setItem('selectedTestId', 'all');
//                         localStorage.setItem('childId', student.id);
//                         localStorage.setItem('selectedStudent', JSON.stringify(student));
//                         navigate('/continuousassessment');
//                       }}
//                       className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
//                     >
//                       Take Full Test
//                     </button>
//                     <button
//                       onClick={() => navigate('/taketests')}
//                       className="w-full py-2.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors duration-200"
//                     >
//                       Take Individual Test
//                     </button>
//                   </motion.div>

//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.7 }}
//                     className="mt-6 text-center"
//                   >
//                     <button
//                       onClick={() => setShowDialog(false)}
//                       className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
//                     >
//                       Close
//                     </button>
//                   </motion.div>
//                 </div>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </>
//   );
// };

// export default StudentCard;