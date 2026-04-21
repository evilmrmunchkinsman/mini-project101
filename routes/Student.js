import express from "express";
import auth from "../middleware/Auth.js";

import Document from "../models/Documents.js";
import Chat from "../models/Chat.js";
import Progress from "../models/Progress.js";

const router = express.Router();


// 🔹 ASK QUESTION (MAIN FEATURE)
router.post("/ask", auth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "QUESTION REQUIRED"
      });
    }

    // 🔹 1. Fetch documents from DB
    const docs = await Document.find();

    const combinedData = docs.map(doc => doc.content).join("\n");

    // 🔹 2. Create RAG prompt
    const prompt = `
Answer clearly for a college student.
If answer not found, say "Not available".

DATA:
${combinedData}

QUESTION:
${question}
`;

    // 🔹 3. Call Groq API
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    const answer = data.choices?.[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({
        success: false,
        error: "AI FAILED"
      });
    }

    // 🔹 4. Save chat
    await Chat.create({
      student: req.user.id,
      question,
      answer
    });

    // 🔹 5. Update progress
    await Progress.findOneAndUpdate(
      { student: req.user.id },
      {
        $inc: { totalQuestions: 1 },
        lastActive: new Date(),
        $addToSet: { topicsAsked: question }
      },
      { upsert: true, new: true }
    );

    // 🔹 6. Send response
    res.json({
      success: true,
      answer
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