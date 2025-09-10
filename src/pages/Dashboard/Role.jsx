// src/pages/Dashboard/Role.jsx
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

// Notification Modal Component
// Notification Modal Component
// Notification Modal Component
const NotificationModal = ({ message, type = 'info', onClose }) => {
  const getColors = () => {
    switch (type) {
      case 'success':
        return { icon: '✅', titleColor: '#16a34a' }; // green
      case 'error':
        return { icon: '❌', titleColor: '#dc2626' }; // red
      case 'warning':
        return { icon: '⚠️', titleColor: '#ca8a04' }; // yellow
      default:
        return { icon: 'ℹ️', titleColor: '#2563eb' }; // blue
    }
  };

  const { icon, titleColor } = getColors();

  return (
    <div className="modal-overlay z-[9999]">
      <div className="modal-card">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className="text-5xl mb-4">{icon}</div>

          {/* Title */}
          <h3
            className="text-xl font-bold mb-2"
            style={{ color: titleColor }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </h3>

          {/* Message */}
          <p className="mb-6 text-gray-700">{message}</p>

          {/* Button */}
          <div className="modal-actions">
            <button onClick={onClose} className="btn btn-confirm">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default function Role() {
  const { role } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    workEmail: '',
    password: ''
  });

  // Map frontend role names to backend role names
  const roleMapping = {
    'admin': 'ADMIN',
    'supervisor': 'SUPERVISOR',
    'qa': 'QA'
  };

  // Fetch users by role from backend
  useEffect(() => {
    fetchUsersByRole();
  }, [role]);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const fetchUsersByRole = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        showNotification("No access token found. Please login again.", 'error');
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
      showNotification(err.response?.data?.message || err.message || "Failed to fetch users", 'error');
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      workEmail: user.workEmail,
      password: ''
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (user) => {
    setDeleteConfirm(user);
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = getToken();
      if (!token) {
        showNotification("No access token found. Please login again.", 'error');
        return;
      }

      const res = await axios.delete(
        `${API_URL}/admin/${deleteConfirm._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        showNotification('User deleted successfully', 'success');
        // Refresh the user list
        fetchUsersByRole();
      } else {
        throw new Error(res.data?.message || "Failed to delete user");
      }
    } catch (err) {
      showNotification(err.response?.data?.message || err.message || "Failed to delete user", 'error');
      console.error("Error deleting user:", err);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      if (!token) {
        showNotification("No access token found. Please login again.", 'error');
        return;
      }

      // Prepare the update data
      const updateData = {
        name: formData.name,
        workEmail: formData.workEmail
      };

      // Only include password if it's not empty
      if (formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      const res = await axios.put(
        `${API_URL}/admin/${editingUser._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        showNotification('User updated successfully', 'success');
        setShowEditModal(false);
        // Refresh the user list
        fetchUsersByRole();
      } else {
        throw new Error(res.data?.message || "Failed to update user");
      }
    } catch (err) {
      showNotification(err.response?.data?.message || err.message || "Failed to update user", 'error');
      console.error("Error updating user:", err);
    }
  };

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
      <main className="py-8 px-4 mx-auto max-w-6xl">
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 rounded-xl shadow-lg p-6 w-full border border-blue-100 mt-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
            {role.charAt(0).toUpperCase() + role.slice(1)} Users
          </h2>

          <div className="overflow-x-auto w-full">
            <table className="w-full bg-white rounded-lg shadow user-card-table">
              <thead>
                <tr className="bg-blue-600 text-white font-bold">
                  <th className="p-4 border-r-2 border-blue-400 border-b-2 border-blue-400 w-[25%]">Name</th>
                  <th className="p-4 border-r-2 border-blue-400 border-b-2 border-blue-400 w-[40%]">Email</th>
                  <th className="p-4 border-r-2 border-blue-400 border-b-2 border-blue-400 w-[15%]">Role</th>
                  <th className="p-4 border-b-2 border-blue-400 w-[20%]">Actions</th>
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
                      <td className="p-4 border-r border-blue-200 border-b border-blue-200">
                        <span className={`inline-block px-3 py-1 rounded-full font-semibold ${roleColors[user.role] || 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 border-b border-blue-200">
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleEditClick(user)}
                            className="btn btn-edit"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(user)}
                            className="btn btn-delete"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">
                      No users found for this role.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">Edit User</h3>

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="workEmail">Email Address</label>
                <input
                  type="email"
                  id="workEmail"
                  name="workEmail"
                  value={formData.workEmail}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
                <small className="hint">Leave blank to keep current password</small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn btn-cancel"
                >
                  ❌ Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-save"
                >
                  💾 Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="flex items-center justify-center mb-3 text-yellow-600 text-3xl">
              ⚠️
            </div>
            <h2 className="text-lg font-bold mb-2">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete <b>{deleteConfirm.name}</b> ({deleteConfirm.email})?
              <br />
              <small className="text-gray-600">This action cannot be undone.</small>
            </p>
            <div className="modal-actions">
              <button onClick={() => setDeleteConfirm(null)} className="btn btn-cancel">
                ❌ Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="btn btn-delete">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {notification && (
        <NotificationModal
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
    </div>
  );
}