require("dotenv").config();
const connectDB = require("../config/db");
const CollegeData = require("../models/CollegeData");

connectDB();

async function seed() {
  await CollegeData.deleteMany();

  await CollegeData.insertMany([
    {
      title: "Attendance",
      content: "Minimum 75% attendance is required."
    },
    {
      title: "Exams",
      content: "Mid semester exams in October and finals in December."
    },
    {
      title: "Placements",
      content: "85% placement rate with average package of 6 LPA."
    }
  ]);

  console.log("Seed done");
  process.exit();
}

seed();