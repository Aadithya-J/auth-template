import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import SideNavBar, { SideNavBarItem } from "./components/SideNavBar";
import { GrHomeRounded } from "react-icons/gr";
import { RiGraduationCapLine } from "react-icons/ri";
import { MdOutlineEventNote } from "react-icons/md";

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
import testsData from "./Data/tests.json"; // Use dynamic import if needed
import { backendURL } from "./definedURL"; // Ensure this import is correct

function App() {
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    7;
    if (token) {
      verifyToken(token);
    } else {
      navigate("/login");
    }

    // Load tests.json data into the state
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
        fetchData(); // Fetch students after token validation
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setIsAuthenticated(false);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const fetchData = async () => {
    try {
      const studentRes = await fetch(`${backendURL}/getChildrenByTeacher`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
    fetchData();
    navigate("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login");
  };

  const handleTestSelect = (testId) => {
    setSelectedTest(testId); // Store the selected test ID
    navigate("/selectstudent"); // Navigate to ClassPage to select student
  };

  return (
    <div className="h-screen overflow-hidden  ">
      {isAuthenticated && (
        <SideNavBar onToggle={handleSidebarToggle} handleLogout={handleLogout}>
          <SideNavBarItem
            icon={<GrHomeRounded className="text-grey" size={21} />}
            text="Home"
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
          isAuthenticated && isSidebarExpanded
            ? "ml-80"
            : isAuthenticated
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
            path="/myclass"
            element={
              <PrivateRoute>
                <MyClass students={students} />
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
                <SoundDiscriminationTest />
              </PrivateRoute>
            }
          />
          <Route
            path="/test8"
            element={
              <PrivateRoute>
                <AudioQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/test6"
            element={
              <PrivateRoute>
                <Test />
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
        </Routes>
      </main>
    </div>
  );
}

export default App;
