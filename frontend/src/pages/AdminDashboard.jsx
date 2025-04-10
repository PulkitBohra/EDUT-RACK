import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Text, VStack, Button, Input, Select, HStack, useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // Import useHistory for navigation
import MainHeader from '../shared/MainHeader';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const toast = useToast();
  const navigate = useNavigate(); // Hook for navigation

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      setUsers(res.data); // Assuming the response is an array of users
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast({
        title: "Error fetching users",
        description: err.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users when the component mounts
  }, []);

  const handleAddUser = async () => {
    try {
      await axios.post("http://localhost:5000/api/users", newUser); // API endpoint to add new user
      toast({
        title: "User added!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchUsers(); // Reload the user list
      setNewUser({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      toast({
        title: "Error adding user",
        description: err.message,
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
          Admin Dashboard
        </Text>

        {/* Add New User */}
        <VStack spacing={4} mb={6} align="start">
          <Text fontWeight="semibold">Add New User:</Text>
          <Input
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <Input
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <Input
            placeholder="Password"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <Select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
          <Button colorScheme="blue" onClick={handleAddUser}>Add User</Button>
        </VStack>

        {/* Users List */}
        <Box>
          <Text fontWeight="semibold" mb={2}>Registered Users:</Text>
          <VStack spacing={3}>
            {users.map((user) => (
              <HStack key={user._id} justify="space-between" border="1px solid #ccc" p={3} borderRadius="md">
                <Box>
                  <Text fontWeight="bold">{user.name}</Text>
                  <Text fontSize="sm">{user.email}</Text>
                  <Text fontSize="sm" color="gray.500">Role: {user.role}</Text>
                </Box>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={async () => {
                    await axios.delete(`http://localhost:5000/api/users/${user._id}`);
                    fetchUsers(); // Refresh the user list after deletion
                  }}
                >
                  Delete
                </Button>
              </HStack>
            ))}
          </VStack>
        </Box>

        {/* Button to navigate to the input form */}
        <Button colorScheme="teal" onClick={handleGoToInputForm}>
          Go to Input Form
        </Button>
      </Box>
    </>
  );
};

export default AdminDashboard;
