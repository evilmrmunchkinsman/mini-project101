import express from "express";
import auth from "../middleware/Auth.js";
import Chat from "../models/Chat.js";

const router = express.Router();


// ✅ GET CHAT HISTORY
router.get("/history", auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      student: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      chats
    });

  } catch {
    res.status(500).json({
      success: false,
      error: "SERVER ERROR"
    });
  }
});

export default router;