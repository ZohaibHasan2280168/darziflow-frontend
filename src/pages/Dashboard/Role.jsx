import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
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

// Map frontend role names to backend role names
const roleMapping = {
  admin: 'ADMIN',
  moderator: 'MODERATOR',
  supervisor: 'SUPERVISOR',
  qa: 'QA'
};

export default function Role() {
  const { role } = useParams();

  // Hooks first
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Check if role is valid
  const roleMapping = { admin: 'ADMIN', moderator: 'MODERATOR', supervisor: 'SUPERVISOR', qa: 'QA' };
  const isInvalidRole = !role || !roleMapping[role.toLowerCase()];

  // Display role safely
  const displayRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  // ... fetchUsersByRole, modals, etc.

  if (isInvalidRole) {
    // conditional render after hooks
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your component JSX */}
      <h2>{displayRole} Users</h2>
    </div>
  );
}
