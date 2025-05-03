import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Text,
  Button,
  Input,
  VStack,
  useToast,
  Divider,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import MainHeader from "../shared/MainHeader";

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [updatedName, setUpdatedName] = useState("");
  const [updatedPassword, setUpdatedPassword] = useState("");
  const [updatedCourses, setUpdatedCourses] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [addCourses, setAddCourses] = useState("");
  const [removeCourses, setRemoveCourses] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token not found. Please log in again.");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
      } catch (err) {
        setError(
          "Error fetching profile: " +
            (err.response?.data?.message || err.message)
        );
      }
    };

    fetchProfile();
  }, [toast]);

  // const handleUpdate = async () => {
  //   if (!updatedName && !updatedPassword && !updatedCourses) {
  //     toast({
  //       title: "Nothing to update",
  //       status: "info",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //     return;
  //   }

  //   try {
  //     const token = localStorage.getItem("token");

  //     const payload = {
  //       ...(updatedName && { fullname: updatedName }),
  //       ...(updatedPassword && { password: updatedPassword }),
  //       ...(updatedCourses && {
  //         courses: updatedCourses.split(",").map((c) => c.trim()),
  //       }),
  //     };

  //     const response = await axios.put(
  //       "http://localhost:5000/api/users/profile",
  //       payload,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     setUser(response.data);
  //     setUpdatedName("");
  //     setUpdatedPassword("");
  //     setUpdatedCourses("");

  //     toast({
  //       title: "Profile updated successfully!",
  //       status: "success",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   } catch (err) {
  //     toast({
  //       title: "Failed to update profile",
  //       description: err.response?.data?.message || err.message,
  //       status: "error",
  //       duration: 3000,
  //       isClosable: true,
  //     });
  //   }
  // };

  const handleUpdate = async () => {
    if (!updatedName && !updatedPassword && !addCourses && !removeCourses) {
      toast({
        title: "Nothing to update",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      let updatedCourseList = [...(user.courses || [])];

      if (addCourses) {
        const newCourses = addCourses
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
        newCourses.forEach((course) => {
          if (!updatedCourseList.includes(course)) {
            updatedCourseList.push(course);
          }
        });
      }

      if (removeCourses) {
        const removeList = removeCourses
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
        updatedCourseList = updatedCourseList.filter(
          (course) => !removeList.includes(course)
        );
      }

      const payload = {
        ...(updatedName && { fullname: updatedName }),
        ...(updatedPassword && { password: updatedPassword }),
        courses: updatedCourseList,
      };

      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
      setUpdatedName("");
      setUpdatedPassword("");
      setAddCourses("");
      setRemoveCourses("");

      toast({
        title: "Profile updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to update profile",
        description: err.response?.data?.message || err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleGoToInputForm = () => {
    navigate("/input");
  };

  return (
    <>
      <MainHeader />
      <Box p={8} maxW="700px" mx="auto">
        <Heading size="lg" mb={6}>
          User Profile
        </Heading>

        {error && (
          <Text color="red.500" mb={4}>
            {error}
          </Text>
        )}

        {/* Display Current Details */}
        <Box mb={6}>
          <Text fontWeight="bold">Current Full Name:</Text>
          <Text mb={2}>{user.fullname}</Text>

          <Text fontWeight="bold">Email:</Text>
          <Text mb={2}>{user.email}</Text>

          <Text fontWeight="bold">Role:</Text>
          <Text mb={2}>{user.role}</Text>

          <Text fontWeight="bold">Courses:</Text>
          <Text>
            {Array.isArray(user.courses)
              ? user.courses.join(", ")
              : user.courses}
          </Text>
        </Box>

        <Divider my={4} />

        {/* Toggle Button */}
        <Button
          colorScheme="gray"
          onClick={() => setShowUpdateForm((prev) => !prev)}
          mb={4}
        >
          {showUpdateForm
            ? "Hide Update Form"
            : "Want to update profile details?"}
        </Button>

        {/* Editable Fields */}
        {showUpdateForm && (
          <VStack spacing={4} align="stretch">
            <Input
              placeholder="Update Full Name"
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
            />
            <Input
              placeholder="Update Password"
              type="password"
              value={updatedPassword}
              onChange={(e) => setUpdatedPassword(e.target.value)}
            />
            <Input
              placeholder="Add Courses (comma-separated)"
              value={addCourses}
              onChange={(e) => setAddCourses(e.target.value)}
            />
            <Input
              placeholder="Remove Courses (comma-separated)"
              value={removeCourses}
              onChange={(e) => setRemoveCourses(e.target.value)}
            />

            <Button colorScheme="blue" onClick={handleUpdate}>
              Update Profile
            </Button>
          </VStack>
        )}
        <Box mt={6} display="flex" justifyContent="center">
          <Button colorScheme="teal" onClick={handleGoToInputForm}>
            Go to Input Form
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default UserProfile;
