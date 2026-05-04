const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
  title: String,
  content: String
});

module.exports = mongoose.model("CollegeData", collegeSchema);