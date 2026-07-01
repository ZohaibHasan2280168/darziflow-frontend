import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page-wrapper">
      <div className="legal-card">
        <button className="btn-back" onClick={() => navigate(-1)}>Back</button>
        <h1>Privacy Policy</h1>

        <section>
          <h2>1. Data We Collect</h2>
          <ul>
            <li><strong>Account Data:</strong> Name, email address, and business contact details.</li>
            <li><strong>Client Data:</strong> Names, contact details, and project/measurement specifications of your clients.</li>
            <li><strong>Usage Data:</strong> Information on how you interact with the app to help us improve performance.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Data</h2>
          <p>We use the information collected to:</p>
          <ul>
            <li>Enable core features (order tracking, workflow management, and data storage).</li>
            <li>Send automated notifications to you or your clients.</li>
            <li>Provide technical support and security updates.</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Storage and Security</h2>
          <p>
            We implement industry-standard encryption to protect your data. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>
            We do not sell your data to third parties. We may use third-party providers (such as cloud hosting or payment processors) to facilitate our service, only to the extent necessary for them to perform their functions.
          </p>
        </section>

        <section>
          <h2>5. Data Ownership and Deletion</h2>
          <ul>
            <li>You own your data. You may export or delete your client records at any time.</li>
            <li>Upon account deletion, all personal data associated with your account will be permanently removed from our active databases within 30 days.</li>
          </ul>
        </section>

        <section>
          <h2>6. Contact Us</h2>
          <p>
            If you have any questions regarding these policies, please contact us at: <a href="mailto:support@darziflow.com">support@darziflow.com</a>
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
        a { color: var(--accent-blue); }
      `}</style>
    </div>
  );
}
