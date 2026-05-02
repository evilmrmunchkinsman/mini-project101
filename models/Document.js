import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: String,
  content: String,
  addedBy: String
});

export default mongoose.model("Document", schema);