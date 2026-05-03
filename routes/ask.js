import express from "express";
import auth from "../middleware/auth.js";
import Document from "../models/document.js";

const router = express.Router();

router.post("/ask", auth, async (req, res) => {
  const { question } = req.body;

  const docs = await Document.find();

  let answer = "Not available";

  const q = question.toLowerCase();

  for (let doc of docs) {
    if (
      doc.title.toLowerCase().includes(q) ||
      doc.content.toLowerCase().includes(q)
    ) {
      answer = doc.content;
      break;
    }
  }

  res.json({ answer });
});

export default router;