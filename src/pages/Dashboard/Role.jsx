// filepath: f:\programming\darzi_flow\darzi_flow_frontend\src\pages\Dashboard\Role.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';

const API_URL = "https://darziflow-backend.onrender.com/api";

// Get token from localStorage
const getToken = () => {
  const storedData = localStorage.getItem("useraccesstoken");
  const parsedData = storedData ? JSON.parse(storedData) : null;
  return parsedData?.accessToken;
};

const roleColors = {
  Moderator: 'bg-blue-100 text-blue-700',
  Admin: 'bg-green-100 text-green-700',
  Supervisor: 'bg-blue-100 text-blue-700',
  QA: 'bg-yellow-100 text-yellow-700',
};

export default function Role() {
  const { role } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Map frontend role names to backend role names
  const roleMapping = {
    'admin': 'ADMIN',
    'supervisor': 'SUPERVISOR',
    'qa': 'QA'
  };

  // Fetch users by role from backend
  useEffect(() => {
    const fetchUsersByRole = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("No access token found. Please login again.");
          setLoading(false);
          return;
        }

        // First, get all users
        const res = await axios.get(
          `${API_URL}/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.status === 200) {
          const allUsers = res.data.users || [];
          
          // Filter users by the selected role
          const backendRole = roleMapping[role];
          const filteredUsers = allUsers.filter(user => 
            user.role === backendRole
          );

          setUsers(filteredUsers);
        } else {
          throw new Error(res.data?.message || "Failed to fetch users");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to fetch users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersByRole();
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="py-8 px-4 mx-auto max-w-3xl">
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl shadow-lg p-6 w-full border border-blue-100 mt-8 mb-8">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
              {role.charAt(0).toUpperCase() + role.slice(1)} Users
            </h2>
            <div className="text-center text-blue-600">Loading users...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="py-8 px-4 mx-auto max-w-3xl">
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl shadow-lg p-6 w-full border border-blue-100 mt-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
            {role.charAt(0).toUpperCase() + role.slice(1)} Users
          </h2>
          
          {error && (
            <div className="text-red-500 mb-4 text-center">
              {error}
            </div>
          )}

          <div className="overflow-x-auto w-full">
            <table className="w-full bg-white rounded-lg shadow user-card-table">
              <thead>
                <tr className="bg-blue-600 text-white font-bold">
                  <th className="p-4 border-r-2 border-blue-400 border-b-2 border-blue-400 w-[30%]">Name</th>
                  <th className="p-4 border-r-2 border-blue-400 border-b-2 border-blue-400 w-[50%]">Email</th>
                  <th className="p-4 border-b-2 border-blue-400 w-[20%]">Role</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, idx) => (
                    <tr
                      key={user._id || user.email + idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50 hover:bg-blue-100'}
                    >
                      <td className="p-4 border-r border-blue-200 border-b border-blue-200 font-medium text-gray-800">
                        {user.name}
                      </td>
                      <td className="p-4 border-r border-blue-200 border-b border-blue-200 text-gray-600">
                        {user.workEmail}
                      </td>
                      <td className="p-4 border-b border-blue-200">
                        <span className={`inline-block px-3 py-1 rounded-full font-semibold ${roleColors[user.role] || 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">
                      No users found for this role.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}