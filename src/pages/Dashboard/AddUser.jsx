import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddUser() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Simulate user add
    navigate(-1); // Go back to previous page
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#e0e7ff 0%,#fff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form className="form" onSubmit={handleSubmit} autoComplete="off">
        <span className="title">Add New User</span>
        <span className="message">Fill user details below</span>
        <label>
          <input
            type="text"
            name="name"
            className="input"
            value={form.name}
            onChange={handleChange}
            required
            placeholder=" "
            autoComplete="off"
          />
          <span>Name</span>
        </label>
        <label>
          <input
            type="email"
            name="email"
            className="input"
            value={form.email}
            onChange={handleChange}
            required
            placeholder=" "
            autoComplete="off"
          />
          <span>Email</span>
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
            autoComplete="off"
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
            style={{ paddingRight: '30px' }}
          >
            <option value="" disabled>Select Role</option>
            <option value="Moderator">Moderator</option>
            <option value="Admin">Admin</option>
            <option value="QA">QA</option>
          </select>
          <span>Role</span>
        </label>
        <button type="submit" className="submit">Add User</button>
        <div className="signin">
          <a href="#" onClick={() => navigate(-1)}>Cancel</a>
        </div>
      </form>
    </div>
  );
}