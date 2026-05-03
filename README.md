#mini-project101
# 🎓 College Q&A System (Retrieval-Based)

A simple backend project that allows authenticated users to ask questions and get answers based on stored college-related data using a retrieval-based approach.

---

## 🚀 Features

- 🔐 User Authentication (JWT)
- 🗄️ MongoDB Database Integration
- ❓ Ask Questions API
- 📚 Retrieval-Based Answering (No AI dependency)
- ⚡ Fast and lightweight backend

---

## 🧠 How It Works

1. User registers and logs in
2. Receives a JWT token
3. Sends a question via API
4. Backend searches stored documents in MongoDB
5. Returns the most relevant answer

---

## 🏗️ Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB (Atlas)
- Authentication: JWT + bcrypt
- API Testing: Thunder Client / Postman

---


# api endpoints
POST/ auth/register
POST/auth/login
POST/api/ask