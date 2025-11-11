require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const port = process.env.PORT || 5000;


const authRoutes = require("./routes/authRoutes");


const User = require("./models/User"); // ✅ FIXED


app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "https://edut-rack-backend.onrender.com",
  "https://edut-rack.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDB:", err));


app.use("/api/auth", authRoutes);


const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    req.user = { id: decoded.userId, role: decoded.role };
    console.log("Token verified, user:", req.user);
    next();
  });
};


app.get("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(
      req.user.id,
      "fullname email role courses"
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err); 
    res.status(500).json({ message: "Error fetching profile" });
  }
});

app.put("/api/users/profile", verifyToken, async (req, res) => {
  try {
    const { fullname, password, courses } = req.body;
    const updates = {};

    if (fullname) updates.fullname = fullname;
    if (courses) updates.courses = courses;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      updates,
      { new: true }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
});


app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "fullname email role courses");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Error fetching users" });
  }
});


app.post("/api/users", async (req, res) => {
  try {
    const { fullname, email, role, courses, password } = req.body;

   
    const userPassword = password || "defaultpassword123";

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    const newUser = new User({
      fullname,
      email,
      role,
      courses,
      password: hashedPassword,
    });
    await newUser.save();

    res.status(201).json(newUser);
  } catch (err) {
    console.error("Error creating user:", err); 
    res
      .status(500)
      .json({ message: "Error creating user", error: err.message });
  }
});


app.put("/api/users/:id", async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
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
