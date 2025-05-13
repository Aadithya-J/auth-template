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
import { clearAuth, validateToken } from "./utils/authHelper";
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
import { LanguageProvider } from "../src/contexts/LanguageContext";
// Speech Recognition setup
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";
}

function App() {
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAgeVerified, setIsAgeVerified] = useState(false);
  const [showAgeDialog, setShowAgeDialog] = useState(false);
  const [showConsentRequired, setShowConsentRequired] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeechSupported, setIsSpeechSupported] = useState(!!recognition);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      const currentPath = window.location.pathname;
      const publicRoutes = ["/login", "/register"];
      const isVerified = localStorage.getItem("age_verified") === "true";

      console.log("Checking auth. Current path:", currentPath);
      setIsAgeVerified(isVerified);

      if (token) {
        try {
          const isValid = await validateToken(token);
          console.log("Token validation result:", isValid);

          if (isValid) {
            setIsAuthenticated(true);
            if (publicRoutes.includes(currentPath)) {
              if (isVerified) {
                navigate("/");
              } else {
                setShowAgeDialog(true);
              }
            } else if (!isVerified && !showAgeDialog) {
              setShowAgeDialog(true);
            }
          } else {
            console.log("Token invalid, logging out");
            setIsAuthenticated(false);
            if (!publicRoutes.includes(currentPath)) {
              navigate("/login");
            }
          }
        } catch (error) {
          console.error("Authentication check failed:", error);
          setIsAuthenticated(false);
          if (!publicRoutes.includes(currentPath)) {
            navigate("/login");
          }
        }
      } else if (!publicRoutes.includes(currentPath)) {
        console.log("No token found, redirecting to login");
        navigate("/login");
      }
      setAuthChecked(true);
    };

    if (!authChecked) {
      checkAuth();
    }

    setTests(testsData);

    // Clean up speech recognition on unmount
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [navigate, authChecked, showAgeDialog]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      // Handle navigation commands
      if (finalTranscript) {
        handleVoiceCommand(finalTranscript.trim().toLowerCase());
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [isListening]);

  const handleVoiceCommand = (command) => {
    switch (command) {
      case "go home":
      case "home":
        navigate("/");
        break;
      case "go to classroom":
      case "classroom":
        navigate("/myclass");
        break;
      case "go to tests":
      case "tests":
        navigate("/taketests");
        break;
      case "go to analytics":
      case "analytics":
        navigate("/analytics");
        break;
      case "go to settings":
      case "settings":
        navigate("/settings");
        break;
      case "go to support":
      case "support":
        navigate("/support");
        break;
      case "log out":
      case "logout":
        handleLogout();
        break;
      default:
        // Check for test navigation commands
        if (command.startsWith("go to test")) {
          const testNumber = command.split(" ")[2];
          if (testNumber) {
            navigate(`/test${testNumber}`);
          }
        }
        break;
    }
  };

  const toggleListening = () => {
    if (!isSpeechSupported) {
      alert("Speech recognition is not supported in your browser");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${backendURL}/validateUser`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.valid;
    } catch (error) {
      console.error("Error validating token:", error);
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

  const handleAgeVerified = async () => {
    setIsAgeVerified(true);
    setShowAgeDialog(false);
    setShowConsentRequired(false);
    localStorage.setItem("age_verified", "true");
    try {
      await fetchData();
      navigate("/");
    } catch (error) {
      console.error("Error fetching data after age verification:", error);
    }
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
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              Permission Required
            </h2>
            <p className="text-blue-600 mb-6">
              Parental consent is needed to use this site. Please log out.
            </p>
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
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden">
        {isAuthenticated && isAgeVerified && (
          <>
            <SideNavBar
              onToggle={handleSidebarToggle}
              handleLogout={handleLogout}
            >
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

            {/* Voice control button */}
            {[
              "/",
              "/viewstudents",
              "/taketests",
              "/analytics",
              "/testreports",
            ].includes(location.pathname) && (
              <button
                onClick={toggleListening}
                className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg ${
                  isListening ? "bg-red-500 animate-pulse" : "bg-blue-500"
                } text-white`}
                title={
                  isListening
                    ? "Listening... Click to stop"
                    : "Start voice control"
                }
              >
                {isListening ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </button>
            )}

            {/* Voice command feedback */}
            {isListening && (
              <div className="fixed bottom-20 right-4 z-50 p-4 bg-white rounded-lg shadow-lg max-w-xs">
                <p className="text-sm font-medium text-gray-700">
                  Listening...
                </p>
                {transcript && (
                  <p className="text-sm text-gray-500 mt-1">"{transcript}"</p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Try saying: "go to tests", "go home", or "log out"
                </p>
              </div>
            )}
          </>
        )}

        <main
          className={`flex-grow overflow-y-auto transition-all duration-300`}
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
              path="/viewstudents"
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
                  <TestWithAgeVerification
                    component={SoundDiscriminationTest}
                  />
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
    </LanguageProvider>
  );
}

export default App;
