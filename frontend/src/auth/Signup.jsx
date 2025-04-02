import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // ShadCN UI Button
import { Card, CardContent } from "@/components/ui/card";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Flex, Box, Text, Input, Divider } from "@chakra-ui/react"; // Chakra UI

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    if (fullName && email && password) {
      alert("Account created successfully!");
      navigate("/login"); // Redirect to login page after signup
    } else {
      alert("Please fill in all fields!");
    }
  };

  return (
    <Flex
      className="relative min-h-screen"
      align="center"
      justify="center"
      bgImage="url('/t1.jpg')"
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
        <Button variant="ghost" className="text-white hover:bg-white hover:text-black" onClick={() => navigate("/")}>
          Home
        </Button>
      </Flex>

      {/* Signup Card */}
      <Card className="w-[400px] bg-white/90 shadow-xl rounded-2xl p-6 backdrop-blur-md">
        <CardContent className="flex flex-col items-center">
          <Text fontSize="2xl" fontWeight="bold" color="gray.800" mb={2}>
            Create an Account
          </Text>
          <Text color="gray.500" mb={6}>
            Join us today!
          </Text>

          {/* Input Fields */}
          <Input
            type="text"
            placeholder="Full Name"
            size="lg"
            variant="filled"
            focusBorderColor="indigo.500"
            className="w-full mb-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
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

          {/* Signup Button */}
          <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700" onClick={handleSignup}>
            Sign Up
          </Button>

          {/* Divider */}
          <Divider my={4} />

          {/* OAuth Buttons */}
          <Flex gap={4} w="full">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <FaGoogle className="text-red-500" />
              Sign up with Google
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <FaGithub className="text-black" />
              Sign up with GitHub
            </Button>
          </Flex>

          {/* Login Link */}
          <Text mt={4} fontSize="sm" color="gray.600">
            Already have an account?{" "}
            <span
              className="text-indigo-600 cursor-pointer hover:underline"
              onClick={() => navigate("/login")}
            >
              Log in
            </span>
          </Text>
        </CardContent>
      </Card>
    </Flex>
  );
};

export default Signup;
