const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const childRoutes = require("./routes/childRoutes"); // New routes
const testRoutes = require("./routes/testRoutes"); // New routes
const visualRoutes = require("./routes/visualRoute");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI =
  "mongodb+srv://shivkamp:niggesh@cluster0.gxq4s.mongodb.net/";
// "mongodb://localhost:27017/schonell"

// Connect to MongoDB
mongoose.connect(MONGODB_URI);
mongoose.connection.once("open", () => console.log("Connected to MongoDB"));

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());

// Use routes
app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/", childRoutes); // Added child routes
app.use("/", testRoutes); // Added test routes
app.use("/", visualRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
