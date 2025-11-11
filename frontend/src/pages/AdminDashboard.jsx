import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Text,
  VStack,
  Button,
  Input,
  Select,
  HStack,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; 
import MainHeader from "../shared/MainHeader";


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    fullname: "",
    email: "",
    password: "",
    role: "user",
    courses: [],
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const toast = useToast();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users");
      console.log(res.data); 
      setUsers(res.data);
    } catch (err) {
      toast({
        title: "Error fetching users",
        description: err.message,
        status: "error",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async () => {
    try {
      await axios.post("http://localhost:5000/api/users", newUser);
      toast({ title: "User added!", status: "success" });
      fetchUsers();
      setNewUser({ fullname: "", email: "", password: "", role: "user", courses: [] });
    } catch (err) {
      toast({
        title: "Error adding user",
        description: err.message,
        status: "error",
      });
    }
  };
  

  const handleUpdateUser = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${editingUserId}`,
        editedUser
      );
      toast({ title: "User updated!", status: "success" });
      setEditingUserId(null);
      setEditedUser(null);
      fetchUsers();
    } catch (err) {
      toast({
        title: "Error updating user",
        description: err.message,
        status: "error",
      });
    }
  };

  const handleGoToInputForm = () => navigate("/input");

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
            value={newUser.fullname}
            onChange={(e) =>
              setNewUser({ ...newUser, fullname: e.target.value })
            }
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
            onChange={(e) =>
              setNewUser({ ...newUser, password: e.target.value })
            }
          />
          <Input
            placeholder="Courses (comma-separated)"
            value={newUser.courses.join(", ")}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                courses: e.target.value.split(",").map((c) => c.trim()),
              })
            }
          />
          <Select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Select>
          <Button colorScheme="blue" onClick={handleAddUser}>
            Add User
          </Button>
        </VStack>

        {/* Users List */}
        <Box>
          <Text fontWeight="semibold" mb={2}>
            Registered Users:
          </Text>
          <VStack spacing={3}>
            {users.map((user) => (
              <Box
                key={user._id}
                w="100%"
                p={3}
                border="1px solid #ccc"
                borderRadius="md"
              >
                {editingUserId === user._id ? (
                  <>
                    <Input
                      value={editedUser.fullname}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          fullname: e.target.value,
                        })
                      }
                    />
                    <Input
                      value={editedUser.email}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, email: e.target.value })
                      }
                    />
                    <Input
                      placeholder="New Password"
                      value={editedUser.password || ""}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          password: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Courses (comma-separated)"
                      value={(editedUser.courses || []).join(", ")}
                      onChange={(e) =>
                        setEditedUser({
                          ...editedUser,
                          courses: e.target.value
                            .split(",")
                            .map((c) => c.trim()),
                        })
                      }
                    />
                    <Select
                      value={editedUser.role}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser, role: e.target.value })
                      }
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </Select>
                    <HStack>
                      <Button colorScheme="green" onClick={handleUpdateUser}>
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingUserId(null);
                          setEditedUser(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  </>
                ) : (
                  <HStack justify="space-between" w="100%">
                    <Box>
                      <Text fontWeight="bold">{user.fullname}</Text>
                      <Text fontSize="sm">{user.email}</Text>
                      <Text fontSize="sm" color="gray.500">
                        Role: {user.role}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Courses: {user.courses?.join(", ") || "N/A"}
                      </Text>
                    </Box>
                    <HStack>
                      <Button
                        size="sm"
                        colorScheme="yellow"
                        onClick={() => {
                          setEditingUserId(user._id);
                          setEditedUser({
                            fullname: user.fullname,
                            email: user.email,
                            role: user.role,
                            courses: user.courses || [],
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        onClick={async () => {
                          await axios.delete(
                            `http://localhost:5000/api/users/${user._id}`
                          );
                          fetchUsers();
                        }}
                      >
                        Delete
                      </Button>
                    </HStack>
                  </HStack>
                )}
              </Box>
            ))}
          </VStack>
        </Box>

        <Button mt={6} colorScheme="teal" onClick={handleGoToInputForm}>
          Go to Input Form
        </Button>
      </Box>
    </>
  );
};

export default AdminDashboard;
