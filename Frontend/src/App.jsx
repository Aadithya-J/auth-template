// import { useState, useEffect } from "react";
// import { Route, Routes, useNavigate } from "react-router-dom";
// import SideNavBar, { SideNavBarItem } from "./components/SideNavBar";
// import { GrHomeRounded } from "react-icons/gr";
// import { RiGraduationCapLine } from "react-icons/ri";
// import { MdOutlineEventNote } from "react-icons/md";
// import axios from "axios";
// import Home from "./pages/Home";
// import MyClass from "./pages/MyClass";
// import TakeTests from "./pages/TakeTests";
// import SoundDiscriminationTest from "./components/test 16/Test16";
// import AudioQuiz from "./components/test 8/Test8";
// import Test from "./components/test 6/Test6";
// import Settings from "./pages/Settings";
// import Support from "./pages/Support";
// import User from "./pages/User";
// import Login from "./pages/login";
// import EmptyPage from "./pages/EmptyPage";
// import TestResultsTable from "./pages/TestResultsPage";
// import ClassPage from "./pages/ClassPage";
// import PrivateRoute from "./components/PrivateRoute";
// import testsData from "./Data/tests.json"; // Use dynamic import if needed
// import { backendURL } from "./definedURL"; // Ensure this import is correct
// import { clearAuth } from "./utils/authHelper";
// import AfterTest from "./components/test 6/AfterTest";
// import PictureRecognition from "./components/test 7/Test7";
// import GraphemeTest from "./components/test 5/Test5";
// import DigitSpanTest from "./components/test 13/Test13";
// import Test7 from "./components/Sequence_arrangement/sequenceArrangement";
// import SymbolSequence from "./components/SymbolSequence/SymbolSequence";
// import ContinuousAssessment from "./components/ContinuousAssessment";
// import Register from "./pages/Register";
// import Analytics from "./pages/Analytics";
// import Test14 from "./components/test 14/Test14";
// import VocabularyScaleTest from "./components/VocabularyScaleTest/VocabularyScaleTest"; // Import the new test component

// function App() {
//   const [students, setStudents] = useState([]);
//   const [tests, setTests] = useState([]);
//   const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const checkAuth = async () => {
//       const token = localStorage.getItem("access_token");
//       const currentPath = window.location.pathname;
//       const publicRoutes = ["/login", "/register"];

//       if (token) {
//         try {
//           const isValid = await verifyToken(token);
//           if (isValid && publicRoutes.includes(currentPath)) {
//             navigate("/");
//           }
//         } catch (error) {
//           console.error("Authentication check failed:", error); // Log the error
//           if (!publicRoutes.includes(currentPath)) {
//             navigate("/login");
//           }
//         } // <<< Add missing closing brace for catch block
//       } else if (!publicRoutes.includes(currentPath)) {
//         // This else if corresponds to the `if (token)`
//         navigate("/login");
//       }
//     };

//     checkAuth();
//     setTests(testsData);
//   }, [navigate]);

//   const verifyToken = async (token) => {
//     try {
//       const response = await axios.get(`${backendURL}/validateUser`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.data.valid) {
//         setIsAuthenticated(true);
//         fetchData(); // Fetch students after token validation
//       } else {
//         setIsAuthenticated(false);
//         localStorage.removeItem("token");
//         navigate("/login");
//       }
//     } catch (error) {
//       console.error("Error validating token:", error);
//       setIsAuthenticated(false);
//       localStorage.removeItem("token");
//       navigate("/login");
//     }
//   };

//   const fetchData = async () => {
//     try {
//       const studentRes = await fetch(`${backendURL}/getChildrenByTeacher`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//         },
//       });

//       if (!studentRes.ok) {
//         throw new Error("Failed to fetch data");
//       }

//       const students = await studentRes.json();
//       setStudents(students.children);
//     } catch (error) {
//       console.error("Error fetching data:", error);
//     }
//   };

//   const handleSidebarToggle = (expand) => {
//     setIsSidebarExpanded(expand);
//   };

//   const handleLogin = () => {
//     setIsAuthenticated(true);
//     fetchData();
//     navigate("/");
//   };

//   const handleLogout = () => {
//     clearAuth();
//     setIsAuthenticated(false);
//     navigate("/login");
//   };

//   // const handleTestSelect = (testId) => {
//   //   setSelectedTest(testId); // Store the selected test ID
//   //   navigate("/selectstudent"); // Navigate to ClassPage to select student
//   // };

//   return (
//     <div className="h-screen overflow-hidden  ">
//       {isAuthenticated && (
//         <SideNavBar onToggle={handleSidebarToggle} handleLogout={handleLogout}>
//           <SideNavBarItem
//             icon={<GrHomeRounded className="text-grey" size={21} />}
//             text="Dashboard"
//             route="/"
//           />
//           <SideNavBarItem
//             icon={<RiGraduationCapLine className="text-grey" size={21} />}
//             text="Classroom"
//             route="/myclass"
//           />
//           <SideNavBarItem
//             icon={<MdOutlineEventNote className="text-grey" size={24} />}
//             text="Tests"
//             route="/taketests"
//           />
//         </SideNavBar>
//       )}

//       <main
//         className={`transition-all duration-300 ${
//           isAuthenticated && isSidebarExpanded
//             ? "ml-80"
//             : isAuthenticated
//             ? "ml-20"
//             : ""
//         }`}
//       >
//         <Routes>
//           <Route path="/login" element={<Login onLogin={handleLogin} />} />
//           <Route
//             path="/"
//             element={
//               <PrivateRoute>
//                 <Home students={students} tests={tests} />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/register"
//             element={
//               <PrivateRoute>
//                 <Register />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/myclass"
//             element={
//               <PrivateRoute>
//                 <MyClass students={students} />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/analytics"
//             element={
//               <PrivateRoute>
//                 <Analytics students={students} />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/taketests"
//             element={
//               <PrivateRoute>
//                 <TakeTests tests={tests} />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test16"
//             element={
//               <PrivateRoute>
//                 <SoundDiscriminationTest />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test8"
//             element={
//               <PrivateRoute>
//                 <AudioQuiz />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test6"
//             element={
//               <PrivateRoute>
//                 <Test />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test7"
//             element={
//               <PrivateRoute>
//                 <PictureRecognition />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test5"
//             element={
//               <PrivateRoute>
//                 <GraphemeTest />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test10"
//             element={
//               <PrivateRoute>
//                 <SymbolSequence />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test14"
//             element={
//               <PrivateRoute>
//                 <Test14 />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test9"
//             element={
//               <PrivateRoute>
//                 <Test7 />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/results"
//             element={
//               <PrivateRoute>
//                 <AfterTest />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/settings"
//             element={
//               <PrivateRoute>
//                 <Settings />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/support"
//             element={
//               <PrivateRoute>
//                 <Support />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/userprofile"
//             element={
//               <PrivateRoute>
//                 <User />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/empty"
//             element={
//               <PrivateRoute>
//                 <EmptyPage />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/testreports"
//             element={
//               <PrivateRoute>
//                 <TestResultsTable />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/selectstudent"
//             element={
//               <PrivateRoute>
//                 <ClassPage students={students} />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test13"
//             element={
//               <PrivateRoute>
//                 <DigitSpanTest />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/continuousassessment"
//             element={
//               <PrivateRoute>
//                 <ContinuousAssessment />
//               </PrivateRoute>
//             }
//           />
//           <Route
//             path="/test2"
//             element={
//               <PrivateRoute>
//                 <VocabularyScaleTest />
//               </PrivateRoute>
//             }
//           />
//         </Routes>
//       </main>
//     </div>
//   );
// }

// export default App;




import { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import SideNavBar, { SideNavBarItem } from "./components/SideNavBar";
import { GrHomeRounded } from "react-icons/gr";
import { RiGraduationCapLine } from "react-icons/ri";
import { MdOutlineEventNote } from "react-icons/md";
import axios from "axios";
import Home from "./pages/Home";
import MyClass from "./pages/MyClass";
import TakeTests from "./pages/TakeTests";
import SoundDiscriminationTest from "./components/test 16/Test16";
import AudioQuiz from "./components/test 8/Test8";
import Test from "./components/test 6/Test6";
import Settings from "./pages/Settings";
import Support from "./pages/Support";
import User from "./pages/User";
import Login from "./pages/login";
import EmptyPage from "./pages/EmptyPage";
import TestResultsTable from "./pages/TestResultsPage";
import ClassPage from "./pages/ClassPage";
import PrivateRoute from "./components/PrivateRoute";
import testsData from "./Data/tests.json";
import { backendURL } from "./definedURL";
import { clearAuth } from "./utils/authHelper";
import AfterTest from "./components/test 6/AfterTest";
import PictureRecognition from "./components/test 7/Test7";
import GraphemeTest from "./components/test 5/Test5";
import DigitSpanTest from "./components/test 13/Test13";
import Test7 from "./components/Sequence_arrangement/sequenceArrangement";
import SymbolSequence from "./components/SymbolSequence/SymbolSequence";
import ContinuousAssessment from "./components/ContinuousAssessment";
import Register from "./pages/Register";
import Analytics from "./pages/Analytics";
import Test14 from "./components/test 14/Test14";
import VocabularyScaleTest from "./components/VocabularyScaleTest/VocabularyScaleTest";
import AgeVerificationDialog from "./components/ui/AgeVerificationDialog";

function App() {
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [showAgeDialog, setShowAgeDialog] = useState(false);
  const [showConsentRequired, setShowConsentRequired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      const currentPath = window.location.pathname;
      const publicRoutes = ["/login", "/register"];
      const isVerified = localStorage.getItem("age_verified") === "true";
      
      setIsAgeVerified(isVerified);

      if (token) {
        try {
          const isValid = await verifyToken(token);
          if (isValid && publicRoutes.includes(currentPath)) {
            if (isVerified) {
              navigate("/");
            } else {
              setShowAgeDialog(true);
            }
          }
        } catch (error) {
          console.error("Authentication check failed:", error);
          if (!publicRoutes.includes(currentPath)) {
            navigate("/login");
          }
        }
      } else if (!publicRoutes.includes(currentPath)) {
        navigate("/login");
      }
    };

    checkAuth();
    setTests(testsData);
  }, [navigate]);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${backendURL}/validateUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.valid) {
        setIsAuthenticated(true);
        const isVerified = localStorage.getItem("age_verified") === "true";
        if (isVerified) {
          fetchData();
        } else {
          setShowAgeDialog(true);
        }
        return true;
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        navigate("/login");
        return false;
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      navigate("/login");
      return false;
    }
  };

  const fetchData = async () => {
    try {
      const studentRes = await fetch(`${backendURL}/getChildrenByTeacher`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!studentRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const students = await studentRes.json();
      setStudents(students.children);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSidebarToggle = (expand) => {
    setIsSidebarExpanded(expand);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    const isVerified = localStorage.getItem("age_verified") === "true";
    
    if (isVerified) {
      fetchData();
      navigate("/");
    } else {
      setShowAgeDialog(true);
      setShowConsentRequired(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setIsAuthenticated(false);
    setIsAgeVerified(false);
    setShowAgeDialog(false);
    setShowConsentRequired(false);
    localStorage.removeItem("age_verified");
    navigate("/login");
  };

  const handleAgeVerified = () => {
    setIsAgeVerified(true);
    setShowAgeDialog(false);
    setShowConsentRequired(false);
    localStorage.setItem("age_verified", "true");
    fetchData();
    navigate("/");
  };

  const handleAgeRejected = () => {
    setShowAgeDialog(false);
    setShowConsentRequired(true);
  };

  // Test component wrapper with age verification
  const TestWithAgeVerification = ({ component: Component }) => {
    const [isTestVerified, setIsTestVerified] = useState(false);

    if (!isTestVerified) {
      return (
        <AgeVerificationDialog 
          onVerified={() => setIsTestVerified(true)} 
          onRejected={() => navigate("/taketests")} 
        />
      );
    }

    return <Component />;
  };

  // Show consent required dialog when user clicks "No" on age verification
  if (isAuthenticated && showConsentRequired) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-md">
        <div className="w-full max-w-md p-6 mx-4 bg-white rounded-2xl shadow-xl transform transition-all duration-500 ease-out">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">We Need Permission</h2>
            <p className="text-blue-600 mb-6">Without consent, we cannot proceed to the site.</p>
            <button 
              onClick={handleLogout}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium transition-all duration-300 hover:bg-blue-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show age verification dialog after login if not already verified
  if (isAuthenticated && showAgeDialog && !isAgeVerified) {
    return (
      <AgeVerificationDialog 
        onVerified={handleAgeVerified} 
        onRejected={handleAgeRejected}
      />
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      {isAuthenticated && isAgeVerified && (
        <SideNavBar onToggle={handleSidebarToggle} handleLogout={handleLogout}>
          <SideNavBarItem
            icon={<GrHomeRounded className="text-grey" size={21} />}
            text="Dashboard"
            route="/"
          />
          <SideNavBarItem
            icon={<RiGraduationCapLine className="text-grey" size={21} />}
            text="Classroom"
            route="/myclass"
          />
          <SideNavBarItem
            icon={<MdOutlineEventNote className="text-grey" size={24} />}
            text="Tests"
            route="/taketests"
          />
        </SideNavBar>
      )}

      <main
        className={`transition-all duration-300 ${
          isAuthenticated && isAgeVerified && isSidebarExpanded
            ? "ml-80"
            : isAuthenticated && isAgeVerified
            ? "ml-20"
            : ""
        }`}
      >
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home students={students} tests={tests} />
              </PrivateRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PrivateRoute>
                <Register />
              </PrivateRoute>
            }
          />
          <Route
            path="/myclass"
            element={
              <PrivateRoute>
                <MyClass students={students} />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics students={students} />
              </PrivateRoute>
            }
          />
          <Route
            path="/taketests"
            element={
              <PrivateRoute>
                <TakeTests tests={tests} />
              </PrivateRoute>
            }
          />
          <Route
            path="/test16"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={SoundDiscriminationTest} />
              </PrivateRoute>
            }
          />
          <Route
            path="/test8"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={AudioQuiz} />
              </PrivateRoute>
            }
          />
          <Route
            path="/test6"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={Test} />
              </PrivateRoute>
            }
          />
          <Route
            path="/test7"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={PictureRecognition} />
              </PrivateRoute>
            }
          />
          <Route
            path="/test5"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={GraphemeTest} />
              </PrivateRoute>
            }
          />
          <Route
            path="/test10"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={SymbolSequence} />
              </PrivateRoute>
            }
          />
          <Route
            path="/test14"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={Test14} />
              </PrivateRoute>
            }
          />
          <Route
            path="/test9"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={Test7} />
              </PrivateRoute>
            }
          />
          <Route
            path="/results"
            element={
              <PrivateRoute>
                <AfterTest />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/support"
            element={
              <PrivateRoute>
                <Support />
              </PrivateRoute>
            }
          />
          <Route
            path="/userprofile"
            element={
              <PrivateRoute>
                <User />
              </PrivateRoute>
            }
          />
          <Route
            path="/empty"
            element={
              <PrivateRoute>
                <EmptyPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/testreports"
            element={
              <PrivateRoute>
                <TestResultsTable />
              </PrivateRoute>
            }
          />
          <Route
            path="/selectstudent"
            element={
              <PrivateRoute>
                <ClassPage students={students} />
              </PrivateRoute>
            }
          />
          <Route
            path="/test13"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={DigitSpanTest} />
              </PrivateRoute>
            }
          />
          <Route
            path="/continuousassessment"
            element={
              <PrivateRoute>
                <ContinuousAssessment />
              </PrivateRoute>
            }
          />
          <Route
            path="/test2"
            element={
              <PrivateRoute>
                <TestWithAgeVerification component={VocabularyScaleTest} />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;