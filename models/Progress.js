import mongoose from "mongoose";

const schema = new mongoose.Schema({
  student: String,
  totalQuestions: { type: Number, default: 0 },
  lastActive: Date,
  topicsAsked: [String]
});

export default mongoose.model("Progress", schema);