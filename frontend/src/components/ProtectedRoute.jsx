import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Assuming you have context for authentication

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Check if the user is authenticated

  // If no user is logged in, redirect to the login page
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If the user is authenticated, render the children (the protected route)
  return children;
};

export default ProtectedRoute;
