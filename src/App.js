import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/context/AuthContext";
import { ThemeProvider, useTheme } from "./components/context/ThemeContext";
import AlertProvider from "./components/ui/AlertProvider";

// --- Components ---
import PlexusBackground from "./components/PlexusBackground";

// --- Page Imports ---
import RoleUserList from "./pages/Dashboard/User/RoleUserList";
import RoleSelection from "./pages/Dashboard/Home/RoleSelection";
import ModeratorLogin from "./pages/Auth/Moderator/ModeratorLogin";
import VerifyEmailPage from "./pages/Dashboard/Profile/VerifyEmailPage";
import AdminLoginPage from "./pages/Auth/Admin/LoginPage";
import AdminSignUpPage from "./pages/Auth/Admin/SignUpPage";
import ForgotPassword from "./pages/Dashboard/Profile/ForgotPasswordPage";
import ResetPassword from "./pages/Dashboard/Profile/ResetPasswordPage";

import Dashboard from "./pages/Dashboard";
import Departments from "./pages/Dashboard/Departments/DepartmentsPage";
import DepartmentDetail from "./pages/Dashboard/Departments/DepartmentDetailPage";
import AddDepartment from "./pages/Dashboard/Departments/AddDepartmentPage";
import UpdateDepartments from "./pages/Dashboard/Departments/UpdateDepartmentsPage";

import OrdersList from "./pages/Dashboard/Order/OrdersPage";
import Order from "./pages/Dashboard/Order/OrderDetailPage";

import OperationAdd from "./pages/Dashboard/Departments/Operations/OperationAddPage";
import OperationEdit from "./pages/Dashboard/Departments/Operations/OperationEditPage";
import CheckpointAdd from "./pages/Dashboard/Departments/Checkpoints/CheckpointAddPage";
import CheckpointEdit from "./pages/Dashboard/Departments/Checkpoints/CheckpointEditPage";

import Users from "./pages/Dashboard/User/UsersPage";
import AddUser from "./pages/Dashboard/User/AddUserPage";
import UpdateUser from "./pages/Dashboard/User/UpdateUserPage";
import Role from "./pages/Dashboard/User/Role";
import Settings from "./pages/Dashboard/Profile/SettingsPage";
import ProfilePage from "./pages/Dashboard/Profile/ProfilePage";
import MustChangePasswordModal from "./components/modals/MustChangePasswordModal";
import NotificationsPage from "./pages/NotificationsPage";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuditLogPage from "./pages/Dashboard/Audit/AuditLogPage";

import { NotificationProvider } from "./components/context/NotificationContext";
import MainLayout from "./components/layout/MainLayout";
import LandingPage from "./pages/Landing/LandingPage";

// Yeh component check karega ke dark mode on hai ya nahi
const PlexusWrapper = () => {
  const { theme } = useTheme();
  return theme === "dark" ? <PlexusBackground /> : null;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ThemeProvider>
            <AlertProvider>
              
              
              {/* Theme logic ke mutabiq background yahan render hoga */}
              <PlexusWrapper />

              <MustChangePasswordModal />
              <Routes>
                {/* ==========================================
                  PUBLIC ROUTES (No Login)
              ========================================== */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/role-selection" element={<RoleSelection />} />
                <Route path="/moderator-login" element={<ModeratorLogin />} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/admin-signup" element={<AdminSignUpPage />} />
                <Route
                  path="/verify-email/:token"
                  element={<VerifyEmailPage />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPassword />}
                />

                {/* ==========================================
                  PROTECTED ROUTES (Wrap in MainLayout)
              ========================================== */}
                <Route element={<MainLayout />}>
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/audit-logs"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AuditLogPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/users/role/:roleName"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <RoleUserList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/add-user"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AddUser />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/update-user/:id"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <UpdateUser />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/departments"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <Departments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/add-department"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <AddDepartment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/update-department/:id"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <UpdateDepartments />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/department-detail/:id"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <DepartmentDetail />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/orderlist"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <OrdersList />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/orders/:orderId"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <Order />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/departments/:deptId/add-operation"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <OperationAdd />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/edit-operation/:opId"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <OperationEdit />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/departments/:deptId/operations/:opId/add-checkpoint"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <CheckpointAdd />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/departments/:deptId/operations/:opId/edit-checkpoint/:chkId"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <CheckpointEdit />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/role/:role"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <Role />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR"]}>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "MODERATOR", "DEPT_HEAD", "QC", "CLIENT"]}>
                        <NotificationsPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/moderator-dashboard"
                    element={
                      <ProtectedRoute allowedRoles={["MODERATOR"]}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>

            </AlertProvider>
          </ThemeProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;