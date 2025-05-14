// // import React, { useEffect, useState } from "react";
// // import { CiCirclePlus } from "react-icons/ci";
// // import { MdPerson } from "react-icons/md";
// // import { useNavigate } from "react-router-dom";
// // import PopupForm from "../components/PopupForm";
// // import SearchbyName from "../components/SearchbyName";
// // import StudentCard from "../components/StudentCard";
// // import { useLanguage } from "../contexts/LanguageContext";

// // export default function Analytics({ students: initialStudents }) {
// //   const navigate = useNavigate();
// //   const { t } = useLanguage();
// //   const [students, setStudents] = useState(initialStudents || []);
// //   const [showPopup, setShowPopup] = useState(false);
// //   const [searchTerm, setSearchTerm] = useState("");
// //   const [isLoaded, setIsLoaded] = useState(false);

// //   useEffect(() => {
// //     const timer = setTimeout(() => {
// //       setIsLoaded(true);
// //     }, 100);
// //     return () => clearTimeout(timer);
// //   }, []);

// //   const handleAddChildClick = () => {
// //     setShowPopup(true);
// //   };

// //   const handleClose = () => {
// //     setShowPopup(false);
// //   };

// //   const handleChildClick = (studentId) => {
// //     const storedId = localStorage.getItem("childId");
// //     if (studentId !== storedId) {
// //       localStorage.setItem("childId", studentId);
// //     }
// //     navigate("/testreports");
// //   };

// //   const handleSearch = (term) => {
// //     setSearchTerm(term);
// //   };

// //   const handleNewStudent = (newStudent) => {
// //     setStudents((prevStudents) => [newStudent, ...prevStudents]);
// //   };

// //   const filteredStudents = students.filter((student) =>
// //     student.name?.toLowerCase().includes(searchTerm.toLowerCase())
// //   );

// //   return (
// //     <div className="h-screen bg-white flex flex-col overflow-hidden">
// //       <div className="container mx-auto px-4 py-8 flex-grow flex flex-col overflow-auto">
// //         <header className="mb-8 animate-fadeIn">
// //           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
// //           <h1
// //             className="text-3xl font-bold text-blue-800 transition-all duration-300 hover:text-blue-700"
// //             aria-label={t("myClassroom")}
// //           >
// //             {location.pathname.includes('/analytics') ? t("analytics") : t("studentsManagement")}
// //           </h1>

// //             <SearchbyName onSearch={handleSearch} />
// //           </div>
// //           <div
// //             className="h-1 w-full bg-gradient-to-r from-blue-600 to-blue-300 mt-4 rounded-full animate-pulseLight"
// //             aria-hidden="true"
// //           />
// //         </header>

// //         <main className="flex-grow overflow-auto pb-16">
// //           <div
// //             className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children ${
// //               isLoaded ? "opacity-100" : "opacity-0"
// //             }`}
// //           >
// //             {/* Add Student Card */}

// //             {location.pathname.includes('/viewstudents') && (
// //               <div
// //                 className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-md"
// //                 onClick={handleAddChildClick}
// //                 aria-label={t("addNewStudent")}
// //               >
// //                 <CiCirclePlus className="w-12 h-12 text-blue-500 mb-2" />
// //                 <span className="text-blue-600 font-medium">{t("addStudent")}</span>
// //               </div>
// //             )}

// //             {/* Student Cards */}
// //             {filteredStudents.length > 0 ? (
// //               filteredStudents.map((student) => (
// //                 <StudentCard
// //                   key={student.id}
// //                   student={student}
// //                   buttonLabel={t("viewTestReport")}
// //                   onButtonClick={() => handleChildClick(student.id)}
// //                 />
// //               ))
// //             ) : (
// //               <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-blue-200 shadow-sm animate-slideInUp">
// //                 <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
// //                   <MdPerson className="w-10 h-10" aria-hidden="true" />
// //                 </div>
// //                 <p className="text-lg text-gray-600">{t("noStudentsFound")}</p>
// //                 <p className="text-sm text-gray-500 mt-2">
// //                   {t("adjustSearchOrAddNewStudent")}
// //                 </p>
// //               </div>
// //             )}
// //           </div>
// //         </main>

// //         {showPopup && (
// //           <PopupForm
// //             showPopup={showPopup}
// //             handleClose={handleClose}
// //             onNewStudent={handleNewStudent}
// //           />
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useEffect, useState } from "react";
// import { CiCirclePlus } from "react-icons/ci";
// import { MdPerson } from "react-icons/md";
// import { useNavigate, useLocation } from "react-router-dom";
// import PopupForm from "../components/PopupForm";
// import SearchbyName from "../components/SearchbyName";
// import StudentCard from "../components/StudentCard";
// import { useLanguage } from "../contexts/LanguageContext";
// import axios from "axios";
// import { backendURL } from "../definedURL";

// export default function Analytics({ students: initialStudents }) {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { t } = useLanguage(); // Get translation function from context
//   const [students, setStudents] = useState(initialStudents || []);
//   const [showPopup, setShowPopup] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isLoaded, setIsLoaded] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Fetch students directly from API instead of relying only on props
//   const fetchStudents = async () => {
//     try {
//       setIsLoading(true);
//       const token = localStorage.getItem("access_token");
//       if (!token) {
//         setIsLoading(false);
//         return;
//       }

//       const response = await axios.get(`${backendURL}/getChildrenByTeacher`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.data && response.data.children) {
//         setStudents(response.data.children);
//       }
//       setIsLoading(false);
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     // Fetch students when component mounts and whenever location changes
//     fetchStudents();

//     const timer = setTimeout(() => {
//       setIsLoaded(true);
//     }, 100);
//     return () => clearTimeout(timer);
//   }, [location.pathname]);

//   // Also update students when initialStudents prop changes
//   useEffect(() => {
//     if (initialStudents && initialStudents.length > 0) {
//       setStudents(initialStudents);
//       setIsLoading(false);
//     }
//   }, [initialStudents]);

//   const handleAddChildClick = () => {
//     setShowPopup(true);
//   };

//   const handleClose = () => {
//     setShowPopup(false);
//   };

//   const handleChildClick = (studentId) => {
//     const storedId = localStorage.getItem("childId");
//     if (studentId !== storedId) {
//       localStorage.setItem("childId", studentId);
//     }
//     navigate("/testreports");
//   };

//   const handleSearch = (term) => {
//     setSearchTerm(term);
//   };

//   const handleNewStudent = async (newStudent) => {
//     // Update local state
//     setStudents((prevStudents) => [newStudent, ...prevStudents]);

//     // After adding a new student, fetch the latest student list from API
//     await fetchStudents();
//   };

//   const filteredStudents = students.filter((student) =>
//     student.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <div className="h-screen bg-white flex flex-col overflow-hidden">
//       <div className="container mx-auto px-4 py-8 flex-grow flex flex-col overflow-auto">
//         <header className="mb-8 animate-fadeIn">
//           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
//             <h1
//               className="text-3xl font-bold text-blue-800 transition-all duration-300 hover:text-blue-700"
//               aria-label={t("myClassroom")}
//             >
//               {location.pathname.includes("/analytics")
//                 ? t("analytics")
//                 : t("studentsManagement")}
//             </h1>
//             <SearchbyName onSearch={handleSearch} />
//           </div>
//           <div
//             className="h-1 w-full bg-gradient-to-r from-blue-600 to-blue-300 mt-4 rounded-full animate-pulseLight"
//             aria-hidden="true"
//           />
//         </header>

//         <main className="flex-grow overflow-auto pb-16">
//           <div
//             className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children ${
//               isLoaded ? "opacity-100" : "opacity-0"
//             }`}
//           >
//             {/* Add Student Card */}
//             {location.pathname.includes("/viewstudents") && (
//               <div
//                 className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-md"
//                 onClick={handleAddChildClick}
//                 aria-label={t("addNewStudent")}
//               >
//                 <CiCirclePlus className="w-12 h-12 text-blue-500 mb-2" />
//                 <span className="text-blue-600 font-medium">
//                   {t("addStudent")}
//                 </span>
//               </div>
//             )}

//             {/* Loading indicator */}
//             {isLoading ? (
//               <div className="col-span-full flex flex-col items-center justify-center p-8">
//                 <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
//                 <p className="text-blue-600 font-medium">
//                   {t("loadingStudents")}
//                 </p>
//               </div>
//             ) : filteredStudents.length > 0 ? (
//               filteredStudents.map((student) => (
//                 <StudentCard
//                   key={student.id}
//                   student={student}
//                   buttonLabel={t("viewTestReport")}
//                   onButtonClick={() => handleChildClick(student.id)}
//                 />
//               ))
//             ) : (
//               <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-blue-200 shadow-sm animate-slideInUp">
//                 <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
//                   <MdPerson className="w-10 h-10" aria-hidden="true" />
//                 </div>
//                 <p className="text-lg text-gray-600">{t("noStudentsFound")}</p>
//                 <p className="text-sm text-gray-500 mt-2">
//                   {t("adjustSearchOrAddNewStudent")}
//                 </p>
//               </div>
//             )}
//           </div>
//         </main>

//         {showPopup && (
//           <PopupForm
//             showPopup={showPopup}
//             handleClose={handleClose}
//             onNewStudent={handleNewStudent}
//           />
//         )}
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { MdPerson } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import PopupForm from "../components/PopupForm";
import SearchbyName from "../components/SearchbyName";
import StudentCard from "../components/StudentCard";
import { useLanguage } from "../contexts/LanguageContext";
import axios from "axios";
import { backendURL } from "../definedURL";

export default function Analytics({ students: initialStudents }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage(); // Get translation function from context
  const [students, setStudents] = useState(initialStudents || []);
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch students directly from API instead of relying only on props
  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${backendURL}/getChildrenByTeacher`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.children) {
        setStudents(response.data.children);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Fetch students when component mounts and whenever location changes
    fetchStudents();

    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Also update students when initialStudents prop changes
  useEffect(() => {
    if (initialStudents && initialStudents.length > 0) {
      setStudents(initialStudents);
      setIsLoading(false);
    }
  }, [initialStudents]);

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

  const handleNewStudent = async (newStudent) => {
    // Update local state
    setStudents((prevStudents) => [newStudent, ...prevStudents]);

    // After adding a new student, fetch the latest student list from API
    await fetchStudents();
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
              aria-label={t("myClassroom")}
            >
              {location.pathname.includes("/analytics")
                ? t("analytics")
                : t("studentsManagement")}
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
            {location.pathname.includes("/viewstudents") && (
              <div
                className="flex flex-col items-center justify-center p-6 bg-blue-50 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all duration-300 cursor-pointer hover:shadow-md"
                onClick={handleAddChildClick}
                aria-label={t("addNewStudent")}
              >
                <CiCirclePlus className="w-12 h-12 text-blue-500 mb-2" />
                <span className="text-blue-600 font-medium">
                  {t("addStudent")}
                </span>
              </div>
            )}

            {/* Loading indicator */}
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center p-8">
                <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
                <p className="text-blue-600 font-medium">
                  {t("loadingStudents")}
                </p>
              </div>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  buttonLabel={t("viewTestReport")}
                  onButtonClick={() => handleChildClick(student.id)}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-blue-200 shadow-sm animate-slideInUp">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                  <MdPerson className="w-10 h-10" aria-hidden="true" />
                </div>
                <p className="text-lg text-gray-600">{t("noStudentsFound")}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {t("adjustSearchOrAddNewStudent")}
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