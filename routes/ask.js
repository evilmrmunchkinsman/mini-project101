const express = require("express");
const router = express.Router();

const CollegeData = require("../models/CollegeData");
const generateAnswer = require("../utils/gemini");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question required" });
  }

  try {
    const results = await CollegeData.find({
      $or: [
        { title: { $regex: question, $options: "i" } },
        { content: { $regex: question, $options: "i" } }
      ]
    }).limit(5);

    const context = results.map(r => r.content).join("\n");

    const prompt = `
You are a college assistant.

Rules:
- Answer ONLY from context
- If not found say "Not available"

Context:
${context}

Question:
${question}
`;

    const answer = await generateAnswer(prompt);

    res.json({
      answer,
      sources: results
    });

  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;