import mongoose from "mongoose";

const schema = new mongoose.Schema({
  student: String,
  question: String,
  answer: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Chat", schema);