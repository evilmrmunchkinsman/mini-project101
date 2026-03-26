import { useState } from "react";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [messages, setMessages] = useState(["Hello! How can I help you?"]);
  const [input, setInput] = useState("");
  const [notesText, setNotesText] = useState(""); // uploaded notes

  // Handle message
  const sendMessage = () => {
    if (!input) return;

    // Check if notes contain answer
    const answer = notesText ? answerFromNotes(input, notesText) : "AI: This is a demo reply!";
    setMessages([...messages, input, answer]);
    setInput("");

    // Auto scroll
    const chatWindow = document.getElementById("chat-window");
    setTimeout(() => {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }, 10);
  };

  // Simple keyword search from uploaded notes
  const answerFromNotes = (question, notes) => {
    const q = question.toLowerCase();
    if (q.includes("assignment")) return "Assignments: " + (notes.match(/Assignment.*$/gm) || []).join(", ");
    if (q.includes("chapter")) return "Chapters: " + (notes.match(/Chapter.*$/gm) || []).join(", ");
    if (q.includes("holiday")) return "Holidays: " + (notes.match(/College closed.*$/gm) || []).join(", ");
    return "Sorry, I don’t have that info in your notes yet.";
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNotesText(ev.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-screen font-sans bg-gray-100">

      {/* Sidebar */}
      <div className="w-48 bg-gray-900 text-white p-5">
        <h2 className="text-2xl font-bold mb-6">College AI</h2>
        <p className="cursor-pointer p-2 hover:bg-gray-700 rounded" onClick={() => setPage("dashboard")}>Dashboard</p>
        <p className="cursor-pointer p-2 hover:bg-gray-700 rounded mt-2" onClick={() => setPage("chat")}>Chatbot</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">

        {/* Dashboard */}
        {page === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Good Morning, Student 👋</h1>

            {/* Top Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded shadow hover:scale-105 transition">Attendance: 82%</div>
              <div className="bg-white p-4 rounded shadow hover:scale-105 transition">Next Exam: Math</div>
              <div className="bg-white p-4 rounded shadow hover:scale-105 transition">Deadlines: 3</div>
              <div className="bg-white p-4 rounded shadow hover:scale-105 transition">Notices: 5</div>
            </div>

            {/* Graph Placeholder */}
            <div className="bg-white p-4 rounded shadow mb-6">
              <h2 className="font-semibold mb-2">Attendance Overview</h2>
              <div className="h-40 flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded">
                [Graph Placeholder]
              </div>
            </div>

            {/* Latest Notices */}
            <div className="bg-white p-4 rounded shadow mb-6">
              <h2 className="font-semibold mb-2">Latest Notices</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Assignment 3 due on 30th March</li>
                <li>College closed on 2nd April (Holiday)</li>
                <li>New AI Lab schedule released</li>
              </ul>
            </div>

            {/* Upload Notes */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2">Upload Notes / Syllabus</h2>
              <input type="file" accept=".txt" onChange={handleFileUpload} className="border p-2 rounded"/>
              {notesText && <p className="mt-2 text-gray-600">Notes uploaded successfully!</p>}
            </div>
          </div>
        )}

        {/* Chatbot */}
        {page === "chat" && (
          <div className="bg-white p-4 rounded-2xl shadow-lg h-[70vh] flex flex-col">
            
            {/* Messages */}
            <div
              className="flex-1 overflow-auto mb-4 space-y-3"
              id="chat-window"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-xs ${
                      i % 2 === 0
                        ? "bg-gray-200 text-gray-900"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {msg}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="flex">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about your notes..."
                className="flex-1 border p-3 rounded-l-2xl shadow-sm outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-6 rounded-r-2xl hover:bg-blue-600 transition"
              >
                Send
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}