import express from "express";

import auth from "../middleware/Auth.js";

import Document from "../models/Document.js";
import Chat from "../models/Chat.js";
import Progress from "../models/Progress.js";

const router = express.Router();


//ask 
router.post("/ask", auth, async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        error: "QUESTION REQUIRED"
      });
    }

    //fetch
    const docs = await Document.find();

    // 🔹 Retrieval logic
    let answer = "Not available";

    const lowerQ = question.toLowerCase();

    for (let doc of docs) {
      const content = doc.content.toLowerCase();
      const title = doc.title.toLowerCase();

      if (
        content.includes(lowerQ) ||
        lowerQ.includes(title)
      ) {
        answer = doc.content;
        break;
      }
    }

    //saving the chat
    await Chat.create({
      student: req.user.id,
      question,
      answer
    });

    //updating
    await Progress.findOneAndUpdate(
      { student: req.user.id },
      {
        $inc: { totalQuestions: 1 },
        lastActive: new Date(),
        $addToSet: { topicsAsked: question }
      },
      { upsert: true }
    );

   //res
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