import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/reqInterceptor";


//const API_URL = "https://darziflow-backend.onrender.com/api";

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("accessToken"); 
};

export default function UpdateUser() {
  const { id } = useParams(); // Get user ID from URL params
  const [form, setForm] = useState({
    name: "",
    workEmail: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("No access token found. Please login again.");
          setFetching(false);
          return;
        }

        const res = await api.get(`/admin/user/${id}`);

        if (res.status === 200) {
          setForm({
            name: res.data.name || "",
            workEmail: res.data.workEmail || "",
            role: res.data.role || "",
          });
        } else {
          throw new Error(res.data?.message || "Failed to fetch user data");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch user data");
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [id]);

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

      const res = await api.put(`/admin/${id}`, {
        name: form.name,
        workEmail: form.workEmail,
        role: form.role,
      });

      if (res.status === 200) {
        alert("User updated successfully!");
        navigate(-1);
      } else {
        throw new Error(res.data?.message || "Failed to update user");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
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
        <div>Loading user data...</div>
      </div>
    );
  }

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
        <span className="title">Update User</span>
        <span className="message">Update user details below</span>

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
            name="workEmail"
            className="input"
            value={form.workEmail}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <span>Work Email</span>
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
          {loading ? "Updating..." : "Update User"}
        </button>
        <div className="signin">
          <a href="#" onClick={() => navigate(-1)}>
            Cancel
          </a>
        </div>
      </form>

      {/* CSS Styles */}
      <style jsx>{`
        .form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 450px;
          background-color: #fff;
          padding: 30px;
          border-radius: 20px;
          position: relative;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }

        .title {
          font-size: 28px;
          color: #6a11cb;
          font-weight: 600;
          letter-spacing: -1px;
          position: relative;
          display: flex;
          align-items: center;
          padding-left: 30px;
        }

        .title::before,
        .title::after {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          border-radius: 50%;
          left: 0px;
          background-color: #6a11cb;
        }

        .title::before {
          width: 18px;
          height: 18px;
          background-color: #6a11cb;
        }

        .title::after {
          width: 18px;
          height: 18px;
          animation: pulse 1s linear infinite;
        }

        .message,
        .signin {
          color: rgba(88, 87, 87, 0.822);
          font-size: 14px;
        }

        .signin {
          text-align: center;
        }

        .signin a {
          color: #6a11cb;
          cursor: pointer;
        }

        .signin a:hover {
          text-decoration: underline;
        }

        .flex {
          display: flex;
          width: 100%;
          gap: 6px;
        }

        .form label {
          position: relative;
        }

        .form label .input {
          width: 100%;
          padding: 10px 10px 20px 10px;
          outline: 0;
          border: 1px solid rgba(105, 105, 105, 0.397);
          border-radius: 10px;
        }

        .form label .input + span {
          position: absolute;
          left: 10px;
          top: 15px;
          color: grey;
          font-size: 0.9em;
          cursor: text;
          transition: 0.3s ease;
        }

        .form label .input:placeholder-shown + span {
          top: 15px;
          font-size: 0.9em;
        }

        .form label .input:focus + span,
        .form label .input:valid + span {
          top: 0px;
          font-size: 0.7em;
          font-weight: 600;
        }

        .form label .input:valid + span {
          color: green;
        }

        .submit {
          border: none;
          outline: none;
          background-color: #6a11cb;
          padding: 10px;
          border-radius: 10px;
          color: #fff;
          font-size: 16px;
          transform: .3s ease;
        }

        .submit:hover {
          background-color: #5a0db5;
          cursor: pointer;
        }

        .submit:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        @keyframes pulse {
          from {
            transform: scale(0.9);
            opacity: 1;
          }

          to {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}