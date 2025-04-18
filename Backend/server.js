import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
import childRoutes from "./routes/childRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import testRoutes from "./routes/testRoutes.js";
import visualRoutes from "./routes/visualRoute.js";
import pictureRoutes from "./routes/pictureRoutes.js";
import graphemeRoutes from "./routes/graphemeRoutes.js";
import sequenceRoutes from "./routes/sequenceRoutes.js";

app.use(
  cors({
    origin: ["https://jiveesha.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.use("/", authRoutes);
app.use("/", childRoutes);
app.use("/", testRoutes);
app.use("/", visualRoutes);
app.use("/", pictureRoutes);
app.use("/", graphemeRoutes);
app.use("/api", sequenceRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
