import express from "express";
import auth from "../middleware/Auth.js";
import Document from "../models/Document.js";

const router = express.Router();


// ✅ ADD DOCUMENT
router.post("/add", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Only admin allowed" });
    }

    const { title, content } = req.body;

    const doc = await Document.create({
      title,
      content,
      addedBy: req.user.id
    });

    res.json({ success: true, doc });

  } catch {
    res.status(500).json({ success: false, error: "SERVER ERROR" });
  }
});


// ✅ GET ALL DOCUMENTS
router.get("/all", async (req, res) => {
  try {
    const docs = await Document.find();
    res.json({ success: true, docs });
  } catch {
    res.status(500).json({ success: false, error: "SERVER ERROR" });
  }
});

export default router;