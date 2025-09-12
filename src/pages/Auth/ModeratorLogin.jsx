import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import authService from "../../services/authService";


export default function ModeratorLogin() {
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleLogin = async ({ workEmail, password }) => {
  try {
    const userData = await authService.login({ workEmail, password });
    if (userData.user.role !== "ADMIN" && userData.user.role !== "MODERATOR") {
      setError("Access denied: Only moderators and admins can login here.");
      return;
    }

    //If login is successful, redirect
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Invalid credentials. Please try again.");
  }
};


  return (
    <div className="min-h-screen flex-center moderator-bg">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="moderator-title">Moderator Login</h2>
          <p className="moderator-subtitle">Access your moderator dashboard</p>
        </div>
        
        {error && (
          <div className="moderator-error">
            <p>{error}</p>
          </div>
        )}

        <LoginForm onSubmit={handleLogin} />
      </div>

      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
        
        .flex-center {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .moderator-bg {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        
        /* Outer container style */
        .container {
          max-width: 400px;
          background: #F8F9FD;
          background: linear-gradient(0deg, rgb(255, 255, 255) 0%, rgb(244, 247, 251) 100%);
          border-radius: 40px;
          padding: 30px 40px;
          border: 5px solid rgb(255, 255, 255);
          box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 30px 30px -20px;
          margin: 20px;
        }
        
        .moderator-title {
          font-size: 2rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }
        
        .moderator-subtitle {
          color: #718096;
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }
        
        .text-center {
          text-align: center;
        }
        
        .mb-8 {
          margin-bottom: 2rem;
        }
        
        .moderator-error {
          background-color: #fee2e2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        /* Custom input styles */
        .coolinput {
          display: flex;
          flex-direction: column;
          width: fit-content;
          position: static;
          max-width: 240px;
        }

        .coolinput label.text {
          font-size: 0.75rem;
          color: #818CF8;
          font-weight: 700;
          position: relative;
          top: 0.5rem;
          margin: 0 0 0 7px;
          padding: 0 3px;
          background: #e8e8e8;
          width: fit-content;
        }

        .coolinput input[type=text].input {
          padding: 11px 10px;
          font-size: 0.75rem;
          border: 2px #818CF8 solid;
          border-radius: 5px;
          background: #e8e8e8;
        }

        .coolinput input[type=text].input:focus {
          outline: none;
        }

        /* For password inputs as well */
        .coolinput input[type=password].input {
          padding: 11px 10px;
          font-size: 0.75rem;
          border: 2px #818CF8 solid;
          border-radius: 5px;
          background: #e8e8e8;
        }

        .coolinput input[type=password].input:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}