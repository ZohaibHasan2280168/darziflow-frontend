import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page-wrapper">
      <div className="legal-card">
        <button className="btn-back" onClick={() => navigate(-1)}>Back</button>
        <h1>Terms of Service</h1>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using DarziFlow (the "Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            DarziFlow provides a digital management platform for garment manufacturing. We act solely as a software provider; we are not responsible for the quality of physical manufacturing services, fabric handling, or transactions between manufacturers and their clients.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <ul>
            <li>You must provide accurate and complete information during registration.</li>
            <li>You are responsible for maintaining the security of your account and password.</li>
            <li>DarziFlow is not liable for any loss or damage arising from your failure to protect your login credentials.</li>
          </ul>
        </section>

        <section>
          <h2>4. Payments and Subscriptions</h2>
          <ul>
            <li>Certain features require a paid subscription. All fees are non-refundable unless required by law.</li>
            <li>Failure to pay subscription fees may result in the suspension of access to your data.</li>
          </ul>
        </section>

        <section>
          <h2>5. Prohibited Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any illegal activities.</li>
            <li>Attempt to hack, reverse-engineer, or disrupt the Service.</li>
            <li>Store sensitive data that violates the privacy of your clients without their consent.</li>
          </ul>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>
            DarziFlow is provided "as is." We are not liable for any business interruptions, loss of client data, or financial losses resulting from the use or inability to use the app.
          </p>
        </section>

      </div>

      <style jsx>{`
        .legal-page-wrapper { min-height: 100vh; display:flex; align-items:center; justify-content:center; padding: 24px; background: var(--body-bg); }
        .legal-card { max-width: 900px; background: var(--card-bg); border: 1px solid var(--border-light); padding: 28px; border-radius: 12px; color: var(--text-primary); }
        .btn-back { background: transparent; border: 1px solid var(--border-light); color: var(--text-primary); padding: 8px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 12px; }
        h1 { margin: 6px 0 18px 0; }
        section { margin-bottom: 16px; }
        h2 { font-size: 16px; margin-bottom: 8px; }
        p { color: var(--text-secondary); line-height: 1.6; }
        ul { margin-left: 18px; color: var(--text-secondary); }
        li { margin-bottom: 8px; }
      `}</style>
    </div>
  );
}
