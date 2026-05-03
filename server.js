import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config({ path: "./.env" });

import authRoutes from "./routes/Auth.js";
import adminRoutes from "./routes/Admin.js";
import studentRoutes from "./routes/Student.js";
import chatRoutes from "./routes/Chat.js";
// import adminRoutes from "./routes/admin.js";
// import chatRoutes from "./routes/chat.js"


const app = express();

// middleware
app.use(express.json());
app.use(cors());

// routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/", studentRoutes);
app.use("/chat", chatRoutes);
app.use("/admin", adminRoutes);
app.use("/chat", chatRoutes);

// DB connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB connected"))
.catch(err => console.log(err));


app.listen(5000, () => {
  console.log("Server running on port 5000");
});