// src/App.js
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from './pages/RoleSelection';
import ModeratorLogin from './pages/Auth/ModeratorLogin';
import Dashboard from './pages/Dashboard';
import Users from './pages/Dashboard/Users';
import AddUser from './pages/Dashboard/AddUser';
import UpdateUser from './pages/Dashboard/UpdateUser';
import Role from './pages/Dashboard/Role';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/moderator-login" element={<ModeratorLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/update-user/:id" element={<UpdateUser />} />
        <Route path="/role/:role" element={<Role />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;