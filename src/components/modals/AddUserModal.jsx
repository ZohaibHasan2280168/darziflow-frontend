import React, { useState } from 'react';

export default function AddUserModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onClose();
    setForm({ name: '', email: '', password: '', role: '' });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md transition-all duration-300"
        onClick={onClose}
      />
      <div
        className="animate-modal-in relative z-10"
        style={{
          maxWidth: '28rem',
          width: '100%',
          padding: '2.5rem 2rem',
          boxShadow: '0 8px 32px 0 rgba(31, 41, 55, 0.12)',
          borderRadius: '1rem',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-blue-600">Add New User</h2>
          <p className="text-gray-500">Fill user details below</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Name"
            required
            className="input"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="input"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            required
            className="input"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select Role</option>
            <option value="Moderator">Moderator</option>
            <option value="Admin">Admin</option>
            <option value="QA">QA</option>
          </select>
          <div className="flex justify-end gap-4 pt-2">
            <button type="button" className="btn btn-disabled" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}