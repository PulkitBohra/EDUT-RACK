require('dotenv').config();  // Ensure dotenv is required at the top
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000; // Default to 5000 if PORT is not set

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors()); // Optional: enables cross-origin requests

// MongoDB connection using environment variable
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Error connecting to MongoDB:", err));

// User model (replace with your actual user schema)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
});

const User = mongoose.model("User", userSchema);

// API route to fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find(); // Get all users from the database
    res.json(users); // Respond with the users in JSON format
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// API route to create a new user
app.post("/api/users", async (req, res) => {
    try {
      const { name, email, role } = req.body;
  
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
      // Create a new user
      const newUser = new User({ name, email, role });
      await newUser.save();
  
      res.status(201).json(newUser);  // Respond with the newly created user
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ message: "Error creating user" });
    }
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
