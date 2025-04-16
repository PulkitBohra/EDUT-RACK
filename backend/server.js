require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Routes
const authRoutes = require('./routes/authRoutes');

// Import User model correctly
const User = require('./models/User'); // ✅ FIXED

// Middleware
app.use(express.json());
const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", "http://localhost:5000"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("Error connecting to MongoDB:", err));

// Auth routes
app.use('/api/auth', authRoutes);

// API route to fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, 'fullname email role courses');  // Make sure only necessary fields are returned
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});


// API route to create a new user
app.post("/api/users", async (req, res) => {
  try {
    const { fullname, email, role, courses, password } = req.body;

    // If no password is provided, set a default password
    const userPassword = password || "defaultpassword123";

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ fullname, email, role, courses, password: userPassword });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error creating user:", err);  // More detailed logging
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
});



app.put("/api/users/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating user" });
  }
});

app.delete("/api/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
