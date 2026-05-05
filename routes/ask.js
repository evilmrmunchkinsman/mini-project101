const express = require("express");
const router = express.Router();

const CollegeData = require("../models/CollegeData");
const authMiddleware = require("../middleware/authMiddleware");


// 🔥 ASK ROUTE (protected)
router.post("/", authMiddleware, async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question required" });
  }

  try {
    const keyword = question.toLowerCase().split(" ").join("|");

    const results = await CollegeData.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } }
      ]
    }).limit(3);

    if (results.length === 0) {
      return res.json({
        answer: "No relevant information found.",
        sources: []
      });
    }

    res.json({
      answer: results[0].content,
      sources: results
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ➕ ADD DATA ROUTE (you can protect this too if needed)
router.post("/add", authMiddleware,async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content required" });
  }

  try {
    const newData = await CollegeData.create({ title, content });

    res.json({
      message: "Data added successfully",
      data: newData
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add data" });
  }
});


module.exports = router;