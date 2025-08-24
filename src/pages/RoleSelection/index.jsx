import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex-center moderator-bg">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="moderator-title mb-2">Welcome to DarziFlow</h1>
          <p className="moderator-subtitle">Select your role to continue</p>
        </div>
        <div className="button-container">
          <button
            onClick={() => navigate('/moderator-login')}
            className="button2"
            style={{'--color': '#0077ff'}}
          >
            <span style={{ marginRight: '0.5rem' }}>👔</span> Moderator
          </button>
          <button
            onClick={() => navigate('/admin-login')}
            className="button2"
            style={{'--color': '#6a11cb'}}
          >
            <span style={{ marginRight: '0.5rem' }}>🛡️</span> Admin
          </button>
        </div>
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
          max-width: 350px;
          background: #F8F9FD;
          background: linear-gradient(0deg, rgb(255, 255, 255) 0%, rgb(244, 247, 251) 100%);
          border-radius: 40px;
          padding: 25px 35px;
          border: 5px solid rgb(255, 255, 255);
          box-shadow: rgba(133, 189, 215, 0.8784313725) 0px 30px 30px -20px;
          margin: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
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
        }
        
        .button-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          margin-top: 1rem;
        }
        
        .text-center {
          text-align: center;
        }
        
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        
        .mb-8 {
          margin-bottom: 2rem;
        }
        
        /* New button styles */
        .button2 {
          display: inline-block;
          transition: all 0.2s ease-in;
          position: relative;
          overflow: hidden;
          z-index: 1;
          color: #090909;
          padding: 0.7em 1.7em;
          cursor: pointer;
          font-size: 18px;
          border-radius: 0.5em;
          background: #e8e8e8;
          border: 1px solid #e8e8e8;
          box-shadow: 6px 6px 12px #c5c5c5, -6px -6px 12px #ffffff;
          width: 100%;
          font-weight: 500;
        }

        .button2:active {
          color: #666;
          box-shadow: inset 4px 4px 12px #c5c5c5, inset -4px -4px 12px #ffffff;
        }

        .button2:before {
          content: "";
          position: absolute;
          left: 50%;
          transform: translateX(-50%) scaleY(1) scaleX(1.25);
          top: 100%;
          width: 140%;
          height: 180%;
          background-color: rgba(0, 0, 0, 0.05);
          border-radius: 50%;
          display: block;
          transition: all 0.5s 0.1s cubic-bezier(0.55, 0, 0.1, 1);
          z-index: -1;
        }

        .button2:after {
          content: "";
          position: absolute;
          left: 55%;
          transform: translateX(-50%) scaleY(1) scaleX(1.45);
          top: 180%;
          width: 160%;
          height: 190%;
          background-color: var(--color, #009087);
          border-radius: 50%;
          display: block;
          transition: all 0.5s 0.1s cubic-bezier(0.55, 0, 0.1, 1);
          z-index: -1;
        }

        .button2:hover {
          color: #ffffff;
          border: 1px solid var(--color, #009087);
        }

        .button2:hover:before {
          top: -35%;
          background-color: var(--color, #009087);
          transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
        }

        .button2:hover:after {
          top: -45%;
          background-color: var(--color, #009087);
          transform: translateX(-50%) scaleY(1.3) scaleX(0.8);
        }
      `}</style>
    </div>
  );
}