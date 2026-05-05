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
    content: "Mid semester exams are in October and finals in December."
  },
  {
    title: "Placements",
    content: "85% placement rate with average package of 6 LPA."
  },

  // ➕ ADD MORE HERE
  {
    title: "Hostel",
    content: "Hostel facilities are available for both boys and girls."
  },
  {
    title: "Library",
    content: "Library is open from 9 AM to 8 PM."
  },
  {
    title: "Fees",
    content: "Annual fee is approximately ₹1.5 lakh."
  }
]);
   

  console.log("Seed done");
  process.exit();
}

seed();