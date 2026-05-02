import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Student from "../models/Student.js";
import Admin from "../models/Admin.js";

const router = express.Router();


// ✅ REGISTER STUDENT
router.post("/register/student", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "Student exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await Student.create({
      name,
      email,
      password: hashed,
      role: "student"
    });

    res.json({ success: true, message: "Student registered" });

  } catch (err) {
    res.status(500).json({ success: false, error: "SERVER ERROR" });
  }
});


// ✅ REGISTER ADMIN
router.post("/register/admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, error: "Admin exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await Admin.create({
      name,
      email,
      password: hashed,
      role: "admin"
    });

    res.json({ success: true, message: "Admin registered" });

  } catch (err) {
    res.status(500).json({ success: false, error: "SERVER ERROR" });
  }
});


// ✅ LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await Student.findOne({ email });
    if (!user) user = await Admin.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, error: "Wrong password" });
    }

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
    res.status(500).json({ success: false, error: "SERVER ERROR" });
  }
});

export default router;