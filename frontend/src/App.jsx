import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

// (we’ll create these later)
const Ask = () => <h2>Ask Page</h2>;
const Admin = () => <h2>Admin Dashboard</h2>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Student */}
        <Route path="/ask" element={<Ask />} />

        {/* Admin */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}