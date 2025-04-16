import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Text, Button, Input, VStack, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // Import useHistory for redirection
import MainHeader from "../shared/MainHeader";

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [updatedName, setUpdatedName] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/users/profile");
        setUser(res.data);
        setUpdatedName(res.data.name);
      } catch (err) {
        console.error("Error fetching profile");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      await axios.put("/api/users/profile", {
        name: updatedName,
        password: updatedPassword,
      });
      toast({
        title: "Profile updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleGoToInputForm = () => {
    navigate("/input"); // Replace "/input-form" with your actual path
  };

  return (
    <>
      <MainHeader />

      <Box p={8}>
        <Text fontSize="2xl" fontWeight="bold" mb={4}>
          User Profile
        </Text>
        <VStack spacing={4} align="start">
          <Text>Email: {user.email}</Text>
          <Input
            placeholder="Full Name"
            value={updatedName ?? ""}
            onChange={(e) => setUpdatedName(e.target.value)}
          />

          <Input
            placeholder="New Password"
            type="password"
            value={updatedPassword ?? ""}
            onChange={(e) => setUpdatedPassword(e.target.value)}
          />
          <Button colorScheme="blue" onClick={handleUpdate}>
            Update Profile
          </Button>
          {/* Button to navigate to the input form */}
          <Button colorScheme="teal" onClick={handleGoToInputForm}>
            Go to Input Form
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default UserProfile;
