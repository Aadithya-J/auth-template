import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const location = useLocation();

  const publicRoutes = ["/login", "/register"];

  if (token && publicRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }

  if (!token && !publicRoutes.includes(location.pathname)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;
