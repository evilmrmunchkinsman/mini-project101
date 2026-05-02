import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async () => {
    try {
      await API.post("/auth/register/student", form);

      alert("Registered successfully!");
      navigate("/"); // go to login

    } catch (err) {
      console.log(err);
      alert("Registration failed");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Register</h2>

      <input
        name="name"
        placeholder="Name"
        onChange={handleChange}
      /><br /><br />

      <input
        name="email"
        placeholder="Email"
        onChange={handleChange}
      /><br /><br />

      <input
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      /><br /><br />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}