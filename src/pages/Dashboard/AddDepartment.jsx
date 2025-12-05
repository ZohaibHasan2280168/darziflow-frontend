// AddDepartment.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 

const API_URL = "http://localhost:5000/api";

// Get token from localStorage
const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  return parsedData?.accessToken;
};

export default function AddDepartment() {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // --- Mock Submission Logic ---
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple mock validation
    if (form.name.toLowerCase() === "error") {
        setError("Mock Error: Department name cannot be 'error'. Please try another.");
        setLoading(false);
        return;
    }

    alert(`New Department '${form.name}' added successfully! (Mock Action)`);
    setLoading(false);
    navigate("/departments"); // Navigate back to the department list after adding
    
    /* --- REAL API LOGIC (Uncomment when backend is ready) ---
    try {
      const token = getToken();
      if (!token) {
        setError("No access token found. Please login again.");
        return;
      }

      const res = await axios.post(
        `${API_URL}/departments`, // Assuming this is your POST endpoint
        { name: form.name, description: form.description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) { // Assuming 201 Created for a successful POST
        alert("Department added successfully!");
        navigate("/departments");
      } else {
        throw new Error(res.data?.message || "Failed to add department");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
    */
  };

  return (
    <div className="update-container"> {/* Reusing the .update-container class for consistency */}
      <div className="update-card">
        <h1 className="update-title">Add New Department</h1>
        <p className="update-subtitle">Enter the details for the new production department</p>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit} className="update-form">
          <div className="input-group">
            <label htmlFor="name">Department Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              required
            />
          </div>
          
          <button type="submit" className="add-btn" disabled={loading}>
            {loading ? "Adding..." : "Add Department"}
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/departments")}
          >
            Cancel
          </button>
        </form>
      </div>

      <style jsx>{`
        /* --- General Container Styles (Copied from UpdateUser/UpdateDepartments) --- */
        .update-container {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #1e1b4b, #312e81, #1e3a8a);
          background-size: 200% 200%;
          animation: gradientMove 8s ease infinite;
          padding: 1rem;
        }

        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .update-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2.5rem;
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          text-align: center;
          color: #f8fafc;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
        }

        .update-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .update-subtitle {
          color: #cbd5e1;
          font-size: 0.95rem;
          margin-bottom: 2rem;
        }

        .update-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .input-group label {
          margin-bottom: 0.4rem;
          color: #e2e8f0;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .input-group input,
        .input-group textarea {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #f1f5f9;
          border-radius: 10px;
          padding: 0.75rem;
          font-size: 0.95rem;
          outline: none;
          transition: 0.3s ease;
          resize: vertical;
        }

        .input-group input:focus,
        .input-group textarea:focus {
          border-color: #818cf8;
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
        }
        
        /* --- ADD Button Styling (Differentiated from Update button) --- */
        .add-btn {
          background: linear-gradient(90deg, #10b981, #34d399); /* Green gradient */
          border: none;
          padding: 0.8rem;
          border-radius: 12px;
          font-weight: 600;
          color: #fff;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          background: linear-gradient(90deg, #059669, #23745a);
          transform: translateY(-2px);
        }

        .cancel-btn {
          margin-top: 0.5rem;
          background: transparent;
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 0.8rem;
          font-size: 0.95rem;
          cursor: pointer;
          transition: 0.3s ease;
        }

        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .error-text {
          color: #fca5a5;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}