import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import childRoutes from "./routes/childRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

import authRoutes from "./routes/authRoutes.js";


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
app.use("/",childRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
