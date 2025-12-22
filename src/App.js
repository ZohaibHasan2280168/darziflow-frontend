import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./components/context/AuthContext";
import { ThemeProvider } from './components/context/ThemeContext';
import AlertProvider from './components/ui/AlertProvider';

import RoleUserList from './pages/RoleUserList'; 
import RoleSelection from './pages/RoleSelection';
import ModeratorLogin from './pages/Auth/Moderator/ModeratorLogin';
import VerifyEmailPage from "./pages/RoleSelection/VerifyEmailPage";
import AdminLoginPage from './pages/Auth/Admin/LoginPage';
import AdminSignUpPage from './pages/Auth/Admin/SignUpPage';
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";

import Dashboard from './pages/Dashboard';
import Departments from './pages/Dashboard/Departments';
import DepartmentDetail from './pages/Dashboard/DepartmentDetail';
import AddDepartment from './pages/Dashboard/AddDepartment';
import UpdateDepartments from './pages/Dashboard/UpdateDepartments';

// --- Nayi Files ke Imports ---
import OperationAdd from './pages/Dashboard/OperationAdd';
import OperationEdit from './pages/Dashboard/OperationEdit';
import CheckpointAdd from './pages/Dashboard/CheckpointAdd';
import CheckpointEdit from './pages/Dashboard/CheckpointEdit';

import Users from './pages/Dashboard/Users';
import AddUser from './pages/Dashboard/AddUser';
import UpdateUser from './pages/Dashboard/UpdateUser';
import Role from './pages/Dashboard/Role';
import Settings from './pages/SettingPage';
import ProfilePage from './pages/ProfilePage';

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AlertProvider>
          <BrowserRouter>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RoleSelection />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/update-department/:id" element={<UpdateDepartments />} />
            <Route path="/add-department" element={<AddDepartment />} />
            <Route path="/department-detail/:id" element={<DepartmentDetail />} />
            <Route path="/moderator-login" element={<ModeratorLogin />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin-signup" element={<AdminSignUpPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* User Routes */}
            <Route
              path="/users/role/:roleName"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}> 
                  <RoleUserList /> 
                </ProtectedRoute>
              }
            />

            {/* Admin Routes Only */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-user"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AddUser />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-user/:id"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UpdateUser />
                </ProtectedRoute>
              }
            />

            {/* Moderator & Admin accessible Section */}
            
            {/* --- Naye Operation Routes --- */}
            <Route
              path="/departments/:deptId/add-operation"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <OperationAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-operation/:opId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <OperationEdit />
                </ProtectedRoute>
              }
            />

            {/* --- Naye Checkpoint Routes --- */}
            <Route
              path="/departments/:deptId/operations/:opId/add-checkpoint"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <CheckpointAdd />
                </ProtectedRoute>
              }
            />
            <Route
              path="/departments/:deptId/operations/:opId/edit-checkpoint/:chkId"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <CheckpointEdit />
                </ProtectedRoute>
              }
            />

            <Route
              path="/role/:role"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <Role />
                </ProtectedRoute>
              }
            />

            {/* Profile Page accessible to all logged-in users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Moderator Dashboard */}
            <Route
              path="/moderator-dashboard"
              element={
                <ProtectedRoute allowedRoles={['MODERATOR']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 redirect */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          </BrowserRouter>
        </AlertProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;