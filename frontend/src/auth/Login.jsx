import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; 
import { Card, CardContent } from "@/components/ui/card";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Flex, Box, Text, Input, Divider, Select } from "@chakra-ui/react"; 
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx"; 

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); 

  const handleLogin = async () => {
    if (!email || !password || !role) {
      alert("Please enter email and password and select a role");
      return;
    }

    try {
      const res = await axios.post("https://edut-rack-backend.onrender.com/api/auth/login", {
        email,
        password,
      });
      const { user, token } = res.data;

      if (role !== user.role) {
        alert(`You selected "${role}" but you are registered as "${user.role}".`);
        return;
      }


      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);

      login(user); 
      

      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/user-profile");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <Flex
      className="relative min-h-screen"
      align="center"
      justify="center"
      bgImage="url('/t.jpg')"
      bgSize="cover"
      bgPosition="center"
    >
      {/* Navbar */}
      <Flex
        as="nav"
        className="absolute top-0 left-0 w-full bg-black/30 text-white"
        py={4}
        px={8}
        align="center"
        justify="space-between"
      >
        <Text fontSize="xl" fontWeight="bold">
          EduTrack
        </Text>
        <Button
          variant="ghost"
          className="text-white hover:bg-white hover:text-black"
          onClick={() => navigate("/")}
        >
          Home
        </Button>
      </Flex>

      {/* Login Card */}
      <Card className="w-[400px] bg-white/90 shadow-xl rounded-2xl p-6 backdrop-blur-md">
        <CardContent className="flex flex-col items-center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Welcome Back!
          </Text>
          <Text color="gray.500" mb={6}>
            Sign in to your account
          </Text>

          {/* Input Fields */}
          <Input
            type="email"
            placeholder="Email"
            size="lg"
            variant="filled"
            focusBorderColor="indigo.500"
            className="w-full mb-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            size="lg"
            variant="filled"
            focusBorderColor="indigo.500"
            className="w-full mb-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* Role Dropdown (Using Chakra UI Select) */}
          <Select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            size="lg"
            className="w-full mb-4"
            focusBorderColor="indigo.500"
            placeholder="Select Role" 
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>

          {/* Login Button */}
          <Button
            className="w-full text-white font-bold transition duration-300"
            bg="#4F46E5"
            _hover={{
              bg: "#4338CA", 
              transform: "scale(1.05)", 
              boxShadow: "lg",
            }}
            _active={{
              bg: "#3730A3",
              transform: "scale(0.98)",
            }}
            borderRadius="md"
            py={2}
            boxShadow="md"
            onClick={handleLogin}
          >
            Login
          </Button>

          {/* Divider */}
          <Divider my={4} />

          {/* OAuth Buttons */}
          <Flex gap={4} w="full">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 
              hover:bg-gray-100 transition duration-300"
            >
              <FaGoogle className="text-red-500" />
              Sign in with Google
            </Button>
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2 
              hover:bg-gray-100 transition duration-300"
            >
              <FaGithub className="text-black" />
              Sign in with GitHub
            </Button>
          </Flex>

          {/* Signup Link */}
          <Text mt={4} fontSize="sm" color="gray.600">
            Don't have an account?{" "}
            <span
              className="text-indigo-600 cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </span>
          </Text>
        </CardContent>
      </Card>
    </Flex>
  );
};

export default Login;
