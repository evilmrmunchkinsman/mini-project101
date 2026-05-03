// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import askRoutes from "./routes/ask.js";

dotenv.config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"));

app.use("/auth", authRoutes);
app.use("/api", askRoutes);

app.listen(5000, () => console.log("Server running"));