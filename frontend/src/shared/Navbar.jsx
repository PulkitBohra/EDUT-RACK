import React from "react";
import { useNavigate } from "react-router-dom";
import { Flex, Box, Text, Image, Button } from "@chakra-ui/react"; // Chakra UI components

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <Flex
      as="nav"
      bg="#8c1616"
      color="white"
      py={4}
      px={6}
      align="center"
      justify="space-between"
      className="relative z-50 shadow-lg"
    >
      {/* Left: Logo */}
      <Box>
        <Image src="/LNMIIT-LOGO.jpg" alt="LNMIIT Logo" h="56px" />
      </Box>

      {/* Center: Title */}
      <Box textAlign="center">
        <Text fontSize="lg" fontWeight="bold">
          LNM Institute of Information Technology
        </Text>
        <Text fontSize="sm" opacity={0.9}>
          Deemed to be University
        </Text>
      </Box>

      {/* Right: Navigation Links & Buttons */}
      <Flex align="center" gap={6} mr={6}>
        <Text
          className="cursor-pointer hover:bg-white hover:text-[#8c1616] px-4 py-2 rounded-md transition duration-300"
          onClick={() => navigate("/")}
        >
          Home
        </Text>
        <Text
          className="cursor-pointer hover:bg-white hover:text-[#8c1616] px-4 py-2 rounded-md transition duration-300"
          onClick={() => navigate("/about")}
        >
          About
        </Text>

        {/* Buttons */}
        <Flex gap={4}>
          <Button
            variant="solid"
            bg="white"
            color="#8c1616"
            className="cursor-pointer hover:bg-[#8c1616] hover:text-white px-4 py-2 rounded-md transition duration-300"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            variant="solid"
            bg="white"
            color="#8c1616"
            className="cursor-pointer hover:bg-[#8c1616] hover:text-white px-4 py-2 rounded-md transition duration-300"
            onClick={() => navigate("/signup")}
          >
            Signup
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default Navbar;
