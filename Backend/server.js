import express from "express";
import cors from "cors"
import dotenv from "dotenv";
import childRoutes from "./routes/childRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import visualRoutes from "./routes/visualRoute.js";
<<<<<<< HEAD

=======
import pictureRoutes from "./routes/pictureRoutes.js";
import graphemeRoutes from "./routes/graphemeRoutes.js";
import sequenceRoutes from "./routes/sequenceRoutes.js";
>>>>>>> bcd838a2c5092bc4f7547a2187ee8ed2275bf7fa

app.use(
  cors({
    origin: ["https://jiveesha.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/", authRoutes);
app.use("/",childRoutes);
app.use("/",testRoutes);
app.use("/", visualRoutes);
<<<<<<< HEAD

// Start server
=======
app.use("/", pictureRoutes);
app.use("/", graphemeRoutes);
app.use("/api", sequenceRoutes);

>>>>>>> bcd838a2c5092bc4f7547a2187ee8ed2275bf7fa
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
