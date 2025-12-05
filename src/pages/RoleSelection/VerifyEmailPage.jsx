import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
//comment here
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/verify/${token}`);
        setStatus("success");
        setMessage(res.data.message);

        // Optional: redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/admin/login"); // or wherever login is
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Verification failed. Invalid or expired token."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="verify-page">
      <div className="verify-card">
        {status === "loading" && <p>Verifying your email...</p>}
        {status === "success" && <p className="success">{message}</p>}
        {status === "error" && <p className="error">{message}</p>}
      </div>

      <style jsx>{`
        .verify-page {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: #1f2937;
        }
        .verify-card {
          background: white;
          padding: 40px 30px;
          border-radius: 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          text-align: center;
          font-size: 16px;
        }
        .success { color: #16a34a; font-weight: 600; }
        .error { color: #dc2626; font-weight: 600; }
      `}</style>
    </div>
  );
}
