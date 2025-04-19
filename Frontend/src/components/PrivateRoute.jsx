import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  const location = useLocation();
  
  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/register'];
  
  // If trying to access a public route while authenticated, redirect to home
  if (token && publicRoutes.includes(location.pathname)) {
    return <Navigate to="/" replace />;
  }
  
  // If trying to access a private route without authentication, redirect to login
  if (!token && !publicRoutes.includes(location.pathname)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default PrivateRoute;