// models/Document.js
import mongoose from "mongoose";

const docSchema = new mongoose.Schema({
  title: String,
  content: String
});

export default mongoose.model("Document", docSchema);