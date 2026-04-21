import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Student from "../models/Student.js";
import Admin from "../models/Admin.js";

const router = express.Router();


// 🔹 REGISTER STUDENT
router.post("/register/student", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if already exists
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Student already exists"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      role: "student"
    });

    res.json({
      success: true,
      message: "Student registered successfully"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "SERVER ERROR"
    });
  }
});


// 🔹 REGISTER ADMIN
router.post("/register/admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Admin already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: "admin"
    });

    res.json({
      success: true,
      message: "Admin registered successfully"
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "SERVER ERROR"
    });
  }
});


// 🔹 LOGIN (for both student + admin)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Student.findOne({ email });
    if (!user) {
      user = await Admin.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Invalid password"
      });
    }

    // create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      role: user.role
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "SERVER ERROR"
    });
  }
});

export default router;