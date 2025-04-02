import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage"; // Import the HomePage component
import Login from "../auth/Login";        // Import Login component
import Signup from "../auth/Signup";      // Import Signup component
import UploadExcel from "../upload/UploadExcel"; 
import InputForm from "@/form/InputForm";
import ComponentNames from "@/form/ComponentNames";


const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/upload" element={<UploadExcel />} />
      <Route path="/components" element={<ComponentNames />} />
      <Route path="/input" element={<InputForm />} />
    </Routes>
  );
};

export default AppRouter;
