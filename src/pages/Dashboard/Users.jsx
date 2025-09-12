// src/pages/Dashboard/Users.jsx
import { useEffect, useState } from "react";
import Navbar from "../../components/layout/Navbar";
import { useNavigate } from "react-router-dom";
import api from "../../services/reqInterceptor";

//const API_URL = "https://darziflow-backend.onrender.com/api";

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem("accessToken"); 
};

const roleColors = {
  Moderator: "bg-blue-100 text-blue-700",
  Admin: "bg-green-100 text-green-700",
  QA: "bg-yellow-100 text-yellow-700",
  SUPERVISOR: "bg-purple-100 text-purple-700",
  QC_OFFICER: "bg-red-100 text-red-700",
};

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("No access token found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await api.get("/users");

        setUsers(res.data.users || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8 px-4 mx-auto max-w-7xl">
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl shadow-lg p-6 w-full border border-blue-100 mt-8 mb-8">
          <div className="overflow-x-auto w-full">
            {loading && <p className="text-center">Loading users...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && (
              <table className="w-full bg-white rounded-lg shadow user-card-table">
                <thead>
                  <tr className="bg-blue-600 text-white font-bold">
                    <th className="p-4 border-r-2 border-blue-400 border-b-2 border-blue-400 w-[30%]">
                      Name
                    </th>
                    <th className="p-4 border-r-2 border-blue-400 border-b-2 border-blue-400 w-[50%]">
                      Email
                    </th>
                    <th className="p-4 border-b-2 border-blue-400 w-[20%]">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, idx) => (
                      <tr
                        key={user._id || idx}
                        className={
                          idx % 2 === 0
                            ? "bg-white"
                            : "bg-blue-50 hover:bg-blue-100"
                        }
                      >
                        <td className="p-4 border-r border-blue-200 border-b border-blue-200 font-medium text-gray-800">
                          {user.name}
                        </td>
                        <td className="p-4 border-r border-blue-200 border-b border-blue-200 text-gray-600">
                          {user.workEmail}
                        </td>
                        <td className="p-4 border-b border-blue-200">
                          <span
                            className={`inline-block px-3 py-1 rounded-full font-semibold ${
                              roleColors[user.role] ||
                              "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center p-4 text-gray-500 border"
                      >
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Centered Back to Dashboard button */}
        <div className="flex justify-center w-full mt-8 mb-16">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}
