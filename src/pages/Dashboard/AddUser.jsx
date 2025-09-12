import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/reqInterceptor";


//const API_URL = "https://darziflow-backend.onrender.com/api";

const getToken = () => {
  return localStorage.getItem("accessToken"); 
};

export default function AddUser() {
  const [form, setForm] = useState({
    name: "",
    workEmail: "",
    password: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

    // 🔹 Run once when component mounts
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      //debugToken(token);
    } else {
      console.warn("[AddUser] No token found in localStorage");
    }
  }, []); // empty dependency → runs once

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) {
        setError("No access token found. Please login again.");
        return;
      }

      const res = await api.post("/admin/create", {
  name: form.name,
  workEmail: form.workEmail, //backend ka field
  password: form.password,
  role: form.role,
});


      if (res.status === 201) {
        alert("User created successfully!");
        navigate(-1);
      } else {
        throw new Error(res.data?.message || "Failed to create user");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#e0e7ff 0%,#fff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form className="form" onSubmit={handleSubmit} autoComplete="off">
        <span className="title">Add New User</span>
        <span className="message">Fill user details below</span>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <label>
          <input
            type="text"
            name="name"
            className="input"
            value={form.name}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <span>Name</span>
        </label>

        <label>
          <input
            type="email"
            name="workEmail" // ✅ backend ka naam
            className="input"
            value={form.workEmail}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <span>Work Email</span>
        </label>

        <label>
          <input
            type="password"
            name="password"
            className="input"
            value={form.password}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <span>Password</span>
        </label>

        <label>
          <select
            name="role"
            className="input"
            value={form.role}
            onChange={handleChange}
            required
            style={{ paddingRight: "30px" }}
          >
            <option value="" disabled>
              Select Role
            </option>
            <option value="Moderator">Moderator</option>
            <option value="Admin">Admin</option>
            <option value="QA">QA</option>
          </select>
          <span>Role</span>
        </label>

        <button type="submit" className="submit" disabled={loading}>
          {loading ? "Adding..." : "Add User"}
        </button>
        <div className="signin">
          <a href="#" onClick={() => navigate(-1)}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
