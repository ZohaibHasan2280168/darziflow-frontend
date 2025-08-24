import { Navigate } from 'react-router-dom';
import useAuth from '../../stores/authStore';

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}