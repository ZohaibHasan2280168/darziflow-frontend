import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./components/context/AuthContext";
import { ThemeProvider } from './components/context/ThemeContext';
import AlertProvider from './components/ui/AlertProvider';

// --- Page Imports ---
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

import OrdersList from './pages/Dashboard/OrderList';
import Order from "./pages/Dashboard/Order"; 

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
              {/* ==========================================
                  PUBLIC ROUTES (No Login Required)
              ========================================== */}
              <Route path="/" element={<RoleSelection />} />
              <Route path="/moderator-login" element={<ModeratorLogin />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin-signup" element={<AdminSignUpPage />} />
              <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* ==========================================
                  ADMIN ONLY ROUTES
              ========================================== */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Dashboard />
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
                path="/users/role/:roleName"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}> 
                    <RoleUserList /> 
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
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Settings />
                  </ProtectedRoute>
                } 
              />

              {/* ==========================================
                  ADMIN & MODERATOR SHARED ROUTES
              ========================================== */}
              
              {/* Department Management */}
              <Route path="/departments" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <Departments />
                </ProtectedRoute>
              } />
              <Route path="/add-department" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <AddDepartment />
                </ProtectedRoute>
              } />
              <Route path="/update-department/:id" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <UpdateDepartments />
                </ProtectedRoute>
              } />
              <Route path="/department-detail/:id" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                  <DepartmentDetail />
                </ProtectedRoute>
              } />

              {/* Order Management */}
              <Route
                path="/orderlist"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                    <OrdersList />
                  </ProtectedRoute>
                }
              />
              
              {/* Order Detail (New Route Added Here) */}
              <Route
                path="/orders/:orderId"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                    <Order />
                  </ProtectedRoute>
                }
              />

              {/* Operation Management */}
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

              {/* Checkpoint Management */}
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

              {/* Roles & Profile */}
              <Route
                path="/role/:role"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                    <Role />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'MODERATOR']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  MODERATOR ONLY ROUTES
              ========================================== */}
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